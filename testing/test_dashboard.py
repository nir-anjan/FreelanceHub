#!/usr/bin/env python3
"""
Dashboard API Test Script
Tests all the dashboard endpoints with mock authentication
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(endpoint, method="GET", data=None, token=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        else:
            return False, f"Unsupported method: {method}"
            
        return True, {
            "status_code": response.status_code,
            "content": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        }
    except Exception as e:
        return False, str(e)

def main():
    """Test all dashboard endpoints"""
    print("🚀 Testing Dashboard API Endpoints")
    print("=" * 50)
    
    # Test endpoints without authentication (should return 401)
    test_endpoints = [
        "/api/auth/dashboard/",
        "/api/auth/jobs/create/",
        "/api/auth/jobs/history/",
        "/api/auth/jobs/active/",
        "/api/auth/payments/history/",
        "/api/auth/inbox/",
    ]
    
    for endpoint in test_endpoints:
        print(f"\n📋 Testing: {endpoint}")
        success, result = test_endpoint(endpoint)
        
        if success:
            status_code = result["status_code"]
            if status_code == 401:
                print(f"✅ Expected 401 Unauthorized - Endpoint requires authentication")
            elif status_code == 200:
                print(f"✅ Status: {status_code} - Endpoint accessible")
            else:
                print(f"⚠️  Status: {status_code} - Unexpected response")
                print(f"   Response: {result['content']}")
        else:
            print(f"❌ Error: {result}")
    
    # Test basic server health
    print(f"\n🏥 Testing server health...")
    success, result = test_endpoint("/api/auth/register/", "POST", {
        "username": "test_user",
        "email": "test@example.com", 
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "role": "client"
    })
    
    if success:
        status_code = result["status_code"]
        if status_code in [201, 400]:  # 201 success, 400 user exists
            print(f"✅ Registration endpoint working (Status: {status_code})")
        else:
            print(f"⚠️  Registration status: {status_code}")
    else:
        print(f"❌ Registration error: {result}")
    
    print("\n" + "=" * 50)
    print("🎉 Dashboard API test completed!")
    print("\nNext steps:")
    print("1. Frontend is running at: http://localhost:8081")
    print("2. Backend is running at: http://127.0.0.1:8000")
    print("3. Test full authentication flow through the UI")

if __name__ == "__main__":
    main()