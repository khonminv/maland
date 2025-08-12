"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ===== Types (동일) ===== */
interface Prerequisite { skillId: string; minLevel: number; }
type SkillType = "active" | "passive" | "buff" | "toggle";
interface Skill { id: string; nameKo: string; type: SkillType; maxLevel: number; requiredLevel?: number; prerequisite?: Prerequisite | null; description?: string; }
interface Advancement { tier: 1 | 2 | 3 | 4; jobNameKo: string; skills: Skill[]; }
interface JobLine {
  jobId: string;
  jobNameKo: string;
  metadata: { spRules: { firstJobLevel: number; secondJobLevel: number; thirdJobLevel: number; fourthJobLevel: number; firstJobBonusSP: number; } };
  advancements: Advancement[];
}

/* ===== Skeleton & Helpers (동일) ===== */
const SKELETON_LINE: JobLine = {
  jobId: "skeleton",
  jobNameKo: "로딩 중...",
  metadata: { spRules: { firstJobLevel: 10, secondJobLevel: 30, thirdJobLevel: 70, fourthJobLevel: 120, firstJobBonusSP: 1 } },
  advancements: [
    { tier: 1, jobNameKo: "1차", skills: [] },
    { tier: 2, jobNameKo: "2차", skills: [] },
    { tier: 3, jobNameKo: "3차", skills: [] },
    { tier: 4, jobNameKo: "4차", skills: [] },
  ],
};

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function calcTierSPCap(level: number, tier: 1 | 2 | 3 | 4, rules: JobLine["metadata"]["spRules"]) {
  const { firstJobLevel, secondJobLevel, thirdJobLevel, fourthJobLevel, firstJobBonusSP } = rules;
  const perLevelSP = 3;
  if (tier === 1) {
    if (level < firstJobLevel) return 0;
    const levelsGained = Math.max(0, Math.min(level, secondJobLevel - 1) - firstJobLevel + 1);
    return firstJobBonusSP + levelsGained * perLevelSP;
  }
  if (tier === 2) {
    if (level < secondJobLevel) return 0;
    const levelsGained = Math.max(0, Math.min(level, thirdJobLevel - 1) - secondJobLevel + 1);
    return levelsGained * perLevelSP;
  }
  if (tier === 3) {
    if (level < thirdJobLevel) return 0;
    const levelsGained = Math.max(0, Math.min(level, fourthJobLevel - 1) - thirdJobLevel + 1);
    return levelsGained * perLevelSP;
  }
  if (level < fourthJobLevel) return 0;
  const maxLevel = Math.max(level, fourthJobLevel);
  const levelsGained = Math.max(0, maxLevel - fourthJobLevel + 1);
  return levelsGained * perLevelSP;
}

/* ===== 색상/뱃지/유틸 ===== */
const typeChip: Record<SkillType, string> = {
  active:  "bg-amber-400/20 text-amber-200 border-amber-400/40",
  buff:    "bg-emerald-400/20 text-emerald-200 border-emerald-400/40",
  passive: "bg-sky-400/20 text-sky-200 border-sky-400/40",
  toggle:  "bg-fuchsia-400/20 text-fuchsia-200 border-fuchsia-400/40",
};
const tierColor: Record<1|2|3|4,string> = {
  1: "from-sky-500 to-sky-600",
  2: "from-emerald-500 to-emerald-600",
  3: "from-violet-500 to-violet-600",
  4: "from-amber-500 to-amber-600",
};
function initials(name: string) {
  const t = name.trim();
  const pick = [...t].filter(ch => /[A-Za-z가-힣]/.test(ch)).slice(0,2).join("");
  return pick || "SK";
}
function iconSrc(jobId: string, skillId: string) {
  // 아이콘이 있으면 /public/skills/icons/<jobId>/<skillId>.png 으로 넣어주세요.
  return `/skills/icons/${jobId}/${skillId}.png`;
}

/* ===== 메이플 스타일 컴포넌트 ===== */
const MaplePanel: React.FC<{title: string; subtitle?: string; children: React.ReactNode}> = ({ title, subtitle, children }) => (
  <div className="rounded-2xl overflow-hidden border border-blue-400/30 bg-gradient-to-b from-blue-950/70 to-neutral-950 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 border-b border-white/10">
      <div className="text-white text-lg font-bold drop-shadow">{title}</div>
      {subtitle && <div className="text-blue-100 text-xs">{subtitle}</div>}
    </div>
    <div className="p-4 md:p-5">{children}</div>
  </div>
);

