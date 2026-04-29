"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/Navbar";
import MarketCard from "@/components/MarketCard";
import { motion, AnimatePresence } from "framer-motion";
import { formatPoints } from "@/lib/data";

export default function EventPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);
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

      // Fetch Markets for this Event
      const { data: mkts } = await supabase.from("markets")
        .select("*")
        .eq("event_id", id)
        .in("status", ["active", "pending"])
        .order("created_at", { ascending: false });

      let userBets: any[] = [];
      if (user) {
        const { data: bets } = await supabase.from("bets").select("*").eq("user_id", user.id);
        userBets = bets || [];
      }

      if (mkts) {
        const enhancedMkts = mkts.map((m: any) => {
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
            endDate: m.created_at,
            description: m.description || "",
            totalVolume: total,
            participants: Math.floor(total / 100) + 1,
            daysLeft: Math.max(0, 7 - Math.floor((new Date().getTime() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24))),
            hot: total > 5000,
            new: new Date().getTime() - new Date(m.created_at).getTime() < 86400000 * 2,
            myBet: myBetRecord ? myBetRecord.side : null,
            myBetAmount: myBetRecord ? myBetRecord.amount : 0
          };
        });
        setMarkets(enhancedMkts);
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
      m.id === betModal.marketId ? { ...m, myBet: betModal.side, myBetAmount: betAmount } : m
    ));
    setBetModal(null);
    showToast(`🎯 예측 완료! ${betAmount}P 베팅`, "success");

    await supabase.from("bets").insert({ user_id: user.id, market_id: betModal.marketId, side: betModal.side, amount: betAmount });
    await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id);
    await supabase.from("point_transactions").insert({ user_id: user.id, amount: -betAmount, type: "bet", description: `예측 참여 (${betModal.side.toUpperCase()})` });
  };

  if (loading) return <div className="animated-bg" style={{ minHeight: "100vh" }} />;

  if (!event) return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={points} streak={0} xp={0} />
      <div style={{ textAlign: "center", paddingTop: 100, color: "var(--text-secondary)" }}>이벤트를 찾을 수 없습니다.</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar points={points} streak={0} xp={0} />

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 20px 40px" }}>
        <div style={{ marginBottom: 40, borderBottom: "1px solid var(--border)", paddingBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", color: "var(--purple-primary)", padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 800, marginBottom: 16 }}>
            🎉 다중 후보 이벤트
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 16, lineHeight: 1.2 }}>
            {event.title}
          </h1>
          {event.description && (
            <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 800, lineHeight: 1.6 }}>
              {event.description}
            </p>
          )}
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24 }}>후보별 마켓</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {markets.map((market, i) => (
            <MarketCard key={market.id} market={market} onBet={handleBet} userPoints={points} index={i} />
          ))}
          {markets.length === 0 && (
            <div style={{ color: "var(--text-muted)", padding: 40, textAlign: "center", gridColumn: "1 / -1" }}>
              등록된 마켓이 없습니다.
            </div>
          )}
        </div>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 201, width: "90%", maxWidth: 420, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>
                {betModal.side === "yes" ? "📈 YES 예측" : "📉 NO 예측"}
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
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 300, background: toast.type === "success" ? "linear-gradient(135deg, #059669, #22d3a0)" : toast.type === "warn" ? "linear-gradient(135deg, #be123c, #f43f5e)" : "linear-gradient(135deg, #8b5cf6, #ec4899)", borderRadius: 14, padding: "14px 24px", color: "white", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>{toast.msg}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
