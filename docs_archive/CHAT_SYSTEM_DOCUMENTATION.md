# Real-time Chat System Documentation

## Overview

This document describes the implementation of a real-time chat system for the Freelance Marketplace using Django Channels and WebSockets. The system allows clients and freelancers to communicate in real-time with support for disputes and payments.

## Architecture

### Components

1. **Django Chat App** (`chat/`) - Separate Django app for chat functionality
2. **WebSocket Consumer** - Handles real-time communication
3. **REST API** - Traditional HTTP endpoints for chat operations
4. **Redis Channel Layer** - Message broker for WebSocket communications
5. **PostgreSQL** - Database storage for chat threads and messages

### Database Schema

#### New Tables (Enhanced Schema)

- `new_chat_threads` - Chat threads between clients and freelancers
- `new_chat_messages` - Individual messages within threads
- `new_message_reads` - Read receipts tracking

#### Key Features

- **Enhanced threading** with last message tracking
- **Message types** (text, system, payment, dispute, job updates)
- **Read receipts** and typing indicators
- **Metadata support** for rich message content

## API Endpoints

### Chat Threads

- `GET /api/chat/threads/` - List user's chat threads
- `POST /api/chat/threads/` - Create new chat thread
- `GET /api/chat/threads/{id}/` - Get specific thread details
- `PUT /api/chat/threads/{id}/` - Update thread settings
- `DELETE /api/chat/threads/{id}/` - Archive/delete thread
- `GET /api/chat/threads/by-participants/` - Get thread by participants

### Messages

- `GET /api/chat/threads/{thread_id}/messages/` - List messages in thread
- `POST /api/chat/threads/{thread_id}/messages/` - Send new message
- `GET /api/chat/messages/{id}/` - Get specific message
- `PUT /api/chat/messages/{id}/` - Edit message (marks as edited)
- `DELETE /api/chat/messages/{id}/` - Delete message
- `POST /api/chat/threads/{thread_id}/mark-read/` - Mark messages as read

### Integration Endpoints

- `POST /api/chat/threads/{thread_id}/create-dispute/` - Create dispute from chat
- `POST /api/chat/threads/{thread_id}/initiate-payment/` - Initiate payment from chat
- `POST /api/chat/threads/{thread_id}/job-update/` - Send job status update

### Utility Endpoints

- `GET /api/chat/unread-count/` - Get total unread message count

## WebSocket Integration

### Connection URL

```
ws://localhost:8000/ws/chat/{thread_id}/?token={jwt_token}
```

### Authentication

WebSocket connections are authenticated using JWT tokens passed as query parameters.

### Message Types

#### Outgoing (Client to Server)

```json
{
  "type": "chat_message",
  "message": "Hello world",
  "message_type": "text",
  "metadata": {}
}

{
  "type": "mark_messages_read",
  "message_ids": [1, 2, 3]
}

{
  "type": "typing_indicator",
  "is_typing": true
}
```

#### Incoming (Server to Client)

```json
{
  "type": "chat_message",
  "data": {
    "id": 1,
    "thread": 1,
    "sender": {"id": 1, "username": "client1"},
    "message": "Hello world",
    "message_type": "text",
    "sent_at": "2025-01-01T12:00:00Z",
    "metadata": {}
  }
}

{
  "type": "messages_read",
  "message_ids": [1, 2, 3],
  "reader": "freelancer1"
}

{
  "type": "typing_indicator",
  "user": "client1",
  "is_typing": true
}

{
  "type": "error",
  "message": "Error description"
}
```

## Frontend Integration

### React WebSocket Client Example

```javascript
class ChatWebSocket {
  constructor(threadId, token) {
    this.threadId = threadId;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const wsUrl = `ws://localhost:8000/ws/chat/${this.threadId}/?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("Connected to chat");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(
          () => this.connect(),
          1000 * Math.pow(2, this.reconnectAttempts)
        );
        this.reconnectAttempts++;
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  sendMessage(message, messageType = "text", metadata = null) {
    if (this.isConnected()) {
      this.ws.send(
        JSON.stringify({
          type: "chat_message",
          message,
          message_type: messageType,
          metadata,
        })
      );
    }
  }

  markMessagesRead(messageIds) {
    if (this.isConnected()) {
      this.ws.send(
        JSON.stringify({
          type: "mark_messages_read",
          message_ids: messageIds,
        })
      );
    }
  }

  sendTypingIndicator(isTyping) {
    if (this.isConnected()) {
      this.ws.send(
        JSON.stringify({
          type: "typing_indicator",
          is_typing: isTyping,
        })
      );
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case "chat_message":
        this.onNewMessage(data.data);
        break;
      case "messages_read":
        this.onMessagesRead(data.message_ids, data.reader);
        break;
      case "typing_indicator":
        this.onTypingIndicator(data.user, data.is_typing);
        break;
      case "error":
        this.onError(data.message);
        break;
    }
  }

  // Override these methods in your implementation
  onNewMessage(message) {}
  onMessagesRead(messageIds, reader) {}
  onTypingIndicator(user, isTyping) {}
  onError(error) {}
}
```

### Usage in React Component

```javascript
import React, { useState, useEffect, useRef } from "react";

