"use client";

import { PartyPost } from "@/types/party";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface Props {
  post: PartyPost;
  onApplyClick: (postId: string) => void;
  isApplied: boolean;
}

export default function PartyCard({ post, onApplyClick, isApplied }: Props) {
  const router = useRouter(); // ✅ 컴포넌트 내부에서 호출
  const { user, token } = useAuth();
  const isLoggedIn = !!(token && user?.discordId);

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-md text-white">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <div
            onClick={() => router.push(`/party/${post._id}`)}
            className="text-sm text-gray-300 hover:underline cursor-pointer"
          >
            {post.map} - {post.subMap}
          </div>
          <div className="text-lg font-bold py-1 text-yellow-500">
            {post.positions.join(", ")}
          </div>
          <div className="mt-2 whitespace-pre-wrap">{post.content}</div>
          <div className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
          </div>
        </div>

        <button
          type="button"
          className={`font-bold px-3 py-1 rounded ${
            isApplied
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-yellow-500 text-black hover:bg-yellow-600"
          } self-start`}
          onClick={() => {
            if (!isLoggedIn) {
              alert("로그인이 필요합니다."); // ✅ 로그인 없음 → 알럿 후 종료
              return;
            }
            if (!isApplied) onApplyClick(post._id);
          }}
          disabled={isApplied}
        >
          {isApplied ? "신청 완료" : "신청"}
        </button>
      </div>
    </div>
  );
}
