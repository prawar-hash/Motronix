from rest_framework import serializers
from maintenance.models import ServiceRecord

class ServiceRecordSerializer(serializers.ModelSerializer):
    """Serializer for managing individual service log entries."""
    bike_owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ServiceRecord
        fields = [
            'id', 'bike_owner', 'listing', 'service_date',
            'service_type', 'mileage', 'cost', 'brand', 'model', 'created_at'
        ]

    def validate_mileage(self, value):
        """Validates that mileage is positive."""
        if value < 0:
            raise serializers.ValidationError("Mileage cannot be negative.")
        return value

    def validate_cost(self, value):
        """Validates that cost is non-negative."""
        if value < 0:
            raise serializers.ValidationError("Maintenance cost cannot be negative.")
        return value

class MaintenancePredictQuerySerializer(serializers.Serializer):
    """Validates parameters for maintenance scheduling projection queries."""
    current_mileage = serializers.FloatField(min_value=0.0)
    brand = serializers.CharField(required=False, default='Other')
    model = serializers.CharField(required=False, default='Other')
