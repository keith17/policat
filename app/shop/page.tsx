"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Coffee, Gift, Tag, CheckCircle } from "lucide-react";

export default function ShopPage() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyModal, setBuyModal] = useState<any>(null);
  const [contactInfo, setContactInfo] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "warn" } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          setPoints(profile.points);
          setXp(profile.xp !== undefined ? profile.xp : profile.points);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const showToast = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const shopItems = [
    { id: "coffee-1", name: "스타벅스 아이스 아메리카노 T", price: 4500, icon: <Coffee size={40} color="var(--purple-primary)" />, category: "음료/디저트", desc: "전국 스타벅스 매장에서 사용 가능한 기프티콘" },
    { id: "naver-5000", name: "네이버페이 포인트 5,000원권", price: 5000, icon: <Gift size={40} color="#15c559" />, category: "상품권", desc: "네이버페이 결제 시 사용 가능한 포인트 쿠폰" },
    { id: "gs25-3000", name: "GS25 모바일 상품권 3,000원권", price: 3000, icon: <Tag size={40} color="#0072bb" />, category: "편의점", desc: "전국 GS25 편의점에서 현금처럼 사용 가능" },
    { id: "baemin-10000", name: "배달의민족 상품권 10,000원권", price: 10000, icon: <Gift size={40} color="#2ac1bc" />, category: "배달/외식", desc: "배민 앱에서 배달/포장 주문 시 사용 가능" },
  ];

  const handleBuy = async () => {
    if (!buyModal || !user) return;
    
    if (points < buyModal.price) {
      showToast("보유 포인트가 부족합니다.", "warn");
      setBuyModal(null);
      return;
    }

    if (xp < 500) {
      showToast("교환 신청은 분석가 등급(XP 500) 이상부터 가능합니다. 마켓 예측이나 미션으로 경험치를 먼저 모아주세요!", "warn");
      setBuyModal(null);
      return;
    }

    if (!contactInfo.trim()) {
      showToast("쿠폰을 수신할 연락처/이메일을 입력해주세요.", "warn");
      return;
    }

    const newPoints = points - buyModal.price;
    // XP는 차감하지 않고 그대로 유지!
    await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id);
    
    // shop_orders에 삽입
    await supabase.from("shop_orders").insert({
      user_id: user.id,
      item_id: buyModal.id,
      item_name: buyModal.name,
      price: buyModal.price,
      contact_info: contactInfo,
      status: "pending"
    });
    await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: -buyModal.price,
      type: "shop_purchase",
      description: `포인트 상점 교환: ${buyModal.name}`
    });

    setPoints(newPoints);
    setBuyModal(null);
    setContactInfo("");
    showToast(`✅ ${buyModal.name} 교환이 신청되었습니다. (관리자 확인 후 발송)`, "success");
  };

  if (!user && !loading) {
    return (
      <div className="animated-bg" style={{ minHeight: "100vh", paddingBottom: 80 }}>
        <Navbar points={0} xp={0} streak={0} />
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 20px 40px", textAlign: "center" }}>
          <div>상점을 이용하려면 로그인이 필요합니다.</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80, background: "var(--bg-primary)" }}>
      {user && <Navbar points={points} xp={xp} streak={12} />}
      
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 20px 40px" }}>
        
        {/* Header */}
        <section style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>포인트 상점</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6 }}>
            예측 성공과 미션을 통해 모은 포인트로<br/>진짜 현실의 아이템을 교환하세요!
          </p>
        </section>

        {/* User Balance */}
        {user && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl mb-10 gap-4">
            <div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>현재 교환 가능한 잔여 포인트</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "var(--purple-primary)" }}>{formatPoints(points)}</div>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>💡 안심하세요!</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>상점을 이용해 포인트가 차감되어도<br/>티어(경험치)는 절대 강등되지 않습니다.</div>
            </div>
          </div>
        )}

        {/* Shop Grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
          {shopItems.map(item => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -5 }}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column"
              }}
            >
              <div style={{ height: 160, background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div whileHover={{ scale: 1.1 }}>{item.icon}</motion.div>
              </div>
              <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 8 }}>{item.category}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.4 }}>{item.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24, flex: 1 }}>{item.desc}</p>
                
                <button 
                  onClick={() => setBuyModal(item)}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 6, border: "1px solid var(--border)",
                    background: "var(--bg-card-hover)", color: "var(--text-primary)",
                    fontWeight: 800, fontSize: 16, cursor: "pointer", transition: "all 0.1s",
                    display: "flex", justifyContent: "center", alignItems: "center", gap: 8
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--purple-primary)"; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                >
                  {formatPoints(item.price)} 교환
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </main>

      {/* Buy Modal */}
      <AnimatePresence>
        {buyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBuyModal(null)}
              style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                zIndex: 201, width: "90%", maxWidth: 400, background: "var(--bg-card)",
                border: "1px solid var(--border)", borderRadius: 12, padding: 32, textAlign: "center",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ marginBottom: 24 }}>{buyModal.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>{buyModal.name}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>정말로 해당 상품을 구매하시겠습니까?</p>
              
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px", marginBottom: 16, textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>보유 포인트</span>
                  <span style={{ fontWeight: 700 }}>{formatPoints(points)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>결제 금액</span>
                  <span style={{ fontWeight: 700, color: "var(--accent-no)" }}>-{formatPoints(buyModal.price)}</span>
                </div>
                <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 700 }}>결제 후 잔액</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>{formatPoints(points - buyModal.price)}</span>
                </div>
              </div>

              <div style={{ marginBottom: 24, textAlign: "left" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>수신 연락처 (전화번호 또는 카카오톡 등록 이메일)</label>
                <input 
                  type="text" 
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="예: 010-1234-5678"
                  style={{
                    width: "100%", padding: "12px", borderRadius: 8, border: "1px solid var(--border)",
                    fontSize: 15, background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setBuyModal(null)}
                  style={{ flex: 1, padding: "14px", borderRadius: 8, background: "var(--bg-card-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                >취소</button>
                <motion.button
                  onClick={handleBuy}
                  whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: "14px", borderRadius: 8, background: "var(--purple-primary)", border: "none", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
                >
                  교환 신청
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 300, background: toast.type === "success" ? "linear-gradient(135deg, #059669, #22d3a0)" : "linear-gradient(135deg, #be123c, #f43f5e)", borderRadius: 14, padding: "14px 24px", color: "white", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
