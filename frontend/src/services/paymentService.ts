import axios from "axios";
import {
  PaymentOrder,
  PaymentCreateRequest,
  PaymentVerificationRequest,
  Payment,
  PaymentListResponse,
} from "../types/payment";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create axios instance with default config
const paymentAPI = axios.create({
  baseURL: `${API_BASE_URL}/payment`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
paymentAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Fixed: Using correct token name
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
paymentAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiry
      localStorage.removeItem("access_token"); // Fixed: Using correct token name
      localStorage.removeItem("refresh_token"); // Fixed: Using correct token name
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export class PaymentService {
  /**
   * Create a Razorpay payment order
   */
  static async createPaymentOrder(
    data: PaymentCreateRequest
  ): Promise<PaymentOrder> {
    try {
      const response = await paymentAPI.post("/create-order/", data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to create payment order"
        );
      }
    } catch (error: any) {
      console.error("Error creating payment order:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        throw new Error(errorMessages.join(", "));
      } else {
        throw new Error("Network error. Please try again.");
      }
    }
  }

  /**
   * Verify Razorpay payment
   */
  static async verifyPayment(
    data: PaymentVerificationRequest
  ): Promise<Payment> {
    try {
      const response = await paymentAPI.post("/verify-payment/", data);

      if (response.data.success) {
        return response.data.data.payment;
      } else {
        throw new Error(response.data.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        throw new Error(errorMessages.join(", "));
      } else {
        throw new Error("Payment verification failed. Please contact support.");
      }
    }
  }

  /**
   * Get payment history for current user
   */
  static async getPaymentHistory(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<PaymentListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await paymentAPI.get(`/list/?${params}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch payment history"
        );
      }
    } catch (error: any) {
      console.error("Error fetching payment history:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Failed to fetch payment history");
      }
    }
  }

  /**
   * Load Razorpay script dynamically
   */
  static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        if (window.Razorpay) {
          resolve(true);
        } else {
          reject(new Error("Razorpay SDK not loaded"));
        }
      };

      script.onerror = () => {
        reject(new Error("Failed to load Razorpay SDK"));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Get Razorpay configuration
   */
  static getRazorpayConfig() {
    return {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
      name: "Freelance Marketplace",
      description: "Payment for freelancer services",
      theme: {
        color: "#3B82F6", // Blue color matching your theme
      },
    };
  }
}

export default PaymentService;
