"use client";
import { useEffect } from "react";
import HuntTimerCore from "@/components/HuntTimerCore";

export default function HuntTimerMiniPage() {
  // 팝업 크기/위치 보정 (가능한 브라우저 한정)
  useEffect(() => {
    if (window.opener && "resizeTo" in window) {
      const w = 360, h = 320;
      setTimeout(() => {
        try { window.resizeTo(w, h); } catch {}
        try {
          const left = Math.max(0, Math.round((window.screen.width - w) / 2));
          const top  = Math.max(0, Math.round((window.screen.height - h) / 2));
          window.moveTo(left, top);
        } catch {}
        try { window.focus(); } catch {}
      }, 50);
    }
  }, []);

  return <HuntTimerCore isMini />; // 코어에서 미니 UI만 표시되도록
}
