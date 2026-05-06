"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Gift, BookOpen, Lightbulb } from "lucide-react";

interface Props {
  claimDaily: () => void;
  dailyClaimed: boolean;
}

export default function InternalBannerCarousel({ claimDaily, dailyClaimed }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = [
    {
      id: "checkin",
      title: "매일 출석체크하고 포인트 받기",
      desc: "매일 로그인하고 추가 포인트를 받아 예측에 참여하세요!",
      icon: <Gift size={24} color="var(--accent-yes)" />,
      bg: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)",
      borderColor: "var(--accent-yes-soft)",
      action: (
        <button
          onClick={claimDaily}
          style={{ background: dailyClaimed ? "var(--bg-card)" : "var(--accent-yes)", color: dailyClaimed ? "var(--text-muted)" : "white", padding: "8px 16px", border: dailyClaimed ? "1px solid var(--border)" : "none", borderRadius: 6, fontWeight: 700, cursor: dailyClaimed ? "default" : "pointer", whiteSpace: "nowrap" }}
        >
          {dailyClaimed ? "✅ 완료" : "출석체크"}
        </button>
      )
    },
    {
      id: "guide",
      title: "폴리캣 200% 활용 가이드",
      desc: "포인트는 어떻게 얻나요? 기프티콘은 어떻게 받나요?",
      icon: <BookOpen size={24} color="var(--purple-primary)" />,
      bg: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)",
      borderColor: "rgba(139,92,246,0.2)",
      action: (
        <Link href="/guide">
          <button style={{ background: "var(--purple-primary)", color: "white", padding: "8px 16px", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            가이드 보기
          </button>
        </Link>
      )
    },
    {
      id: "create",
      title: "나만의 예측 마켓 제안하기",
      desc: "사람들과 함께 예측해보고 싶은 재미있는 주제가 있나요?",
      icon: <Lightbulb size={24} color="var(--accent-gold)" />,
      bg: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)",
      borderColor: "rgba(245,158,11,0.2)",
      action: (
        <Link href="/create">
          <button style={{ background: "var(--bg-card)", color: "var(--text-primary)", padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 6, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            제안하러 가기
          </button>
        </Link>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 12, marginBottom: 40, border: `1px solid ${banners[currentIndex].borderColor}`, background: banners[currentIndex].bg, transition: "background 0.5s ease" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 90 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)", flexShrink: 0 }}>
              {banners[currentIndex].icon}
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                {banners[currentIndex].title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {banners[currentIndex].desc}
              </p>
            </div>
          </div>
          <div style={{ marginLeft: 16 }}>
            {banners[currentIndex].action}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
        {banners.map((_, idx) => (
          <div key={idx} style={{ 
            width: currentIndex === idx ? 16 : 6, height: 6, borderRadius: 3, 
            background: currentIndex === idx ? "var(--text-primary)" : "var(--text-muted)",
            transition: "all 0.3s", opacity: currentIndex === idx ? 0.6 : 0.3
          }} />
        ))}
      </div>
    </div>
  );
}
