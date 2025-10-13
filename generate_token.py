#!/usr/bin/env python
"""
Generate fresh JWT token for WebSocket testing
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def generate_test_token():
    try:
        # Get test user
        user = User.objects.get(username='testclient')
        token = RefreshToken.for_user(user)
        
        print("🔑 Fresh JWT Token Generated:")
        print(f"Access Token: {str(token.access_token)}")
        print(f"User: {user.username} (ID: {user.id})")
        print(f"\n🌐 WebSocket Test URL:")
        print(f"ws://localhost:8000/ws/chat/1/?token={str(token.access_token)}")
        
        return str(token.access_token)
        
    except User.DoesNotExist:
        print("❌ Test user 'testclient' not found")
        print("Run test_frontend_chat.py first to create test users")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    generate_test_token()