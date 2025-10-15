# FreelanceMarketplace - Technical Documentation

## Table of Contents

1. [Backend Documentation](#1-backend-documentation)
2. [Frontend Documentation](#2-frontend-documentation)
3. [Development Setup](#3-development-setup)

---

## 1. Backend Documentation

### 1.1 Overview

**Architecture**: Django REST Framework (DRF) with PostgreSQL database
**Framework**: Django 5.2.7
**API Style**: RESTful with JWT authentication
**Real-time**: Django Channels with WebSocket support

#### Core Technologies:

- **Django REST Framework** - API endpoints and serialization
- **SimpleJWT** - JWT token authentication with refresh mechanism
- **Django Channels** - WebSocket support for real-time chat
- **PostgreSQL** - Primary database
- **django-cors-headers** - Cross-origin resource sharing
- **Psycopg2** - PostgreSQL adapter

#### Project Structure:

```
backend/
├── backend/                 # Django project settings
│   ├── settings.py         # Main configuration
│   ├── urls.py             # Root URL routing
│   ├── asgi.py             # ASGI config for WebSocket
│   └── wsgi.py             # WSGI config for HTTP
├── api/                    # Main API application
│   ├── auth/               # Authentication & business logic
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API view classes
│   │   ├── serializers.py  # Data serialization
│   │   ├── urls.py         # URL routing
│   │   └── migrations/     # Database migrations
│   └── common/             # Shared utilities
│       ├── exceptions.py   # Custom exceptions
│       ├── permissions.py  # Permission classes
│       └── responses.py    # Standardized responses
├── chat/                   # Real-time chat application
│   ├── models.py           # Chat-related models
│   ├── consumer.py         # WebSocket consumers
│   ├── routing.py          # WebSocket routing
│   └── views.py            # Chat API endpoints
└── manage.py               # Django management commands
```

### 1.2 Logic Flow

#### Authentication Flow:

```
1. User Registration → Role Selection (Client/Freelancer/Admin)
2. Profile Creation → JWT Token Generation
3. API Requests → Token Validation → Resource Access
4. Token Expiry → Automatic Refresh → Continued Access
```

#### Request Processing Pipeline:

```
HTTP Request → CORS Middleware → Authentication → Authorization → Business Logic → Response
```

#### Business Logic Flow:

1. **User Management**: Registration, profile creation, role-based access
2. **Job Lifecycle**: Creation → Approval → Publishing → Application → Completion
3. **Communication**: Thread-based chat system with real-time messaging
4. **Dispute Resolution**: Admin-mediated conflict resolution
5. **Payment Processing**: Transaction tracking and history

### 1.3 Database Structure

#### Entity Relationship Diagram:

```
User (1:1) ←→ Freelancer/Client/AdminProfile
  ↓
Job (n:1) → Client
  ↓
ChatThread (n:1) → Job, Client, Freelancer
  ↓
ChatMessage (n:1) → ChatThread
  ↓
Dispute (n:1) → Job, Client, Freelancer
  ↓
Payment (n:1) → Job, Client, Freelancer
```

#### Database Tables Schema:

##### **auth_user** (Django's built-in User extended)

| Column          | Type         | Constraints          | Description                         |
| --------------- | ------------ | -------------------- | ----------------------------------- |
| id              | SERIAL       | PRIMARY KEY          | Auto-incrementing ID                |
| username        | VARCHAR(150) | UNIQUE, NOT NULL     | User login name                     |
| email           | VARCHAR(254) | UNIQUE, NOT NULL     | Email address                       |
| first_name      | VARCHAR(150) |                      | User first name                     |
| last_name       | VARCHAR(150) |                      | User last name                      |
| password        | VARCHAR(128) | NOT NULL             | Hashed password                     |
| role            | VARCHAR(20)  | DEFAULT 'freelancer' | User role (freelancer/client/admin) |
| phone           | VARCHAR(15)  | NULLABLE             | Phone number                        |
| profile_picture | URLField     | NULLABLE             | Profile image URL                   |
| bio             | TEXT(500)    | NULLABLE             | User biography                      |
| is_active       | BOOLEAN      | DEFAULT true         | Account active status               |
| date_joined     | TIMESTAMP    | AUTO                 | Account creation date               |

##### **freelancers**

| Column        | Type         | Constraints                       | Description                   |
| ------------- | ------------ | --------------------------------- | ----------------------------- |
| id            | SERIAL       | PRIMARY KEY                       | Auto-incrementing ID          |
| user_id       | INTEGER      | FOREIGN KEY(auth_user.id), UNIQUE | Reference to User             |
| title         | VARCHAR(200) | NOT NULL                          | Professional title            |
| category      | VARCHAR(100) | NOT NULL                          | Work category                 |
| skills        | TEXT         |                                   | Skills (JSON/comma-separated) |
| rate          | DECIMAL(8,2) | NOT NULL                          | Hourly rate                   |
| location      | VARCHAR(100) |                                   | Geographic location           |
| portfolio_url | URLField     | NULLABLE                          | Portfolio website             |
| created_at    | TIMESTAMP    | AUTO                              | Profile creation date         |

##### **clients**

| Column       | Type         | Constraints                       | Description           |
| ------------ | ------------ | --------------------------------- | --------------------- |
| id           | SERIAL       | PRIMARY KEY                       | Auto-incrementing ID  |
| user_id      | INTEGER      | FOREIGN KEY(auth_user.id), UNIQUE | Reference to User     |
| company_name | VARCHAR(200) | NULLABLE                          | Company name          |
| created_at   | TIMESTAMP    | AUTO                              | Profile creation date |

##### **jobs**

| Column          | Type          | Constraints                       | Description          |
| --------------- | ------------- | --------------------------------- | -------------------- |
| id              | SERIAL        | PRIMARY KEY                       | Auto-incrementing ID |
| client_id       | INTEGER       | FOREIGN KEY(clients.id), NOT NULL | Job poster           |
| title           | VARCHAR(200)  | NOT NULL                          | Job title            |
| description     | TEXT          | NOT NULL                          | Job description      |
| category        | VARCHAR(100)  | NOT NULL                          | Job category         |
| budget_min      | DECIMAL(10,2) | NOT NULL                          | Minimum budget       |
| budget_max      | DECIMAL(10,2) | NOT NULL                          | Maximum budget       |
| duration        | VARCHAR(100)  |                                   | Estimated duration   |
| skills          | TEXT          |                                   | Required skills      |
| status          | VARCHAR(20)   | DEFAULT 'draft'                   | Job status           |
| proposals_count | INTEGER       | DEFAULT 0                         | Number of proposals  |
| created_at      | TIMESTAMP     | AUTO                              | Job creation date    |
| updated_at      | TIMESTAMP     | AUTO_UPDATE                       | Last modification    |

**Job Status Options**: 'draft', 'open', 'in_progress', 'completed', 'cancelled'

##### **chat_threads**

| Column          | Type      | Constraints                           | Description          |
| --------------- | --------- | ------------------------------------- | -------------------- |
| id              | SERIAL    | PRIMARY KEY                           | Auto-incrementing ID |
| client_id       | INTEGER   | FOREIGN KEY(clients.id), NOT NULL     | Thread client        |
| freelancer_id   | INTEGER   | FOREIGN KEY(freelancers.id), NOT NULL | Thread freelancer    |
| job_id          | INTEGER   | FOREIGN KEY(jobs.id), NULLABLE        | Related job          |
| created_at      | TIMESTAMP | AUTO                                  | Thread creation      |
| last_message_at | TIMESTAMP | AUTO_UPDATE                           | Last activity        |
| is_active       | BOOLEAN   | DEFAULT true                          | Thread status        |

##### **chat_messages**

| Column       | Type        | Constraints                            | Description             |
| ------------ | ----------- | -------------------------------------- | ----------------------- |
| id           | SERIAL      | PRIMARY KEY                            | Auto-incrementing ID    |
| thread_id    | INTEGER     | FOREIGN KEY(chat_threads.id), NOT NULL | Parent thread           |
| sender_id    | INTEGER     | FOREIGN KEY(auth_user.id), NOT NULL    | Message sender          |
| message      | TEXT        | NOT NULL                               | Message content         |
| message_type | VARCHAR(20) | DEFAULT 'text'                         | Message type            |
| metadata     | JSONB       | NULLABLE                               | Additional message data |
| sent_at      | TIMESTAMP   | AUTO                                   | Send timestamp          |
| is_read      | BOOLEAN     | DEFAULT false                          | Read status             |

**Message Types**: 'text', 'file', 'image', 'system', 'dispute_created', 'payment_initiated'

##### **disputes**

| Column         | Type        | Constraints                           | Description          |
| -------------- | ----------- | ------------------------------------- | -------------------- |
| id             | SERIAL      | PRIMARY KEY                           | Auto-incrementing ID |
| job_id         | INTEGER     | FOREIGN KEY(jobs.id), NOT NULL        | Disputed job         |
| client_id      | INTEGER     | FOREIGN KEY(clients.id), NOT NULL     | Dispute client       |
| freelancer_id  | INTEGER     | FOREIGN KEY(freelancers.id), NOT NULL | Dispute freelancer   |
| description    | TEXT        | NOT NULL                              | Dispute details      |
| status         | VARCHAR(20) | DEFAULT 'open'                        | Dispute status       |
| resolution     | TEXT        | NULLABLE                              | Admin resolution     |
| created_at     | TIMESTAMP   | AUTO                                  | Dispute creation     |
| resolved_at    | TIMESTAMP   | NULLABLE                              | Resolution timestamp |
| resolved_by_id | INTEGER     | FOREIGN KEY(auth_user.id), NULLABLE   | Resolving admin      |

**Dispute Status Options**: 'open', 'resolved', 'dismissed'

##### **payments**

| Column         | Type          | Constraints                           | Description             |
| -------------- | ------------- | ------------------------------------- | ----------------------- |
| id             | SERIAL        | PRIMARY KEY                           | Auto-incrementing ID    |
| job_id         | INTEGER       | FOREIGN KEY(jobs.id), NOT NULL        | Payment job             |
| client_id      | INTEGER       | FOREIGN KEY(clients.id), NOT NULL     | Payer                   |
| freelancer_id  | INTEGER       | FOREIGN KEY(freelancers.id), NOT NULL | Payee                   |
| amount         | DECIMAL(10,2) | NOT NULL                              | Payment amount          |
| status         | VARCHAR(20)   | DEFAULT 'pending'                     | Payment status          |
| transaction_id | VARCHAR(100)  | NULLABLE                              | External transaction ID |
| created_at     | TIMESTAMP     | AUTO                                  | Payment initiation      |
| completed_at   | TIMESTAMP     | NULLABLE                              | Completion timestamp    |

**Payment Status Options**: 'pending', 'completed', 'failed', 'refunded'

### 1.4 API Endpoints

#### Authentication Endpoints

##### **POST** `/api/auth/register/`

**Description**: Register a new user with role selection

**Request Body**:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "freelancer",
  "phone": "+1234567890"
}
```

**Success Response** (201):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "freelancer"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  },
  "message": "User registered successfully"
}
```

**Error Response** (400):

```json
{
  "success": false,
  "errors": {
    "email": ["A user with this email already exists."],
    "password": ["Password too weak."]
  },
  "message": "Registration failed"
}
```

##### **POST** `/api/auth/login/`

**Description**: Authenticate user and return JWT tokens

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "freelancer",
      "profile_complete": true
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  },
  "message": "Login successful"
}
```

##### **POST** `/api/auth/token/refresh/`

**Description**: Refresh JWT access token

**Request Body**:

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Success Response** (200):

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Profile Management

##### **GET** `/api/auth/profile/`

**Description**: Get current user's profile
**Authorization**: Bearer token required

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "freelancer",
      "phone": "+1234567890",
      "profile_picture": "https://example.com/avatar.jpg",
      "bio": "Experienced web developer"
    },
    "freelancer_profile": {
      "title": "Full Stack Developer",
      "category": "Web Development",
      "skills": "React, Django, PostgreSQL",
      "rate": 75.0,
      "location": "New York, NY",
      "portfolio_url": "https://johndoe.dev"
    }
  }
}
```

