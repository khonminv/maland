"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      router.replace("/"); // 로그인 성공하면 메인 페이지로 이동
    } else {
      router.replace("/login"); // 토큰 없으면 로그인 페이지로
    }
  }, [router]);

  return <div>로그인 중입니다...</div>;
}
