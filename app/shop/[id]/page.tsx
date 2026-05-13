"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints } from "@/lib/data";
import { sendShopOrderEmail } from "@/app/actions/email";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Coffee, Gift, Tag, Truck, Zap, ExternalLink, CreditCard, Coins, CheckCircle } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  coffee: <Coffee size={56} color="var(--purple-primary)" />,
  gift:   <Gift size={56} color="#15c559" />,
  tag:    <Tag size={56} color="#0072bb" />,
  truck:  <Truck size={56} color="#2ac1bc" />,
  zap:    <Zap size={56} color="#eab308" />,
};

export default function ShopItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [user, setUser]                 = useState<any>(null);
  const [points, setPoints]             = useState(0);
  const [xp, setXp]                     = useState(0);
  const [item, setItem]                 = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [pointsToUse, setPointsToUse]   = useState(0);
  const [isVerified, setIsVerified]     = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contactInfo, setContactInfo]   = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [paySuccess, setPaySuccess]           = useState(false);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "warn" } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          setPoints(profile.points);
          setXp(profile.xp ?? profile.points);
          setIsVerified(!!profile.is_verified);
          setContactInfo("");
        }
      }
      const { data: shopItem } = await supabase
        .from("shop_items")
        .select("*")
        .eq("id", itemId)
        .eq("is_active", true)
        .single();
      if (!shopItem) { router.replace("/shop"); return; }
      setItem(shopItem);
      if (user) setPointsToUse(Math.min(user ? points : 0, shopItem.price));
      setLoading(false);
    }
    loadData();
  }, [supabase, itemId]);

  const MIN_POINTS_TO_USE = 1000;

  useEffect(() => {
    if (item && user) {
      const maxUsable = Math.floor(Math.min(points, item.price) / 100) * 100;
      setPointsToUse(maxUsable >= MIN_POINTS_TO_USE ? maxUsable : 0);
    }
  }, [item, user, points]);

  const handleSliderChange = (val: number) => {
    if (val > 0 && val < MIN_POINTS_TO_USE) setPointsToUse(MIN_POINTS_TO_USE);
    else setPointsToUse(val);
  };

  const showToast = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const cardAmount = item ? item.price - pointsToUse : 0;

  const executePayment = async () => {
    if (!item) return;
    setIsProcessing(true);
    try {
      let paymentId: string | undefined;
      if (cardAmount > 0) {
        const PortOne    = await import("@portone/browser-sdk/v2");
        const portone    = (PortOne as any).default ?? PortOne;
        const storeId    = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
        const channelKey = process.env.NEXT_PUBLIC_PORTONE_PAYMENT_CHANNEL_KEY;
        if (!storeId || !channelKey) { showToast("결제 설정이 누락되었습니다.", "warn"); setIsProcessing(false); return; }
        const pid = `order-${crypto.randomUUID()}`;
        const payRes = await portone.requestPayment({
          storeId,
          channelKey,
          paymentId: pid,
          orderName: item.name,
          totalAmount: cardAmount,
          currency: "KRW",
          payMethod: "CARD",
          // KG이니시스 PC 결제 시 customer 필드 필수
          customer: {
            fullName: user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "구매자",
            email: user?.email ?? "guest@policat.kr",
            phoneNumber: contactInfo.replace(/\s/g, ""),
          },
        });
        if (!payRes || payRes.code != null) { showToast(payRes?.message ?? "결제가 취소되었습니다.", "warn"); setIsProcessing(false); return; }
        paymentId = pid;
      }
      const res = await fetch("/api/shop-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, itemId: item.id, itemName: item.name, price: item.price, contactInfo: contactInfo.trim(), pointsUsed: pointsToUse }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "결제 실패", "warn"); setIsProcessing(false); return; }
      if (data.points !== undefined) setPoints(data.points);
      if (user?.email) sendShopOrderEmail(user.email, item.name).catch(console.error);
      setPaySuccess(true);
    } catch { showToast("결제 중 오류가 발생했습니다.", "warn"); }
    setIsProcessing(false);
  };

  const isValidPhone = (v: string) => /^01[016789][- ]?\d{3,4}[- ]?\d{4}$/.test(v.replace(/\s/g, ""));

  const handlePay = async () => {
    if (pointsToUse > 0 && !user) { showToast("포인트 사용 시 로그인이 필요합니다.", "warn"); return; }
    if (!contactInfo.trim()) { showToast("수신 전화번호를 입력해주세요.", "warn"); return; }
    if (!isValidPhone(contactInfo)) { showToast("올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)", "warn"); return; }
    if (user && !isVerified) { setShowVerifyModal(true); return; }
    await executePayment();
  };

  const handleVerifyConfirm = async () => {
    setIsVerified(true);
    setShowVerifyModal(false);
    await executePayment();
  };

  if (loading) return <div className="animated-bg" style={{ minHeight: "100vh" }} />;
  if (!item) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar points={points} xp={xp} streak={0} />

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "100px 20px 60px" }}>
        <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, textDecoration: "none" }}>
          <ArrowLeft size={16} /> 상점으로 돌아가기
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}
        >
          {/* Product image or icon */}
          {item.image_url ? (
            <div style={{ width: "100%", aspectRatio: "16/7", overflow: "hidden", background: "var(--bg-secondary)" }}>
              <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{ padding: "40px 0 20px", textAlign: "center", background: "var(--bg-secondary)" }}>
              {ICON_MAP[item.icon_key] ?? <Gift size={56} color="#15c559" />}
            </div>
          )}

          <div style={{ padding: "28px 28px 32px" }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>{item.category}</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 }}>{item.name}</h1>
            {item.subtitle && (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>{item.subtitle}</p>
            )}
            {item.description && (
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 14, marginBottom: 16 }}>{item.description}</p>
            )}
            {item.issuer_name && (
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>발행사: <strong style={{ color: "var(--text-secondary)" }}>{item.issuer_name}</strong></div>
            )}
            {item.giftishow_url && (
              <a href={item.giftishow_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 13, textDecoration: "none", marginBottom: 20 }}>
                <ExternalLink size={14} /> Giftishow에서 확인
              </a>
            )}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
              {/* 가격 표시 */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                {item.original_price && item.original_price > item.price && (
                  <span style={{ fontSize: 16, color: "var(--text-muted)", textDecoration: "line-through", fontFamily: "var(--font-mono)" }}>
                    ₩{item.original_price.toLocaleString()}
                  </span>
                )}
                <span style={{ fontSize: 28, fontWeight: 900, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                  {item.price.toLocaleString()}P
                </span>
                {item.discount_rate > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f43f5e", background: "rgba(244,63,94,0.1)", padding: "3px 8px", borderRadius: 6 }}>
                    {Math.round(item.discount_rate)}% 할인
                  </span>
                )}
              </div>

              {user ? (
                <>
                  {paySuccess ? (
                    <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                      <CheckCircle size={52} color="#22c55e" style={{ marginBottom: 12 }} />
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>구매 완료!</h3>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", background: "var(--surface-alt)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, lineHeight: 1.8 }}>
                        📦 기프티콘은 입력하신 전화번호로 발송되며,<br />
                        평일 기준 <strong style={{ color: "var(--text-secondary)" }}>최대 1~2일 소요</strong>될 수 있습니다.
                      </div>
                      <button
                        onClick={() => router.push("/profile/me")}
                        style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: "var(--purple-primary)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
                      >
                        구매 내역 보기
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Points slider */}
                      {(() => {
                        const maxUsable = Math.floor(Math.min(points, item.price) / 100) * 100;
                        const canUse = maxUsable >= MIN_POINTS_TO_USE;
                        return (
                          <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                              <span><Coins size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />포인트 사용</span>
                              <span style={{ fontWeight: 700, color: canUse ? "var(--accent)" : "var(--text-muted)" }}>{pointsToUse.toLocaleString()}P (보유: {formatPoints(points)})</span>
                            </label>
                            {!canUse ? (
                              <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 0" }}>
                                포인트 사용은 최소 1,000P 이상 보유 시 가능합니다.
                              </div>
                            ) : (
                              <>
                                <input
                                  type="range"
                                  min={0}
                                  max={maxUsable}
                                  step={100}
                                  value={pointsToUse}
                                  onChange={e => handleSliderChange(Number(e.target.value))}
                                  style={{ width: "100%" }}
                                />
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                  최소 1,000P 이상 사용 · 0P 선택 시 카드 전액 결제
                                </div>
                                {cardAmount > 0 && (
                                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                                    <CreditCard size={13} /> 카드 결제: <strong style={{ color: "var(--text-primary)", marginLeft: 4 }}>{cardAmount.toLocaleString()}원</strong>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })()}

                      {/* Contact info */}
                      {(() => {
                        const filled = contactInfo.trim().length > 0;
                        const valid  = isValidPhone(contactInfo);
                        return (
                          <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>기프티콘 수신 전화번호</label>
                            <input
                              type="tel"
                              value={contactInfo}
                              onChange={e => setContactInfo(e.target.value)}
                              placeholder="예: 010-1234-5678"
                              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${filled ? (valid ? "#22c55e" : "var(--accent-no)") : "var(--border)"}`, background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }}
                            />
                            {filled && !valid && (
                              <div style={{ fontSize: 12, color: "var(--accent-no)", marginTop: 5 }}>
                                올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePay}
                        disabled={isProcessing}
                        style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: isProcessing ? "var(--surface-alt)" : "var(--accent)", color: isProcessing ? "var(--text-muted)" : "white", fontSize: 16, fontWeight: 800, cursor: isProcessing ? "not-allowed" : "pointer" }}
                      >
                        {isProcessing ? "처리 중…" : cardAmount > 0 ? `카드 ${cardAmount.toLocaleString()}원 + 포인트 ${pointsToUse.toLocaleString()}P 결제` : `포인트 ${pointsToUse.toLocaleString()}P로 구매`}
                      </motion.button>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                        최초 1회 본인인증 후 구매 가능 · 기프티콘은 전화번호로 발송
                      </p>
                    </>
                  )}
                </>
              ) : (
                /* 비로그인: 카드 전액 결제 허용 */
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 16 }}>💡</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <a href="/api/auth/login" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>로그인</a>하면 포인트로 더 저렴하게 구매할 수 있어요.
                    </span>
                  </div>
                  {(() => {
                    const filled = contactInfo.trim().length > 0;
                    const valid  = isValidPhone(contactInfo);
                    return (
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>기프티콘 수신 전화번호</label>
                        <input
                          type="tel"
                          value={contactInfo}
                          onChange={e => setContactInfo(e.target.value)}
                          placeholder="예: 010-1234-5678"
                          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${filled ? (valid ? "#22c55e" : "var(--accent-no)") : "var(--border)"}`, background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }}
                        />
                        {filled && !valid && (
                          <div style={{ fontSize: 12, color: "var(--accent-no)", marginTop: 5 }}>
                            올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePay}
                    disabled={isProcessing}
                    style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: isProcessing ? "var(--surface-alt)" : "var(--ink)", color: isProcessing ? "var(--text-muted)" : "white", fontSize: 16, fontWeight: 800, cursor: isProcessing ? "not-allowed" : "pointer" }}
                  >
                    {isProcessing ? "처리 중…" : `₩${item.price.toLocaleString()} 카드 결제`}
                  </motion.button>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                    기프티콘은 전화번호로 발송 · 평일 기준 최대 1~2일 소요
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* 이용안내 */}
        {item.usage_notes && (
          <div style={{ marginTop: 20, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 14 }}>이용안내</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {item.usage_notes}
            </p>
          </div>
        )}
      </main>

      {/* 본인인증 안내 팝업 */}
      <AnimatePresence>
        {showVerifyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowVerifyModal(false)}
              style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 301, width: "calc(100% - 40px)", maxWidth: 400 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "32px 28px", boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}
              >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>본인인증 안내</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    상품 구매를 위해 최초 1회 본인인증이 필요합니다.<br />
                    어뷰징 방지 및 안전한 기프티콘 발송을 위해 운영됩니다.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleVerifyConfirm}
                    style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: "var(--purple-primary)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    확인하고 구매하기
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: toast.type === "warn" ? "rgba(244,63,94,0.95)" : "rgba(34,197,94,0.95)", color: "white", padding: "14px 24px", borderRadius: 12, fontWeight: 700, zIndex: 9999, maxWidth: "90vw", textAlign: "center" }}
        >
          {toast.msg}
        </motion.div>
      )}
    </div>
  );
}
