"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

interface UserLite {
  discordId: string;
  username?: string;
  avatar?: string;
}

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
  createdAt?: string;
  author?: {
    username: string;
    discordId: string;
    avatar?: string;
  };
  reservedBy?: UserLite | null;
  user?: UserLite | null;
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
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}초 전`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function TradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리에서 초기 필터값 가져오기
  const initialMapFilter = searchParams.get("map") || "";
  const initialSubMapFilter = searchParams.get("subMap") || "";
  const initialShowCompleted = searchParams.get("showCompleted") === "true";

  const { user } = useAuth();

  const [mapFilter, setMapFilter] = useState(initialMapFilter);
  const [subMapFilter, setSubMapFilter] = useState(initialSubMapFilter);
  const [showCompleted, setShowCompleted] = useState(initialShowCompleted);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [filtered, setFiltered] = useState<Trade[]>([]);
  const [avgPrices, setAvgPrices] = useState<AvgPrice[]>([]);

  // 쿼리파라미터 업데이트 함수
  const updateQuery = (params: {
    map?: string;
    subMap?: string;
    showCompleted?: boolean;
  }) => {
    const query = new URLSearchParams();

    // map 설정
    if (params.map !== undefined) {
      if (params.map) query.set("map", params.map);
    } else if (mapFilter) {
      query.set("map", mapFilter);
    }

    // subMap 설정
    if (params.subMap !== undefined) {
      if (params.subMap) query.set("subMap", params.subMap);
    } else if (subMapFilter) {
      query.set("subMap", subMapFilter);
    }

    // showCompleted 설정
    if (params.showCompleted !== undefined) {
      if (params.showCompleted) query.set("showCompleted", "true");
      else query.delete("showCompleted");
    } else if (showCompleted) {
      query.set("showCompleted", "true");
    }

    const queryString = query.toString();
    router.replace(
    `${window.location.pathname}${queryString ? `?${queryString}` : ""}`
  );
  };

  // 필터 변경 시 함수들
  const onMapFilterChange = (m: string) => {
    setMapFilter(m);
    setSubMapFilter("");
    updateQuery({ map: m, subMap: "" });
  };

  const onSubMapFilterChange = (sm: string) => {
    setSubMapFilter(sm);
    updateQuery({ subMap: sm });
  };

  const onShowCompletedToggle = () => {
    const newValue = !showCompleted;
    setShowCompleted(newValue);
    updateQuery({ showCompleted: newValue });
  };

  // 서버에서 거래글 목록 가져오기
  const fetchTrades = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/trades`);
      setTrades(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 평균 가격 데이터 가져오기
  const fetchAvgPrices = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/trades/average-prices-by-submap`
      );
      setAvgPrices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchTrades();
    fetchAvgPrices();
  }, []);

  // 필터 적용
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
      await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE}/trades/${id}/status`, {
        status: newStatus,
      });
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

  const handleReserve = async (tradeId: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/trades/${tradeId}/reserve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // user.token에 실제 토큰이 있어야 함
          },
        }
      );

      setTrades((prev) =>
        prev.map((t) => (t._id === tradeId ? { ...t, status: "거래중" } : t))
      );

      alert("거래 신청 완료!");
      fetchTrades();
      fetchAvgPrices();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "거래 신청에 실패했습니다.");
      } else {
        alert("알 수 없는 에러가 발생했습니다.");
      }
    }
  };

  const handleCancelReserve = async (tradeId: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/trades/${tradeId}/cancel-reserve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setTrades((prev) =>
        prev.map((t) =>
          t._id === tradeId ? { ...t, status: "거래가능", reservedBy: undefined } : t
        )
      );

      alert("거래 신청이 취소되었습니다.");
      fetchTrades();
      fetchAvgPrices();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "거래 취소에 실패했습니다.");
      } else {
        alert("알 수 없는 에러가 발생했습니다.");
      }
    }
  };

  const currentSubMaps = mapFilter ? subMapsByMap[mapFilter] || [] : [];

  const filteredAvgPrices =
    mapFilter && subMapFilter
      ? avgPrices.filter(
          (ap) => ap._id.mapName === mapFilter && ap._id.subMap === subMapFilter
        )
      : [];

  return (
    <div className="p-6 max-w-5xl font-sans text-gray-900">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gradient bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
        거래 게시판
      </h1>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {maps.map((m) => (
          <button
            key={m}
            onClick={() => onMapFilterChange(m)}
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
            onChange={(e) => onSubMapFilterChange(e.target.value)}
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
            onClick={onShowCompletedToggle}
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
                  <span className="text-indigo-600 font-bold">
                    {avgPrice.toLocaleString()} 메소
                  </span>
                  <span className="text-gray-400">({count}건)</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <p className="text-center text-gray-400 mb-12">
          서브맵을 선택해야 평균 가격을 볼 수 있습니다.
        </p>
      )}

      <div className="w-full flex flex-col md:flex-row gap-8">
        <TradeList
          title="🛒 삽니다"
          trades={filtered.filter((t) => t.type === "삽니다")}
          toggleStatus={toggleStatus}
          deleteTrade={deleteTrade}
          onReserve={handleReserve}
          onCancelReserve={handleCancelReserve}
          user={user}
        />
        <TradeList
          title="📦 팝니다"
          trades={filtered.filter((t) => t.type === "팝니다")}
          toggleStatus={toggleStatus}
          deleteTrade={deleteTrade}
          onReserve={handleReserve}
          onCancelReserve={handleCancelReserve}
          user={user}
        />
      </div>
    </div>
  );
}

