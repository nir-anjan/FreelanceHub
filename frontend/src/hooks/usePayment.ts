import { useState, useCallback } from "react";
import PaymentService from "../services/paymentService";
import {
  PaymentCreateRequest,
  PaymentOrder,
  RazorpayOptions,
  RazorpayResponse,
  PaymentVerificationRequest,
  Payment,
} from "../types/payment";

interface UsePaymentReturn {
  isLoading: boolean;
  error: string | null;
  initiatePayment: (
    data: PaymentCreateRequest,
    callbacks?: {
      onSuccess?: (payment: Payment) => void;
      onError?: (error: string) => void;
    }
  ) => Promise<boolean>;
  clearError: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initiatePayment = useCallback(
    async (
      data: PaymentCreateRequest,
      callbacks?: {
        onSuccess?: (payment: Payment) => void;
        onError?: (error: string) => void;
      }
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Load Razorpay script if not already loaded
        await PaymentService.loadRazorpayScript();

        // Create payment order
        const paymentOrder: PaymentOrder =
          await PaymentService.createPaymentOrder(data);

        // Get Razorpay configuration
        const config = PaymentService.getRazorpayConfig();

        // Create Razorpay options
        const razorpayOptions: RazorpayOptions = {
          key: config.key,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: config.name,
          description: `Payment for "${paymentOrder.job_info.title}"`,
          order_id: paymentOrder.order_id,
          prefill: {
            name: paymentOrder.client_info.name,
            email: paymentOrder.client_info.email,
          },
          notes: {
            job_id: paymentOrder.job_info.id,
            freelancer_id: paymentOrder.freelancer_info.id,
          },
          theme: config.theme,
          handler: async (response: RazorpayResponse) => {
            try {
              setIsLoading(true);

              // Verify payment on backend
              const verificationData: PaymentVerificationRequest = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };

              const verifiedPayment: Payment =
                await PaymentService.verifyPayment(verificationData);

              // Payment successful
              console.log("Payment verified successfully:", verifiedPayment);

              // Call success callback if provided
              if (callbacks?.onSuccess) {
                callbacks.onSuccess(verifiedPayment);
              } else {
                // Default success behavior
                alert(
                  "Payment successful! The job has been assigned to the freelancer."
                );
                window.location.reload();
              }
            } catch (verifyError) {
              console.error("Payment verification failed:", verifyError);
              const errorMsg =
                "Payment verification failed. Please contact support.";
              setError(errorMsg);

              // Call error callback if provided
              if (callbacks?.onError) {
                callbacks.onError(errorMsg);
              }
            } finally {
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              console.log("Payment modal dismissed");
              setIsLoading(false);
            },
          },
        };

        // Open Razorpay checkout
        const rzp = new window.Razorpay(razorpayOptions);

        rzp.on("payment.failed", (response: any) => {
          console.error("Payment failed:", response.error);
          setError("Payment failed. Please try again.");
          setIsLoading(false);
        });

        rzp.open();

        return true;
      } catch (err: any) {
        console.error("Payment initiation failed:", err);
        setError(err.message || "Payment initiation failed");
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  return {
    isLoading,
    error,
    initiatePayment,
    clearError,
  };
};

// Hook for payment history
interface UsePaymentHistoryReturn {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  fetchPayments: (page?: number, status?: string) => Promise<void>;
  refreshPayments: () => Promise<void>;
}

export const usePaymentHistory = (): UsePaymentHistoryReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const fetchPayments = useCallback(
    async (page: number = 1, status?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await PaymentService.getPaymentHistory(
          page,
          20,
          status
        );

        setPayments(response.payments);
        setPagination({
          currentPage: response.pagination.current_page,
          totalPages: response.pagination.total_pages,
          totalCount: response.pagination.total_count,
        });
      } catch (err: any) {
        console.error("Failed to fetch payments:", err);
        setError(err.message || "Failed to fetch payment history");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshPayments = useCallback(async () => {
    await fetchPayments(pagination.currentPage);
  }, [fetchPayments, pagination.currentPage]);

  return {
    payments,
    isLoading,
    error,
    pagination,
    fetchPayments,
    refreshPayments,
  };
};

export default usePayment;
