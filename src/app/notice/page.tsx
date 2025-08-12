// app/notice/page.tsx  (= NoticeBoard 페이지 컴포넌트)
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// ---- Types ----
export type NoticeSeverity = "info" | "success" | "warning" | "error";

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  severity?: NoticeSeverity;
  pinned?: boolean;
  createdAt?: string | number | Date;
  linkHref?: string;
}

export default function NoticeBoardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sevFilter, setSevFilter] = useState<NoticeSeverity | "all">("all");

  // 어드민 판별 (env + user.discordId)
  const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin = !!(user?.discordId && adminIds.includes(user.discordId));

  // 공지 목록 불러오기
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/notice`);
        const arr = Array.isArray(res.data) ? res.data : [];
        const mapped: NoticeItem[] = arr.map((n: any) => {
          const rawSev = typeof n.severity === "string" ? n.severity.toLowerCase() : "info";
          const normalized: NoticeSeverity =
            rawSev === "critical"
              ? "error"
              : (["info", "success", "warning", "error"].includes(rawSev)
                  ? (rawSev as NoticeSeverity)
                  : "info");
          return {
            id: String(n._id ?? n.id ?? Math.random().toString(36).slice(2)),
            title: String(n.title ?? ""),
            content: String(n.content ?? ""),
            severity: normalized,
            pinned: Boolean(n.pinned),
            createdAt: n.createdAt ?? undefined,
            linkHref: n.linkHref ?? undefined,
          };
        });
        if (alive) setNotices(mapped);
      } catch (err: any) {
        if (alive) setLoadError(err?.message || "공지사항 불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notices
      .filter((n) => (sevFilter === "all" ? true : (n.severity ?? "info") === sevFilter))
      .filter((n) => (q ? n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
  }, [notices, query, sevFilter]);

  const handleCreate = () => router.push("/notice/new");
  const handleEnter = (id: string) => router.push(`/notice/${id}`);

  if (loading) return <div className="max-w-3xl mx-auto">불러오는 중…</div>;
  if (loadError) return <div className="max-w-3xl mx-auto text-rose-400">에러: {loadError}</div>;

  return (
    <section className="w-full max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">공지사항</h2>
        <div className="flex gap-2 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색 (제목/내용)"
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={sevFilter}
            onChange={(e) => setSevFilter(e.target.value as NoticeSeverity | "all")}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
          >
            <option value="all">전체</option>
            <option value="info">안내</option>
            <option value="success">성공</option>
            <option value="warning">주의</option>
            <option value="error">오류</option>
          </select>

          {isAdmin && (
            <button
              onClick={handleCreate}
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
            >
              작성
            </button>
          )}
        </div>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="text-sm text-neutral-500 px-3 py-6 text-center border rounded-xl">
          표시할 공지가 없습니다.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => (
            <li
              key={n.id}
              className={
                "rounded-xl border " +
                (n.severity === "error"
                  ? "border-rose-200"
                  : n.severity === "warning"
                  ? "border-amber-200"
                  : n.severity === "success"
                  ? "border-emerald-200"
                  : "border-blue-200") +
                " bg-white/80 dark:bg-neutral-900/70 backdrop-blur shadow-sm"
              }
            >
              <div className={"flex items-center justify-between gap-3 px-4 py-3 text-black"}>
                <div className="flex items-center gap-2 min-w-0">
                  {n.pinned && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      고정
                    </span>
                  )}
                  <span className="text-[11px] px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                    {n.severity === "error"
                      ? "오류"
                      : n.severity === "warning"
                      ? "주의"
                      : n.severity === "success"
                      ? "성공"
                      : "안내"}
                  </span>
                  <button
                    onClick={() => handleEnter(n.id)}
                    className="text-left font-semibold truncate hover:underline"
                    title={n.title}
                  >
                    {n.title}
                  </button>
                  {isWithinDays(n.createdAt, 3) && (
                    <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                      NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {n.createdAt && (
                    <time
                      className="text-xs text-neutral-500"
                      dateTime={new Date(n.createdAt).toISOString()}
                    >
                      {timeAgo(n.createdAt)}
                    </time>
                  )}
                </div>
              </div>

              {openId === n.id && (
                <div className="px-5 pb-4 pt-0 text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap break-words text-neutral-700 dark:text-neutral-200">
                    {n.content}
                  </p>
                  {n.linkHref && (
                    <a
                      href={n.linkHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-block mt-3 text-indigo-600 hover:underline"
                    >
                      자세히 보기 →
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- utils ---------- */
function isWithinDays(date: NoticeItem["createdAt"], days: number) {
  if (!date) return false;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
}

function timeAgo(date: NoticeItem["createdAt"]) {
  if (!date) return "";
  const d = new Date(date).getTime();
  if (Number.isNaN(d)) return "";
  const sec = Math.floor((Date.now() - d) / 1000);
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}
