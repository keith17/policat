"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
        <div style={{ fontSize: 72, marginBottom: 16 }}>😿</div>
        <h1 style={{
          fontSize: 28, fontWeight: 900, color: "var(--text-primary)",
          marginBottom: 12, letterSpacing: "-0.02em"
        }}>
          오류가 발생했어요
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          일시적인 문제가 발생했습니다. 다시 시도해 주세요.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              background: "var(--text-primary)", color: "var(--bg-primary)",
              border: "none", borderRadius: "var(--radius-sm)",
              padding: "13px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}
          >
            다시 시도
          </button>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{
              background: "var(--surface-alt)", color: "var(--text-primary)",
              border: "none", borderRadius: "var(--radius-sm)",
              padding: "13px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>
              홈으로
            </button>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
