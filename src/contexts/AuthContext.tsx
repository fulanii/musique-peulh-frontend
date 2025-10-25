import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      let token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const userDataString = localStorage.getItem("user_data");

      // If we have neither token, user is definitely not authenticated
      if (!token && !refreshToken) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }

      // If no access token but refresh token exists, try to refresh quietly
      if (!token && refreshToken) {
        try {
          await api.refreshToken();
          token = localStorage.getItem("access_token");
        } catch (err) {
          // Refresh failed, but don't block the app - just clear auth state
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          return;
        }
      }

      // Try to get user data if we have it cached
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          const userId = userData.id;

          // Attempt to verify user data, but don't block on failure
          const user = await api.getCurrentUser(userId);
          setIsAuthenticated(true);
          setIsAdmin(user.is_staff || user.is_superuser);
          return;
        } catch (error) {
          // User data verification failed - clear auth state but don't block app
          console.error("Failed to verify user:", error);
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_data");
        }
      }
    } catch (error) {
      // Any other errors, clear auth state but don't block app
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    // Determine if input is email or username
    const isEmail = emailOrUsername.includes("@");
    const loginData = isEmail
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };

    await api.login(loginData);
    await checkAuth();
  };

  const logout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