##### **PUT** `/api/auth/profile/`

**Description**: Update user profile
**Authorization**: Bearer token required

**Request Body**:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "bio": "Senior web developer with 5+ years experience",
  "freelancer_profile": {
    "title": "Senior Full Stack Developer",
    "category": "Web Development",
    "skills": "React, Django, PostgreSQL, AWS",
    "rate": 85.0,
    "location": "New York, NY",
    "portfolio_url": "https://johndoe.dev"
  }
}
```

#### Job Management

##### **GET** `/api/auth/jobs/`

**Description**: List all jobs (public access)
**Query Parameters**:

- `page` (integer): Page number
- `page_size` (integer): Items per page
- `category` (string): Filter by category
- `skills` (string): Filter by skills
- `budget_min` (decimal): Minimum budget filter
- `budget_max` (decimal): Maximum budget filter

**Example Request**: `/api/auth/jobs/?page=1&category=Web%20Development&skills=React`

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "title": "E-commerce Website Development",
        "description": "Need a modern e-commerce platform with React and Django",
        "category": "Web Development",
        "budget_min": 2000.0,
        "budget_max": 5000.0,
        "duration": "2-3 months",
        "skills_list": ["React", "Django", "PostgreSQL"],
        "status": "open",
        "proposals_count": 5,
        "client_name": "Tech Corp",
        "client_username": "techcorp",
        "created_at": "2025-10-14T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 47,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

##### **POST** `/api/auth/jobs/create/`

**Description**: Create a new job (client only)
**Authorization**: Bearer token required (client role)

**Request Body**:

```json
{
  "title": "Mobile App Development",
  "description": "Need a React Native app for iOS and Android with payment integration",
  "category": "Mobile Development",
  "budget_min": 3000.0,
  "budget_max": 7000.0,
  "duration": "3-4 months",
  "skills": "React Native, JavaScript, API Integration, Payment Gateways"
}
```

**Success Response** (201):

```json
{
  "success": true,
  "data": {
    "id": 25,
    "title": "Mobile App Development",
    "status": "draft",
    "created_at": "2025-10-14T15:30:00Z"
  },
  "message": "Job created successfully"
}
```

##### **GET** `/api/auth/jobs/{job_id}/`

**Description**: Get job details

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "E-commerce Website Development",
    "description": "Detailed job description...",
    "category": "Web Development",
    "budget_min": 2000.0,
    "budget_max": 5000.0,
    "duration": "2-3 months",
    "skills_list": ["React", "Django", "PostgreSQL"],
    "status": "open",
    "proposals_count": 5,
    "client": {
      "id": 1,
      "company_name": "Tech Corp",
      "user": {
        "first_name": "Jane",
        "last_name": "Smith"
      }
    },
    "created_at": "2025-10-14T10:00:00Z"
  }
}
```

