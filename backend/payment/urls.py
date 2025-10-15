from django.urls import path
from . import views

app_name = 'payment'

urlpatterns = [
    # Payment order creation
    path('create-order/', views.CreatePaymentOrderView.as_view(), name='create_order'),
    
    # Payment verification
    path('verify-payment/', views.VerifyPaymentView.as_view(), name='verify_payment'),
    
    # Payment history
    path('list/', views.PaymentListView.as_view(), name='payment_list'),
    
    # Webhook endpoint (optional)
    path('webhook/', views.webhook_handler, name='webhook'),
    
    # Test endpoint
    path('test/', views.payment_test, name='payment_test'),
]