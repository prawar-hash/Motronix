from django.db import models
from django.conf import settings
from core_models import SoftDeleteModel
from listings.models import BikeListing

class ServiceRecord(SoftDeleteModel):
    """Represents a log entry for bicycle maintenance completed by the bike owner."""
    SERVICE_TYPE_CHOICES = [
        ('Chain Lube & Tension', 'Chain Lube & Tension'),
        ('Brake Pads Replacement', 'Brake Pads Replacement'),
        ('Tire Replacement', 'Tire Replacement'),
        ('Chain & Cassette Replacement', 'Chain & Cassette Replacement'),
        ('General Tuning & Safety Check', 'General Tuning & Safety Check'),
    ]

    bike_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_records'
    )
    listing = models.ForeignKey(
        BikeListing,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='service_records'
    )
    service_date = models.DateField()
    service_type = models.CharField(max_length=100, choices=SERVICE_TYPE_CHOICES)
    mileage = models.FloatField()
    cost = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.service_type} - {self.service_date} (${self.cost})"
