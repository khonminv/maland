"use client";

import { useEffect, useState } from "react";

interface PartyPost {
  _id: string;
  partyTitle: string;
  leaderName: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  status: "모집중" | "모집완료";
}

export default function PartyListPage() {
  const [posts, setPosts] = useState<PartyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParties() {
      try {
        const res = await fetch("https://port-0-maple-land-server-mawa5o8ve8151a2a.sel4.cloudtype.app/"); // 백엔드 API 주소 맞게 수정 필요
        if (!res.ok) throw new Error("파티 목록을 불러오는 데 실패했습니다.");
        const data: PartyPost[] = await res.json();
        setPosts(data);
      } catch (err: any) {
        setError(err.message || "알 수 없는 에러");
      } finally {
        setLoading(false);
      }
    }
    fetchParties();
  }, []);

  if (loading) return <p className="p-6">로딩 중...</p>;
  if (error) return <p className="p-6 text-red-500">에러: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">파티 모집 게시판</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post._id} className="border p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">{post.partyTitle}</span>
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${
                  post.status === "모집중"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {post.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{post.description}</p>
            <p className="text-sm text-gray-600 mb-2">
              리더: <span className="font-medium">{post.leaderName}</span>
            </p>
            <p className="text-right font-bold text-blue-700">
              참여인원: {post.memberCount} / {post.maxMembers}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
