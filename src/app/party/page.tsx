"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link"; // 추가

interface PartyPost {
  _id: string;
  map: string;
  subMap: string;
  positions: string[];
  content: string;
  createdAt: string;
}

const mapData: Record<string, string[]> = {
  리프레: ["죽은용의 둥지", "운명의 동굴", "용의 협곡"],
  빅토리아: ["헤네시스 사냥터", "던전 입구", "골렘 사원"],
};

const positionOptions: string[] = [
  "좌1", "좌2", "좌3", "좌4", "좌5",
  "우1", "우2", "우3", "우4", "우5",
  "1층", "2층", "3층", "4층", "5층", "6층",
  "고깐", "중깐", "저깐", "옥상", "중간", "바닥",
  "버블", "프리", "원정대",
];

export default function PartyListPage() {
  const [partyPosts, setPartyPosts] = useState<PartyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 필터 상태
  const [mapFilter, setMapFilter] = useState("");
  const [subMapFilter, setSubMapFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState<string[]>([]);

  useEffect(() => {
    fetchPartyPosts();
  }, []);

  const fetchPartyPosts = async () => {
    setLoading(true);
    setError("");
    try {
      // TODO: 실제 API 주소로 변경 필요
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/party`,{withCredentials: true});
      setPartyPosts(res.data);
    } catch (e) {
      setError("파티 모집글 불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const availableSubMaps = mapFilter ? mapData[mapFilter] ?? [] : [];

  const togglePositionFilter = (pos: string) => {
    setPositionFilter((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const filteredPosts = partyPosts.filter((post) => {
    if (mapFilter && post.map !== mapFilter) return false;
    if (subMapFilter && post.subMap !== subMapFilter) return false;
    if (positionFilter.length > 0 && !positionFilter.some((pos) => post.positions.includes(pos))) return false;
    return true;
  });

  // 상대 시간 계산 함수 (몇 초 전, 몇 분 전, 몇 시간 전, 며칠 전 등)
  function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return `${seconds}초 전`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;

    // 7일 이상이면 그냥 날짜 표시 (YYYY-MM-DD)
    return date.toLocaleDateString();
  }


  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-yellow-400 text-center">파티 모집 목록</h1>

      {/* 모집글 작성 버튼 추가 */}
      <div className="mb-6 text-center">
        <Link
          href="/party/new" // 모집글 작성 페이지 경로에 맞게 수정하세요
          className="inline-block bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition"
        >
          모집글 작성하기
        </Link>
      </div>

      <div className="flex justify-between items-start gap-8 mb-6 flex-wrap md:flex-nowrap">
        {/* 왼쪽 필터 (맵, 서브맵) */}
        <div className="flex flex-col gap-4 flex-1 max-w-xs min-w-[200px]">
          {/* 맵 필터 */}
          <div>
            <label className="block mb-1 text-gray-300 font-semibold">맵 필터</label>
            <select
              value={mapFilter}
              onChange={(e) => {
                setMapFilter(e.target.value);
                setSubMapFilter("");
              }}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
            >
              <option value="">전체 보기</option>
              {Object.keys(mapData).map((map) => (
                <option key={map} value={map}>
                  {map}
                </option>
              ))}
            </select>
          </div>

          {/* 서브맵 필터 */}
          <div>
            <label className="block mb-1 text-gray-300 font-semibold">서브맵 필터</label>
            <select
              value={subMapFilter}
              onChange={(e) => setSubMapFilter(e.target.value)}
              disabled={!mapFilter}
              className={`w-full p-2 rounded bg-gray-800 border border-gray-600 text-white ${
                !mapFilter ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">전체 보기</option>
              {availableSubMaps.map((subMap) => (
                <option key={subMap} value={subMap}>
                  {subMap}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 오른쪽 자리 필터 */}
        <div className="flex-1 max-w-lg min-w-[280px]">
          <label className="block mb-1 text-gray-300 font-semibold">자리 필터 (복수 선택 가능)</label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto bg-gray-800 p-3 rounded border border-gray-600">
            {positionOptions.map((pos) => (
              <button
                key={pos}
                onClick={() => togglePositionFilter(pos)}
                type="button"
                className={`px-3 py-1 rounded-full font-semibold transition-colors border ${
                  positionFilter.includes(pos)
                    ? "bg-yellow-400 text-black border-yellow-300"
                    : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-yellow-600 hover:text-white"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="text-center text-gray-400">로딩 중...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && filteredPosts.length === 0 && (
        <p className="text-center text-gray-500">조건에 맞는 모집글이 없습니다.</p>
      )}

      <ul className="space-y-6">
        {filteredPosts.map(({ _id, map, subMap, positions, content, createdAt }) => (
          <li
            key={_id}
            className="bg-[#1f2937] p-6 rounded-xl shadow-md text-white border border-gray-700"
          >
            <div className="flex justify-between mb-2 text-sm text-gray-400">
              <div>
                <span className="font-semibold">{map}</span> / <span>{subMap}</span>
              </div>
              <div>{timeAgo(createdAt)}</div>
            </div>

            <p className="mb-3 whitespace-pre-wrap">{content}</p>

            <div className="flex flex-wrap gap-2 text-sm">
              {positions.map((pos) => (
                <span
                  key={pos}
                  className="px-3 py-1 bg-yellow-400 text-black rounded-full font-semibold select-none"
                >
                  {pos}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
