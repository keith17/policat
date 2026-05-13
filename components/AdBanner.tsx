"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AdBannerProps {
  type?: "horizontal" | "square" | "leaderboard";
  className?: string;
}

// 실 AdSense 슬롯 렌더링
function AdSenseUnit({ slot, format = "auto" }: { slot: string; format?: string }) {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", minHeight: 1 }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

export function AdBanner({ type = "horizontal", className = "" }: AdBannerProps) {
  const pid = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const hSlot = process.env.NEXT_PUBLIC_AD_SLOT_HORIZONTAL;
  const sSlot = process.env.NEXT_PUBLIC_AD_SLOT_SQUARE;
  const slot = type === "square" ? sSlot : hSlot;

  if (pid && slot) {
    return (
      <div className={`ad-container ${className}`} style={{ minHeight: type === "square" ? 250 : 72, overflow: "hidden" }}>
        <span className="ad-label">광고</span>
        <AdSenseUnit slot={slot} />
      </div>
    );
  }

  // 슬롯 미설정 시 빈 플레이스홀더 (AdSense 심사 대기 / 슬롯 미등록 상태)
  return (
    <div className={`ad-container ${className}`} style={{ minHeight: type === "square" ? 250 : 72 }}>
      <span className="ad-label">광고</span>
    </div>
  );
}

export function AdVideoReward({ onEarn }: { onEarn: (points: number) => void }) {
  return (
    <motion.div
      className="glass-card"
      style={{ padding: 20, textAlign: "center", boxShadow: "var(--shadow-sm)" }}
      whileHover={{ scale: 1.01 }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
      <p style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>광고 시청하고 포인트 받기</p>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>광고 시청 시 50P 지급</p>
      <motion.button
        className="btn-primary"
        style={{ width: "100%", padding: "12px" }}
        whileTap={{ scale: 0.97 }}
        onClick={() => { setTimeout(() => onEarn(50), 500); }}
      >
        광고 보고 +50P 받기
      </motion.button>
    </motion.div>
  );
}
