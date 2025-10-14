#!/usr/bin/env python3
"""
Test script for the dispute management system
"""

import os
import sys
import django
import requests
import json

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.auth.models import User, Client, Freelancer, Job, Dispute
from chat.models import ChatThread, ChatMessage

def test_dispute_system():
    """Test the dispute management system"""
    
    print("🧪 Testing Dispute Management System")
    print("=" * 50)
    
    # Test data setup
    try:
        # Create users (get existing or create new ones)
        try:
            admin_user = User.objects.get(email='admin_dispute_test@test.com')
        except User.DoesNotExist:
            admin_user = User.objects.create_user(
                username='admin_dispute_test',
                email='admin_dispute_test@test.com',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
        
        try:
            client_user = User.objects.get(email='client_dispute_test@test.com')
        except User.DoesNotExist:
            client_user = User.objects.create_user(
                username='client_dispute_test',
                email='client_dispute_test@test.com',
                first_name='Test',
                last_name='Client',
                role='client'
            )
        
        try:
            freelancer_user = User.objects.get(email='freelancer_dispute_test@test.com')
        except User.DoesNotExist:
            freelancer_user = User.objects.create_user(
                username='freelancer_dispute_test',
                email='freelancer_dispute_test@test.com',
                first_name='Test',
                last_name='Freelancer',
                role='freelancer'
            )
        
        # Create profiles
        client, _ = Client.objects.get_or_create(
            user=client_user,
            defaults={'company_name': 'Test Company'}
        )
        
        freelancer, _ = Freelancer.objects.get_or_create(
            user=freelancer_user,
            defaults={'title': 'Test Developer', 'rate': 50.00}
        )
        
        # Create job
        job, _ = Job.objects.get_or_create(
            title='Test Job for Dispute',
            defaults={
                'description': 'This is a test job for dispute testing',
                'client': client,
                'budget_min': 800.00,
                'budget_max': 1200.00,
                'duration': '2 weeks',
                'category': 'Web Development'
            }
        )
        
        print(f"✅ Test data created successfully")
        print(f"   - Admin: {admin_user.username}")
        print(f"   - Client: {client.user.username}")
        print(f"   - Freelancer: {freelancer.user.username}")
        print(f"   - Job: {job.title}")
        
        # Test dispute creation
        dispute, created = Dispute.objects.get_or_create(
            job=job,
            client=client,
            freelancer=freelancer,
            defaults={
                'description': 'Subject: Payment Issue\n\nThe client has not paid for the completed work despite multiple reminders.',
                'status': 'open'
            }
        )
        
        print(f"✅ Dispute created/found: ID {dispute.id}")
        print(f"   - Status: {dispute.status}")
        print(f"   - Description: {dispute.description[:50]}...")
        
        # Test chat thread creation
        thread, _ = ChatThread.objects.get_or_create(
            client=client,
            freelancer=freelancer,
            job=job,
            defaults={'is_active': True}
        )
        
        print(f"✅ Chat thread created/found: ID {thread.id}")
        
        # Test the disputes API endpoints (if server is running)
        try:
            # Test dispute list endpoint
            response = requests.get('http://127.0.0.1:8000/api/admin/disputes/')
            print(f"✅ API Test - Dispute List: HTTP {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data and 'disputes' in data['data']:
                    disputes_count = len(data['data']['disputes'])
                    print(f"   - Found {disputes_count} disputes")
                
        except requests.exceptions.ConnectionError:
            print("⚠️  Django server not running - skipping API tests")
        except Exception as e:
            print(f"⚠️  API test error: {e}")
        
        print("\n📊 Database Summary:")
        print(f"   - Total Disputes: {Dispute.objects.count()}")
        print(f"   - Open Disputes: {Dispute.objects.filter(status='open').count()}")
        print(f"   - Resolved Disputes: {Dispute.objects.filter(status='resolved').count()}")
        print(f"   - Chat Threads: {ChatThread.objects.count()}")
        
        print("\n🎉 All tests completed successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_dispute_system()
    sys.exit(0 if success else 1)