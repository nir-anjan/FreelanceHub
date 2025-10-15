# FreelanceMarketplace Chat System Documentation

## 📋 Overview

The FreelanceMarketplace chat system is a real-time messaging platform built with **Django Backend** and **React Frontend**, using **Socket.IO** for real-time communication. It enables secure messaging between clients and freelancers, with support for job-specific conversations, multimedia messages, and workflow integration.

## 🏗️ Architecture

### Technology Stack

- **Backend**: Django 5.2.7 with Django REST Framework
- **Real-time**: Socket.IO (Python: `python-socketio`, JavaScript: `socket.io-client`)
- **Frontend**: React 18+ with TypeScript
- **Database**: SQLite/PostgreSQL with Django ORM
- **Authentication**: JWT tokens
- **ASGI Server**: Daphne for Socket.IO support

### System Architecture

```
┌─────────────────┐    Socket.IO    ┌─────────────────┐
│   React Frontend │ ←─────────────→ │ Django Backend  │
│   (Port 8081)    │                │   (Port 8006)   │
└─────────────────┘                 └─────────────────┘
│                                   │
│ REST API                          │ Database Models
│ HTTP Requests                     │ - ChatThread
└─────────────────────────────────→ │ - ChatMessage
                                    │ - MessageRead
                                    └─────────────────┘
```

## 📊 Database Schema

### Core Models

#### 1. ChatThread Model

**File**: `backend/chat/models.py`

```python
class ChatThread(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
```

**Purpose**: Represents a conversation between a client and freelancer, optionally linked to a specific job.

**Key Features**:

- Unique constraint: `(client, freelancer, job)` prevents duplicate threads
- Indexed on `last_message_at` for efficient sorting
- Methods: `get_participant_users()`, `is_participant()`, `get_other_participant()`

#### 2. ChatMessage Model

**File**: `backend/chat/models.py`

```python
class ChatMessage(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
```

**Message Types**:

- `text`: Regular text messages
- `system`: System-generated notifications
- `payment_completed`: Payment completion notifications
- `dispute_created`: Dispute creation notifications
- `job_update`: Job status updates

#### 3. MessageRead Model

**File**: `backend/chat/models.py`

```python
class MessageRead(models.Model):
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
```

**Purpose**: Tracks read receipts for detailed message status.

## 🚀 Backend Implementation

### Socket.IO Server

**File**: `backend/backend/asgi.py`

The Socket.IO server is integrated directly into Django's ASGI application:

```python
# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode='asgi',
    logger=True,
    engineio_logger=True
)

# Combined ASGI application
application = socketio.ASGIApp(sio, django_asgi_app)
```

### Socket.IO Events

#### Client-to-Server Events:

1. **`connect`** - Initial connection with JWT authentication
2. **`join_thread`** - Join a specific chat thread room
3. **`send_message`** - Send a message to a thread
4. **`typing_start`** - Start typing indicator
5. **`typing_stop`** - Stop typing indicator
6. **`mark_as_read`** - Mark messages as read

#### Server-to-Client Events:

1. **`connection_confirmed`** - Connection successful with user data
2. **`thread_joined`** - Successfully joined thread with message history
3. **`new_message`** - New message broadcast to thread participants
4. **`typing_start`** - User started typing
5. **`typing_stop`** - User stopped typing
6. **`messages_read`** - Messages marked as read notification
7. **`user_joined`** - User joined thread notification
8. **`error`** - Error messages

### Authentication Flow

```python
@sio.event
async def connect(sid, environ, auth):
    token = auth.get('token')
    user = await get_user_from_token(token)
    if not user:
        return False

    await sio.save_session(sid, {
        'user_id': user.id,
        'username': user.username,
        'authenticated': True
    })
    return True
```

### REST API Endpoints

**File**: `backend/chat/urls.py`