#### Chat System

##### **GET** `/api/chat/threads/`

**Description**: Get user's chat threads
**Authorization**: Bearer token required
**Query Parameters**:

- `page` (integer): Page number

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": 1,
        "client": {
          "id": 1,
          "user": {
            "username": "techcorp",
            "first_name": "Jane",
            "last_name": "Smith"
          }
        },
        "freelancer": {
          "id": 1,
          "user": {
            "username": "john_doe",
            "first_name": "John",
            "last_name": "Doe"
          }
        },
        "job": {
          "id": 1,
          "title": "E-commerce Website Development"
        },
        "created_at": "2025-10-14T10:00:00Z",
        "last_message_at": "2025-10-14T16:45:00Z",
        "is_active": true,
        "unread_count": 2,
        "last_message": {
          "message": "When can you start the project?",
          "sender": {
            "username": "techcorp"
          },
          "sent_at": "2025-10-14T16:45:00Z"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 3
    }
  }
}
```

##### **POST** `/api/chat/threads/{thread_id}/messages/`

**Description**: Send a message in a chat thread
**Authorization**: Bearer token required

**Request Body**:

```json
{
  "message": "Hello! I'm interested in your project and would like to discuss the requirements.",
  "message_type": "text"
}
```

**Success Response** (201):

```json
{
  "success": true,
  "data": {
    "id": 15,
    "message": "Hello! I'm interested in your project...",
    "sender": {
      "id": 1,
      "username": "john_doe"
    },
    "message_type": "text",
    "sent_at": "2025-10-14T17:00:00Z",
    "is_read": false
  },
  "message": "Message sent successfully"
}
```

##### **GET** `/api/chat/threads/{thread_id}/messages/`

**Description**: Get messages from a chat thread
**Authorization**: Bearer token required
**Query Parameters**:

- `page` (integer): Page number

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 15,
        "message": "Hello! I'm interested in your project...",
        "sender": {
          "id": 1,
          "username": "john_doe",
          "first_name": "John"
        },
        "message_type": "text",
        "sent_at": "2025-10-14T17:00:00Z",
        "is_read": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_count": 25
    }
  }
}
```

