"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatPoints, formatDate } from "@/lib/data";
import { AdBanner } from "@/components/AdBanner";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import TrendGraph, { TrendData } from "@/components/TrendGraph";
import CommentSection from "@/components/CommentSection";
import { createClient } from "@/utils/supabase/client";

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;
  const router = useRouter();
  
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBet, setUserBet] = useState<any>(null);
  
  const [betSide, setBetSide] = useState<"yes" | "no" | null>(null);
  const [betAmount, setBetAmount] = useState(50);
  const [toast, setToast] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Load user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setUserProfile(profile);
        
        const { data: bets } = await supabase.from("bets").select("*").eq("user_id", user.id).eq("market_id", marketId);
        if (bets && bets.length > 0) {
          setUserBet(bets[0]);
        }
      }

      // Load market
      const { data: mData } = await supabase.from("markets").select("*").eq("id", marketId).single();
      if (mData) {
        const total = mData.yes_pool + mData.no_pool;
        const yesProb = total > 0 ? Math.round((mData.yes_pool / total) * 100) : 50;
        const noProb = total > 0 ? 100 - yesProb : 50;
        
        setMarket({
          ...mData,
          categoryLabel: mData.category === 'economy' ? '경제' : mData.category === 'politics' ? '정치' : mData.category === 'society' ? '사회' : '스포츠',
          emoji: mData.category === 'economy' ? '📈' : mData.category === 'politics' ? '🏛️' : mData.category === 'society' ? '🤝' : '⚽',
          yesProb, noProb, totalVolume: total,
          daysLeft: Math.max(0, 7 - Math.floor((new Date().getTime() - new Date(mData.created_at).getTime()) / (1000 * 60 * 60 * 24))),
          endDate: mData.created_at
        });

        // Fetch ALL bets for trend graph
        const { data: allBets } = await supabase.from("bets").select("*").eq("market_id", marketId).order("created_at", { ascending: true });

        if (allBets && allBets.length > 0) {
          const dailyData = new Map<string, any>();
          // Approximate initial pool (10000 each) to match seed data logic, or start from 0 if you want actual. Since MVP mock seeds start at 10k:
          const currentPool = { yes: 10000, no: 10000 }; 

          allBets.forEach(bet => {
            const date = bet.created_at.split('T')[0];
            if (!dailyData.has(date)) {
              dailyData.set(date, { date });
            }
            if (bet.side === 'yes') currentPool.yes += bet.amount;
            else currentPool.no += bet.amount;

            const prob = Math.round((currentPool.yes / (currentPool.yes + currentPool.no)) * 100);
            dailyData.get(date)["YES"] = prob;
          });

          let lastKnown: Record<string, any> = {};
          const sortedDates = Array.from(dailyData.keys()).sort();
          const trend: TrendData[] = [];
          
          sortedDates.forEach(date => {
            const dayData = dailyData.get(date);
            const merged = { ...lastKnown, ...dayData };
            trend.push(merged as TrendData);
            lastKnown = { ...merged };
            delete lastKnown.date;
          });

          setTrendData(trend);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [marketId, supabase]);

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />;
  }

  if (!market) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-secondary)", background: "var(--bg-primary)" }}>
        마켓을 찾을 수 없습니다.
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const confirmBet = async () => {
    if (!betSide || !user || !userProfile) {
      showToast("로그인이 필요합니다.");
      return;
    }
    if (userProfile.points < betAmount) {
      showToast("포인트가 부족합니다.");
      return;
    }

    const newPoints = userProfile.points - betAmount;
    
    // Update local state immediately for UX
    setUserProfile({ ...userProfile, points: newPoints });
    setUserBet({ side: betSide, amount: betAmount });
    
    // Insert DB records
    await supabase.from("bets").insert({
      user_id: user.id,
      market_id: marketId,
      side: betSide,
      amount: betAmount
    });
    await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id);
    await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: -betAmount,
      type: "bet",
      description: `예측 참여 (${betSide.toUpperCase()})`
    });

    showToast(`🎯 ${betSide === "yes" ? "YES" : "NO"} ${betAmount}P 예측 참여 완료!`);
  };

  const handleShare = () => {
    const text = `[폴리캣] "${market.title}"\nYES ${market.yesProb}% / NO ${market.noProb}%\n지금 예측해보세요! 👉 policat.kr/market/${market.id}\n#폴리캣 #예측마켓`;
    navigator.clipboard?.writeText(text);
    showToast("📋 공유 링크가 복사됐습니다! (+3P)");
  };

  const catColor = market.category === 'economy' ? '#f59e0b' : market.category === 'politics' ? '#a78bfa' : '#22d3a0';

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80 }}>
      {userProfile ? (
        <Navbar points={userProfile.points} xp={userProfile.xp} streak={userProfile.streak} />
      ) : (
        <Navbar points={0} streak={0} />
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "90px 20px 60px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
          <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>마켓</Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ color: catColor }}>{market.categoryLabel}</span>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ color: "var(--text-primary)" }}>상세</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Left Column */}
          <div>
            {/* Market Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, marginBottom: 20 }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span className={`tag tag-${market.category}`}>{market.emoji} {market.categoryLabel}</span>
              </div>
              <h1 style={{ fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 800, lineHeight: 1.4, marginBottom: 12, color: "var(--text-primary)" }}>
                {market.title}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
                {market.description}
              </p>

              <div style={{
                display: "flex", gap: 20, flexWrap: "wrap",
                borderTop: "1px solid var(--border)", paddingTop: 16,
                color: "var(--text-secondary)", fontSize: 13, fontWeight: 600
              }}>
                <span>📅 기준 30일 ({market.daysLeft}일 남음)</span>
                <span>👥 {Math.floor(market.totalVolume / 100) + 1}명 참여</span>
                <span>💰 총 {(market.totalVolume / 1000).toFixed(0)}K P 누적</span>
              </div>
            </motion.div>

            {/* Probability + Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>📈 예측 현황</h2>
                <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700 }}>최근 30일 추이</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <span style={{ color: "var(--accent-yes)", fontWeight: 900, fontSize: 40 }}>{market.yesProb}</span>
                  <span style={{ color: "var(--accent-yes)", fontSize: 18 }}>%</span>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>YES (맞다)</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "var(--accent-no)", fontWeight: 900, fontSize: 40 }}>{market.noProb}</span>
                  <span style={{ color: "var(--accent-no)", fontSize: 18 }}>%</span>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>NO (아니다)</div>
                </div>
              </div>

              {/* Prob bar */}
              <div style={{ display: "flex", gap: 4, height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
                <motion.div
                  style={{ background: "var(--accent-yes)" }}
                  initial={{ flex: 0 }}
                  animate={{ flex: market.yesProb }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <motion.div
                  style={{ background: "var(--accent-no)" }}
                  initial={{ flex: 0 }}
                  animate={{ flex: market.noProb }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Trend Graph */}
              <div style={{ marginTop: 24 }}>
                <TrendGraph data={trendData} lines={[{ key: "YES", name: "YES 확률", color: "var(--accent-yes)" }]} height={200} hideAxis={false} />
              </div>
            </motion.div>

            {/* Comments */}
            <CommentSection marketId={marketId} currentUser={user} />
          </div>

          {/* Right Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Bet Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, position: "sticky", top: 82 }}
            >
              <h2 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: "var(--text-primary)" }}>🎯 예측 참여</h2>

              {userBet ? (
                <div style={{
                  textAlign: "center", padding: 24,
                  background: "var(--bg-secondary)",
                  borderRadius: 8, border: `1px solid ${userBet.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)"}`,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                  <p style={{ fontWeight: 800, color: userBet.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)" }}>
                    {userBet.side === "yes" ? "YES" : "NO"} 예측 완료!
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4, fontWeight: 600 }}>베팅금액: {userBet.amount}P</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                    {(["yes", "no"] as const).map(side => (
                      <motion.button
                        key={side}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBetSide(side)}
                        style={{
                          padding: "14px 8px", borderRadius: 8, fontWeight: 800,
                          fontSize: 15, cursor: "pointer", transition: "all 0.1s",
                          background: betSide === side
                            ? (side === "yes" ? "var(--accent-yes)" : "var(--accent-no)")
                            : "var(--bg-card-hover)",
                          color: betSide === side ? "white" : "var(--text-primary)",
                          border: betSide === side
                            ? "1px solid transparent"
                            : "1px solid var(--border)"
                        }}
                      >
                        {side === "yes" ? "📈 YES" : "📉 NO"}
                        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, opacity: betSide === side ? 0.9 : 0.6 }}>
                          {side === "yes" ? market.yesProb : market.noProb}%
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>베팅 포인트 설정</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[10, 50, 100, 200, 500].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          style={{
                            padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700,
                            cursor: "pointer", transition: "all 0.1s",
                            background: betAmount === amt ? "var(--purple-primary)" : "var(--bg-secondary)",
                            color: betAmount === amt ? "white" : "var(--text-secondary)",
                            border: betAmount === amt ? "none" : "1px solid var(--border)"
                          }}
                        >
                          {amt}P
                        </button>
                      ))}
                    </div>
                  </div>

                  {betSide && (
                    <div style={{
                      padding: 16, borderRadius: 8, marginBottom: 16,
                      background: "var(--bg-secondary)", border: "1px solid var(--border)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>적중 시 예상 수익</span>
                        <span style={{ color: "var(--accent-yes)", fontWeight: 800 }}>
                          +{Math.round(betAmount * (100 / (betSide === "yes" ? market.yesProb : market.noProb)) - betAmount)}P
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.button
                    className="btn-primary"
                    style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 8, opacity: betSide ? 1 : 0.5 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmBet}
                    disabled={!betSide}
                  >
                    {betSide ? `${betAmount}P 예측 확정` : "조건을 선택해주세요"}
                  </motion.button>
                </>
              )}

              <button
                onClick={handleShare}
                style={{
                  width: "100%", marginTop: 12,
                  background: "transparent", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "12px", color: "var(--text-secondary)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer"
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
                width: "100%", padding: "14px", borderRadius: 8,
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, cursor: "pointer"
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
            zIndex: 300, background: "var(--text-primary)",
            borderRadius: 8, padding: "14px 24px", color: "var(--bg-primary)", fontWeight: 700,
            fontSize: 15, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", whiteSpace: "nowrap"
          }}
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
