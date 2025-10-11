import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts";
import { dashboardService } from "@/services";
import { Payment, PaymentHistoryResponse } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  IndianRupee,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState<PaymentHistoryResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getPaymentHistory();
      if (response.success) {
        setPaymentData(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        variant: "secondary" as const,
        icon: Clock,
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800",
      },
      completed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Completed",
        color: "bg-green-100 text-green-800",
      },
      failed: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Failed",
        color: "bg-red-100 text-red-800",
      },
      refunded: {
        variant: "outline" as const,
        icon: AlertCircle,
        label: "Refunded",
        color: "bg-gray-100 text-gray-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getPaymentTypeIcon = (type: string) => {
    if (type === "payment_made") {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  const getPaymentTypeLabel = (type: string) => {
    return type === "payment_made" ? "Payment Made" : "Payment Received";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const payments = paymentData?.payments || [];
  const completedPayments = payments.filter((p) => p.status === "completed");
  const pendingPayments = payments.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-8 w-8 mr-3" />
            Payment History
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your{" "}
            {user?.role === "client"
              ? "payments to freelancers"
              : "earnings from projects"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total {user?.role === "client" ? "Spent" : "Earned"}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(paymentData?.total_amount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold">{completedPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payment history</h3>
              <p className="text-muted-foreground">
                {user?.role === "client"
                  ? "Start by posting jobs and hiring freelancers to see payment history."
                  : "Complete projects to start earning and see your payment history."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card
                  key={payment.id}
                  className="border-l-4 border-l-primary/20"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getPaymentTypeIcon(payment.type)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {payment.job.title}
                            </h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {user?.role === "client" && payment.freelancer && (
                              <span>To: {payment.freelancer.name}</span>
                            )}
                            {user?.role === "freelancer" && payment.client && (
                              <span>
                                From: {payment.client.name}
                                {payment.client.company_name &&
                                  ` (${payment.client.company_name})`}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {payment.paid_at
                                  ? `Paid on ${formatDate(payment.paid_at)}`
                                  : `Created on ${formatDate(
                                      payment.created_at
                                    )}`}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getPaymentTypeLabel(payment.type)}
                        </div>
                        {payment.payment_method && (
                          <div className="text-xs text-muted-foreground">
                            via {payment.payment_method}
                          </div>
                        )}
                        {payment.transaction_id && (
                          <div className="text-xs text-muted-foreground">
                            ID: {payment.transaction_id}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
