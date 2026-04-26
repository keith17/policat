"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, XCircle, CheckCircle, Coins } from "lucide-react";

interface AdRewardModalProps {
  onAcknowledge: (isCompleted: boolean) => void;
  rewardAmount: number;
}

export default function AdRewardModal({ onAcknowledge, rewardAmount }: AdRewardModalProps) {
  const AD_DURATION = 5;
  const [timeLeft, setTimeLeft] = useState(AD_DURATION);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCompleted(true);
    }
  }, [timeLeft]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(20,20,26,0.75)", backdropFilter: "blur(6px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 20
        }}
      >
        {/* Close */}
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          {!completed && (
            <button
              onClick={() => onAcknowledge(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
            >
              <XCircle size={22} /> 닫기 (보상 취소)
            </button>
          )}
        </div>

        <motion.div
          initial={{ scale: 0.92, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-xl)", padding: 40,
            textAlign: "center", maxWidth: 400, width: "100%",
            boxShadow: "var(--shadow-xl)"
          }}
        >
          {!completed ? (
            <>
              <PlayCircle
                size={60}
                color="var(--accent)"
                style={{ margin: "0 auto 20px", display: "block", animation: "pulse 2s infinite" }}
              />
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>
                스폰서 메시지 시청 중…
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
                광고 시청 후 즉시 포인트가 지급됩니다.<br />
                가상 시뮬레이션입니다.
              </p>

              {/* Progress bar */}
              <div style={{ background: "var(--surface-alt)", borderRadius: "var(--radius-pill)", height: 8, overflow: "hidden", marginBottom: 12 }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${((AD_DURATION - timeLeft) / AD_DURATION) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                  style={{ background: "var(--accent)", height: "100%", borderRadius: "var(--radius-pill)" }}
                />
              </div>
              <div style={{
                fontSize: 14, fontWeight: 700, color: "var(--accent)",
                fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums"
              }}>
                {timeLeft}초 후 보상 지급
              </div>
            </>
          ) : (
            <>
              <CheckCircle
                size={60}
                color="var(--accent-yes)"
                style={{ margin: "0 auto 20px", display: "block" }}
              />
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--accent-yes)" }}>
                시청 완료!
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 15 }}>
                광고 시청 보상으로{" "}
                <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {rewardAmount.toLocaleString()}P
                </strong>
                가 지급됩니다.
              </p>
              <button
                onClick={() => onAcknowledge(true)}
                className="btn-primary"
                style={{ width: "100%", padding: "14px", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Coins size={20} /> 보상 획득하기
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
