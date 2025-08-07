"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiActivity, FiMapPin, FiUsers } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      urlParams.delete("token");
      const newUrl =
        window.location.origin + window.location.pathname +
        (urlParams.toString() ? `?${urlParams.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  return (
    <div className="bg-transparent text-white min-h-screen px-10 py-12">
      <div className="max-w-7xl mx-auto">
        {/* 제목 + 설명 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            메이플랜드 올인원
          </h1>
          <p className="text-gray-300 text-base">
            
          </p>
        </div>

        {/* 기능 카드 리스트 */}
        <div className="flex flex-col gap-4">
          
          <FeatureCard
            title="자리 거래"
            desc="맵별로 자리 거래 및 평균 시세 확인"
            href="/trade"
            icon={<FiMapPin size={28} />}
          />
          <FeatureCard
            title="파티 모집"
            desc="자리, 맵별 파티원 모집"
            href="/party"
            icon={<FiUsers size={28} />}
          />
          <FeatureCard
            title="스킬트리 시뮬레이터"
            desc="직업별 스킬트리를 자유롭게 구성 가능."
            href="/skill-simulator"
            icon={<FiActivity size={28} />}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <div className="flex items-start bg-[#2b2b2b] border border-gray-700 rounded-lg p-5 hover:bg-[#333333] transition-all cursor-pointer">
        <div className="mr-4 text-yellow-400 mt-1">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold mb-1">{title}</h2>
          <p className="text-sm text-gray-400">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