#### Admin Endpoints

##### **GET** `/api/auth/admin/overview/`

**Description**: Get admin dashboard statistics
**Authorization**: Bearer token required (admin role)

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "active_freelancers": 75,
    "active_clients": 65,
    "total_admins": 3,
    "pending_jobs": 12,
    "approved_jobs": 89,
    "total_jobs": 101,
    "active_disputes": 3,
    "total_disputes": 25,
    "total_payments": 125000.0,
    "recent_jobs": [
      {
        "id": 25,
        "title": "Mobile App Development",
        "client_name": "StartupXYZ",
        "status": "pending",
        "created_at": "2025-10-14T15:30:00Z"
      }
    ],
    "recent_payments": [
      {
        "id": 45,
        "amount": 2500.0,
        "status": "completed",
        "job_title": "Website Redesign",
        "created_at": "2025-10-14T14:00:00Z"
      }
    ]
  }
}
```

##### **GET** `/api/auth/admin/jobs/pending/`

**Description**: Get jobs pending approval
**Authorization**: Bearer token required (admin role)

##### **POST** `/api/auth/admin/jobs/{job_id}/approve/`

**Description**: Approve a pending job
**Authorization**: Bearer token required (admin role)

**Success Response** (200):

```json
{
  "success": true,
  "message": "Job approved successfully"
}
```

##### **POST** `/api/auth/admin/jobs/{job_id}/reject/`

**Description**: Reject a pending job
**Authorization**: Bearer token required (admin role)

**Request Body**:

```json
{
  "reason": "Job description violates platform guidelines"
}
```

### 1.5 Error Handling & Validation

#### Standard Error Response Format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Specific error message"],
    "another_field": ["Another error message"]
  },
  "status_code": 400
}
```

