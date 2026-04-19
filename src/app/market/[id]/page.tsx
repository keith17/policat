"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { markets, formatPoints, formatDate } from "@/lib/data";
import { AdBanner } from "@/components/AdBanner";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Image from "next/image";

// Mock chart data
const generateChartData = (finalYes: number) => {
  const data = [];
  let val = 50;
  for (let i = 0; i < 30; i++) {
    val += (Math.random() - 0.48) * 5;
    val = Math.max(10, Math.min(90, val));
    if (i === 29) val = finalYes;
    data.push({
      day: `${i + 1}일`,
      yes: parseFloat(val.toFixed(1)),
      no: parseFloat((100 - val).toFixed(1))
    });
  }
  return data;
};

const comments = [
  { user: "경제달인", tier: "oracle", text: "금통위 결정 패턴 보면 거의 동결 확실. YES 강력 추천!", time: "2시간 전", likes: 24 },
  { user: "판세읽는자", tier: "strategist", text: "미국 연준 동향을 봐야 함. 아직 불확실 요인이 많죠.", time: "3시간 전", likes: 17 },
  { user: "루키냥이", tier: "rookie", text: "처음 해보는데 YES로 했어요 ㅎㅎ", time: "5시간 전", likes: 8 },
];

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;
  const market = markets.find(m => m.id === marketId);
  const [userPoints] = useState(500);
  const [betSide, setBetSide] = useState<"yes" | "no" | null>(null);
  const [betAmount, setBetAmount] = useState(50);
  const [participated, setParticipated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!market) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#9090b0" }}>
        마켓을 찾을 수 없습니다.
      </div>
    );
  }

  const chartData = generateChartData(market.yesProb);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const confirmBet = () => {
    if (!betSide) return;
    setParticipated(true);
    showToast(`🎯 ${betSide === "yes" ? "YES" : "NO"} ${betAmount}P 예측 참여 완료!`);
  };

  const handleShare = () => {
    const text = `[폴리캣] "${market.title}"\nYES ${market.yesProb}% / NO ${market.noProb}%\n지금 예측해보세요! 👉 policat.kr/market/${market.id}\n#폴리캣 #예측마켓`;
    navigator.clipboard?.writeText(text);
    showToast("📋 공유 링크가 복사됐습니다! (+3P)");
  };

  const categoryColorMap: Record<string, string> = {
    economy: "#f59e0b", politics: "#a78bfa", society: "#22d3a0"
  };
  const catColor = categoryColorMap[market.category] || "#9090b0";

  return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={userPoints} streak={3} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "90px 20px 60px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, color: "#5a5a7a", fontSize: 13 }}>
          <Link href="/" style={{ color: "#9090b0", textDecoration: "none" }}>마켓</Link>
          <span>/</span>
          <span style={{ color: catColor }}>{market.categoryLabel}</span>
          <span>/</span>
          <span>상세</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Left Column */}
          <div>
            {/* Market Header */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ padding: 28, marginBottom: 20 }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span className={`tag tag-${market.category}`}>{market.emoji} {market.categoryLabel}</span>
                {market.hot && <span style={{ background: "rgba(244,63,94,0.15)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 100, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>🔥 HOT</span>}
              </div>
              <h1 style={{ fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 800, lineHeight: 1.4, marginBottom: 12 }}>
                {market.title}
              </h1>
              <p style={{ color: "#9090b0", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                {market.description}
              </p>

              <div style={{
                display: "flex", gap: 20, flexWrap: "wrap",
                borderTop: "1px solid rgba(139,92,246,0.1)", paddingTop: 16,
                color: "#5a5a7a", fontSize: 13
              }}>
                <span>📅 종료: {formatDate(market.endDate)} ({market.daysLeft}일 남음)</span>
                <span>👥 {market.participants.toLocaleString()}명 참여</span>
                <span>💰 총 {(market.totalVolume / 1000).toFixed(0)}K P 베팅</span>
              </div>
            </motion.div>

            {/* Probability + Chart */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ padding: 24, marginBottom: 20 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16 }}>📈 예측 현황</h2>
                <span style={{ color: "#5a5a7a", fontSize: 12 }}>30일 추이</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <span style={{ color: "#22d3a0", fontWeight: 900, fontSize: 40 }}>{market.yesProb}</span>
                  <span style={{ color: "#22d3a0", fontSize: 18 }}>%</span>
                  <div style={{ color: "#9090b0", fontSize: 12 }}>YES (맞다)</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "#f43f5e", fontWeight: 900, fontSize: 40 }}>{market.noProb}</span>
                  <span style={{ color: "#f43f5e", fontSize: 18 }}>%</span>
                  <div style={{ color: "#9090b0", fontSize: 12 }}>NO (아니다)</div>
                </div>
              </div>

              {/* Prob bar */}
              <div style={{ display: "flex", gap: 3, height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
                <motion.div
                  style={{ background: "linear-gradient(90deg, #059669, #22d3a0)" }}
                  initial={{ flex: 0 }}
                  animate={{ flex: market.yesProb }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <motion.div
                  style={{ background: "linear-gradient(90deg, #be123c, #f43f5e)" }}
                  initial={{ flex: 0 }}
                  animate={{ flex: market.noProb }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3a0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "#5a5a7a", fontSize: 10 }} tickLine={false} axisLine={false} interval={9} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#5a5a7a", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#14142a", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, color: "#f0f0ff" }}
                    formatter={(val) => [`${val}%`]}

                  />
                  <Area type="monotone" dataKey="yes" stroke="#22d3a0" strokeWidth={2} fill="url(#yesGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Comments */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ padding: 24 }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>💬 예측 근거 공유</h2>
              {comments.map((c, i) => (
                <div key={i} style={{
                  marginBottom: 16, paddingBottom: 16,
                  borderBottom: i < comments.length - 1 ? "1px solid rgba(139,92,246,0.08)" : "none"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {c.user}
                      <span style={{ marginLeft: 6, fontSize: 11, color: catColor, fontWeight: 500 }}>
                        {c.tier === "oracle" ? "👑 오라클" : c.tier === "strategist" ? "🧠 전략가" : "🐣 루키"}
                      </span>
                    </span>
                    <span style={{ color: "#5a5a7a", fontSize: 12 }}>{c.time}</span>
                  </div>
                  <p style={{ color: "#c0c0d8", fontSize: 14, lineHeight: 1.6 }}>{c.text}</p>
                  <button style={{
                    marginTop: 8, background: "none", border: "none",
                    color: "#5a5a7a", fontSize: 12, cursor: "pointer"
                  }}>
                    👍 {c.likes}
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <textarea
                  placeholder="예측 근거를 공유하면 +5P!"
                  rows={3}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10,
                    color: "#f0f0ff", padding: 12, fontSize: 14, resize: "none",
                    outline: "none", fontFamily: "inherit"
                  }}
                />
                <button className="btn-primary" style={{ marginTop: 8, padding: "10px 20px", fontSize: 13 }}>
                  작성하기 (+5P)
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Bet Panel */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ padding: 24, position: "sticky", top: 82 }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🎯 예측 참여</h2>

              {participated ? (
                <div style={{
                  textAlign: "center", padding: 24,
                  background: betSide === "yes" ? "rgba(34,211,160,0.1)" : "rgba(244,63,94,0.1)",
                  borderRadius: 12, border: `1px solid ${betSide === "yes" ? "rgba(34,211,160,0.3)" : "rgba(244,63,94,0.3)"}`,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                  <p style={{ fontWeight: 700, color: betSide === "yes" ? "#22d3a0" : "#f43f5e" }}>
                    {betSide === "yes" ? "YES" : "NO"} 예측 완료!
                  </p>
                  <p style={{ color: "#9090b0", fontSize: 13, marginTop: 4 }}>베팅: {betAmount}P</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {(["yes", "no"] as const).map(side => (
                      <motion.button
                        key={side}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBetSide(side)}
                        style={{
                          padding: "14px 8px", borderRadius: 12, fontWeight: 800,
                          fontSize: 16, cursor: "pointer", transition: "all 0.2s",
                          background: betSide === side
                            ? (side === "yes" ? "linear-gradient(135deg, #059669, #22d3a0)" : "linear-gradient(135deg, #be123c, #f43f5e)")
                            : "rgba(255,255,255,0.04)",
                          color: betSide === side ? "white" : "#9090b0",
                          border: betSide === side
                            ? "none"
                            : `1px solid ${side === "yes" ? "rgba(34,211,160,0.2)" : "rgba(244,63,94,0.2)"}`,
                          boxShadow: betSide === side
                            ? `0 4px 16px ${side === "yes" ? "rgba(34,211,160,0.3)" : "rgba(244,63,94,0.3)"}`
                            : "none"
                        }}
                      >
                        {side === "yes" ? "📈 YES" : "📉 NO"}
                        <div style={{ fontSize: 11, fontWeight: 500, marginTop: 2, opacity: 0.8 }}>
                          {side === "yes" ? market.yesProb : market.noProb}%
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: "#9090b0", fontSize: 12, marginBottom: 8 }}>베팅 포인트</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[10, 50, 100, 200, 500].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          style={{
                            padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.2s",
                            background: betAmount === amt ? "#8b5cf6" : "rgba(255,255,255,0.05)",
                            color: betAmount === amt ? "white" : "#9090b0",
                            border: betAmount === amt ? "none" : "1px solid rgba(255,255,255,0.08)"
                          }}
                        >
                          {amt}P
                        </button>
                      ))}
                    </div>
                  </div>

                  {betSide && (
                    <div style={{
                      padding: 12, borderRadius: 10, marginBottom: 12,
                      background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#9090b0" }}>적중 시 예상 수익</span>
                        <span style={{ color: "#22d3a0", fontWeight: 700 }}>
                          +{Math.round(betAmount * (100 / (betSide === "yes" ? market.yesProb : market.noProb)) - betAmount)}P
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.button
                    className="btn-primary"
                    style={{ width: "100%", padding: "13px", fontSize: 15, opacity: betSide ? 1 : 0.4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmBet}
                    disabled={!betSide}
                  >
                    {betSide ? `${betAmount}P 예측 확정` : "YES 또는 NO 선택"}
                  </motion.button>
                </>
              )}

              <button
                onClick={handleShare}
                style={{
                  width: "100%", marginTop: 10,
                  background: "transparent", border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: 10, padding: "10px", color: "#a78bfa",
                  fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}
              >
                🔗 공유하고 +3P 받기
              </button>
            </motion.div>

            {/* Ad */}
            <AdBanner type="square" />

            {/* Back */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", padding: "12px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#9090b0", fontSize: 14, cursor: "pointer"
              }}>
                ← 마켓 목록으로
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
            zIndex: 300, background: "linear-gradient(135deg, #059669, #22d3a0)",
            borderRadius: 14, padding: "14px 24px", color: "white", fontWeight: 700,
            fontSize: 15, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", whiteSpace: "nowrap"
          }}
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
