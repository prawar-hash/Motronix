from rest_framework import serializers
from fraud.models import FraudFlag

class FraudFlagSerializer(serializers.ModelSerializer):
    """Serializer for reading fraud reports associated with listings."""
    class Meta:
        model = FraudFlag
        fields = ['id', 'listing', 'risk_score', 'risk_label', 'reasons', 'created_at']
