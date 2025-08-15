"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Drag & Drop Scroll Simulator (메랜용)
 * - 주문서 이미지를 장비에 드래그해 적용하면 성공/실패 이펙트가 뜹니다.
 * - 모바일 폴백: 주문서를 탭하여 선택 후 장비를 탭하면 적용됩니다.
 * - 10% / 60% 두 종류 기본 제공 + 커스텀 확률 버튼.
 * - 옵션: 실패 시 슬롯 소모, 파괴(붐) 여부.
 *
 * 이미지 파일 경로(예시):
 *  - /public/images/scroll-10.png
 *  - /public/images/scroll-60.png
 *  - /public/images/equip.png (장비 아이콘)
 *  필요시 props로 바꿔서 넘기세요.
 */
export default function DragDropScrollSimulator() {
  // ---- 설정 ----
  const [slotsMax, setSlotsMax] = useState(7);
  const [consumeOnFail, setConsumeOnFail] = useState(true);
  const [boomOnFail, setBoomOnFail] = useState(false);

  // ---- 상태 ----
  const [slotsLeft, setSlotsLeft] = useState(7);
  const [successes, setSuccesses] = useState(0);
  const [destroyed, setDestroyed] = useState(false);
  const [selectedRate, setSelectedRate] = useState<number | null>(null); // 모바일 폴백용
  const [lastOutcome, setLastOutcome] = useState<"success" | "fail" | "boom" | null>(null);
  const [animKey, setAnimKey] = useState(0); // 이펙트 리셋용
  const [log, setLog] = useState<Array<{ n: number; rate: number; outcome: string; left: number; succ: number }>>([]);

  const tryIndex = log.length + 1;

  useEffect(() => {
    setSlotsLeft(slotsMax);
    setSuccesses(0);
    setDestroyed(false);
    setLastOutcome(null);
    setLog([]);
  }, [slotsMax]);

  // ---- 적용 로직 ----
  const applyScroll = useCallback(
    (rate: number) => {
      if (destroyed || slotsLeft <= 0) return;
      const r = Math.random();
      const ok = r < rate / 100;

      let nextSlots = slotsLeft;
      let nextSucc = successes;
      let outcome: "success" | "fail" | "boom" = ok ? "success" : "fail";

      if (ok) {
        nextSucc += 1;
        nextSlots -= 1; // 성공 시 슬롯 소모(구 주문서 기본)
      } else {
        if (boomOnFail) {
          outcome = "boom";
          // 파괴: 슬롯/성공 수는 유지하고 장비 파괴 처리
        } else if (consumeOnFail) {
          nextSlots -= 1; // 실패 시 슬롯 소모 옵션
        }
      }

      // 업데이트
      setSuccesses(nextSucc);
      setSlotsLeft(Math.max(0, nextSlots));
      setLastOutcome(outcome);
      setAnimKey((k) => k + 1);
      setLog((old) => [
        { n: tryIndex, rate, outcome: outcome === "boom" ? "실패(파괴)" : outcome === "success" ? "성공" : "실패", left: Math.max(0, nextSlots), succ: nextSucc },
        ...old,
      ]);

      if (!ok && boomOnFail) {
        setDestroyed(true);
      }
    },
    [boomOnFail, consumeOnFail, destroyed, successes, slotsLeft, tryIndex]
  );

  // ---- 드래그 앤 드롭 ----
  const onDragStart = (e: React.DragEvent<HTMLImageElement>, rate: number) => {
    e.dataTransfer.setData("text/plain", String(rate));
    e.dataTransfer.effectAllowed = "copy";
    setSelectedRate(null); // 드래그 시작 시 선택 해제
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const rate = Number(data);
    if (Number.isFinite(rate)) applyScroll(rate);
  };

  // ---- 모바일 폴백: 선택 후 탭 적용 ----
  const onTapEquip = () => {
    if (selectedRate != null) applyScroll(selectedRate);
  };

  const reset = () => {
    setSlotsLeft(slotsMax);
    setSuccesses(0);
    setDestroyed(false);
    setLastOutcome(null);
    setLog([]);
    setAnimKey((k) => k + 1);
  };

  // ---- 이펙트 표시 ----
  const showSuccess = lastOutcome === "success";
  const showFail = lastOutcome === "fail";
  const showBoom = lastOutcome === "boom";

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-white">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400">주문서 강화 시뮬레이터</h1>

      {/* 상단 컨트롤 */}
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gray-900/80 border border-gray-700 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-300">슬롯(칸)</span>
              <input type="number" min={0} value={slotsMax}
                onChange={(e)=> setSlotsMax(Math.max(0, Math.floor(Number(e.target.value)||0)))}
                className="mt-1 w-full rounded-lg bg-gray-950 border border-gray-700 px-3 py-2 outline-none"/>
            </label>
            <div className="flex items-end gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-yellow-400" checked={consumeOnFail} onChange={(e)=>setConsumeOnFail(e.target.checked)} />
                실패시 슬롯 소모
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-yellow-400" checked={boomOnFail} onChange={(e)=>setBoomOnFail(e.target.checked)} />
                실패시 파괴(붐)
              </label>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400">💡 드래그가 어려운 모바일에서는 주문서를 한 번 탭→장비를 탭하면 적용됩니다.</div>
        </div>

        {/* 상태 요약 */}
        <div className="rounded-2xl bg-gray-900/80 border border-gray-700 p-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-3">
            <div className="text-xs text-gray-400">남은 슬롯</div>
            <div className="text-xl font-bold">{slotsLeft}</div>
          </div>
          <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-3">
            <div className="text-xs text-gray-400">성공</div>
            <div className="text-xl font-bold text-green-400">{successes}</div>
          </div>
          <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-3">
            <div className="text-xs text-gray-400">상태</div>
            <div className={`text-xl font-bold ${destroyed?"text-red-400":"text-yellow-400"}`}>{destroyed?"파괴":"정상"}</div>
          </div>
        </div>
      </div>

      {/* 본문: 주문서 인벤토리 + 장비 */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* 주문서 패널 */}
        <div className="rounded-2xl bg-gray-900/80 border border-gray-700 p-4">
          <h2 className="font-semibold mb-3">주문서</h2>
          <div className="grid grid-cols-3 gap-4">
            <ScrollItem
              label="10% 주문서"
              rate={10}
              selected={selectedRate === 10}
              onClick={() => setSelectedRate(10)}
              onDragStart={onDragStart}
              src="https://maplestory.io/api/gms/62/item/2040031/icon?resize=2"
            />
            <ScrollItem
              label="60% 주문서"
              rate={60}
              selected={selectedRate === 60}
              onClick={() => setSelectedRate(60)}
              onDragStart={onDragStart}
              src="https://maplestory.io/api/gms/62/item/2040029/icon?resize=2"
            />
            <CustomRate setSelectedRate={setSelectedRate} onDragStart={onDragStart} />
          </div>
          <div className="mt-3 text-xs text-gray-400">드래그하여 장비로 끌어놓거나(데스크톱), 주문서를 탭 → 장비 탭(모바일)</div>
        </div>

        {/* 장비 패널 (가운데 크게) */}
        <div className="lg:col-span-2 rounded-2xl bg-gray-900/80 border border-gray-700 p-6">
          <h2 className="font-semibold mb-3">장비</h2>
          <div
            className={`relative mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 ${destroyed?"border-red-500":"border-yellow-400"} bg-gray-950 flex items-center justify-center overflow-hidden`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={onTapEquip}
          >
            {/* 장비 아이콘 */}
            <img src="/images/equip.png" alt="장비" className={`w-24 sm:w-28 opacity-90 ${destroyed?"grayscale" : ""}`} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/images/discord.png";}}/>

            {/* 성공/실패 이펙트 */}
            <Effects key={animKey} success={showSuccess} fail={showFail} boom={showBoom} />

            {/* 안내 오버레이 */}
            {slotsLeft<=0 && !destroyed && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-center">
                <div className="text-yellow-300 font-bold">슬롯이 없습니다</div>
              </div>
            )}
            {destroyed && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-red-400 text-lg font-extrabold animate-pulse">장비 파괴</div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={reset} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700">리셋</button>
          </div>

          {/* 로그 */}
          <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-gray-800">
            <table className="w-full text-xs">
              <thead className="bg-gray-800/70 sticky top-0">
                <tr>
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-right">확률</th>
                  <th className="px-2 py-1">결과</th>
                  <th className="px-2 py-1 text-right">남은 슬롯</th>
                  <th className="px-2 py-1 text-right">누적 성공</th>
                </tr>
              </thead>
              <tbody>
                {log.map((row) => (
                  <tr key={row.n} className="odd:bg-gray-900/40">
                    <td className="px-2 py-1">{row.n}</td>
                    <td className="px-2 py-1 text-right">{row.rate}%</td>
                    <td className={`px-2 py-1 ${row.outcome.includes("성공")?"text-green-400":"text-red-300"}`}>{row.outcome}</td>
                    <td className="px-2 py-1 text-right">{row.left}</td>
                    <td className="px-2 py-1 text-right">{row.succ}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <StyleBlock />
    </div>
  );
}

function ScrollItem({ label, rate, onClick, selected, onDragStart, src }:{ label: string; rate: number; selected: boolean; onClick:()=>void; onDragStart:(e: React.DragEvent<HTMLImageElement>, rate: number)=>void; src: string; }){
  return (
    <div className={`rounded-xl border ${selected?"border-yellow-400 bg-yellow-400/10":"border-gray-700 bg-gray-900/60"} p-3 text-center`}>
      <img
        src={src}
        alt={label}
        draggable
        onDragStart={(e)=>onDragStart(e, rate)}
        onClick={onClick}
        className={`mx-auto w-16 h-16 object-contain ${selected?"ring-2 ring-yellow-400 rounded-md": ""}`}
        onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/images/discord.png";}}
      />
      <div className="mt-2 text-xs text-gray-300">{label}</div>
      <div className="text-sm font-bold">{rate}%</div>
    </div>
  );
}

function CustomRate({ setSelectedRate, onDragStart }:{ setSelectedRate:(n:number)=>void; onDragStart:(e: React.DragEvent<HTMLImageElement>, rate:number)=>void; }){
  const [val, setVal] = useState("30");
  const n = Math.min(100, Math.max(1, Math.floor(Number(val)||30)));
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-3 text-center">
      <img src="https://maplestory.io/api/gms/62/item/2040030/icon?resize=2" alt="커스텀" draggable onDragStart={(e)=>onDragStart(e, n)} onClick={()=>setSelectedRate(n)} className="mx-auto w-16 h-16 object-contain opacity-80" />
      <div className="mt-2 text-xs text-gray-300">커스텀</div>
      <input value={val} onChange={(e)=>setVal(e.target.value)} className="mt-1 w-20 text-center bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs outline-none" />
      <div className="text-xs text-gray-400 mt-1">{n}%</div>
    </div>
  );
}

function Effects({ success, fail, boom }:{ success:boolean; fail:boolean; boom:boolean; }){
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 성공: 녹색 펄스 + 별폭발 */}
      {success && (
        <>
          <div className="absolute inset-0 animate-flash-success" />
          <StarBurst key="sburst" />
          <div className="absolute bottom-2 right-2 text-green-300 font-extrabold text-lg drop-shadow">성공!</div>
        </>
      )}
      {/* 실패: 붉은 플래시 + 흔들림 */}
      {fail && (
        <>
          <div className="absolute inset-0 animate-flash-fail" />
          <div className="absolute inset-0 animate-shake" />
          <div className="absolute bottom-2 right-2 text-red-300 font-extrabold text-lg drop-shadow">실패</div>
        </>
      )}
      {/* 붐: 강한 붉은 플래시 + 금이 간 틀 */}
      {boom && (
        <>
          <div className="absolute inset-0 animate-flash-boom" />
          <CrackedOverlay />
          <div className="absolute bottom-2 right-2 text-red-400 font-extrabold text-lg drop-shadow animate-pulse">파괴!</div>
        </>
      )}
    </div>
  );
}

