#!/usr/bin/env python3
"""Test script for payment endpoints after table recreation."""

import requests
import json
import os
import sys

# Add the backend directory to the Python path
sys.path.append('backend')

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from api.auth.models import User, Job, Client, Freelancer

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token():
    """Get authentication token for testing."""
    # Create a test user if doesn't exist
    try:
        user = User.objects.get(email="testclient@example.com")
    except User.DoesNotExist:
        try:
            user = User.objects.create_user(
                username="testclient",
                email="testclient@example.com",
                password="testpassword123",
                first_name="Test",
                last_name="Client",
                role="client"
            )
        except Exception as e:
            # User might exist with different email, try to get by username
            try:
                user = User.objects.get(username="testclient")
            except User.DoesNotExist:
                print(f"Failed to create or find user: {e}")
                return None
    
    # Get or create client profile
    try:
        client = Client.objects.get(user=user)
    except Client.DoesNotExist:
        client = Client.objects.create(
            user=user,
            company_name="Test Company",
            industry="Technology"
        )
    
    # Login to get token
    login_data = {
        "email": "testclient@example.com",
        "password": "testpassword123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
    if response.status_code == 200:
        return response.json()["access"]
    else:
        print(f"Login failed: {response.text}")
        return None

def create_test_job():
    """Create a test job for payment."""
    token = get_auth_token()
    if not token:
        return None
    
    headers = {"Authorization": f"Bearer {token}"}
    
    job_data = {
        "title": "Test Payment Job",
        "description": "This is a test job for payment functionality",
        "budget": "1000.00",
        "deadline": "2025-12-31",
        "skills_required": ["Python", "Django"],
        "category": "web-development"
    }
    
    response = requests.post(f"{BASE_URL}/api/jobs/", json=job_data, headers=headers)
    if response.status_code == 201:
        return response.json()["id"]
    else:
        print(f"Job creation failed: {response.text}")
        return None

def test_payment_endpoints():
    """Test payment endpoints."""
    print("=== Testing Payment Endpoints ===")
    
    # Get token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token")
        return
    
    print("✅ Authentication successful")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create test job
    job_id = create_test_job()
    if not job_id:
        print("❌ Failed to create test job")
        return
    
    print(f"✅ Test job created with ID: {job_id}")
    
    # Test create payment order
    print("\n--- Testing Create Payment Order ---")
    payment_data = {
        "job_id": job_id,
        "amount": 1000.00
    }
    
    response = requests.post(f"{BASE_URL}/api/payments/create-order/", 
                           json=payment_data, headers=headers)
    
    if response.status_code == 200:
        order_data = response.json()
        print("✅ Payment order created successfully")
        print(f"   Razorpay Order ID: {order_data.get('razorpay_order_id')}")
        print(f"   Amount: {order_data.get('amount')}")
        
        # Test payment list
        print("\n--- Testing Payment List ---")
        list_response = requests.get(f"{BASE_URL}/api/payments/", headers=headers)
        
        if list_response.status_code == 200:
            payments = list_response.json()
            print(f"✅ Payment list retrieved successfully")
            print(f"   Number of payments: {len(payments)}")
            if payments:
                print(f"   Latest payment status: {payments[0].get('status', 'N/A')}")
        else:
            print(f"❌ Payment list failed: {list_response.text}")
        
    else:
        print(f"❌ Payment order creation failed: {response.text}")

def test_database_connection():
    """Test database connection and payment table."""
    print("=== Testing Database Connection ===")
    
    try:
        from payment.models import Payment
        
        # Check if we can query the Payment model
        payment_count = Payment.objects.count()
        print(f"✅ Payment table accessible")
        print(f"   Current payment records: {payment_count}")
        
        # Test creating a payment record (without Razorpay integration)
        user = User.objects.first()
        if user:
            client = Client.objects.filter(user=user).first()
            job = Job.objects.first()
            
            if client and job:
                test_payment = Payment(
                    job=job,
                    client=client,
                    amount=100.00,
                    status="pending"
                )
                test_payment.save()
                print("✅ Test payment record created successfully")
                
                # Clean up test record
                test_payment.delete()
                print("✅ Test payment record cleaned up")
            else:
                print("⚠️ No client or job found for testing")
        else:
            print("⚠️ No users found for testing")
            
    except Exception as e:
        print(f"❌ Database test failed: {str(e)}")

if __name__ == "__main__":
    print("Payment System Recovery Test")
    print("=" * 50)
    
    # Test database first
    test_database_connection()
    print()
    
    # Test API endpoints
    test_payment_endpoints()
    
    print("\n" + "=" * 50)
    print("Payment recovery test completed!")