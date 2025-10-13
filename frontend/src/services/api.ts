import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "@/hooks/use-toast";

// Types for token management
interface TokenData {
  access: string;
  refresh: string;
}

interface RefreshTokenResponse {
  access: string;
}

// Create the main Axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management functions
const tokenManager = {
  getStoredToken(): string | null {
    return localStorage.getItem("access_token");
  },

  getStoredRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  },

  storeToken(token: string): void {
    localStorage.setItem("access_token", token);
  },

  storeTokens(tokenData: TokenData): void {
    localStorage.setItem("access_token", tokenData.access);
    localStorage.setItem("refresh_token", tokenData.refresh);
  },

  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  },

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // Basic JWT validation - check if token is expired
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },
};

// Queue for failed requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

// Process the queue of failed requests
const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Refresh token function
const refreshTokenRequest = async (
  refreshToken: string
): Promise<AxiosResponse<RefreshTokenResponse>> => {
  return axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
    refresh: refreshToken,
  });
};

// Handle API errors with user-friendly messages
const handleApiError = (error: any) => {
  if (error.response?.status === 403) {
    toast({
      title: "Access Denied",
      description: "You do not have permission to perform this action.",
      variant: "destructive",
    });
  } else if (error.response?.status >= 500) {
    toast({
      title: "Server Error",
      description: "Something went wrong on our end. Please try again later.",
      variant: "destructive",
    });
  } else if (error.code === "NETWORK_ERROR" || !error.response) {
    toast({
      title: "Network Error",
      description: "Please check your internet connection and try again.",
      variant: "destructive",
    });
  }
};

// Redirect to login page
const redirectToLogin = () => {
  // Clear any existing auth state
  window.dispatchEvent(new CustomEvent("auth:logout"));

  // Redirect to login page
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Request interceptor - add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenManager.getStoredRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await refreshTokenRequest(refreshToken);
        const newToken = response.data.access;

        tokenManager.storeToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error cases
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Export the configured Axios instance and token manager
export { tokenManager };
export default api;
