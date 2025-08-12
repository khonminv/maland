// app/notice/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

type NoticeSeverity = "info" | "success" | "warning" | "error";

interface MyResponse {
  user?: {
    isAdmin?: boolean;
  };
}

interface NoticeCreateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function NoticeCreatePage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState<NoticeSeverity>("info");
  const [pinned, setPinned] = useState(false);
  const [linkHref, setLinkHref] = useState("");

  // 접속자 권한 확인
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsAdmin(false);
      return;
    }
    axios
      .get<MyResponse>(`${process.env.NEXT_PUBLIC_API_BASE}/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setIsAdmin(Boolean(res.data.user?.isAdmin));
      })
      .catch(() => setIsAdmin(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해 주세요.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setLoading(true);
      await axios.post<NoticeCreateResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE}/notice`,
        {
          title: title.trim(),
          content: content.trim(),
          severity,
          pinned,
          ...(linkHref.trim() ? { linkHref: linkHref.trim() } : {}),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("공지사항이 등록되었습니다.");
      router.replace("/notice");
    } catch (err) {
      const error = err as AxiosError<NoticeCreateResponse>;
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "등록 실패";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="animate-pulse h-6 w-40 bg-neutral-300 rounded mb-4" />
        <div className="animate-pulse h-[200px] w-full bg-neutral-200 rounded" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-3">공지 작성</h1>
        <p className="text-sm text-red-400">
          관리자 권한이 없습니다. (접근 불가)
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">공지 작성</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white/80 dark:bg-neutral-900/70 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="공지 제목을 입력하세요"
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            placeholder={"공지 내용을 입력하세요.\n줄바꿈이 지원됩니다."}
            rows={8}
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">중요도</label>
            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.currentTarget.value as NoticeSeverity)
              }
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="info">안내</option>
              <option value="success">성공</option>
              <option value="warning">주의</option>
              <option value="error">오류</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.currentTarget.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">상단 고정</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              자세히 보기 링크 (선택)
            </label>
            <input
              type="url"
              value={linkHref}
              onChange={(e) => setLinkHref(e.currentTarget.value)}
              placeholder="https://example.com/changelog"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>
    </main>
  );
}
