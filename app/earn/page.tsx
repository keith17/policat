"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AdBanner, AdVideoReward } from "@/components/AdBanner";
import { getTier, tierConfig, formatPoints } from "@/lib/data";
import { createClient } from "@/utils/supabase/client";

const earnMethods = [
  { id: "video", title: "광고 영상 시청", desc: "30초 광고 시청 시 포인트 지급", reward: 10, emoji: "🎬", limit: "하루 20회", type: "ad" },
  { id: "daily", title: "일일 출석 체크", desc: "매일 접속 시 포인트 지급 (연속 보너스↑)", reward: 5, emoji: "📅", limit: "하루 1회", type: "daily" },
  { id: "invite", title: "친구 초대", desc: "초대한 친구가 첫 예측 시 포인트 지급", reward: 50, emoji: "👥", limit: "무제한", type: "invite" },
  { id: "share", title: "마켓 공유하기", desc: "공유 링크 클릭 발생 시 포인트 지급", reward: 3, emoji: "🔗", limit: "클릭당", type: "share" },
  { id: "comment", title: "예측 근거 작성", desc: "댓글 작성 후 관리자 승인 시 지급", reward: 5, emoji: "📝", limit: "하루 5회", type: "comment" },
  { id: "streak", title: "연속 적중 보너스", desc: "3연속 이상 적중 시 보너스 지급", reward: 20, emoji: "🔥", limit: "달성 시마다", type: "streak" },
];

export default function EarnPage() {
  const [points, setPoints] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [videoCount, setVideoCount] = useState(0);
  const [inviteLink] = useState("https://policat.kr/invite/CAT20260417");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          setPoints(profile.points);
          setXp(profile.xp !== undefined ? profile.xp : profile.points);
          setStreak(profile.streak || 0);
        }
      }
    }
    fetchUser();
  }, [supabase]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const earnPoints = async (amount: number, msg: string) => {
    if (!user) {
      showToast("로그인이 필요합니다.");
      return;
    }
    const newPoints = points + amount;
    const newXp = xp + amount; // XP also increases
    setPoints(newPoints);
    setXp(newXp);
    showToast(`✅ ${msg} +${amount}P`);

    await supabase.from("profiles").update({ points: newPoints, xp: newXp }).eq("id", user.id);
    await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: amount,
      type: "reward",
      description: msg
    });
  };

  const claimDaily = () => {
    if (dailyClaimed || !user) return;
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
    earnPoints(10, "광고 시청(데모)");
  };

  const copyInvite = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("📋 초대 링크 복사 완료!");
  };

  // Tier progress (based on XP)
  const tier = getTier(xp);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig] || tierConfig["rookie"];
  
  const tierKeys = ["rookie", "predictor", "analyst", "strategist", "oracle"];
  const currentIdx = tierKeys.indexOf(tier);
  const nextTier = tierKeys[currentIdx + 1] as keyof typeof tierConfig | undefined;
  const nextTierInfo = nextTier ? tierConfig[nextTier] : null;
  const nextMin = nextTierInfo?.minPoints ?? xp;
  const currentMin = tierInfo.minPoints;
  const progress = nextTier
    ? Math.min(100, ((xp - currentMin) / (nextMin - currentMin)) * 100)
    : 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {user ? (
        <Navbar points={points} xp={xp} streak={streak} />
      ) : (
        <Navbar points={0} streak={0} />
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "90px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, color: "var(--text-primary)" }}>
            💎 포인트 획득하기
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>
            광고 시청, 친구 초대, 출석 체크로 포인트를 모으세요!
          </p>
        </motion.div>

        {/* My Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 24, marginBottom: 24,
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30
            }}>
              {tierInfo.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: "var(--text-primary)" }}>
                {formatPoints(points)}
              </div>
              <div style={{ color: tierInfo.color, fontWeight: 700, fontSize: 13, marginTop: 4 }}>
                {tierInfo.label} 티어 (XP: {formatPoints(xp).replace('P', ' XP')})
                {nextTierInfo && ` → ${nextTierInfo.emoji} ${nextTierInfo.label}까지 ${formatPoints(nextMin - xp).replace('P', ' XP')}`}
              </div>
              {/* Progress bar */}
              <div style={{
                height: 6, background: "var(--bg-secondary)", borderRadius: 3,
                marginTop: 8, overflow: "hidden"
              }}>
                <motion.div
                  style={{ height: "100%", background: tierInfo.color, borderRadius: 3 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, color: "var(--accent-yes)", fontSize: 20 }}>🔥{streak}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600 }}>연속 적중</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>{videoCount}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600 }}>오늘 시청</div>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ padding: 24, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{method.emoji}</span>
                    <span style={{
                      background: "rgba(34,211,160,0.1)", color: "var(--accent-yes)",
                      border: "1px solid rgba(34,211,160,0.2)",
                      borderRadius: 100, padding: "3px 10px", fontSize: 12, fontWeight: 800,
                      display: "flex", alignItems: "center"
                    }}>
                      +{method.reward}P
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, marginBottom: 6, color: "var(--text-primary)" }}>{method.title}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{method.desc}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16, fontWeight: 600 }}>한도: {method.limit}</div>

                  {method.type === "ad" && (
                    <motion.button
                      className="btn-primary"
                      style={{ width: "100%", padding: "12px", fontSize: 13, borderRadius: 8 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={watchVideo}
                    >
                      {videoCount >= 20 ? "오늘 한도 초과" : `광고 시청하기 (${videoCount}/20)`}
                    </motion.button>
                  )}
                  {method.type === "daily" && (
                    <motion.button
                      className="btn-primary"
                      style={{ width: "100%", padding: "12px", fontSize: 13, borderRadius: 8, opacity: dailyClaimed ? 0.5 : 1 }}
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
                        width: "100%", padding: "12px", fontSize: 13, fontWeight: 700,
                        background: copied ? "var(--accent-yes)" : "var(--bg-card-hover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8, color: copied ? "white" : "var(--text-primary)", cursor: "pointer"
                      }}
                    >
                      {copied ? "✅ 복사됨!" : "초대 링크 복사"}
                    </motion.button>
                  )}
                  {(method.type === "share" || method.type === "comment" || method.type === "streak") && (
                    <button style={{
                      width: "100%", padding: "12px", fontSize: 13, fontWeight: 700,
                      background: "var(--bg-secondary)", border: "1px solid var(--border)",
                      borderRadius: 8, color: "var(--text-secondary)", cursor: "default"
                    }}>
                      자동 지급 (조건 달성 시)
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Link to Shop */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, textAlign: "center" }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "var(--text-primary)" }}>충분히 포인트를 모으셨나요?</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
                상점 페이지에서 현실의 모바일 쿠폰으로 교환할 수 있습니다!
              </p>
              <Link href="/shop" style={{ textDecoration: "none" }}>
                <button style={{
                  background: "var(--text-primary)", color: "var(--bg-primary)",
                  padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: "pointer", border: "none"
                }}>
                  상점(교환소) 바로가기 👉
                </button>
              </Link>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AdVideoReward onEarn={(p) => earnPoints(p, "광고 시청(배너)")} />
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
              zIndex: 300, background: "var(--text-primary)",
              borderRadius: 8, padding: "14px 24px", color: "var(--bg-primary)", fontWeight: 700,
              fontSize: 15, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", whiteSpace: "nowrap"
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
