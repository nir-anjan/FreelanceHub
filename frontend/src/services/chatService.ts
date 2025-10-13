import httpClient from "./httpClient";

// Enhanced types for the new chat system
export interface ChatThreadEnhanced {
  id: number;
  client: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    company_name?: string;
  };
  freelancer: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    title?: string;
    rate?: number;
  };
  job?: {
    id: number;
    title: string;
  };
  created_at: string;
  last_message_at: string;
  is_active: boolean;
  last_message?: {
    id: number;
    message: string;
    sender: {
      id: number;
      username: string;
    };
    message_type: string;
    sent_at: string;
  };
  unread_count: number;
  participant_info?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface ChatMessageEnhanced {
  id: number;
  thread: number;
  sender: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  sender_type: "client" | "freelancer";
  message: string;
  message_type:
    | "text"
    | "system"
    | "payment_completed"
    | "dispute_created"
    | "job_update";
  sent_at: string;
  is_read: boolean;
  edited_at?: string;
  metadata?: any;
}

export interface CreateThreadRequest {
  client_id: number;
  freelancer_id: number;
  job_id?: number;
}

export interface SendMessageRequest {
  message: string;
  message_type?:
    | "text"
    | "system"
    | "payment_completed"
    | "dispute_created"
    | "job_update";
  metadata?: any;
}

export interface CreateDisputeRequest {
  subject: string;
  description: string;
}

export interface InitiatePaymentRequest {
  amount: number;
  description?: string;
}

export interface JobUpdateRequest {
  job_status: string;
  message?: string;
}

export interface MarkReadRequest {
  message_ids: number[];
}

export interface ThreadListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ChatThreadEnhanced[];
}

export interface MessageListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ChatMessageEnhanced[];
}

export interface UnreadCountResponse {
  unread_count: number;
}

class ChatService {
  private baseUrl = "/chat";

  // Thread management
  async getThreads(page = 1): Promise<ThreadListResponse> {
    const response = await httpClient.get<ThreadListResponse>(
      `${this.baseUrl}/threads/?page=${page}`
    );
    return response.data;
  }

  async getThread(threadId: number): Promise<ChatThreadEnhanced> {
    const response = await httpClient.get<ChatThreadEnhanced>(
      `${this.baseUrl}/threads/${threadId}/`
    );
    return response.data;
  }

  async createThread(data: CreateThreadRequest): Promise<ChatThreadEnhanced> {
    const response = await httpClient.post<ChatThreadEnhanced>(
      `${this.baseUrl}/threads/`,
      data
    );
    return response.data;
  }

  async getThreadByParticipants(
    clientId: number,
    freelancerId: number,
    jobId?: number
  ): Promise<ChatThreadEnhanced> {
    const params = new URLSearchParams({
      client_id: clientId.toString(),
      freelancer_id: freelancerId.toString(),
    });
    if (jobId) {
      params.append("job_id", jobId.toString());
    }
    const response = await httpClient.get<ChatThreadEnhanced>(
      `${this.baseUrl}/threads/by-participants/?${params}`
    );
    return response.data;
  }

  // Message management
  async getMessages(threadId: number, page = 1): Promise<MessageListResponse> {
    const response = await httpClient.get<MessageListResponse>(
      `${this.baseUrl}/threads/${threadId}/messages/?page=${page}`
    );
    return response.data;
  }

  async sendMessage(
    threadId: number,
    data: SendMessageRequest
  ): Promise<ChatMessageEnhanced> {
    const response = await httpClient.post<ChatMessageEnhanced>(
      `${this.baseUrl}/threads/${threadId}/messages/`,
      data
    );
    return response.data;
  }

  async getMessage(messageId: number): Promise<ChatMessageEnhanced> {
    const response = await httpClient.get<ChatMessageEnhanced>(
      `${this.baseUrl}/messages/${messageId}/`
    );
    return response.data;
  }

  async editMessage(
    messageId: number,
    message: string
  ): Promise<ChatMessageEnhanced> {
    const response = await httpClient.put<ChatMessageEnhanced>(
      `${this.baseUrl}/messages/${messageId}/`,
      { message }
    );
    return response.data;
  }

  async deleteMessage(messageId: number): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/messages/${messageId}/`);
  }

  async markMessagesRead(
    threadId: number,
    messageIds: number[]
  ): Promise<void> {
    await httpClient.post(`${this.baseUrl}/threads/${threadId}/mark-read/`, {
      message_ids: messageIds,
    });
  }

  // Integration features
  async createDispute(
    threadId: number,
    data: CreateDisputeRequest
  ): Promise<any> {
    const response = await httpClient.post(
      `${this.baseUrl}/threads/${threadId}/create-dispute/`,
      data
    );
    return response.data;
  }

  async initiatePayment(
    threadId: number,
    data: InitiatePaymentRequest
  ): Promise<any> {
    const response = await httpClient.post(
      `${this.baseUrl}/threads/${threadId}/initiate-payment/`,
      data
    );
    return response.data;
  }

  async sendJobUpdate(threadId: number, data: JobUpdateRequest): Promise<any> {
    const response = await httpClient.post(
      `${this.baseUrl}/threads/${threadId}/job-update/`,
      data
    );
    return response.data;
  }

  // Utility
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await httpClient.get<UnreadCountResponse>(
      `${this.baseUrl}/unread-count/`
    );
    return response.data;
  }

  // Workflow integration methods
  async hireFreelancer(freelancerId: number): Promise<{
    thread: ChatThreadEnhanced;
    created: boolean;
    redirect_url: string;
  }> {
    const response = await httpClient.post(`${this.baseUrl}/hire-freelancer/`, {
      freelancer_id: freelancerId,
    });
    return response.data;
  }

  async createProposalChat(jobId: number): Promise<{
    thread: ChatThreadEnhanced;
    created: boolean;
    redirect_url: string;
  }> {
    const response = await httpClient.post(`${this.baseUrl}/proposal-chat/`, {
      job_id: jobId,
    });
    return response.data;
  }
}

export const chatService = new ChatService();
export default chatService;
