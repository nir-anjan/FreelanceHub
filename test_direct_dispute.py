#!/usr/bin/env python3
"""
Direct test of dispute creation logic
"""

import os
import sys
import django

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.auth.models import User, Client, Freelancer, Job, Dispute
from chat.models import ChatThread, ChatMessage

def test_direct_dispute_creation():
    """Test dispute creation directly using Django ORM"""
    
    print("🧪 Testing Direct Dispute Creation")
    print("=" * 35)
    
    try:
        # Get test data
        client_user = User.objects.get(email='client_dispute_test@test.com')
        freelancer_user = User.objects.get(email='freelancer_dispute_test@test.com')
        
        client = client_user.client_profile
        freelancer = freelancer_user.freelancer_profile
        job = Job.objects.get(title='Test Job for Dispute')
        thread = ChatThread.objects.get(client=client, freelancer=freelancer, job=job)
        
        print(f"✅ Test data loaded")
        
        # Test the exact logic from create_dispute_from_chat
        subject = "Payment Issue"
        description = "Client has not paid despite multiple reminders"
        
        # This is the exact logic from the view
        full_description = f"{subject}: {description}" if subject else description
        
        print(f"\n🔧 Creating dispute with:")
        print(f"   - Client: {client}")
        print(f"   - Freelancer: {freelancer}")  
        print(f"   - Job: {job}")
        print(f"   - Description: {full_description}")
        print(f"   - Status: open")
        
        # Create dispute using exact same method as the view
        dispute = Dispute.objects.create(
            client=client,
            freelancer=freelancer,
            job=job,
            description=full_description,
            status='open'
        )
        
        print(f"\n✅ Dispute created successfully!")
        print(f"   - ID: {dispute.id}")
        print(f"   - Status: {dispute.status}")
        print(f"   - Description: {dispute.description}")
        print(f"   - Created At: {dispute.created_at}")
        
        # Test creating a system message (like the view does)
        dispute_title = subject if subject else f"Dispute #{dispute.id}"
        system_message = ChatMessage.objects.create(
            thread=thread,
            sender=client_user,
            message=f"Dispute created: {dispute_title}",
            message_type='dispute_created',
            metadata={
                'dispute_id': dispute.id,
                'subject': subject or f"Dispute #{dispute.id}",
                'description': description
            }
        )
        
        print(f"\n✅ System message created:")
        print(f"   - Message: {system_message.message}")
        print(f"   - Type: {system_message.message_type}")
        print(f"   - Metadata: {system_message.metadata}")
        
        print(f"\n🎉 All dispute creation logic is working correctly!")
        print(f"\n📊 Final stats:")
        print(f"   - Total Disputes: {Dispute.objects.count()}")
        print(f"   - This User's Disputes: {Dispute.objects.filter(client=client).count()}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_direct_dispute_creation()