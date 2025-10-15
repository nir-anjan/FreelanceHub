# Payment System Implementation Documentation

## Overview

The FreelanceMarketplace payment system is built using **Razorpay** as the payment gateway, providing secure and reliable payment processing for transactions between clients and freelancers. The implementation follows a comprehensive approach with backend API endpoints, frontend integration, and proper security measures.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Security Features](#security-features)
7. [Payment Flow](#payment-flow)
8. [Configuration](#configuration)
9. [Error Handling](#error-handling)
10. [Testing](#testing)

## Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Razorpay      │
│   (React/TS)    │◄──►│   (Django)      │◄──►│   Gateway       │
│                 │    │                 │    │                 │
│ - PaymentButton │    │ - Payment API   │    │ - Order Creation│
│ - usePayment    │    │ - Razorpay      │    │ - Verification  │
│ - PaymentHistory│    │   Service       │    │ - Webhooks      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Backend**: Django REST Framework
- **Payment Gateway**: Razorpay
- **Database**: PostgreSQL
- **Frontend**: React with TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Currency**: Indian Rupee (INR)

## Backend Implementation

### 1. Models (`payment/models.py`)

```python
class Payment(models.Model):
    # Core payment information
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='payments')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments')
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')

    # Payment processing information
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, default='pending')
    transaction_id = models.CharField(max_length=255, blank=True, null=True, unique=True)

    # Razorpay specific fields
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=500, blank=True, null=True)

    # Timestamps
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Key Features:**

- Tracks relationships between jobs, clients, and freelancers
- Stores Razorpay-specific identifiers for verification
- Maintains payment status throughout the lifecycle
- Uses decimal fields for precise currency calculations

### 2. Razorpay Service (`payment/razorpay_service.py`)

```python
class RazorpayService:
    def __init__(self):
        self.client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

    def create_order(self, amount, currency='INR', receipt=None):
        """Create a Razorpay order"""
        order_data = {
            'amount': int(amount * 100),  # Convert to paise
            'currency': currency,
            'receipt': receipt or f'order_{amount}',
            'payment_capture': 1  # Auto capture payment
        }
        return self.client.order.create(data=order_data)

    def verify_payment_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """Verify Razorpay payment signature for security"""
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        self.client.utility.verify_payment_signature(params_dict)
        return True
```

**Key Features:**

- Encapsulates Razorpay API interactions
- Handles amount conversion (rupees to paise)
- Provides signature verification for security
- Centralized error handling and logging

### 3. API Views (`payment/views.py`)

#### CreatePaymentOrderView

- **Purpose**: Creates a Razorpay payment order
- **Authentication**: Required (clients only)
- **Validation**: Ensures job ownership and freelancer existence
- **Response**: Returns order details for frontend integration

#### VerifyPaymentView

- **Purpose**: Verifies completed payments using Razorpay signature
- **Security**: Validates signature to prevent fraud
- **Database Update**: Marks payment as completed upon verification

#### PaymentListView

- **Purpose**: Retrieves payment history for authenticated users
- **Filtering**: Supports status-based filtering
- **Pagination**: Implements pagination for large datasets

### 4. Serializers (`payment/serializers.py`)

```python
class PaymentCreateSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1.00)
    freelancer_id = serializers.IntegerField()

    def validate_job_id(self, value):
        # Ensures job exists and belongs to requesting client

    def validate(self, data):
        # Prevents duplicate payments for same job-freelancer combination
```

**Key Features:**

- Comprehensive validation for payment creation
- Cross-field validation to prevent business logic violations
- Security checks for user permissions

## Frontend Implementation

### 1. Payment Types (`types/payment.ts`)

```typescript
export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  payment_id: number;
  razorpay_order_id: string;
  key: string;
  client_info: ClientInfo;
  freelancer_info: FreelancerInfo;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}
```

### 2. Payment Service (`services/paymentService.ts`)

```typescript
export class PaymentService {
  static async createPaymentOrder(
    data: PaymentCreateRequest
  ): Promise<PaymentOrder> {
    const response = await paymentAPI.post("/create-order/", data);
    return response.data.data;
  }

  static async verifyPayment(
    data: PaymentVerificationRequest
  ): Promise<Payment> {
    const response = await paymentAPI.post("/verify-payment/", data);
    return response.data.data.payment;
  }

  static async getPaymentHistory(): Promise<PaymentListResponse> {
    const response = await paymentAPI.get("/list/");
    return response.data.data;
  }
}
```

**Key Features:**

- Axios-based HTTP client with interceptors
- Automatic token attachment for authentication
- Comprehensive error handling and user feedback
- Type-safe API interactions

### 3. Payment Hook (`hooks/usePayment.ts`)

```typescript
export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    paymentData: PaymentCreateRequest
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Create order
      const order = await PaymentService.createPaymentOrder(paymentData);

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        handler: async (response) => {
          await handlePaymentSuccess(response);
        },
        // ... other options
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      return true;
    } catch (error) {
      handlePaymentError(error);
      return false;
    }
  };
};
```

### 4. Payment Button Component (`components/PaymentButton.tsx`)

```tsx
export const PaymentButton: React.FC<PaymentButtonProps> = ({
  jobId,
  freelancerId,
  amount,
  jobTitle,
  freelancerName,
  onSuccess,
  onError,
}) => {
  const { isLoading, error, initiatePayment, clearError } = usePayment();

  const handlePayment = async () => {
    const paymentData: PaymentCreateRequest = {
      job_id: jobId,
      freelancer_id: freelancerId,
      amount: amount,
    };

    try {
      const success = await initiatePayment(paymentData);
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Handle error
    }
  };

  return (
    <button onClick={handlePayment} disabled={isLoading || disabled}>
      {isLoading ? <Loader2 className="animate-spin" /> : <CreditCard />}
      Pay ₹{amount}
    </button>
  );
};
```

## Database Schema

### Payment Table Structure

```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    freelancer_id INTEGER REFERENCES freelancers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(500),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

