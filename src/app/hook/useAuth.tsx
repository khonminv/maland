"use client";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/app/lib/api";

export interface UserProfile {
  discordId: string;
  username?: string;
  avatar?: string;
}

export function useAuth() {
  // 초기값을 바로 로컬스토리지에서 읽음
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (token) {
      fetchUserProfile(token)
        .then((profile: UserProfile) => setUser(profile))
        .catch(() => {
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  return { token, user, logout, setToken };
}
