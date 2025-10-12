#!/usr/bin/env python
"""
Test script to verify dashboard statistics are correctly filtering jobs by status
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

def test_dashboard_stats():
    """Test that dashboard stats filter jobs by status correctly"""
    print("=== Testing Dashboard Statistics ===\n")
    
    # Find a client user for testing
    client_users = User.objects.filter(role='client')[:1]
    
    if not client_users.exists():
        print("No client users found. Please create a client user first.")
        return
    
    client_user = client_users.first()
    client_profile = getattr(client_user, 'client_profile', None)
    
    if not client_profile:
        print(f"Client user {client_user.username} doesn't have a client profile.")
        return
    
    print(f"Testing with client: {client_user.username}")
    
    # Get all jobs for this client
    all_jobs = client_profile.jobs.all()
    print(f"Total jobs in database for this client: {all_jobs.count()}")
    
    # Show breakdown by status
    status_counts = {}
    for status in ['pending', 'open', 'in_progress', 'completed', 'cancelled']:
        count = client_profile.jobs.filter(status=status).count()
        status_counts[status] = count
        print(f"  {status}: {count}")
    
    print("\n=== Dashboard Stats (After Fix) ===")
    # These are the stats that would be returned by the updated dashboard endpoint
    total_jobs_posted = client_profile.jobs.filter(status='open').count()
    active_jobs = client_profile.jobs.filter(status='in_progress').count()
    completed_jobs = client_profile.jobs.filter(status='completed').count()
    
    print(f"total_jobs_posted (open only): {total_jobs_posted}")
    print(f"active_jobs (in_progress only): {active_jobs}")
    print(f"completed_jobs (completed only): {completed_jobs}")
    
    print("\n=== Sample Jobs ===")
    for job in all_jobs[:5]:  # Show first 5 jobs
        print(f"Job ID {job.id}: '{job.title}' - Status: {job.status}")

if __name__ == '__main__':
    test_dashboard_stats()