import api from "@/lib/axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { toast } from "sonner"; // or use your preferred toast library

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
  const isAuthenticated = Boolean(user);

  const login = async (credentials: { email: string; password: string }) => {
    try {
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
    }
  };

  const logout = async () => {
    try {
      await api.post(
        "auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);
      toast.success("Logged out successfully.");
    } catch (error) {
      toast.error("Logout failed.");
      console.error("Logout error:", error);
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
        // console.log("User authenticated from session:", response.data.user);
      }
    } catch (error) {
      setUser(null);
      toast.error("Session expired or unauthorized.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("user/profile/me", {
        withCredentials: true,
      });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      setUser(null);
      toast.error("Failed to refresh user session.");
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refetchUser,
    }),
    [user, isAuthenticated, isLoading]
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
