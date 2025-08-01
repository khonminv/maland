// pages/auth/success.tsx
"use client";
import { useSearchParams } from "next/navigation";

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">환영합니다, {username}님!</h1>
    </div>
  );
}
