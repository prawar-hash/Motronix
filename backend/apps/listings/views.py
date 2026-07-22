import datetime
import cloudinary.uploader
from django.utils import timezone
import os
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from listings.models import BikeListing
from listings.serializers import BikeListingSerializer
from ml.price_predictor import predict_fair_price, evaluate_asking_price
from ml.fraud_detector import analyze_fraud_risk

class BikeListingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing bike listings, including search, filter, creation, and soft-delete."""
    queryset = BikeListing.objects.all().order_by('-created_at')
    serializer_class = BikeListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def cities(self, request):
        """Reads and returns the list of all Indian cities from india_cities.csv."""
        import csv
        csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'india_cities.csv')
        cities_list = []
        if os.path.exists(csv_path):
            try:
                with open(csv_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        cities_list.append({
                            'city': row['City'],
                            'state': row['State'],
                            'tier': row['Tier'],
                            'population': int(row['Population'])
                        })
            except Exception:
                pass
        if not cities_list:
            cities_list = [{'city': c, 'state': 'India', 'tier': 'Tier 1', 'population': 1000000} for c in ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad']]
            
        return Response(cities_list, status=status.HTTP_200_OK)

    def get_queryset(self):
        """Applies search filters and returns active listings (excluding soft-deleted ones)."""
        queryset = super().get_queryset()
        
        # Parse query filters
        brand = self.request.query_params.get('brand', None)
        city = self.request.query_params.get('city', None)
        condition = self.request.query_params.get('condition', None)
        price_status = self.request.query_params.get('price_status', None)
        search = self.request.query_params.get('search', None)

        if brand:
            queryset = queryset.filter(brand__iexact=brand.strip())
        if city:
            queryset = queryset.filter(city__iexact=city.strip())
        if condition:
            queryset = queryset.filter(condition__iexact=condition.strip())
        if price_status:
            queryset = queryset.filter(price_status__iexact=price_status.strip())
        if search:
            queryset = queryset.filter(
                Q(brand__icontains=search) | 
                Q(model__icontains=search) |
                Q(description__icontains=search)
            )
            
        return queryset

    @extend_schema(
        summary="Create Bike Listing",
        description="Creates a listing, calculates fair price status via ML, and runs fraud checks."
    )
    def perform_create(self, serializer):
        """Enriches the listing with ML price predictions and executes fraud scoring on save."""
        brand = serializer.validated_data.get('brand')
        model = serializer.validated_data.get('model')
        variant_type = serializer.validated_data.get('variant_type', 'Base')
        year = serializer.validated_data.get('year')
        mileage = serializer.validated_data.get('mileage')
        condition = serializer.validated_data.get('condition')
        asking_price = float(serializer.validated_data.get('asking_price'))
        description = serializer.validated_data.get('description', '')

        # 1. Decoupled ML Price Prediction call
        pred_val = predict_fair_price(brand, model, year, mileage, condition, variant_type)
        status_val = evaluate_asking_price(asking_price, pred_val)

        # 2. Save listing under the authenticated seller
        listing = serializer.save(
            seller=self.request.user,
            predicted_price=pred_val,
            price_status=status_val
        )

        # 3. Calculate listing velocity and account duration for fraud checks
        days_active = max(1, (timezone.now() - self.request.user.created_at).days)
        listings_count = BikeListing.objects.filter(seller=self.request.user).count()

        # 4. Decoupled ML Fraud Detection call
        fraud_analysis = analyze_fraud_risk(
            asking_price=asking_price,
            predicted_price=pred_val,
            seller_trust_score=self.request.user.trust_score,
            seller_listings_count=listings_count,
            description=description if description else f"{brand} {model}",
            seller_days_active=days_active
        )

        # 5. Save fraud analysis flag
        from fraud.models import FraudFlag
        FraudFlag.objects.create(
            listing=listing,
            risk_score=fraud_analysis['risk_score'],
            risk_label=fraud_analysis['risk_label'],
            reasons=fraud_analysis['reasons']
        )

    def destroy(self, request, *args, **kwargs):
        """Performs check and executes soft-delete if owner or administrator."""
        instance = self.get_object()
        
        # Check permissions: must be seller or staff
        if instance.seller != request.user and not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to delete this listing."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ListingImageUploadView(APIView):
    """API endpoint to upload bike photos directly to Cloudinary."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Upload Bike Image",
        description="Uploads a bike photo. Size must be < 5MB and format JPEG, PNG, or WEBP.",
        responses={201: dict}
    )
    def post(self, request):
        """Validates the uploaded file size and extension, then uploads to Cloudinary."""
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            
        file_obj = request.FILES['file']
        
        # Server-side validation: Max file size 5MB
        if file_obj.size > 5 * 1024 * 1024:
            return Response({'error': 'File size exceeds 5MB limit.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Server-side validation: MIME Type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if file_obj.content_type not in allowed_types:
            return Response({'error': 'Invalid format. Only JPEG, PNG, and WEBP allowed.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Validate file extension
        ext = file_obj.name.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'webp']:
            return Response({'error': 'Invalid file extension.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Upload image scoped to user-specific folders
            folder_prefix = f"bikeai/user_{request.user.id}"
            result = cloudinary.uploader.upload(
                file_obj,
                folder=folder_prefix,
                allowed_formats=['jpg', 'jpeg', 'png', 'webp']
            )
            
            return Response({
                'url': result.get('secure_url'),
                'public_id': result.get('public_id')
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f"Upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
