"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import PartyApplicantsModal from "./components/PartyApplicantsModal";
import { FiCopy, FiXCircle, FiUsers, FiTrash2, FiCheckCircle } from "react-icons/fi";


interface Trade {
  _id: string;
  title: string;
  mapName: string;
  subMap: string;
  status: string;
  price: number;
  createdAt?: string;
  description: string;
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
  const [copiedPartyId, setCopiedPartyId] = useState<string | null>(null);

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

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const v = Number.isFinite(raw) ? Math.min(200, Math.max(0, Math.floor(raw))) : 0;
    setLevel(v);
  };

  const updateUserInfo = async () => {
    try {
      const safeLevel = Math.min(200, Math.max(0, level));
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE}/my/update`,
        { job, level: safeLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (user) setUser({ ...user, job, level: safeLevel });
      alert("정보가 저장되었습니다.");
    } catch {
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
    setParties((prev) => prev.map((p) => (p._id === id ? { ...p, isClosed: true } : p)));
  };

  const openPartyApplicantsModal = async (partyId: string) => {
    setSelectedPartyId(partyId);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/party/${partyId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplicants(res.data.applicants);
    } catch {
      alert("신청자 목록 불러오기 실패");
      setApplicants([]);
    }
  };

  const closePartyApplicantsModal = () => {
    setSelectedPartyId(null);
    setApplicants([]);
  };

  // 신청 페이지 링크 생성
  const buildPartyLink = (id: string) => {
    const base =
      (process.env.NEXT_PUBLIC_SITE_BASE?.replace(/\/$/, "") as string) ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/party/${id}`;
  };

  // 공유 텍스트 생성 + 클립보드 복사
  const copyPartyInfo = async (party: Party) => {
    const link = buildPartyLink(party._id);
    const text = `${party.map} - ${party.subMap} - ${party.positions.join(", ")}
${party.content}

파티신청: ${link}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPartyId(party._id);
      setTimeout(() => setCopiedPartyId(null), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopiedPartyId(party._id);
        setTimeout(() => setCopiedPartyId(null), 1500);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 유저 정보 */}
        <section className="bg-gray-800/90 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-bold mb-3">내 정보</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <select
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="w-full sm:w-auto bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="">직업 선택</option>
              <option value="검사">검사</option>
              <option value="파이터">파이터</option>
              <option value="크루세이더">크루세이더</option>
              <option value="히어로">히어로</option>
              <option value="페이지">페이지</option>
              <option value="나이트">나이트</option>
              <option value="팔라딘">팔라딘</option>
              <option value="스피어맨">스피어맨</option>
              <option value="용기사">용기사</option>
              <option value="다크나이트">다크나이트</option>
              <option value="로그">로그</option>
              <option value="시프">시프</option>
              <option value="시프마스터">시프마스터</option>
              <option value="섀도어">섀도어</option>
              <option value="어쌔신">어쌔신</option>
              <option value="허밋">허밋</option>
              <option value="나이트로드">나이트로드</option>
              <option value="매지션">매지션</option>
              <option value="클레릭">클레릭</option>
              <option value="프리스트">프리스트</option>
              <option value="비숍">비숍</option>
              <option value="위자드(불,독)">위자드(불,독)</option>
              <option value="메이지(불,독)">메이지(불,독)</option>
              <option value="아크메이지(불,독)">아크메이지(불,독)</option>
              <option value="위자드(썬,콜)">위자드(썬,콜)</option>
              <option value="메이지(썬,콜)">메이지(썬,콜)</option>
              <option value="아크메이지(썬,콜)">아크메이지(썬,콜)</option>
              <option value="아처">아처</option>
              <option value="헌터">헌터</option>
              <option value="레인저">레인저</option>
              <option value="보우마스터">보우마스터</option>
              <option value="사수">사수</option>
              <option value="저격수">저격수</option>
              <option value="신궁">신궁</option>
            </select>

            <input
              type="number"
              min={0}
              max={200}
              step={1}
              value={level}
              onChange={handleLevelChange}
              placeholder="레벨 (최대 200)"
              className="w-full sm:w-28 bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded"
            />

            <button
              onClick={updateUserInfo}
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded"
            >
              저장
            </button>
          </div>
        </section>

        {/* 파티 모집글 */}
        <section className="bg-gray-800/90 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-bold mb-2">내 파티 모집글</h2>
          <p className="mb-3 text-sm text-gray-300">2시간 이후에 자동 마감됩니다.</p>
          <ul className="space-y-3 max-h-[50vh] sm:max-h-64 overflow-y-auto pr-1">
            {parties.map((party) => (
              <li
                key={party._id}
                onClick={() =>
                  setExpandedPartyId((prev) => (prev === party._id ? null : party._id))
                }
                className={`border border-gray-600 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  expandedPartyId === party._id ? "bg-gray-700/60" : "bg-gray-900/40"
                } ${party.isClosed ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold flex items-center gap-2">
                      <span className="truncate">{party.title}</span>
                      {party.isClosed ? (
                        <span className="text-xs text-red-400 font-normal">(모집 마감)</span>
                      ) : (
                        <span className="text-xs text-green-400 font-normal">(모집 중)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {party.map} - {party.subMap} ({party.positions.join(", ")})
                    </div>
                  </div>

                  {/* 버튼 영역 (≥481px: 텍스트 버튼 / ≤480px: 아이콘 버튼) */}
                  {/* 큰 화면: 텍스트 버튼 */}
                  <div className="flex items-center gap-2 flex-wrap max-[480px]:hidden">
                    <p className="text-xs text-gray-400">{timeAgo(party.createdAt!)}</p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPartyInfo(party);
                      }}
                      className="px-2 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600"
                      title="파티 정보+신청 링크 복사"
                    >
                      {copiedPartyId === party._id ? "복사됨" : "복사"}
                    </button>

                    {!party.isClosed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeParty(party._id);
                        }}
                        className="px-2 py-1 rounded text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-600"
                      >
                        모집 마감
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPartyApplicantsModal(party._id);
                      }}
                      className="px-2 py-1 rounded text-sm bg-indigo-500 hover:bg-indigo-600"
                    >
                      파티 신청 목록
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteParty(party._id);
                      }}
                      className="px-2 py-1 rounded text-sm bg-red-500 hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>

                  {/* 작은 화면: 아이콘 버튼 (한 줄 유지) */}
                  <div className="hidden max-[480px]:flex items-center gap-1 flex-nowrap">
                    <span className="text-[11px] text-gray-400">{timeAgo(party.createdAt!)}</span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPartyInfo(party);
                      }}
                      className="p-2 rounded bg-gray-700 hover:bg-gray-600"
                      title={copiedPartyId === party._id ? "복사됨" : "복사"}
                      aria-label="복사"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>

                    {!party.isClosed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeParty(party._id);
                        }}
                        className="p-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black"
                        title="모집 마감"
                        aria-label="모집 마감"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPartyApplicantsModal(party._id);
                      }}
                      className="p-2 rounded bg-indigo-500 hover:bg-indigo-600"
                      title="파티 신청 목록"
                      aria-label="파티 신청 목록"
                    >
                      <FiUsers className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteParty(party._id);
                      }}
                      className="p-2 rounded bg-red-500 hover:bg-red-600"
                      title="삭제"
                      aria-label="삭제"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {expandedPartyId === party._id && (
                  <div className="mt-2 text-sm text-gray-300 whitespace-pre-line">
                    {party.content}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* 거래글 */}
        <section className="bg-gray-800/90 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-bold mb-2">내 자리 거래글</h2>
          <p className="mb-3 text-sm text-gray-300">1일 이후에 자동 취소됩니다.</p>
          <ul className="space-y-3 max-h-[50vh] sm:max-h-64 overflow-y-auto pr-1">
            {trades.map((trade) => {
              const isClosed = trade.status === "거래완료" || trade.status === "거래취소"; // ✅ 버그 수정
              return (
                <li
                  key={trade._id}
                  onClick={() =>
                    setExpandedTradeId((prev) => (prev === trade._id ? null : trade._id))
                  }
                  className={`border p-3 rounded-lg transition-all duration-200 cursor-pointer
                    ${isClosed ? "bg-gray-900 border-gray-600 border-l-4" : "bg-green-900/40 border-green-600 border-l-4"}
                    ${expandedTradeId === trade._id ? "bg-opacity-80" : "bg-opacity-60"}
                  `}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{trade.title}</div>
                      <div className="text-sm text-gray-300 truncate">
                        {trade.mapName} - {trade.subMap} - {trade.price.toLocaleString()}메소
                        <span
                          className={`px-2 ${
                            trade.status === "거래완료"
                              ? "text-green-400 font-semibold"
                              : trade.status === "거래취소"
                              ? "text-red-400 font-semibold"
                              : trade.status === "거래가능"
                              ? "text-blue-400 font-semibold"
                              : ""
                          }`}
                        >
                          ({trade.status})
                        </span>
                      </div>
                    </div>

                    {/* 버튼 영역 (≥481px: 텍스트 버튼 / ≤480px: 아이콘 버튼) */}
                    {/* 큰 화면: 텍스트 버튼 */}
                    <div className="flex items-center gap-2 flex-wrap max-[480px]:hidden">
                      <p className="text-xs text-gray-400">{timeAgo(trade.createdAt!)}</p>

                      {trade.status !== "거래완료" && trade.status !== "거래취소" && (
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

                      {trade.status !== "거래완료" && trade.status !== "거래취소" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrade(trade._id);
                          }}
                          className="px-2 py-1 rounded text-sm bg-red-500 hover:bg-red-600"
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    {/* 작은 화면: 아이콘 버튼 */}
                    <div className="hidden max-[480px]:flex items-center gap-1 flex-nowrap">
                      <span className="text-[11px] text-gray-400">{timeAgo(trade.createdAt!)}</span>

                      {trade.status !== "거래완료" && trade.status !== "거래취소" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTradeStatus(trade._id, trade.status);
                          }}
                          className="p-2 rounded bg-green-500 hover:bg-green-600 text-white"
                          title="거래 완료"
                          aria-label="거래 완료"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {trade.status !== "거래완료" && trade.status !== "거래취소" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrade(trade._id);
                          }}
                          className="p-2 rounded bg-red-500 hover:bg-red-600"
                          title="삭제"
                          aria-label="삭제"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>

                  {expandedTradeId === trade._id && (
                    <div className="mt-2 text-sm text-gray-300">
                      {trade.description}
                    </div>
                  )}
                </li>
              );
            })}
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
