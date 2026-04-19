"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { AdBanner } from "@/components/AdBanner";
import { leaderboard, tierConfig } from "@/lib/data";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "all">("weekly");
  const userPoints = 500;

  const rankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={userPoints} streak={3} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "90px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
            🏆 <span className="gradient-text">예측가 랭킹</span>
          </h1>
          <p style={{ color: "#9090b0", marginBottom: 24 }}>
            가장 정확한 예측으로 상위 랭크에 도전하세요!
          </p>
        </motion.div>

        {/* Ad Banner */}
        <AdBanner type="horizontal" className="mb-5" />
        <div style={{ marginBottom: 20 }} />

        {/* Period tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["weekly", "monthly", "all"] as const).map(p => (
            <motion.button
              key={p}
              onClick={() => setPeriod(p)}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "8px 20px", borderRadius: 100, fontSize: 14, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
                background: period === p
                  ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                  : "rgba(255,255,255,0.05)",
                color: period === p ? "white" : "#9090b0",
                border: period === p ? "none" : "1px solid rgba(255,255,255,0.08)"
              }}
            >
              {p === "weekly" ? "주간" : p === "monthly" ? "월간" : "전체"}
            </motion.button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr",
          gap: 12, marginBottom: 24, alignItems: "end"
        }}>
          {/* 2nd */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ padding: 20, textAlign: "center" }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🥈</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{leaderboard[1].name}</div>
            <div style={{ color: "#9090b0", fontSize: 12, marginBottom: 8 }}>{leaderboard[1].accuracy}% 적중</div>
            <div style={{ color: "#a78bfa", fontWeight: 700 }}>{leaderboard[1].points.toLocaleString()}P</div>
          </motion.div>
          {/* 1st */}
          <motion.div
            className="glass-card glow-purple"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              padding: 24, textAlign: "center",
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.1))",
              border: "1px solid rgba(139,92,246,0.4)"
            }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: 40, marginBottom: 8 }}
            >🥇</motion.div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{leaderboard[0].name}</div>
            <div style={{ color: "#9090b0", fontSize: 13, marginBottom: 8 }}>
              {leaderboard[0].accuracy}% 적중 · 🔥{leaderboard[0].streak}연속
            </div>
            <div className="gradient-text" style={{ fontWeight: 800, fontSize: 20 }}>
              {leaderboard[0].points.toLocaleString()}P
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#f59e0b" }}>👑 오라클</div>
          </motion.div>
          {/* 3rd */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ padding: 20, textAlign: "center" }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🥉</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{leaderboard[2].name}</div>
            <div style={{ color: "#9090b0", fontSize: 12, marginBottom: 8 }}>{leaderboard[2].accuracy}% 적중</div>
            <div style={{ color: "#a78bfa", fontWeight: 700 }}>{leaderboard[2].points.toLocaleString()}P</div>
          </motion.div>
        </div>

        {/* Full List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {leaderboard.map((user, i) => {
            const tierInfo = tierConfig[user.tier as keyof typeof tierConfig];
            return (
              <motion.div
                key={user.rank}
                className="glass-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}
              >
                <div style={{ width: 36, textAlign: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {rankMedal(user.rank)}
                </div>

                <div style={{
                  width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                  background: `${tierInfo.color}22`,
                  border: `2px solid ${tierInfo.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20
                }}>
                  {user.emoji}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {user.name}
                    <span style={{ marginLeft: 8, fontSize: 11, color: tierInfo.color, fontWeight: 500 }}>
                      {tierInfo.emoji} {tierInfo.label}
                    </span>
                    {user.streak >= 3 && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: "#f59e0b" }}>
                        🔥 {user.streak}연속
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#5a5a7a", fontSize: 12, marginTop: 2 }}>
                    적중률 {user.accuracy}%
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: "#a78bfa", fontSize: 16 }}>
                    {user.points.toLocaleString()}P
                  </div>
                  {user.rank <= 3 && (
                    <div style={{ fontSize: 11, color: "#22d3a0" }}>
                      기프티콘 수령 대상
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Prize Info */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 24, padding: 24,
            background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.05))",
            border: "1px solid rgba(139,92,246,0.25)"
          }}
        >
          <h3 style={{ fontWeight: 800, marginBottom: 12 }}>🎁 이번 주 시상 내역</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { rank: "1위", prize: "스타벅스 10잔", emoji: "☕" },
              { rank: "2위", prize: "스타벅스 5잔", emoji: "☕" },
              { rank: "3위", prize: "스타벅스 3잔", emoji: "☕" },
              { rank: "4-10위", prize: "편의점 1만원권", emoji: "🏪" },
            ].map((p, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "14px 10px",
                background: "rgba(255,255,255,0.03)", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)"
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{p.emoji}</div>
                <div style={{ fontWeight: 800, color: "#a78bfa", marginBottom: 2 }}>{p.rank}</div>
                <div style={{ color: "#9090b0", fontSize: 12 }}>{p.prize}</div>
              </div>
            ))}
          </div>
          <p style={{ color: "#5a5a7a", fontSize: 12, marginTop: 12, textAlign: "center" }}>
            * 매주 월요일 자정 기준 / 랭킹 포인트는 주간 예측 적중 포인트로 산정
          </p>
        </motion.div>
      </div>
    </div>
  );
}