const SPOrbs: React.FC<{ used: number; cap: number }> = ({ used, cap }) => {
  const filled = Math.min(used, cap);
  const arr = Array.from({ length: cap }, (_, i) => i < filled);
  return (
    <div className="flex flex-wrap gap-1.5">
      {arr.map((on, i) => (
        <span key={i} className={`inline-block h-3.5 w-3.5 rounded-full border ${on ? "bg-yellow-300 border-yellow-200" : "bg-neutral-800 border-neutral-700"}`} />
      ))}
    </div>
  );
};

const MapleTab: React.FC<{label: string; active?: boolean; locked?: boolean; onClick: () => void}> =
({ label, active, locked, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "px-3 py-2 rounded-t-xl border-x border-t",
      active ? "bg-neutral-900 border-blue-400 text-blue-200" : "bg-neutral-800/60 border-neutral-600 text-neutral-300 hover:bg-neutral-700/60",
      locked ? "opacity-50 cursor-not-allowed" : ""
    ].join(" ")}
    disabled={locked}
  >
    {label} {locked && <span className="ml-1 text-[10px] align-middle">🔒</span>}
  </button>
);

type RowProps = {
  s: Skill; tier: 1|2|3|4; curr: number;
  canPlus: boolean; canMinus: boolean;
  onPlus: () => void; onMinus: () => void; onMaster: () => void;
  jobId: string;
};
const SkillCard: React.FC<RowProps> = ({ s, tier, curr, canPlus, canMinus, onPlus, onMinus, onMaster, jobId }) => {
  const [imgErr, setImgErr] = useState(false);
  const lockedBadge = (reason: string) => (
    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-200">{reason}</span>
  );
  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-xl border border-neutral-700/70 bg-neutral-900/60 p-2.5 hover:bg-neutral-900">
      {/* 아이콘 */}
      <div className="relative">
        {imgErr ? (
          <div className="h-12 w-12 rounded border border-neutral-700 grid place-items-center bg-neutral-800 text-xs text-neutral-200">
            {initials(s.nameKo)}
          </div>
        ) : (
          <img
            src={iconSrc(jobId, s.id)}
            alt={s.nameKo}
            className="h-12 w-12 rounded border border-neutral-700 object-cover bg-neutral-800"
            onError={() => setImgErr(true)}
          />
        )}
        {/* 현재 레벨 배지 */}
        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-neutral-950 border border-yellow-400/50 text-yellow-300 shadow">
          {curr}/{s.maxLevel}
        </div>
      </div>

      {/* 이름/설명 */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] ${typeChip[s.type]} tracking-wide`}>{s.type.toUpperCase()}</span>
          <div className="font-semibold truncate">{s.nameKo}</div>
          {/* 제약 뱃지들 */}
          {s.requiredLevel && <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-600 text-neutral-300">요구 Lv {s.requiredLevel}</span>}
          {s.prerequisite && lockedBadge(`선행 ${s.prerequisite.minLevel}↑`)}
        </div>
        <div className="text-xs text-neutral-300/80 mt-1 line-clamp-2">{s.description || "설명 없음"}</div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center gap-1">
        <button
          className="h-8 w-8 rounded-md grid place-items-center border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40"
          onClick={onMinus} disabled={!canMinus}>−</button>
        <button
          className="h-8 w-8 rounded-md grid place-items-center border border-yellow-600/50 bg-yellow-600/20 hover:bg-yellow-600/30 disabled:opacity-40 text-yellow-200"
          onClick={onPlus} disabled={!canPlus}>＋</button>
        <button
          className="ml-1 h-8 rounded-md px-2 text-xs border border-amber-400/40 bg-amber-400/15 hover:bg-amber-400/25 text-amber-200"
          onClick={onMaster}>마스터</button>
      </div>
    </div>
  );
};

/* ===== 메인 ===== */
export default function SkillSimulator() {
  type JobIndexItem = { jobId: string; jobNameKo: string };

  const [jobLine, setJobLine] = useState<JobLine>(SKELETON_LINE);
  const [level, setLevel] = useState<number>(30);
  const [alloc, setAlloc] = useState<Record<string, number>>({});
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(1);
  const [message, setMessage] = useState<string>("");

  const [jobsIndex, setJobsIndex] = useState<JobIndexItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const idxRes = await fetch("/skills/index.json", { cache: "no-store" });
        if (!idxRes.ok) throw new Error("index.json 로드 실패");
        const idx: JobIndexItem[] = await idxRes.json();
        setJobsIndex(idx);

        const savedJob = localStorage.getItem("ml-sim-job");
        const first = (idx.find(j => j.jobId === savedJob) ?? idx[0]);
        if (!first?.jobId) throw new Error("직업 인덱스 비어 있음");
        setSelectedJobId(first.jobId);

        const jobRes = await fetch(`/skills/${first.jobId}.json`, { cache: "no-store" });
        if (!jobRes.ok) throw new Error(`${first.jobId}.json 로드 실패`);
        const data: JobLine = await jobRes.json();
        setJobLine(data);

        const savedAlloc = localStorage.getItem("ml-sim-alloc");
        const savedLevel = localStorage.getItem("ml-sim-level");
        if (savedAlloc) setAlloc(JSON.parse(savedAlloc));
        if (savedLevel) setLevel(parseInt(savedLevel, 10));
      } catch (e: any) {
        setError(e.message || "데이터 로드 오류");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedJobId || jobsIndex.length === 0) return;
      try {
        setLoading(true);
        const res = await fetch(`/skills/${selectedJobId}.json`, { cache: "no-store" });
        if (!res.ok) throw new Error(`${selectedJobId}.json 로드 실패`);
        const data: JobLine = await res.json();
        setJobLine(data);
        setAlloc({});
        localStorage.setItem("ml-sim-job", selectedJobId);
      } catch (e: any) {
        setError(e.message || "데이터 로드 오류");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedJobId, jobsIndex]);

  useEffect(() => {
    localStorage.setItem("ml-sim-alloc", JSON.stringify(alloc));
    localStorage.setItem("ml-sim-level", String(level));
  }, [alloc, level]);

  const spRules = jobLine.metadata.spRules;
  const tierCaps = useMemo(() => ({
    1: calcTierSPCap(level, 1, spRules),
    2: calcTierSPCap(level, 2, spRules),
    3: calcTierSPCap(level, 3, spRules),
    4: calcTierSPCap(level, 4, spRules),
  }), [level, spRules]);

  const tierUsed = useMemo(() => {
    const used: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const adv of jobLine.advancements) for (const s of adv.skills) used[adv.tier] += alloc[s.id] || 0;
    return used;
  }, [alloc, jobLine]);

  const totalUsed = tierUsed[1] + tierUsed[2] + tierUsed[3] + tierUsed[4];

  function previousTiersFull(tier: 1 | 2 | 3 | 4) {
    for (let t = 1 as 1 | 2 | 3 | 4; t < tier; t = (t + 1) as 1 | 2 | 3 | 4) {
      if (tierUsed[t] < tierCaps[t]) return false;
    }
    return true;
  }

  function canIncrease(skill: Skill, tier: 1 | 2 | 3 | 4) {
    if ((skill.requiredLevel ?? 1) > level) return { ok: false, reason: "레벨 부족" } as const;
    if (!previousTiersFull(tier)) return { ok: false, reason: "이전 차수 SP를 모두 사용해야 합니다" } as const;
    const current = alloc[skill.id] || 0;
    if (current >= skill.maxLevel) return { ok: false, reason: "최대 레벨" } as const;
    if (tierUsed[tier] >= tierCaps[tier]) return { ok: false, reason: "해당 차수 SP 부족" } as const;
    if (skill.prerequisite) {
      const have = alloc[skill.prerequisite.skillId] || 0;
      if (have < skill.prerequisite.minLevel) return { ok: false, reason: "선행 부족" } as const;
    }
    return { ok: true } as const;
  }
  function canDecrease(skill: Skill) {
    const current = alloc[skill.id] || 0;
    if (current <= 0) return { ok: false } as const;
    const requiredBy = jobLine.advancements.flatMap(a => a.skills).filter(s => s.prerequisite?.skillId === skill.id);
    for (const rb of requiredBy) {
      const need = rb.prerequisite!.minLevel;
      const now = alloc[skill.id] || 0;
      const rbLevel = alloc[rb.id] || 0;
      if (rbLevel > 0 && now - 1 < need) return { ok: false, reason: `${rb.nameKo} 선행 유지 필요` } as const;
    }
    return { ok: true } as const;
  }
  function inc(skill: Skill, tier: 1 | 2 | 3 | 4) {
    const check = canIncrease(skill, tier);
    if (!check.ok) return setMessage(check.reason || ""), undefined as any;
    setAlloc(prev => ({ ...prev, [skill.id]: (prev[skill.id] || 0) + 1 }));
  }
  function dec(skill: Skill) {
    const check = canDecrease(skill);
    if (!check.ok) return setMessage(check.reason || ""), undefined as any;
    setAlloc(prev => ({ ...prev, [skill.id]: Math.max(0, (prev[skill.id] || 0) - 1) }));
  }
  function master(skill: Skill, tier: 1 | 2 | 3 | 4) {
    setAlloc(prev => {
      let next = { ...prev } as Record<string, number>;
      let guard = 0;
      while (guard++ < 1000) {
        const used: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
        for (const adv of jobLine.advancements) for (const s of adv.skills) used[adv.tier] += next[s.id] || 0;
        const caps = {
          1: calcTierSPCap(level, 1, spRules),
          2: calcTierSPCap(level, 2, spRules),
          3: calcTierSPCap(level, 3, spRules),
          4: calcTierSPCap(level, 4, spRules),
        } as const;
        let prevFull = true;
        for (let t = 1 as 1 | 2 | 3 | 4; t < tier; t = (t + 1) as 1 | 2 | 3 | 4) if (used[t] < caps[t]) { prevFull = false; break; }
        const curr = next[skill.id] || 0;
        if (!prevFull || curr >= skill.maxLevel || used[tier] >= caps[tier]) break;
        if (skill.prerequisite) {
          const have = next[skill.prerequisite.skillId] || 0;
          if (have < skill.prerequisite.minLevel) break;
        }
        next[skill.id] = curr + 1;
      }
      return next;
    });
  }
  function resetTier(tier: 1 | 2 | 3 | 4) {
    setAlloc(prev => {
      const next = { ...prev };
      for (const adv of jobLine.advancements) if (adv.tier === tier) for (const s of adv.skills) delete next[s.id];
      return next;
    });
  }
  function resetAll() { setAlloc({}); }

  const activeAdv = jobLine.advancements.find(a => a.tier === activeTier) ?? jobLine.advancements[0];

  if (loading) return <div className="min-h-screen grid place-items-center text-neutral-300">데이터 불러오는 중…</div>;
  if (error) return <div className="min-h-screen grid place-items-center text-red-200">{error}</div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black text-neutral-100">
      <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
        {/* 상단 패널 */}
        <MaplePanel
          title="메이플랜드 스킬 시뮬레이터"
          subtitle={`${jobLine.jobNameKo} · Lv.${level}`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <select
                className="rounded-lg bg-neutral-900/70 px-3 py-2 border border-neutral-600 min-w-56"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                {jobsIndex.map(j => (<option key={j.jobId} value={j.jobId}>{j.jobNameKo}</option>))}
              </select>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-900/70 px-3 py-2">
                <span className="text-sm opacity-80">레벨</span>
                <input
                  type="number"
                  className="w-20 rounded bg-neutral-800 px-2 py-1"
                  value={level}
                  min={1}
                  max={250}
                  onChange={(e) => setLevel(clamp(parseInt(e.target.value || "1", 10), 1, 250))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => resetAll()} className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">전체 초기화</button>
            </div>
          </div>
        </MaplePanel>

        {/* 탭 */}
        <div className="flex gap-1">
          {[1,2,3,4].map((t) => {
            const tier = t as 1|2|3|4;
            const locked = !previousTiersFull(tier) && tier !== 1;
            return (
              <MapleTab
                key={tier}
                label={`${tier}차 (${jobLine.advancements.find(a=>a.tier===tier)?.jobNameKo ?? ""})`}
                active={activeTier === tier}
                locked={locked}
                onClick={() => setActiveTier(tier)}
              />
            );
          })}
        </div>

        {/* 본문 패널 */}
        <div className="rounded-b-xl border-x border-b border-neutral-600/80 bg-neutral-950/70 p-4 md:p-6">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full bg-gradient-to-r ${tierColor[activeTier]} shadow`} />
              <div className="text-base font-semibold">{activeTier}차 · {activeAdv?.jobNameKo}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs opacity-80">총 사용 SP: <span className="text-yellow-300 font-semibold">{totalUsed}</span></div>
              <div className="flex items-center gap-2">
                <button className="text-xs underline opacity-80 hover:opacity-100" onClick={() => resetTier(activeTier)}>초기화</button>
              </div>
            </div>
          </div>

          {/* 스킬 그리드: 메이플식 2열/3열 카드 */}
          <div className="grid gap-2 sm:grid-cols-2">
            {activeAdv?.skills?.map((s) => {
              const curr = alloc[s.id] || 0;
              const canPlus = canIncrease(s, activeTier).ok;
              const canMinus = canDecrease(s).ok;
              return (
                <SkillCard
                  key={s.id}
                  s={s}
                  tier={activeTier}
                  curr={curr}
                  canPlus={!!canPlus}
                  canMinus={!!canMinus}
                  onPlus={() => inc(s, activeTier)}
                  onMinus={() => dec(s)}
                  onMaster={() => master(s, activeTier)}
                  jobId={jobLine.jobId}
                />
              );
            })}
          </div>
        </div>

        {/* 토스트 */}
        {message && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="rounded-xl border border-yellow-400/40 bg-yellow-500/15 px-4 py-2 text-sm text-yellow-200 shadow-xl">
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
