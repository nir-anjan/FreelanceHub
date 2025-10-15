#!/usr/bin/env python3
"""Test the analytics API endpoint on port 8006."""

import requests
import json

def test_analytics_endpoint():
    print("=== Testing Analytics API on Port 8006 ===")
    
    try:
        # Test the analytics endpoint
        response = requests.get("http://localhost:8006/api/auth/admin/analytics/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Endpoint is accessible (authentication required)")
            print("📝 Response:", response.json())
        elif response.status_code == 200:
            print("✅ Endpoint working! (logged in)")
            data = response.json()
            print("📊 Analytics Data:")
            print(json.dumps(data, indent=2))
        elif response.status_code == 404:
            print("❌ 404 - Endpoint not found")
            print("💡 Check if the URL pattern is correctly configured")
        else:
            print(f"❓ Unexpected status: {response.status_code}")
            print("Response:", response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection refused - server not running on port 8006")
        print("💡 Make sure daphne is running: daphne -p 8006 backend.asgi:application")
    except Exception as e:
        print(f"❌ Error: {e}")

    print("\n=== Testing Basic API Endpoints ===")
    try:
        # Test a basic endpoint to see if Django is routing correctly
        response = requests.get("http://localhost:8006/api/auth/login/")
        print(f"Login endpoint status: {response.status_code}")
        
        if response.status_code in [200, 405]:  # 405 = Method Not Allowed (GET on POST endpoint)
            print("✅ Django API routing is working on port 8006")
        else:
            print("❌ Django API routing issue")
            
    except Exception as e:
        print(f"❌ Basic API test error: {e}")

if __name__ == "__main__":
    test_analytics_endpoint()