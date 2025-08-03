"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

interface Trade {
  _id: string;
  type: "삽니다" | "팝니다";
  mapName: string;
  subMap: string;
  title: string;
  price: number;
  description: string;
  status: string;
  isCompleted: boolean;
  author?: {
    username: string;
    discordId: string;
    avatar?: string;
  };
}

interface AvgPrice {
  _id: {
    mapName: string;
    subMap: string;
  };
  avgPrice: number;
  count: number;
}

const maps = ["리프레", "빅토리아"];

const subMapsByMap: Record<string, string[]> = {
  리프레: ["죽은용의 둥지", "붉은 켄타우로스의 영역"],
  빅토리아: ["세부맵1", "세부맵2"],
};

export default function TradePage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filtered, setFiltered] = useState<Trade[]>([]);
  const [mapFilter, setMapFilter] = useState("");
  const [subMapFilter, setSubMapFilter] = useState("");
  const [avgPrices, setAvgPrices] = useState<AvgPrice[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetchTrades();
    fetchAvgPrices();
  }, []);

  const fetchTrades = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/trades`);
       console.log("🔥 프론트에서 받은 trades:", res.data);
      setTrades(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAvgPrices = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/trades/average-prices-by-submap`);
      setAvgPrices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let result = trades;

    if (mapFilter) {
      result = result.filter((item) => item.mapName === mapFilter);
    }

    if (subMapFilter) {
      result = result.filter((item) => item.subMap === subMapFilter);
    }

    if (!showCompleted) {
      result = result.filter((item) => item.status !== "거래완료");
    }

    setFiltered(result);
  }, [mapFilter, subMapFilter, trades, showCompleted]);

  const toggleStatus = async (id: string, currentStatus?: string) => {
    try {
      const newStatus = currentStatus === "거래완료" ? "거래가능" : "거래완료";
      await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE}/trades/${id}/status`, { status: newStatus });
      fetchTrades();
      fetchAvgPrices();
    } catch (error) {
      console.error(error);
      alert("상태 변경 실패");
    }
  };

  const deleteTrade = async (id: string) => {
    if (!confirm("정말로 이 거래 글을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/trades/${id}`);
      fetchTrades();
      fetchAvgPrices();
    } catch (error) {
      console.error(error);
      alert("삭제 실패");
    }
  };

  const currentSubMaps = mapFilter ? subMapsByMap[mapFilter] || [] : [];

  const filteredAvgPrices =
    mapFilter && subMapFilter
      ? avgPrices.filter((ap) => ap._id.mapName === mapFilter && ap._id.subMap === subMapFilter)
      : [];

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-900">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gradient bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
        거래 게시판
      </h1>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {maps.map((m) => (
          <button
            key={m}
            onClick={() => {
              setMapFilter(m);
              setSubMapFilter("");
            }}
            className={`px-5 py-2 rounded-lg font-semibold transition-shadow duration-300 ${
              mapFilter === m
                ? "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:shadow-md hover:bg-gray-300"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mapFilter && (
        <div className="mb-10 text-center">
          <select
            value={subMapFilter}
            onChange={(e) => setSubMapFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
          >
            <option value="">서브맵 선택</option>
            {currentSubMaps.map((sm) => (
              <option key={sm} value={sm}>
                {sm}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-6 items-center justify-center mb-6">
        <div className=" text-center">
          <button
            onClick={() => setShowCompleted((prev) => !prev)}
            className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {showCompleted ? "거래 완료 숨기기" : "거래 완료 보기"}
          </button>
        </div>

        <div className="text-center ">
          {user ? (
            <Link
              href="/trade/new"
              className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            >
              + 새 글 등록
            </Link>
          ) : (
            <p className="text-sm text-gray-400">로그인하면 거래 등록을 할 수 있습니다.</p>
          )}
        </div>
      </div>

      {mapFilter && subMapFilter ? (
        <section className="mb-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 border-b border-purple-300 pb-2">
            평균 거래가 (최근 2시간)
          </h2>
          {filteredAvgPrices.length === 0 ? (
            <p className="text-gray-400 text-center">평균 거래가 정보가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAvgPrices.map(({ _id, avgPrice, count }) => (
                <li
                  key={`${_id.mapName}-${_id.subMap}`}
                  className="py-3 flex justify-between items-center text-sm font-medium"
                >
                  <span className="text-purple-700">{_id.subMap}</span>
                  <span className="text-indigo-600 font-bold">{avgPrice.toLocaleString()} 메소</span>
                  <span className="text-gray-400">({count}건)</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <p className="text-center text-gray-400 mb-12">서브맵을 선택해야 평균 가격을 볼 수 있습니다.</p>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <TradeList title="🛒 삽니다" trades={filtered.filter((t) => t.type === "삽니다")} toggleStatus={toggleStatus} deleteTrade={deleteTrade} />
        <TradeList title="📦 팝니다" trades={filtered.filter((t) => t.type === "팝니다")} toggleStatus={toggleStatus} deleteTrade={deleteTrade} />
      </div>
    </div>
  );
}

function TradeList({ title, trades, toggleStatus, deleteTrade }: { title: string; trades: Trade[]; toggleStatus: (id: string, status?: string) => void; deleteTrade: (id: string) => void }) {
  return (
    <section className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
      <h2 className={`text-2xl font-bold mb-6 border-b-4 pb-3 ${title.includes("삽니다") ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}`}>
        {title}
      </h2>
      {trades.length > 0 ? (
        <ul className="space-y-5 overflow-y-auto max-h-[600px] pr-2">
          {trades.map((item) => (
            <li key={item._id} className={`p-5 rounded-xl shadow-md transition-colors duration-300 ${item.status === "거래완료" ? "bg-gray-100 text-gray-500 line-through" : "bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50"}`}>
              <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-1">
                <span>{item.mapName}</span>
                <span>·</span>
                <span>{item.subMap}</span>
                <span>· 상태:</span>
                <span className={`font-semibold ${item.status === "거래완료" ? "text-gray-400" : "text-purple-700"}`}>{item.status}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              {item.author && (
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={`https://cdn.discordapp.com/avatars/${item.author.discordId}/${item.author.avatar}.png`}
                    alt={`${item.author.username} 프로필`}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => (e.currentTarget.src = "/images/discord.png")}
                  />
                  <span className="text-sm text-gray-500">{item.author.username}</span>
                </div>
              )}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-indigo-600 font-extrabold text-xl">{item.price.toLocaleString()} 메소</span>
                <div className="flex gap-3">
                  <button onClick={() => toggleStatus(item._id, item.status)} className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-300 ${item.status === "거래완료" ? "bg-gray-400 hover:bg-gray-500" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                    {item.status === "거래완료" ? "거래 취소" : "거래 완료"}
                  </button>
                  <button onClick={() => deleteTrade(item._id)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-300">
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-400 mt-16 text-lg font-light">{title} 글이 없습니다.</p>
      )}
    </section>
  );
}
