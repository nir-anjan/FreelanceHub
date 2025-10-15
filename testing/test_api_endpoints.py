#!/usr/bin/env python3
"""
Simple API test for dispute endpoints
"""

import requests
import json

def test_dispute_api():
    """Test the dispute management API endpoints"""
    
    base_url = "http://127.0.0.1:8000/api"
    
    print("🧪 Testing Dispute Management API")
    print("=" * 40)
    
    try:
        # Test 1: Get disputes list (should work even without authentication for testing)
        print("\n1️⃣ Testing GET /api/admin/disputes/")
        response = requests.get(f"{base_url}/admin/disputes/")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("   ✅ Endpoint requires authentication (as expected)")
        elif response.status_code == 200:
            print("   ✅ Endpoint accessible")
            data = response.json()
            print(f"   Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
        elif response.status_code == 404:
            print("   ❌ Endpoint not found - URL routing issue")
        else:
            print(f"   ⚠️  Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
        
        # Test 2: Check if the URL is properly routed
        print("\n2️⃣ Testing Django URL routing")
        response = requests.get(f"{base_url}/")
        print(f"   Base API Status Code: {response.status_code}")
        
        # Test 3: Check specific dispute endpoint format
        print("\n3️⃣ Testing alternate URL formats")
        urls_to_test = [
            f"{base_url}/admin/disputes/",
            f"http://127.0.0.1:8000/api/admin/disputes/",
            f"http://localhost:8000/api/admin/disputes/",
        ]
        
        for url in urls_to_test:
            try:
                response = requests.get(url, timeout=5)
                print(f"   {url}: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"   {url}: Error - {e}")
        
        print("\n📊 Summary:")
        print("   - If you see 401 (Unauthorized), the endpoints are working but need authentication")
        print("   - If you see 404 (Not Found), there's a URL routing issue") 
        print("   - If you see connection errors, the Django server isn't running")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Django server")
        print("   Make sure Django server is running at http://127.0.0.1:8000/")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == '__main__':
    test_dispute_api()