function TradeList({
  title,
  trades,
  toggleStatus,
  deleteTrade,
  onReserve,
  onCancelReserve,
  user,
}: {
  title: string;
  trades: Trade[];
  toggleStatus: (id: string, status?: string) => void;
  deleteTrade: (id: string) => void;
  onReserve: (id: string) => void;
  onCancelReserve: (id: string) => void;
  user?: UserLite | null;
}) {
  return (
    <section className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
      <h2
        className={`text-2xl font-bold mb-6 border-b-4 pb-3 ${
          title.includes("삽니다")
            ? "border-green-500 text-green-600"
            : "border-red-500 text-red-600"
        }`}
      >
        {title}
      </h2>
      {trades.length > 0 ? (
        <ul className="space-y-5 overflow-y-auto max-h-[600px] pr-2">
          {trades.map((item) => (
            <li
              key={item._id}
              className={`p-5 rounded-xl shadow-md transition-colors duration-300 ${
                item.status === "거래완료"
                  ? "bg-gray-100 text-gray-500 line-through"
                  : "bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50"
              }`}
            >
              <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-1">
                <span>{item.mapName}</span>
                <span>·</span>
                <span>{item.subMap}</span>
                <span>· 상태:</span>
                <span
                  className={`font-semibold ${
                    item.status === "거래완료" ? "text-gray-400" : "text-purple-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              {item.createdAt && (
                <p className="text-xs text-gray-400 mb-2">
                  {timeAgo(item.createdAt)}
                </p>
              )}
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
                <span className="text-indigo-600 font-extrabold text-xl">
                  {item.price.toLocaleString()} 메소
                </span>
                <div className="flex gap-3">
                  {/* 거래 신청 버튼: 상태가 "거래가능"일 때만 활성화 */}
                  {/* {item.status === "거래가능" && (
                    <button
                      onClick={() => onReserve(item._id)}
                      className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors duration-300"
                    >
                      거래 신청
                    </button>
                  )} */}

                  {/* 거래중이고 reservedBy.discordId === user.discordId 인 경우만 거래 취소 버튼 */}
                  {/* {item.status === "거래중" &&
                    item.reservedBy &&
                    user &&
                    item.reservedBy.discordId === user.discordId && (
                      <button
                        onClick={() => onCancelReserve(item._id)}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors duration-300"
                      >
                        거래 취소
                      </button>
                    )} */}

                  {/* 거래중 상태 표시 */}
                  {/* {item.status === "거래중" && (
                    <span className="px-4 py-2 rounded-lg bg-gray-400 text-white font-semibold">거래중</span>
                  )} */}
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
