from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for reading user profile data."""
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'trust_score', 'created_at']
        read_only_fields = ['id', 'trust_score', 'created_at']

class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration validation and creation."""
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['email', 'name', 'password']
        
    def validate_email(self, value):
        """Validates that the email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """Creates a new custom User instance."""
        return User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
