// app/tools/hunt-timer/mini/page.tsx
"use client";
import { useEffect } from "react";
import HuntTimerCore from "@/components/HuntTimerCore";

export default function HuntTimerMiniPage() {
  useEffect(() => {
    // 팝업으로 열린 경우에만 시도
    if (window.opener && 'resizeTo' in window) {
      const w = 360, h = 320;
      setTimeout(() => {
        try { window.resizeTo(w, h); } catch {}
        // 위치 보정은 선택
        try {
          const left = Math.max(0, Math.round((window.screen.width - w) / 2));
          const top  = Math.max(0, Math.round((window.screen.height - h) / 2));
          window.moveTo(left, top);
        } catch {}
        window.focus();
      }, 50);
    }
  }, []);

  return <HuntTimerCore isMini />;
}
