import api from "@/lib/axios";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type User = {
  name: string;
  matricNumber?: string;
  email: string;
  password: string;
  department: string;
  profilePic?: string;
  role: "student" | "lecturer";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post("auth/login", credentials, {
        withCredentials: true, // Needed for sending/receiving cookies
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("auth/logout", null, {
        withCredentials: true,
      });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    // Automatically fetch user if already logged in (cookie exists)
    api
      .get("user/profile/me", { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
