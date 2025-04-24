import api from "@/lib/axios";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";

type User = {
  matricNumber?: string | null;
  email: string;
  profilePicture?: string | null;
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

      if (response.data.user) {
        setUser(response.data.user);
      } else {
        throw new Error("Login failed");
      }
      return response.data;
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

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;

      const fetchUser = async () => {
        try {
          const response = await api.get("user/profile/me", {
            withCredentials: true,
          });
          if (response.data.success) {
            setUser(response.data.user);
            console.log("User fetched from cookie:", response.data.user);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setUser(null);
        }
      };

      fetchUser();
    }
  }, []); // Empty dependency array

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
