#!/usr/bin/env python
"""
Test script to verify the User model and database schema
"""
import os
import sys
import django

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Now we can import Django models and test
from api.auth.models import User
from django.db import connection

def test_user_model():
    """Test the User model fields and database schema"""
    
    print("Django User Model Test")
    print("=" * 50)
    
    # Check model fields
    print("User model fields:")
    fields = [f.name for f in User._meta.fields]
    for field in fields:
        print(f"  - {field}")
    
    print(f"\nRole field exists in model: {hasattr(User(), 'role')}")
    print(f"Role choices: {User.ROLE_CHOICES}")
    
    # Check database schema
    print("\nDatabase schema check:")
    try:
        with connection.cursor() as cursor:
            # PostgreSQL syntax to get column information
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'api_auth_user'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            column_names = [col[0] for col in columns]
            print("Database columns:")
            for col in column_names:
                print(f"  - {col}")
            
            role_in_db = 'role' in column_names
            print(f"\nRole column exists in database: {role_in_db}")
            
            if role_in_db:
                print("✅ Database schema is correct!")
                return True
            else:
                print("❌ Role column missing from database!")
                return False
                
    except Exception as e:
        print(f"Database error: {e}")
        return False

def test_user_creation():
    """Test creating a user with role"""
    print("\nUser Creation Test:")
    try:
        # Try to create a user
        user = User(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User',
            role='freelancer'
        )
        user.set_password('testpass123')
        user.save()
        
        print(f"✅ User created successfully!")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   ID: {user.id}")
        
        # Clean up
        user.delete()
        return True
        
    except Exception as e:
        print(f"❌ User creation failed: {e}")
        return False

if __name__ == "__main__":
    schema_ok = test_user_model()
    if schema_ok:
        test_user_creation()
    else:
        print("\n⚠️  Database schema needs to be fixed before testing user creation.")