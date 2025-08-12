// app/notice/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type NoticeSeverity = "info" | "success" | "warning" | "error" | "critical";
interface NoticeDTO {
  _id: string;
  title: string;
  content: string;
  severity?: NoticeSeverity;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
  linkHref?: string;
}

const sevMap: Record<string, string> = {
  info: "border-blue-300 bg-blue-50/60 text-blue-900",
  success: "border-emerald-300 bg-emerald-50/60 text-emerald-900",
  warning: "border-amber-300 bg-amber-50/60 text-amber-900",
  error: "border-rose-300 bg-rose-50/60 text-rose-900",
  critical: "border-rose-300 bg-rose-50/60 text-rose-900", // 백엔드가 critical이면 error 스타일
};

function label(sev?: string) {
  switch (sev) {
    case "success": return "성공";
    case "warning": return "주의";
    case "error":
    case "critical": return "오류";
    default: return "안내";
  }
}

function fmt(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString();
}

async function getNotice(id: string): Promise<NoticeDTO | null> {
  const API = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await fetch(`${API}/notice/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("공지 조회 실패");
  return res.json();
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const data = await getNotice(params.id);
    if (!data) return { title: "공지 없음" };
    return { title: `공지: ${data.title}` };
  } catch {
    return { title: "공지 상세" };
  }
}

export default async function NoticeDetailPage({ params }: { params: { id: string } }) {
  const data = await getNotice(params.id);
  if (!data) notFound();

  const sev = (data.severity || "info").toLowerCase();
  const sevClass = sevMap[sev] || sevMap["info"];

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className={`rounded-2xl border shadow-sm p-5 ${sevClass}`}>
        <div className="flex items-center gap-2 mb-2">
          {data.pinned && (
            <span className="text-[11px] px-2 py-0.5 rounded-full border bg-white/70">고정</span>
          )}
          <span className="text-[11px] px-2 py-0.5 rounded-full border bg-white/70">{label(sev)}</span>
          <span className="ml-auto text-xs opacity-80">{fmt(data.createdAt)}</span>
        </div>

        <h1 className="text-2xl font-bold">{data.title}</h1>

        <article className="mt-4 whitespace-pre-wrap leading-relaxed">
          {data.content}
        </article>

        {data.linkHref && (
          <a
            href={data.linkHref}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-block mt-4 underline"
          >
            자세히 보기 →
          </a>
        )}
      </div>

      <div className="mt-6">
        <Link href="/notice" className="text-sm underline">
          ← 공지 목록으로
        </Link>
      </div>
    </main>
  );
}
