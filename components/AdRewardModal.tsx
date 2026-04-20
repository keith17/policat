"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, XCircle, CheckCircle, Coins } from "lucide-react";

interface AdRewardModalProps {
  onAcknowledge: (isCompleted: boolean) => void;
  rewardAmount: number;
}

export default function AdRewardModal({ onAcknowledge, rewardAmount }: AdRewardModalProps) {
  const AD_DURATION = 5; // 5 seconds dummy ad
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
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 20
        }}
      >
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          {!completed && (
            <button 
              onClick={() => onAcknowledge(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <XCircle size={24} /> 닫기 (보상 획득 취소)
            </button>
          )}
        </div>

        <motion.div 
          initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          style={{
            background: "var(--bg-primary)", border: "1px solid var(--border)",
            borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 400, width: "100%"
          }}
        >
          {!completed ? (
            <>
              <PlayCircle size={64} color="var(--purple-primary)" style={{ margin: "0 auto 20px", animation: "pulse 2s infinite" }} />
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>스폰서 메시지 시청 중...</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
                애드센스/리워드 비디오 광고가 송출될 자리입니다.<br/>
                가상 광고 시뮬레이션입니다.
              </p>
              
              <div style={{ background: "var(--bg-secondary)", borderRadius: 100, height: 12, overflow: "hidden", marginBottom: 16 }}>
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: `${((AD_DURATION - timeLeft) / AD_DURATION) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                  style={{ background: "var(--purple-primary)", height: "100%" }}
                />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--purple-primary)" }}>
                {timeLeft}초 후 보상 지급
              </div>
            </>
          ) : (
            <>
              <CheckCircle size={64} color="var(--accent-yes)" style={{ margin: "0 auto 20px" }} />
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: "var(--accent-yes)" }}>시청 완료!</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                광고 시청 보상으로 <strong style={{ color: "var(--text-primary)" }}>{rewardAmount.toLocaleString()}P</strong>가 지급됩니다.
              </p>
              <button 
                onClick={() => onAcknowledge(true)}
                style={{
                  width: "100%", padding: "16px", borderRadius: 12, border: "none",
                  background: "var(--purple-primary)", color: "white", fontSize: 16, fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
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
