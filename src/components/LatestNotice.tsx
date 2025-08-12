"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Notice = { id: string; title: string; createdAt?: string | number | Date };

export default function LatestNoticeSimple() {
  const [latest, setLatest] = useState<Notice | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_BASE;
    if (!API) {
      console.warn("NEXT_PUBLIC_API_BASE가 비어 있습니다.");
      return;
    }

    const ctrl = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API}/notice`, { signal: ctrl.signal });
        if (!res.ok) {
          console.warn("공지 API 응답 오류:", res.status, await res.text());
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.warn("공지 데이터가 배열이 아닙니다:", data);
          return;
        }

        const mapped = data
          .map((n: any) => ({
            id: String(n?._id ?? n?.id ?? ""),
            title: String(n?.title ?? ""),
            createdAt: n?.createdAt,
          }))
          .filter((n) => n.id && n.title);

        if (mapped.length === 0) return;

        mapped.sort((a, b) => {
          const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bt - at;
        });

        setLatest(mapped[0]);
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          console.warn("공지 불러오기 실패:", e);
        }
      }
    })();

    return () => ctrl.abort();
  }, []);

  if (!latest) return null;

  return (
    <Link
      href={`/notice/${latest.id}`}
      className="block w-full truncate text-sm text-neutral-200 hover:underline"
      title={latest.title}
    >
      📢 {latest.title}
    </Link>
  );
}
