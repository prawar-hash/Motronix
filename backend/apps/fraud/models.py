from django.db import models
from core_models import SoftDeleteModel
from listings.models import BikeListing

class FraudFlag(SoftDeleteModel):
    """Stores the fraud assessment risk score and specific reasons for a listing."""
    RISK_LABEL_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    listing = models.ForeignKey(
        BikeListing,
        on_delete=models.CASCADE,
        related_name='fraud_flags'
    )
    risk_score = models.FloatField(default=0.0)
    risk_label = models.CharField(
        max_length=20,
        choices=RISK_LABEL_CHOICES,
        default='Low'
    )
    reasons = models.JSONField(default=list)

    def __str__(self):
        return f"Listing {self.listing.id} - Risk: {self.risk_label} ({self.risk_score})"
