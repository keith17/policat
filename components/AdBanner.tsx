"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const AD_CLIENT = "ca-pub-4553206222153896";
const AD_SLOT = "6304659289";

interface AdBannerProps {
  type?: "horizontal" | "square" | "leaderboard";
  className?: string;
}

function AdSenseUnit() {
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
      data-ad-client={AD_CLIENT}
      data-ad-slot={AD_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

export function AdBanner({ type = "horizontal", className = "" }: AdBannerProps) {
  return (
    <div
      className={`ad-container ${className}`}
      style={{ minHeight: type === "square" ? 250 : 72, overflow: "hidden" }}
    >
      <span className="ad-label">광고</span>
      <AdSenseUnit />
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
