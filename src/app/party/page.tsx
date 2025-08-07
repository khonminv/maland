"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface PartyPost {
  _id: string;
  map: string;
  subMap: string;
  positions: string[];
  content: string;
  createdAt: string;
  isClosed?: boolean;
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
  "프리", "원정대", "버블"
];

const jobOptions = [
  "전사", "마법사", "궁수", "도적", "해적",
  "해병", "기사", "궁수(궁극)", "마법사(불꽃)",
];

export default function PartyListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();

  const [partyPosts, setPartyPosts] = useState<PartyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [applyJob, setApplyJob] = useState(() =>
    jobOptions.includes(user?.job ?? "") ? user!.job : jobOptions[0]
  );
  const [applyLevel, setApplyLevel] = useState(user?.level ?? 1);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyPositions, setApplyPositions] = useState<string[]>([]); // 여러 자리 선택

  const initialMap = searchParams.get("map") ?? "";
  const initialSubMap = searchParams.get("subMap") ?? "";
  const initialPositions = searchParams.getAll("pos");

  const [mapFilter, setMapFilter] = useState(initialMap);
  const [subMapFilter, setSubMapFilter] = useState(initialSubMap);
  const [positionFilter, setPositionFilter] = useState<string[]>(initialPositions);

  useEffect(() => {
    fetchPartyPosts();
  }, []);

  useEffect(() => {
    setApplyLevel(user?.level ?? 1);
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (mapFilter) params.set("map", mapFilter);
    if (subMapFilter) params.set("subMap", subMapFilter);
    positionFilter.forEach((pos) => params.append("pos", pos));
    router.replace(`/party?${params.toString()}`, { scroll: false });
  }, [mapFilter, subMapFilter, positionFilter, router]);

  const fetchPartyPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/party`);
      setPartyPosts(res.data);
    } catch {
      setError("파티 모집글 불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const openApplyModal = (partyId: string) => {
    setSelectedPartyId(partyId);
    setApplyLevel(user?.level ?? 1);
    setApplyJob(user?.job ?? jobOptions[0]);
    setApplyMessage("");
    setApplyPositions([]); // 초기화 (빈 배열)
  };

  const closeApplyModal = () => {
    setSelectedPartyId(null);
  };

  const toggleApplyPosition = (pos: string) => {
    setApplyPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };
  

  const submitApplication = async () => {
  if (!user || !token || !selectedPartyId) {
    alert("로그인이 필요합니다.");
    return;
  }

  if (applyPositions.length === 0) {
    alert("신청할 자리를 최소 하나 이상 선택해주세요.");
    return;
  }

  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/party/${selectedPartyId}/apply`,
      {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        job: applyJob,
        level: applyLevel,
        message: applyMessage,
        positions: applyPositions,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("신청이 완료되었습니다.");
    closeApplyModal();
  } catch (err: any) {
    console.error(err);
    if (err.response?.status === 400) {
      alert("이미 신청한 파티입니다.");
    } else {
      alert("신청 실패. 다시 시도해주세요.");
    }
  }
};


  const togglePositionFilter = (pos: string) => {
    setPositionFilter((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const filteredPosts = partyPosts.filter((post) => {
    if (post.isClosed) return false; 
    if (mapFilter && post.map !== mapFilter) return false;
    if (subMapFilter && post.subMap !== subMapFilter) return false;
    if (positionFilter.length > 0 && !positionFilter.some((pos) => post.positions.includes(pos)))
      return false;
    return true;
  });

  const timeAgo = (dateString: string) => {
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
  };

  const availableSubMaps = mapFilter ? mapData[mapFilter] ?? [] : [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-yellow-400 text-center">파티 모집 목록</h1>

      <div className="mb-6 text-center">
        <Link href="/party/new" className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition">
          모집글 작성하기
        </Link>
      </div>

      {/* 필터 UI */}
      <div className="flex gap-8 mb-6 flex-wrap md:flex-nowrap">
        <div className="flex flex-col gap-4 flex-1 max-w-xs min-w-[200px]">
          <div>
            <label className="block mb-1 text-gray-300 font-semibold">월드 선택</label>
            <select
              value={mapFilter}
              onChange={(e) => {
                setMapFilter(e.target.value);
                setSubMapFilter("");
              }}
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              <option value="">전체 보기</option>
              {Object.keys(mapData).map((map) => (
                <option key={map} value={map}>{map}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-gray-300 font-semibold">맵 선택</label>
            <select
              value={subMapFilter}
              onChange={(e) => setSubMapFilter(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
              disabled={!mapFilter}
            >
              <option value="">전체 보기</option>
              {availableSubMaps.map((subMap) => (
                <option key={subMap} value={subMap}>{subMap}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 max-w-lg min-w-[280px]">
          <label className="block mb-1 text-gray-300 font-semibold">자리 필터</label>
          <div className="flex flex-wrap gap-2 bg-gray-800 p-3 rounded border border-gray-600 max-h-32 overflow-y-auto">
            {positionOptions.map((pos) => (
              <button
                key={pos}
                onClick={() => togglePositionFilter(pos)}
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

      {/* 모집글 목록 */}
      {loading && <p className="text-center text-gray-400">로딩 중...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && filteredPosts.length === 0 && (
        <p className="text-center text-gray-500">조건에 맞는 모집글이 없습니다.</p>
      )}

      <ul className="space-y-6">
        {filteredPosts.map((post) => (
          <li key={post._id} className="bg-[#1f2937] p-6 rounded-xl border border-gray-700 text-white flex justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2 flex justify-between w-full">
                <span>{post.map} / {post.subMap}</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
              <p className="mb-3 whitespace-pre-line w-full">{post.content}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {post.positions.map((pos) => (
                  <span key={pos} className="bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold">{pos}</span>
                ))}
              </div>
            </div>
            <button
              className="ml-4 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded"
              onClick={() => openApplyModal(post._id)}
            >
              파티 신청
            </button>
          </li>
        ))}
      </ul>

      {/* 신청 모달 */}
      {selectedPartyId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded max-w-md w-full text-white relative overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">파티 신청</h2>

            {/* 신청 가능한 자리들 (중복 선택 가능) */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">신청 가능한 자리 선택 (복수 선택 가능)</h3>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-gray-800 rounded border border-gray-600">
                {partyPosts.find((p) => p._id === selectedPartyId)?.positions.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => toggleApplyPosition(pos)}
                    className={`px-3 py-1 rounded-full font-semibold border ${
                      applyPositions.includes(pos)
                        ? "bg-yellow-400 text-black border-yellow-300"
                        : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-yellow-600"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <label className="block mb-2">
              <span>레벨</span>
              <input
                type="number"
                value={applyLevel}
                min={1}
                onChange={(e) => setApplyLevel(Number(e.target.value))}
                className="w-full mt-1 p-2 bg-gray-800 rounded"
              />
            </label>

            <label className="block mb-4">
              <span>닉네임</span>
              <textarea
                value={applyMessage}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    setApplyMessage(e.target.value);
                  }
                }}
                className="w-full mt-1 p-2 bg-gray-800 rounded resize-none"
                rows={3}
                placeholder="닉네임을 입력하세요"
              />
              <div className="text-right text-sm text-gray-400">
                {applyMessage.length} / 50
              </div>
            </label>

            <div className="flex justify-end gap-2">
              <button onClick={closeApplyModal} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
                취소
              </button>
              <button onClick={submitApplication} className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300">
                신청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
