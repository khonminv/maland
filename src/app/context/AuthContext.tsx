// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchUserProfile } from "@/app/lib/api";

export interface UserProfile {
   _id: string;  
  discordId: string;
  username?: string;
  avatar?: string;
  token: string;
  job: string;
  level: number;
  isAdmin?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;

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
  .then((profile) =>
    
    setUser((prevUser) => ({
      ...prevUser,       // 기존 값 유지
      ...profile,        // 새로 받아온 값 덮어쓰기
      token,             // token도 다시 저장
    }))
  )
  .catch(() => logout());
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, setToken, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
