// components/DiscordLoginButton.tsx
"use client";

import { useMemo } from "react";

export default function DiscordLoginButton() {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "";
  const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ?? "";

  const discordLoginUrl = useMemo(() => {
    if (!clientId || !redirectUri) return "";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify guilds", // 필요 scope만 남겨 사용
    });
    // 공식 엔드포인트: /oauth2/authorize (api 없이)
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }, [clientId, redirectUri]);

  // 환경변수 누락 시: 비활성 버튼 + 안내
  if (!clientId || !redirectUri) {
    return (
      <button
        type="button"
        onClick={() => alert("디스코드 로그인 설정이 누락되었습니다. 환경변수를 확인하세요.")}
        className="inline-flex items-center gap-2 rounded-md bg-indigo-600/50 px-3 py-2 font-semibold text-white cursor-not-allowed"
      >
        <img src="/images/discord1.svg" alt="Discord" className="h-5 w-5" />
        <span className="text-sm sm:text-base">로그인</span>
      </button>
    );
  }

  return (
    <a
      href={discordLoginUrl}
      className="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-3 sm:px-4 py-2 font-semibold text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      aria-label="Discord로 로그인"
      rel="noopener noreferrer"
    >
      <img src="/images/discord1.svg" alt="" className="h-5 w-16 sm:h-6 sm:w-6" />
      <span className="text-sm sm:text-base">로그인</span>
    </a>
  );
}
