from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema
from recommendations.serializers import RecommendationQuerySerializer, CompareQuerySerializer
from listings.models import BikeListing
from listings.serializers import BikeListingSerializer
from ml.recommender import recommend_bikes_indian

class RecommendationView(APIView):
    """API endpoint to get personalized bike recommendations using the Indian matching algorithm."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Get Personalized Recommendations",
        description="Ranks bike listings and static catalog items on 10 parameters (budget, usage, power, mileage, priority).",
        request=RecommendationQuerySerializer,
        responses={200: dict}
    )
    def post(self, request):
        """Validates the 10 wizard criteria and computes matching profiles."""
        serializer = RecommendationQuerySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        # Extract validated inputs
        budget_min = serializer.validated_data['budget_min']
        budget_max = serializer.validated_data['budget_max']
        usage = serializer.validated_data['usage']
        mileage_importance = serializer.validated_data['mileage_importance']
        preferred_bike_type = serializer.validated_data['preferred_bike_type']
        brand_preference = serializer.validated_data.get('brand_preference', '')
        engine_power = serializer.validated_data['engine_power']
        riding_priority = serializer.validated_data['riding_priority']
        maintenance_budget = serializer.validated_data.get('maintenance_budget', None)
        resale_importance = serializer.validated_data['resale_importance']
        riding_area = serializer.validated_data['riding_area']
        
        # Query active marketplace listings to include in recommendations
        active_listings = BikeListing.objects.all()
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
            
        # Execute matching logic
        ranked_results = recommend_bikes_indian(
            budget_min=budget_min,
            budget_max=budget_max,
            usage=usage,
            mileage_importance=mileage_importance,
            preferred_bike_type=preferred_bike_type,
            brand_preference=brand_preference,
            engine_power=engine_power,
            riding_priority=riding_priority,
            maintenance_budget=maintenance_budget,
            resale_importance=resale_importance,
            riding_area=riding_area,
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
        """Validates candidate IDs and returns details of the matching listings."""
        serializer = CompareQuerySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        listing_ids = serializer.validated_data['listing_ids']
        
        # Check if the requested IDs are positive (listings in database) or negative (catalog mocks)
        listings = []
        db_ids = [idx for idx in listing_ids if idx > 0]
        catalog_ids = [idx for idx in listing_ids if idx < 0]
        
        # 1. Fetch from database if applicable
        if db_ids:
            db_listings = BikeListing.objects.filter(id__in=db_ids)
            for item in db_listings:
                listings.append({
                    'id': item.id,
                    'brand': item.brand,
                    'model': item.model,
                    'type': 'sports', # fallback
                    'engine_cc': 150,
                    'asking_price': float(item.asking_price),
                    'fuel_economy': 40,
                    'condition': item.condition,
                    'year': item.year,
                    'mileage': item.mileage,
                    'city': item.city,
                    'price_status': item.price_status,
                    'key_features': 'Marketplace listed item.'
                })
                
        # 2. Fetch from static catalog
        from ml.recommender import BIKE_CATALOG
        for item in BIKE_CATALOG:
            if item['id'] in catalog_ids:
                listings.append({
                    'id': item['id'],
                    'brand': item['brand'],
                    'model': item['model'],
                    'type': item['type'],
                    'engine_cc': item['engine_cc'],
                    'asking_price': item['asking_price'],
                    'fuel_economy': item['fuel_economy'],
                    'condition': 'Excellent', # mock
                    'year': 2024,
                    'mileage': 5000,
                    'city': 'Delhi',
                    'price_status': 'Fair',
                    'key_features': item['key_features']
                })
                
        # Maintain request sorting order
        ordered_listings = sorted(listings, key=lambda x: listing_ids.index(x['id']))
        return Response(ordered_listings, status=status.HTTP_200_OK)
