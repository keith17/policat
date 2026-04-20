"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints, getTier, tierConfig } from "@/lib/data";
import { motion } from "framer-motion";
import AdRewardModal from "@/components/AdRewardModal";
import { Play } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ad Reward State
  const [showAd, setShowAd] = useState(false);
  const [adsWatchedToday, setAdsWatchedToday] = useState(0);
  const AD_REWARD_AMOUNT = 500;
  const MAX_ADS_PER_DAY = 5;

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          setPoints(profile.points);
          // streak logic if needed
        }
        
        const { data: txs } = await supabase.from("point_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        if (txs) {
          setTransactions(txs);
          // Calculate how many ads watched today
          const today = new Date().toISOString().split('T')[0];
          const watchedTxs = txs.filter(tx => tx.type === 'ad_reward' && tx.created_at.startsWith(today));
          setAdsWatchedToday(watchedTxs.length);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const tier = getTier(points);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];

  const handleToggleAd = () => {
    if (adsWatchedToday >= MAX_ADS_PER_DAY) {
      alert("오늘의 무료 광고 시청 한도(5회)를 모두 소진하셨습니다. 내일 다시 시도해주세요!");
      return;
    }
    setShowAd(true);
  };

  const handleAdAcknowledge = async (isCompleted: boolean) => {
    setShowAd(false);
    if (!isCompleted) return;

    if (!user) return;
    const newPoints = points + AD_REWARD_AMOUNT;
    
    // DB 업데이트
    await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id);
    const { data: insertedTx } = await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: AD_REWARD_AMOUNT,
      type: 'ad_reward',
      description: '일일 광고 시청 리워드 보상'
    }).select().single();

    // 상태 업데이트
    setPoints(newPoints);
    setAdsWatchedToday(prev => prev + 1);
    if (insertedTx) {
      setTransactions(prev => [insertedTx, ...prev]);
    }
  };

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

        {/* Ad Reward Banner */}
        <section style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(244,63,94,0.1))",
          border: "1px solid var(--purple-primary)",
          borderRadius: 16, padding: "24px 32px", marginBottom: 32,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
              📺 무료 포인트 충전소 <span style={{ fontSize: 13, padding: "3px 8px", background: "var(--purple-primary)", color: "white", borderRadius: 12 }}>BETA</span>
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              포인트가 부족하신가요? 후원사 광고 시청 미션을 달성하고 <br/>즉시 <strong>{AD_REWARD_AMOUNT}P</strong>를 지급받으세요. (일일 한도: {MAX_ADS_PER_DAY}회)
            </p>
          </div>
          <button 
            onClick={handleToggleAd}
            disabled={adsWatchedToday >= MAX_ADS_PER_DAY}
            style={{ 
              padding: "16px 24px", borderRadius: 12, border: "none",
              background: adsWatchedToday >= MAX_ADS_PER_DAY ? "var(--bg-secondary)" : "var(--text-primary)", 
              color: adsWatchedToday >= MAX_ADS_PER_DAY ? "var(--text-muted)" : "var(--bg-primary)", 
              fontSize: 16, fontWeight: 800, cursor: adsWatchedToday >= MAX_ADS_PER_DAY ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 
            }}
          >
            {adsWatchedToday >= MAX_ADS_PER_DAY ? `오늘 한도 도달 (${adsWatchedToday}/${MAX_ADS_PER_DAY})` : <><Play size={18} /> 광고 보고 {AD_REWARD_AMOUNT}P 받기 ({adsWatchedToday}/${MAX_ADS_PER_DAY})</>}
          </button>
        </section>

        {/* Transactions Table */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>포인트 내역</h2>
        
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, overflow: "hidden"
        }}>
          {transactions.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: 15 }}>
              아직 내역이 없습니다. 첫 예측에 참여해 보세요!
            </div>
          ) : (
            transactions.map((tx, idx) => (
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
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{tx.description}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ 
                  fontSize: 15, fontWeight: 800, 
                  color: tx.amount < 0 ? "var(--accent-no)" : "var(--accent-yes)" 
                }}>
                  {tx.amount > 0 ? "+" : ""}{formatPoints(tx.amount)}P
                </div>
              </motion.div>
            ))
          )}
        </div>

      </main>

      {showAd && <AdRewardModal rewardAmount={AD_REWARD_AMOUNT} onAcknowledge={handleAdAcknowledge} />}
    </div>
  );
}
