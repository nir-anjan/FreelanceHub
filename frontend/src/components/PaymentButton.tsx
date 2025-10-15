import React from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { usePayment } from "../hooks/usePayment";
import { PaymentCreateRequest } from "../types/payment";

interface PaymentButtonProps {
  jobId: number;
  freelancerId: number;
  amount: number;
  jobTitle: string;
  freelancerName: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  jobId,
  freelancerId,
  amount,
  jobTitle,
  freelancerName,
  disabled = false,
  className = "",
  size = "md",
  variant = "primary",
  onSuccess,
  onError,
}) => {
  const { isLoading, error, initiatePayment, clearError } = usePayment();

  const handlePayment = async () => {
    clearError();

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
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white border-transparent",
    outline: "bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600",
  };

  const isDisabled = disabled || isLoading;

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2 
          font-medium rounded-lg border transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        type="button"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}

        {isLoading ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          <p className="font-medium">Payment Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

// Payment Modal Component for detailed payment flow
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  freelancerId: number;
  amount: number;
  jobTitle: string;
  freelancerName: string;
  jobDescription?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  jobId,
  freelancerId,
  amount,
  jobTitle,
  freelancerName,
  jobDescription,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Confirm Payment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-medium text-gray-900">Job Details</h3>
              <p className="text-gray-600">{jobTitle}</p>
              {jobDescription && (
                <p className="text-sm text-gray-500 mt-1">{jobDescription}</p>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Freelancer</h3>
              <p className="text-gray-600">{freelancerName}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <PaymentButton
              jobId={jobId}
              freelancerId={freelancerId}
              amount={amount}
              jobTitle={jobTitle}
              freelancerName={freelancerName}
              className="flex-1"
              onSuccess={() => {
                onClose();
                // Handle success (e.g., show success message, redirect)
              }}
              onError={(error) => {
                // Error is already handled by the PaymentButton component
                console.error("Payment error:", error);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentButton;
