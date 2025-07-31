"use client";

import { useState } from "react";

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

interface Props {
  skills: Skill[];
}

export default function SkillTree({ skills }: Props) {
  // 스킬별 현재 레벨 상태를 관리
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});

  const increaseLevel = (skill: Skill) => {
    const current = skillLevels[skill.id] || 0;

    // 선행 스킬 조건 체크
    if (skill.prerequisite) {
      const prereqLevel = skillLevels[skill.prerequisite.skillId] || 0;
      if (prereqLevel < skill.prerequisite.minLevel) {
        alert(`"${skill.name}" 스킬은 "${skill.prerequisite.skillId}" 스킬을 ${skill.prerequisite.minLevel}레벨 이상 찍어야 합니다.`);
        return;
      }
    }

    if (current < skill.maxLevel) {
      setSkillLevels({
        ...skillLevels,
        [skill.id]: current + 1,
      });
    }
  };

  const decreaseLevel = (skill: Skill) => {
    const current = skillLevels[skill.id] || 0;
    if (current > 0) {
      setSkillLevels({
        ...skillLevels,
        [skill.id]: current - 1,
      });
    }
  };

  // 스킬을 jobTier 별로 그룹화
  const tiers = [1, 2, 3, 4];
  const skillsByTier = (tier: number) => skills.filter((s) => s.jobTier === tier);

  // 전체 스킬 포인트 합산
  const totalSP = Object.values(skillLevels).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">스킬트리</h3>
      <p className="mb-4">총 사용 스킬 포인트: {totalSP}</p>

      {tiers.map((tier) => (
        <div key={tier} className="mb-6">
          <h4 className="font-semibold mb-2">{tier}차 스킬</h4>
          <div className="grid grid-cols-3 gap-4">
            {skillsByTier(tier).map((skill) => (
              <div key={skill.id} className="border p-3 rounded shadow-sm">
                <h5 className="font-semibold">{skill.name}</h5>
                <p className="text-sm text-gray-600">{skill.description}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <button
                    onClick={() => decreaseLevel(skill)}
                    disabled={(skillLevels[skill.id] || 0) === 0}
                    className="px-2 py-1 bg-red-200 rounded disabled:opacity-50"
                  >
                    -
                  </button>
                  <span>{skillLevels[skill.id] || 0} / {skill.maxLevel}</span>
                  <button
                    onClick={() => increaseLevel(skill)}
                    disabled={(skillLevels[skill.id] || 0) === skill.maxLevel}
                    className="px-2 py-1 bg-green-200 rounded disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