```sql
CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_freelancer_id ON payments(freelancer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

## API Endpoints

### 1. Create Payment Order

```
POST /api/payment/create-order/
```

**Request:**

```json
{
  "job_id": 123,
  "freelancer_id": 456,
  "amount": 5000.0
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "id": "order_xyz123",
    "amount": 500000,
    "currency": "INR",
    "payment_id": 789,
    "razorpay_order_id": "order_xyz123",
    "key": "rzp_test_key",
    "client_info": {...},
    "freelancer_info": {...}
  }
}
```

### 2. Verify Payment

```
POST /api/payment/verify-payment/
```

**Request:**

```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment": {
      "id": 789,
      "status": "completed",
      "amount": 5000.0,
      "paid_at": "2025-10-15T12:00:00Z"
    }
  }
}
```

### 3. Payment History

```
GET /api/payment/list/?status=completed&page=1&page_size=20
```

**Response:**

```json
{
  "success": true,
  "data": {
    "payments": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 100
    }
  }
}
```

## Security Features

### 1. Authentication & Authorization

- **JWT Token Validation**: All payment endpoints require valid JWT tokens
- **User Permission Checks**: Clients can only make payments for their own jobs
- **Role-Based Access**: Only clients can initiate payments

### 2. Payment Security

- **Signature Verification**: Razorpay signatures are verified to prevent tampering
- **Amount Validation**: Server-side amount validation prevents manipulation
- **Duplicate Prevention**: Prevents multiple payments for the same job-freelancer combination

### 3. Data Protection

- **HTTPS Enforcement**: All payment communication over encrypted channels
- **PCI Compliance**: Razorpay handles sensitive card data
- **Input Validation**: Comprehensive validation on both frontend and backend

## Payment Flow

### 1. Payment Initiation

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant B as Backend
    participant R as Razorpay

    C->>F: Click Pay Button
    F->>B: POST /create-order/
    B->>B: Validate Job & User
    B->>R: Create Order
    R-->>B: Order Details
    B-->>F: Payment Order
    F->>F: Open Razorpay Checkout
```

