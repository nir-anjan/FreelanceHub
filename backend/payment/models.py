from django.db import models
from api.auth.models import Job, Client, Freelancer


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
    
    # Razorpay specific fields
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True, help_text='Razorpay order ID')
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True, help_text='Razorpay payment ID')
    razorpay_signature = models.CharField(max_length=500, blank=True, null=True, help_text='Razorpay signature for verification')
    
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"Payment {self.id}: {self.amount} {self.currency} ({self.status})"