const ChatWindow = ({ threadId, currentUser, token }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = new ChatWebSocket(threadId, token);

    wsRef.current.onNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    wsRef.current.onTypingIndicator = (user, typing) => {
      setIsTyping(typing && user !== currentUser.username);
    };

    wsRef.current.connect();

    return () => {
      wsRef.current?.disconnect();
    };
  }, [threadId, token]);

  const handleSendMessage = () => {
    if (newMessage.trim() && wsRef.current) {
      wsRef.current.sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleTyping = () => {
    if (wsRef.current) {
      wsRef.current.sendTypingIndicator(true);
      setTimeout(() => wsRef.current.sendTypingIndicator(false), 1000);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <strong>{message.sender.username}:</strong>
            <span>{message.message}</span>
            <small>{new Date(message.sent_at).toLocaleTimeString()}</small>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">Someone is typing...</div>
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
            else handleTyping();
          }}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};
```

## Security Considerations

### Authentication

- JWT tokens required for WebSocket connections
- Thread participant validation
- User authorization checks

### Data Validation

- Message content sanitization
- Input validation on all endpoints
- Rate limiting recommended

### Privacy

- Users can only access threads they participate in
- Message history restricted to participants
- Read receipts only shared between participants

## Deployment

### Prerequisites

1. Redis server running on localhost:6379
2. PostgreSQL database with migrations applied
3. Django Channels configured

### Environment Setup

```bash
# Install dependencies
pip install channels channels-redis

# Apply migrations
python manage.py migrate

# Start Redis (system dependent)
redis-server

# Run Django with ASGI
python manage.py runserver
```

### Production Considerations

- Use production Redis instance
- Configure proper WebSocket load balancing
- Set up SSL/TLS for WebSocket connections
- Implement rate limiting and abuse prevention

## Testing

### Run Test Script

```bash
python test_chat_system.py
```

### Manual Testing

1. Create users and profiles
2. Test thread creation via API
3. Test WebSocket connection
4. Test message sending/receiving
5. Test dispute and payment integration

## Troubleshooting

### Common Issues

1. **WebSocket connection fails**

   - Check Redis is running
   - Verify JWT token is valid
   - Ensure user is thread participant

2. **Messages not saving**

   - Check database connection
   - Verify migrations are applied
   - Check model field constraints

3. **Channel layer errors**
   - Verify Redis connection
   - Check CHANNEL_LAYERS configuration
   - Ensure channels and channels-redis are installed

### Debug Commands

```bash
# Check Django configuration
python manage.py check

# Test channel layer
python manage.py shell
>>> from channels.layers import get_channel_layer
>>> channel_layer = get_channel_layer()
>>> print(channel_layer)

# Check Redis connection
redis-cli ping
```

## Future Enhancements

1. **File Uploads** - Support for file sharing in chat
2. **Message Reactions** - Emoji reactions to messages
3. **Thread Archives** - Archive old conversations
4. **Admin Moderation** - Admin tools for managing chats
5. **Mobile Push Notifications** - Real-time notifications
6. **Voice Messages** - Audio message support
7. **Chat Bots** - Automated responses and assistance

## API Response Examples

### Get Thread List

```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "client": {
        "id": 1,
        "user": { "id": 1, "username": "client1" },
        "company_name": "Test Company"
      },
      "freelancer": {
        "id": 1,
        "user": { "id": 2, "username": "freelancer1" },
        "title": "Web Developer",
        "rate": "50.00"
      },
      "job": 1,
      "created_at": "2025-01-01T12:00:00Z",
      "last_message_at": "2025-01-01T12:30:00Z",
      "is_active": true,
      "last_message": {
        "id": 5,
        "message": "Latest message",
        "sent_at": "2025-01-01T12:30:00Z"
      },
      "unread_count": 2
    }
  ]
}
```

### Send Message

```json
{
  "id": 6,
  "thread": 1,
  "sender": {
    "id": 1,
    "username": "client1"
  },
  "message": "Hello freelancer!",
  "message_type": "text",
  "sent_at": "2025-01-01T12:31:00Z",
  "is_read": false,
  "metadata": null
}
```
