import razorpay
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class RazorpayService:
    """Service class for Razorpay integration"""
    
    def __init__(self):
        self.client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
    
    def create_order(self, amount, currency='INR', receipt=None):
        """
        Create a Razorpay order
        
        Args:
            amount (int): Amount in smallest currency unit (paise for INR)
            currency (str): Currency code (default: INR)
            receipt (str): Receipt identifier
            
        Returns:
            dict: Razorpay order response
        """
        try:
            order_data = {
                'amount': int(amount * 100),  # Convert to paise
                'currency': currency,
                'receipt': receipt or f'order_{amount}',
                'payment_capture': 1  # Auto capture payment
            }
            
            order = self.client.order.create(data=order_data)
            logger.info(f"Razorpay order created: {order['id']}")
            return order
            
        except Exception as e:
            logger.error(f"Error creating Razorpay order: {str(e)}")
            raise Exception(f"Failed to create payment order: {str(e)}")
    
    def verify_payment_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """
        Verify Razorpay payment signature
        
        Args:
            razorpay_order_id (str): Razorpay order ID
            razorpay_payment_id (str): Razorpay payment ID
            razorpay_signature (str): Razorpay signature
            
        Returns:
            bool: True if signature is valid, False otherwise
        """
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            # Verify signature
            self.client.utility.verify_payment_signature(params_dict)
            logger.info(f"Payment signature verified for order: {razorpay_order_id}")
            return True
            
        except Exception as e:
            logger.error(f"Payment signature verification failed: {str(e)}")
            return False
    
    def get_payment_details(self, payment_id):
        """
        Get payment details from Razorpay
        
        Args:
            payment_id (str): Razorpay payment ID
            
        Returns:
            dict: Payment details
        """
        try:
            payment = self.client.payment.fetch(payment_id)
            return payment
        except Exception as e:
            logger.error(f"Error fetching payment details: {str(e)}")
            return None
    
    def get_order_details(self, order_id):
        """
        Get order details from Razorpay
        
        Args:
            order_id (str): Razorpay order ID
            
        Returns:
            dict: Order details
        """
        try:
            order = self.client.order.fetch(order_id)
            return order
        except Exception as e:
            logger.error(f"Error fetching order details: {str(e)}")
            return None

# Create a singleton instance
razorpay_service = RazorpayService()