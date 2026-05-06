"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatPoints } from "@/lib/data";

export default function EventCard({ event, index }: { event: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--purple-primary)",
        borderRadius: 16,
        padding: 24,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
      className="glass-card"
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "var(--purple-primary)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ background: "rgba(139,92,246,0.1)", color: "var(--purple-primary)", padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
            이벤트
          </span>
          <span style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
            다중 후보
          </span>
        </div>
        <span style={{ fontSize: 24 }}>🎉</span>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.4 }}>
        {event.title}
      </h3>
      
      {event.description && (
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.description}
        </p>
      )}

      {event.markets && event.markets.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, background: "var(--bg-secondary)", padding: 12, borderRadius: 8 }}>
          {event.markets.slice(0, 3).map((m: any, i: number) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{m.title}</span>
              </div>
              <span style={{ color: "var(--accent-yes)", fontWeight: 800 }}>{m.yesProb}%</span>
            </div>
          ))}
          {event.markets.length > 3 && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
              +{event.markets.length - 3}명 더보기
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {/* We could show total volume of all event markets here if we had it */}
          참여 가능
        </div>
        
        <Link href={`/event/${event.id}`} style={{ textDecoration: "none" }}>
          <button style={{
            background: "var(--purple-primary)", color: "white", border: "none",
            padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(139,92,246,0.3)"
          }}>
            이벤트 참여
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
