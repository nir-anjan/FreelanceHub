#!/usr/bin/env python3
"""
Test chat dispute creation specifically
"""

import os
import sys
import django
import json

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.auth.models import User, Client, Freelancer, Job, Dispute
from chat.models import ChatThread
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from chat.views import create_dispute_from_chat

def test_chat_dispute_creation():
    """Test the specific chat dispute creation function"""
    
    print("🧪 Testing Chat Dispute Creation Function")
    print("=" * 45)
    
    try:
        # Get test users (should exist from previous test)
        client_user = User.objects.get(email='client_dispute_test@test.com')
        freelancer_user = User.objects.get(email='freelancer_dispute_test@test.com')
        
        client = client_user.client_profile
        freelancer = freelancer_user.freelancer_profile
        
        # Get existing job and thread
        job = Job.objects.get(title='Test Job for Dispute')
        thread = ChatThread.objects.get(client=client, freelancer=freelancer, job=job)
        
        print(f"✅ Test setup complete:")
        print(f"   - Thread ID: {thread.id}")
        print(f"   - Client: {client_user.username}")
        print(f"   - Freelancer: {freelancer_user.username}")
        print(f"   - Job: {job.title}")
        
        # Test dispute creation with the current API
        factory = RequestFactory()
        
        # Test data that matches what frontend sends
        request_data = {
            'subject': 'Payment Delay',
            'description': 'The client has not responded to payment requests for over a week despite work being completed on time.'
        }
        
        request = factory.post(f'/api/chat/threads/{thread.id}/create-dispute/', 
                              data=json.dumps(request_data),
                              content_type='application/json')
        request.user = client_user  # Client creating the dispute
        
        # Simulate the API call
        print(f"\n📤 Simulating API call:")
        print(f"   - URL: /api/chat/threads/{thread.id}/create-dispute/")
        print(f"   - Method: POST")
        print(f"   - Data: {request_data}")
        print(f"   - User: {client_user.username} (client)")
        
        # Call the view function directly
        response = create_dispute_from_chat(request, thread.id)
        
        print(f"\n📥 Response:")
        print(f"   - Status Code: {response.status_code}")
        print(f"   - Content: {response.data}")
        
        if response.status_code == 200:
            print(f"✅ Dispute created successfully!")
            
            # Check the created dispute
            latest_dispute = Dispute.objects.filter(
                client=client, 
                freelancer=freelancer, 
                job=job
            ).order_by('-created_at').first()
            
            if latest_dispute:
                print(f"\n📊 Created Dispute Details:")
                print(f"   - ID: {latest_dispute.id}")
                print(f"   - Status: {latest_dispute.status}")
                print(f"   - Description: {latest_dispute.description[:100]}...")
                print(f"   - Created At: {latest_dispute.created_at}")
        else:
            print(f"❌ Dispute creation failed")
            
    except Exception as e:
        print(f"❌ Test error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_chat_dispute_creation()