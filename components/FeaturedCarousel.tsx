"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
};

export default function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

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
          style={{ padding: "40px 32px", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "center" }}
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
