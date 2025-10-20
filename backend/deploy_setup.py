#!/usr/bin/env python
"""
Deployment script for FreelanceMarketplace on Render
This script runs necessary setup commands after deployment
"""

import os
import sys
import django
from django.conf import settings
from django.core.management import execute_from_command_line

def setup_django():
    """Set up Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()

def run_migrations():
    """Run database migrations"""
    print("Running database migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    print("Migrations completed successfully!")

def collect_static():
    """Collect static files"""
    print("Collecting static files...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    print("Static files collected successfully!")

def create_default_superuser():
    """Create default superuser if none exists"""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(is_superuser=True).exists():
            print("Creating default superuser...")
            User.objects.create_superuser(
                email='admin@freelancemarketplace.com',
                password='changeThisPassword123!',
                first_name='Admin',
                last_name='User'
            )
            print("Default superuser created!")
            print("Email: admin@freelancemarketplace.com")
            print("Password: changeThisPassword123!")
            print("⚠️  IMPORTANT: Change this password immediately!")
        else:
            print("Superuser already exists, skipping creation.")
    except Exception as e:
        print(f"Error creating superuser: {e}")

def main():
    """Main deployment setup function"""
    print("🚀 Starting FreelanceMarketplace deployment setup...")
    
    # Setup Django
    setup_django()
    
    # Run setup commands
    try:
        run_migrations()
        collect_static()
        create_default_superuser()
        
        print("\n✅ Deployment setup completed successfully!")
        print("Your FreelanceMarketplace is ready to use!")
        
    except Exception as e:
        print(f"\n❌ Deployment setup failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()