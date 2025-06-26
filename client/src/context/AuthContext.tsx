import api from "@/lib/axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { toast } from "sonner";

type User = {
  name: string;
  email: string;
  matricNumber?: string | null;
  department: string;
  profilePicture?: string | null;
  role: "student" | "lecturer";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthenticated = Boolean(user);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await api.post("auth/login", credentials, {
        withCredentials: true,
      });

      if (response.data.user) {
        setUser(response.data.user);
        toast.success("Signed in successful!");
      } else {
        throw new Error(response.data.message || "Sign in failed");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Sign in failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.post(
        "auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);
      toast.success("Signed out successfully.");
    } catch (error) {
      toast.error("Sign out failed.");
      console.error("Signed out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
  try {
    setIsLoading(true);
    const response = await api.get("user/profile/me", {
      withCredentials: true,
    });

    if (response.data.user) {
      setUser(response.data.user);
    } else {
      setUser(null);
    }
  } catch (error: any) {
    setUser(null);
    
    // Don't show error for 401 (user not authenticated) or 403 (forbidden)
    // These are expected when user is not logged in
    const status = error?.response?.status;
    if (isInitialized && status !== 401 && status !== 403) {
      console.error("Auth check failed:", error);
      // Only show toast for unexpected errors (500, network issues, etc.)
      if (status >= 500 || !status) {
        toast.error("Failed to verify authentication.");
      }
    }
  } finally {
    setIsLoading(false);
    setIsInitialized(true);
  }
};

  const refetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("user/profile/me", {
        withCredentials: true,
      });
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      toast.error("Failed to refresh user session.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Enhanced loading state - only false when both initialized and user data is resolved
  const effectiveIsLoading = isLoading || !isInitialized;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading: effectiveIsLoading,
      login,
      logout,
      refetchUser,
    }),
    [user, isAuthenticated, effectiveIsLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
