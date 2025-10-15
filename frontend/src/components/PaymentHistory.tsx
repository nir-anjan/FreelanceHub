import React, { useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
} from "lucide-react";
import { usePaymentHistory } from "../hooks/usePayment";
import { Payment, PaymentStatus } from "../types/payment";

interface PaymentHistoryProps {
  className?: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  className = "",
}) => {
  const {
    payments,
    isLoading,
    error,
    pagination,
    fetchPayments,
    refreshPayments,
  } = usePaymentHistory();

  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all"
  );

  useEffect(() => {
    fetchPayments(1, statusFilter === "all" ? undefined : statusFilter);
  }, [fetchPayments, statusFilter]);

  const handlePageChange = (page: number) => {
    fetchPayments(page, statusFilter === "all" ? undefined : statusFilter);
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "refunded":
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "refunded":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-center gap-2 text-red-800">
          <XCircle className="w-5 h-5" />
          <h3 className="font-medium">Error Loading Payments</h3>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={() => fetchPayments()}
          className="mt-3 text-red-600 hover:text-red-800 underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Payment History
          </h2>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as PaymentStatus | "all")
                }
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshPayments}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading payments...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && payments.length === 0 && (
        <div className="p-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Payments Found
          </h3>
          <p className="text-gray-500">
            {statusFilter === "all"
              ? "You haven't made any payments yet."
              : `No ${statusFilter} payments found.`}
          </p>
        </div>
      )}

      {/* Payments List */}
      {!isLoading && payments.length > 0 && (
        <div className="divide-y divide-gray-200">
          {payments.map((payment: Payment) => (
            <div
              key={payment.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(payment.status)}
                    <h3 className="font-medium text-gray-900">
                      {payment.job.title}
                    </h3>
                    <span className={getStatusBadge(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Freelancer:</span>{" "}
                      {payment.freelancer.user.first_name &&
                      payment.freelancer.user.last_name
                        ? `${payment.freelancer.user.first_name} ${payment.freelancer.user.last_name}`
                        : payment.freelancer.user.username}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(payment.created_at)}
                      </span>

                      {payment.payment_method && (
                        <span>Method: {payment.payment_method}</span>
                      )}

                      {payment.transaction_id && (
                        <span>ID: {payment.transaction_id.slice(-8)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {formatAmount(payment.amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payment.currency.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.currentPage} of {pagination.totalPages}(
              {pagination.totalCount} total payments)
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
