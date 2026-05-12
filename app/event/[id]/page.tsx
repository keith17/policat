"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/Navbar";
import TrendGraph, { TrendData } from "@/components/TrendGraph";
import CommentSection from "@/components/CommentSection";
import { motion, AnimatePresence } from "framer-motion";
import { formatPoints } from "@/lib/data";

export default function EventPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [betModal, setBetModal] = useState<{ marketId: string; side: "yes" | "no" } | null>(null);
  const [betAmount, setBetAmount] = useState(50);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" | "warn" } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single();
        if (profile) setPoints(profile.points);
      }

      // Fetch Event
      const { data: evt } = await supabase.from("events").select("*").eq("id", id).single();
      if (evt) setEvent(evt);

      // Fetch Markets
      const { data: mkts } = await supabase.from("markets")
        .select("*")
        .eq("event_id", id)
        .in("status", ["active", "pending"])
        .order("created_at", { ascending: false });

      if (!mkts) {
        setLoading(false);
        return;
      }

      let userBets: any[] = [];
      if (user) {
        const { data: bets } = await supabase.from("bets").select("*").eq("user_id", user.id);
        userBets = bets || [];
      }

      const enhancedMkts = mkts.map((m: any) => {
        const total = m.yes_pool + m.no_pool;
        const yesProb = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50;
        const myBetRecord = userBets.find(b => b.market_id === m.id);

        return {
          ...m,
          yesProb,
          noProb: 100 - yesProb,
          totalVolume: total,
          myBet: myBetRecord ? myBetRecord.side : null,
          myBetAmount: myBetRecord ? myBetRecord.amount : 0
        };
      });
      // Sort by yesProb descending
      enhancedMkts.sort((a, b) => b.yesProb - a.yesProb);
      setMarkets(enhancedMkts);

      // Fetch ALL bets for trend graph
      const marketIds = mkts.map(m => m.id);
      const { data: allBets } = await supabase.from("bets").select("*").in("market_id", marketIds).order("created_at", { ascending: true });

      if (allBets && allBets.length > 0) {
        // Group bets by day and calculate cumulative probability
        const dailyData = new Map<string, any>();
        
        // Initial state for each market
        const currentPools: Record<string, { yes: number, no: number }> = {};
        mkts.forEach(m => {
          // Approximate initial pool assuming mock starts at 10000/something
          currentPools[m.id] = { yes: 10000, no: 10000 }; 
        });

        allBets.forEach(bet => {
          const date = bet.created_at.split('T')[0];
          if (!dailyData.has(date)) {
            dailyData.set(date, { date });
          }
          const pool = currentPools[bet.market_id];
          if (bet.side === 'yes') pool.yes += bet.amount;
          else pool.no += bet.amount;

          // Snapshot probability at the end of the day
          const market = mkts.find(m => m.id === bet.market_id);
          if (market) {
            const prob = Math.round((pool.yes / (pool.yes + pool.no)) * 100);
            dailyData.get(date)[market.title] = prob;
          }
        });

        // Fill missing days
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

      setLoading(false);
    }
    loadData();
  }, [id, supabase]);

  const showToast = (msg: string, type: "success" | "info" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBet = (marketId: string, side: "yes" | "no") => {
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
      showToast("포인트가 부족합니다!", "warn");
      return;
    }
    
    const newPoints = points - betAmount;
    setPoints(newPoints);
    setMarkets(prev => prev.map(m =>
      m.id === betModal.marketId ? { ...m, myBet: betModal.side, myBetAmount: betAmount, [betModal.side + "_pool"]: m[betModal.side + "_pool"] + betAmount, yesProb: Math.round(( (m.yes_pool + (betModal.side === 'yes' ? betAmount : 0)) / (m.yes_pool + m.no_pool + betAmount) ) * 100) } : m
    ));
    setBetModal(null);
    showToast(`🎯 예측 완료! ${betAmount}P 베팅`, "success");

    await supabase.from("bets").insert({ user_id: user.id, market_id: betModal.marketId, side: betModal.side, amount: betAmount });
    await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id);
    await supabase.from("point_transactions").insert({ user_id: user.id, amount: -betAmount, type: "bet", description: `예측 참여 (${betModal.side.toUpperCase()})` });
  };

  // Define colors for candidate lines
  const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#f43f5e"];
  const lines = markets.map((m, i) => ({
    key: m.title,
    name: m.title,
    color: colors[i % colors.length]
  }));

  if (loading) return <div className="animated-bg" style={{ minHeight: "100vh" }} />;

  if (!event) return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={points} streak={0} xp={0} />
      <div style={{ textAlign: "center", paddingTop: 100, color: "var(--text-secondary)" }}>이벤트를 찾을 수 없습니다.</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 100 }}>
      <Navbar points={points} streak={0} xp={0} />

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 20px 40px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", color: "var(--purple-primary)", padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 800, marginBottom: 16 }}>
            🎉 다중 후보 이벤트
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 16, lineHeight: 1.2 }}>
            {event.title}
          </h1>
          {event.description && (
            <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 800, lineHeight: 1.6 }}>
              {event.description}
            </p>
          )}
        </div>

        {/* Trend Graph */}
        <div style={{ marginBottom: 40, padding: 24, background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>📊 시간에 따른 당선 확률(YES) 추이</h2>
          <TrendGraph data={trendData} lines={lines} height={350} />
        </div>

        {/* Aggregated Candidate List */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>후보별 예측 참여</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {markets.map((m, i) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", padding: 20, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: "1 1 300px" }}>
                <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: "50%", background: colors[i % colors.length], color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{m.title}</h3>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>총 {m.totalVolume.toLocaleString()}P 참여</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: "1 1 260px", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: colors[i % colors.length] }}>{m.yesProb}%</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>당선 (YES)</div>
                </div>

                {m.myBet ? (
                  <div style={{ background: "var(--surface-alt)", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: "center", flex: 1, maxWidth: 200 }}>
                    ✓ {m.myBet === 'yes' ? '당선(YES)' : '낙선(NO)'} 예측 완료<br/>
                    <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 400 }}>{m.myBetAmount}P 참여</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, flex: 1, maxWidth: 220 }}>
                    <button onClick={() => handleBet(m.id, 'yes')} style={{ flex: 1, padding: "10px 12px", background: "var(--accent-yes-soft)", color: "var(--accent-yes)", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.background="var(--accent-yes)"} onMouseLeave={e=>e.currentTarget.style.background="var(--accent-yes-soft)"}>
                      YES
                    </button>
                    <button onClick={() => handleBet(m.id, 'no')} style={{ flex: 1, padding: "10px 12px", background: "var(--accent-no-soft)", color: "var(--accent-no)", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.background="var(--accent-no)"} onMouseLeave={e=>e.currentTarget.style.background="var(--accent-no-soft)"}>
                      NO
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comment Section */}
        <CommentSection eventId={id} currentUser={user} />
      </section>

      {/* Bet Modal */}
      <AnimatePresence>
        {betModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBetModal(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 200 }}
            />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 201, width: "calc(100% - 40px)", maxWidth: 420 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>
                {betModal.side === "yes" ? "📈 당선(YES) 예측" : "📉 낙선(NO) 예측"}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
                {markets.find(m => m.id === betModal.marketId)?.title}
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8, display: "block" }}>베팅 포인트 (보유: {formatPoints(points)})</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[10, 50, 100, 200, 500].map(amt => (
                    <button key={amt} onClick={() => setBetAmount(amt)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", background: betAmount === amt ? (betModal.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)") : "var(--bg-card-hover)", color: betAmount === amt ? "white" : "var(--text-secondary)", border: betAmount === amt ? "none" : "1px solid var(--border)" }}>{amt}P</button>
                  ))}
                </div>

                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text-secondary)", fontSize: 14 }}>베팅 금액</span><span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{betAmount}P</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-secondary)", fontSize: 14 }}>예상 수익 (적중 시)</span><span style={{ color: "var(--accent-yes)", fontWeight: 700 }}>+{Math.round(betAmount * (betModal.side === "yes" ? (100 / (markets.find(m => m.id === betModal.marketId)?.yesProb || 50)) : (100 / (markets.find(m => m.id === betModal.marketId)?.noProb || 50))) - betAmount)}P</span></div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setBetModal(null)} style={{ flex: 1, padding: "13px", borderRadius: 8, background: "var(--bg-card-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>취소</button>
                <motion.button onClick={confirmBet} whileTap={{ scale: 0.97 }} className={betModal.side === "yes" ? "btn-yes" : "btn-no"} style={{ flex: 2, padding: "13px", fontSize: 15, borderRadius: 8 }}>{betAmount}P 예측 확정</motion.button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 300, whiteSpace: "nowrap" }}>
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} style={{ background: toast.type === "success" ? "linear-gradient(135deg, #059669, #22d3a0)" : toast.type === "warn" ? "linear-gradient(135deg, #be123c, #f43f5e)" : "linear-gradient(135deg, #8b5cf6, #ec4899)", borderRadius: 14, padding: "14px 24px", color: "white", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>{toast.msg}</motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
