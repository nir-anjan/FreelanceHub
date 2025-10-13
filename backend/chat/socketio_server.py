import socketio
import asyncio
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.utils import timezone
import json
import os
import django

# Setup Django before importing models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from .models import ChatThread, ChatMessage

User = get_user_model()

# Create Socket.IO server with Redis adapter
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode='asgi',
    logger=True,
    engineio_logger=True
)

@sync_to_async
def get_user_from_token(token):
    """Decode JWT token and get user"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if user_id:
            return User.objects.get(id=user_id)
        return None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
        return None

@sync_to_async
def get_thread_by_id(thread_id):
    """Get chat thread by ID"""
    try:
        return ChatThread.objects.get(id=thread_id)
    except ChatThread.DoesNotExist:
        return None

@sync_to_async
def save_message(thread, user, content, message_type='text'):
    """Save message to database"""
    message = ChatMessage.objects.create(
        thread=thread,
        sender=user,
        content=content,
        message_type=message_type,
        timestamp=timezone.now()
    )
    return message

@sync_to_async
def mark_messages_as_read(thread, user):
    """Mark messages as read for user"""
    messages = ChatMessage.objects.filter(
        thread=thread,
        is_read=False
    ).exclude(sender=user)
    messages.update(is_read=True)
    return messages.count()

@sync_to_async
def get_thread_messages(thread, limit=50):
    """Get thread messages"""
    messages = ChatMessage.objects.filter(thread=thread).order_by('-timestamp')[:limit]
    return [
        {
            'id': msg.id,
            'content': msg.content,
            'sender': {
                'id': msg.sender.id,
                'username': msg.sender.username,
                'first_name': msg.sender.first_name,
                'last_name': msg.sender.last_name,
            },
            'timestamp': msg.timestamp.isoformat(),
            'message_type': msg.message_type,
            'is_read': msg.is_read
        }
        for msg in reversed(messages)
    ]

@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    try:
        # Get token from auth data
        token = auth.get('token') if auth else None
        if not token:
            print(f"Connection rejected for {sid}: No token provided")
            return False
        
        # Authenticate user
        user = await get_user_from_token(token)
        if not user:
            print(f"Connection rejected for {sid}: Invalid token")
            return False
        
        # Store user data in session
        await sio.save_session(sid, {
            'user_id': user.id,
            'username': user.username,
            'authenticated': True
        })
        
        print(f"User {user.username} connected with session {sid}")
        
        # Send connection confirmation
        await sio.emit('connection_confirmed', {
            'status': 'connected',
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, room=sid)
        
        return True
        
    except Exception as e:
        print(f"Connection error for {sid}: {str(e)}")
        return False

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    try:
        session = await sio.get_session(sid)
        username = session.get('username', 'Unknown')
        print(f"User {username} disconnected from session {sid}")
        
        # Leave all rooms
        rooms = sio.manager.get_rooms(sid)
        for room in rooms:
            if room != sid:  # Don't leave own room
                await sio.leave_room(sid, room)
                
    except Exception as e:
        print(f"Disconnect error for {sid}: {str(e)}")

@sio.event
async def join_thread(sid, data):
    """Join a chat thread room"""
    try:
        session = await sio.get_session(sid)
        if not session.get('authenticated'):
            await sio.emit('error', {'message': 'Not authenticated'}, room=sid)
            return
        
        thread_id = data.get('thread_id')
        if not thread_id:
            await sio.emit('error', {'message': 'Thread ID required'}, room=sid)
            return
        
        # Verify thread exists
        thread = await get_thread_by_id(thread_id)
        if not thread:
            await sio.emit('error', {'message': 'Thread not found'}, room=sid)
            return
        
        # Join the room
        room_name = f"thread_{thread_id}"
        await sio.enter_room(sid, room_name)
        
        # Get and send thread messages
        messages = await get_thread_messages(thread)
        
        await sio.emit('thread_joined', {
            'thread_id': thread_id,
            'messages': messages
        }, room=sid)
        
        # Notify others in the room
        await sio.emit('user_joined', {
            'user': session.get('username'),
            'thread_id': thread_id
        }, room=room_name, skip_sid=sid)
        
        print(f"User {session.get('username')} joined thread {thread_id}")
        
    except Exception as e:
        print(f"Join thread error for {sid}: {str(e)}")
        await sio.emit('error', {'message': 'Failed to join thread'}, room=sid)

@sio.event
async def leave_thread(sid, data):
    """Leave a chat thread room"""
    try:
        session = await sio.get_session(sid)
        if not session.get('authenticated'):
            return
        
        thread_id = data.get('thread_id')
        if not thread_id:
            return
        
        room_name = f"thread_{thread_id}"
        await sio.leave_room(sid, room_name)
        
        # Notify others in the room
        await sio.emit('user_left', {
            'user': session.get('username'),
            'thread_id': thread_id
        }, room=room_name)
        
        print(f"User {session.get('username')} left thread {thread_id}")
        
    except Exception as e:
        print(f"Leave thread error for {sid}: {str(e)}")

@sio.event
async def send_message(sid, data):
    """Send a message to a thread"""
    try:
        session = await sio.get_session(sid)
        if not session.get('authenticated'):
            await sio.emit('error', {'message': 'Not authenticated'}, room=sid)
            return
        
        thread_id = data.get('thread_id')
        content = data.get('content')
        message_type = data.get('type', 'text')
        
        if not thread_id or not content:
            await sio.emit('error', {'message': 'Thread ID and content required'}, room=sid)
            return
        
        # Get thread and user
        thread = await get_thread_by_id(thread_id)
        user = await sync_to_async(User.objects.get)(id=session['user_id'])
        
        if not thread:
            await sio.emit('error', {'message': 'Thread not found'}, room=sid)
            return
        
        # Save message
        message = await save_message(thread, user, content, message_type)
        
        # Prepare message data
        message_data = {
            'id': message.id,
            'thread_id': thread_id,
            'content': content,
            'sender': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'timestamp': message.timestamp.isoformat(),
            'message_type': message_type,
            'is_read': False
        }
        
        # Send to all users in the thread room
        room_name = f"thread_{thread_id}"
        await sio.emit('new_message', message_data, room=room_name)
        
        print(f"Message sent to thread {thread_id} by {user.username}")
        
    except Exception as e:
        print(f"Send message error for {sid}: {str(e)}")
        await sio.emit('error', {'message': 'Failed to send message'}, room=sid)

@sio.event
async def typing_start(sid, data):
    """Handle typing start event"""
    try:
        session = await sio.get_session(sid)
        if not session.get('authenticated'):
            return
        
        thread_id = data.get('thread_id')
        if not thread_id:
            return
        
        room_name = f"thread_{thread_id}"
        await sio.emit('typing_start', {
            'user': session.get('username'),
            'thread_id': thread_id
        }, room=room_name, skip_sid=sid)
        
    except Exception as e:
        print(f"Typing start error for {sid}: {str(e)}")

@sio.event
async def typing_stop(sid, data):
    """Handle typing stop event"""
    try:
        session = await sio.get_session(sid)
        if not session.get('authenticated'):
            return
        
        thread_id = data.get('thread_id')
        if not thread_id:
            return
        
        room_name = f"thread_{thread_id}"
        await sio.emit('typing_stop', {
            'user': session.get('username'),
            'thread_id': thread_id
        }, room=room_name, skip_sid=sid)
        
    except Exception as e:
        print(f"Typing stop error for {sid}: {str(e)}")

@sio.event
async def mark_as_read(sid, data):
    """Mark messages as read"""
    try:
        session = await sio.get_session(sid)
        if not session.get('authenticated'):
            return
        
        thread_id = data.get('thread_id')
        if not thread_id:
            return
        
        thread = await get_thread_by_id(thread_id)
        user = await sync_to_async(User.objects.get)(id=session['user_id'])
        
        if not thread:
            return
        
        # Mark messages as read
        count = await mark_messages_as_read(thread, user)
        
        if count > 0:
            room_name = f"thread_{thread_id}"
            await sio.emit('messages_read', {
                'user': session.get('username'),
                'thread_id': thread_id,
                'count': count
            }, room=room_name)
        
    except Exception as e:
        print(f"Mark as read error for {sid}: {str(e)}")

# Create ASGI application
app = socketio.ASGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})