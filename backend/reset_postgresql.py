#!/usr/bin/env python
"""
Reset PostgreSQL database for fresh start
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

def reset_postgresql_database():
    """Drop all tables and reset the database"""
    
    print("Resetting PostgreSQL Database")
    print("=" * 50)
    
    try:
        with connection.cursor() as cursor:
            # Get all table names
            cursor.execute("""
                SELECT tablename FROM pg_tables 
                WHERE schemaname = 'public';
            """)
            tables = cursor.fetchall()
            
            if tables:
                print(f"Found {len(tables)} tables to drop:")
                for table in tables:
                    print(f"  - {table[0]}")
                
                # Drop all tables
                table_names = [table[0] for table in tables]
                for table_name in table_names:
                    cursor.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE;')
                    print(f"✅ Dropped table: {table_name}")
            else:
                print("No tables found.")
            
            # Also clear any sequences
            cursor.execute("""
                SELECT sequence_name FROM information_schema.sequences 
                WHERE sequence_schema = 'public';
            """)
            sequences = cursor.fetchall()
            
            for seq in sequences:
                cursor.execute(f'DROP SEQUENCE IF EXISTS "{seq[0]}" CASCADE;')
                print(f"✅ Dropped sequence: {seq[0]}")
        
        print("\n✅ Database reset complete!")
        return True
        
    except Exception as e:
        print(f"❌ Database reset failed: {e}")
        return False

if __name__ == "__main__":
    reset_postgresql_database()