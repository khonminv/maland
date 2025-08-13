// PartyListPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PartyFilter from "./components/PartyFilter";
import PartyPostList from "./components/PartyPostList";
import ApplyModal from "./components/PartyApplicationModal";
import { PartyPost } from "@/types/party";

export default function PartyListPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [partyPosts, setPartyPosts] = useState<PartyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  const [mapFilter, setMapFilter] = useState(searchParams.get("map") ?? "");
  const [subMapFilter, setSubMapFilter] = useState(searchParams.get("subMap") ?? "");
  const [positionFilter, setPositionFilter] = useState<string[]>(searchParams.getAll("pos"));

  // 추가: JSON 기반 맵 데이터
  const [mapData, setMapData] = useState<Record<string, string[]>>({});

  // JSON 불러오기
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data/map.json");
        if (res.ok) {
          const data = await res.json();
          setMapData(data);
        } else {
          console.error("맵 데이터 불러오기 실패");
        }
      } catch (err) {
        console.error("맵 JSON 로드 에러:", err);
      }
    })();
  }, []);

  // 토큰이 바뀌면 파티 목록 호출
  useEffect(() => {
    fetchPartyPosts();
  }, [token]);

  // 필터가 바뀌면 URL 쿼리 반영
  useEffect(() => {
    const params = new URLSearchParams();
    if (mapFilter) params.set("map", mapFilter);
    if (subMapFilter) params.set("subMap", subMapFilter);
    positionFilter.forEach((pos) => params.append("pos", pos));
    router.replace(`/party?${params.toString()}`, { scroll: false });
  }, [mapFilter, subMapFilter, positionFilter]);

  // 파티 목록 가져오기
  const fetchPartyPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/party`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPartyPosts(res.data);
      setError("");
    } catch {
      setError("파티 모집글 불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터링
  const filteredPosts = partyPosts.filter((post) => {
    if (post.isClosed) return false;
    if (mapFilter && post.map !== mapFilter) return false;
    if (subMapFilter && post.subMap !== subMapFilter) return false;
    if (positionFilter.length > 0 && !positionFilter.some((pos) => post.positions.includes(pos)))
      return false;
    return true;
  });

  // 신청 버튼 클릭
  const handleApplyClick = (id: string) => {
    const targetPost = partyPosts.find((p) => p._id === id);
    if (targetPost?.isApplied) {
      alert("이미 신청한 파티입니다.");
      return;
    }
    setSelectedPartyId(id);
  };

  // 신청 완료 처리
  const handleSubmitApplication = async (message: string, positions: string[]) => {
    if (!selectedPartyId || !token || !user) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/party/${selectedPartyId}/apply`,
        {
          discordId: user.discordId,
          username: user.username,
          avatar: user.avatar,
          job: user.job,
          level: user.level,
          message,
          positions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("신청 완료!");
      await fetchPartyPosts();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert("신청 실패: " + (error.response?.data?.message || error.message));
      } else if (error instanceof Error) {
        alert("신청 실패: " + error.message);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setSelectedPartyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-yellow-400 text-center">파티 모집</h1>

      <div className="mb-6 text-center">
        {user ? (
          <Link
            href="/party/new"
            className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition"
          >
            모집글 작성하기
          </Link>
        ) : (
          <p className="text-sm text-gray-400">로그인 후 모집글을 작성할 수 있습니다.</p>
        )}
      </div>

      <PartyFilter
        mapFilter={mapFilter}
        subMapFilter={subMapFilter}
        positionFilter={positionFilter}
        onMapChange={setMapFilter}
        onSubMapChange={setSubMapFilter}
        onPositionToggle={(pos) => {
          setPositionFilter((prev) =>
            prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
          );
        }}
        mapData={mapData} // <-- PartyFilter에 대분류/소분류 데이터 전달
      />

      <PartyPostList
        posts={filteredPosts}
        loading={loading}
        error={error}
        onApply={handleApplyClick}
        
      />

      {selectedPartyId && (
        <ApplyModal
          isOpen={selectedPartyId !== null}
          onClose={() => setSelectedPartyId(null)}
          onSubmit={handleSubmitApplication}
          availablePositions={
            selectedPartyId
              ? partyPosts.find((p) => p._id === selectedPartyId)?.positions ?? []
              : []
          }
        />
      )}
    </div>
  );
}