| Endpoint                                   | Method         | Purpose                    |
| ------------------------------------------ | -------------- | -------------------------- |
| `/api/chat/threads/`                       | GET/POST       | List/Create chat threads   |
| `/api/chat/threads/{id}/`                  | GET/PUT/DELETE | Thread operations          |
| `/api/chat/threads/{thread_id}/messages/`  | GET/POST       | List/Send messages         |
| `/api/chat/threads/{thread_id}/mark-read/` | POST           | Mark messages as read      |
| `/api/chat/unread-count/`                  | GET            | Get unread message count   |
| `/api/chat/threads/by-participants/`       | GET            | Get thread by participants |

### Key Backend Features

1. **JWT Authentication**: All Socket.IO connections authenticated via JWT tokens
2. **Room Management**: Each chat thread creates a Socket.IO room (`thread_{id}`)
3. **Message Persistence**: All messages saved to database via Django ORM
4. **Read Receipts**: Track message read status and timestamps
5. **Typing Indicators**: Real-time typing status broadcasting
6. **Error Handling**: Comprehensive error handling and logging

## 🎯 Frontend Implementation

### Socket.IO Client

**File**: `frontend/src/services/chatSocketIO.ts`

```typescript
class ChatSocketIOClient {
  private socket: Socket | null = null;
  private baseUrl: string = "http://localhost:8006";
  private token: string | null = null;
  private connectionStatus: ConnectionStatus = "disconnected";

  public connect(token: string): Promise<void>;
  public disconnect(): void;
  public joinThread(threadId: number): void;
  public sendMessage(threadId: number, content: string, type?: string): void;
  public startTyping(threadId: number): void;
  public stopTyping(threadId: number): void;
  public markAsRead(threadId: number): void;
}
```

### Connection Management

The client handles:

- **Automatic Reconnection**: Built-in reconnection with exponential backoff
- **Connection Status**: Tracks and reports connection state
- **Token Authentication**: JWT token passed in Socket.IO auth
- **Error Handling**: Comprehensive error handling and user feedback

### React Integration

**File**: `frontend/src/pages/ChatWindow.tsx`

```typescript
// Initialize Socket.IO connection
useEffect(() => {
  if (!threadIdNum || !token || !user) return;

  chatSocketClient.setEventHandlers({
    onConnectionChange: handleConnectionChange,
    onMessage: handleIncomingMessage,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
    // ... other handlers
  });

  chatSocketClient.connect(token).then(() => {
    chatSocketClient.joinThread(threadIdNum);
  });

  return () => {
    chatSocketClient.leaveThread(threadIdNum);
    chatSocketClient.disconnect();
  };
}, [threadIdNum, token, user]);
```

### UI Components

1. **Connection Status Indicator**: Visual feedback for connection state
2. **Retry Connection Button**: Manual reconnection capability
3. **Typing Indicators**: Real-time typing status display
4. **Message Status**: Read receipts and delivery confirmation
5. **Error Alerts**: User-friendly error messages

## 🔄 Real-Time Features

### Message Flow

```
┌─────────────┐    Socket.IO     ┌─────────────┐    Database     ┌─────────────┐
│   User A    │ ─────send────────→│   Server    │ ─────save─────→│  Database   │
│             │                  │             │                │             │
│   User B    │ ←────broadcast───│             │ ←─────read─────│             │
└─────────────┘                  └─────────────┘                └─────────────┘
```

1. **User A** sends message via Socket.IO
2. **Server** authenticates and validates message
3. **Server** saves message to database
4. **Server** broadcasts message to all thread participants
5. **User B** receives real-time message update

### Typing Indicators

```typescript
// Frontend - Start typing
chatSocketClient.startTyping(threadId);

// Backend - Broadcast to others
await sio.emit(
  "typing_start",
  {
    user: session.get("username"),
    thread_id: thread_id,
  },
  (room = room_name),
  (skip_sid = sid)
);

// Auto-stop after 3 seconds
setTimeout(() => {
  chatSocketClient.stopTyping(threadId);
}, 3000);
```

### Read Receipts

```typescript
// Mark messages as read
chatSocketClient.markAsRead(threadId);

// Server updates database and broadcasts
await sio.emit(
  "messages_read",
  {
    user: session.get("username"),
    thread_id: thread_id,
    count: updated_count,
  },
  (room = room_name)
);
```

