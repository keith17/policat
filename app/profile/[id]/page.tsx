"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { getTier, tierConfig, formatPoints } from "@/lib/data";

function generateNickname(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  const num = Math.abs(hash) % 100000;
  return `예측러 #${String(num).padStart(5, "0")}`;
}

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;
    async function fetchProfile() {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, points, xp, streak, created_at, avatar_url")
        .eq("id", id)
        .single();
      if (p) setProfile(p);

      const { data: b } = await supabase
        .from("bets")
        .select("id, side, amount, created_at, market_id, markets(id, title, status, yes_pool, no_pool)")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (b) setBets(b);
      setLoading(false);
    }
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar points={0} streak={0} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar points={0} streak={0} />
        <div style={{ textAlign: "center", paddingTop: 120, color: "var(--text-secondary)", fontSize: 15 }}>
          존재하지 않는 프로필입니다.
        </div>
      </div>
    );
  }

  const xp = profile.xp ?? profile.points ?? 0;
  const tier = getTier(xp);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];
  const tierKeys = ["rookie", "predictor", "analyst", "strategist", "oracle"];
  const currentIdx = tierKeys.indexOf(tier);
  const nextTier = tierKeys[currentIdx + 1] as keyof typeof tierConfig | undefined;
  const nextTierInfo = nextTier ? tierConfig[nextTier] : null;
  const nextMin = nextTierInfo?.minPoints ?? xp;
  const currentMin = tierInfo.minPoints;
  const progress = nextTier ? Math.min(100, ((xp - currentMin) / (nextMin - currentMin)) * 100) : 100;

  const joinDate = new Date(profile.created_at);
  const joinStr = `${joinDate.getFullYear()}년 ${joinDate.getMonth() + 1}월 가입`;
  const nickname = generateNickname(profile.id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar points={0} streak={0} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "90px 20px 60px" }}>

        {/* Header */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: 32, marginBottom: 16, boxShadow: "var(--shadow-sm)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: `${tierInfo.color}22`, border: `3px solid ${tierInfo.color}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36
              }}>🐱</div>
              <div style={{
                position: "absolute", bottom: -4, right: -4,
                background: tierInfo.color, color: "white",
                borderRadius: 100, padding: "2px 8px", fontSize: 11, fontWeight: 800,
                border: "2px solid var(--bg-primary)", whiteSpace: "nowrap"
              }}>
                {tierInfo.emoji} {tierInfo.label}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: "var(--text-primary)" }}>{nickname}</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>{joinStr}</p>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{formatPoints(profile.points ?? 0)}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>보유 포인트</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{formatPoints(xp)}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>XP</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "var(--accent-gold)" }}>🔥{profile.streak ?? 0}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>스트릭</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>{bets.length}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>총 예측</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier progress */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: tierInfo.color, fontWeight: 600 }}>{tierInfo.emoji} {tierInfo.label}</span>
              {nextTierInfo && (
                <span style={{ color: "var(--text-muted)" }}>
                  다음: {nextTierInfo.emoji} {nextTierInfo.label} ({formatPoints(nextMin - xp)} 남음)
                </span>
              )}
            </div>
            <div style={{ height: 8, background: "var(--surface-alt)", borderRadius: 4, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 4, background: tierInfo.color }}
              />
            </div>
          </div>
        </motion.div>

        {/* Recent bets */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ padding: 24, marginBottom: 16, boxShadow: "var(--shadow-sm)" }}
        >
          <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16, color: "var(--text-primary)" }}>📊 최근 예측 내역</h2>
          {bets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 14 }}>
              아직 예측 내역이 없습니다.
            </div>
          ) : (
            bets.map((bet, i) => {
              const market = bet.markets;
              const total = market ? (market.yes_pool + market.no_pool) : 0;
              const sidePool = market ? (bet.side === "yes" ? market.yes_pool : market.no_pool) : 0;
              const prob = total > 0 ? Math.round((sidePool / total) * 100) : 50;
              return (
                <div key={bet.id} style={{
                  paddingBottom: i < bets.length - 1 ? 14 : 0,
                  marginBottom: i < bets.length - 1 ? 14 : 0,
                  borderBottom: i < bets.length - 1 ? "1px solid var(--border)" : "none"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    {market?.id ? (
                      <Link href={`/market/${bet.market_id}`} style={{ textDecoration: "none", flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.4 }}>
                          {market.title}
                        </span>
                      </Link>
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-muted)", flex: 1 }}>삭제된 마켓</span>
                    )}
                    <span style={{
                      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, flexShrink: 0,
                      background: bet.side === "yes" ? "var(--accent-yes-soft)" : "var(--accent-no-soft)",
                      color: bet.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)"
                    }}>
                      {bet.side === "yes" ? "📈 YES" : "📉 NO"} {bet.amount}P
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {new Date(bet.created_at).toLocaleDateString("ko-KR")} · 현재 {bet.side === "yes" ? "YES" : "NO"}: {prob}%
                  </div>
                </div>
              );
            })
          )}
        </motion.div>

        {/* Tier guide */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ padding: 24, boxShadow: "var(--shadow-sm)" }}
        >
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--text-primary)" }}>🏆 티어 가이드</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {Object.entries(tierConfig).map(([key, info]) => (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                background: key === tier ? "var(--surface-alt)" : "transparent",
                borderRadius: "var(--radius-sm)", opacity: key === tier ? 1 : 0.5
              }}>
                <span style={{ fontSize: 16 }}>{info.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: info.color }}>
                    {info.label}
                    {key === tier && <span style={{ color: "var(--accent-yes)", marginLeft: 4, fontSize: 10 }}>◀ 현재</span>}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{info.minPoints.toLocaleString()}P+</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
