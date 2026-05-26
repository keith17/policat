"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function EventCard({ event, index }: { event: any, index: number }) {
  const marketCount = event.markets?.length || 0;

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      style={{
        padding: 20,
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      {/* Header badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span className="tag" style={{ background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 700 }}>
          📊 이벤트
        </span>

        <span style={{
          marginLeft: "auto", color: "var(--text-muted)", fontSize: 12,
          display: "flex", alignItems: "center", gap: 4,
          fontFamily: "var(--font-mono)"
        }}>
          ⏰ 참여 가능
        </span>
      </div>

      {/* Title */}
      <Link href={`/event/${event.slug || event.id}`} style={{ textDecoration: "none" }}>
        <h3
          style={{
            fontSize: 16, fontWeight: 600, color: "var(--text-primary)",
            marginBottom: 16, lineHeight: 1.5,
            transition: "color 0.15s"
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-primary)")}
        >
          {event.title}
        </h3>
      </Link>

      {/* Candidate list */}
      {marketCount > 0 && (
        <div style={{
          borderTop: "1px solid var(--border)", paddingTop: 12, marginBottom: 16,
          display: "flex", flexDirection: "column", gap: 10
        }}>
          {event.markets.slice(0, 3).map((m: any, i: number) => (
            <div key={m.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{
                    color: "var(--text-muted)", fontSize: 11, fontWeight: 600,
                    fontFamily: "var(--font-mono)", minWidth: 14, textAlign: "right"
                  }}>{i + 1}</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.short_title || m.title}
                  </span>
                </div>
                <span style={{
                  color: i === 0 ? "var(--accent-yes)" : "var(--text-muted)", fontWeight: 700, fontSize: 14,
                  fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 8
                }}>{m.yesProb}%</span>
              </div>
              <div style={{ height: 4, background: "var(--surface-alt)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.yesProb}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.06 + 0.3 }}
                  style={{ height: "100%", background: i === 0 ? "var(--accent-yes)" : "var(--border)", borderRadius: 2 }}
                />
              </div>
            </div>
          ))}
          {marketCount > 3 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
              +{marketCount - 3}개 더
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: "1px solid var(--border)", paddingTop: 12,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          👥 {marketCount}개 마켓
        </span>
        <Link href={`/event/${event.slug || event.id}`} style={{ textDecoration: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>
          자세히 보기 →
        </Link>
      </div>
    </motion.div>
  );
}