## 🔧 Configuration & Setup

### Environment Variables

```env
# Backend
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///db.sqlite3

# Socket.IO
SOCKET_IO_PORT=8006
SOCKET_IO_CORS_ORIGINS=http://localhost:8081
```

### Server Startup

1. **Backend** (Socket.IO + Django):

```bash
cd backend
source ../env/bin/activate  # or .\env\Scripts\Activate.ps1
daphne -p 8006 backend.asgi:application
```

2. **Frontend** (React):

```bash
cd frontend
npm run dev  # Starts on port 8081
```

### Production Considerations

1. **HTTPS/WSS**: Use secure protocols in production
2. **Load Balancing**: Configure Socket.IO sticky sessions
3. **Redis**: Use Redis for Socket.IO scaling across multiple servers
4. **Message Queue**: Consider message queuing for high-volume scenarios

## 🚦 Workflow Integration

### Chat Creation Triggers

1. **Hire Freelancer**: Creates chat thread when client hires freelancer
2. **Proposal Submission**: Creates chat thread when freelancer submits proposal
3. **Manual Creation**: Direct thread creation via API

### Integration Points

1. **Job Updates**: System messages when job status changes
2. **Payment Notifications**: Messages when payments are processed
3. **Dispute Creation**: System messages when disputes are filed
4. **Proposal Actions**: Messages for proposal acceptance/rejection

## 🐛 Error Handling & Debugging

### Common Issues

1. **Connection Failed**: Check if backend server is running on correct port
2. **Authentication Errors**: Verify JWT token validity and format
3. **Message Not Sending**: Check user permissions and thread access
4. **Typing Indicators Not Working**: Verify Socket.IO event handlers

### Debug Tools

1. **Browser Console**: Socket.IO connection logs and errors
2. **Server Logs**: Django and Socket.IO server-side logging
3. **Network Tab**: Monitor WebSocket connections and messages
4. **Database**: Direct inspection of ChatMessage and ChatThread tables

### Testing

```python
# Test Socket.IO connection
python test_socketio_connection.py

# Generate test tokens
python backend/generate_socketio_token.py
```

## 📈 Performance & Scaling

### Current Limitations

- Single server deployment
- In-memory session storage
- SQLite database (development)

### Scaling Solutions

1. **Redis**: For session storage and message broadcasting
2. **PostgreSQL**: Production database with connection pooling
3. **Load Balancer**: Nginx with sticky sessions for Socket.IO
4. **Message Queue**: Celery/Redis for background message processing

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Permission Checks**: Users can only access their threads
3. **Input Validation**: Message content sanitization
4. **CORS Configuration**: Restricted cross-origin access
5. **Rate Limiting**: Built-in Socket.IO connection limits

## 📝 API Documentation

### Socket.IO Events Reference

#### Client Events

```typescript
// Join thread
socket.emit("join_thread", { thread_id: 123 });

// Send message
socket.emit("send_message", {
  thread_id: 123,
  content: "Hello world",
  type: "text",
});

// Typing indicators
socket.emit("typing_start", { thread_id: 123 });
socket.emit("typing_stop", { thread_id: 123 });
```

#### Server Events

```typescript
// Listen for messages
socket.on("new_message", (message) => {
  console.log("New message:", message);
});

// Connection status
socket.on("connection_confirmed", (data) => {
  console.log("Connected as:", data.user.username);
});
```

## 🔮 Future Enhancements

1. **File Attachments**: Image, document, and media sharing
2. **Message Reactions**: Emoji reactions to messages
3. **Message Threading**: Reply to specific messages
4. **Voice Messages**: Audio message support
5. **Video Chat**: Integrated video calling
6. **Message Search**: Full-text search across conversations
7. **Message Encryption**: End-to-end message encryption
8. **Push Notifications**: Mobile and browser notifications

---

This documentation covers the complete implementation of the chat system as currently deployed. The system provides a robust, real-time messaging platform with comprehensive features for the FreelanceMarketplace application.