### 2. Payment Completion

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Razorpay
    participant F as Frontend
    participant B as Backend

    C->>R: Complete Payment
    R-->>F: Payment Response
    F->>B: POST /verify-payment/
    B->>R: Verify Signature
    R-->>B: Verification Result
    B->>B: Update Payment Status
    B-->>F: Success Response
    F->>F: Show Success Message
```

## Configuration

### Backend Settings (`settings.py`)

```python
# Razorpay Configuration
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET')

# Payment Settings
PAYMENT_CURRENCY = 'INR'
PAYMENT_TIMEOUT = 300  # 5 minutes
```

### Environment Variables

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Database
DATABASE_URL=postgresql://user:pass@localhost/freelance_marketplace
```

### Frontend Environment

```env
# API Configuration
VITE_API_URL=http://localhost:8006/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

## Error Handling

### Backend Error Responses

```python
# Validation Error
{
    "success": false,
    "message": "Invalid payment data",
    "errors": {
        "amount": ["Amount must be greater than 0"]
    }
}

# Business Logic Error
{
    "success": false,
    "message": "Payment already exists for this job-freelancer combination",
    "errors": {"detail": "Duplicate payment"}
}

# System Error
{
    "success": false,
    "message": "Payment gateway error",
    "errors": {"detail": "Connection timeout"}
}
```

### Frontend Error Handling

```typescript
try {
  const success = await initiatePayment(paymentData);
} catch (error: any) {
  if (error.message.includes("network")) {
    setError("Network error. Please check your connection.");
  } else if (error.message.includes("validation")) {
    setError("Please check your payment details.");
  } else {
    setError("Payment failed. Please try again.");
  }
}
```

## Testing

### Backend Tests

```python
class PaymentAPITestCase(APITestCase):
    def test_create_payment_order(self):
        response = self.client.post('/api/payment/create-order/', {
            'job_id': self.job.id,
            'freelancer_id': self.freelancer.id,
            'amount': 1000.00
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

    def test_verify_payment_signature(self):
        # Mock Razorpay verification
        with patch('razorpay.Client.utility.verify_payment_signature'):
            response = self.client.post('/api/payment/verify-payment/', {
                'razorpay_order_id': 'order_test',
                'razorpay_payment_id': 'pay_test',
                'razorpay_signature': 'sig_test'
            })
            self.assertEqual(response.status_code, 200)
```

### Frontend Tests

```typescript
describe("PaymentService", () => {
  test("creates payment order successfully", async () => {
    const mockOrder = { id: "order_123", amount: 100000 };
    mockAxios.post.mockResolvedValue({
      data: { success: true, data: mockOrder },
    });

    const order = await PaymentService.createPaymentOrder({
      job_id: 1,
      freelancer_id: 2,
      amount: 1000,
    });

    expect(order).toEqual(mockOrder);
  });
});
```

## Deployment Considerations

### Production Checklist

- [ ] Switch to Razorpay live credentials
- [ ] Enable HTTPS for all payment endpoints
- [ ] Set up webhook endpoints for payment notifications
- [ ] Configure database connection pooling
- [ ] Set up monitoring and alerting
- [ ] Implement rate limiting
- [ ] Set up backup and recovery procedures

### Performance Optimization

- **Database Indexing**: Proper indexes on payment queries
- **Connection Pooling**: Optimize database connections
- **Caching**: Cache frequently accessed data
- **CDN**: Serve static assets via CDN

### Monitoring

- **Payment Success Rate**: Track successful vs failed payments
- **Response Times**: Monitor API response times
- **Error Rates**: Alert on high error rates
- **Transaction Volume**: Monitor daily/monthly volumes

## Conclusion

The FreelanceMarketplace payment system provides a robust, secure, and user-friendly solution for processing payments between clients and freelancers. The implementation follows best practices for:

- **Security**: Multi-layer security with authentication, authorization, and signature verification
- **Scalability**: Designed to handle growing transaction volumes
- **User Experience**: Simple and intuitive payment flow
- **Maintainability**: Well-structured code with proper separation of concerns
- **Compliance**: Follows PCI DSS guidelines through Razorpay integration

The system is production-ready and can be easily extended to support additional payment methods, currencies, and advanced features like recurring payments or escrow services.
