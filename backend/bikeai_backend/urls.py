from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin Interface
    path('admin/', admin.site.urls),
    
    # OpenAPI Swagger Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Application APIs
    path('api/users/', include('users.urls')),
    path('api/listings/', include('listings.urls')),
    path('api/fraud/', include('fraud.urls')),
    path('api/recommendations/', include('recommendations.urls')),
    path('api/maintenance/', include('maintenance.urls')),
    path('api/riding-style/', include('riding_style.urls')),
]
