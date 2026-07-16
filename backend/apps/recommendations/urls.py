from django.urls import path
from recommendations.views import RecommendationView, CompareView

urlpatterns = [
    # Get recommendations
    path('', RecommendationView.as_view(), name='recommendations_query'),
    
    # Compare listings
    path('compare/', CompareView.as_view(), name='recommendations_compare'),
]
