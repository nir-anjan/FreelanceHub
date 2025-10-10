// Job related types
export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: "fixed" | "hourly";
  client: {
    name: string;
    avatar?: string;
    rating: number;
  };
  category: string;
  skills: string[];
  duration: string;
  location: string;
  postedDate: string;
  status: "pending" | "approved" | "rejected";
}

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "client" | "freelancer" | "admin";
  avatar?: string;
  joinDate: string;
  isActive: boolean;
  rating?: number;
  completedJobs?: number;
}

// Dispute related types
export interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  client: {
    id: string;
    name: string;
    avatar?: string;
  };
  freelancer: {
    id: string;
    name: string;
    avatar?: string;
  };
  amount: number;
  description: string;
  status: "open" | "resolved";
  createdDate: string;
  resolvedDate?: string;
  adminNotes?: string;
}

// Transaction related types
export interface Transaction {
  id: string;
  type: "payment" | "withdrawal" | "refund" | "fee";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  from: {
    id: string;
    name: string;
    type: "client" | "freelancer" | "platform";
  };
  to: {
    id: string;
    name: string;
    type: "client" | "freelancer" | "platform";
  };
  jobId?: string;
  jobTitle?: string;
  paymentMethod: string;
  transactionDate: string;
  completedDate?: string;
  notes?: string;
}

// Admin dashboard stats
export interface DashboardStats {
  totalUsers: number;
  jobsPending: number;
  activeDisputes: number;
  monthlyRevenue: number;
  userGrowth: number;
  disputeReduction: number;
  revenueGrowth: number;
}
