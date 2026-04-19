"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { markets, getTier, tierConfig, formatPoints, formatDate } from "@/lib/data";

const myBets = [
  { marketId: "kospi-2700", side: "yes", amount: 200, prob: 62, status: "진행중" },
  { marketId: "boi-rate-freeze", side: "yes", amount: 100, prob: 78, status: "진행중" },
  { marketId: "usd-krw-1450", side: "no", amount: 50, prob: 37, status: "진행중" },
];

const badges = [
  { emoji: "🎯", title: "첫 예측 완료", earned: true },
  { emoji: "🔥", title: "3연속 적중", earned: true },
  { emoji: "📊", title: "경제통", earned: true },
  { emoji: "🗳️", title: "정치 감별사", earned: false },
  { emoji: "👑", title: "오라클 달성", earned: false },
  { emoji: "🌙", title: "7일 연속 출석", earned: false },
];

export default function ProfilePage() {
  const points = 500;
  const streak = 3;
  const tier = getTier(points);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];

  const tierKeys = ["rookie", "predictor", "analyst", "strategist", "oracle"];
  const currentIdx = tierKeys.indexOf(tier);
  const nextTier = tierKeys[currentIdx + 1] as keyof typeof tierConfig | undefined;
  const nextTierInfo = nextTier ? tierConfig[nextTier] : null;
  const nextMin = nextTierInfo?.minPoints ?? points;
  const currentMin = tierInfo.minPoints;
  const progress = nextTier ? Math.min(100, ((points - currentMin) / (nextMin - currentMin)) * 100) : 100;

  return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={points} streak={streak} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "90px 20px 60px" }}>
        {/* Profile Header */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 32, marginBottom: 20,
            background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))",
            border: "1px solid rgba(139,92,246,0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: `${tierInfo.color}22`, border: `3px solid ${tierInfo.color}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36
              }}>
                🐱
              </div>
              <div style={{
                position: "absolute", bottom: -4, right: -4,
                background: tierInfo.color, color: "white",
                borderRadius: 100, padding: "2px 8px", fontSize: 11, fontWeight: 800,
                border: "2px solid #14142a"
              }}>
                {tierInfo.emoji} {tierInfo.label}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>뇨앙군</h1>
              <p style={{ color: "#9090b0", fontSize: 14, marginBottom: 12 }}>2026년 3월 가입 · 서울</p>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 14 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22 }}>{formatPoints(points)}</div>
                  <div style={{ color: "#5a5a7a", fontSize: 12 }}>보유 포인트</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22 }}>67.2%</div>
                  <div style={{ color: "#5a5a7a", fontSize: 12 }}>예측 적중률</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: "#f59e0b" }}>🔥{streak}</div>
                  <div style={{ color: "#5a5a7a", fontSize: 12 }}>연속 적중</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22 }}>4위</div>
                  <div style={{ color: "#5a5a7a", fontSize: 12 }}>전체 랭킹</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Progress */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: tierInfo.color, fontWeight: 600 }}>
                {tierInfo.emoji} {tierInfo.label}
              </span>
              {nextTierInfo && (
                <span style={{ color: "#9090b0" }}>
                  다음: {nextTierInfo.emoji} {nextTierInfo.label} ({(nextMin - points).toLocaleString()}P 남음)
                </span>
              )}
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
              <motion.div
                style={{
                  height: "100%", borderRadius: 4,
                  background: `linear-gradient(90deg, ${tierInfo.color}, #ec4899)`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
          {/* Left */}
          <div>
            {/* My Bets */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ padding: 24, marginBottom: 16 }}
            >
              <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>📊 진행 중인 예측</h2>
              {myBets.map((bet, i) => {
                const market = markets.find(m => m.id === bet.marketId);
                if (!market) return null;
                return (
                  <div key={i} style={{
                    marginBottom: i < myBets.length - 1 ? 16 : 0,
                    paddingBottom: i < myBets.length - 1 ? 16 : 0,
                    borderBottom: i < myBets.length - 1 ? "1px solid rgba(139,92,246,0.08)" : "none"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#f0f0ff", flex: 1, marginRight: 12 }}>
                        {market.title}
                      </span>
                      <span style={{
                        padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, flexShrink: 0,
                        background: bet.side === "yes" ? "rgba(34,211,160,0.15)" : "rgba(244,63,94,0.15)",
                        color: bet.side === "yes" ? "#22d3a0" : "#f43f5e",
                        border: `1px solid ${bet.side === "yes" ? "rgba(34,211,160,0.3)" : "rgba(244,63,94,0.3)"}`
                      }}>
                        {bet.side === "yes" ? "📈 YES" : "📉 NO"} {bet.amount}P
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#5a5a7a" }}>
                      <span>현재 {bet.side === "yes" ? "YES" : "NO"}: {bet.prob}%</span>
                      <span>예상 수익: +{Math.round(bet.amount * (100 / bet.prob) - bet.amount)}P</span>
                      <span style={{ color: "#22d3a0" }}>{bet.status}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Badges */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ padding: 24 }}
            >
              <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>🏅 획득 배지</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                {badges.map((badge, i) => (
                  <div key={i} style={{
                    textAlign: "center", padding: "16px 10px",
                    background: badge.earned ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                    borderRadius: 12,
                    border: badge.earned ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.05)",
                    opacity: badge.earned ? 1 : 0.4
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{badge.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: badge.earned ? "#f0f0ff" : "#5a5a7a" }}>
                      {badge.title}
                    </div>
                    {!badge.earned && (
                      <div style={{ fontSize: 10, color: "#5a5a7a", marginTop: 4 }}>미획득</div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Mascot */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ padding: 20, textAlign: "center" }}
            >
              <div className="float-anim" style={{ position: "relative", height: 140, marginBottom: 12 }}>
                <Image src="/mascot.png" alt="폴리캣" fill style={{ objectFit: "contain" }} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>뇨앙군의 폴리캣</div>
              <div style={{ color: "#9090b0", fontSize: 12 }}>
                더 많이 예측할수록 고양이가 성장해요!
              </div>
            </motion.div>

            {/* Tier Guide */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ padding: 20 }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🏆 티어 가이드</h3>
              {Object.entries(tierConfig).map(([key, info]) => (
                <div key={key} style={{
                  display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
                  opacity: key === tier ? 1 : 0.5
                }}>
                  <span style={{ fontSize: 16 }}>{info.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: info.color }}>
                      {info.label}
                      {key === tier && <span style={{ color: "#22d3a0", marginLeft: 6, fontSize: 11 }}>◀ 현재</span>}
                    </div>
                    <div style={{ color: "#5a5a7a", fontSize: 11 }}>{info.minPoints.toLocaleString()}P+</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
