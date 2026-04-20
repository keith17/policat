"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { AdBanner } from "@/components/AdBanner";
import { tierConfig, formatPoints, getTier } from "@/lib/data";
import { createClient } from "@/utils/supabase/client";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"all">("all");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: myProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setUserProfile(myProfile);
      }

      // 1. Fetch top profiles sorted by XP
      const { data: topProfiles } = await supabase
        .from("profiles")
        .select("*")
        .order("xp", { ascending: false })
        .limit(20);

      if (topProfiles) {
        setLeaderboard(topProfiles.map((p, i) => ({
          id: p.id,
          rank: i + 1,
          name: p.full_name || p.email.split("@")[0],
          email: p.email,
          xp: p.xp !== undefined ? p.xp : p.points,
          points: p.points,
          streak: p.streak || 0,
        })));
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, [supabase]);

  const rankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {userProfile ? (
        <Navbar points={userProfile.points} xp={userProfile.xp} streak={userProfile.streak} />
      ) : (
        <Navbar points={500} streak={0} />
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "90px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, color: "var(--text-primary)" }}>
            🏆 예측 경험치(XP) 랭킹
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            플랫폼 전체에서 가장 많은 경험치(XP)를 누적한 예측가들입니다.
          </p>
        </motion.div>

        {/* Ad Banner */}
        <AdBanner type="horizontal" />
        <div style={{ marginBottom: 24 }} />

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>데이터를 불러오는 중입니다...</div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
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
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>
                    🔥{leaderboard[1].streak}연속 출석
                  </div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 800 }}>{formatPoints(leaderboard[1].xp).replace('P', ' XP')}</div>
                </motion.div>
                {/* 1st */}
                <motion.div
                  className="glass-card"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    padding: 24, textAlign: "center",
                    border: "2px solid #FFB800",
                    background: "var(--bg-secondary)"
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: 40, marginBottom: 8 }}
                  >🥇</motion.div>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{leaderboard[0].name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>
                    🔥{leaderboard[0].streak}연속 출석
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: "var(--text-primary)" }}>
                    {formatPoints(leaderboard[0].xp).replace('P', ' XP')}
                  </div>
                  {tierConfig[getTier(leaderboard[0].xp) as keyof typeof tierConfig] && (
                    <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: tierConfig[getTier(leaderboard[0].xp) as keyof typeof tierConfig].color }}>
                      {tierConfig[getTier(leaderboard[0].xp) as keyof typeof tierConfig].emoji} {tierConfig[getTier(leaderboard[0].xp) as keyof typeof tierConfig].label}
                    </div>
                  )}
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
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>
                    🔥{leaderboard[2].streak}연속 출석
                  </div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 800 }}>{formatPoints(leaderboard[2].xp).replace('P', ' XP')}</div>
                </motion.div>
              </div>
            )}

            {/* Full List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {leaderboard.map((lbUser, i) => {
                const tier = getTier(lbUser.xp);
                const tInfo = tierConfig[tier as keyof typeof tierConfig] || tierConfig["rookie"];
                const isMe = user?.id === lbUser.id;
                
                return (
                  <motion.div
                    key={lbUser.id}
                    className="glass-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ 
                      padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                      background: isMe ? "var(--bg-card-hover)" : "var(--bg-secondary)",
                      border: isMe ? "1px solid var(--purple-primary)" : "1px solid var(--border)"
                    }}
                  >
                    <div style={{ width: 36, textAlign: "center", fontWeight: 800, fontSize: 16, flexShrink: 0, color: "var(--text-primary)" }}>
                      {rankMedal(lbUser.rank)}
                    </div>

                    <div style={{
                      width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                      background: `${tInfo.color}15`,
                      border: `1px solid ${tInfo.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20
                    }}>
                      {tInfo.emoji}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                        {lbUser.name} {isMe && <span style={{ fontSize: 11, background: "var(--text-primary)", color: "white", padding: "2px 6px", borderRadius: 4, marginLeft: 4 }}>ME</span>}
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4, display: "flex", gap: 8 }}>
                        <span>{tInfo.label} 티어</span>
                        <span>🔥 {lbUser.streak}일</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: 16 }}>
                        {formatPoints(lbUser.xp).replace('P', ' XP')}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
