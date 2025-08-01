"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("authToken", token);

      // 토큰 쿼리 제거하고 URL 새로 고침 없이 주소만 바꿈
      urlParams.delete("token");
      const newUrl =
        window.location.origin + window.location.pathname +
        (urlParams.toString() ? `?${urlParams.toString()}` : "");
      window.history.replaceState({}, "", newUrl);

      // 필요하면 추가 동작 가능 (예: 유저 데이터 갱신 등)
    }
  }, []);

  return (
    <div className="flex flex-col items-center text-center space-y-12 mt-12 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 drop-shadow">
        메이플랜드 올인원
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
        메이플랜드 유저를 위한 스킬트리 시뮬레이터, 자리 거래, 파티 모집 기능을 한 곳에서 제공합니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <FeatureCard
          title="스킬트리 시뮬레이터"
          desc=""
          href="/skill-simulator"
        />
        <FeatureCard
          title="자리 거래"
          desc=""
          href="/trade"
        />
        <FeatureCard
          title="파티 모집"
          desc=""
          href="/party"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-[#0f3460] border border-yellow-400 rounded-2xl p-6 shadow-lg hover:scale-[1.03] transition-transform cursor-pointer">
        <h2 className="text-2xl font-semibold text-yellow-300">{title}</h2>
        <p className="mt-2 text-sm text-gray-200">{desc}</p>
      </div>
    </Link>
  );
}
