"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-primary)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 20px", textAlign: "center"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 400 }}
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>🐱</div>
        <h1 style={{
          fontSize: 28, fontWeight: 900, color: "var(--text-primary)",
          marginBottom: 12, letterSpacing: "-0.02em"
        }}>
          페이지를 찾을 수 없어요
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          요청하신 페이지가 없거나 이동되었습니다.
        </p>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{
            background: "var(--text-primary)", color: "var(--bg-primary)",
            border: "none", borderRadius: "var(--radius-sm)",
            padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer"
          }}>
            홈으로 돌아가기
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
