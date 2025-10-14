import api from "@/services/api";
import { Dispute } from "@/admin/types";

export interface AdminDisputeListResponse {
  message: string;
  data: {
    disputes: Dispute[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}

export interface AdminDisputeResolveRequest {
  action: "resolve" | "dismiss";
  resolution?: string;
}

export interface AdminDisputeResolveResponse {
  message: string;
  data: {
    dispute: Dispute;
  };
}

class AdminDisputeService {
  private baseUrl = "/admin/disputes";

  async getDisputes(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<AdminDisputeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    const response = await api.get(`${this.baseUrl}/?${params}`);
    return response.data;
  }

  async resolveDispute(
    disputeId: number,
    data: AdminDisputeResolveRequest
  ): Promise<AdminDisputeResolveResponse> {
    const response = await api.patch(
      `${this.baseUrl}/${disputeId}/resolve/`,
      data
    );
    return response.data;
  }
}

export const adminDisputeService = new AdminDisputeService();
