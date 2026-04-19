"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { AdBanner, AdVideoReward } from "@/components/AdBanner";
import { getTier, tierConfig } from "@/lib/data";

const earnMethods = [
  { id: "video", title: "광고 영상 시청", desc: "30초 광고 시청 시 포인트 지급", reward: 10, emoji: "🎬", limit: "하루 20회", type: "ad" },
  { id: "daily", title: "일일 출석 체크", desc: "매일 접속 시 포인트 지급 (연속 보너스↑)", reward: 5, emoji: "📅", limit: "하루 1회", type: "daily" },
  { id: "invite", title: "친구 초대", desc: "초대한 친구가 첫 예측 시 포인트 지급", reward: 50, emoji: "👥", limit: "무제한", type: "invite" },
  { id: "share", title: "마켓 공유하기", desc: "공유 링크 클릭 발생 시 포인트 지급", reward: 3, emoji: "🔗", limit: "클릭당", type: "share" },
  { id: "comment", title: "예측 근거 작성", desc: "댓글 작성 후 관리자 승인 시 지급", reward: 5, emoji: "📝", limit: "하루 5회", type: "comment" },
  { id: "streak", title: "연속 적중 보너스", desc: "3연속 이상 적중 시 보너스 지급", reward: 20, emoji: "🔥", limit: "달성 시마다", type: "streak" },
];

const giftOptions = [
  { name: "스타벅스 Tall 1잔", points: 5000, emoji: "☕", stock: 48 },
  { name: "편의점 5천원 쿠폰", points: 3000, emoji: "🏪", stock: 120 },
  { name: "배달의민족 3천원", points: 2000, emoji: "🍕", stock: 90 },
  { name: "CGV 영화 1매", points: 8000, emoji: "🎬", stock: 30 },
  { name: "네이버페이 1만원", points: 12000, emoji: "💚", stock: 20 },
  { name: "편의점 1만원 쿠폰", points: 6000, emoji: "🏪", stock: 75 },
];

