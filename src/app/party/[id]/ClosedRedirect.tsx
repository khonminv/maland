"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClosedRedirect() {
  const router = useRouter();

  useEffect(() => {
    alert("마감된 파티입니다.");
    router.replace("/party"); // 뒤로가기로 다시 안 돌아오게 replace
  }, [router]);

  return null; // 아무것도 렌더하지 않음
}
