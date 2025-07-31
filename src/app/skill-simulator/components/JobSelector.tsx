"use client";

import { useState, useEffect } from "react";
import SkillTree from "./SkillTree";

interface Skill {
  id: string;
  name: string;
  description?: string;
  maxLevel: number;
  jobTier: number;
  prerequisite?: {
    skillId: string;
    minLevel: number;
  };
}

const jobs = [
  { id: "knight", name: "기사" },
  { id: "fire_mage", name: "화염 마법사" },
  // 필요한 직업 추가 가능
];

export default function JobSelector() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    setError(null);

    fetch(`/skills/${selectedJob}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("스킬 데이터를 불러오는 데 실패했습니다.");
        return res.json();
      })
      .then((data: Skill[]) => {
        setSkills(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">직업 선택</h2>
      <div className="flex space-x-4 mb-6">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => setSelectedJob(job.id)}
            className={`px-4 py-2 rounded ${
              selectedJob === job.id ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {job.name}
          </button>
        ))}
      </div>

      {loading && <p>스킬 데이터를 불러오는 중...</p>}
      {error && <p className="text-red-500">에러: {error}</p>}
      {!loading && !error && skills.length > 0 && (
        <SkillTree skills={skills} />
      )}
    </div>
  );
}
