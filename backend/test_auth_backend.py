#!/usr/bin/env python
"""
Test script to verify the updated Django authentication backend
"""
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Now we can import Django models and test
from api.auth.serializers import UserRegistrationSerializer
from api.auth.models import User

def test_registration_serializer():
    """Test the registration serializer with the frontend payload"""
    
    # Test payload from frontend
    test_payload = {
        "username": "freelancer1",
        "email": "freelancer1@gmail.com",
        "password": "Hello@123",
        "password_confirm": "Hello@123",
        "first_name": "Freelancer",
        "last_name": "One",
        "phone": "",
        "role": "freelancer"
    }
    
    print("Testing UserRegistrationSerializer...")
    print(f"Test payload: {test_payload}")
    
    # Test serializer validation
    serializer = UserRegistrationSerializer(data=test_payload)
    
    if serializer.is_valid():
        print("✅ Serializer validation passed!")
        print(f"Validated data: {serializer.validated_data}")
        
        # Test that password_confirm is handled correctly
        validated_data = serializer.validated_data.copy()
        has_password_confirm = 'password_confirm' in validated_data
        print(f"password_confirm in validated_data: {has_password_confirm}")
        
        if has_password_confirm:
            print("⚠️  password_confirm should be removed from validated_data")
        else:
            print("✅ password_confirm correctly excluded from validated_data")
            
        return True
    else:
        print("❌ Serializer validation failed!")
        print(f"Errors: {serializer.errors}")
        return False

def test_password_mismatch():
    """Test password mismatch validation"""
    
    test_payload = {
        "username": "freelancer2",
        "email": "freelancer2@gmail.com", 
        "password": "Hello@123",
        "password_confirm": "Different@123",  # Different password
        "first_name": "Freelancer",
        "last_name": "Two",
        "phone": "",
        "role": "freelancer"
    }
    
    print("\nTesting password mismatch validation...")
    
    serializer = UserRegistrationSerializer(data=test_payload)
    
    if not serializer.is_valid():
        print("✅ Password mismatch correctly detected!")
        print(f"Errors: {serializer.errors}")
        return True
    else:
        print("❌ Password mismatch should have been detected!")
        return False

def test_invalid_role():
    """Test invalid role validation"""
    
    test_payload = {
        "username": "admin1",
        "email": "admin1@gmail.com",
        "password": "Hello@123", 
        "password_confirm": "Hello@123",
        "first_name": "Admin",
        "last_name": "User",
        "phone": "",
        "role": "admin"  # Should not be allowed for registration
    }
    
    print("\nTesting invalid role validation...")
    
    serializer = UserRegistrationSerializer(data=test_payload)
    
    if not serializer.is_valid():
        print("✅ Invalid role correctly rejected!")
        print(f"Errors: {serializer.errors}")
        return True
    else:
        print("❌ Invalid role should have been rejected!")
        return False

if __name__ == "__main__":
    print("Django Authentication Backend Test")
    print("=" * 50)
    
    success_count = 0
    total_tests = 3
    
    # Run tests
    if test_registration_serializer():
        success_count += 1
        
    if test_password_mismatch():
        success_count += 1
        
    if test_invalid_role():
        success_count += 1
    
    print("\n" + "=" * 50)
    print(f"Test Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All tests passed! Backend is ready for frontend integration.")
    else:
        print("⚠️  Some tests failed. Please review the implementation.")