"use client";
import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import DiscordLoginButton from "../Discordlogin";

export default function Nav() {
  const { token, user, logout } = useAuth();

  function getAvatarUrl(user: { discordId: string; avatar?: string }) {
    if (!user.avatar) {
      return "/default-avatar.png"; // 기본 이미지
    }
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`;
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div>
        {token && user ? (
          <>
            <img src={getAvatarUrl(user)} alt={`${user.username} 프로필`} className="rounded-full w-8 h-8" />
            <span className="mr-4">{user.username}</span>
            <button
              onClick={logout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            >
              로그아웃
            </button>
          </>
        ) : (
          <DiscordLoginButton />
        )}
      </div>
    </nav>
  );
}
