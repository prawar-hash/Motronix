from django.db import models
from django.conf import settings
from core_models import SoftDeleteModel

class BikeListing(SoftDeleteModel):
    """Represents a bike listing posted by a seller in the marketplace."""
    CONDITION_CHOICES = [
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
        ('Poor', 'Poor'),
    ]

    PRICE_STATUS_CHOICES = [
        ('Overpriced', 'Overpriced'),
        ('Underpriced', 'Underpriced'),
        ('Fair', 'Fair'),
    ]

    VARIANT_CHOICES = [
        ('Base', 'Base'),
        ('Mid', 'Mid'),
        ('Top', 'Top'),
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='listings'
    )
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    variant_type = models.CharField(
        max_length=20,
        choices=VARIANT_CHOICES,
        default='Base'
    )
    year = models.PositiveIntegerField()
    mileage = models.FloatField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    asking_price = models.DecimalField(max_digits=10, decimal_places=2)
    predicted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_status = models.CharField(
        max_length=20,
        choices=PRICE_STATUS_CHOICES,
        default='Fair'
    )
    city = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    images = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.year} {self.brand} {self.model} (${self.asking_price})"
