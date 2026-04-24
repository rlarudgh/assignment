"use client";

import type { User, UserRole } from "@/entities/user/user.types";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (showToast?: boolean) => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  getToken: () => string | null;
  handleSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_token";
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Periodic token validation
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      validateToken(token);
    }, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [token]);

  const validateToken = async (authToken: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        handleSessionExpired();
        return false;
      }
      return true;
    } catch {
      // Network error - don't logout immediately, but mark as potentially expired
      return false;
    }
  };

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        handleSessionExpired();
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        switch (error.code) {
          case "INVALID_CREDENTIALS":
            toast.error("이메일 또는 비밀번호가 올바르지 않습니다");
            break;
          case "TOKEN_EXPIRED":
            toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
            break;
          default:
            toast.error(error.message || "로그인에 실패했습니다");
        }
        throw new Error(error.message);
      }

      const data = await response.json();
      localStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`${data.user.name}님, 환영합니다!`);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async (showToast = true) => {
    const currentToken = localStorage.getItem(STORAGE_KEY);
    if (currentToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch {
        // Ignore logout API errors
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    if (showToast) {
      toast.success("로그아웃되었습니다");
    }
  }, []);

  const getToken = useCallback(() => token, [token]);

  const hasRole = (role: UserRole) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        getToken,
        handleSessionExpired,
      }}
    >
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
