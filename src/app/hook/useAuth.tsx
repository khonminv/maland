"use client";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/app/lib/api";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // 유저 정보 타입 지정 가능

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken)
        .then(setUser)
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
