#!/usr/bin/env python
"""
Test script to authenticate and test the dashboard endpoint
"""
import requests
import json

def test_dashboard_api():
    """Test the dashboard API endpoint with authentication"""
    base_url = "http://127.0.0.1:8000/api/auth"
    
    # First, try to login as the test user
    login_data = {
        "username": "tom",
        "password": "tom123"  # Trying common password pattern
    }
    
    print("=== Testing Dashboard API ===\n")
    print("1. Attempting to login...")
    
    try:
        # Login to get auth token
        login_response = requests.post(f"{base_url}/login/", json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            if login_result.get('success'):
                access_token = login_result['data']['access']
                print(f"✅ Login successful! Got access token.")
                
                # Make dashboard request with auth token
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                
                print("\n2. Requesting dashboard data...")
                dashboard_response = requests.get(f"{base_url}/dashboard/", headers=headers)
                
                if dashboard_response.status_code == 200:
                    dashboard_data = dashboard_response.json()
                    print("✅ Dashboard request successful!")
                    print("\nDashboard Response:")
                    print(json.dumps(dashboard_data, indent=2))
                    
                    # Verify the stats
                    if dashboard_data.get('success') and 'stats' in dashboard_data.get('data', {}):
                        stats = dashboard_data['data']['stats']
                        print(f"\n=== Statistics Verification ===")
                        print(f"total_jobs_posted: {stats.get('total_jobs_posted', 'N/A')}")
                        print(f"active_jobs: {stats.get('active_jobs', 'N/A')}")
                        print(f"completed_jobs: {stats.get('completed_jobs', 'N/A')}")
                        print(f"total_spent: {stats.get('total_spent', 'N/A')}")
                        
                        # Based on our test_dashboard_stats.py, we expect:
                        # total_jobs_posted = 1 (only open jobs)
                        # active_jobs = 0 (no in_progress jobs)
                        # completed_jobs = 0 (no completed jobs)
                        
                        if stats.get('total_jobs_posted') == 1:
                            print("✅ total_jobs_posted correctly shows only 'open' jobs")
                        else:
                            print("❌ total_jobs_posted not filtering correctly")
                            
                        if stats.get('active_jobs') == 0:
                            print("✅ active_jobs correctly shows only 'in_progress' jobs")
                        else:
                            print("❌ active_jobs not filtering correctly")
                            
                        if stats.get('completed_jobs') == 0:
                            print("✅ completed_jobs correctly shows only 'completed' jobs")
                        else:
                            print("❌ completed_jobs not filtering correctly")
                    
                else:
                    print(f"❌ Dashboard request failed: {dashboard_response.status_code}")
                    print(dashboard_response.text)
            else:
                print(f"❌ Login failed: {login_result.get('message', 'Unknown error')}")
        else:
            print(f"❌ Login request failed: {login_response.status_code}")
            try:
                error_data = login_response.json()
                print(f"Error: {error_data}")
            except:
                print(login_response.text)
                
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

if __name__ == '__main__':
    test_dashboard_api()