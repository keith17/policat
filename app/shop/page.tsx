"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints } from "@/lib/data";
import { sendShopOrderEmail } from "@/app/actions/email";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Coffee, Gift, Tag, CreditCard, Coins } from "lucide-react";

type PayMethod = "points" | "card";

const shopItems = [
  { id: "coffee-1",     name: "스타벅스 아이스 아메리카노 T",    price: 4500,  priceKRW: 4500,  icon: <Coffee size={40} color="var(--purple-primary)" />, category: "음료/디저트", desc: "전국 스타벅스 매장에서 사용 가능한 기프티콘" },
  { id: "naver-5000",   name: "네이버페이 포인트 5,000원권",      price: 5000,  priceKRW: 5000,  icon: <Gift size={40} color="#15c559" />,               category: "상품권",     desc: "네이버페이 결제 시 사용 가능한 포인트 쿠폰" },
  { id: "gs25-3000",    name: "GS25 모바일 상품권 3,000원권",     price: 3000,  priceKRW: 3000,  icon: <Tag size={40} color="#0072bb" />,                category: "편의점",     desc: "전국 GS25 편의점에서 현금처럼 사용 가능" },
  { id: "baemin-10000", name: "배달의민족 상품권 10,000원권",     price: 10000, priceKRW: 10000, icon: <Gift size={40} color="#2ac1bc" />,               category: "배달/외식", desc: "배민 앱에서 배달/포장 주문 시 사용 가능" },
];

