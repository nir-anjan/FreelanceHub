#!/usr/bin/env python3
"""Test script to check what data is returned by the chat thread API."""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_chat_thread_api():
    print("=== Testing Chat Thread API Response ===")
    
    # First, let's check if there are any threads
    try:
        response = requests.get(f"{BASE_URL}/api/chat/threads/")
        print(f"Threads list status: {response.status_code}")
        
        if response.status_code == 401:
            print("❌ Authentication required - need to login first")
            return
        
        threads = response.json()
        print(f"Number of threads: {len(threads.get('results', []))}")
        
        if threads.get('results'):
            # Get the first thread details
            first_thread = threads['results'][0]
            thread_id = first_thread['id']
            
            print(f"\nTesting thread ID: {thread_id}")
            
            # Get detailed thread info
            thread_response = requests.get(f"{BASE_URL}/api/chat/threads/{thread_id}/")
            print(f"Thread detail status: {thread_response.status_code}")
            
            if thread_response.status_code == 200:
                thread_data = thread_response.json()
                
                print("\n=== THREAD DATA STRUCTURE ===")
                print(f"Thread ID: {thread_data.get('id')}")
                print(f"Job data: {json.dumps(thread_data.get('job', {}), indent=2)}")
                print(f"Freelancer data: {json.dumps(thread_data.get('freelancer', {}), indent=2)}")
                
                # Check if job has the required fields
                job = thread_data.get('job', {})
                if job:
                    print(f"\n=== JOB FIELD ANALYSIS ===")
                    print(f"Job ID: {job.get('id')} (type: {type(job.get('id'))})")
                    print(f"Job Title: {job.get('title')}")
                    print(f"Budget Min: {job.get('budget_min')}")
                    print(f"Budget Max: {job.get('budget_max')}")
                    
                    if job.get('id') is None:
                        print("❌ Job ID is None - this is the problem!")
                    elif not isinstance(job.get('id'), (int, str)):
                        print(f"❌ Job ID type issue: {type(job.get('id'))}")
                    else:
                        print("✅ Job ID looks good")
                else:
                    print("❌ No job data in thread")
                    
            else:
                print(f"❌ Failed to get thread details: {thread_response.text}")
        else:
            print("No threads found to test")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_chat_thread_api()