#!/usr/bin/env python
"""
Generate JWT tokens for testing Socket.IO chat system
"""
import os
import sys
import django
from datetime import datetime, timedelta
import jwt
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

def generate_token_for_user(user):
    """Generate JWT token for a user"""
    payload = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow(),
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def main():
    print("🔑 JWT Token Generator for Socket.IO Chat Testing\n")
    
    # Get all users
    users = User.objects.all()
    
    if not users.exists():
        print("❌ No users found in database. Please create some users first.")
        return
    
    tokens = {}
    
    print("📋 Available Users:")
    for i, user in enumerate(users, 1):
        print(f"{i}. {user.username} ({user.email}) - {user.first_name} {user.last_name}")
        
        # Generate token
        token = generate_token_for_user(user)
        tokens[user.username] = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'token': token
        }
        
        print(f"   Token: {token[:50]}...")
        print()
    
    # Save tokens to file
    with open('socketio_test_tokens.json', 'w') as f:
        json.dump(tokens, f, indent=2)
    
    print(f"✅ Generated {len(tokens)} tokens")
    print("📁 Tokens saved to 'socketio_test_tokens.json'")
    print("\n🚀 Copy any token above and paste it into the Socket.IO test page!")
    
    # Print first token for easy copying
    if tokens:
        first_user = list(tokens.keys())[0]
        first_token = tokens[first_user]['token']
        print(f"\n📋 Quick copy - Token for {first_user}:")
        print(first_token)

if __name__ == '__main__':
    main()