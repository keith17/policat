"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints } from "@/lib/data";
import { sendShopOrderEmail } from "@/app/actions/email";
import { motion } from "framer-motion";
import { ArrowLeft, Coffee, Gift, Tag, Truck, Zap, ExternalLink, Coins, CheckCircle } from "lucide-react";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [contactInfo, setContactInfo]   = useState("");
  const [emailInfo, setEmailInfo]       = useState("");
  const [paySuccess, setPaySuccess]     = useState(false);
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
          setEmailInfo(user.email ?? "");
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
      setLoading(false);
    }
    loadData();
  }, [supabase, itemId]);

  const showToast = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const executePayment = async () => {
    if (!item) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/shop-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          itemName: item.name,
          price: item.price,
          contactInfo: contactInfo.trim(),
          emailInfo: emailInfo.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "구매 실패", "warn"); return; }
      if (data.points !== undefined) setPoints(data.points);
      if (user?.email) sendShopOrderEmail(user.email, item.name).catch(console.error);
      setPaySuccess(true);
    } catch (err) {
      console.error(err);
      showToast("구매 중 오류가 발생했습니다.", "warn");
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidPhone = (v: string) => /^01[016789][- ]?\d{3,4}[- ]?\d{4}$/.test(v.replace(/\s/g, ""));
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.startsWith("010")) {
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePay = async () => {
    if (!user) { showToast("로그인이 필요합니다.", "warn"); return; }
    if (points < item.price) { showToast("포인트가 부족합니다.", "warn"); return; }
    if (!contactInfo.trim()) { showToast("수신 전화번호를 입력해주세요.", "warn"); return; }
    if (!isValidPhone(contactInfo)) { showToast("올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)", "warn"); return; }
    if (!emailInfo.trim()) { showToast("이메일 주소를 입력해주세요.", "warn"); return; }
    if (!isValidEmail(emailInfo)) { showToast("올바른 이메일 주소를 입력해주세요.", "warn"); return; }
    await executePayment();
  };

  if (loading) return <div className="animated-bg" style={{ minHeight: "100vh" }} />;
  if (!item) return null;

  const hasEnoughPoints = user && points >= item.price;

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

          <div style={{ padding: 0 }}>
            {/* 상품 정보 */}
            <div style={{ padding: "24px 24px 20px" }}>
              <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "rgba(99,102,241,0.12)", padding: "3px 10px", borderRadius: 20, marginBottom: 10 }}>{item.category}</span>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.35, marginBottom: item.subtitle ? 6 : 0 }}>{item.name}</h1>
              {item.subtitle && (
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>{item.subtitle}</p>
              )}

              {/* 발행사 + 외부링크 */}
              {(item.issuer_name || item.giftishow_url) && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                  {item.issuer_name && (
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>발행사: <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{item.issuer_name}</strong></span>
                  )}
                  {item.giftishow_url && (
                    <a href={item.giftishow_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
                      <ExternalLink size={13} /> Giftishow에서 확인
                    </a>
                  )}
                </div>
              )}

              {/* 상품 설명 */}
              {item.description && (
                <div style={{ marginBottom: 16, padding: "12px 14px", background: "var(--bg-secondary)", borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{item.description}</p>
                </div>
              )}

              {/* 가격 */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {item.original_price && item.original_price > item.price && (
                  <span style={{ fontSize: 15, color: "var(--text-muted)", textDecoration: "line-through" }}>
                    {item.original_price.toLocaleString()}P
                  </span>
                )}
                <span style={{ fontSize: 26, fontWeight: 900, color: "var(--accent)" }}>
                  {item.price.toLocaleString()}P
                </span>
                {item.discount_rate > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f43f5e", background: "rgba(244,63,94,0.1)", padding: "3px 8px", borderRadius: 6 }}>
                    {Math.round(item.discount_rate)}% 할인
                  </span>
                )}
              </div>
            </div>

            {/* 구매 폼 */}
            <div style={{ borderTop: "1px solid var(--border)", padding: "20px 24px 28px" }}>

              {paySuccess ? (
                <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                  <CheckCircle size={52} color="#22c55e" style={{ marginBottom: 12 }} />
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>교환 완료!</h3>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", background: "var(--surface-alt)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, lineHeight: 1.8 }}>
                    📦 기프티콘은 입력하신 전화번호로 발송되며,<br />
                    평일 기준 <strong style={{ color: "var(--text-secondary)" }}>최대 1~2일 소요</strong>될 수 있습니다.
                  </div>
                  <button
                    onClick={() => router.push("/profile/me")}
                    style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: "var(--purple-primary)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
                  >
                    교환 내역 보기
                  </button>
                </div>

              ) : !user ? (
                /* 비로그인: 로그인 유도 */
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <Coins size={36} color="var(--accent)" style={{ marginBottom: 12, opacity: 0.7 }} />
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>포인트로 교환하는 상품입니다</p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
                    예측 마켓에 참여해 포인트를 모으고<br />기프티콘으로 교환해 보세요!
                  </p>
                  <a href="/api/auth/login" style={{ display: "block", padding: "15px", borderRadius: 12, background: "var(--accent)", color: "white", fontSize: 15, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>
                    로그인하고 포인트 모으기
                  </a>
                </div>

              ) : !hasEnoughPoints ? (
                /* 포인트 부족 */
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>😢</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>포인트가 부족합니다</p>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
                    보유: <strong style={{ color: "var(--accent)" }}>{formatPoints(points)}</strong>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                    필요: {item.price.toLocaleString()}P (부족: {(item.price - points).toLocaleString()}P)
                  </div>
                  <Link href="/" style={{ display: "block", padding: "15px", borderRadius: 12, background: "var(--surface-alt)", color: "var(--text-primary)", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                    마켓 참여하러 가기
                  </Link>
                </div>

              ) : (
                /* 구매 폼 */
                <>
                  {/* 보유 포인트 표시 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(99,102,241,0.08)", borderRadius: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Coins size={14} /> 보유 포인트
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)" }}>{formatPoints(points)}</span>
                  </div>

                  {/* 전화번호 */}
                  {(() => {
                    const filled = contactInfo.trim().length > 0;
                    const valid  = isValidPhone(contactInfo);
                    return (
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>기프티콘 수신 전화번호</label>
                        <input
                          type="tel"
                          value={contactInfo}
                          onChange={e => setContactInfo(formatPhone(e.target.value))}
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

                  {/* 이메일 */}
                  {(() => {
                    const filled = emailInfo.trim().length > 0;
                    const valid  = isValidEmail(emailInfo);
                    return (
                      <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>이메일 주소</label>
                        <input
                          type="email"
                          value={emailInfo}
                          onChange={e => setEmailInfo(e.target.value)}
                          placeholder="예: name@example.com"
                          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${filled ? (valid ? "#22c55e" : "var(--accent-no)") : "var(--border)"}`, background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }}
                        />
                        {filled && !valid && (
                          <div style={{ fontSize: 12, color: "var(--accent-no)", marginTop: 5 }}>
                            올바른 이메일 형식이 아닙니다.
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
                    {isProcessing ? "처리 중…" : `포인트 ${item.price.toLocaleString()}P로 교환`}
                  </motion.button>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                    기프티콘은 입력하신 전화번호로 발송됩니다
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
