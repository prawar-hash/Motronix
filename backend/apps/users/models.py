from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from core_models import SoftDeleteModel

class UserManager(BaseUserManager):
    """Custom manager for the custom User model."""
    def create_user(self, email, password=None, name='', **extra_fields):
        """Creates and saves a User with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, name='', **extra_fields):
        """Creates and saves a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, name, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, SoftDeleteModel):
    """Custom User model representing bike ecosystem members, including trust score."""
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    trust_score = models.FloatField(default=100.0)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email
