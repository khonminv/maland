"use client";
import HuntTimerCore from "@/components/HuntTimerCore";

export default function HuntTimerPage() {
  const openMini = () => {
    const w = 360, h = 320;
    const left = Math.max(0, Math.round((window.screen.width - w) / 2));
    const top  = Math.max(0, Math.round((window.screen.height - h) / 2));

    // basePath가 있어도 안전하게 현재 경로 기준으로 만듦
    const url = new URL("./mini", window.location.href).toString();

    // 새 창 이름은 매번 다르게 → 크기 무시 방지
    const name = `ml-mini-${Date.now()}`;

    const win = window.open(
      url,
      name,
      `toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=${w},height=${h},left=${left},top=${top}`
    );
    win?.focus();
  };

    return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-yellow-400">사냥 타이머 · 10분 평균 계산기</h1>
        <button
          onClick={openMini}
          className="px-3 py-1.5 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
        >
          작은 창으로 열기
        </button>
      </div>

      <HuntTimerCore isMini={false} />
    </>
  );
}