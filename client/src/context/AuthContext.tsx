import api from "@/lib/axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { asApiError, getApiErrorMessage } from "@/lib/api-error";

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
  const hasInitializedRef = useRef(false);

  const isAuthenticated = Boolean(user);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        setIsLoading(true);
        const response = await api.post("auth/login", credentials, {
          withCredentials: true,
        });

        if (response.data.user) {
          setUser(response.data.user);
          toast.success("Signed in successfully!");
          return;
        }

        throw new Error(response.data.message || "Sign in failed");
      } catch (error: unknown) {
        const apiError = asApiError(error);
        if (apiError.response?.data?.code !== "ACCOUNT_NOT_VERIFIED") {
          toast.error(getApiErrorMessage(error, "Sign in failed"));
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
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
    } catch {
      toast.error("Sign out failed.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
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
    } catch (error: unknown) {
      setUser(null);
      const status = asApiError(error).response?.status;

      if (hasInitializedRef.current && status !== 401 && status !== 403) {
        if (!status || status >= 500) {
          toast.error("Failed to verify authentication.");
        }
      }
    } finally {
      setIsLoading(false);
      hasInitializedRef.current = true;
      setIsInitialized(true);
    }
  }, []);

  const refetchUser = useCallback(async () => {
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
    } catch {
      setUser(null);
      toast.error("Failed to refresh user session.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

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
    [user, isAuthenticated, effectiveIsLoading, login, logout, refetchUser]
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
