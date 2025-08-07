"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import PartyApplicantsModal from "./components/PartyApplicantsModal";

interface Trade {
  _id: string;
  title: string;
  mapName: string;
  subMap: string;
  status: string;
  price: number;
  createdAt?: string;
}

interface Party {
  _id: string;
  title: string;
  map: string;
  subMap: string;
  positions: string[];
  createdAt: string;
  content: string;
  isClosed?: boolean;
}

interface Applicant {
  discordId: string;
  username: string;
  avatar: string;
  job: string;
  level: number;
  message: string;
}

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

export default function MyPage() {
  const { user, setUser, token } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [job, setJob] = useState(user?.job || "");
  const [level, setLevel] = useState(user?.level || 0);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [expandedPartyId, setExpandedPartyId] = useState<string | null>(null);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrades(res.data.trades);
      setParties(res.data.parties);
      setJob(res.data.user.job);
      setLevel(res.data.user.level);
    };

    fetchData();
  }, [token]);

  const updateUserInfo = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE}/my/update`,
        { job, level },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (user) {
        setUser({ ...user, job, level });
      }

      alert("정보가 저장되었습니다.");
    } catch (err) {
      alert("업데이트 실패");
    }
  };

  const deleteTrade = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/trades/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTrades((prev) => prev.filter((t) => t._id !== id));
  };

  const toggleTradeStatus = async (id: string, currentStatus: string) => {
    const isDone = currentStatus === "거래완료";
    if (!isDone && !confirm("정말 거래 완료로 변경하시겠습니까?")) return;

    const newStatus = isDone ? "거래가능" : "거래완료";
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_BASE}/trades/${id}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTrades((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );
  };

  const deleteParty = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/party/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setParties((prev) => prev.filter((p) => p._id !== id));
  };


  const closeParty = async (id: string) => {
  if (!confirm("정말 모집을 마감하시겠습니까?")) return;

  await axios.patch(
    `${process.env.NEXT_PUBLIC_API_BASE}/party/${id}/close`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setParties((prev) =>
    prev.map((p) => (p._id === id ? { ...p, isClosed: true } : p))
  );
};


  const openPartyApplicantsModal = async (partyId: string) => {
    setSelectedPartyId(partyId);

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/party/${partyId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplicants(res.data.applicants);
    } catch (error) {
      alert("신청자 목록 불러오기 실패");
      setApplicants([]);
    }
  };

  const closePartyApplicantsModal = () => {
    setSelectedPartyId(null);
    setApplicants([]);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 유저 정보 */}
        <section className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-3">내 정보</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded"
            >
              <option value="">직업 선택</option>
              <option value="히어로">히어로</option>
              <option value="아크메이지(썬콜)">아크메이지(썬콜)</option>
              <option value="나이트로드">나이트로드</option>
            </select>
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              placeholder="레벨"
              className="bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded w-24"
            />
            <button
              onClick={updateUserInfo}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-1 rounded"
            >
              저장
            </button>
          </div>
        </section>

        {/* 파티 모집글 */}
        <section className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">내 파티 모집글</h2>
          <p>2시간 이후에 자동 마감됩니다.</p>
          <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {parties.map((party) => (
              <li
                key={party._id}
                onClick={() =>
                  setExpandedPartyId((prev) => (prev === party._id ? null : party._id))
                }
                className={`border border-gray-600 p-3 rounded transition-all duration-200 cursor-pointer ${
                  expandedPartyId === party._id ? "bg-gray-700" : ""
                } ${party.isClosed ? "opacity-50" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {party.title}
                      {party.isClosed ? (
                        <span className="text-sm text-red-400 font-normal">(모집 마감)</span>
                      ) : (
                        <span className="text-sm text-green-400 font-normal">(모집 중)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {party.map} - {party.subMap} ({party.positions.join(", ")})
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <p>{timeAgo(party.createdAt!)}</p>
                    {!party.isClosed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeParty(party._id);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-2 py-1 rounded text-sm"
                      >
                        모집 마감
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPartyApplicantsModal(party._id);
                      }}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded text-sm"
                    >
                      파티 신청 목록
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteParty(party._id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                {expandedPartyId === party._id && (
                  <div className="mt-2 text-sm text-gray-300 whitespace-pre-line">
                    상세 내용: {party.content}
                  </div>
                )}
              </li>
            ))}

          </ul>
        </section>

        {/* 거래글 */}
        <section className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">내 자리 거래글</h2>
          <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {trades.map((trade) => (
              <li
                key={trade._id}
                onClick={() =>
                  setExpandedTradeId((prev) => (prev === trade._id ? null : trade._id))
                }
                className={`border p-3 rounded transition-all duration-200 cursor-pointer
                  ${
                    trade.status === "거래완료"
                      ? "bg-gray-900 border-gray-600 border-l-4"
                      : "bg-green-900 border-green-600 border-l-4"
                  }
                  ${expandedTradeId === trade._id ? "bg-opacity-80" : "bg-opacity-60"}
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{trade.title}</div>
                    <div className="text-sm text-gray-300">
                      {trade.mapName} - {trade.subMap} -  {trade.price.toLocaleString()}메소 ({trade.status}) 
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <p className="text-xs">{timeAgo(trade.createdAt!)}</p>
                    {trade.status !== "거래완료" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTradeStatus(trade._id, trade.status);
                        }}
                        className="px-2 py-1 rounded text-sm font-medium text-white bg-green-500 hover:bg-green-600"
                      >
                        거래 완료
                      </button>
                    )}
                    {trade.status !== "거래완료" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrade(trade._id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                {expandedTradeId === trade._id && (
                  <div className="mt-2 text-sm text-gray-300">
                    상세 내용: {trade.title} - {trade.mapName} - {trade.subMap}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* 파티 신청자 목록 모달 */}
        {selectedPartyId && (
          <PartyApplicantsModal
            applicants={applicants}
            onClose={closePartyApplicantsModal}
            partyId={selectedPartyId}
          />
        )}
      </div>
    </div>
  );
}
