"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import PartyApplicationModal from "../components/PartyApplicationModal";
import { useAuth } from "@/app/context/AuthContext";

export interface PartyDetail {
  _id: string;
  title: string;
  map: string;
  subMap: string;
  positions: string[];
  content: string;
  createdAt: string;
  isClosed?: boolean;
  discordId: string;
  applicants?: { discordId: string }[];
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const sec = Math.floor((+now - +date) / 1000);
  if (sec < 60) return `${sec}초 전`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export default function PartyDetailClient({ data }: { data: PartyDetail }) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_BASE!;
  const isLoggedIn = !!(token && user?.discordId);

  // 이미 신청했는지 계산
  const initiallyApplied = useMemo(() => {
    const me = String(user?.discordId || "").trim();
    if (!me) return false;
    return !!data.applicants?.some((a) => String(a.discordId).trim() === me);
  }, [data.applicants, user?.discordId]);

  const [applied, setApplied] = useState(initiallyApplied);
  useEffect(() => setApplied(initiallyApplied), [initiallyApplied]);

  const handleSubmit = async (message: string, positions: string[]) => {
    if (!token || !user?.discordId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await axios.post(
        `${API}/party/${data._id}/apply`,
        {
          discordId: user.discordId,
          username: user.username,
          avatar: user.avatar,
          job: user.job,
          level: user.level,
          message,
          positions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("신청 완료되었습니다!");
      setOpen(false);
      setApplied(true);
    } catch (err: unknown) {
      // ✅ any 제거: 안전하게 에러 타입 좁히기
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg =
          (err.response?.data as { message?: string } | undefined)?.message ??
          "신청 중 오류가 발생했습니다.";
        alert(status === 404 ? "마감되었거나 존재하지 않는 파티입니다." : msg);
        if (status === 404) router.replace("/party");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <main className="min-h-screen bg-transparent from-zinc-950 to-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* 상단 네비 */}
          <div className="mb-6 text-sm text-gray-400">
            <Link
              href="/party"
              className="inline-flex items-center gap-1 hover:text-gray-200 underline underline-offset-2"
            >
              ← 파티 목록
            </Link>
          </div>

          {/* 상세 카드 */}
          <article className="rounded-2xl bg-gray-800/80 ring-1 ring-white/10 shadow-xl p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
              맵:
              <span className="inline-flex items-center rounded-full bg-gray-700 px-3 py-1 font-medium">
                {data.map}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-700 px-3 py-1 font-medium">
                {data.subMap}
              </span>
              <span className="ml-auto text-xs text-gray-400">{timeAgo(data.createdAt)}</span>
            </div>

            <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">{data.title}</h1>

            <div className="mt-4 flex flex-wrap gap-2">
              자리:
              {data.positions?.length ? (
                data.positions.map((pos) => (
                  <span
                    key={pos}
                    className="inline-flex items-center rounded-full bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/30 px-3 py-1 text-sm font-medium"
                  >
                    {pos}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">구하는 자리 없음</span>
              )}
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-100">{data.content}</div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  if (applied) return;
                  if (!isLoggedIn) {
                    alert("로그인이 필요합니다.");
                    return;
                  }
                  setOpen(true);
                }}
                disabled={applied}
                className={`inline-flex justify-center items-center gap-2 rounded-xl px-5 py-2.5 font-semibold shadow-sm
                  ${
                    applied
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-yellow-400 text-black hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
                  }`}
              >
                {applied ? "신청 완료" : "신청하기"}
              </button>
              <Link
                href="/party"
                className="inline-flex justify-center items-center gap-2 rounded-xl bg-gray-700 px-5 py-2.5 font-medium text-white hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
              >
                목록으로
              </Link>
            </div>
          </article>
        </div>
      </main>

      <PartyApplicationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        availablePositions={data.positions || []}
      />
    </>
  );
}
