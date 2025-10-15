#!/usr/bin/env python
"""
Script to create admin user for FreelanceMarketplace
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

def create_admin_user():
    """Create an admin user if none exists"""
    
    # Check if any admin users exist
    admin_users = User.objects.filter(role='admin')
    superusers = User.objects.filter(is_superuser=True)
    
    print("=== Admin User Status ===")
    print(f"Admin users (role='admin'): {admin_users.count()}")
    print(f"Superusers: {superusers.count()}")
    
    if admin_users.exists():
        print("\nExisting admin users:")
        for user in admin_users:
            print(f"  - Username: {user.username}, Email: {user.email}")
    
    if superusers.exists():
        print("\nExisting superusers:")
        for user in superusers:
            print(f"  - Username: {user.username}, Email: {user.email}")
    
    # Create admin user if none exists
    if not admin_users.exists() and not superusers.exists():
        print("\nNo admin users found. Creating default admin user...")
        
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@freelancemarketplace.com',
            password='admin123',  # Change this password!
            first_name='Admin',
            last_name='User',
            role='admin',
            is_superuser=True,
            is_staff=True
        )
        
        print(f"✅ Admin user created successfully!")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Password: admin123 (Please change this!)")
        print(f"   Role: {admin_user.role}")
        print(f"   Is Superuser: {admin_user.is_superuser}")
        
    else:
        print("\n✅ Admin users already exist.")
    
    print("\n=== Login Test ===")
    print("You can now login with the admin credentials:")
    if admin_users.exists():
        user = admin_users.first()
        print(f"Username: {user.username}")
        print("Password: [Use the password you set when creating this user]")
    else:
        print("Username: admin")
        print("Password: admin123")

if __name__ == '__main__':
    create_admin_user()