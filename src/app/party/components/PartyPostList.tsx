import { PartyPost } from "@/types/party";
import PartyCard from "./PartyCard";

interface Props {
  posts: PartyPost[];
  loading: boolean;
  error: string;
  onApply: (id: string) => void;
  appliedPartyIds: string[];  // 추가
}

export default function PartyPostList({ posts, loading, error, onApply, appliedPartyIds }: Props) {
  if (loading) {
    return <div className="text-center text-gray-400">불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400">{error}</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center text-gray-400">모집 중인 파티가 없습니다.</div>;
  }

  return (
    <div className="grid gap-4 max-w-full">
      {posts.map((post) => (
        <PartyCard
          key={post._id}
          post={post}
          onApplyClick={onApply}
          isApplied={post.isApplied ?? false}
        />
      ))}
    </div>
  );
}