function StarBurst(){
  // 간단한 별 조각 10개
  const arr = Array.from({length: 10});
  return (
    <>
      {arr.map((_, i)=>{
        const angle = (i / arr.length) * 2 * Math.PI;
        const tx = Math.cos(angle) * 120;
        const ty = Math.sin(angle) * 120;
        const delay = (i * 30) + "ms";
        return (
          <span key={i} className="absolute left-1/2 top-1/2 w-1 h-6 bg-yellow-300 origin-bottom rounded-sm" style={{ transform: `translate(-50%, -100%) rotate(${(angle*180/Math.PI).toFixed(1)}deg)`, animation: `burst 420ms ease-out forwards`, animationDelay: delay }} />
        );
      })}
    </>
  );
}

function CrackedOverlay(){
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M5 50 L25 45 L40 60 L55 35 L70 55 L80 30 L95 50" stroke="rgba(255,0,0,0.5)" strokeWidth="2" fill="none" />
      <path d="M10 20 L20 35 L30 25" stroke="rgba(255,0,0,0.4)" strokeWidth="1.5" fill="none" />
      <path d="M70 80 L75 65 L85 75" stroke="rgba(255,0,0,0.4)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function StyleBlock(){
  return (
    <style jsx global>{`
      @keyframes flashSuccess { from { box-shadow: inset 0 0 0 0 rgba(74,222,128,0.0); } to { box-shadow: inset 0 0 120px 20px rgba(74,222,128,0.25);} }
      .animate-flash-success { animation: flashSuccess 420ms ease-out; background: radial-gradient(circle at center, rgba(34,197,94,0.25), rgba(0,0,0,0)); }

      @keyframes flashFail { from { box-shadow: inset 0 0 0 0 rgba(248,113,113,0.0);} to { box-shadow: inset 0 0 120px 20px rgba(248,113,113,0.25);} }
      .animate-flash-fail { animation: flashFail 420ms ease-out; background: radial-gradient(circle at center, rgba(239,68,68,0.22), rgba(0,0,0,0)); }

      @keyframes flashBoom { 0%{ background: rgba(239,68,68,0.85);} 100%{ background: rgba(239,68,68,0);} }
      .animate-flash-boom { animation: flashBoom 520ms ease-out; }

      @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0);} 20%, 80% { transform: translate3d(2px, 0, 0);} 30%, 50%, 70% { transform: translate3d(-4px, 0, 0);} 40%, 60% { transform: translate3d(4px, 0, 0);} }
      .animate-shake { animation: shake 420ms cubic-bezier(.36,.07,.19,.97) both; }

      @keyframes burst { 0%{ transform: translate(-50%, -100%) scale(0.2) rotate(var(--rot,0)); opacity: 1;} 100%{ transform: translate(calc(-50% + var(--tx,0px)), calc(-100% + var(--ty,0px))) scale(0.9) rotate(var(--rot,0)); opacity: 0; } }
    `}</style>
  );
}
