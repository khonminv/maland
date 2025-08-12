"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "UP" | "DOWN";

export default function HuntTimerCore({ isMini = false }: { isMini?: boolean }) {
  // --- 공통 ---
  const [mode, setMode] = useState<Mode>("UP");
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(Date.now());
  const tickRef = useRef<number | null>(null);

  // --- UP 전용(0 → 증가) ---
  const [accumMsUp, setAccumMsUp] = useState(0);

  // --- DOWN 전용(설정 → 감소) ---
  const [cfgH, setCfgH] = useState(0);
  const [cfgM, setCfgM] = useState(10);
  const [cfgS, setCfgS] = useState(0);
  const cfgTotalMs = useMemo(
    () => Math.max(0, (cfgH * 3600 + cfgM * 60 + cfgS) * 1000),
    [cfgH, cfgM, cfgS]
  );
  const [downLeftMs, setDownLeftMs] = useState<number>(cfgTotalMs);

  // --- 입력: 메소/경험치 ---
  const [startMeso, setStartMeso] = useState<number>(0);
  const [endMeso, setEndMeso] = useState<number>(0);
  const [exp, setExp] = useState<number>(0);

  // --- 실시간 틱 ---
  useEffect(() => {
    if (!isRunning) {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = window.setInterval(() => {
      setNowTs(Date.now());
    }, 200) as unknown as number;

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [isRunning]);

  // --- 모드 전환 시 초기화 ---
  useEffect(() => {
    setIsRunning(false);
    setStartedAt(null);
    setNowTs(Date.now());
    if (mode === "UP") {
      setAccumMsUp(0);
    } else {
      setDownLeftMs(cfgTotalMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // 설정 시간 바꾸면(다운) 실행 중이 아닐 때 남은 시간도 갱신
  useEffect(() => {
    if (!isRunning && mode === "DOWN") {
      setDownLeftMs(cfgTotalMs);
    }
  }, [cfgTotalMs, mode]);

  // --- 경과/남은 계산 ---
  const upElapsedMs = useMemo(() => {
    if (mode !== "UP") return 0;
    const runningPart = isRunning && startedAt ? (Date.now() - startedAt) : 0;
    return Math.max(0, accumMsUp + runningPart);
  }, [mode, isRunning, startedAt, accumMsUp, nowTs]);

  const downLeftMsLive = useMemo(() => {
    if (mode !== "DOWN") return 0;
    if (!isRunning || !startedAt) return downLeftMs;
    const elapsed = Date.now() - startedAt;
    const left = downLeftMs - elapsed;
    return left > 0 ? left : 0;
  }, [mode, isRunning, startedAt, downLeftMs, nowTs]);

  // 카운트다운 자동 정지
  useEffect(() => {
    if (mode === "DOWN" && isRunning && downLeftMsLive <= 0) {
      setIsRunning(false);
      setStartedAt(null);
      setDownLeftMs(0);
    }
  }, [mode, isRunning, downLeftMsLive]);

  // --- 평균 계산용 시간(분) ---
  const effectiveMinutes = useMemo(() => {
    if (mode === "UP") {
      return upElapsedMs / 60000;
    }
    return cfgTotalMs > 0 ? (cfgTotalMs - downLeftMsLive) / 60000 : 0;
  }, [mode, upElapsedMs, cfgTotalMs, downLeftMsLive]);

  // --- 메소/평균 계산 ---
  const mesoGained = Math.max(0, endMeso - startMeso);
  const per10 = (amount: number, minutes: number) =>
    !minutes || minutes <= 0 ? 0 : amount * (10 / minutes);
  const mesoPer10 = per10(mesoGained, effectiveMinutes);
  const expPer10 = per10(exp, effectiveMinutes);

  // --- 컨트롤 ---
  const start = () => {
    if (isRunning) return;
    if (mode === "DOWN") {
      if (cfgTotalMs <= 0) {
        alert("카운트다운 시간을 설정하세요.");
        return;
      }
      if (downLeftMs <= 0 || downLeftMs > cfgTotalMs) {
        setDownLeftMs(cfgTotalMs);
      }
    }
    const now = Date.now();
    setStartedAt(now);
    setNowTs(now);
    setIsRunning(true);
  };

  const pause = () => {
    if (!isRunning || !startedAt) return;
    if (mode === "UP") {
      setAccumMsUp((prev) => prev + (Date.now() - startedAt));
    } else {
      const curLeft = Math.max(0, downLeftMs - (Date.now() - startedAt));
      setDownLeftMs(curLeft);
    }
    setStartedAt(null);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setStartedAt(null);
    setNowTs(Date.now());
    if (mode === "UP") setAccumMsUp(0);
    else setDownLeftMs(cfgTotalMs);
  };

  const resetAll = () => {
    resetTimer();
    setStartMeso(0);
    setEndMeso(0);
    setExp(0);
  };

  // --- 표시 포맷 ---
  const fmtHMS = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
    const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };
  const fmtInt = (n: number) => Math.round(n).toLocaleString();

  const mainTime = mode === "UP" ? fmtHMS(upElapsedMs) : fmtHMS(downLeftMsLive);
  const subTime =
    mode === "UP"
      ? `경과: ${effectiveMinutes.toFixed(2)}분`
      : `경과: ${Math.max(0, (cfgTotalMs - downLeftMsLive) / 60000).toFixed(2)}분 / 설정: ${fmtHMS(cfgTotalMs)}`;

  return (
    <main className={`min-h-screen bg-gray-900 text-white ${isMini ? "p-3" : ""}`}>
      <div className={`${isMini ? "max-w-xs mx-auto" : "max-w-xl mx-auto px-5 py-8"}`}>
        {/* 헤더 (미니는 간소화) */}
        {!isMini ? (
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-yellow-400">사냥 타이머 · 10분 평균 계산기</h1>
            {/* 미니창은 외부에서 여니 여기선 버튼 X */}
          </div>
        ) : (
          <div className="mb-2 flex items-center justify-between">
            <strong className="text-yellow-300">미니 타이머</strong>
            <a
              href="/timer"
              target="_blank"
              className="text-xs underline text-gray-300 hover:text-white"
            >
              전체 페이지
            </a>
          </div>
        )}

        {/* 모드 스위치 */}
        <div className={`mb-3 inline-flex rounded-xl overflow-hidden border border-gray-700 ${isMini ? "text-xs" : ""}`}>
          <button
            className={`px-3 py-1.5 font-semibold ${mode === "UP" ? "bg-yellow-400 text-black" : "bg-gray-800 text-gray-200 hover:bg-gray-700"}`}
            onClick={() => setMode("UP")}
            disabled={mode === "UP"}
          >
            ⏱️ 업
          </button>
          <button
            className={`px-3 py-1.5 font-semibold ${mode === "DOWN" ? "bg-yellow-400 text-black" : "bg-gray-800 text-gray-200 hover:bg-gray-700"}`}
            onClick={() => setMode("DOWN")}
            disabled={mode === "DOWN"}
          >
            ⏳ 다운
          </button>
        </div>

        {/* 타이머 카드 */}
        <section className={`rounded-2xl bg-gray-800/80 border border-gray-700 ${isMini ? "p-3" : "p-5"} mb-4`}>
          <div className="flex items-baseline gap-3">
            <div className={`${isMini ? "text-3xl" : "text-4xl"} font-mono tracking-widest`}>{mainTime}</div>
            <div className="ml-auto flex gap-2">
              {!isRunning ? (
                <button
                  onClick={start}
                  className="px-3 py-1.5 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
                >
                  시작
                </button>
              ) : (
                <button
                  onClick={pause}
                  className="px-3 py-1.5 rounded-lg bg-gray-600 hover:bg-gray-500"
                >
                  일시정지
                </button>
              )}
              <button
                onClick={resetTimer}
                className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                리셋
              </button>
          </div>
          </div>

          {!isMini && <div className="mt-2 text-sm text-gray-400">{subTime}</div>}

          {/* 카운트다운 설정: 미니 모드에서는 숨김 */}
          {!isMini && mode === "DOWN" && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm text-gray-300">시간</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={cfgH}
                  onChange={(e) => setCfgH(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  className="mt-1 w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 focus:outline-none"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-300">분</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={cfgM}
                  onChange={(e) => setCfgM(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  className="mt-1 w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 focus:outline-none"
                  placeholder="10"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-300">초</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={cfgS}
                  onChange={(e) => setCfgS(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  className="mt-1 w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 focus:outline-none"
                  placeholder="0"
                />
              </label>
            </div>
          )}
        </section>

        {/* 입력 & 결과: 미니 모드에서는 숨김 */}
        {!isMini && (
          <>
            {/* 입력 */}
            <section className="rounded-2xl bg-gray-800/80 border border-gray-700 p-5 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-gray-300">사냥 전 메소</span>
                  <input
                    type="number"
                    min={0}
                    value={startMeso}
                    onChange={(e) => setStartMeso(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 focus:outline-none"
                    placeholder="예: 120,000,000"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-300">사냥 후 메소</span>
                  <input
                    type="number"
                    min={0}
                    value={endMeso}
                    onChange={(e) => setEndMeso(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 focus:outline-none"
                    placeholder="예: 128,500,000"
                  />
                </label>
                <label className="block col-span-2">
                  <span className="text-sm text-gray-300">획득 경험치(합계)</span>
                  <input
                    type="number"
                    min={0}
                    value={exp}
                    onChange={(e) => setExp(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 focus:outline-none"
                    placeholder="예: 987,654,321"
                  />
                </label>
              </div>
            </section>

            {/* 결과 */}
            <section className="rounded-2xl bg-gray-800/80 border border-gray-700 p-5">
              <h2 className="text-lg font-semibold mb-3">결과</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-300">총 획득 메소</span>
                  <span className="font-bold text-yellow-400">{fmtInt(mesoGained)} 메소</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-300">10분 평균 메소</span>
                  <span className="font-bold text-yellow-400">{fmtInt(mesoPer10)} 메소</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-300">10분 평균 경험치</span>
                  <span className="font-bold text-yellow-400">{fmtInt(expPer10)} EXP</span>
                </li>
                <li className="flex justify-between text-sm text-gray-400 pt-2 border-t border-gray-700">
                  <span>적용 시간</span>
                  <span>{effectiveMinutes.toFixed(2)} 분</span>
                </li>
              </ul>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const lineMode =
                      mode === "UP"
                        ? `모드: 카운트업 / 경과 ${effectiveMinutes.toFixed(2)}분`
                        : `모드: 카운트다운 / 설정 ${fmtHMS(cfgTotalMs)} / 경과 ${Math.max(
                            0,
                            (cfgTotalMs - downLeftMsLive) / 60000
                          ).toFixed(2)}분 / 남은 ${fmtHMS(downLeftMsLive)}`;

                    const text = `[사냥 결과]
${lineMode}
사냥 전 메소: ${startMeso.toLocaleString()}
사냥 후 메소: ${endMeso.toLocaleString()}
총 획득 메소: ${fmtInt(mesoGained)}
10분 평균 메소: ${fmtInt(mesoPer10)}
획득 경험치: ${exp.toLocaleString()}
10분 평균 경험치: ${fmtInt(expPer10)}`;

                    navigator.clipboard
                      .writeText(text)
                      .then(() => alert("클립보드에 복사되었습니다."));
                  }}
                  className="px-3 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
                >
                  결과 복사
                </button>
                <button
                  onClick={resetAll}
                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                >
                  모두 초기화
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
