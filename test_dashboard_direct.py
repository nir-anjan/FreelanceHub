#!/usr/bin/env python
"""
Direct test of dashboard logic without authentication
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
from django.db import models

def test_dashboard_logic():
    """Test the dashboard statistics logic directly"""
    print("=== Testing Dashboard Logic Directly ===\n")
    
    # Find the tom user (we know he has jobs)
    try:
        user = User.objects.get(username='tom')
        print(f"Testing with user: {user.username} (role: {user.role})")
        
        if user.is_client:
            client_profile = getattr(user, 'client_profile', None)
            if client_profile:
                print(f"Client profile found: {client_profile}")
                
                # Replicate the exact logic from the updated dashboard view
                total_jobs_posted = client_profile.jobs.filter(status='open').count()
                active_jobs = client_profile.jobs.filter(status='in_progress').count()
                completed_jobs = client_profile.jobs.filter(status='completed').count()
                total_spent = client_profile.payments.filter(status='completed').aggregate(
                    total=models.Sum('amount')
                )['total'] or 0
                
                print(f"\n=== Dashboard Stats (Updated Logic) ===")
                print(f"total_jobs_posted (open only): {total_jobs_posted}")
                print(f"active_jobs (in_progress only): {active_jobs}")
                print(f"completed_jobs (completed only): {completed_jobs}")
                print(f"total_spent: {float(total_spent)}")
                
                # Show all jobs for context
                print(f"\n=== All Jobs for {user.username} ===")
                all_jobs = client_profile.jobs.all()
                for job in all_jobs:
                    print(f"Job {job.id}: '{job.title}' | Status: '{job.status}' | Created: {job.created_at}")
                
                # Show breakdown by status
                print(f"\n=== Job Status Breakdown ===")
                for status in ['pending', 'open', 'in_progress', 'completed', 'cancelled']:
                    count = client_profile.jobs.filter(status=status).count()
                    print(f"  {status}: {count}")
                
                # Simulate the complete dashboard response
                data = {
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'profile_picture': user.profile_picture,
                    },
                    'stats': {
                        'total_jobs_posted': total_jobs_posted,
                        'active_jobs': active_jobs,
                        'completed_jobs': completed_jobs,
                        'total_spent': float(total_spent),
                        'unread_messages': 0
                    }
                }
                
                print(f"\n=== Simulated Dashboard Response ===")
                import json
                print(json.dumps({
                    'success': True,
                    'message': 'Dashboard data retrieved successfully',
                    'data': data
                }, indent=2))
                
            else:
                print("❌ User has no client profile")
        else:
            print("❌ User is not a client")
            
    except User.DoesNotExist:
        print("❌ User 'tom' not found")

if __name__ == '__main__':
    test_dashboard_logic()