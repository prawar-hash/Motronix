from rest_framework import serializers

class RecommendationQuerySerializer(serializers.Serializer):
    """Validates parameters for the 10-parameter Indian bike recommendation query engine."""
    
    USAGE_CHOICES = [
        ('daily commute', 'Daily Commute'),
        ('long rides', 'Long Rides'),
        ('sports', 'Sports'),
        ('off-road', 'Off-Road'),
    ]
    
    MILEAGE_IMPORTANCE_CHOICES = [
        ('high', 'High'),
        ('balanced', 'Balanced'),
        ('low', 'Low'),
    ]
    
    BIKE_TYPE_CHOICES = [
        ('commuter', 'Commuter'),
        ('cruiser', 'Cruiser'),
        ('sports', 'Sports'),
        ('adventure', 'Adventure'),
    ]
    
    ENGINE_POWER_CHOICES = [
        ('low', 'Low (100-150cc)'),
        ('medium', 'Medium (150-400cc)'),
        ('high', 'High (400cc+)'),
    ]
    
    RIDING_PRIORITY_CHOICES = [
        ('comfort', 'Comfort'),
        ('performance', 'Performance'),
        ('balanced', 'Balanced'),
    ]
    
    RESALE_IMPORTANCE_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
    ]
    
    RIDING_AREA_CHOICES = [
        ('city', 'City'),
        ('highway', 'Highway'),
        ('both', 'Both'),
    ]

    budget_min = serializers.FloatField(min_value=0.0, default=0.0)
    budget_max = serializers.FloatField(min_value=10000.0)
    usage = serializers.ChoiceField(choices=USAGE_CHOICES)
    mileage_importance = serializers.ChoiceField(choices=MILEAGE_IMPORTANCE_CHOICES)
    preferred_bike_type = serializers.ChoiceField(choices=BIKE_TYPE_CHOICES)
    brand_preference = serializers.CharField(required=False, allow_blank=True, default='')
    engine_power = serializers.ChoiceField(choices=ENGINE_POWER_CHOICES)
    riding_priority = serializers.ChoiceField(choices=RIDING_PRIORITY_CHOICES)
    maintenance_budget = serializers.FloatField(required=False, allow_null=True, default=None)
    resale_importance = serializers.ChoiceField(choices=RESALE_IMPORTANCE_CHOICES)
    riding_area = serializers.ChoiceField(choices=RIDING_AREA_CHOICES)

class CompareQuerySerializer(serializers.Serializer):
    """Validates candidate listing IDs for the side-by-side comparison feature."""
    listing_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=2,
        max_length=3
    )
