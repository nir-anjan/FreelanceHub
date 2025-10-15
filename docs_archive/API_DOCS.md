# Backend API Documentation

This document describes the available authentication API endpoints for the backend application. All routes below are mounted under the `/api/` base path; the authentication endpoints are under `/api/auth/`.

Date: 2025-10-11

## Base

- Base URL (local dev): `http://127.0.0.1:8000/`
- API base path: `/api/`
- Auth base path: `/api/auth/`

Authentication uses JWT (SimpleJWT). Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Refresh tokens are used to obtain new access tokens and to logout (blacklist refresh tokens).

Most endpoints return a standardized response format provided by `api.common.responses.StandardResponseMixin`:

- Success:

```
{
  "success": true,
  "message": "...",
  "data": ...
}
```

- Error:

```
{
  "success": false,
  "message": "...",
  "errors": { ... }
}
```

Note: `POST /api/auth/register/` returns a slightly different success shape (see below).

---

## Endpoints

### POST /api/auth/register/

Register a new user.

- Permissions: AllowAny
- Request (application/json):

```
{
  "username": "jdoe",
  "email": "jdoe@example.com",
  "password": "s3cret123",
  "password_confirm": "s3cret123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "freelancer",    # allowed: "freelancer" | "client"
  "phone": "+15551234567"   # optional
}
```

- Success (201):

```
{
  "message": "Registration successful",
  "user": {
    "id": 12,
    "username": "jdoe",
    "email": "jdoe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "freelancer"
  }
}
```

- Error (400):

```
{
  "message": "Registration failed",
  "errors": {
    "email": ["A user with this email already exists."],
    "password_confirm": ["Passwords do not match."]
  }
}
```

Notes:

- The registration serializer validates username/email uniqueness, ensures `role` is one of `freelancer` or `client`, and checks that `password` and `password_confirm` match. Passwords are saved via Django's `set_password()`.

---

### POST /api/auth/login/

Authenticate a user and get JWT tokens.

- Permissions: AllowAny
- Request body:

```
{
  "username": "jdoe",       # or email
  "password": "s3cret123"
}
```

- Success (200):

```
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access": "<access_token>",
    "refresh": "<refresh_token>",
    "user": { /* UserProfileSerializer fields */ }
  }
}
```

- Error (401 / 400): Standard error format with `errors` details.

Notes:

- Login accepts either username or email as the `username` field.
- On success, `last_login` and `last_login_ip` are updated.

---

### POST /api/auth/admin/login/

Admin-only login endpoint.

- Permissions: AllowAny (serializer enforces admin privileges)
- Request body: same as `/login/`
- Success (200): same as `/login/` but message "Admin login successful"
- Error (403) when user lacks admin privileges.

Notes:

- The admin serializer checks `user.role == 'admin'` or `user.is_superuser`.

---

### POST /api/auth/logout/

Blacklist a refresh token to log out the user.

- Permissions: IsAuthenticated
- Request body:

```
{
  "refresh": "<refresh_token>"
}
```

- Success (200):

```
{
  "success": true,
  "message": "Logout successful"
}
```

- Errors:

- 400 when `refresh` missing
- 400 when token invalid or expired (token error returned)

Notes:

- This endpoint blacklists the provided `refresh` token. SimpleJWT blacklist functionality must be enabled for this to work.

---

### GET /api/auth/profile/

Get current authenticated user's profile.

- Permissions: IsAuthenticated
- Success (200):

```
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": { /* UserProfileSerializer fields */ }
}
```

---

### PUT /api/auth/profile/

Update current user's profile (partial updates accepted).

- Permissions: IsAuthenticated
- Allowed fields (JSON): `first_name`, `last_name`, `phone`, `bio`, `profile_picture`
- Success (200): updated profile in `data`.
- Error (400): validation errors (phone format, etc.)

Phone validation: digits allowed with `+`, spaces, and `-`.

---

### POST /api/auth/password/change/

Change password for authenticated user.

- Permissions: IsAuthenticated
- Request body:

```
{
  "old_password": "oldpass",
  "new_password": "newpass123",
  "new_password_confirm": "newpass123"
}
```

- Success (200):

```
{ "success": true, "message": "Password changed successfully" }
```

- Error (400): validation errors (old password mismatch, new password mismatch)

Notes:

- `update_session_auth_hash` is called to prevent the user session from being logged out after the password change.

---

### POST /api/auth/token/refresh/

Refresh an access token using a refresh token. This endpoint wraps SimpleJWT's TokenRefreshView and returns the standardized response.

- Permissions: AllowAny
- Request body:

```
{ "refresh": "<refresh_token>" }
```

- Success (200):

```
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access": "<new_access_token>"
  }
}
```

---

### POST /api/auth/token/verify/

Verify a token (SimpleJWT TokenVerifyView).

- Permissions: AllowAny
- Request body: `{ "token": "<token>" }`
- On valid token, SimpleJWT returns 200 OK (default SimpleJWT behavior).

---

### GET /api/auth/users/

List all users (admin only).

- Permissions: IsAdminUser (custom permission checks `user.role == 'admin'` or `is_superuser`)
- Success (200): returns list of user profiles in `data`.

---

## Model & Serializer notes

User model (key fields):

- `username`, `email` (unique), `first_name`, `last_name`
- `role` — choices: `freelancer`, `client`, `admin` (default `freelancer`)
- `phone`, `profile_picture`, `bio`
- `created_at`, `updated_at`, `last_login_ip`, `email_verified`

Serializers of interest:

- `UserRegistrationSerializer` — input for `/register/` (handles password_confirm)
- `UserLoginSerializer` and `AdminLoginSerializer`
- `UserProfileSerializer` — used to render profile fields
- `UserProfileUpdateSerializer` — fields allowed when updating profile
- `PasswordChangeSerializer` — handles password change

---

## Error patterns & status codes

- 200 OK — successful reads/updates and most successful actions
- 201 Created — registration success
- 400 Bad Request — validation errors or malformed requests
- 401 Unauthorized — authentication failure or invalid token
- 403 Forbidden — admin-only access denied
- 500 Internal Server Error — unexpected server errors

Errors are returned using the standard format (`success: false`, `message`, `errors`).

---

## Quick developer commands

Activate the virtualenv (Windows PowerShell):

```powershell
& "./env/Scripts/Activate.ps1"
```

Run migrations and start the Django server (from the `backend` directory):

```powershell
python manage.py migrate
python manage.py runserver
```

Create a superuser (interactive):

```powershell
python manage.py createsuperuser
```

Run the included serializer unit tests (example):

```powershell
python test_auth_backend.py
```

---

## Example flows

1. Register then login

- POST `/api/auth/register/` with registration JSON
- POST `/api/auth/login/` with username/email + password
- Store tokens and call protected endpoints with `Authorization: Bearer <access>`

2. Refresh

- POST `/api/auth/token/refresh/` with `{ "refresh": "<refresh_token>" }`

3. Logout

- POST `/api/auth/logout/` with `{ "refresh": "<refresh_token>" }` (and access token in header)

---

## Next steps (optional)

- I can generate an OpenAPI/Swagger JSON or YAML from these routes.
- I can produce a Postman collection with ready-to-run requests and environment variables.
- I can add an `API_DOCS.md` to a docs folder or a full Sphinx/Swagger UI integration.

If you want me to add one of these (OpenAPI / Postman / auto-doc generation), tell me which and I'll generate it.
