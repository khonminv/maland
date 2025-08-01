"use client";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/app/lib/api";

// 백엔드에서 받아올 유저 정보 타입 정의
export interface UserProfile {
  discordId: string;
  username?: string;
  avatar?: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken)
        .then((profile: UserProfile) => setUser(profile))
        .catch(() => {
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  return { token, user, logout };
}
