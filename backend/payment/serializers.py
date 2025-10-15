from rest_framework import serializers
from api.auth.models import Payment, Job, Client, Freelancer
from django.contrib.auth import get_user_model

User = get_user_model()

class PaymentCreateSerializer(serializers.Serializer):
    """Serializer for creating payment orders"""
    job_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1.00)
    freelancer_id = serializers.IntegerField()
    
    def validate_job_id(self, value):
        """Validate that the job exists and belongs to the current user (client)"""
        user = self.context['request'].user
        
        try:
            job = Job.objects.get(id=value)
        except Job.DoesNotExist:
            raise serializers.ValidationError("Job not found.")
        
        # Check if user is a client and owns this job
        if not hasattr(user, 'client_profile'):
            raise serializers.ValidationError("Only clients can initiate payments.")
        
        if job.client != user.client_profile:
            raise serializers.ValidationError("You can only make payments for your own jobs.")
        
        return value
    
    def validate_freelancer_id(self, value):
        """Validate that the freelancer exists"""
        try:
            Freelancer.objects.get(id=value)
        except Freelancer.DoesNotExist:
            raise serializers.ValidationError("Freelancer not found.")
        
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        job_id = data.get('job_id')
        freelancer_id = data.get('freelancer_id')
        
        if job_id and freelancer_id:
            # Check if there's already a completed payment for this job-freelancer combination
            existing_payment = Payment.objects.filter(
                job_id=job_id,
                freelancer_id=freelancer_id,
                status='completed'
            ).exists()
            
            if existing_payment:
                raise serializers.ValidationError(
                    "Payment already completed for this job and freelancer."
                )
        
        return data


class PaymentVerifySerializer(serializers.Serializer):
    """Serializer for verifying Razorpay payments"""
    razorpay_order_id = serializers.CharField(max_length=255)
    razorpay_payment_id = serializers.CharField(max_length=255)
    razorpay_signature = serializers.CharField(max_length=500)
    
    def validate_razorpay_order_id(self, value):
        """Validate that the order exists in our database"""
        try:
            payment = Payment.objects.get(razorpay_order_id=value, status='pending')
            # Store payment object for use in view
            self.payment = payment
            return value
        except Payment.DoesNotExist:
            raise serializers.ValidationError("Payment order not found or already processed.")


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    job_title = serializers.CharField(source='job.title', read_only=True)
    client_name = serializers.CharField(source='client.user.get_full_name', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.user.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'currency', 'payment_method', 'status',
            'transaction_id', 'razorpay_order_id', 'razorpay_payment_id',
            'paid_at', 'created_at', 'updated_at',
            'job_title', 'client_name', 'freelancer_name'
        ]
        read_only_fields = [
            'id', 'status', 'transaction_id', 'razorpay_order_id',
            'razorpay_payment_id', 'paid_at', 'created_at', 'updated_at'
        ]


class PaymentListSerializer(serializers.ModelSerializer):
    """Serializer for listing payments"""
    job = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    freelancer = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'currency', 'payment_method', 'status',
            'paid_at', 'created_at', 'job', 'client', 'freelancer'
        ]
    
    def get_job(self, obj):
        return {
            'id': obj.job.id,
            'title': obj.job.title
        } if obj.job else None
    
    def get_client(self, obj):
        return {
            'id': obj.client.id,
            'name': obj.client.user.get_full_name() or obj.client.user.username
        } if obj.client else None
    
    def get_freelancer(self, obj):
        return {
            'id': obj.freelancer.id,
            'name': obj.freelancer.user.get_full_name() or obj.freelancer.user.username
        } if obj.freelancer else None