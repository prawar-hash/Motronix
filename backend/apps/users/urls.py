from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import RegisterView, UserProfileView

urlpatterns = [
    # Registration & Profile
    path('signup/', RegisterView.as_view(), name='auth_signup'),
    path('profile/', UserProfileView.as_view(), name='auth_profile'),
    
    # SimpleJWT Endpoints
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
