// components/ui/Nav.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import DiscordLoginButton from "../Discordlogin";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const { token, user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isLoggedIn = !!(token && user);

  function getAvatarUrl(u: { discordId: string; avatar?: string }) {
    if (!u.avatar) return "/images/discord.png";
    const isGif = u.avatar.startsWith("a_");
    const ext = isGif ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.${ext}`;
  }

  return (
    <div className="relative">
      {/* 데스크톱 */}
      <div className="hidden md:flex items-center gap-5 text-yellow-400">
        {isLoggedIn ? (
          <>
            <Link
              href="/my"
              className="flex items-center gap-3 hover:text-yellow-300 transition"
            >
              <img
                src={getAvatarUrl(user!)}
                alt={`${user?.username ?? "유저"} 프로필`}
                className="rounded-full w-8 h-8 object-cover"
                loading="lazy"
              />
              <div className="flex items-center gap-2">
                <span className="font-semibold">{user?.username}</span>
                {user?.job && (
                  <span className="px-2 py-0.5 rounded-full border border-yellow-500/40 text-[12px]">
                    {user.job}
                  </span>
                )}
                {typeof user?.level === "number" && (
                  <span className="px-2 py-0.5 rounded-full border border-yellow-500/40 text-[12px]">
                    Lv.{user.level}
                  </span>
                )}
              </div>
            </Link>
            <button
              onClick={logout}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded transition"
            >
              로그아웃
            </button>
          </>
        ) : (
          <DiscordLoginButton />
        )}

        <Link
          className="hover:bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded transition"
          href="https://open.kakao.com/o/gxHAI8Lh"
          target="_blank"
          rel="noopener noreferrer"
        >
          문의하기
        </Link>
      </div>

      {/* 모바일: 햄버거 버튼 */}
      <div className="md:hidden flex items-center">
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 px-2.5 py-2"
        >
          {/* 햄버거 아이콘 */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-xl bg-black/80 border border-yellow-500/40 shadow-xl backdrop-blur p-3 md:hidden"
          role="menu"
        >
          {isLoggedIn ? (
            <>
              <Link
                href="/my"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-500/10 text-yellow-300"
                role="menuitem"
              >
                <img
                  src={getAvatarUrl(user!)}
                  alt={`${user?.username ?? "유저"} 프로필`}
                  className="rounded-full w-10 h-9 object-cover"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="font-semibold">{user?.username}</div>
                  <div className="text-[12px] text-yellow-400/80">
                    {user?.job ? `${user.job}` : ""}{user?.job && typeof user?.level === "number" ? " · " : ""}
                    {typeof user?.level === "number" ? `Lv.${user.level}` : ""}
                  </div>
                </div>
              </Link>

              <button
                onClick={logout}
                className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-lg font-semibold transition"
                role="menuitem"
              >
                로그아웃
              </button>
            </>
          ) : (
            <div className="p-2">
              <DiscordLoginButton />
            </div>
          )}

          <hr className="my-2 border-yellow-500/30" />

          <Link
            href="https://open.kakao.com/o/gxHAI8Lh"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-500/10 text-yellow-300"
            role="menuitem"
          >
            문의하기
          </Link>
        </div>
      )}
    </div>
  );
}
