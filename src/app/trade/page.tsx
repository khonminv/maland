"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Trade {
  id: string;
  type: "삽니다" | "팝니다";
  map: string;
  title: string;
  price: string;
  description: string;
}

const maps = ["전체", "리프레", "빅토리아"];
const types = ["전체", "삽니다", "팝니다"];

export default function TradePage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filtered, setFiltered] = useState<Trade[]>([]);
  const [mapFilter, setMapFilter] = useState("전체");
  const [typeFilter, setTypeFilter] = useState("전체");

  useEffect(() => {
    axios
      .get("https://port-0-maple-land-server-mawa5o8ve8151a2a.sel4.cloudtype.app/trades")
      .then((res) => setTrades(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let result = trades;
    if (mapFilter !== "전체") {
      result = result.filter((item) => item.map === mapFilter);
    }
    if (typeFilter !== "전체") {
      result = result.filter((item) => item.type === typeFilter);
    }
    setFiltered(result);
  }, [mapFilter, typeFilter, trades]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">거래 게시판</h1>

      {/* 필터 */}
      <div className="flex gap-4 mb-4">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded ${typeFilter === t ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-4 mb-4">
        {maps.map((m) => (
          <button
            key={m}
            onClick={() => setMapFilter(m)}
            className={`px-3 py-1 rounded ${mapFilter === m ? "bg-green-500 text-white" : "bg-gray-200"}`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 새 글 등록 */}
      <Link href="/trade/new" className="inline-block mb-4 bg-purple-500 text-white px-4 py-2 rounded">
        + 새 글 등록
      </Link>

      {/* 거래 목록 */}
      {filtered.length === 0 ? (
        <p>거래 글이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => (
            <li key={item.id} className="p-4 border rounded shadow-sm">
              <div className="text-sm text-gray-500">{item.map} · {item.type}</div>
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <div className="text-blue-600 font-bold">{item.price}</div>
              <p className="text-gray-700 mt-1">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
