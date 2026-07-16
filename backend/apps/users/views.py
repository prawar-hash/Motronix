from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from users.serializers import UserSerializer, UserRegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """API endpoint to sign up new users in the BikeAI ecosystem."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Register User",
        description="Creates a new user profile with standard trust score of 100.",
        responses={201: UserSerializer}
    )
    def post(self, request, *args, **kwargs):
        """Processes registration request, returning the user metadata on success."""
        return super().post(request, *args, **kwargs)

class UserProfileView(APIView):
    """API endpoint to retrieve the current logged-in user profile."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Profile",
        description="Retrieves credentials and trust score of the logged-in user.",
        responses={200: UserSerializer}
    )
    def get(self, request):
        """Returns the authenticated user details."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
