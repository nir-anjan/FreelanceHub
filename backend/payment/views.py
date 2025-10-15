from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.conf import settings
import logging

from api.auth.models import Payment, Job, Client, Freelancer
from api.common.responses import StandardResponseMixin
from .serializers import (
    PaymentCreateSerializer, PaymentVerifySerializer, 
    PaymentSerializer, PaymentListSerializer
)
from .razorpay_service import razorpay_service

logger = logging.getLogger(__name__)


class CreatePaymentOrderView(APIView, StandardResponseMixin):
    """Create a Razorpay payment order"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Create a payment order"""
        try:
            logger.info(f"Payment order request from user: {request.user.username}")
            logger.info(f"Request data: {request.data}")
            logger.info(f"Request headers: {dict(request.headers)}")
            logger.info(f"Content type: {request.content_type}")
            
            serializer = PaymentCreateSerializer(data=request.data, context={'request': request})
            
            if not serializer.is_valid():
                logger.error(f"Serializer validation failed: {serializer.errors}")
                return self.error_response(
                    message="Invalid payment data",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Extract validated data
            job_id = serializer.validated_data['job_id']
            amount = serializer.validated_data['amount']
            freelancer_id = serializer.validated_data['freelancer_id']
            
            # Get related objects
            job = get_object_or_404(Job, id=job_id)
            
            # Get client profile - handle case where it might not exist
            try:
                client = request.user.client_profile
            except AttributeError:
                return self.error_response(
                    message="Client profile not found. Only clients can create payments.",
                    status_code=status.HTTP_403_FORBIDDEN
                )
            
            freelancer = get_object_or_404(Freelancer, id=freelancer_id)
            
            # Create Razorpay order
            receipt = f"job_{job_id}_fl_{freelancer_id}_{int(timezone.now().timestamp())}"
            razorpay_order = razorpay_service.create_order(
                amount=float(amount),
                currency='INR',
                receipt=receipt
            )
            
            # Create payment record in database
            with transaction.atomic():
                payment = Payment.objects.create(
                    job=job,
                    client=client,
                    freelancer=freelancer,
                    amount=amount,
                    currency='INR',
                    status='pending',
                    razorpay_order_id=razorpay_order['id'],
                    transaction_id=razorpay_order['id']  # Use order ID as transaction ID initially
                )
            
            # Prepare response data for frontend
            response_data = {
                'order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],  # Amount in paise
                'currency': razorpay_order['currency'],
                'payment_id': payment.id,
                'receipt': razorpay_order['receipt'],
                'client_info': {
                    'name': client.user.get_full_name() or client.user.username,
                    'email': client.user.email,
                },
                'job_info': {
                    'id': job.id,
                    'title': job.title,
                },
                'freelancer_info': {
                    'id': freelancer.id,
                    'name': freelancer.user.get_full_name() or freelancer.user.username,
                }
            }
            
            return self.success_response(
                message="Payment order created successfully",
                data=response_data
            )
            
        except Exception as e:
            logger.error(f"Error creating payment order: {str(e)}")
            return self.error_response(
                message="Failed to create payment order",
                errors={'detail': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyPaymentView(APIView, StandardResponseMixin):
    """Verify Razorpay payment"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Verify and complete payment"""
        try:
            serializer = PaymentVerifySerializer(data=request.data)
            
            if not serializer.is_valid():
                return self.error_response(
                    message="Invalid payment verification data",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Extract data
            razorpay_order_id = serializer.validated_data['razorpay_order_id']
            razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
            razorpay_signature = serializer.validated_data['razorpay_signature']
            
            # Get payment record
            payment = get_object_or_404(Payment, razorpay_order_id=razorpay_order_id)
            
            # Verify user has permission to verify this payment
            if payment.client.user != request.user:
                return self.error_response(
                    message="You don't have permission to verify this payment",
                    status_code=status.HTTP_403_FORBIDDEN
                )
            
            # Verify payment signature with Razorpay
            signature_valid = razorpay_service.verify_payment_signature(
                razorpay_order_id, razorpay_payment_id, razorpay_signature
            )
            
            if not signature_valid:
                # Mark payment as failed
                payment.status = 'failed'
                payment.save()
                
                return self.error_response(
                    message="Payment verification failed",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Get payment details from Razorpay
            payment_details = razorpay_service.get_payment_details(razorpay_payment_id)
            
            # Update payment record
            with transaction.atomic():
                payment.status = 'completed'
                payment.razorpay_payment_id = razorpay_payment_id
                payment.razorpay_signature = razorpay_signature
                payment.paid_at = timezone.now()
                payment.transaction_id = razorpay_payment_id
                
                # Update payment method if available
                if payment_details and 'method' in payment_details:
                    payment.payment_method = payment_details['method']
                
                payment.save()
                
                # Update job status to in_progress
                job = payment.job
                if job.status == 'open' or job.status == 'pending':
                    job.status = 'in_progress'
                    job.save()
            
            # Prepare response
            payment_serializer = PaymentSerializer(payment)
            
            return self.success_response(
                message="Payment verified and completed successfully",
                data={
                    'payment': payment_serializer.data,
                    'job_status_updated': True
                }
            )
            
        except Exception as e:
            logger.error(f"Error verifying payment: {str(e)}")
            return self.error_response(
                message="Payment verification failed",
                errors={'detail': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentListView(APIView, StandardResponseMixin):
    """List user's payments"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's payment history"""
        try:
            user = request.user
            
            # Determine user type and filter payments accordingly
            if hasattr(user, 'client_profile'):
                payments = Payment.objects.filter(client=user.client_profile)
            elif hasattr(user, 'freelancer_profile'):
                payments = Payment.objects.filter(freelancer=user.freelancer_profile)
            else:
                return self.error_response(
                    message="User profile not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            # Order by creation date (newest first)
            payments = payments.select_related(
                'job', 'client__user', 'freelancer__user'
            ).order_by('-created_at')
            
            # Optional status filtering
            status_filter = request.GET.get('status')
            if status_filter:
                payments = payments.filter(status=status_filter)
            
            # Paginate (simple pagination for now)
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            
            start = (page - 1) * page_size
            end = start + page_size
            
            payments_page = payments[start:end]
            total_count = payments.count()
            
            serializer = PaymentListSerializer(payments_page, many=True)
            
            return self.success_response(
                message="Payments retrieved successfully",
                data={
                    'payments': serializer.data,
                    'pagination': {
                        'current_page': page,
                        'page_size': page_size,
                        'total_count': total_count,
                        'total_pages': (total_count + page_size - 1) // page_size
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Error fetching payments: {str(e)}")
            return self.error_response(
                message="Failed to fetch payments",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def webhook_handler(request):
    """Handle Razorpay webhooks (optional for future use)"""
    try:
        # This is a placeholder for webhook implementation
        # In production, you'd verify webhook signature and process events
        event_type = request.data.get('event')
        
        logger.info(f"Received webhook event: {event_type}")
        
        return Response(
            {'status': 'success', 'message': 'Webhook processed'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
def payment_test(request):
    """Test endpoint to verify payment API is working"""
    return Response({
        'success': True,
        'message': 'Payment API is working',
        'razorpay_configured': bool(
            getattr(settings, 'RAZORPAY_KEY_ID', None) and 
            getattr(settings, 'RAZORPAY_KEY_SECRET', None)
        ),
        'user_authenticated': request.user.is_authenticated,
        'user': str(request.user) if request.user.is_authenticated else 'Anonymous'
    })
