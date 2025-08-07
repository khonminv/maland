"use client";
import React, { useEffect,useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import DiscordLoginButton from "../Discordlogin";
import Link from "next/link";


export default function Nav() {
  const { token, user, logout } = useAuth();

  function getAvatarUrl(user: { discordId: string; avatar?: string }) {
    if (!user.avatar) {
      return "/images/discord.png"; // 기본 이미지
    }
    const isGif = user.avatar.startsWith("a_");
    const ext = isGif ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.${ext}`;
  }
  
  return (
    <nav className="flex items-center gap-6 text-yellow-400">
      {token && user ? (
        <>
          <Link
            href="/my"
            className="flex items-center gap-2 hover:text-yellow-300 transition cursor-pointer"
          >
            <p>{user.job}</p>
             <p>{user.level}</p>
            <img
              src={getAvatarUrl(user)}
              alt={`${user.username} 프로필`}
              className="rounded-full w-8 h-8 object-cover"
              loading="lazy"
            />
            <span className="font-medium">{user.username}</span>
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
    </nav>
  );
}
