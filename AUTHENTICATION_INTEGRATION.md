# FreelanceMarketplace Authentication Integration

## Overview
This document outlines the complete authentication system integration between the React frontend and Django backend using JWT tokens.

## Backend Implementation ✅ COMPLETED

### Models (api/auth/models.py)
- Custom User model extending AbstractUser
- Added fields: role, phone_number, profile_picture, email_verified
- Role choices: freelancer, client, admin
- Custom user manager for creating users and superusers

### Serializers (api/auth/serializers.py)
- UserSerializer: Complete user data serialization
- UserRegistrationSerializer: User registration with validation
- UserLoginSerializer: Login credentials validation
- ProfileUpdateSerializer: Profile update functionality
- PasswordChangeSerializer: Password change with validation

### Views (api/auth/views.py)
- RegisterView: User registration endpoint
- LoginView: JWT token generation with user data
- LogoutView: Token blacklisting for secure logout
- ProfileView: Get/Update user profile
- PasswordChangeView: Secure password update
- All views use proper authentication and permissions

### URLs (api/auth/urls.py)
- /auth/register/ - POST: User registration
- /auth/login/ - POST: User login (returns JWT tokens)
- /auth/logout/ - POST: User logout (blacklist tokens)
- /auth/profile/ - GET/PUT: User profile management
- /auth/change-password/ - POST: Password change
- Token refresh endpoint for JWT refresh

### Settings Configuration
- JWT authentication with SimpleJWT
- Token blacklisting enabled
- CORS configuration for frontend
- Custom user model configured
- Admin interface integration

## Frontend Implementation ✅ COMPLETED

### Services Layer
- **httpClient.ts**: Comprehensive Axios client with:
  - Automatic JWT token attachment
  - Token refresh on 401 errors
  - Request/response interceptors
  - Error handling and logging
  - Logout event emission

- **authService.ts**: Complete authentication service:
  - Login/register methods
  - Profile management
  - Password change functionality
  - Token storage and retrieval
  - Role-based redirect logic

### Type System (types/auth.ts)
- User interface with all required fields
- Request/Response type definitions
- Authentication context types
- Role-based permission types
- Form validation types

### Authentication Context (contexts/AuthContext.tsx)
- React context for global auth state
- Authentication methods (login, register, logout)
- Profile management methods
- Loading states and error handling
- Auto-initialization on app load
- Token refresh management

### Route Protection (components/ProtectedRoute.tsx)
- Role-based route protection
- Guest-only routes (redirect if authenticated)
- Admin-specific routes
- Loading states during authentication checks
- Automatic redirects based on user roles

### Updated Components

#### Login Page (pages/Login.tsx)
- Form validation with error display
- Password visibility toggle
- Integration with AuthContext
- Proper error handling
- Loading states

#### Register Page (pages/Register.tsx)
- Complete registration form
- First name / Last name fields
- Username and email validation
- Password confirmation
- Role selection (freelancer/client)
- Phone number (optional)
- Form validation with error messages

#### Header Component (components/Header.tsx)
- Authentication state awareness
- User dropdown menu with:
  - User info display
  - Profile/Dashboard links
  - Admin panel link (for admins)
  - Logout functionality
- Mobile-responsive design
- Avatar display with initials fallback

#### App.tsx
- AuthProvider wrapper
- Protected route implementation
- Guest-only route protection
- Role-based route access

### Environment Configuration
- .env.local and .env.example files
- API base URL configuration
- JWT token lifetime settings
- Development/production flags

## API Endpoints Integration

### Authentication Flow
1. **Registration**: POST /api/auth/register/
   - Frontend: RegisterRequest → Backend: User creation
   - Response: Success message → Auto-login

2. **Login**: POST /api/auth/login/
   - Frontend: LoginRequest → Backend: JWT token generation
   - Response: AuthResponse with tokens and user data
   - Storage: Tokens in localStorage, user data in context

3. **Logout**: POST /api/auth/logout/
   - Frontend: Logout request → Backend: Token blacklisting
   - Cleanup: Clear localStorage and context state

4. **Profile Management**: GET/PUT /api/auth/profile/
   - Frontend: Profile updates → Backend: User data updates
   - Real-time context updates

5. **Token Refresh**: POST /api/auth/token/refresh/
   - Automatic handling in httpClient
   - Transparent to user experience

## Security Features

### Frontend Security
- JWT tokens stored in localStorage
- Automatic token refresh before expiration
- Request interceptors for auth headers
- Secure logout with token cleanup
- Role-based access control

### Backend Security
- JWT token blacklisting
- Password hashing with Django's auth system
- CORS configuration
- Request validation and sanitization
- Role-based permissions

## Testing Checklist

### Registration Flow
- [ ] User can register as freelancer
- [ ] User can register as client
- [ ] Form validation works correctly
- [ ] Email validation prevents duplicates
- [ ] Username validation prevents duplicates
- [ ] Password confirmation validation
- [ ] Auto-login after successful registration

### Login Flow
- [ ] User can login with username/password
- [ ] Invalid credentials show error
- [ ] Successful login redirects to appropriate dashboard
- [ ] JWT tokens are stored correctly
- [ ] User data is available in context

### Authentication State
- [ ] Header shows login/register for guests
- [ ] Header shows user dropdown for authenticated users
- [ ] User can access profile/dashboard links
- [ ] Admin users can access admin panel
- [ ] Logout clears authentication state

### Route Protection
- [ ] Guest users redirected to login for protected routes
- [ ] Authenticated users redirected from login/register
- [ ] Admin routes only accessible to admin users
- [ ] Role-based redirects work correctly

### Token Management
- [ ] Tokens refresh automatically before expiration
- [ ] Expired tokens trigger re-authentication
- [ ] Logout blacklists tokens on backend
- [ ] Page refresh maintains authentication state

## Next Steps

1. **Start Django Backend**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Authentication Flow**:
   - Register new user
   - Login with credentials
   - Test protected routes
   - Test admin functionality
   - Test logout process

4. **Additional Features to Implement**:
   - Password reset functionality
   - Email verification
   - User profile pictures upload
   - Role-specific dashboards
   - Account settings page

## Troubleshooting

### Common Issues
- **CORS Errors**: Check Django CORS_ALLOWED_ORIGINS setting
- **401 Errors**: Verify JWT token format and expiration
- **Registration Issues**: Check backend validation rules
- **Route Access**: Verify role assignments in database

### Debug Tips
- Check browser localStorage for JWT tokens
- Monitor network requests in browser dev tools
- Check Django server logs for backend errors
- Use React dev tools to inspect context state