from django.db import models
from django.conf import settings
from core_models import SoftDeleteModel

class RideData(SoftDeleteModel):
    """Represents a ride log dataset uploaded by a user for style analysis."""
    RIDING_STYLE_CHOICES = [
        ('Calm', 'Calm'),
        ('Moderate', 'Moderate'),
        ('Aggressive', 'Aggressive'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rides'
    )
    uploaded_file_ref = models.CharField(max_length=255)
    riding_style = models.CharField(
        max_length=20,
        choices=RIDING_STYLE_CHOICES,
        default='Calm'
    )
    suggestions = models.JSONField(default=list)

    def __str__(self):
        return f"User {self.user.id} - Ride Style: {self.riding_style}"
