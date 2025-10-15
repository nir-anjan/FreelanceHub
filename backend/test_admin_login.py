#!/usr/bin/env python
"""
Test admin login API endpoint
"""
import requests
import json

def test_admin_login():
    """Test the admin login endpoint"""
    
    # API endpoint
    url = "http://localhost:8006/api/auth/admin/login/"
    
    # Test credentials
    credentials = [
        {"username": "admin", "password": "admin123"},
        {"username": "admin_test", "password": "admin123"},
        {"username": "admin_dispute_test", "password": "admin123"}
    ]
    
    print("=== Testing Admin Login API ===")
    print(f"Endpoint: {url}")
    
    for i, cred in enumerate(credentials, 1):
        print(f"\n--- Test {i}: {cred['username']} ---")
        
        try:
            response = requests.post(url, json=cred, timeout=10)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            try:
                response_data = response.json()
                print(f"Response JSON:")
                print(json.dumps(response_data, indent=2))
                
                if response.status_code == 200 and response_data.get('success'):
                    print(f"✅ LOGIN SUCCESS for {cred['username']}")
                    access_token = response_data.get('data', {}).get('access')
                    if access_token:
                        print(f"🔑 Access Token: {access_token[:50]}...")
                else:
                    print(f"❌ LOGIN FAILED for {cred['username']}")
                    
            except json.JSONDecodeError:
                print(f"Response Text: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ REQUEST ERROR: {e}")
            
        print("-" * 50)

if __name__ == '__main__':
    test_admin_login()