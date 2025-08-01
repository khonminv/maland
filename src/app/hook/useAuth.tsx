"use client";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/app/lib/api";

export interface UserProfile {
  discordId: string;
  username?: string;
  avatar?: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

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
