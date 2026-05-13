"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LeaguePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar points={0} streak={0} />
      <div style={{
        maxWidth: 600, margin: "0 auto", padding: "120px 20px 60px",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
      }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🏆</div>
          <h1 style={{
            fontSize: 28, fontWeight: 900, color: "var(--text-primary)",
            marginBottom: 12, letterSpacing: "-0.02em"
          }}>
            예측 리그
          </h1>
          <div style={{
            display: "inline-block",
            background: "var(--accent-yes-soft)", color: "var(--accent-yes)",
            borderRadius: "var(--radius-pill)", padding: "6px 16px",
            fontSize: 13, fontWeight: 700, marginBottom: 24
          }}>
            준비 중
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            매주 최다 적중 예측러를 가리는 <strong>주간 리그</strong>와<br />
            카테고리별 전문가를 가리는 <strong>전문가 리그</strong>가<br />
            곧 오픈됩니다. 지금 포인트를 모아두세요!
          </p>

          <div style={{
            background: "var(--bg-card)", borderRadius: "var(--radius-lg)",
            padding: "24px 32px", marginBottom: 32,
            boxShadow: "var(--shadow-sm)", width: "100%"
          }}>
            <h2 style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)", marginBottom: 16 }}>
              예정 기능 미리보기
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
              {[
                { emoji: "⚡", label: "주간 예측 리그", desc: "매주 월~일 · 상위 10명 기프티콘 지급" },
                { emoji: "📊", label: "카테고리 전문가 리그", desc: "경제·정치·스포츠 분야별 랭킹" },
                { emoji: "🔥", label: "연속 적중 챌린지", desc: "최장 연속 적중 기록 도전" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/leaderboard" style={{ textDecoration: "none" }}>
              <button style={{
                background: "var(--text-primary)", color: "var(--bg-primary)",
                border: "none", borderRadius: "var(--radius-sm)",
                padding: "13px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>
                현재 랭킹 보기
              </button>
            </Link>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={{
                background: "var(--surface-alt)", color: "var(--text-primary)",
                border: "none", borderRadius: "var(--radius-sm)",
                padding: "13px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>
                마켓 참여하기
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
