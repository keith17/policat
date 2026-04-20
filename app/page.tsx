"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MarketCard from "@/components/MarketCard";
import { AdBanner } from "@/components/AdBanner";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { markets as initialMarkets, formatPoints, getTier, tierConfig } from "@/lib/data";

export default function Home() {
  const [points, setPoints] = useState(500);
  const [xp, setXp] = useState(500);
  const [streak, setStreak] = useState(3);
  const [markets, setMarkets] = useState(initialMarkets);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" | "warn" } | null>(null);
  const [betModal, setBetModal] = useState<{ marketId: string; side: "yes" | "no" } | null>(null);
  const [betAmount, setBetAmount] = useState(50);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile(currentUser: any) {
      if (currentUser) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
        if (profile) {
          setPoints(profile.points);
          setXp(profile.xp !== undefined ? profile.xp : profile.points); // fallback if SQL not run yet
          setStreak(profile.streak || 0);
        }
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      loadProfile(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    async function fetchMarketsAndBets() {
      const { data: mkts } = await supabase.from("markets")
        .select("*")
        .in("status", ["active", "pending"])
        .order("created_at", { ascending: false });
      
      let userBets: any[] = [];
      if (user) {
        const { data: bets } = await supabase.from("bets").select("*").eq("user_id", user.id);
        userBets = bets || [];
      }

      if (mkts) {
        let enhancedMkts = mkts.map((m: any) => {
           const total = m.yes_pool + m.no_pool;
           const yesProb = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50;
           const noProb = total > 0 ? 100 - yesProb : 50;
           
           const myBetRecord = userBets.find(b => b.market_id === m.id);
           
           return {
             id: m.id,
             title: m.title,
             category: m.category,
             categoryLabel: m.category === 'economy' ? '경제' : m.category === 'politics' ? '정치' : m.category === 'society' ? '사회' : '스포츠',
             emoji: m.category === 'economy' ? '📈' : m.category === 'politics' ? '🏛️' : m.category === 'society' ? '🤝' : '⚽',
             yesProb, noProb,
             yesAmount: m.yes_pool,
             noAmount: m.no_pool,
             endDate: m.created_at, // Using created_at for endDate as fallback
             description: m.description || "",
             totalVolume: total,
             participants: Math.floor(total / 100) + 1, // mock count
             daysLeft: Math.max(0, 7 - Math.floor((new Date().getTime() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24))),
             hot: total > 5000,
             new: new Date().getTime() - new Date(m.created_at).getTime() < 86400000 * 2,
             myBet: myBetRecord ? myBetRecord.side : null,
             myBetAmount: myBetRecord ? myBetRecord.amount : 0
           };
        });
        setMarkets(enhancedMkts);
      } else {
        setMarkets([]);
      }
    }
    fetchMarketsAndBets();
  }, [user, supabase]);

  const tier = getTier(xp);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];

  const showToast = (msg: string, type: "success" | "info" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBet = (marketId: string, side: "yes" | "no", amount: number) => {
    if (!user) {
      showToast("예측에 참여하려면 로그인이 필요합니다.", "warn");
      return;
    }
    setBetModal({ marketId, side });
    setBetAmount(50);
  };

  const confirmBet = async () => {
    if (!betModal || !user) return;
    if (points < betAmount) {
      showToast("포인트가 부족합니다! [포인트 획득] 메뉴에서 광고를 시청하세요.", "warn");
      return;
    }
    const newPoints = points - betAmount;
    setPoints(newPoints);
    setMarkets(prev => prev.map(m =>
      m.id === betModal.marketId ? { ...m, myBet: betModal.side, myBetAmount: betAmount } : m
    ));
    setBetModal(null);
    showToast(`🎯 예측 완료! ${betAmount}P 베팅`, "success");

    // Supabase Insert & Update
    await supabase.from("bets").insert({
      user_id: user.id,
      market_id: betModal.marketId,
      side: betModal.side,
      amount: betAmount
    });
    
    // Update Profile points
    await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id);
    
    // Log transaction
    await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: -betAmount,
      type: "bet",
      description: `예측 참여 (${betModal.side.toUpperCase()})`
    });

    // NOTE: Market pools should ideally be updated via a Postgres Trigger or Edge Function to bypass normal user RLS.
  };

  const claimDaily = async () => {
    if (dailyClaimed || !user) return;
    const bonus = 5 + streak * 5;
    const newPoints = points + bonus;
    const newXp = xp + bonus;

    setPoints(newPoints);
    setXp(newXp);
    setDailyClaimed(true);
    
    await supabase.from("profiles").update({ points: newPoints, xp: newXp }).eq("id", user.id);
    await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: bonus,
      type: "reward",
      description: "출석 체크 보상"
    });
    
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
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar points={points} xp={xp} streak={streak} />

      {/* Hero Section */}
      <section style={{
        paddingTop: 100, paddingBottom: 40, paddingLeft: 20, paddingRight: 20,
        maxWidth: 1200, margin: "0 auto"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 32 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: 600 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 4, padding: "6px 12px", marginBottom: 24
            }}>
              <span className="pulse-dot" style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--accent-yes)", display: "inline-block"
              }} />
              <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>
                실시간 예측 마켓 운영 중
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
              세상의 모든 이슈,<br />
              당신의 예측이<br />
              가치가 됩니다
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.6, marginBottom: 32 }}>
              광고 포인트로 예측에 참여하고, 적중하면 기프티콘으로 교환하세요.<br/>
              가입비·결제 없이 누구나 참여할 수 있습니다.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                style={{ background: "var(--purple-primary)", color: "white", padding: "14px 28px", fontSize: 16, minWidth: 160, border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={claimDaily}
              >
                {dailyClaimed ? "✅ 출석 완료" : "🌅 출석 체크 +P"}
              </motion.button>
              <Link href="/guide" style={{ textDecoration: "none" }}>
                <motion.button
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6, padding: "14px 28px",
                    color: "var(--text-primary)", fontSize: 16, fontWeight: 700, cursor: "pointer",
                    minWidth: 160
                  }}
                  whileHover={{ scale: 1.02, background: "var(--bg-card-hover)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  📖 이용 가이드 읽기
                </motion.button>
              </Link>
            </div>
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
              <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>{s.value}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{s.label}</div>
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
          <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", marginRight: 8 }}>
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
                padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.1s",
                background: filter === key
                  ? "var(--purple-primary)"
                  : "var(--bg-card)",
                color: filter === key ? "white" : "var(--text-secondary)",
                border: filter === key ? "1px solid var(--purple-primary)" : "1px solid var(--border)"
              }}
            >
              {label}
            </motion.button>
          ))}

          <div style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 13 }}>
            내 포인트: <span style={{ color: "var(--purple-primary)", fontWeight: 700 }}>{formatPoints(points)}</span>
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
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12, padding: 28,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>
                {betModal.side === "yes" ? "📈 YES 예측" : "📉 NO 예측"}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
                {markets.find(m => m.id === betModal.marketId)?.title}
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8, display: "block" }}>
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
                          ? (betModal.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)")
                          : "var(--bg-card-hover)",
                        color: betAmount === amt ? "white" : "var(--text-secondary)",
                        border: betAmount === amt ? "none" : "1px solid var(--border)"
                      }}
                    >
                      {amt}P
                    </button>
                  ))}
                </div>

                <div style={{
                  marginTop: 16, padding: 16, borderRadius: 8,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>베팅 금액</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{betAmount}P</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>예상 수익 (적중 시)</span>
                    <span style={{ color: "var(--accent-yes)", fontWeight: 700 }}>
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
                    flex: 1, padding: "13px", borderRadius: 8,
                    background: "var(--bg-card-hover)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)", fontSize: 15, fontWeight: 600, cursor: "pointer"
                  }}
                >취소</button>
                <motion.button
                  onClick={confirmBet}
                  whileTap={{ scale: 0.97 }}
                  className={betModal.side === "yes" ? "btn-yes" : "btn-no"}
                  style={{ flex: 2, padding: "13px", fontSize: 15, borderRadius: 8 }}
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
