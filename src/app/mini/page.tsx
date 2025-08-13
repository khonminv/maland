"use client";
import { useEffect } from "react";
import HuntTimerCore from "@/components/HuntTimerCore";

export default function HuntTimerMiniPage() {
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

  return <HuntTimerCore isMini />;
}
