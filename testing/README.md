# Testing Directory

This directory contains all test files, utilities, and testing-related resources for the FreelanceMarketplace project.

## Directory Structure

```
testing/
├── README.md                           # This file
├── Python Test Files/
│   ├── test_api_endpoints.py          # API endpoint testing
│   ├── test_chat_system.py            # Chat functionality tests
│   ├── test_chat_api.py               # Chat API specific tests
│   ├── test_chat_dispute.py           # Chat dispute integration tests
│   ├── test_chat_workflows.py         # Chat workflow tests
│   ├── test_dashboard*.py             # Dashboard functionality tests
│   ├── test_payment_endpoints.py      # Payment system tests
│   ├── test_admin_users.py            # Admin user management tests
│   ├── test_analytics_api.py          # Analytics API tests
│   ├── test_dispute_system.py         # Dispute management tests
│   ├── test_direct_dispute.py         # Direct dispute tests
│   ├── test_frontend_chat.py          # Frontend chat integration tests
│   ├── test_public_endpoints.py       # Public API endpoints tests
│   ├── test_socketio_connection.py    # Socket.IO connection tests
│   └── test_port_8006.py              # Port configuration tests
├── HTML Test Files/
│   ├── socketio_test.html             # Socket.IO web-based testing
│   ├── websocket_test.html            # WebSocket connection testing
│   ├── websocket_test_updated.html    # Updated WebSocket tests
│   └── websocket_test_uvicorn.html    # Uvicorn WebSocket tests
├── Utility Files/
│   ├── check_users.py                 # User verification utility
│   ├── generate_token.py              # Token generation utility
│   └── test_fix.py                    # General test fixes
└── Test Data/
    ├── frontend_test_tokens.json      # Frontend authentication tokens
    └── workflow_test_tokens.json      # Workflow testing tokens
```

## Test Categories

### 1. API Testing

- **test_api_endpoints.py**: Comprehensive API endpoint testing
- **test_analytics_api.py**: Admin analytics API testing
- **test_payment_endpoints.py**: Payment gateway and transaction testing
- **test_public_endpoints.py**: Public-facing API endpoint testing

### 2. Chat System Testing

- **test_chat_system.py**: Core chat functionality testing
- **test_chat_api.py**: Chat API endpoint testing
- **test_chat_workflows.py**: Chat workflow integration testing
- **test_frontend_chat.py**: Frontend chat component testing
- **test_socketio_connection.py**: Real-time connection testing

### 3. Dashboard Testing

- **test_dashboard.py**: Main dashboard functionality
- **test_dashboard_api.py**: Dashboard API integration
- **test_dashboard_direct.py**: Direct dashboard testing
- **test_dashboard_stats.py**: Dashboard statistics testing

### 4. Admin Testing

- **test_admin_users.py**: Admin user management functionality
- Tests admin panel features and permissions

### 5. Dispute Management Testing

- **test_dispute_system.py**: Dispute resolution system testing
- **test_direct_dispute.py**: Direct dispute handling testing
- **test_chat_dispute.py**: Chat-integrated dispute testing

### 6. Integration Testing

- **test_port_8006.py**: Port configuration and connectivity testing
- **test_fix.py**: General integration fixes and testing

## HTML Test Files

### Socket.IO Testing

- **socketio_test.html**: Web-based Socket.IO connection testing
- **websocket_test\*.html**: Various WebSocket connectivity tests
- **websocket_test_uvicorn.html**: Uvicorn-specific WebSocket testing

These HTML files can be opened in a browser to test real-time functionality interactively.

## Test Data Files

### Authentication Tokens

- **frontend_test_tokens.json**: Pre-generated tokens for frontend testing
- **workflow_test_tokens.json**: Tokens for testing complete workflows

## Utility Scripts

### User Management

- **check_users.py**: Verify user creation and authentication
- **generate_token.py**: Generate authentication tokens for testing

## Running Tests

### Individual Test Files

```bash
# Run specific test file
cd ../
python testing/test_api_endpoints.py

# Run chat system tests
python testing/test_chat_system.py

# Run payment tests
python testing/test_payment_endpoints.py
```

### HTML Tests

```bash
# Start the development server first
cd ../backend
python manage.py runserver 8007

# Then open HTML files in browser
# Example: file:///path/to/testing/socketio_test.html
```

### Django Test Suite

```bash
# Run Django's built-in tests
cd ../backend
python manage.py test
```

## Test Environment Setup

### Prerequisites

1. Backend server running on port 8007
2. PostgreSQL database configured
3. Admin user created (username: admin, password: admin123)
4. Sample data loaded (optional)

### Environment Variables

Make sure the following are set in your `.env` files:

```bash
# Backend
DEBUG=True
DATABASE_URL=postgresql://...

# Frontend
VITE_API_BASE_URL=http://localhost:8007/api
```

## Test Guidelines

### Writing New Tests

1. Place test files in appropriate category subdirectory
2. Use descriptive test function names
3. Include proper error handling and assertions
4. Clean up test data after execution

### Test Naming Convention

- `test_*.py` for Python test files
- `*_test.html` for HTML test files
- `*_test_tokens.json` for test data files

### Test Data Management

- Use sample data generators for consistent testing
- Clean up created data after tests complete
- Use transaction rollback where possible

## Debugging Tests

### Common Issues

1. **Connection Errors**: Check if backend server is running
2. **Authentication Errors**: Verify admin user exists and credentials are correct
3. **Database Errors**: Ensure PostgreSQL is running and accessible
4. **WebSocket Errors**: Check Socket.IO server configuration

### Debug Tools

- Use browser developer tools for HTML tests
- Check Django logs for API test failures
- Use print statements or logging for detailed debugging

## Contributing to Tests

### Before Adding New Tests

1. Check if similar test already exists
2. Ensure test is in correct category
3. Update this README if adding new test category

### Test Review Checklist

- [ ] Test covers edge cases
- [ ] Test cleans up after execution
- [ ] Test has clear documentation
- [ ] Test follows naming conventions
- [ ] Test is in correct directory

## Test Results and Reporting

### Expected Output Format

Tests should provide clear output indicating:

- Test name and purpose
- Success/failure status with ✅/❌ indicators
- Detailed error messages for failures
- Performance metrics where relevant

### Sample Output

```
Testing Admin Transactions API
========================================
✅ Authentication working correctly
✅ Transactions endpoint accessible
✅ Pagination working
✅ Search functionality working
❌ Filter by status failed: Invalid status value

Total: 4 tests run, 3 passed, 1 failed
```

---

**Last Updated:** October 15, 2025  
**Maintainer:** FreelanceMarketplace Development Team