export default function ShopPage() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyModal, setBuyModal] = useState<(typeof shopItems)[0] | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>("points");
  const [isVerified, setIsVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
          setIsVerified(!!profile.is_verified);
          // 이메일 기본값 설정
          setContactInfo(profile.email || user.email || "");
        }
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  // 모달 열 때 포인트 충분하면 포인트, 아니면 카드로 기본 선택
  const openModal = (item: (typeof shopItems)[0]) => {
    setBuyModal(item);
    setPayMethod(points >= item.price ? "points" : "card");
  };

  const showToast = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 본인인증 공통 함수
  const ensureVerified = async (): Promise<boolean> => {
    if (isVerified) return true;
    if (!window.confirm("상품 구매를 위해 최초 1회 휴대폰 본인인증이 필요합니다. 진행하시겠습니까?")) return false;
    try {
      const PortOne = await import("@portone/browser-sdk/v2");
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      if (!storeId || !channelKey) {
        showToast("포트원 설정이 누락되었습니다. 관리자에게 문의하세요.", "warn");
        return false;
      }
      const res = await PortOne.requestIdentityVerification({
        storeId,
        identityVerificationId: `cert-${crypto.randomUUID()}`,
        channelKey,
      });
      if (!res || res.code != null) {
        showToast(res?.message ?? "인증이 취소되었습니다.", "warn");
        return false;
      }
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identityVerificationId: res.identityVerificationId, userId: user.id }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        showToast(`인증 처리 오류: ${verifyData.message}`, "warn");
        return false;
      }
      setIsVerified(true);
      showToast("본인인증 완료", "success");
      return true;
    } catch {
      showToast("인증 중 오류가 발생했습니다.", "warn");
      return false;
    }
  };

  // 포인트 결제
  const handlePointsPay = async () => {
    if (!buyModal || !user) return;
    if (!contactInfo.trim()) { showToast("수신 연락처를 입력해주세요.", "warn"); return; }
    if (points < buyModal.price) { showToast("포인트가 부족합니다.", "warn"); return; }
    if (xp < 500) { showToast("분석가 등급(XP 500) 이상부터 교환 가능합니다.", "warn"); return; }

    setIsProcessing(true);
    const verified = await ensureVerified();
    if (!verified) { setIsProcessing(false); return; }

    const newPoints = points - buyModal.price;
    await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id);
    await supabase.from("shop_orders").insert({
      user_id: user.id, item_id: buyModal.id, item_name: buyModal.name,
      price: buyModal.price, contact_info: contactInfo, status: "pending",
      payment_method: "points",
    });
    await supabase.from("point_transactions").insert({
      user_id: user.id, amount: -buyModal.price, type: "shop_purchase",
      description: `포인트 상점: ${buyModal.name}`,
    });
    setPoints(newPoints);
    if (user.email) sendShopOrderEmail(user.email, buyModal.name).catch(console.error);
    setBuyModal(null);
    setIsProcessing(false);
    showToast(`✅ ${buyModal.name} 교환 신청 완료!`, "success");
  };

  // 카드 결제
  const handleCardPay = async () => {
    if (!buyModal || !user) return;
    if (!contactInfo.trim()) { showToast("수신 연락처를 입력해주세요.", "warn"); return; }

    setIsProcessing(true);
    const verified = await ensureVerified();
    if (!verified) { setIsProcessing(false); return; }

    try {
      const PortOne = await import("@portone/browser-sdk/v2");
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_PAYMENT_CHANNEL_KEY;

      if (!storeId || !channelKey) {
        showToast("카드 결제 설정이 누락되었습니다. 관리자에게 문의하세요.", "warn");
        setIsProcessing(false);
        return;
      }

      const paymentId = `order-${crypto.randomUUID()}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId,
        orderName: buyModal.name,
        totalAmount: buyModal.priceKRW,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
      } as any);

      if (!res || res.code != null) {
        showToast(res?.message ?? "결제가 취소되었습니다.", "warn");
        setIsProcessing(false);
        return;
      }

      // 서버사이드 결제 검증
      const verifyRes = await fetch("/api/shop-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: res.paymentId,
          itemId: buyModal.id,
          itemName: buyModal.name,
          price: buyModal.priceKRW,
          contactInfo,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        showToast(verifyData.error ?? "결제 검증 실패", "warn");
        setIsProcessing(false);
        return;
      }

      if (user.email) sendShopOrderEmail(user.email, buyModal.name).catch(console.error);
      setBuyModal(null);
      setIsProcessing(false);
      showToast(`✅ 카드 결제 완료! ${buyModal.name} 발송 처리 중`, "success");
    } catch (err) {
      console.error(err);
      showToast("결제 중 오류가 발생했습니다.", "warn");
      setIsProcessing(false);
    }
  };

  if (!user && !loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar points={0} xp={0} streak={0} />
        <main style={{ maxWidth: 600, margin: "0 auto", padding: "120px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>상점을 이용하려면 로그인이 필요합니다.</p>
        </main>
      </div>
    );
  }

  const hasEnoughPoints = buyModal ? points >= buyModal.price : false;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80, background: "var(--bg-primary)" }}>
      <Navbar points={points} xp={xp} streak={0} />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 20px 40px" }}>
        <section style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>포인트 상점</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
            포인트로 무료 교환하거나, 신용카드로 바로 구매하세요.
          </p>
        </section>

        {/* 잔액 */}
        {user && (
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
            padding: 24, background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, marginBottom: 40, gap: 16
          }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>보유 포인트</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{formatPoints(points)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>포인트 교환 시 XP(티어)는 유지됩니다.</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>신용카드 결제는 포인트와 무관합니다.</div>
            </div>
          </div>
        )}

        {/* 상품 그리드 */}
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
          {shopItems.map(item => {
            const canUsePoints = points >= item.price;
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div style={{ height: 140, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <motion.div whileHover={{ scale: 1.1 }}>{item.icon}</motion.div>
                </div>
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>{item.category}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.4 }}>{item.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, flex: 1 }}>{item.desc}</p>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openModal(item)}
                      style={{
                        flex: 1, padding: "11px 0", borderRadius: 8, border: "none",
                        background: canUsePoints ? "var(--accent)" : "var(--surface-alt)",
                        color: canUsePoints ? "white" : "var(--text-secondary)",
                        fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5
                      }}
                    >
                      <Coins size={14} /> {formatPoints(item.price)}
                    </button>
                    <button
                      onClick={() => { setBuyModal(item); setPayMethod("card"); }}
                      style={{
                        flex: 1, padding: "11px 0", borderRadius: 8,
                        border: "1px solid var(--border)", background: "var(--bg-card-hover)",
                        color: "var(--text-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5
                      }}
                    >
                      <CreditCard size={14} /> ₩{item.priceKRW.toLocaleString()}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* 구매 모달 */}
      <AnimatePresence>
        {buyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setBuyModal(null)}
              style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 201, width: "calc(100% - 40px)", maxWidth: 440 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}
              >
                {/* 모달 헤더 */}
                <div style={{ padding: "24px 24px 0", textAlign: "center" }}>
                  <div style={{ marginBottom: 12 }}>{buyModal.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{buyModal.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>{buyModal.desc}</p>

                  {/* 결제 방법 탭 */}
                  <div style={{
                    display: "flex", background: "var(--surface-alt)", borderRadius: "var(--radius-sm)",
                    padding: 4, marginBottom: 20
                  }}>
                    <button
                      onClick={() => setPayMethod("points")}
                      style={{
                        flex: 1, padding: "9px 0", borderRadius: 6, border: "none", cursor: "pointer",
                        fontWeight: 700, fontSize: 13, transition: "all 0.15s",
                        background: payMethod === "points" ? "var(--bg-card)" : "transparent",
                        color: payMethod === "points" ? "var(--text-primary)" : "var(--text-muted)",
                        boxShadow: payMethod === "points" ? "var(--shadow-sm)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}
                    >
                      <Coins size={14} /> 포인트 결제
                    </button>
                    <button
                      onClick={() => setPayMethod("card")}
                      style={{
                        flex: 1, padding: "9px 0", borderRadius: 6, border: "none", cursor: "pointer",
                        fontWeight: 700, fontSize: 13, transition: "all 0.15s",
                        background: payMethod === "card" ? "var(--bg-card)" : "transparent",
                        color: payMethod === "card" ? "var(--text-primary)" : "var(--text-muted)",
                        boxShadow: payMethod === "card" ? "var(--shadow-sm)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}
                    >
                      <CreditCard size={14} /> 신용카드
                    </button>
                  </div>
                </div>

                <div style={{ padding: "0 24px 24px" }}>
                  {/* 결제 요약 */}
                  <div style={{ background: "var(--surface-alt)", borderRadius: "var(--radius-sm)", padding: "14px 16px", marginBottom: 16 }}>
                    {payMethod === "points" ? (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                          <span style={{ color: "var(--text-secondary)" }}>보유 포인트</span>
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{formatPoints(points)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                          <span style={{ color: "var(--text-secondary)" }}>차감 포인트</span>
                          <span style={{ fontWeight: 700, color: "var(--accent-no)", fontFamily: "var(--font-mono)" }}>−{formatPoints(buyModal.price)}</span>
                        </div>
                        <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>결제 후 잔액</span>
                          <span style={{
                            fontWeight: 800, fontFamily: "var(--font-mono)",
                            color: hasEnoughPoints ? "var(--text-primary)" : "var(--accent-no)"
                          }}>
                            {hasEnoughPoints ? formatPoints(points - buyModal.price) : "포인트 부족"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span style={{ color: "var(--text-secondary)" }}>카드 결제 금액</span>
                          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                            ₩{buyModal.priceKRW.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                          포인트 잔액과 무관하게 결제됩니다.
                        </div>
                      </>
                    )}
                  </div>

                  {/* 연락처 */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                      기프티콘 수신 연락처 (전화번호 또는 이메일)
                    </label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={e => setContactInfo(e.target.value)}
                      placeholder="예: 010-1234-5678 또는 이메일"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* 버튼 */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setBuyModal(null)}
                      disabled={isProcessing}
                      style={{ flex: 1, padding: "13px", borderRadius: 8, background: "var(--surface-alt)", border: "none", color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                    >
                      취소
                    </button>
                    {payMethod === "points" ? (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handlePointsPay}
                        disabled={isProcessing || !hasEnoughPoints}
                        style={{
                          flex: 2, padding: "13px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700, cursor: hasEnoughPoints ? "pointer" : "not-allowed",
                          background: hasEnoughPoints ? "var(--accent)" : "var(--surface-alt)",
                          color: hasEnoughPoints ? "white" : "var(--text-muted)",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                        }}
                      >
                        <Coins size={15} />
                        {isProcessing ? "처리 중…" : hasEnoughPoints ? `${formatPoints(buyModal.price)} 결제` : "포인트 부족"}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCardPay}
                        disabled={isProcessing}
                        style={{
                          flex: 2, padding: "13px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
                          background: "var(--ink)", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          opacity: isProcessing ? 0.6 : 1
                        }}
                      >
                        <CreditCard size={15} />
                        {isProcessing ? "결제 처리 중…" : `₩${buyModal.priceKRW.toLocaleString()} 카드 결제`}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 토스트 */}
      <AnimatePresence>
        {toast && (
          <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 300, whiteSpace: "nowrap" }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
              style={{
                background: toast.type === "success" ? "linear-gradient(135deg, #059669, #22d3a0)" : "linear-gradient(135deg, #be123c, #f43f5e)",
                borderRadius: 14, padding: "14px 24px", color: "white", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
              }}
            >
              {toast.msg}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
