import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// Mock user data for testing
const mockUsers = {
  freelancer: {
    id: 1,
    username: "freelancer1",
    email: "freelancer@example.com",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Doe",
    role: "freelancer" as const,
    phone: "+1234567890",
    bio: "Passionate developer",
    profile_picture: null,
    date_joined: "2024-01-15T10:30:00Z",
    last_login: "2024-10-11T15:30:00Z",
    email_verified: true,
    is_active: true
  },
  client: {
    id: 2,
    username: "client1",
    email: "client@example.com",
    first_name: "Jane",
    last_name: "Smith",
    full_name: "Jane Smith",
    role: "client" as const,
    phone: "+0987654321",
    bio: "Looking for talented developers",
    profile_picture: null,
    date_joined: "2024-02-20T14:45:00Z",
    last_login: "2024-10-11T16:00:00Z",
    email_verified: true,
    is_active: true
  }
};

type MockUser = typeof mockUsers.freelancer | typeof mockUsers.client;

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  switchUser: (role: 'freelancer' | 'client') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Start with freelancer user by default
  const [user, setUser] = useState<MockUser | null>(mockUsers.freelancer);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Mock functions for testing
  const login = async (credentials: any) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAuthenticated(true);
    setUser(mockUsers.freelancer);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  };

  const register = async (data: any) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAuthenticated(true);
    setUser(data.role === 'client' ? mockUsers.client : mockUsers.freelancer);
    setIsLoading(false);
  };

  const updateProfile = async (data: any) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(prev => ({ ...prev, ...data }));
    setIsLoading(false);
  };

  const changePassword = async (data: any) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Function to switch between user types for testing
  const switchUser = (role: 'freelancer' | 'client') => {
    setUser(mockUsers[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
        changePassword,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};