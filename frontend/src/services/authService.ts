import httpClient from "./httpClient";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  ProfileResponse,
  TokenRefreshResponse,
  LogoutResponse,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  DecodedToken,
  UserRole,
} from "@/types/auth";

class AuthService {
  private readonly ENDPOINTS = {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    LOGOUT: "/auth/logout/",
    PROFILE: "/auth/profile/",
    CREATE_ROLE_PROFILE: "/auth/profile/create-role/",
    REFRESH_TOKEN: "/auth/token/refresh/",
    CHANGE_PASSWORD: "/auth/password/change/",
  };

  /**
   * Authenticate user with email/username and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>(
        this.ENDPOINTS.LOGIN,
        credentials
      );

      if (response.data.success) {
        // Store tokens and user data
        httpClient.setTokens({
          access: response.data.data.access,
          refresh: response.data.data.refresh,
        });

        this.storeUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await httpClient.post<RegisterResponse>(
        this.ENDPOINTS.REGISTER,
        userData
      );

      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout user and blacklist tokens
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getStoredRefreshToken();

      if (refreshToken) {
        await httpClient.post<LogoutResponse>(this.ENDPOINTS.LOGOUT, {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  /**
   * Get current user profile (including role-specific profile)
   */
  async getProfile(): Promise<any> {
    try {
      const response = await httpClient.get(this.ENDPOINTS.PROFILE);

      if (response.data.success) {
        // Store the user data from the combined response
        this.storeUserData(response.data.data.user);
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile (and/or role-specific profile)
   */
  async updateProfile(data: any): Promise<any> {
    try {
      const response = await httpClient.put(this.ENDPOINTS.PROFILE, data);

      if (response.data.success) {
        // Store the user data from the combined response
        this.storeUserData(response.data.data.user);
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create role-specific profile (freelancer/client) using the combined profile endpoint
   */
  async createRoleProfile(data: any): Promise<any> {
    try {
      const response = await httpClient.post(this.ENDPOINTS.PROFILE, data);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user has completed role-specific profile setup
   */
  async hasRoleProfile(): Promise<boolean> {
    try {
      const profileData = await this.getProfile();
      return profileData.has_role_profile || false;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get role-specific profile data (freelancer/client)
   */
  async getRoleProfile(): Promise<any> {
    try {
      const profileData = await this.getProfile();
      return profileData.role_profile || null;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    try {
      const response = await httpClient.post(
        this.ENDPOINTS.CHANGE_PASSWORD,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    try {
      const refreshToken = this.getStoredRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await httpClient.post<TokenRefreshResponse>(
        this.ENDPOINTS.REFRESH_TOKEN,
        { refresh: refreshToken }
      );

      if (response.data.success) {
        localStorage.setItem("access_token", response.data.data.access);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      this.clearAuthData();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return httpClient.isAuthenticated();
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get user role from stored token
   */
  getUserRole(): UserRole | null {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      const decoded = this.decodeToken(token);
      return (decoded?.role as UserRole) || null;
    } catch {
      return null;
    }
  }

  /**
   * Decode JWT token
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Get role-based redirect path
   */
  getRoleBasedRedirect(role: UserRole): string {
    const redirects = {
      freelancer: "/",
      client: "/",
      admin: "/admin",
    };

    return redirects[role] || "/";
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole("admin");
  }

  /**
   * Check if user is freelancer
   */
  isFreelancer(): boolean {
    return this.hasRole("freelancer");
  }

  /**
   * Check if user is client
   */
  isClient(): boolean {
    return this.hasRole("client");
  }

  // Private helper methods
  private storeUserData(user: User): void {
    localStorage.setItem("user_data", JSON.stringify(user));
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  private clearAuthData(): void {
    httpClient.clearAllTokens();

    // Dispatch logout event for auth context
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  private handleAuthError(error: any): Error {
    if (error.response?.data) {
      const errorData = error.response.data;

      if (!errorData.success && errorData.message) {
        return new Error(errorData.message);
      }

      if (errorData.errors) {
        // Handle field-specific errors
        const firstError = Object.values(errorData.errors)[0];
        const errorMessage = Array.isArray(firstError)
          ? firstError[0]
          : firstError;
        return new Error(errorMessage as string);
      }
    }

    return new Error(error.message || "An unexpected error occurred");
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
