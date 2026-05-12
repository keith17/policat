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
  myBetAmount?: number;
  status: "active" | "ended" | "resolved_yes" | "resolved_no";
}

interface MarketCardProps {
  market: Market;
  onBet: (marketId: string, side: "yes" | "no", amount: number) => void;
  userPoints: number;
  index: number;
  userId?: string;
}

export default function MarketCard({ market, onBet, userPoints, index, userId }: MarketCardProps) {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      style={{ padding: 20, position: "relative", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}
    >
      {/* Header badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span className={`tag tag-${market.category}`}>
          {market.emoji} {market.categoryLabel}
        </span>
        {market.hot && (
          <span style={{
            background: "var(--accent-no-soft)", color: "var(--accent-no)",
            borderRadius: "var(--radius-pill)", padding: "3px 8px", fontSize: 11, fontWeight: 600
          }}>🔥 HOT</span>
        )}
        {market.new && (
          <span style={{
            background: "var(--accent-yes-soft)", color: "var(--accent-yes)",
            borderRadius: "var(--radius-pill)", padding: "3px 8px", fontSize: 11, fontWeight: 600
          }}>✨ NEW</span>
        )}
        <span style={{
          marginLeft: "auto", color: "var(--text-muted)", fontSize: 12,
          display: "flex", alignItems: "center", gap: 4,
          fontFamily: "var(--font-mono)"
        }}>
          ⏰ {market.status === 'resolved_yes' || market.status === 'resolved_no' ? "종료됨" : market.status === 'ended' ? "결과 대기중" : market.daysLeft > 0 ? `${market.daysLeft}일 남음` : "오늘 마감"}
        </span>
      </div>

      {/* Title */}
      <Link href={`/market/${market.id}`} style={{ textDecoration: "none" }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: "var(--text-primary)",
          marginBottom: 16, lineHeight: 1.5,
          transition: "color 0.15s"
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-primary)")}
        >
          {market.title}
        </h3>
      </Link>

      {/* Probability Bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{
            color: "var(--accent-yes)", fontWeight: 700, fontSize: 22,
            fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums"
          }}>
            {market.yesProb}<span style={{ fontSize: 13 }}>%</span>
          </span>
          <span style={{
            color: "var(--accent-no)", fontWeight: 700, fontSize: 22,
            fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums"
          }}>
            {market.noProb}<span style={{ fontSize: 13 }}>%</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 3, height: 6, borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
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
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>YES</span>
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>NO</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: 16, marginBottom: 16,
        paddingTop: 12, color: "var(--text-muted)", fontSize: 12,
        borderTop: "1px solid var(--border)"
      }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>
          💰 총 {(market.totalVolume / 1000).toFixed(0)}K P
        </span>
        <span>👥 {market.participants.toLocaleString()}명</span>
      </div>

      {/* Bet Buttons & Results */}
      {market.status === "resolved_yes" || market.status === "resolved_no" ? (
        <div style={{
          padding: 12,
          background: "var(--surface-alt)",
          borderRadius: "var(--radius-md)",
          display: "flex", flexDirection: "column", gap: 6, alignItems: "center"
        }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            최종 결과: <span style={{ color: market.status === "resolved_yes" ? "var(--accent-yes)" : "var(--accent-no)" }}>
              {market.status === "resolved_yes" ? "YES 승리" : "NO 승리"}
            </span>
          </div>
          {market.myBet && (
            <div style={{ fontSize: 13, color: market.myBet === (market.status.replace('resolved_', '')) ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
              {market.myBet === (market.status.replace('resolved_', '')) ? "🎉 적중! (배당금 획득)" : "😢 실패"}
            </div>
          )}
        </div>
      ) : market.status === "ended" ? (
        <div style={{
          padding: 12,
          background: "var(--surface-alt)",
          borderRadius: "var(--radius-md)",
          textAlign: "center", fontWeight: 600, color: "var(--text-secondary)", fontSize: 14
        }}>
          ⏳ 베팅 마감 (결과 판정 대기중)
          {market.myBet && <div style={{ fontSize: 13, marginTop: 4 }}>내 예측: {market.myBet.toUpperCase()} ({market.myBetAmount}P)</div>}
        </div>
      ) : market.myBet ? (
        <div style={{
          padding: 12,
          background: "var(--surface-alt)",
          borderRadius: "var(--radius-md)",
          display: "flex", flexDirection: "column", gap: 6
        }}>
          <div style={{
            color: market.myBet === "yes" ? "var(--accent-yes)" : "var(--accent-no)",
            fontWeight: 600, fontSize: 13, textAlign: "center"
          }}>
            ✓ {market.myBet === "yes" ? "YES" : "NO"}에{" "}
            <span style={{ fontFamily: "var(--font-mono)" }}>{market.myBetAmount}P</span> 참여 완료
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", background: "var(--bg-card)", padding: "6px", borderRadius: "var(--radius-sm)" }}>
            적중 시 예상:{" "}
            <span style={{ fontWeight: 700, color: market.myBet === "yes" ? "var(--accent-yes)" : "var(--accent-no)", fontFamily: "var(--font-mono)" }}>
              {Math.round((market.myBetAmount || 0) * (100 / (market.myBet === "yes" ? market.yesProb : market.noProb)))}P
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            className="btn-yes"
            style={{ flex: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onBet(market.id, "yes", 50)}
          >
            📈 YES
          </motion.button>
          <motion.button
            className="btn-no"
            style={{ flex: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onBet(market.id, "no", 50)}
          >
            📉 NO
          </motion.button>
        </div>
      )}

      {/* Share */}
      <button
        className="btn-soft"
        style={{ width: "100%", marginTop: 8, fontSize: 12, padding: "8px" }}
        onClick={() => {
          const refParam = userId ? `?ref=${userId}` : "";
          const shareUrl = `https://policat.kr/market/${market.id}${refParam}`;
          const text = `폴리캣 마켓: "${market.title}"\nYES ${market.yesProb}% / NO ${market.noProb}%\n지금 예측하러 가보세요! 👉 ${shareUrl}`;
          if (navigator.share) {
            navigator.share({ title: "폴리캣 예측", text, url: shareUrl });
          } else {
            navigator.clipboard.writeText(text);
          }
        }}
      >
        🔗 친구에게 공유하기
      </button>
    </motion.div>
  );
}
