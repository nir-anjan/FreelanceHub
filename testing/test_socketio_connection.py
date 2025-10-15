#!/usr/bin/env python
"""
Simple Socket.IO client test to verify server connectivity
"""
import asyncio
import socketio
import json

async def test_socketio_connection():
    # Create Socket.IO client
    sio = socketio.AsyncClient()
    
    # Test token (using testfreelancer token from earlier)
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOCwidXNlcm5hbWUiOiJ0ZXN0ZnJlZWxhbmNlciIsImVtYWlsIjoiZnJlZWxhbmNlckB0ZXN0LmNvbSIsImZpcnN0X25hbWUiOiIiLCJsYXN0X25hbWUiOiIiLCJleHAiOjE3NjA0NDA4NzYsImlhdCI6MTc2MDM1NDQ3Nn0.xkDjQavxj1uk1iS8pELiM-lET1YdPZXaAUVx6KfSuDg"
    
    @sio.event
    async def connect():
        print("✅ Connected to Socket.IO server!")
        print("Session ID:", sio.sid)
        
        # Try to join a thread
        await sio.emit('join_thread', {'thread_id': 1})
    
    @sio.event
    async def connection_confirmed(data):
        print("🎉 Connection confirmed:", data)
    
    @sio.event
    async def thread_joined(data):
        print("🏠 Thread joined:", data)
        
        # Send a test message
        await sio.emit('send_message', {
            'thread_id': 1,
            'content': 'Test message from Python client!',
            'type': 'text'
        })
    
    @sio.event
    async def new_message(data):
        print("📨 New message:", data)
    
    @sio.event
    async def error(data):
        print("❌ Error:", data)
    
    @sio.event
    async def disconnect():
        print("🔌 Disconnected from server")
    
    @sio.event
    async def connect_error(data):
        print("💥 Connection error:", data)
    
    try:
        print("🚀 Connecting to Socket.IO server...")
        await sio.connect('http://localhost:8006', auth={'token': token})
        
        # Wait a bit to see activity
        await asyncio.sleep(5)
        
        print("🔄 Disconnecting...")
        await sio.disconnect()
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == '__main__':
    asyncio.run(test_socketio_connection())