export default function EarnPage() {
  const [points, setPoints] = useState(500);
  const [toast, setToast] = useState<string | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [videoCount, setVideoCount] = useState(0);
  const [inviteLink] = useState("https://policat.kr/invite/CAT20260417");
  const [copied, setCopied] = useState(false);
  const streak = 3;
  const tier = getTier(points);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const earnPoints = (amount: number, msg: string) => {
    setPoints(p => p + amount);
    showToast(`✅ ${msg} +${amount}P`);
  };

  const claimDaily = () => {
    if (dailyClaimed) return;
    const bonus = 5 + streak * 5;
    setDailyClaimed(true);
    earnPoints(bonus, "출석 체크 완료!");
  };

  const watchVideo = () => {
    if (videoCount >= 20) {
      showToast("오늘의 광고 시청 한도에 도달했습니다.");
      return;
    }
    setVideoCount(c => c + 1);
    earnPoints(10, "광고 시청");
  };

  const copyInvite = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("📋 초대 링크 복사 완료!");
  };

  const exchange = (gift: typeof giftOptions[0]) => {
    if (points < gift.points) {
      showToast("⚠️ 포인트가 부족합니다!");
      return;
    }
    setPoints(p => p - gift.points);
    showToast(`🎁 ${gift.name} 교환 신청 완료!`);
  };

  // Tier progress
  const tierKeys = ["rookie", "predictor", "analyst", "strategist", "oracle"];
  const currentIdx = tierKeys.indexOf(tier);
  const nextTier = tierKeys[currentIdx + 1] as keyof typeof tierConfig | undefined;
  const nextTierInfo = nextTier ? tierConfig[nextTier] : null;
  const nextMin = nextTierInfo?.minPoints ?? points;
  const currentMin = tierInfo.minPoints;
  const progress = nextTier
    ? Math.min(100, ((points - currentMin) / (nextMin - currentMin)) * 100)
    : 100;

  return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={points} streak={streak} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "90px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
            💎 <span className="gradient-text">포인트 획득하기</span>
          </h1>
          <p style={{ color: "#9090b0", marginBottom: 28 }}>
            광고 시청, 친구 초대, 출석 체크로 포인트를 모으세요!
          </p>
        </motion.div>

        {/* My Status */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 24, marginBottom: 24,
            background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))",
            border: "1px solid rgba(139,92,246,0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: `${tierInfo.color}22`, border: `3px solid ${tierInfo.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30
            }}>
              {tierInfo.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 22 }}>
                {points.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 500, color: "#9090b0" }}>P</span>
              </div>
              <div style={{ color: tierInfo.color, fontWeight: 600, fontSize: 14 }}>
                {tierInfo.label}
                {nextTierInfo && ` → ${nextTierInfo.emoji} ${nextTierInfo.label}까지 ${(nextMin - points).toLocaleString()}P`}
              </div>
              {/* Progress bar */}
              <div style={{
                height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3,
                marginTop: 8, overflow: "hidden"
              }}>
                <motion.div
                  style={{ height: "100%", background: `linear-gradient(90deg, ${tierInfo.color}, #ec4899)`, borderRadius: 3 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, color: "#f59e0b", fontSize: 20 }}>🔥{streak}</div>
                <div style={{ color: "#5a5a7a", fontSize: 11 }}>연속 적중</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 20 }}>{videoCount}</div>
                <div style={{ color: "#5a5a7a", fontSize: 11 }}>오늘 시청</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
          <div>
            {/* Earn Methods Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 24 }}>
              {earnMethods.map((method, i) => (
                <motion.div
                  key={method.id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ padding: 20 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{method.emoji}</span>
                    <span style={{
                      background: "rgba(34,211,160,0.15)", color: "#22d3a0",
                      border: "1px solid rgba(34,211,160,0.3)",
                      borderRadius: 100, padding: "3px 10px", fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center"
                    }}>
                      +{method.reward}P
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{method.title}</div>
                  <div style={{ color: "#9090b0", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{method.desc}</div>
                  <div style={{ color: "#5a5a7a", fontSize: 11, marginBottom: 14 }}>한도: {method.limit}</div>

                  {method.type === "ad" && (
                    <motion.button
                      className="btn-primary"
                      style={{ width: "100%", padding: "10px", fontSize: 13 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={watchVideo}
                    >
                      {videoCount >= 20 ? "오늘 한도 초과" : `광고 시청하기 (${videoCount}/20)`}
                    </motion.button>
                  )}
                  {method.type === "daily" && (
                    <motion.button
                      className="btn-primary"
                      style={{ width: "100%", padding: "10px", fontSize: 13, opacity: dailyClaimed ? 0.5 : 1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={claimDaily}
                    >
                      {dailyClaimed ? "✅ 오늘 출석 완료" : "출석 체크하기"}
                    </motion.button>
                  )}
                  {method.type === "invite" && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={copyInvite}
                      style={{
                        width: "100%", padding: "10px", fontSize: 13, fontWeight: 700,
                        background: copied ? "#22d3a0" : "rgba(139,92,246,0.2)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: 10, color: copied ? "white" : "#a78bfa", cursor: "pointer"
                      }}
                    >
                      {copied ? "✅ 복사됨!" : "초대 링크 복사"}
                    </motion.button>
                  )}
                  {(method.type === "share" || method.type === "comment" || method.type === "streak") && (
                    <button style={{
                      width: "100%", padding: "10px", fontSize: 13, fontWeight: 600,
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10, color: "#5a5a7a", cursor: "pointer"
                    }}>
                      자동 지급 (조건 달성 시)
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Gift Exchange */}
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>🎁 기프티콘 교환</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {giftOptions.map((gift, i) => (
                  <motion.div
                    key={i}
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    style={{ padding: 18, textAlign: "center" }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{gift.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{gift.name}</div>
                    <div style={{ color: "#a78bfa", fontWeight: 800, marginBottom: 4 }}>
                      {gift.points.toLocaleString()}P
                    </div>
                    <div style={{ color: "#5a5a7a", fontSize: 11, marginBottom: 12 }}>
                      잔여 {gift.stock}개
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => exchange(gift)}
                      style={{
                        width: "100%", padding: "9px", borderRadius: 9, fontWeight: 700,
                        fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                        background: points >= gift.points
                          ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                          : "rgba(255,255,255,0.04)",
                        color: points >= gift.points ? "white" : "#5a5a7a",
                        border: points >= gift.points ? "none" : "1px solid rgba(255,255,255,0.08)"
                      }}
                    >
                      {points >= gift.points ? "교환하기" : "포인트 부족"}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AdVideoReward onEarn={(p) => earnPoints(p, "광고 시청")} />
            <AdBanner type="square" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
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
      </AnimatePresence>
    </div>
  );
}