#### Common HTTP Status Codes:

- **200 OK**: Successful GET/PUT operations
- **201 Created**: Successful POST operations
- **400 Bad Request**: Validation errors, malformed data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

#### Custom Exception Classes:

```python
# api/common/exceptions.py
class ValidationError(Exception):
    """Custom validation error with field-specific messages"""

class PermissionDenied(Exception):
    """Custom permission denied with detailed message"""

class ResourceNotFound(Exception):
    """Custom 404 with resource-specific message"""
```

### 1.6 Utilities & Middleware

#### Custom Middleware:

1. **CORS Middleware**: Handles cross-origin requests from frontend
2. **Authentication Middleware**: JWT token validation
3. **Security Middleware**: Security headers and protection

#### Background Tasks:

- **Email Notifications**: Celery tasks for user notifications
- **Payment Processing**: Async payment verification
- **File Cleanup**: Periodic cleanup of temporary files

#### Utility Functions:

```python
# api/common/responses.py
class StandardResponseMixin:
    """Mixin for standardized API responses"""

    def success_response(self, data=None, message="Success", status_code=200):
        return Response({
            "success": True,
            "data": data,
            "message": message
        }, status=status_code)

    def error_response(self, message="Error", errors=None, status_code=400):
        return Response({
            "success": False,
            "message": message,
            "errors": errors or {}
        }, status=status_code)
```

