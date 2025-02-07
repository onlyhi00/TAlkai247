import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "./types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data: AuthResponse = await response.json();
      localStorage.setItem("user", JSON.stringify(data.data.user));

      setUser(data.data.user);
    } catch (err) {
      setError(err.message);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // Mock login - in real app this would call the API
      // const mockUser = {
      //   id: "1",
      //   email: credentials.email,
      //   name: credentials.email.split("@")[0],
      // };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data: AuthResponse = await response.json();

      localStorage.setItem("token", data.data.token);

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.data.user));

      setUser(data.data.user);

      // Navigate to dashboard
      navigate("/dashboard");

      toast({
        title: "Success",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (signUpData: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });

      if (!response.ok) {
        throw new Error("Failed to create account");
      }

      const data: AuthResponse = await response.json();

      localStorage.setItem("token", data.data.token);

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.data.user));

      navigate("/dashboard");

      toast({
        title: "Success",
        description: "Account created successfully!",
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
    toast({
      title: "Success",
      description: "You have been logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
