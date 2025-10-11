import httpClient from "./httpClient";
import {
  DashboardResponse,
  JobCreateRequest,
  JobCreateResponse,
  JobHistoryResponse,
  PaymentHistoryApiResponse,
  InboxApiResponse,
  ChatMessagesApiResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "@/types/dashboard";

export const dashboardService = {
  // Dashboard overview
  async getDashboard(): Promise<DashboardResponse> {
    const response = await httpClient.get("/auth/dashboard/");
    return response.data;
  },

  // Job management
  async createJob(jobData: JobCreateRequest): Promise<JobCreateResponse> {
    const response = await httpClient.post("/auth/jobs/create/", jobData);
    return response.data;
  },

  async getJobHistory(): Promise<JobHistoryResponse> {
    const response = await httpClient.get("/auth/jobs/history/");
    return response.data;
  },

  async getActiveJobs(): Promise<JobHistoryResponse> {
    const response = await httpClient.get("/auth/jobs/active/");
    return response.data;
  },

  // Payment history
  async getPaymentHistory(): Promise<PaymentHistoryApiResponse> {
    const response = await httpClient.get("/auth/payments/history/");
    return response.data;
  },

  // Inbox and chat
  async getInbox(): Promise<InboxApiResponse> {
    const response = await httpClient.get("/auth/inbox/");
    return response.data;
  },

  async getChatMessages(threadId: number): Promise<ChatMessagesApiResponse> {
    const response = await httpClient.get(`/auth/inbox/${threadId}/messages/`);
    return response.data;
  },

  async sendMessage(
    threadId: number,
    messageData: SendMessageRequest
  ): Promise<SendMessageResponse> {
    const response = await httpClient.post(
      `/auth/inbox/${threadId}/messages/`,
      messageData
    );
    return response.data;
  },
};
