import React, { useState } from "react";
import { PaymentButton, PaymentModal } from "../components/PaymentButton";
import PaymentHistory from "../components/PaymentHistory";
import { CreditCard, History, User, Briefcase, DollarSign } from "lucide-react";

/**
 * Example component showing how to integrate Razorpay payment system
 * This demonstrates the usage of PaymentButton, PaymentModal, and PaymentHistory components
 */
export const PaymentExamplePage: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"payment" | "history">("payment");

  // Mock data for demonstration
  const mockJobData = {
    jobId: 1,
    freelancerId: 2,
    amount: 5000,
    jobTitle: "E-commerce Website Development",
    freelancerName: "John Doe",
    jobDescription:
      "Build a complete e-commerce website using React and Node.js with payment gateway integration and admin panel.",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Integration Demo
          </h1>
          <p className="text-gray-600">
            Razorpay integration for freelancer payments
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("payment")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "payment"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Make Payment
                </span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Payment History
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "payment" && (
              <div className="space-y-6">
                {/* Job Details Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Job Details
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {mockJobData.jobTitle}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {mockJobData.jobDescription}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Freelancer: {mockJobData.freelancerName}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Project Amount
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{mockJobData.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Options
                  </h3>

                  <div className="space-y-4">
                    {/* Direct Payment Button */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Direct Payment
                        </h4>
                        <p className="text-sm text-gray-600">
                          Pay immediately using the button below
                        </p>
                      </div>

                      <PaymentButton
                        jobId={mockJobData.jobId}
                        freelancerId={mockJobData.freelancerId}
                        amount={mockJobData.amount}
                        jobTitle={mockJobData.jobTitle}
                        freelancerName={mockJobData.freelancerName}
                        onSuccess={() => {
                          alert("Payment successful! Redirecting...");
                          // Handle success - redirect, refresh data, etc.
                        }}
                        onError={(error) => {
                          console.error("Payment error:", error);
                          // Handle error - show notification, etc.
                        }}
                      />
                    </div>

                    {/* Modal Payment Button */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Modal Payment
                        </h4>
                        <p className="text-sm text-gray-600">
                          Review details before payment in a modal
                        </p>
                      </div>

                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Pay via Modal
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Payment Information
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• This is a sandbox environment for testing</li>
                    <li>• Use test payment credentials provided by Razorpay</li>
                    <li>• No real money will be charged</li>
                    <li>• Payment status will be updated in real-time</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <PaymentHistory />
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          jobId={mockJobData.jobId}
          freelancerId={mockJobData.freelancerId}
          amount={mockJobData.amount}
          jobTitle={mockJobData.jobTitle}
          freelancerName={mockJobData.freelancerName}
          jobDescription={mockJobData.jobDescription}
        />
      </div>
    </div>
  );
};

export default PaymentExamplePage;
