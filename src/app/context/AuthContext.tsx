// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchUserProfile } from "@/app/lib/api";

export interface UserProfile {
  discordId: string;
  username?: string;
  avatar?: string;
  token: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfile(token)
        .then((profile) => setUser(profile))
        .catch(() => logout());
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
