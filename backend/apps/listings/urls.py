from django.urls import path, include
from rest_framework.routers import DefaultRouter
from listings.views import BikeListingViewSet, ListingImageUploadView

router = DefaultRouter()
router.register(r'', BikeListingViewSet, basename='listing')

urlpatterns = [
    # Image upload endpoint
    path('upload/', ListingImageUploadView.as_view(), name='listing_image_upload'),
    
    # Core ViewSet routing
    path('', include(router.urls)),
]
