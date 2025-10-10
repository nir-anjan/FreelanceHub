#!/usr/bin/env python
"""
Check PostgreSQL tables and schema
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

def check_postgresql_tables():
    """Check all tables in PostgreSQL"""
    
    print("PostgreSQL Tables and Schema Check")
    print("=" * 50)
    
    try:
        with connection.cursor() as cursor:
            # List all tables
            cursor.execute("""
                SELECT tablename FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename;
            """)
            tables = cursor.fetchall()
            
            print("All tables in database:")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Find our custom user table
            user_tables = [t[0] for t in tables if 'user' in t[0].lower()]
            print(f"\nUser-related tables: {user_tables}")
            
            # Check the actual custom user table
            for table_name in user_tables:
                if 'api_auth' in table_name or 'auth_user' in table_name:
                    print(f"\nChecking table: {table_name}")
                    cursor.execute(f"""
                        SELECT column_name, data_type, is_nullable
                        FROM information_schema.columns 
                        WHERE table_name = '{table_name}'
                        ORDER BY ordinal_position;
                    """)
                    columns = cursor.fetchall()
                    
                    print(f"Columns in {table_name}:")
                    role_found = False
                    for col in columns:
                        print(f"  - {col[0]} ({col[1]}) {'NULL' if col[2] == 'YES' else 'NOT NULL'}")
                        if col[0] == 'role':
                            role_found = True
                    
                    if role_found:
                        print(f"✅ Role column found in {table_name}!")
                    else:
                        print(f"❌ Role column NOT found in {table_name}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return False

if __name__ == "__main__":
    check_postgresql_tables()