"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Trade {
  _id: string;
  mapName: string;
  subMap: string;
  title: string;
  createdAt: string;
}

interface Party {
  _id: string;
  map: string;
  subMap: string;
  positions: string[];
  content: string;
  createdAt: string;
}

export default function MyPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [parties, setParties] = useState<Party[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTrades(res.data.trades.slice(0, 3));
        setParties(res.data.parties.slice(0, 3));
      } catch (error) {
        console.error("마이페이지 불러오기 실패", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 text-center">
        내 게시글
      </h1>

      {/* 자리 거래 */}
      <section>
        <h2 className="text-2xl font-semibold text-yellow-200 mb-4">
          자리 거래
        </h2>
        <div className="grid gap-4">
          {trades.length === 0 ? (
            <p className="text-gray-400">작성한 자리 거래가 없습니다.</p>
          ) : (
            trades.map((item) => (
              <Link key={item._id} href={`/trade/${item._id}`}>
                <div className="bg-[#16213e] border border-yellow-500 rounded-xl p-4 hover:bg-[#1a2b4c] transition-colors cursor-pointer">
                  <h3 className="text-lg font-semibold text-yellow-300">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.mapName} / {item.subMap}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 파티 모집 */}
      <section>
        <h2 className="text-2xl font-semibold text-yellow-200 mb-4">
          파티 모집
        </h2>
        <div className="grid gap-4">
          {parties.length === 0 ? (
            <p className="text-gray-400">작성한 파티 모집 글이 없습니다.</p>
          ) : (
            parties.map((item) => (
              <Link key={item._id} href={`/party/${item._id}`}>
                <div className="bg-[#16213e] border border-yellow-500 rounded-xl p-4 hover:bg-[#1a2b4c] transition-colors cursor-pointer">
                  <h3 className="text-lg font-semibold text-yellow-300">{item.content}</h3>
                  <p className="text-sm text-gray-300">{item.map} / {item.subMap}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
