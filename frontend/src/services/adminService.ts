import httpClient from "./httpClient";

// ======================== TYPES ========================

export interface AdminStats {
  total_users: number;
  total_clients: number;
  total_freelancers: number;
  total_jobs: number;
  pending_jobs: number;
  open_jobs: number;
  total_payments: number;
  open_disputes: number;
  monthly_revenue: number;
}

export interface RecentJob {
  id: number;
  title: string;
  client: string;
  status: string;
  created_at: string;
}

export interface RecentPayment {
  id: number;
  amount: number;
  client: string;
  freelancer: string;
  status: string;
  created_at: string;
}

export interface AdminOverviewResponse {
  success: boolean;
  message: string;
  data: {
    stats: AdminStats;
    recent_activity: {
      recent_jobs: RecentJob[];
      recent_payments: RecentPayment[];
    };
  };
}

export interface PendingJob {
  id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  duration: string | null;
  status: string;
  client: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
  created_at: string;
}

export interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PendingJobsResponse {
  success: boolean;
  message: string;
  data: {
    jobs: PendingJob[];
    pagination: PaginationInfo;
  };
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  freelancer_data?: {
    title: string;
    category: string;
    rate: number | null;
    skills: string;
    location: string;
    bio: string;
    total_jobs_done: number;
  };
  client_data?: {
    company_name: string;
    total_jobs_posted: number;
    completed_jobs: number;
  };
}

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: AdminUser[];
    pagination: PaginationInfo;
  };
}

export interface AdminDispute {
  id: number;
  job: {
    id: number;
    title: string;
  };
  client: {
    id: number;
    name: string;
    username: string;
  };
  freelancer: {
    id: number;
    name: string;
    username: string;
  };
  description: string;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface AdminDisputesResponse {
  success: boolean;
  message: string;
  data: {
    disputes: AdminDispute[];
    pagination: PaginationInfo;
  };
}

export interface AdminPayment {
  id: number;
  job: {
    id: number;
    title: string;
  };
  client: {
    id: number;
    name: string;
    username: string;
  };
  freelancer: {
    id: number;
    name: string;
    username: string;
  };
  amount: number;
  currency: string;
  payment_method: string | null;
  status: string;
  transaction_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface AdminPaymentsResponse {
  success: boolean;
  message: string;
  data: {
    payments: AdminPayment[];
    pagination: PaginationInfo;
  };
}

export interface JobActionResponse {
  success: boolean;
  message: string;
  data?: {
    job_id: number;
    status: string;
  };
}

export interface DisputeActionResponse {
  success: boolean;
  message: string;
}

// Filter types
export interface AdminUserFilters {
  role?: string;
  page?: number;
  page_size?: number;
}

export interface AdminDisputeFilters {
  status?: string;
  page?: number;
  page_size?: number;
}

export interface AdminPaymentFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface AdminJobFilters {
  page?: number;
  page_size?: number;
}

// ======================== SERVICE ========================

export const adminService = {
  // Admin overview
  async getOverview(): Promise<AdminOverviewResponse> {
    const response = await httpClient.get("/auth/admin/overview/");
    return response.data;
  },

  // Job moderation
  async getPendingJobs(
    filters: AdminJobFilters = {}
  ): Promise<PendingJobsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/auth/admin/jobs/pending/${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await httpClient.get(url);
    return response.data;
  },

  async approveJob(jobId: number): Promise<JobActionResponse> {
    const response = await httpClient.post(
      `/auth/admin/jobs/${jobId}/approve/`
    );
    return response.data;
  },

  async rejectJob(jobId: number): Promise<JobActionResponse> {
    const response = await httpClient.post(`/auth/admin/jobs/${jobId}/reject/`);
    return response.data;
  },

  // User management
  async getUsers(filters: AdminUserFilters = {}): Promise<AdminUsersResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/auth/admin/users/${queryString ? `?${queryString}` : ""}`;

    const response = await httpClient.get(url);
    return response.data;
  },

  // Dispute management
  async getDisputes(
    filters: AdminDisputeFilters = {}
  ): Promise<AdminDisputesResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/auth/admin/disputes/${queryString ? `?${queryString}` : ""}`;

    const response = await httpClient.get(url);
    return response.data;
  },

  async resolveDispute(
    disputeId: number,
    resolution: string
  ): Promise<DisputeActionResponse> {
    const response = await httpClient.post(
      `/auth/admin/disputes/${disputeId}/resolve/`,
      {
        resolution,
      }
    );
    return response.data;
  },

  async dismissDispute(
    disputeId: number,
    resolution?: string
  ): Promise<DisputeActionResponse> {
    const response = await httpClient.post(
      `/auth/admin/disputes/${disputeId}/dismiss/`,
      {
        resolution: resolution || "Dispute dismissed by admin",
      }
    );
    return response.data;
  },

  // Payment monitoring
  async getPayments(
    filters: AdminPaymentFilters = {}
  ): Promise<AdminPaymentsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/auth/admin/payments/${queryString ? `?${queryString}` : ""}`;

    const response = await httpClient.get(url);
    return response.data;
  },

  // Utility functions
  formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return this.formatDate(dateString);
    }
  },

  getStatusColor(status: string): string {
    const statusColors = {
      // Job statuses
      pending: "yellow",
      open: "blue",
      in_progress: "orange",
      completed: "green",
      cancelled: "red",

      // Payment statuses
      failed: "red",
      refunded: "gray",

      // Dispute statuses
      resolved: "green",
      dismissed: "gray",

      // User status
      active: "green",
      inactive: "red",
    };

    return statusColors[status] || "gray";
  },

  getStatusBadgeVariant(
    status: string
  ): "default" | "secondary" | "destructive" | "outline" {
    const statusVariants = {
      pending: "outline",
      open: "default",
      completed: "secondary",
      cancelled: "destructive",
      failed: "destructive",
      resolved: "secondary",
      dismissed: "outline",
    };

    return statusVariants[status] || "outline";
  },
};

export default adminService;
