from django.db import models
from django.utils import timezone

class SoftDeleteManager(models.Manager):
    """QueryManager that filters out soft-deleted records by default."""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class SoftDeleteModel(models.Model):
    """Abstract base class that provides soft-delete capabilities and audit timestamps."""
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Managers
    objects = SoftDeleteManager()
    all_objects = models.Manager() # Includes soft-deleted records

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        """Overrides default delete to perform a soft-delete."""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restores a soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None
        self.save()
