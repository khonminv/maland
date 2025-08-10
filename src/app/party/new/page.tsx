"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const positionOptions = [
  "좌1", "좌2", "좌3", "좌4", "좌5",
  "우1", "우2", "우3", "우4", "우5",
  "1층", "2층", "3층", "4층", "5층", "6층",
  "고깐", "중깐", "저깐", "옥상", "중간", "바닥",
  "버블", "프리", "원정대",
];

export default function PartyForm() {
  const [mapData, setMapData] = useState<Record<string, string[]>>({});
  const [selectedMap, setSelectedMap] = useState("");
  const [selectedSubMap, setSelectedSubMap] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // 토큰 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("authToken"));
    }
  }, []);

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

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMap || !selectedSubMap || selectedPositions.length === 0 || !content.trim()) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/party`,
        {
          map: selectedMap,
          subMap: selectedSubMap,
          positions: selectedPositions,
          content,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      alert("모집글 등록 완료!");
      setSelectedMap("");
      setSelectedSubMap("");
      setSelectedPositions([]);
      setContent("");
      router.push("/party");
    } catch {
      setError("등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1f2937] p-6 rounded-xl text-white shadow-lg max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-yellow-300 text-center">파티 모집 글 작성</h2>

      {/* 대분류 선택 */}
      <div>
        <label className="block mb-1">대분류 선택</label>
        <select
          value={selectedMap}
          onChange={(e) => {
            setSelectedMap(e.target.value);
            setSelectedSubMap("");
          }}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        >
          <option value="">대분류를 선택하세요</option>
          {Object.keys(mapData).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* 소분류 선택 */}
      {selectedMap && (
        <div className="mt-4">
          <label className="block mb-1">소분류 선택</label>
          <select
            value={selectedSubMap}
            onChange={(e) => setSelectedSubMap(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          >
            <option value="">소분류를 선택하세요</option>
            {mapData[selectedMap]?.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 내용 작성 */}
      {selectedSubMap && (
        <>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="모집 내용을 입력하세요."
            className="mt-4 w-full p-3 rounded bg-gray-800 border border-gray-600"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {positionOptions.map((pos) => (
              <div
                key={pos}
                onClick={() => togglePosition(pos)}
                className={`cursor-pointer px-4 py-2 rounded-md border ${
                  selectedPositions.includes(pos)
                    ? "bg-yellow-400 text-black border-yellow-300"
                    : "bg-[#1e293b] border-gray-600"
                }`}
              >
                {pos}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 제출 */}
      {selectedPositions.length > 0 && content.trim() && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-8 w-full py-3 rounded-md font-bold ${
            loading
              ? "bg-yellow-200 text-black cursor-not-allowed"
              : "bg-yellow-400 text-black hover:bg-yellow-300"
          }`}
        >
          {loading ? "등록 중..." : "모집 등록하기"}
        </button>
      )}

      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </div>
  );
}
