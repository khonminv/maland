"use client";

import React from "react";

interface Props {
  mapData: Record<string, string[]>; // ✅ 외부에서 주입
  mapFilter: string;
  subMapFilter: string;
  positionFilter: string[];
  onMapChange: (map: string) => void;
  onSubMapChange: (subMap: string) => void;
  onPositionToggle: (pos: string) => void;
}

export default function PartyFilter({
  mapData,
  mapFilter,
  subMapFilter,
  positionFilter,
  onMapChange,
  onSubMapChange,
  onPositionToggle,
}: Props) {
  const positionOptions: string[] = [
    "좌1", "좌2", "좌3", "좌4", "좌5",
    "우1", "우2", "우3", "우4", "우5",
    "1층", "2층", "3층", "4층", "5층", "6층",
    "고깐", "중깐", "저깐", "옥상", "중간", "바닥",
    "프리", "원정대", "버블"
  ];

  const availableSubMaps = mapFilter ? mapData[mapFilter] ?? [] : [];

  return (
    <div className="flex gap-8 mb-6 flex-wrap md:flex-nowrap">
      {/* 대분류 */}
      <div className="flex flex-col gap-4 flex-1 max-w-xs min-w-[200px]">
        <div>
          <label className="block mb-1 text-gray-300 font-semibold">대분류 선택</label>
          <select
            value={mapFilter}
            onChange={(e) => {
              onMapChange(e.target.value);
              onSubMapChange("");
            }}
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            <option value="">전체 보기</option>
            {Object.keys(mapData).map((map) => (
              <option key={map} value={map}>
                {map}
              </option>
            ))}
          </select>
        </div>

        {/* 소분류 */}
        <div>
          <label className="block mb-1 text-gray-300 font-semibold">소분류 선택</label>
          <select
            value={subMapFilter}
            onChange={(e) => onSubMapChange(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
            disabled={!mapFilter}
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

      {/* 자리 필터 */}
      <div className="flex-1 max-w-lg min-w-[280px]">
        <label className="block mb-1 text-gray-300 font-semibold">자리 필터</label>
        <div className="flex flex-wrap gap-2 bg-gray-800 p-3 rounded border border-gray-600 max-h-32 overflow-y-auto">
          {positionOptions.map((pos) => (
            <button
              key={pos}
              onClick={() => onPositionToggle(pos)}
              type="button"
              className={`px-3 py-1 rounded-full font-semibold border ${
                positionFilter.includes(pos)
                  ? "bg-yellow-400 text-black border-yellow-300"
                  : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-yellow-600"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
