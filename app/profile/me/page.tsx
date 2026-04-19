"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints, getTier, tierConfig } from "@/lib/data";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(12500); // 12,500 for demo

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase]);

  const tier = getTier(points);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];

  const transactions = [
    { id: 1, date: "2026-04-18", desc: "코스피 예측 적중 배당금 (YES)", amount: "+8,200P", type: "reward" },
    { id: 2, date: "2026-04-17", desc: "광고 시청 보상", amount: "+500P", type: "earn" },
    { id: 3, date: "2026-04-15", desc: "한국은행 기준금리 예측 참여 (NO)", amount: "-2,000P", type: "bet" },
    { id: 4, date: "2026-04-10", desc: "신규 가입 환영 포인트", amount: "+5,800P", type: "earn" },
  ];

  if (!user) {
    return (
      <div className="animated-bg" style={{ minHeight: "100vh", paddingBottom: 80 }}>
        <Navbar points={0} streak={0} />
        <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 40px", textAlign: "center" }}>
          <div>로딩 중이거나 로그인이 필요합니다.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* Passing points and streak props; these will pull from real DB eventually */}
      <Navbar points={points} streak={12} />
      
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 40px" }}>
        
        {/* Profile Header */}
        <section style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "32px", marginBottom: 32,
          display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap"
        }}>
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid var(--border)" }} 
            />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg-card-hover)" }} />
          )}
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              {user.user_metadata?.full_name || user.email}
            </h1>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
              {user.email}
            </div>
          </div>

          <div style={{ textAlign: "right", background: "var(--bg-secondary)", padding: "16px 24px", borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>보유 포인트</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--purple-primary)" }}>
              {formatPoints(points)}
            </div>
            <div style={{ fontSize: 12, color: tierInfo.color, fontWeight: 700, marginTop: 4 }}>
              {tierInfo.emoji} {tierInfo.label} 티어
            </div>
          </div>
        </section>

        {/* Transactions Table */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>포인트 내역</h2>
        
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, overflow: "hidden"
        }}>
          {transactions.map((tx, idx) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px", borderBottom: idx === transactions.length - 1 ? "none" : "1px solid var(--border)",
                background: "transparent"
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{tx.desc}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{tx.date}</div>
              </div>
              <div style={{ 
                fontSize: 15, fontWeight: 800, 
                color: tx.type === "bet" ? "var(--accent-no)" : "var(--accent-yes)" 
              }}>
                {tx.amount}
              </div>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
}
