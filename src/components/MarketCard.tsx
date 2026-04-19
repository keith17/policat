"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatPoints } from "@/lib/data";

interface Market {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  emoji: string;
  yesProb: number;
  noProb: number;
  totalVolume: number;
  participants: number;
  daysLeft: number;
  hot: boolean;
  new: boolean;
  myBet: "yes" | "no" | null;
}

interface MarketCardProps {
  market: Market;
  onBet: (marketId: string, side: "yes" | "no", amount: number) => void;
  userPoints: number;
  index: number;
}

const categoryColors: Record<string, string> = {
  economy: "#f59e0b",
  politics: "#a78bfa",
  society: "#22d3a0",
  sports: "#f43f5e",
};

export default function MarketCard({ market, onBet, userPoints, index }: MarketCardProps) {
  const catColor = categoryColors[market.category] || "#9090b0";

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      style={{ padding: 20, position: "relative", overflow: "hidden" }}
    >
      {/* Ambient glow behind card */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120, borderRadius: "50%",
        background: `${catColor}10`, pointerEvents: "none"
      }} />

      {/* Header badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span className={`tag tag-${market.category}`}>
          {market.emoji} {market.categoryLabel}
        </span>
        {market.hot && (
          <span style={{
            background: "rgba(244,63,94,0.15)", color: "#f43f5e",
            border: "1px solid rgba(244,63,94,0.3)",
            borderRadius: 100, padding: "3px 8px", fontSize: 11, fontWeight: 700
          }}>🔥 HOT</span>
        )}
        {market.new && (
          <span style={{
            background: "rgba(34,211,160,0.15)", color: "#22d3a0",
            border: "1px solid rgba(34,211,160,0.3)",
            borderRadius: 100, padding: "3px 8px", fontSize: 11, fontWeight: 700
          }}>✨ NEW</span>
        )}
        <span style={{
          marginLeft: "auto", color: "#5a5a7a", fontSize: 12,
          display: "flex", alignItems: "center", gap: 4
        }}>
          ⏰ {market.daysLeft > 0 ? `${market.daysLeft}일 남음` : "종료"}
        </span>
      </div>

      {/* Title */}
      <Link href={`/market/${market.id}`} style={{ textDecoration: "none" }}>
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: "#f0f0ff",
          marginBottom: 16, lineHeight: 1.5,
          transition: "color 0.2s"
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#a78bfa")}
          onMouseLeave={e => (e.currentTarget.style.color = "#f0f0ff")}
        >
          {market.title}
        </h3>
      </Link>

      {/* Probability Bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: "#22d3a0", fontWeight: 800, fontSize: 22 }}>
            {market.yesProb}<span style={{ fontSize: 13 }}>%</span>
          </span>
          <span style={{ color: "#f43f5e", fontWeight: 800, fontSize: 22 }}>
            {market.noProb}<span style={{ fontSize: 13 }}>%</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 3, height: 8, borderRadius: 4, overflow: "hidden" }}>
          <motion.div
            className="progress-yes"
            style={{ width: `${market.yesProb}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${market.yesProb}%` }}
            transition={{ delay: index * 0.06 + 0.3, duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="progress-no"
            style={{ width: `${market.noProb}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${market.noProb}%` }}
            transition={{ delay: index * 0.06 + 0.3, duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ color: "#9090b0", fontSize: 11 }}>YES</span>
          <span style={{ color: "#9090b0", fontSize: 11 }}>NO</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: 16, marginBottom: 16,
        borderTop: "1px solid rgba(139,92,246,0.1)",
        paddingTop: 12, color: "#5a5a7a", fontSize: 12
      }}>
        <span>💰 총 {(market.totalVolume / 1000).toFixed(0)}K P</span>
        <span>👥 {market.participants.toLocaleString()}명</span>
      </div>

      {/* Bet Buttons */}
      {market.myBet ? (
        <div style={{
          textAlign: "center", padding: "10px",
          background: market.myBet === "yes" ? "rgba(34,211,160,0.1)" : "rgba(244,63,94,0.1)",
          borderRadius: 10, border: `1px solid ${market.myBet === "yes" ? "rgba(34,211,160,0.3)" : "rgba(244,63,94,0.3)"}`,
          color: market.myBet === "yes" ? "#22d3a0" : "#f43f5e",
          fontWeight: 700, fontSize: 14
        }}>
          ✓ {market.myBet === "yes" ? "YES" : "NO"} 예측 참여 완료
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            className="btn-yes"
            style={{ flex: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBet(market.id, "yes", 50)}
          >
            📈 YES
          </motion.button>
          <motion.button
            className="btn-no"
            style={{ flex: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBet(market.id, "no", 50)}
          >
            📉 NO
          </motion.button>
        </div>
      )}

      {/* Share */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        style={{
          width: "100%", marginTop: 8,
          background: "transparent",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 10, padding: "8px",
          color: "#9090b0", fontSize: 12, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all 0.2s"
        }}
        onHoverStart={e => {}}
        onClick={() => {
          const text = `폴리캣 마켓: "${market.title}"\nYES ${market.yesProb}% / NO ${market.noProb}%\n지금 예측하러 가보세요! 👉 policat.kr`;
          if (navigator.share) {
            navigator.share({ title: "폴리캣 예측", text, url: `https://policat.kr/market/${market.id}` });
          } else {
            navigator.clipboard.writeText(text);
          }
        }}
      >
        🔗 친구에게 공유하기 (+3P)
      </motion.button>
    </motion.div>
  );
}
