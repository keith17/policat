"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints } from "@/lib/data";
import { sendShopOrderEmail } from "@/app/actions/email";
import { motion } from "framer-motion";
import { ArrowLeft, Coffee, Gift, Tag, Truck, Zap, ExternalLink, ShoppingBag, CreditCard, Coins } from "lucide-react";

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
          setContactInfo(profile.email || user.email || "");
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

  useEffect(() => {
    if (item && user) setPointsToUse(Math.min(points, item.price));
  }, [item, user, points]);

  const showToast = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const cardAmount = item ? item.price - pointsToUse : 0;

  const ensureVerified = async (): Promise<boolean> => {
    if (isVerified) return true;
    if (!window.confirm("상품 구매를 위해 최초 1회 휴대폰 본인인증이 필요합니다. 진행하시겠습니까?")) return false;
    try {
      const PortOne = await import("@portone/browser-sdk/v2");
      const storeId    = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      if (!storeId || !channelKey) { showToast("포트원 설정이 누락되었습니다.", "warn"); return false; }
      const res = await (PortOne as any).requestIdentityVerification({
        storeId, channelKey,
        identityVerificationId: `iv-${Date.now()}`,
        customer: { fullName: "", phoneNumber: "" },
      } as any);
      if (res.code) { showToast("본인인증에 실패했습니다.", "warn"); return false; }
      await supabase.from("profiles").update({ is_verified: true }).eq("id", user.id);
      setIsVerified(true);
      return true;
    } catch { showToast("본인인증 중 오류가 발생했습니다.", "warn"); return false; }
  };

  const handlePay = async () => {
    if (!user) { showToast("구매하려면 로그인이 필요합니다.", "warn"); return; }
    if (!contactInfo.trim()) { showToast("연락처 또는 이메일을 입력해주세요.", "warn"); return; }
    const verified = await ensureVerified();
    if (!verified) return;

    setIsProcessing(true);
    try {
      let paymentId: string | undefined;
      if (cardAmount > 0) {
        const PortOne = await import("@portone/browser-sdk/v2");
        const storeId    = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
        const channelKey = process.env.NEXT_PUBLIC_PORTONE_PAYMENT_CHANNEL_KEY;
        if (!storeId || !channelKey) { showToast("결제 설정이 누락되었습니다.", "warn"); setIsProcessing(false); return; }
        const pid = `order-${Date.now()}`;
        const payRes = await (PortOne as any).requestPayment({
          storeId, channelKey,
          paymentId: pid,
          orderName: item.name,
          totalAmount: cardAmount,
          currency: "KRW",
          payMethod: "CARD",
        } as any);
        if (payRes?.code) { showToast(`카드 결제 실패: ${payRes.message || ""}`, "warn"); setIsProcessing(false); return; }
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
      showToast(`🎉 구매 완료! 기프티콘이 연락처로 발송됩니다.`);
    } catch { showToast("결제 중 오류가 발생했습니다.", "warn"); }
    setIsProcessing(false);
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
                  {/* Points slider */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <span><Coins size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />포인트 사용</span>
                      <span style={{ fontWeight: 700, color: "var(--accent)" }}>{pointsToUse.toLocaleString()}P (보유: {formatPoints(points)})</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={Math.min(points, item.price)}
                      step={100}
                      value={pointsToUse}
                      onChange={e => setPointsToUse(Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                    {cardAmount > 0 && (
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        <CreditCard size={13} /> 카드 결제: <strong style={{ color: "var(--text-primary)", marginLeft: 4 }}>{cardAmount.toLocaleString()}원</strong>
                      </div>
                    )}
                  </div>

                  {/* Contact info */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>기프티콘 받을 이메일/연락처</label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={e => setContactInfo(e.target.value)}
                      placeholder="이메일 또는 휴대폰 번호"
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePay}
                    disabled={isProcessing}
                    style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: isProcessing ? "var(--surface-alt)" : "var(--accent)", color: isProcessing ? "var(--text-muted)" : "white", fontSize: 16, fontWeight: 800, cursor: isProcessing ? "not-allowed" : "pointer" }}
                  >
                    {isProcessing ? "처리 중…" : cardAmount > 0 ? `카드 ${cardAmount.toLocaleString()}원 + 포인트 ${pointsToUse.toLocaleString()}P 결제` : `포인트 ${pointsToUse.toLocaleString()}P로 구매`}
                  </motion.button>

                  <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                    최초 1회 휴대폰 본인인증 후 구매 가능 · 기프티콘은 평일 1~2일 내 발송
                  </p>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>구매하려면 로그인이 필요합니다.</p>
                  <a href="/login" style={{ display: "inline-block", padding: "14px 32px", background: "var(--accent)", color: "white", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: 15 }}>
                    로그인하기
                  </a>
                </div>
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
