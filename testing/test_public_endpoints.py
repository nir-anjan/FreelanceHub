#!/usr/bin/env python3
"""
Test script for the new public listings endpoints
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_endpoint(endpoint, description):
    """Test a single endpoint"""
    print(f"\n🔍 Testing {description}")
    print(f"📍 Endpoint: {endpoint}")
    
    try:
        response = requests.get(endpoint, timeout=10)
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📦 Response Structure:")
            print(f"   - Success: {data.get('success', 'N/A')}")
            print(f"   - Message: {data.get('message', 'N/A')}")
            
            if 'data' in data:
                data_obj = data['data']
                if 'jobs' in data_obj:
                    jobs = data_obj['jobs']
                    pagination = data_obj.get('pagination', {})
                    print(f"   - Jobs Count: {len(jobs)}")
                    print(f"   - Total Count: {pagination.get('total_count', 'N/A')}")
                    print(f"   - Current Page: {pagination.get('current_page', 'N/A')}")
                    print(f"   - Total Pages: {pagination.get('total_pages', 'N/A')}")
                    
                    if jobs:
                        job = jobs[0]
                        print(f"   - First Job: '{job.get('title', 'N/A')}' by {job.get('client_name', 'N/A')}")
                        print(f"     Budget: ${job.get('budget_min', 0)}-${job.get('budget_max', 0)}")
                        print(f"     Skills: {job.get('skills_list', [])}")
                
                elif 'freelancers' in data_obj:
                    freelancers = data_obj['freelancers']
                    pagination = data_obj.get('pagination', {})
                    print(f"   - Freelancers Count: {len(freelancers)}")
                    print(f"   - Total Count: {pagination.get('total_count', 'N/A')}")
                    print(f"   - Current Page: {pagination.get('current_page', 'N/A')}")
                    print(f"   - Total Pages: {pagination.get('total_pages', 'N/A')}")
                    
                    if freelancers:
                        freelancer = freelancers[0]
                        print(f"   - First Freelancer: '{freelancer.get('name', 'N/A')}' ({freelancer.get('username', 'N/A')})")
                        print(f"     Title: {freelancer.get('title', 'N/A')}")
                        print(f"     Rate: ${freelancer.get('rate', 0)}/hr")
                        print(f"     Skills: {freelancer.get('skills_list', [])}")
            
        else:
            print(f"❌ Error Response: {response.text[:500]}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Django server not running on localhost:8000")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
        return False
    
    return response.status_code == 200

def test_with_filters():
    """Test endpoints with various filters"""
    print("\n🔧 Testing filters...")
    
    # Test job filters
    filters = [
        ("category", "Web Development"),
        ("skills", "Python"),
        ("min_budget", "1000"),
        ("max_budget", "5000"),
        ("page_size", "5"),
    ]
    
    for filter_name, filter_value in filters:
        endpoint = f"{BASE_URL}/auth/jobs/?{filter_name}={filter_value}"
        print(f"\n📋 Testing filter: {filter_name}={filter_value}")
        response = requests.get(endpoint)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get('data', {}).get('jobs', []))
            print(f"✅ Found {count} jobs with filter")
        else:
            print(f"❌ Filter failed: {response.status_code}")

def main():
    print("🚦 Starting API Endpoint Tests")
    print("=" * 50)
    
    # Test basic endpoints
    jobs_success = test_endpoint(f"{BASE_URL}/auth/jobs/", "All Jobs Endpoint")
    freelancers_success = test_endpoint(f"{BASE_URL}/auth/freelancers/", "All Freelancers Endpoint")
    
    if jobs_success and freelancers_success:
        # Test with filters
        test_with_filters()
        
        print("\n" + "=" * 50)
        print("✅ All tests completed successfully!")
        print("🎉 Frontend components should now be able to load data from these endpoints.")
    else:
        print("\n" + "=" * 50)
        print("❌ Some tests failed. Check Django server and database.")
        sys.exit(1)

if __name__ == "__main__":
    main()