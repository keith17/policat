"use client";
import { motion } from "framer-motion";

interface AdBannerProps {
  type?: "horizontal" | "square" | "leaderboard";
  className?: string;
}

const adCopy = [
  { headline: "토스뱅크 연 5.0% 적금", sub: "지금 가입하면 최대 30만원 혜택", cta: "바로 가기", color: "#3b82f6" },
  { headline: "카카오페이 투자", sub: "1,000원부터 시작하는 ETF 투자", cta: "시작하기", color: "#f59e0b" },
  { headline: "NH 나무 증권계좌", sub: "국내주식 수수료 0원 이벤트", cta: "개설하기", color: "#22c55e" },
  { headline: "삼성카드 추첨 이벤트", sub: "이번 달 신청하면 갤럭시가 내 것!", cta: "응모하기", color: "#8b5cf6" },
];

export function AdBanner({ type = "horizontal", className = "" }: AdBannerProps) {
  const ad = adCopy[Math.floor(Math.random() * adCopy.length)];

  if (type === "square") {
    return (
      <div className={`ad-container ${className}`} style={{ minHeight: 250, padding: 20 }}>
        <span className="ad-label">광고</span>
        <div className="text-center">
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: `${ad.color}22`, border: `2px solid ${ad.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", fontSize: 28
          }}>💳</div>
          <p style={{ color: ad.color, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{ad.headline}</p>
          <p style={{ color: "#9090b0", fontSize: 12, marginBottom: 16 }}>{ad.sub}</p>
          <button style={{
            background: ad.color, color: "white", border: "none",
            borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>{ad.cta}</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`ad-container ${className}`}
      style={{ padding: "14px 20px", minHeight: 72 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="ad-label">광고</span>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0, borderRadius: 10,
          background: `${ad.color}22`, border: `1.5px solid ${ad.color}44`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
        }}>💳</div>
        <div style={{ flex: 1 }}>
          <p style={{ color: ad.color, fontWeight: 700, fontSize: 14 }}>{ad.headline}</p>
          <p style={{ color: "#9090b0", fontSize: 12 }}>{ad.sub}</p>
        </div>
        <button style={{
          background: ad.color, color: "white", border: "none",
          borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600,
          cursor: "pointer", flexShrink: 0
        }}>{ad.cta}</button>
      </div>
    </motion.div>
  );
}

export function AdVideoReward({ onEarn }: { onEarn: (points: number) => void }) {
  return (
    <motion.div
      className="glass-card"
      style={{ padding: 20, textAlign: "center" }}
      whileHover={{ scale: 1.02 }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>광고 시청하고 포인트 받기</p>
      <p style={{ color: "#9090b0", fontSize: 13, marginBottom: 16 }}>30초 광고 시청 시 10P 지급</p>
      <motion.button
        className="btn-primary"
        style={{ width: "100%", padding: "12px" }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          setTimeout(() => onEarn(10), 500);
        }}
      >
        광고 보고 +10P 받기
      </motion.button>
    </motion.div>
  );
}
