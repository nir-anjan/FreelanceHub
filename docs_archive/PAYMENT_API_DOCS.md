# Razorpay Payment Integration API Documentation

## Overview

This documentation covers the Razorpay payment integration endpoints for the Freelance Marketplace backend. The integration supports creating payment orders, verifying payments, and retrieving payment history.

## Base URL

```
http://localhost:8000/api/payment/
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Payment Order

Creates a Razorpay payment order for hiring a freelancer.

**Endpoint:** `POST /api/payment/create-order/`

**Request Body:**

```json
{
  "job_id": 1,
  "freelancer_id": 2,
  "amount": 5000.0
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "order_id": "order_MrcKdvqiqbMCAi",
    "amount": 500000,
    "currency": "INR",
    "payment_id": 1,
    "receipt": "job_1_fl_2_1704067200",
    "client_info": {
      "name": "John Client",
      "email": "john@example.com"
    },
    "job_info": {
      "id": 1,
      "title": "Website Development"
    },
    "freelancer_info": {
      "id": 2,
      "name": "Jane Freelancer"
    }
  }
}
```

### 2. Verify Payment

Verifies the Razorpay payment signature and completes the payment.

**Endpoint:** `POST /api/payment/verify-payment/`

**Request Body:**

```json
{
  "razorpay_order_id": "order_MrcKdvqiqbMCAi",
  "razorpay_payment_id": "pay_MrcKtLkQvMCAjF",
  "razorpay_signature": "signature_hash_here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verified and completed successfully",
  "data": {
    "payment": {
      "id": 1,
      "job": {
        "id": 1,
        "title": "Website Development"
      },
      "client": {
        "id": 1,
        "user": {
          "username": "johnclient",
          "first_name": "John",
          "last_name": "Client",
          "email": "john@example.com"
        }
      },
      "freelancer": {
        "id": 2,
        "user": {
          "username": "janefreelancer",
          "first_name": "Jane",
          "last_name": "Freelancer",
          "email": "jane@example.com"
        }
      },
      "amount": "5000.00",
      "currency": "INR",
      "status": "completed",
      "payment_method": "card",
      "razorpay_order_id": "order_MrcKdvqiqbMCAi",
      "razorpay_payment_id": "pay_MrcKtLkQvMCAjF",
      "razorpay_signature": "signature_hash_here",
      "transaction_id": "pay_MrcKtLkQvMCAjF",
      "created_at": "2024-01-01T10:00:00Z",
      "paid_at": "2024-01-01T10:05:00Z"
    },
    "job_status_updated": true
  }
}
```

### 3. Payment History

Retrieves the payment history for the current user (client or freelancer).

**Endpoint:** `GET /api/payment/list/`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`pending`, `completed`, `failed`, `refunded`)

**Example:** `GET /api/payment/list/?page=1&page_size=10&status=completed`

**Response:**

```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": 1,
        "job": {
          "id": 1,
          "title": "Website Development"
        },
        "client": {
          "id": 1,
          "user": {
            "username": "johnclient",
            "first_name": "John",
            "last_name": "Client",
            "email": "john@example.com"
          }
        },
        "freelancer": {
          "id": 2,
          "user": {
            "username": "janefreelancer",
            "first_name": "Jane",
            "last_name": "Freelancer",
            "email": "jane@example.com"
          }
        },
        "amount": "5000.00",
        "currency": "INR",
        "status": "completed",
        "payment_method": "card",
        "transaction_id": "pay_MrcKtLkQvMCAjF",
        "created_at": "2024-01-01T10:00:00Z",
        "paid_at": "2024-01-01T10:05:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "page_size": 20,
      "total_count": 1,
      "total_pages": 1
    }
  }
}
```

### 4. Webhook Handler (Optional)

Handles Razorpay webhooks for payment events.

**Endpoint:** `POST /api/payment/webhook/`

**Note:** This is a placeholder endpoint for future webhook implementation.

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Error details"]
  }
}
```

Common HTTP status codes:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Payment Flow

1. **Create Order:** Client calls `/create-order/` with job and freelancer details
2. **Frontend Payment:** Use returned order details with Razorpay checkout
3. **Verify Payment:** After successful payment, call `/verify-payment/` with Razorpay response
4. **Update Status:** Backend verifies signature and updates payment/job status

## Models

### Payment Model Fields

- `id`: Auto-incremented primary key
- `job`: Foreign key to Job model
- `client`: Foreign key to Client model
- `freelancer`: Foreign key to Freelancer model
- `amount`: Decimal field for payment amount
- `currency`: Currency code (default: INR)
- `status`: Payment status (`pending`, `completed`, `failed`, `refunded`)
- `payment_method`: Payment method used
- `razorpay_order_id`: Razorpay order ID
- `razorpay_payment_id`: Razorpay payment ID
- `razorpay_signature`: Razorpay signature for verification
- `transaction_id`: Transaction reference ID
- `created_at`: Payment creation timestamp
- `paid_at`: Payment completion timestamp

## Setup Instructions

### Backend Setup

1. Install Razorpay SDK:

```bash
pip install razorpay==1.4.2
```

2. Add environment variables to `.env`:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

3. Run migrations:

```bash
python manage.py migrate
```

### Frontend Setup

1. Add environment variables to `.env`:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_API_URL=http://localhost:8000/api
```

2. The Razorpay checkout script is loaded dynamically by the payment service.

## Testing

### Test Credentials (Razorpay Test Mode)

- **Test Key ID:** Available in Razorpay dashboard test mode
- **Test Cards:**
  - Success: 4111 1111 1111 1111
  - Failure: 4000 0000 0000 0002
  - CVV: Any 3 digits
  - Expiry: Any future date

### Test Flow

1. Create a test payment order
2. Use Razorpay test card details
3. Complete payment flow
4. Verify payment status in database
5. Check job status update

## Security Considerations

- Always verify payment signatures on the backend
- Use HTTPS in production
- Store Razorpay credentials securely
- Validate all input data
- Implement rate limiting for payment endpoints
- Log all payment transactions for audit

## Integration Notes

- Payment amounts are stored in rupees but sent to Razorpay in paise
- Job status is automatically updated to "in_progress" after successful payment
- Clients can only create payments for their own jobs
- Payment history is filtered by user type (client/freelancer)
- All monetary calculations use Decimal for precision
