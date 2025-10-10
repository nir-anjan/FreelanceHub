from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = [
        ('freelancer', 'Freelancer'),
        ('client', 'Client'),
        ('admin', 'Admin'),
    ]
    
    # Override email to be unique and required
    email = models.EmailField(
        unique=True,
        error_messages={
            'unique': "A user with that email already exists.",
        }
    )
    
    # Role field to distinguish user types
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='freelancer',
        help_text='Designates the role of this user.'
    )
    
    # Additional profile fields
    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text='Phone number'
    )
    
    profile_picture = models.URLField(
        blank=True,
        null=True,
        help_text='URL to profile picture'
    )
    
    bio = models.TextField(
        max_length=500,
        blank=True,
        help_text='Brief description about the user'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    
    # Email verification
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f'{self.first_name} {self.last_name}'
        return full_name.strip()
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name or self.username
    
    @property
    def is_freelancer(self):
        return self.role == 'freelancer'
    
    @property
    def is_client(self):
        return self.role == 'client'
    
    @property
    def is_admin_user(self):
        return self.role == 'admin' or self.is_superuser
    
    def save(self, *args, **kwargs):
        # Ensure email is lowercase
        if self.email:
            self.email = self.email.lower()
        super().save(*args, **kwargs)