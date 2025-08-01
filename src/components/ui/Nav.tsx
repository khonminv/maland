"use client";
import React from "react";
import { useAuth } from "@/app/hook/useAuth";
import DiscordLoginButton from "../Discordlogin";

export default function Nav() {
  const { token, user, logout } = useAuth();


  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div>
        {token && user ? (
          <>
            <span className="mr-4">안녕하세요, {user.username}님</span>
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
