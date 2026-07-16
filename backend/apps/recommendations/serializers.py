from rest_framework import serializers

class RecommendationQuerySerializer(serializers.Serializer):
    """Validates parameters for the recommendation query engine."""
    USAGE_CHOICES = [
        ('commute', 'Commute'),
        ('sport', 'Sport'),
        ('off-road', 'Off-Road'),
        ('touring', 'Touring'),
    ]
    
    budget = serializers.FloatField(min_value=50.0)
    usage = serializers.ChoiceField(choices=USAGE_CHOICES)
    preferred_mileage = serializers.FloatField(min_value=0.0)

class CompareQuerySerializer(serializers.Serializer):
    """Validates candidate listing IDs for the side-by-side comparison feature."""
    listing_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=2,
        max_length=3
    )
