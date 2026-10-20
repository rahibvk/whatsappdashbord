"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      const stored = localStorage.getItem("user_data");
      if (token && stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // corrupted data — clear
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    (authResponse) => {
      localStorage.setItem("access_token", authResponse.access_token);
      const userData = {
        email: authResponse.email,
        tenant_id: authResponse.tenant_id,
        company_name: authResponse.company_name,
      };
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
