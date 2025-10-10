#!/usr/bin/env python
"""
Test PostgreSQL database connection
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

from django.db import connection
from django.core.management.color import no_style
from django.db import transaction

def test_postgresql_connection():
    """Test PostgreSQL database connection"""
    
    print("PostgreSQL Connection Test")
    print("=" * 50)
    
    try:
        # Test basic connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
            print(f"✅ Database connection successful!")
            print(f"PostgreSQL Version: {db_version}")
            
        # Test database name
        db_name = connection.settings_dict['NAME']
        db_user = connection.settings_dict['USER']
        db_host = connection.settings_dict['HOST']
        db_port = connection.settings_dict['PORT']
        
        print(f"\nDatabase Configuration:")
        print(f"  Database: {db_name}")
        print(f"  User: {db_user}")
        print(f"  Host: {db_host}")
        print(f"  Port: {db_port}")
        
        # Test if we can create tables (basic permission test)
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS test_connection (
                    id SERIAL PRIMARY KEY,
                    test_field VARCHAR(100)
                );
            """)
            cursor.execute("DROP TABLE IF EXISTS test_connection;")
            
        print(f"✅ Database permissions are correct!")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nTroubleshooting steps:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check if database 'freelance_marketplace_db' exists")
        print("3. Verify username/password: postgres/qwerty")
        print("4. Ensure PostgreSQL is listening on localhost:5432")
        return False

if __name__ == "__main__":
    test_postgresql_connection()