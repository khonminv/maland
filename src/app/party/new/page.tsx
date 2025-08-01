"use client";

import { useState } from "react";
import axios from "axios";

const mapData: Record<string, string[]> = {
  리프레: ["죽은용의 둥지", "운명의 동굴", "용의 협곡"],
  빅토리아: ["헤네시스 사냥터", "던전 입구", "골렘 사원"],
};

const positionOptions = [
  "좌1", "좌2", "좌3", "좌4", "좌5",
  "우1", "우2", "우3", "우4", "우5",
  "1층", "2층", "3층", "4층", "5층", "6층",
  "고깐", "중깐", "저깐", "옥상", "중간", "바닥",
  "버블", "프리", "원정대",
];

export default function PartyForm() {
  const [selectedMap, setSelectedMap] = useState("");
  const [selectedSubMap, setSelectedSubMap] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  // 자리 분류
  const leftPositions = positionOptions.filter((p) => p.startsWith("좌"));
  const rightPositions = positionOptions.filter((p) => p.startsWith("우"));
  const floorPositions = positionOptions.filter((p) => /^[1-9]층$/.test(p));
  const otherPositions = positionOptions.filter(
    (p) =>
      !p.startsWith("좌") &&
      !p.startsWith("우") &&
      !/^[1-9]층$/.test(p)
  );

  // 제출 처리 함수
  const handleSubmit = async () => {
    if (!selectedMap || !selectedSubMap || selectedPositions.length === 0 || content.trim() === "") {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/party`, {
        map: selectedMap,
        subMap: selectedSubMap,
        positions: selectedPositions,
        content,
      });

      alert("모집글이 성공적으로 등록되었습니다!");
      // 초기화
      setSelectedMap("");
      setSelectedSubMap("");
      setSelectedPositions([]);
      setContent("");
    } catch (e) {
      setError("모집글 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1f2937] p-6 rounded-xl text-white shadow-lg max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-yellow-300 text-center">파티 모집 글 작성</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 왼쪽: 맵 선택 + 내용 작성 */}
        <div className="flex-1 space-y-6">
          {/* 맵 선택 */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">맵 선택</label>
            <select
              value={selectedMap}
              onChange={(e) => {
                setSelectedMap(e.target.value);
                setSelectedSubMap("");
              }}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
              disabled={loading}
            >
              <option value="">맵을 선택하세요</option>
              {Object.keys(mapData).map((map) => (
                <option key={map} value={map}>
                  {map}
                </option>
              ))}
            </select>
          </div>

          {/* 서브맵 선택 */}
          {selectedMap && (
            <div>
              <label className="block mb-1 text-sm text-gray-300">서브맵 선택</label>
              <select
                value={selectedSubMap}
                onChange={(e) => setSelectedSubMap(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                disabled={loading}
              >
                <option value="">서브맵을 선택하세요</option>
                {(mapData[selectedMap] ?? []).map((subMap) => (
                  <option key={subMap} value={subMap}>
                    {subMap}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 내용 작성 */}
          {selectedSubMap && (
            <div>
              <label className="block mb-1 text-sm text-gray-300" htmlFor="content">
                모집 내용 작성
              </label>
              <textarea
                id="content"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="모집하는 파티에 대한 상세 내용을 작성해주세요."
                className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* 오른쪽: 자리 선택 */}
        {selectedSubMap && (
          <div className="flex-1 space-y-6">
            {/* 왼쪽 자리 */}
            <div>
              <p className="text-sm text-gray-400 mb-2 font-semibold">왼쪽 자리</p>
              <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto">
                {leftPositions.map((pos) => (
                  <div
                    key={pos}
                    onClick={() => !loading && togglePosition(pos)}
                    className={`cursor-pointer px-4 py-2 rounded-md transition font-semibold border select-none
                      ${
                        selectedPositions.includes(pos)
                          ? "bg-yellow-400 text-black border-yellow-300"
                          : "bg-[#1e293b] border-gray-600 hover:bg-yellow-300 hover:text-black"
                      }`}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            </div>

            {/* 오른쪽 자리 */}
            <div>
              <p className="text-sm text-gray-400 mb-2 font-semibold">오른쪽 자리</p>
              <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto">
                {rightPositions.map((pos) => (
                  <div
                    key={pos}
                    onClick={() => !loading && togglePosition(pos)}
                    className={`cursor-pointer px-4 py-2 rounded-md transition font-semibold border select-none
                      ${
                        selectedPositions.includes(pos)
                          ? "bg-yellow-400 text-black border-yellow-300"
                          : "bg-[#1e293b] border-gray-600 hover:bg-yellow-300 hover:text-black"
                      }`}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            </div>

            {/* 층별 자리 */}
            <div>
              <p className="text-sm text-gray-400 mb-2 font-semibold">층별 자리</p>
              <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto">
                {floorPositions.map((pos) => (
                  <div
                    key={pos}
                    onClick={() => !loading && togglePosition(pos)}
                    className={`cursor-pointer px-4 py-2 rounded-md transition font-semibold border select-none
                      ${
                        selectedPositions.includes(pos)
                          ? "bg-yellow-400 text-black border-yellow-300"
                          : "bg-[#1e293b] border-gray-600 hover:bg-yellow-300 hover:text-black"
                      }`}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            </div>

            {/* 기타 자리 */}
            <div>
              <p className="text-sm text-gray-400 mb-2 font-semibold">기타 자리</p>
              <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto">
                {otherPositions.map((pos) => (
                  <div
                    key={pos}
                    onClick={() => !loading && togglePosition(pos)}
                    className={`cursor-pointer px-4 py-2 rounded-md transition font-semibold border select-none
                      ${
                        selectedPositions.includes(pos)
                          ? "bg-yellow-400 text-black border-yellow-300"
                          : "bg-[#1e293b] border-gray-600 hover:bg-yellow-300 hover:text-black"
                      }`}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      {selectedPositions.length > 0 && content.trim().length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-8 w-full py-3 rounded-md font-bold transition ${
            loading ? "bg-yellow-200 text-black cursor-not-allowed" : "bg-yellow-400 text-black hover:bg-yellow-300"
          }`}
        >
          {loading ? "등록 중..." : "모집 등록하기"}
        </button>
      )}

      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </div>
  );
}
