// Dashboard and Job Types
export interface DashboardStats {
  // Client stats
  total_jobs_posted?: number;
  active_jobs?: number;
  completed_jobs?: number;
  total_spent?: number;

  // Freelancer stats
  total_earned?: number;

  // Shared stats
  unread_messages?: number;
}

export interface DashboardData {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    profile_picture?: string;
  };
  stats: DashboardStats;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  duration?: string;
  category?: string;
  skills?: string;
  requirements?: string;
  project_details?: string;
  status: "pending" | "open" | "in_progress" | "completed" | "cancelled";
  proposals_count: number;
  created_at: string;
  client?: {
    id: number;
    name: string;
    company_name?: string;
  };
}

export interface JobCreateRequest {
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  duration?: string;
  category?: string;
  skills?: string;
  requirements?: string;
  project_details?: string;
}

export interface JobResponse {
  jobs: Job[];
  total_count: number;
}

// Payment Types
export interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method?: string;
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
  job: {
    id: number;
    title: string;
  };
  client?: {
    id: number;
    name: string;
    company_name?: string;
  };
  freelancer?: {
    id: number;
    name: string;
  };
  type: "payment_made" | "payment_received";
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  total_count: number;
  total_amount: number;
  currency: string;
}

// Chat and Inbox Types
export interface ChatThread {
  id: number;
  other_user: {
    id: number;
    name: string;
    role: "client" | "freelancer";
    profile_picture?: string;
    company_name?: string;
  };
  job?: {
    id: number;
    title: string;
  };
  last_message?: {
    id: number;
    message: string;
    sender: string;
    sent_at: string;
  };
  created_at: string;
  unread_count: number;
}

export interface ChatMessage {
  id: number;
  message: string;
  sender: {
    id: number;
    name: string;
    role: string;
    profile_picture?: string;
  };
  sent_at: string;
  is_own_message: boolean;
}

export interface ChatThreadInfo {
  id: number;
  client: {
    id: number;
    name: string;
    company_name?: string;
  };
  freelancer: {
    id: number;
    name: string;
  };
  job?: {
    id: number;
    title: string;
  };
  created_at: string;
}

export interface InboxResponse {
  threads: ChatThread[];
  total_count: number;
}

export interface ChatMessagesResponse {
  thread: ChatThreadInfo;
  messages: ChatMessage[];
  total_count: number;
}

export interface SendMessageRequest {
  message: string;
}

// API Response Types
export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

export interface JobCreateResponse {
  success: boolean;
  message: string;
  data: Job;
}

export interface JobHistoryResponse {
  success: boolean;
  message: string;
  data: JobResponse;
}

export interface PaymentHistoryApiResponse {
  success: boolean;
  message: string;
  data: PaymentHistoryResponse;
}

export interface InboxApiResponse {
  success: boolean;
  message: string;
  data: InboxResponse;
}

export interface ChatMessagesApiResponse {
  success: boolean;
  message: string;
  data: ChatMessagesResponse;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: ChatMessage;
}
