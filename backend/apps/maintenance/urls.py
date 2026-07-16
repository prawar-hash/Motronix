from django.urls import path, include
from rest_framework.routers import DefaultRouter
from maintenance.views import ServiceRecordViewSet, MaintenancePredictionView

router = DefaultRouter()
router.register(r'', ServiceRecordViewSet, basename='service-record')

urlpatterns = [
    # Get predictive maintenance schedule
    path('predict/', MaintenancePredictionView.as_view(), name='maintenance_predict'),
    
    # Core CRUD endpoints
    path('', include(router.urls)),
]
