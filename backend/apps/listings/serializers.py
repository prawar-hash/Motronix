from rest_framework import serializers
from listings.models import BikeListing
from users.serializers import UserSerializer

class BikeListingSerializer(serializers.ModelSerializer):
    """Serializer for reading, creating, and updating bike listings."""
    seller = UserSerializer(read_only=True)
    price_status = serializers.CharField(read_only=True)
    predicted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = BikeListing
        fields = [
            'id', 'seller', 'brand', 'model', 'year', 'mileage',
            'condition', 'asking_price', 'predicted_price',
            'price_status', 'city', 'description', 'images', 'created_at'
        ]

    def validate_year(self, value):
        """Validates that the manufacturing year is realistic."""
        import datetime
        current_year = datetime.datetime.now().year + 1
        if value < 1900 or value > current_year:
            raise serializers.ValidationError(f"Manufacturing year must be between 1900 and {current_year}.")
        return value

    def validate_mileage(self, value):
        """Validates that mileage is non-negative."""
        if value < 0:
            raise serializers.ValidationError("Mileage cannot be negative.")
        return value

    def validate_asking_price(self, value):
        """Validates that asking price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Asking price must be greater than zero.")
        return value
