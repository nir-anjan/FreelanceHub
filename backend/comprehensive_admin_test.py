#!/usr/bin/env python
"""
Simple admin login test - start server and test in one script
"""
import subprocess
import time
import requests
import json
import sys
import os

def test_server_and_login():
    """Start Django server and test admin login"""
    
    # Server configuration
    backend_dir = r"D:\projects_that_matters\FreelanceMarketplace\backend"
    python_exe = r"D:/projects_that_matters/FreelanceMarketplace/env/Scripts/python.exe"
    manage_py = os.path.join(backend_dir, "manage.py")
    
    print("=== Starting Django Server ===")
    
    # Start Django server in background
    server_process = None
    try:
        server_process = subprocess.Popen(
            [python_exe, manage_py, "runserver", "127.0.0.1:8006"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print("🚀 Django server starting...")
        time.sleep(5)  # Give server time to start
        
        # Check if server is running
        if server_process.poll() is None:
            print("✅ Server is running!")
            
            # Test admin login
            print("\n=== Testing Admin Login ===")
            
            url = "http://127.0.0.1:8006/api/auth/admin/login/"
            credentials = {"username": "admin", "password": "admin123"}
            
            try:
                response = requests.post(url, json=credentials, timeout=10)
                
                print(f"📡 Request URL: {url}")
                print(f"📤 Request Data: {credentials}")
                print(f"📊 Status Code: {response.status_code}")
                print(f"📋 Response Headers: {dict(response.headers)}")
                
                try:
                    response_data = response.json()
                    print(f"📄 Response JSON:")
                    print(json.dumps(response_data, indent=2))
                    
                    if response.status_code == 200 and response_data.get('success'):
                        print("\n🎉 ADMIN LOGIN SUCCESS!")
                        access_token = response_data.get('data', {}).get('access')
                        if access_token:
                            print(f"🔑 Access Token: {access_token[:50]}...")
                            
                        # Test a protected admin endpoint
                        print("\n=== Testing Protected Admin Endpoint ===")
                        admin_url = "http://127.0.0.1:8006/api/auth/admin/overview/"
                        headers = {"Authorization": f"Bearer {access_token}"}
                        
                        admin_response = requests.get(admin_url, headers=headers, timeout=10)
                        print(f"📊 Admin Overview Status: {admin_response.status_code}")
                        
                        if admin_response.status_code == 200:
                            admin_data = admin_response.json()
                            print("✅ Admin Overview Success!")
                            if 'data' in admin_data and 'stats' in admin_data['data']:
                                stats = admin_data['data']['stats']
                                print(f"📈 Stats: Users={stats.get('total_users')}, Jobs={stats.get('pending_jobs')}, Disputes={stats.get('open_disputes')}")
                        else:
                            print(f"❌ Admin Overview Failed: {admin_response.text}")
                            
                    else:
                        print("❌ ADMIN LOGIN FAILED!")
                        
                except json.JSONDecodeError:
                    print(f"📄 Response Text: {response.text}")
                    
            except requests.exceptions.RequestException as e:
                print(f"❌ REQUEST ERROR: {e}")
                
        else:
            print("❌ Server failed to start!")
            stdout, stderr = server_process.communicate()
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        
    finally:
        # Clean up server process
        if server_process and server_process.poll() is None:
            print("\n🛑 Stopping server...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()

if __name__ == '__main__':
    test_server_and_login()