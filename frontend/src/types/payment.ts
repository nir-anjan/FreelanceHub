// Payment-related TypeScript interfaces and types

export interface PaymentOrder {
  order_id: string;
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  payment_id: number; // Our internal payment ID
  receipt: string;
  client_info: {
    name: string;
    email: string;
  };
  job_info: {
    id: number;
    title: string;
  };
  freelancer_info: {
    id: number;
    name: string;
  };
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
  };
  notes?: Record<string, any>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentCreateRequest {
  job_id: number;
  freelancer_id: number;
  amount: number;
}

export interface Payment {
  id: number;
  job: {
    id: number;
    title: string;
  };
  client: {
    id: number;
    user: {
      username: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  freelancer: {
    id: number;
    user: {
      username: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  amount: string;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  transaction_id: string;
  created_at: string;
  paid_at?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  pagination: {
    current_page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// Razorpay global object (added to window)
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentError {
  message: string;
  code?: string;
  field?: string;
}
