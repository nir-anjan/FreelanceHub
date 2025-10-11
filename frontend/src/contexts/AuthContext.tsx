import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services";
import {
  User,
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  ProfileUpdateRequest,
  PasswordChangeRequest,
} from "@/types/auth";
import { toast } from "@/hooks/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();

    // Listen for logout events from httpClient
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      if (authService.isAuthenticated()) {
        // Try to get user profile to verify token validity
        const userData = authService.getStoredUser();

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // If no stored user data, fetch from server
          const profile = await authService.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      // Clear any invalid tokens
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    credentials: LoginRequest,
    isFromRegistration = false
  ): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await authService.login(credentials);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.user.first_name}!`,
        });

        // If coming from registration, always redirect to profile setup for freelancers/clients
        if (
          isFromRegistration &&
          (response.data.user.role === "freelancer" ||
            response.data.user.role === "client")
        ) {
          navigate("/profile-setup", { replace: true });
        } else if (
          !isFromRegistration &&
          (response.data.user.role === "freelancer" ||
            response.data.user.role === "client")
        ) {
          // For normal login, check if user has completed profile setup
          try {
            const hasProfile = await authService.hasRoleProfile();
            if (!hasProfile) {
              navigate("/profile-setup", { replace: true });
            } else {
              const redirectPath = authService.getRoleBasedRedirect(
                response.data.user.role
              );
              navigate(redirectPath, { replace: true });
            }
          } catch (error) {
            // If check fails, redirect to profile setup to be safe
            navigate("/profile-setup", { replace: true });
          }
        } else {
          // For admin users, redirect normally
          const redirectPath = authService.getRoleBasedRedirect(
            response.data.user.role
          );
          navigate(redirectPath, { replace: true });
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await authService.register(userData);

      if (response.success) {
        toast({
          title: "Registration Successful",
          description:
            "Your account has been created. Let's set up your profile!",
        });

        // Automatically log in the user after successful registration
        await login(
          {
            username: userData.username,
            password: userData.password,
          },
          true
        ); // Pass true to indicate this is from registration
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description:
          error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      await authService.logout();

      setUser(null);
      setIsAuthenticated(false);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });

      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("Logout error:", error);

      // Even if API call fails, clear local state and redirect
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateRequest): Promise<void> => {
    try {
      setIsLoading(true);

      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: PasswordChangeRequest): Promise<void> => {
    try {
      setIsLoading(true);

      await authService.changePassword(data);

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description:
          error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Force logout on refresh failure
      await logout();
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// HOC for components that need auth
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate("/login", { replace: true });
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
};
