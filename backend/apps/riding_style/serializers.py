from rest_framework import serializers
from riding_style.models import RideData

class RideDataSerializer(serializers.ModelSerializer):
    """Serializer for reading previous ride classification results."""
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = RideData
        fields = [
            'id', 'user', 'uploaded_file_ref', 'riding_style',
            'suggestions', 'created_at'
        ]
