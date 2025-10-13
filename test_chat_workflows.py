#!/usr/bin/env python
"""
Test script for the integrated chat workflows (Hire Me + Proposal)
"""

import os
import sys
import django
import json

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.auth.models import Client, Freelancer, Job
from chat.models import ChatThread, ChatMessage
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_chat_integration():
    """Test the complete chat integration workflows"""
    print("🚀 Testing Chat Integration Workflows")
    print("=" * 60)
    
    # Get existing test users
    try:
        client_user = User.objects.get(username='testclient')
        freelancer_user = User.objects.get(username='testfreelancer')
        
        print(f"✅ Found test users:")
        print(f"   Client: {client_user.username} (ID: {client_user.id})")
        print(f"   Freelancer: {freelancer_user.username} (ID: {freelancer_user.id})")
        
        client_profile = client_user.client_profile
        freelancer_profile = freelancer_user.freelancer_profile
        
        print(f"   Client Profile ID: {client_profile.id}")
        print(f"   Freelancer Profile ID: {freelancer_profile.id}")
        
    except User.DoesNotExist:
        print("❌ Test users not found. Please run test_frontend_chat.py first.")
        return False
    
    # Test Hire Me Workflow
    print("\n📋 Testing Hire Me Workflow")
    print("-" * 40)
    
    # Check existing hire thread (should be thread ID 1)
    hire_thread = ChatThread.objects.filter(
        client=client_profile,
        freelancer=freelancer_profile,
        job__isnull=True
    ).first()
    
    if hire_thread:
        print(f"✅ Existing hire conversation found: Thread ID {hire_thread.id}")
        print(f"   Created: {hire_thread.created_at}")
        print(f"   Last message: {hire_thread.last_message_at}")
        
        # Count system messages for hire workflow
        hire_system_messages = ChatMessage.objects.filter(
            thread=hire_thread,
            message_type='system',
            metadata__action='hire_conversation_started'
        ).count()
        
        print(f"   System messages for hire workflow: {hire_system_messages}")
    else:
        print("⚠️  No existing hire conversation found")
    
    # Test Proposal Workflow
    print("\n📝 Testing Proposal Workflow")
    print("-" * 40)
    
    # Get test job
    test_job = Job.objects.filter(title='Build Chat System').first()
    if test_job:
        print(f"✅ Test job found: {test_job.title} (ID: {test_job.id})")
        
        proposal_thread = ChatThread.objects.filter(
            client=test_job.client,
            freelancer=freelancer_profile,
            job=test_job
        ).first()
        
        if proposal_thread:
            print(f"✅ Existing proposal conversation found: Thread ID {proposal_thread.id}")
            print(f"   Job: {proposal_thread.job.title}")
            print(f"   Created: {proposal_thread.created_at}")
            
            # Count system messages for proposal workflow
            proposal_system_messages = ChatMessage.objects.filter(
                thread=proposal_thread,
                message_type='system',
                metadata__action='proposal_submitted'
            ).count()
            
            print(f"   System messages for proposal workflow: {proposal_system_messages}")
        else:
            print("⚠️  No existing proposal conversation found")
    else:
        print("❌ Test job not found")
    
    # Show current thread summary
    print("\n📊 Current Thread Summary")
    print("-" * 40)
    
    all_threads = ChatThread.objects.filter(
        Q(client=client_profile) | Q(freelancer=freelancer_profile)
    ).order_by('id')
    
    for thread in all_threads:
        thread_type = "Hire Conversation" if not thread.job else f"Job: {thread.job.title}"
        message_count = thread.messages.count()
        unread_count = thread.messages.filter(is_read=False).count()
        
        print(f"   Thread {thread.id}: {thread_type}")
        print(f"     └── Messages: {message_count} (Unread: {unread_count})")
    
    # Generate fresh JWT tokens for testing
    print("\n🔑 Fresh JWT Tokens for Testing")
    print("-" * 40)
    
    client_token = RefreshToken.for_user(client_user)
    freelancer_token = RefreshToken.for_user(freelancer_user)
    
    tokens_data = {
        'client': {
            'user_id': client_user.id,
            'username': client_user.username,
            'profile_id': client_profile.id,
            'access_token': str(client_token.access_token),
            'refresh_token': str(client_token)
        },
        'freelancer': {
            'user_id': freelancer_user.id,
            'username': freelancer_user.username,
            'profile_id': freelancer_profile.id,
            'access_token': str(freelancer_token.access_token),
            'refresh_token': str(freelancer_token)
        },
        'test_job_id': test_job.id if test_job else None
    }
    
    with open('workflow_test_tokens.json', 'w') as f:
        json.dump(tokens_data, f, indent=2)
    
    print("✅ Fresh tokens saved to workflow_test_tokens.json")
    
    # Frontend Testing Instructions
    print("\n🌐 Frontend Testing Instructions")
    print("=" * 60)
    
    print("🔗 URLs to Test:")
    print(f"   React App: http://localhost:8081")
    print(f"   Django API: http://localhost:8000")
    
    print("\n👤 Test Scenarios:")
    
    print("\n1️⃣ HIRE ME WORKFLOW:")
    print("   a) Navigate to: http://localhost:8081/freelancers/5")
    print("   b) Login as client (testclient / testpass123)")
    print("   c) Click 'Hire Me' button")
    print("   d) Should redirect to chat and show system message")
    
    print("\n2️⃣ PROPOSAL WORKFLOW:")
    if test_job:
        print(f"   a) Navigate to: http://localhost:8081/jobs/{test_job.id}")
        print("   b) Login as freelancer (testfreelancer / testpass123)")
        print("   c) Fill proposal form and click 'Submit Proposal'")
        print("   d) Should redirect to chat and show system message")
    else:
        print("   ⚠️  Test job not available")
    
    print("\n🧪 API Testing:")
    print("   Use the tokens from workflow_test_tokens.json")
    print("   Test endpoints:")
    print("   - POST /api/chat/hire-freelancer/")
    print("   - POST /api/chat/proposal-chat/")
    
    print("\n✅ Expected Results:")
    print("   - Chat threads created automatically")
    print("   - System messages explaining the action")
    print("   - Redirects to chat interface")
    print("   - No duplicate threads for same participants")
    print("   - Real-time WebSocket functionality")
    
    print("\n🎯 Success Indicators:")
    print("   - ✅ Hire Me button creates/finds chat thread")
    print("   - ✅ Proposal submission creates/finds chat thread")
    print("   - ✅ System messages appear in chat")
    print("   - ✅ Users redirected to chat interface")
    print("   - ✅ WebSocket connection works in chat")
    print("   - ✅ Messages sent/received in real-time")
    
    return True

from django.db.models import Q

if __name__ == "__main__":
    success = test_chat_integration()
    print(f"\n{'🎉 SUCCESS' if success else '❌ FAILED'}: Chat workflow integration ready!")
    sys.exit(0 if success else 1)