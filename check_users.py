#!/usr/bin/env python
"""
Check available users and create a test user if needed
"""
import os
import sys
import django

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.auth.models import User, Client, Job
from django.contrib.auth.hashers import make_password

def check_users_and_create_test():
    """Check users and create a test client if needed"""
    print("=== Available Users ===")
    
    users = User.objects.all()
    for user in users:
        has_client_profile = hasattr(user, 'client_profile') and user.client_profile is not None
        job_count = 0
        if has_client_profile:
            job_count = user.client_profile.jobs.count()
        
        print(f"User: {user.username} | Role: {user.role} | Email: {user.email} | Has Client Profile: {has_client_profile} | Jobs: {job_count}")
    
    # Create a test client user with some jobs if none exists
    client_users = User.objects.filter(role='client')
    if not client_users.exists():
        print("\n=== Creating Test Client User ===")
        test_user = User.objects.create(
            username='testclient',
            email='testclient@example.com',
            password=make_password('testpass123'),
            role='client',
            first_name='Test',
            last_name='Client'
        )
        
        # Create client profile
        from api.auth.models import Client
        client_profile = Client.objects.create(
            user=test_user,
            company_name='Test Company'
        )
        
        # Create some test jobs with different statuses
        Job.objects.create(
            client=client_profile,
            title='Test Open Job',
            description='This is an open job',
            status='open'
        )
        
        Job.objects.create(
            client=client_profile,
            title='Test Pending Job',
            description='This is a pending job',
            status='pending'
        )
        
        Job.objects.create(
            client=client_profile,
            title='Test Completed Job',
            description='This is a completed job',
            status='completed'
        )
        
        print(f"Created test user: {test_user.username} with password: testpass123")
        print("Created 3 test jobs (open, pending, completed)")
    
    print(f"\n=== Suggested Test Credentials ===")
    client_users = User.objects.filter(role='client')
    for user in client_users:
        print(f"Username: {user.username}")
        print("Try password: testpass123 (if it's the test user)")
        print("Or try common passwords: password123, admin123, etc.")
        break

if __name__ == '__main__':
    check_users_and_create_test()