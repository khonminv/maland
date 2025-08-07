"use client";

import { useEffect, useState } from "react";

interface Applicant {
  discordId: string;
  username: string;
  avatar: string;
  job: string;
  level: number;
  message: string;
  positions?: string[];
}

interface PartyApplicantsModalProps {
  applicants: Applicant[];
  partyId: string;
  onClose: () => void;
}

export default function PartyApplicantsModal({
  applicants: initialApplicants = [],
  partyId,
  onClose,
}: PartyApplicantsModalProps) {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [loading, setLoading] = useState(false);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/party/${partyId}/applicants`);

      const data = await res.json();
      if (Array.isArray(data.applicants)) {
        setApplicants(data.applicants);
      } else {
        setApplicants([]);
      }
    } catch (error) {
      console.error("Failed to fetch applicants", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchApplicants();
  }, [partyId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">파티 신청자 목록</h3>
          <button
            onClick={fetchApplicants}
            className="text-sm bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded"
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "새로고침"}
          </button>
        </div>

        <ul className="space-y-3 max-h-96 overflow-y-auto">
          {applicants.length === 0 && <li>신청자가 없습니다.</li>}
          {applicants.map((applicant, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-3 border-b border-gray-700 pb-2"
            >
              <div className="flex items-start gap-3">
                <img
                  src={applicant.avatar || "/images/discord.png"}
                  alt={applicant.username}
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/images/discord.png";
                  }}
                  onClick={() =>
                    window.open(
                      `https://discord.com/users/${applicant.discordId}`,
                      "_blank"
                    )
                  }
                />
                <div className="flex-1">
                  <div
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={() =>
                      window.open(
                        `https://discord.com/users/${applicant.discordId}`,
                        "_blank"
                      )
                    }
                  >
                    {applicant.username} ({applicant.job})
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    레벨: {applicant.level} / 닉네임:{" "}
                    {applicant.message || "-"}
                  </div>
                  {applicant.positions && applicant.positions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {applicant.positions.map((pos) => (
                        <span
                          key={pos}
                          className="bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5 rounded-full"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                className="text-yellow-300 hover:text-yellow-500 text-xl"
                title="DM 보내기"
                onClick={() =>
                  window.open(
                    `https://discord.com/users/${applicant.discordId}`,
                    "_blank"
                  )
                }
              >
                💬
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