---

## 2. Frontend Documentation

### 2.1 Overview

**Framework**: React 18 with TypeScript
**Build Tool**: Vite 5.x
**UI Framework**: Shadcn/UI (Radix UI primitives + Tailwind CSS)
**State Management**: React Context API with useReducer
**HTTP Client**: Axios with interceptors
**Routing**: React Router v6
**Form Handling**: React Hook Form with Zod validation

#### Core Technologies:

- **React 18**: Component framework with concurrent features
- **TypeScript**: Static type checking and enhanced developer experience
- **Vite**: Fast build tool with HMR (Hot Module Replacement)
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Pre-built accessible component library
- **React Router**: Declarative routing for React
- **Axios**: Promise-based HTTP client with interceptors
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation

### 2.2 Project Structure

```
frontend/src/
├── components/              # Reusable UI components
│   ├── ui/                 # Shadcn/UI base components
│   │   ├── button.tsx      # Button component variants
│   │   ├── card.tsx        # Card layout components
│   │   ├── input.tsx       # Form input components
│   │   ├── dialog.tsx      # Modal/dialog components
│   │   └── ...             # Other UI primitives
│   ├── Header.tsx          # Application header with navigation
│   ├── Footer.tsx          # Application footer
│   ├── ProtectedRoute.tsx  # Route authentication guard
│   ├── DashboardLayout.tsx # Dashboard page wrapper
│   ├── ChatWindow.tsx      # Real-time chat interface
│   └── FreelancerCard.tsx  # Freelancer profile display card
├── pages/                  # Route-based page components
│   ├── Index.tsx           # Landing/homepage
│   ├── Login.tsx           # User authentication
│   ├── Register.tsx        # User registration
│   ├── Jobs.tsx            # Job listings page
│   ├── JobDetail.tsx       # Individual job details
│   ├── Dashboard.tsx       # User dashboard
│   ├── Profile.tsx         # User profile management
│   ├── Inbox.tsx           # Chat inbox
│   └── admin/              # Admin-specific pages
├── services/               # API integration layer
│   ├── api.ts              # Axios instance with interceptors
│   ├── authService.ts      # Authentication API calls
│   ├── dashboardService.ts # Dashboard data fetching
│   ├── chatService.ts      # Chat functionality
│   ├── publicListingsService.ts # Public job/freelancer listings
│   └── index.ts            # Service exports
├── contexts/               # React Context providers
│   ├── AuthContext.tsx     # Authentication state management
│   └── index.ts            # Context exports
├── hooks/                  # Custom React hooks
│   ├── use-toast.ts        # Toast notifications
│   └── use-mobile.tsx      # Mobile detection
├── types/                  # TypeScript type definitions
│   ├── auth.ts             # Authentication types
│   ├── dashboard.ts        # Dashboard data types
│   └── index.ts            # Type exports
├── lib/                    # Utility functions and helpers
│   └── utils.ts            # Common utility functions
├── assets/                 # Static assets (images, icons)
├── App.tsx                 # Main application component
├── main.tsx                # Application entry point
└── index.css               # Global styles
```

### 2.3 Component Logic

#### Component Hierarchy:

```
App
├── AuthProvider (Context)
├── Router
│   ├── Public Routes
│   │   ├── Index (Landing page)
│   │   ├── Jobs (Job listings)
│   │   └── JobDetail
│   ├── Protected Routes
│   │   ├── Dashboard
│   │   ├── Profile
│   │   └── Inbox
│   └── Admin Routes
│       ├── AdminDashboard
│       ├── AdminUsers
│       └── AdminJobs
```

#### Key Component Patterns:

