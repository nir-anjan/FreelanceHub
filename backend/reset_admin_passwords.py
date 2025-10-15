#!/usr/bin/env python
"""
Script to reset admin user passwords for FreelanceMarketplace
"""
import os
import sys
import django

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.auth.models import User
from django.contrib.auth.hashers import make_password

def reset_admin_passwords():
    """Reset passwords for all admin users to a known password"""
    
    # Get all admin users
    admin_users = User.objects.filter(role='admin')
    
    print("=== Resetting Admin Passwords ===")
    print(f"Found {admin_users.count()} admin users")
    
    # Set a common password for all admin users
    new_password = 'admin123'
    
    for user in admin_users:
        user.set_password(new_password)
        user.save()
        print(f"✅ Password reset for user: {user.username} (Email: {user.email})")
    
    print(f"\n🔑 All admin users now have password: {new_password}")
    print("\n📋 Available admin credentials:")
    for user in admin_users:
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Password: {new_password}")
        print(f"   Role: {user.role}")
        print("   ---")
    
    print("\n🌐 You can now login at: http://localhost:8006/admin/login")
    print("💡 Recommendation: Change these passwords after logging in!")

if __name__ == '__main__':
    reset_admin_passwords()