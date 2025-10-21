import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";

import { signIn, signUp, googleAuth, getUserProfile } from "../api/index";
import type { User } from "../types";

interface JwtPayload {
  id: string;
  username: string;
  useremail: string;
  role: "student" | "instructor" | "admin";
  exp: number;
  iat: number;
}

interface SignFormData {
  username?: string;
  useremail: string;
  password: string;
}

interface GoogleUserData {
  username: string;
  useremail: string;
  googleId: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  signInUser: (formData: SignFormData) => Promise<{ success: boolean }>;
  signUpUser: (formData: SignFormData) => Promise<{ success: boolean }>;
  googleLogin: (googleData: GoogleUserData) => Promise<void>;
  fetchUser: (id: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("token"));
  const navigate = useNavigate();
  const [sessionTimeout,] = useState<NodeJS.Timeout | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("userProfile", JSON.stringify(user));
  };

  const logout = useCallback((reason: "manual" | "expired" = "manual") => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userProfile");
    if (sessionTimeout) clearTimeout(sessionTimeout);

    if (reason === "expired") {
      toast.info("Session expired. Please log in again.");
    } else {
      toast.success("You have been logged out successfully.");
    }

    navigate("/auth");
  }, [navigate, sessionTimeout]);

  const signInUser = async (formData: SignFormData): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      const { data } = await signIn(formData);
      login(data.user, data.token);
      toast.success(data.message || "Signed in successfully!");
      navigate("/home");
      return { success: data.success };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Sign in failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const signUpUser = async (formData: SignFormData): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      const { data } = await signUp(formData);
      toast.success(data.message || "Account created! Please sign in.");
      return { success: data.success };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Sign up failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleData: GoogleUserData) => {
    try {
      setLoading(true);

      const { data } = await googleAuth(googleData);
      login(data.user, data.token);
      toast.success("Google Sign-in successful");
      navigate("/home");
    } catch (error) {
      toast.error("Google Sign-in failed");
      console.log(error);
    } finally {
      setLoading(false);

    }
  };

  const fetchUser = async (id: string): Promise<User | null> => {
    const cachedUser = sessionStorage.getItem("userProfile");
    if (cachedUser) {
      const parsedUser = JSON.parse(cachedUser);
      return parsedUser;
    }
    try {
      setLoading(true);
      const { data } = await getUserProfile(id);
      setUser(data.user);
      sessionStorage.setItem("userProfile", JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {

      if (!token) {
        setInitialLoading(false); // 👈 CASE 1: No token, user not logged in
        return;
      }

      try {
        const decoded: JwtPayload = jwtDecode(token);
        const expTime = decoded.exp * 1000 - Date.now();

        if (expTime <= 0) {
          logout("expired");
          return;
        }

        const cached = sessionStorage.getItem("userProfile");
        if (cached) {
          setUser(JSON.parse(cached));
        } else {
          const res = await getUserProfile(decoded.id);
          setUser(res.data.user);
          sessionStorage.setItem("userProfile", JSON.stringify(res.data.user));
        }

        // Set auto logout
        const timeout = setTimeout(() => logout("expired"), expTime);
        return () => clearTimeout(timeout);

      } catch (err) {
        console.error("Invalid token", err);
        logout("expired");
      } finally {
        setInitialLoading(false);
      }
    };

    initializeUser();
  }, [token]); // ✅ only depend on token


  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, signInUser, signUpUser, googleLogin, fetchUser }}
    >
      {initialLoading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
