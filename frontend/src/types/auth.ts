// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'freelancer' | 'client' | 'admin';
  phone?: string;
  bio?: string;
  profile_picture?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  email_verified: boolean;
}

// Authentication Request Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'freelancer' | 'client';
  phone?: string;
  bio?: string;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ProfileUpdateRequest {
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  profile_picture?: string;
}

// Authentication Response Types
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access: string;
    refresh: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface TokenRefreshResponse {
  success: boolean;
  message: string;
  data: {
    access: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Error Response Type
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Token Types
export interface TokenData {
  access: string;
  refresh: string;
}

export interface DecodedToken {
  user_id: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  changePassword: (data: PasswordChangeRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
}

// Role-based types
export type UserRole = 'freelancer' | 'client' | 'admin';

export interface RolePermissions {
  canAccessAdmin: boolean;
  canPostJobs: boolean;
  canApplyToJobs: boolean;
  canManageUsers: boolean;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}