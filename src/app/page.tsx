"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MarketCard from "@/components/MarketCard";
import { AdBanner } from "@/components/AdBanner";
import Navbar from "@/components/Navbar";
import { markets as initialMarkets, formatPoints, getTier, tierConfig } from "@/lib/data";

export default function Home() {
  const [points, setPoints] = useState(500);
  const [streak, setStreak] = useState(3);
  const [markets, setMarkets] = useState(initialMarkets);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" | "warn" } | null>(null);
  const [betModal, setBetModal] = useState<{ marketId: string; side: "yes" | "no" } | null>(null);
  const [betAmount, setBetAmount] = useState(50);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const tier = getTier(points);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];

  const showToast = (msg: string, type: "success" | "info" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBet = (marketId: string, side: "yes" | "no", amount: number) => {
    setBetModal({ marketId, side });
    setBetAmount(50);
  };

  const confirmBet = () => {
    if (!betModal) return;
    if (points < betAmount) {
      showToast("포인트가 부족합니다!", "warn");
      return;
    }
    setPoints(p => p - betAmount);
    setMarkets(prev => prev.map(m =>
      m.id === betModal.marketId ? { ...m, myBet: betModal.side } : m
    ));
    setBetModal(null);
    showToast(`🎯 예측 완료! ${betAmount}P 베팅`, "success");
  };

  const claimDaily = () => {
    if (dailyClaimed) return;
    const bonus = 5 + streak * 5;
    setPoints(p => p + bonus);
    setDailyClaimed(true);
    showToast(`🌅 출석 체크 완료! +${bonus}P`, "success");
  };

  const filteredMarkets = filter === "all"
    ? markets
    : markets.filter(m => m.category === filter);

  const stats = [
    { label: "활성 마켓", value: markets.length, emoji: "📊" },
    { label: "총 예측 참여", value: "24,891", emoji: "👥" },
    { label: "오늘 적중률 1위", value: "79.3%", emoji: "🏆" },
    { label: "지급된 기프티콘", value: "1,204건", emoji: "🎁" },
  ];

  return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={points} streak={streak} />

      {/* Hero Section */}
      <section style={{
        paddingTop: 100, paddingBottom: 40, paddingLeft: 20, paddingRight: 20,
        maxWidth: 1200, margin: "0 auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          {/* Left text */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 100, padding: "6px 14px", marginBottom: 20
              }}>
                <span className="pulse-dot" style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#22d3a0", display: "inline-block"
                }} />
                <span style={{ color: "#a78bfa", fontSize: 13, fontWeight: 600 }}>
                  실시간 예측 마켓 운영 중
                </span>
              </div>

              <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
                <span className="gradient-text">경제·정치 이슈</span>
                <br />
                <span style={{ color: "#f0f0ff" }}>당신의 예측이</span>
                <br />
                <span style={{ color: "#f0f0ff" }}>포인트가 됩니다</span>
              </h1>

              <p style={{ color: "#9090b0", fontSize: 16, lineHeight: 1.7, marginBottom: 28, maxWidth: 440 }}>
                광고 포인트로 예측에 참여하고, 적중하면 기프티콘으로 교환하세요.
                가입비·결제 없이 누구나 참여 가능!
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <motion.button
                  className="btn-primary"
                  style={{ padding: "14px 28px", fontSize: 15 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={claimDaily}
                >
                  {dailyClaimed ? "✅ 출석 완료" : "🌅 출석 체크 +P"}
                </motion.button>
                <Link href="/earn" style={{ textDecoration: "none" }}>
                  <motion.button
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(139,92,246,0.4)",
                      borderRadius: 12, padding: "14px 28px",
                      color: "#a78bfa", fontSize: 15, fontWeight: 700, cursor: "pointer"
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    🎬 포인트 획득하기
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right mascot */}
          <motion.div
            className="float-anim"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ position: "relative", width: 240, height: 240, flexShrink: 0 }}
          >
            {/* Glow around mascot */}
            <div style={{
              position: "absolute", inset: -20,
              background: "radial-gradient(ellipse, rgba(139,92,246,0.2), transparent 70%)",
              borderRadius: "50%"
            }} />
            <Image src="/mascot.png" alt="폴리캣 마스코트" fill style={{ objectFit: "contain" }} priority />
            {/* Floating info bubble */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              style={{
                position: "absolute", top: -10, right: -20,
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                borderRadius: 12, padding: "8px 12px",
                fontSize: 12, fontWeight: 700, color: "white",
                boxShadow: "0 4px 16px rgba(139,92,246,0.4)"
              }}
            >
              {tierInfo.emoji} {tierInfo.label}
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12, marginTop: 40
          }}
        >
          {stats.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#f0f0ff" }}>{s.value}</div>
              <div style={{ color: "#5a5a7a", fontSize: 12, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Ad Banner */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 20px" }}>
        <AdBanner type="horizontal" />
      </div>

      {/* Markets Section */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 80px" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: "#f0f0ff", marginRight: 8 }}>
            🔥 진행 중인 마켓
          </h2>
          {[
            { key: "all", label: "전체" },
            { key: "economy", label: "경제" },
            { key: "politics", label: "정치" },
            { key: "society", label: "사회" },
          ].map(({ key, label }) => (
            <motion.button
              key={key}
              onClick={() => setFilter(key)}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
                background: filter === key
                  ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                  : "rgba(255,255,255,0.05)",
                color: filter === key ? "white" : "#9090b0",
                border: filter === key ? "none" : "1px solid rgba(255,255,255,0.08)"
              }}
            >
              {label}
            </motion.button>
          ))}

          <div style={{ marginLeft: "auto", color: "#5a5a7a", fontSize: 13 }}>
            내 포인트: <span style={{ color: "#a78bfa", fontWeight: 700 }}>{formatPoints(points)}</span>
          </div>
        </div>

        {/* Market Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16
        }}>
          {filteredMarkets.map((market, i) => (
            <MarketCard
              key={market.id}
              market={market}
              onBet={handleBet}
              userPoints={points}
              index={i}
            />
          ))}
        </div>

        {/* Bottom Ad */}
        <div style={{ marginTop: 32 }}>
          <AdBanner type="horizontal" />
        </div>
      </section>

      {/* Bet Modal */}
      <AnimatePresence>
        {betModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBetModal(null)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
                zIndex: 200
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 201, width: "90%", maxWidth: 420,
                background: "#14142a",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 20, padding: 28
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                {betModal.side === "yes" ? "📈 YES 예측" : "📉 NO 예측"}
              </h3>
              <p style={{ color: "#9090b0", fontSize: 14, marginBottom: 24 }}>
                {markets.find(m => m.id === betModal.marketId)?.title}
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ color: "#9090b0", fontSize: 13, marginBottom: 8, display: "block" }}>
                  베팅 포인트 (보유: {formatPoints(points)})
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[10, 50, 100, 200, 500].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s",
                        background: betAmount === amt
                          ? (betModal.side === "yes" ? "#059669" : "#be123c")
                          : "rgba(255,255,255,0.05)",
                        color: betAmount === amt ? "white" : "#9090b0",
                        border: betAmount === amt ? "none" : "1px solid rgba(255,255,255,0.08)"
                      }}
                    >
                      {amt}P
                    </button>
                  ))}
                </div>

                <div style={{
                  marginTop: 16, padding: 16, borderRadius: 12,
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.15)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#9090b0", fontSize: 14 }}>베팅 금액</span>
                    <span style={{ fontWeight: 700 }}>{betAmount}P</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9090b0", fontSize: 14 }}>예상 수익 (적중 시)</span>
                    <span style={{ color: "#22d3a0", fontWeight: 700 }}>
                      +{Math.round(betAmount * (betModal.side === "yes"
                        ? (100 / (markets.find(m => m.id === betModal.marketId)?.yesProb || 50))
                        : (100 / (markets.find(m => m.id === betModal.marketId)?.noProb || 50))
                      ) - betAmount)}P
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setBetModal(null)}
                  style={{
                    flex: 1, padding: "13px", borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#9090b0", fontSize: 15, fontWeight: 600, cursor: "pointer"
                  }}
                >취소</button>
                <motion.button
                  onClick={confirmBet}
                  whileTap={{ scale: 0.97 }}
                  className={betModal.side === "yes" ? "btn-yes" : "btn-no"}
                  style={{ flex: 2, padding: "13px", fontSize: 15 }}
                >
                  {betAmount}P 예측 확정
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
              zIndex: 300,
              background: toast.type === "success"
                ? "linear-gradient(135deg, #059669, #22d3a0)"
                : toast.type === "warn"
                  ? "linear-gradient(135deg, #be123c, #f43f5e)"
                  : "linear-gradient(135deg, #8b5cf6, #ec4899)",
              borderRadius: 14, padding: "14px 24px",
              color: "white", fontWeight: 700, fontSize: 15,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap"
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