##### **Higher-Order Components (HOCs)**:

```tsx
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "freelancer" | "client" | "admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
```

##### **Custom Hooks Pattern**:

```tsx
// hooks/useApi.ts
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

##### **Component Composition Pattern**:

```tsx
// pages/Jobs.tsx
const Jobs: React.FC = () => {
  const [filters, setFilters] = useState<JobFilters>({});
  const {
    data: jobsData,
    loading,
    error,
  } = useApi(() => publicListingsService.getAllJobs(filters), [filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <JobSearchSection onFiltersChange={setFilters} />
        <JobListSection
          jobs={jobsData?.jobs || []}
          loading={loading}
          error={error}
        />
      </main>
      <Footer />
    </div>
  );
};
```

### 2.4 State Management

#### Authentication Context Implementation:

```tsx
// contexts/AuthContext.tsx
interface User {
  id: number;
  username: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  profile_complete: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (profileData: ProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await authService.login(email, password);

      if (response.success) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: response.data.user,
        });

        // Store tokens
        tokenManager.setTokens(response.data.tokens);
      }
    } catch (error) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: error.message,
      });
      throw error;
    }
  };

  const logout = () => {
    tokenManager.clearTokens();
    dispatch({ type: "LOGOUT" });
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenManager.getStoredToken();
      if (token) {
        try {
          const profile = await authService.getProfile();
          dispatch({
            type: "INIT_SUCCESS",
            payload: profile.data.user,
          });
        } catch (error) {
          tokenManager.clearTokens();
          dispatch({ type: "INIT_ERROR" });
        }
      } else {
        dispatch({ type: "INIT_ERROR" });
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

#### State Management Patterns:

1. **Global State**: Authentication context for user session
2. **Local State**: Component-specific state with useState/useReducer
3. **Server State**: API data cached with custom hooks
4. **Form State**: React Hook Form for complex form handling

### 2.5 API Integration

#### Axios Configuration:

```tsx
// services/api.ts
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await tokenManager.refreshToken();
      if (refreshed) {
        return api.request(originalRequest);
      } else {
        // Redirect to login if refresh fails
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
```

#### Service Layer Pattern:

```tsx
// services/authService.ts
class AuthService {
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginData>> {
    const response = await api.post<ApiResponse<LoginData>>("/auth/login/", {
      email,
      password,
    });

    if (response.data.success) {
      tokenManager.setTokens(response.data.data.tokens);
    }

    return response.data;
  }

  async register(
    userData: RegisterData
  ): Promise<ApiResponse<RegisterResponse>> {
    const response = await api.post<ApiResponse<RegisterResponse>>(
      "/auth/register/",
      userData
    );
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await api.get<ApiResponse<UserProfile>>("/auth/profile/");
    return response.data;
  }

  async updateProfile(
    profileData: ProfileData
  ): Promise<ApiResponse<UserProfile>> {
    const response = await api.put<ApiResponse<UserProfile>>(
      "/auth/profile/",
      profileData
    );
    return response.data;
  }
}

export default new AuthService();
```

#### TypeScript API Types:

```tsx
// types/auth.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "freelancer" | "client" | "admin";
  phone?: string;
  profile_picture?: string;
  bio?: string;
  profile_complete: boolean;
}

export interface FreelancerProfile {
  title: string;
  category: string;
  skills: string;
  rate: number;
  location: string;
  portfolio_url?: string;
}

export interface LoginData {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: "freelancer" | "client";
  phone?: string;
}
```

### 2.6 Routing & Navigation

#### React Router Configuration:

```tsx
// App.tsx
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/freelancers" element={<Freelancers />} />
            <Route path="/freelancers/:id" element={<FreelancerProfile />} />

            {/* Authentication Routes */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="create-job"
                element={
                  <ProtectedRoute requiredRole="client">
                    <JobForm />
                  </ProtectedRoute>
                }
              />
              <Route path="jobs" element={<JobHistory />} />
              <Route path="active-jobs" element={<ActiveJobs />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="inbox/:threadId" element={<ChatWindow />} />
              <Route path="payments" element={<PaymentHistory />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
```

#### Navigation Hooks:

```tsx
// Custom navigation hooks
const useNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  const navigateToJob = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  return {
    navigateToDashboard,
    navigateToProfile,
    navigateToJob,
  };
};
```

### 2.7 UI/UX Components

#### Reusable Component Library:

```tsx
// components/ui/button.tsx (Shadcn/UI)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### Custom Composite Components:

```tsx
// components/FreelancerCard.tsx
interface FreelancerCardProps {
  freelancer: Freelancer;
  onHire?: (freelancerId: number) => void;
  showHireButton?: boolean;
}

export const FreelancerCard: React.FC<FreelancerCardProps> = ({
  freelancer,
  onHire,
  showHireButton = false,
}) => {
  return (
    <Card className="h-full shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={freelancer.user.profile_picture} />
            <AvatarFallback>
              {freelancer.user.first_name[0]}
              {freelancer.user.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              {freelancer.user.first_name} {freelancer.user.last_name}
            </CardTitle>
            <CardDescription className="text-sm">
              {freelancer.title}
            </CardDescription>
            <Badge variant="secondary" className="mt-1">
              {freelancer.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="font-medium">${freelancer.rate}/hr</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{freelancer.location}</span>
          </div>
        </div>

        {freelancer.user.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {freelancer.user.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {freelancer.skills_list.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill.trim()}
            </Badge>
          ))}
          {freelancer.skills_list.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{freelancer.skills_list.length - 4}
            </Badge>
          )}
        </div>

        {showHireButton && (
          <Button className="w-full" onClick={() => onHire?.(freelancer.id)}>
            Start Conversation
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
```

#### Theme System with Tailwind:

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --success: 142.1 76.2% 36.3%;
    --destructive: 0 84.2% 60.2%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* Dark theme variables */
  }
}

@layer components {
  .shadow-card {
    @apply shadow-sm hover:shadow-md transition-shadow;
  }

  .shadow-card-hover {
    @apply shadow-lg;
  }

  .gradient-hero {
    @apply bg-gradient-to-r from-primary/10 via-primary/5 to-background;
  }
}
```

---

## 3. Development Setup

### 3.1 Backend Setup

#### Prerequisites:

- Python 3.11+
- PostgreSQL 13+
- pip (Python package manager)

#### Installation Steps:

```bash
# 1. Clone repository and navigate to backend
cd backend/

# 2. Create virtual environment
python -m venv env

# 3. Activate virtual environment
# Windows:
env\Scripts\activate
# MacOS/Linux:
source env/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# 6. Setup database
python manage.py migrate
python manage.py createsuperuser

# 7. Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json

# 8. Run development server
python manage.py runserver 8000
```

#### Environment Variables (.env):

```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://username:password@localhost:5432/freelance_marketplace_db

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email Settings (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 3.2 Frontend Setup

#### Prerequisites:

- Node.js 18+
- npm or yarn package manager

#### Installation Steps:

```bash
# 1. Navigate to frontend directory
cd frontend/

# 2. Install dependencies
npm install
# or
yarn install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API URLs

# 4. Start development server
npm run dev
# or
yarn dev
```

#### Environment Variables (.env.local):

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_NAME=FreelanceMarketplace
VITE_APP_VERSION=1.0.0
```

### 3.3 Production Deployment

#### Backend Deployment (Django):

```bash
# 1. Install production dependencies
pip install gunicorn psycopg2-binary

# 2. Collect static files
python manage.py collectstatic

# 3. Run migrations
python manage.py migrate --settings=backend.settings.production

# 4. Start Gunicorn server
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend Deployment (Vite):

```bash
# 1. Build for production
npm run build

# 2. Preview build (optional)
npm run preview

# 3. Deploy dist/ folder to your hosting service
```

This comprehensive technical documentation provides a complete reference for developers working on the FreelanceMarketplace project, covering architecture, implementation details, API specifications, and development workflows.
