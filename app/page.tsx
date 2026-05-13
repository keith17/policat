"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import MarketCard from "@/components/MarketCard";
import EventCard from "@/components/EventCard";
import FeaturedCarousel, { FeaturedItem } from "@/components/FeaturedCarousel";
import InternalBannerCarousel from "@/components/InternalBannerCarousel";
import { AdBanner, AdInFeed } from "@/components/AdBanner";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { markets as initialMarkets, formatPoints, getTier, tierConfig } from "@/lib/data";

const CATEGORY_MAP: Record<string, { label: string; emoji: string }> = {
  economy:       { label: '경제',    emoji: '📈' },
  politics:      { label: '정치',    emoji: '🏛️' },
  society:       { label: '사회',    emoji: '🤝' },
  sports:        { label: '스포츠',  emoji: '⚽' },
  entertainment: { label: '연예',    emoji: '🎬' },
  tech:          { label: 'IT/기술', emoji: '💻' },
  international: { label: '국제',    emoji: '🌍' },
};

function getCategoryLabel(cat: string) { return CATEGORY_MAP[cat]?.label ?? cat; }
function getCategoryEmoji(cat: string) { return CATEGORY_MAP[cat]?.emoji ?? '📌'; }

export default function Home() {
  const [points, setPoints] = useState(500);
  const [xp, setXp] = useState(500);
  const [streak, setStreak] = useState(3);
  const [markets, setMarkets] = useState(initialMarkets);
  const [events, setEvents] = useState<any[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();
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
          setXp(profile.xp !== undefined ? profile.xp : profile.points);
          setStreak(profile.streak || 0);
        }
        // Check if daily claim already done today
        const today = new Date().toISOString().split('T')[0];
        const { data: dailyTxs } = await supabase.from("point_transactions").select("id").eq("user_id", currentUser.id).eq("type", "reward").like("description", "%출석 체크%").gte("created_at", today).limit(1);
        if (dailyTxs && dailyTxs.length > 0) setDailyClaimed(true);
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

  
  const fetchMarketsAndBets = useCallback(async (currentPage: number, currentFilter: string, reset: boolean = false) => {
    if (isLoading || (!hasMore && !reset)) return;
    setIsLoading(true);

    try {
      const now = new Date().toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      let query = supabase.from("markets").select("*").order("created_at", { ascending: false });
      
      if (currentFilter === "closed") {
        // 종료 필터: resolved_yes, resolved_no 이거나 (active 인데 end_date 지났을 때)
        query = query.or(`status.in.(resolved_yes,resolved_no),and(status.eq.active,end_date.lte.${now})`);
      } else {
        // 기본 필터: active 이거나 (resolved 이면서 7일 이내)
        query = query.or(`status.eq.active,and(status.in.(resolved_yes,resolved_no),resolved_at.gte.${sevenDaysAgo})`);
        if (currentFilter !== "all") {
          query = query.eq("category", currentFilter);
        }
      }

      // Pagination
      query = query.range(currentPage * 10, currentPage * 10 + 9);
      
      const { data: mkts } = await query;
      
      let userBets: any[] = [];
      if (user && mkts && mkts.length > 0) {
        const marketIds = mkts.map(m => m.id);
        const { data: bets } = await supabase.from("bets").select("*").eq("user_id", user.id).in("market_id", marketIds);
        userBets = bets || [];
      }

      let enhancedMkts: any[] = [];
      if (mkts && mkts.length > 0) {
        enhancedMkts = mkts.map((m: any) => {
           const total = m.yes_pool + m.no_pool;
           const yesProb = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50;
           const noProb = total > 0 ? 100 - yesProb : 50;
           
           const myBetRecords = userBets.filter(b => b.market_id === m.id);
           const myBetSummary = myBetRecords.length > 0 ? {
             side: myBetRecords[myBetRecords.length - 1].side, // latest bet side
             totalAmount: myBetRecords.reduce((sum: number, b: any) => sum + b.amount, 0),
             count: myBetRecords.length
           } : null;
           const endDateObj = new Date(m.end_date || m.created_at);
           
           let derivedStatus = m.status;
           if (m.status === "active" && new Date() >= endDateObj) {
             derivedStatus = "ended";
           }
           
           return {
             id: m.id,
             title: m.title,
             category: m.category,
             event_id: m.event_id,
             categoryLabel: getCategoryLabel(m.category),
             emoji: getCategoryEmoji(m.category),
             yesProb, noProb,
             yesAmount: m.yes_pool,
             noAmount: m.no_pool,
             endDate: m.end_date || m.created_at,
             description: m.description || "",
             totalVolume: total,
             participants: Math.floor(total / 100) + 1,
             daysLeft: Math.max(0, Math.ceil((endDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
             hot: total > 5000,
             new: new Date().getTime() - new Date(m.created_at).getTime() < 86400000 * 2,
             myBet: myBetSummary ? myBetSummary.side : null,
             myBetAmount: myBetSummary ? myBetSummary.totalAmount : 0,
             myBetCount: myBetSummary ? myBetSummary.count : 0,
             status: derivedStatus
           };
         });
         
         setMarkets(prev => reset ? enhancedMkts : [...prev, ...enhancedMkts]);
         if (mkts.length < 10) setHasMore(false);
      } else {
         if (reset) setMarkets([]);
         setHasMore(false);
      }

      // Fetch events only on first page
      if (reset) {
        const { data: evts } = await supabase.from("events").select("*").eq("status", "active").order("created_at", { ascending: false });
        let fItems: any[] = [];
        if (evts) {
          // Fetch all markets that belong to events for ranking/graph
          const eventIds = evts.map(e => e.id);
          const { data: eventMkts } = await supabase.from("markets").select("*").in("event_id", eventIds).eq("status", "active");
          
          const enrichedEvents = evts.map((e: any) => {
            const subMkts = (eventMkts || []).filter(m => m.event_id === e.id).map(m => {
              const total = m.yes_pool + m.no_pool;
              const yesProb = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50;
              return { ...m, yesProb, noProb: total > 0 ? 100 - yesProb : 50, totalVolume: total };
            }).sort((a, b) => b.yesProb - a.yesProb);
            return { ...e, markets: subMkts };
          });
          setEvents(enrichedEvents);
          fItems = [...enrichedEvents.filter(e => e.is_featured).map(e => ({
            id: e.id, type: 'event', title: e.title, description: e.description, emoji: '🎉', markets: e.markets
          }))];
        } else setEvents([]);
        
        // We can't fetch all featured markets easily with pagination, so we'll just fetch top 5 featured
        const { data: featMkts } = await supabase.from("markets").select("*").eq("is_featured", true).order("created_at", { ascending: false }).limit(5);
        if (featMkts) {
          fItems = [...fItems, ...featMkts.map((m:any) => {
            const total = m.yes_pool + m.no_pool;
            const yesProb = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50;
            const noProb = total > 0 ? 100 - yesProb : 50;
            return {
              id: m.id, type: 'market', title: m.title, description: m.description,
              emoji: getCategoryEmoji(m.category),
              yesProb, noProb, totalVolume: total
            };
          })];
        }
        setFeaturedItems(fItems);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase, hasMore, isLoading]);

  useEffect(() => {
    // Reset and fetch when filter changes or on mount
    setPage(0);
    setHasMore(true);
    fetchMarketsAndBets(0, filter, true);
  }, [filter, user, supabase]); // Do NOT include fetchMarketsAndBets as it will cause loop

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(p => p + 1);
      fetchMarketsAndBets(page + 1, filter, false);
    }
  }, [inView, hasMore, isLoading]);


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
    // DB-level dedup check
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from("point_transactions").select("id").eq("user_id", user.id).eq("type", "reward").like("description", "%출석 체크%").gte("created_at", today).limit(1);
    if (existing && existing.length > 0) {
      setDailyClaimed(true);
      showToast("이미 오늘 출석 체크를 완료했습니다.", "info");
      return;
    }
    const bonus = 5;
    const newPoints = points + bonus;
    const newXp = xp + bonus;

    setPoints(newPoints);
    setXp(newXp);
    setDailyClaimed(true);
    
    const newStreak = (streak || 0) + 1;
    setStreak(newStreak);
    await supabase.from("profiles").update({ points: newPoints, xp: newXp, streak: newStreak }).eq("id", user.id);
    await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: bonus,
      type: "reward",
      description: "출석 체크 보상"
    });

    showToast(`🌅 출석 체크 완료! +${bonus}P`, "success");
  };

  const filteredMarkets = markets; // Filtering is handled in DB query now

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar points={points} xp={xp} streak={streak} />

      {/* Featured Carousel (Moved to Top) */}
      <div style={{ paddingTop: 80, paddingBottom: 20 }}>
        {featuredItems.length > 0 && (
          <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
            <FeaturedCarousel items={featuredItems} />
          </section>
        )}
      </div>

      {/* Internal Event Banners */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <InternalBannerCarousel claimDaily={claimDaily} dailyClaimed={dailyClaimed} />
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
            {filter === "closed" ? "📋 종료된 마켓" : "🔥 진행 중인 마켓"}
          </h2>
          {[
            { key: "all",           label: "전체" },
            { key: "politics",      label: "🏛️ 정치" },
            { key: "economy",       label: "📈 경제" },
            { key: "society",       label: "🤝 사회" },
            { key: "sports",        label: "⚽ 스포츠" },
            { key: "entertainment", label: "🎬 연예" },
            { key: "tech",          label: "💻 IT/기술" },
            { key: "international", label: "🌍 국제" },
            { key: "closed",        label: "📋 종료됨" },
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
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))" }}>
          {(() => {
            const gridItems = [
              ...(filter === "all" ? events.map((e, i) => ({ type: "event", data: e, index: i })) : []),
              ...filteredMarkets.map((m, i) => ({ type: "market", data: m, index: i }))
            ];

            return gridItems.map((item, globalIndex) => {
              // 6번째 아이템마다 인피드 광고 삽입 (전체 너비)
              const showInFeed = globalIndex > 0 && globalIndex % 6 === 0;

              return (
                <div key={`grid-item-${globalIndex}`} style={{ display: "contents" }}>
                  {showInFeed && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <AdInFeed />
                    </div>
                  )}
                  {item.type === "event" ? (
                    <EventCard event={item.data} index={item.index} />
                  ) : (
                    <MarketCard
                      market={item.data}
                      onBet={handleBet}
                      userPoints={points}
                      index={item.index + (filter === "all" ? events.length : 0)}
                      userId={user?.id}
                    />
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* Closed Markets CTA */}
        {filter !== "closed" && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              onClick={() => setFilter("closed")}
              style={{
                padding: "14px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                color: "var(--text-secondary)", cursor: "pointer"
              }}
            >
              📋 종료된 지난 마켓 전체보기 →
            </button>
          </div>
        )}

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
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 201, width: "calc(100% - 40px)", maxWidth: 420 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
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
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 300, whiteSpace: "nowrap" }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              style={{
                background: toast.type === "success"
                  ? "linear-gradient(135deg, #059669, #22d3a0)"
                  : toast.type === "warn"
                    ? "linear-gradient(135deg, #be123c, #f43f5e)"
                    : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                borderRadius: 14, padding: "14px 24px",
                color: "white", fontWeight: 700, fontSize: 15,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
              }}
            >
              {toast.msg}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
