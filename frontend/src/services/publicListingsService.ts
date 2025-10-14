import api from "./api";

// ======================== TYPES ========================

export interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  duration: string | null;
  status: string;
  skills_list: string[];
  created_at: string;
  proposals_count: number;
  client_name: string;
  client_username: string;
}

export interface JobDetail extends Job {
  skills: string;
  requirements: string | null;
  project_details: string | null;
  client: {
    id: number;
    name: string;
    username: string;
    company_name: string;
    email: string;
    created_at: string;
  };
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: JobDetail;
}

export interface Freelancer {
  id: number;
  name: string;
  username: string;
  email: string;
  title: string | null;
  category: string | null;
  rate: number | null;
  skills_list: string[];
  location: string | null;
  profile_picture: string | null;
  bio: string | null;
  created_at: string;
}

export interface FreelancerDetail extends Freelancer {
  user_id: number;
  skills: string;
  user_created_at: string;
  last_login: string | null;
  is_active: boolean;
  email_verified: boolean;
}

export interface FreelancerDetailResponse {
  success: boolean;
  message: string;
  data: FreelancerDetail;
}

export interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface JobsResponse {
  success: boolean;
  message: string;
  data: {
    jobs: Job[];
    pagination: PaginationInfo;
  };
}

export interface FreelancersResponse {
  success: boolean;
  message: string;
  data: {
    freelancers: Freelancer[];
    pagination: PaginationInfo;
  };
}

export interface JobFilters {
  category?: string;
  skills?: string;
  status?: string;
  min_budget?: number;
  max_budget?: number;
  page?: number;
  page_size?: number;
}

export interface FreelancerFilters {
  category?: string;
  skills?: string;
  location?: string;
  rate_min?: number;
  rate_max?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// ======================== SERVICE ========================

export const publicListingsService = {
  // Get all jobs with optional filters
  async getAllJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/auth/jobs/${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return response.data;
  },

  // Get all freelancers with optional filters
  async getAllFreelancers(
    filters: FreelancerFilters = {}
  ): Promise<FreelancersResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/auth/freelancers/${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return response.data;
  },

  // Get job categories (derived from existing jobs)
  async getJobCategories(): Promise<string[]> {
    try {
      const response = await this.getAllJobs({ page_size: 1000 }); // Get many jobs to extract categories
      const filteredCategories = response.data.jobs
        .map((job) => job.category)
        .filter((category): category is string =>
          Boolean(category && category.trim() !== "")
        );
      const categories = [...new Set(filteredCategories)] as string[];
      return categories.sort();
    } catch (error) {
      console.error("Error fetching job categories:", error);
      return [];
    }
  },

  // Get freelancer categories (derived from existing freelancers)
  async getFreelancerCategories(): Promise<string[]> {
    try {
      const response = await this.getAllFreelancers({ page_size: 1000 }); // Get many freelancers to extract categories
      const filteredCategories = response.data.freelancers
        .map((freelancer) => freelancer.category)
        .filter((category): category is string =>
          Boolean(category && category.trim() !== "")
        );
      const categories = [...new Set(filteredCategories)] as string[];
      return categories.sort();
    } catch (error) {
      console.error("Error fetching freelancer categories:", error);
      return [];
    }
  },

  // Format budget for display
  formatBudget(budgetMin: number | null, budgetMax: number | null): string {
    if (budgetMin && budgetMax) {
      return `$${budgetMin.toLocaleString()} - $${budgetMax.toLocaleString()}`;
    } else if (budgetMin) {
      return `$${budgetMin.toLocaleString()}+`;
    } else if (budgetMax) {
      return `Up to $${budgetMax.toLocaleString()}`;
    }
    return "Budget not specified";
  },

  // Format freelancer rate for display
  formatRate(rate: number | null): string {
    if (rate) {
      return `$${rate}/hr`;
    }
    return "Rate not specified";
  },

  // Convert relative time from created_at
  getRelativeTime(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  },

  // Get job details by ID
  async getJobById(jobId: number): Promise<JobDetailResponse> {
    const response = await api.get(`/auth/jobs/${jobId}/`);
    return response.data;
  },

  // Get freelancer details by ID
  async getFreelancerById(
    freelancerId: number
  ): Promise<FreelancerDetailResponse> {
    const response = await api.get(`/auth/freelancers/${freelancerId}/`);
    return response.data;
  },
};

export default publicListingsService;
