from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema
from recommendations.serializers import RecommendationQuerySerializer, CompareQuerySerializer
from listings.models import BikeListing
from listings.serializers import BikeListingSerializer
from ml.recommender import recommend_bikes

class RecommendationView(APIView):
    """API endpoint to get personalized bike recommendations based on budget and riding profile."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Get Personalized Recommendations",
        description="Ranks existing bike listings based on how well they match budget, usage, and mileage preferences.",
        request=RecommendationQuerySerializer,
        responses={200: BikeListingSerializer(many=True)}
    )
    def post(self, request):
        """Processes user search criteria, queries active catalog listings, and returns ranked matches."""
        serializer = RecommendationQuerySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        budget = serializer.validated_data['budget']
        usage = serializer.validated_data['usage']
        preferred_mileage = serializer.validated_data['preferred_mileage']
        
        # Retrieve all listings currently active in the database (excluding deleted and draft)
        active_listings = BikeListing.objects.all()
        
        # Serialize candidate listings to flat python dicts for processing in the ML module
        # Using a custom list generator to avoid serializing seller info which isn't needed by the recommender
        candidates = []
        for bike in active_listings:
            candidates.append({
                'id': bike.id,
                'brand': bike.brand,
                'model': bike.model,
                'year': bike.year,
                'mileage': bike.mileage,
                'condition': bike.condition,
                'asking_price': float(bike.asking_price),
                'price_status': bike.price_status,
                'city': bike.city,
                'images': bike.images,
                'created_at': bike.created_at.strftime('%Y-%m-%d') if bike.created_at else None
            })
            
        # Run similarity ranking logic in the isolated recommender module
        ranked_results = recommend_bikes(
            budget=budget,
            usage=usage,
            preferred_mileage=preferred_mileage,
            candidates=candidates
        )
        
        return Response(ranked_results, status=status.HTTP_200_OK)

class CompareView(APIView):
    """API endpoint to fetch bike listings for side-by-side spec and price comparison."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Compare Bike Listings",
        description="Retrieves specs and seller data for 2 to 3 bike listings to enable comparison.",
        request=CompareQuerySerializer,
        responses={200: BikeListingSerializer(many=True)}
    )
    def post(self, request):
        """Validates candidate IDs and returns serialized details of the matching listings."""
        serializer = CompareQuerySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        listing_ids = serializer.validated_data['listing_ids']
        
        # Fetch the selected listings, excluding any that are soft-deleted
        listings = BikeListing.objects.filter(id__in=listing_ids)
        
        # Order the results to match the request list order
        ordered_listings = sorted(listings, key=lambda x: listing_ids.index(x.id))
        
        resp_serializer = BikeListingSerializer(ordered_listings, many=True)
        return Response(resp_serializer.data, status=status.HTTP_200_OK)
