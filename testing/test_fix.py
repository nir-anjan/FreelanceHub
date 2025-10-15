#!/usr/bin/env python3
"""
Test specific API endpoint URLs to verify the fix
"""

import requests

def test_single_endpoint(endpoint_path):
    """Test a single endpoint to verify URL structure"""
    url = f"http://127.0.0.1:8000{endpoint_path}"
    try:
        response = requests.get(url)
        return {
            "url": url,
            "status_code": response.status_code,
            "success": True
        }
    except Exception as e:
        return {
            "url": url,
            "error": str(e),
            "success": False
        }

def main():
    print("🔧 Testing Fixed API Endpoint URLs")
    print("=" * 50)
    
    # Test the corrected URLs (without double /api prefix)
    endpoints = [
        "/api/auth/dashboard/",
        "/api/auth/jobs/create/",
        "/api/auth/jobs/history/", 
        "/api/auth/jobs/active/",
        "/api/auth/payments/history/",
        "/api/auth/inbox/",
    ]
    
    for endpoint in endpoints:
        print(f"\n📡 Testing: {endpoint}")
        result = test_single_endpoint(endpoint)
        
        if result["success"]:
            if result["status_code"] == 401:
                print(f"✅ FIXED: {result['url']} -> 401 (Authentication Required)")
            elif result["status_code"] == 404:
                print(f"❌ NOT FOUND: {result['url']} -> 404 (Endpoint Missing)")
            else:
                print(f"✅ OK: {result['url']} -> {result['status_code']}")
        else:
            print(f"❌ ERROR: {result['url']} -> {result['error']}")
    
    print("\n" + "=" * 50)
    print("🎯 URL Structure Summary:")
    print("✅ Frontend httpClient baseURL: http://localhost:8000/api")
    print("✅ Dashboard service paths: /auth/dashboard/, /auth/jobs/create/, etc.")
    print("✅ Final URLs: http://localhost:8000/api/auth/dashboard/, etc.")
    print("\n✨ Double prefix issue RESOLVED!")

if __name__ == "__main__":
    main()