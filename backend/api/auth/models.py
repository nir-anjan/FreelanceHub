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


# ---------------------- FREELANCERS --------------------
class Freelancer(models.Model):
    """Stores freelancer-specific details (one-to-one with User)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    title = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=255, blank=True, null=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    skills = models.TextField(blank=True, null=True, help_text='Comma-separated or JSON array')
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'freelancers'

    def __str__(self):
        return f"Freelancer: {self.user.username}"


# ---------------------- CLIENTS ------------------------
class Client(models.Model):
    """Stores client-specific details (one-to-one with User)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    company_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clients'

    def __str__(self):
        return f"Client: {self.user.username}"


# ---------------------- ADMINS -------------------------
class AdminProfile(models.Model):
    """Stores admin-specific details (one-to-one with User)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    permissions = models.TextField(blank=True, null=True, help_text='Optional JSON for advanced permission control')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admins'

    def __str__(self):
        return f"Admin: {self.user.username}"


# ---------------------- JOBS ---------------------------
class Job(models.Model):
    """Job listings created by clients and visible to freelancers"""
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    duration = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=255, blank=True, null=True)
    skills = models.TextField(blank=True, null=True, help_text='Comma-separated or JSON array')
    requirements = models.TextField(blank=True, null=True)
    project_details = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='pending', help_text='pending | open | in_progress | completed | cancelled')
    proposals_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'jobs'

    def __str__(self):
        return f"Job: {self.title} (client={self.client.user.username})"


# ---------------------- PAYMENTS -------------------------
class Payment(models.Model):
    """Tracks transactions between clients and freelancers"""
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='payments')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments')
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    payment_method = models.CharField(max_length=50, blank=True, null=True, help_text='e.g. credit_card, paypal, stripe, wallet')
    status = models.CharField(max_length=50, default='pending', help_text='pending | completed | failed | refunded')
    transaction_id = models.CharField(max_length=255, blank=True, null=True, unique=True, help_text='External reference from payment gateway')
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"Payment {self.id}: {self.amount} {self.currency} ({self.status})"


# ---------------------- CHAT THREADS -------------------
class ChatThread(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='chat_threads')
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE, related_name='chat_threads')
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, blank=True, null=True, related_name='chat_threads')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_threads'

    def __str__(self):
        return f"Thread: client={self.client.user.username}, freelancer={self.freelancer.user.username}"


# ---------------------- CHAT MESSAGES ------------------
class ChatMessage(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'

    def __str__(self):
        return f"Message {self.id} by {self.sender.username}"


# ---------------------- DISPUTES -----------------------
class Dispute(models.Model):
    """Disputes between clients and freelancers that need admin resolution"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='disputes')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='disputes')
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE, related_name='disputes')
    description = models.TextField(help_text='Description of the dispute')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    resolution = models.TextField(blank=True, null=True, help_text='Admin resolution notes')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='resolved_disputes')

    class Meta:
        db_table = 'disputes'
        ordering = ['-created_at']

    def __str__(self):
        return f"Dispute #{self.id}: {self.job.title} ({self.status})"