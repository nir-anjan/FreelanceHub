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

class HttpClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If we're already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getStoredRefreshToken();
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await this.refreshTokenRequest(refreshToken);
            const newToken = response.data.access;

            this.storeToken(newToken);
            this.processQueue(null, newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.clearTokens();
            this.redirectToLogin();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other error cases
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private async refreshTokenRequest(
    refreshToken: string
  ): Promise<AxiosResponse<RefreshTokenResponse>> {
    return axios.post(
      `${this.axiosInstance.defaults.baseURL}/auth/token/refresh/`,
      {
        refresh: refreshToken,
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private handleApiError(error: any) {
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
  }

  private redirectToLogin() {
    // Clear any existing auth state
    window.dispatchEvent(new CustomEvent("auth:logout"));

    // Redirect to login page
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  // Token management methods
  private getStoredToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  private storeToken(token: string): void {
    localStorage.setItem("access_token", token);
  }

  private storeTokens(tokenData: TokenData): void {
    localStorage.setItem("access_token", tokenData.access);
    localStorage.setItem("refresh_token", tokenData.refresh);
  }

  private clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  }

  // Public methods for token management
  public setTokens(tokenData: TokenData): void {
    this.storeTokens(tokenData);
  }

  public clearAllTokens(): void {
    this.clearTokens();
  }

  public getAccessToken(): string | null {
    return this.getStoredToken();
  }

  public isAuthenticated(): boolean {
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
  }

  // HTTP methods
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get(url, config);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put(url, data, config);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete(url, config);
  }
}

// Create and export a singleton instance
const httpClient = new HttpClient();
export default httpClient;
