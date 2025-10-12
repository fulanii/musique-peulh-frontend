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
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const userDataString = localStorage.getItem("user_data");
      if (!userDataString) throw new Error("User not found in localStorage");

      const userData = JSON.parse(userDataString); // convert JSON string → object
      const userId = userData.id; // extract id

      // Now use it for your request
      const user = await api.getCurrentUser(userId);

      setIsAuthenticated(true);
      setIsAdmin(user.is_staff || user.is_superuser);
    } catch (error) {
      console.error("Failed to get user:", error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
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
