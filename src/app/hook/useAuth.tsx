"use client";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/app/lib/api";

export interface UserProfile {
  discordId: string;
  username?: string;
  avatar?: string;
  token: string;
}

export function useAuth() {
  const [tokenState, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // 페이지 처음 로딩 시 localStorage에 토큰 있으면 세팅
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken); // ✅ 이 setToken이 아래에서 정의됨
    }
  }, []);

  // 토큰과 동시에 유저 프로필을 설정하는 함수로 확장
  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("authToken", newToken);
      setTokenState(newToken);

      fetchUserProfile(newToken)
        .then((profile) => setUser(profile))
        .catch(() => {
          localStorage.removeItem("authToken");
          setTokenState(null);
          setUser(null);
        });
    } else {
      localStorage.removeItem("authToken");
      setTokenState(null);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setTokenState(null);
    setUser(null);
  };

  return { token: tokenState, user, logout, setToken };
}
