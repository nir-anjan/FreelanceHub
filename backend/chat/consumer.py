import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import ChatThread, ChatMessage
from .serializers import ChatMessageSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat functionality"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.thread_id = self.scope['url_route']['kwargs']['thread_id']
        self.room_group_name = f'chat_{self.thread_id}'
        self.user = None
        
        # Authenticate user from query string token
        await self.authenticate_user()
        
        if not self.user:
            logger.warning(f"Authentication failed for thread {self.thread_id}")
            await self.close()
            return
        
        # Check if user is participant in this thread
        if not await self.is_thread_participant():
            logger.warning(f"User {self.user.username} not authorized for thread {self.thread_id}")
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"User {self.user.username} connected to thread {self.thread_id}")
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to chat thread',
            'thread_id': self.thread_id,
            'user': self.user.username
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            if self.user:
                logger.info(f"User {self.user.username} disconnected from thread {self.thread_id}")
    
    async def receive(self, text_data):
        """Handle messages from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'chat_message')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'mark_messages_read':
                await self.handle_mark_messages_read(data)
            elif message_type == 'typing_indicator':
                await self.handle_typing_indicator(data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await self.send_error("Invalid JSON format")
        except Exception as e:
            logger.error(f"Error handling message: {str(e)}")
            await self.send_error("Failed to process message")
    
    async def handle_chat_message(self, data):
        """Handle incoming chat messages"""
        message_content = data.get('message', '').strip()
        message_type = data.get('message_type', 'text')
        metadata = data.get('metadata', None)
        
        if not message_content:
            await self.send_error("Message cannot be empty")
            return
        
        # Save message to database
        message = await self.save_message(message_content, message_type, metadata)
        
        if message:
            # Serialize message for broadcasting
            message_data = await self.serialize_message(message)
            
            # Broadcast to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_broadcast',
                    'message_data': message_data
                }
            )
    
    async def handle_mark_messages_read(self, data):
        """Handle marking messages as read"""
        message_ids = data.get('message_ids', [])
        if message_ids:
            await self.mark_messages_as_read(message_ids)
            
            # Notify other participants about read status
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'messages_read_broadcast',
                    'message_ids': message_ids,
                    'reader': self.user.username
                }
            )
    
    async def handle_typing_indicator(self, data):
        """Handle typing indicators"""
        is_typing = data.get('is_typing', False)
        
        # Broadcast typing status to other participants
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator_broadcast',
                'user': self.user.username,
                'is_typing': is_typing
            }
        )
    
    async def chat_message_broadcast(self, event):
        """Broadcast chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'data': event['message_data']
        }))
    
    async def messages_read_broadcast(self, event):
        """Broadcast message read status to WebSocket"""
        # Don't send read receipts back to the reader
        if event['reader'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'messages_read',
                'message_ids': event['message_ids'],
                'reader': event['reader']
            }))
    
    async def typing_indicator_broadcast(self, event):
        """Broadcast typing indicator to WebSocket"""
        # Don't send typing indicators back to the typer
        if event['user'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'user': event['user'],
                'is_typing': event['is_typing']
            }))
    
    async def send_error(self, message):
        """Send error message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))
    
    async def authenticate_user(self):
        """Authenticate user from query string token"""
        try:
            # Get token from query string
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            
            if not token:
                return
            
            # Validate JWT token
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                self.user = await self.get_user_by_id(user_id)
            except (InvalidToken, TokenError, KeyError):
                logger.warning(f"Invalid token for thread {self.thread_id}")
                return
                
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
    
    @database_sync_to_async
    def get_user_by_id(self, user_id):
        """Get user by ID from database"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def is_thread_participant(self):
        """Check if current user is a participant in the thread"""
        try:
            thread = ChatThread.objects.get(id=self.thread_id)
            return thread.is_participant(self.user)
        except ChatThread.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, message_content, message_type, metadata):
        """Save message to database"""
        try:
            thread = ChatThread.objects.get(id=self.thread_id)
            message = ChatMessage.objects.create(
                thread=thread,
                sender=self.user,
                message=message_content,
                message_type=message_type,
                metadata=metadata
            )
            return message
        except ChatThread.DoesNotExist:
            logger.error(f"Thread {self.thread_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            return None
    
    @database_sync_to_async
    def serialize_message(self, message):
        """Serialize message for JSON response"""
        try:
            serializer = ChatMessageSerializer(message)
            return serializer.data
        except Exception as e:
            logger.error(f"Error serializing message: {str(e)}")
            return None
    
    @database_sync_to_async
    def mark_messages_as_read(self, message_ids):
        """Mark specified messages as read"""
        try:
            ChatMessage.objects.filter(
                id__in=message_ids,
                thread_id=self.thread_id
            ).exclude(
                sender=self.user  # Don't mark own messages as read
            ).update(is_read=True)
        except Exception as e:
            logger.error(f"Error marking messages as read: {str(e)}")