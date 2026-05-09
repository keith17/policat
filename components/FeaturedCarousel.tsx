"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import TrendGraph, { TrendData } from "@/components/TrendGraph";
import { createClient } from "@/utils/supabase/client";

export type FeaturedItem = {
  id: string;
  type: 'event' | 'market';
  title: string;
  description?: string;
  categoryLabel?: string;
  emoji?: string;
  yesProb?: number;
  noProb?: number;
  totalVolume?: number;
  markets?: any[]; // for events
};

export default function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trendData, setTrendData] = useState<Record<string, TrendData[]>>({});
  const supabase = createClient();

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  // Fetch trend data for the current item
  useEffect(() => {
    const fetchTrend = async () => {
      if (!items || items.length === 0) return;
      const current = items[currentIndex];
      if (trendData[current.id]) return; // Already fetched

      let marketIds: any[] = [];
      let mktsWithTitles: any[] = [];
      if (current.type === 'market') {
        marketIds = [current.id];
      } else {
        const { data: mkts } = await supabase.from('markets').select('id, title').eq('event_id', current.id);
        if (mkts) {
          marketIds = mkts.map(m => m.id);
          mktsWithTitles = mkts;
        }
      }

      if (marketIds.length > 0) {
        const { data: allBets } = await supabase.from('bets').select('*').in('market_id', marketIds).order('created_at', { ascending: true });
        if (allBets && allBets.length > 0) {
          const dailyData = new Map<string, any>();
          const currentPools: Record<string, { yes: number, no: number }> = {};
          
          if (current.type === 'market') {
            currentPools[current.id] = { yes: 10000, no: 10000 };
          } else {
            mktsWithTitles.forEach(m => currentPools[m.id] = { yes: 10000, no: 10000 });
          }

          allBets.forEach(bet => {
            const date = bet.created_at.split('T')[0];
            if (!dailyData.has(date)) dailyData.set(date, { date });
            
            const pool = currentPools[bet.market_id];
            if (pool) {
              if (bet.side === 'yes') pool.yes += bet.amount;
              else pool.no += bet.amount;
              const prob = Math.round((pool.yes / (pool.yes + pool.no)) * 100);
              
              if (current.type === 'market') {
                dailyData.get(date)["YES"] = prob;
              } else {
                const marketTitle = mktsWithTitles.find(m => m.id === bet.market_id)?.title;
                if (marketTitle) {
                  dailyData.get(date)[marketTitle] = prob;
                }
              }
            }
          });

          let lastKnown: Record<string, any> = {};
          const trend: TrendData[] = [];
          Array.from(dailyData.keys()).sort().forEach(date => {
            const merged = { ...lastKnown, ...dailyData.get(date) };
            trend.push(merged as TrendData);
            lastKnown = { ...merged };
            delete lastKnown.date;
          });

          setTrendData(prev => ({ ...prev, [current.id]: trend }));
        }
      }
    };
    fetchTrend();
  }, [currentIndex, items, supabase, trendData]);

  if (!items || items.length === 0) return null;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  const currentItem = items[currentIndex];
  
  const isEvent = currentItem.type === 'event';
  const linkHref = isEvent ? `/event/${currentItem.id}` : `/?market=${currentItem.id}`; // Optional: scroll to market if market

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 16, marginBottom: 40, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          style={{ padding: "32px 24px 64px 24px", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "center" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ 
              background: isEvent ? "var(--purple-primary)" : "var(--accent-yes)", 
              color: "white", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 800 
            }}>
              {isEvent ? "🔥 추천 이벤트" : "🔥 주요 마켓"}
            </span>
            {currentItem.emoji && <span style={{ fontSize: 18 }}>{currentItem.emoji}</span>}
          </div>
          
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.3 }}>
            {currentItem.title}
          </h2>
          
          {currentItem.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 24, maxWidth: "80%", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {currentItem.description}
            </p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              {!isEvent && currentItem.yesProb !== undefined && (
                <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-yes)" }}>
                    YES {currentItem.yesProb}%
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-no)" }}>
                    NO {currentItem.noProb}%
                  </div>
                </div>
              )}

              {isEvent && currentItem.markets && currentItem.markets.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {currentItem.markets.slice(0, 3).map((m: any, i: number) => {
                    const color = ["#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#f43f5e"][i%6];
                    return (
                      <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, background: "rgba(0,0,0,0.05)", padding: "10px 14px", borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 18, height: 18, borderRadius: "50%", background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{i + 1}</span>
                            <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{m.title}</span>
                          </div>
                          <span style={{ color: color, fontWeight: 900 }}>{m.yesProb}%</span>
                        </div>
                        <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${m.yesProb}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <Link href={linkHref} style={{ textDecoration: "none" }}>
                  <button style={{ 
                    padding: "12px 24px", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
                    background: "var(--text-primary)", color: "var(--bg-primary)", border: "none"
                  }}>
                    {isEvent ? "이벤트 보기" : "예측 참여하기"}
                  </button>
                </Link>
              </div>
            </div>

            {/* Mini Trend Graph */}
            {trendData[currentItem.id] && (
              <div style={{ flex: 1, height: 120, minWidth: 200, opacity: 0.8, pointerEvents: "none" }} className="hidden-mobile">
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <TrendingUp size={12} /> 실시간 추이
                </div>
                <TrendGraph 
                  data={trendData[currentItem.id]} 
                  lines={
                    isEvent && currentItem.markets
                      ? currentItem.markets.map((m: any, i: number) => ({ key: m.title, name: m.title, color: ["#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#f43f5e"][i%6] }))
                      : [{ key: "YES", name: "YES", color: "var(--accent-yes)" }]
                  } 
                  height={100} 
                  hideAxis={true} 
                />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {items.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, right: 24, display: "flex", gap: 8 }}>
          <button onClick={handlePrev} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleNext} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Progress Dots */}
      {items.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, left: 32, display: "flex", gap: 6 }}>
          {items.map((_, idx) => (
            <div key={idx} style={{ 
              width: currentIndex === idx ? 24 : 8, height: 8, borderRadius: 4, 
              background: currentIndex === idx ? "var(--purple-primary)" : "var(--border)",
              transition: "all 0.3s"
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
