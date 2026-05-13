"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints } from "@/lib/data";
import { sendShopOrderEmail } from "@/app/actions/email";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingBag, Coffee, Gift, Tag, Truck, Coins, CreditCard, Zap, CheckCircle } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  coffee: <Coffee size={40} color="var(--purple-primary)" />,
  gift:   <Gift size={40} color="#15c559" />,
  tag:    <Tag size={40} color="#0072bb" />,
  truck:  <Truck size={40} color="#2ac1bc" />,
  zap:    <Zap size={40} color="#eab308" />,
};

export default function ShopPage() {
  const router = useRouter();
  const [user, setUser]               = useState<any>(null);
  const [points, setPoints]           = useState(0);
  const [xp, setXp]                   = useState(0);
  const [loading, setLoading]         = useState(true);
  const [shopItems, setShopItems]     = useState<any[]>([]);
  const [buyModal, setBuyModal]       = useState<any | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contactInfo, setContactInfo] = useState("");
  const [emailInfo, setEmailInfo]     = useState("");
  const [paySuccess, setPaySuccess]   = useState<{ itemName: string; pointsUsed: number; cardAmount: number } | null>(null);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "warn" } | null>(null);

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
          setContactInfo("");
          setEmailInfo(user.email ?? "");
        }
      }
      const { data: items } = await supabase
        .from("shop_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setShopItems(items ?? []);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const showToast = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const MIN_POINTS_TO_USE = 1000;

  const openModal = (item: any) => {
    setBuyModal(item);
    const maxUsable = Math.floor(Math.min(points, item.price) / 100) * 100;
    setPointsToUse(user && maxUsable >= MIN_POINTS_TO_USE ? maxUsable : 0);
  };

  const handleSliderChange = (val: number) => {
    if (val > 0 && val < MIN_POINTS_TO_USE) setPointsToUse(MIN_POINTS_TO_USE);
    else setPointsToUse(val);
  };

  const cardAmount = buyModal ? buyModal.price - pointsToUse : 0;

  const executePayment = async () => {
    if (!buyModal) return;
    setIsProcessing(true);
    try {
      let paymentId: string | undefined;
      if (cardAmount > 0) {
        const PortOne    = await import("@portone/browser-sdk/v2");
        const storeId    = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
        const channelKey = process.env.NEXT_PUBLIC_PORTONE_PAYMENT_CHANNEL_KEY;
        if (!storeId || !channelKey) {
          showToast("카드 결제 설정이 누락되었습니다. 관리자에게 문의하세요.", "warn");
          return;
        }
        const pid = crypto.randomUUID(); // 36자 (order- 접두사 제거 — PortOne 40자 제한)
        const res = await PortOne.requestPayment({
          storeId, channelKey, paymentId: pid,
          orderName: pointsToUse > 0
            ? `${buyModal.name} (포인트 ${pointsToUse.toLocaleString()}P + 카드)`
            : buyModal.name,
          totalAmount: cardAmount,
          currency: "CURRENCY_KRW",
          payMethod: "CARD",
          customer: {
            fullName: user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "구매자",
            email: emailInfo || user?.email || "guest@policat.kr",
            phoneNumber: contactInfo.replace(/\D/g, ""),
          },
        } as any);
        if (!res || res.code != null) {
          showToast(res?.message ?? "결제가 취소되었습니다.", "warn");
          return;
        }
        paymentId = res.paymentId;
      }

      const verifyRes = await fetch("/api/shop-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, itemId: buyModal.id, itemName: buyModal.name, price: buyModal.price, contactInfo, emailInfo: emailInfo.trim(), pointsUsed: pointsToUse }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        showToast(verifyData.error ?? "결제 처리 실패", "warn");
        return;
      }
      if (verifyData.points !== undefined) setPoints(verifyData.points);
      if (user?.email) sendShopOrderEmail(user.email, buyModal.name).catch(console.error);
      const successData = { itemName: buyModal.name, pointsUsed: pointsToUse, cardAmount };
      setBuyModal(null);
      setPaySuccess(successData);
    } catch (err) {
      console.error(err);
      showToast("결제 중 오류가 발생했습니다.", "warn");
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
    if (!buyModal) return;
    if (pointsToUse > 0 && !user) { showToast("포인트 사용 시 로그인이 필요합니다.", "warn"); return; }
    if (!contactInfo.trim()) { showToast("수신 전화번호를 입력해주세요.", "warn"); return; }
    if (!isValidPhone(contactInfo)) { showToast("올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)", "warn"); return; }
    if (!emailInfo.trim()) { showToast("이메일 주소를 입력해주세요.", "warn"); return; }
    if (!isValidEmail(emailInfo)) { showToast("올바른 이메일 주소를 입력해주세요.", "warn"); return; }
    if (user && xp < 500) { showToast("분석가 등급(XP 500) 이상부터 포인트 교환 가능합니다.", "warn"); return; }
    if (cardAmount > 0 && cardAmount < 100) { showToast("카드 최소 결제 금액은 100원입니다.", "warn"); return; }
    await executePayment();
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80, background: "var(--bg-primary)" }}>
      <Navbar points={points} xp={xp} streak={0} />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 20px 40px" }}>
        <section style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>포인트 상점</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
            포인트와 카드를 자유롭게 섞어서 결제하세요.
          </p>
        </section>

        {/* 신용카드 안내 배너 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.10))",
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, marginBottom: 24
        }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>💳</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>
              포인트 없이도 구매 가능!
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              포인트가 부족하거나 없어도 신용카드로 바로 구매할 수 있어요.
              포인트와 카드를 섞어서 결제하면 더욱 저렴하게!
            </div>
          </div>
        </div>

        {/* 보유 포인트 (로그인 시) */}
        {user ? (
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
            padding: 20, background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, marginBottom: 32, gap: 16
          }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>보유 포인트</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{formatPoints(points)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>포인트와 신용카드 혼합 결제 가능합니다.</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>포인트 교환 시 XP(티어)는 유지됩니다.</div>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 32
          }}>
            <span style={{ fontSize: 18 }}>🔑</span>
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>로그인</strong>하면 포인트를 사용해 더 저렴하게 구매할 수 있어요.
            </span>
          </div>
        )}

        {/* 상품 그리드 */}
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
          {shopItems.map(item => {
            const canFull = points >= item.price;
            const hasDiscount = item.discount_rate && item.discount_rate > 0;
            return (
              <motion.div key={item.id} whileHover={{ y: -4 }} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
                boxShadow: "var(--shadow-sm)", cursor: "pointer"
              }} onClick={() => openModal(item)}>
                {/* 이미지 / 아이콘 영역 */}
                <div style={{ position: "relative", height: 160, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <motion.div whileHover={{ scale: 1.1 }}>
                      {ICON_MAP[item.icon_key] ?? ICON_MAP.gift}
                    </motion.div>
                  )}
                  {/* 할인 뱃지 */}
                  {hasDiscount && (
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      background: "linear-gradient(135deg,#f43f5e,#be123c)",
                      color: "white", fontSize: 12, fontWeight: 900,
                      padding: "4px 8px", borderRadius: 6, letterSpacing: "-0.02em"
                    }}>
                      {Math.round(item.discount_rate)}% OFF
                    </div>
                  )}
                </div>

                <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{item.category}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.4 }}>{item.name}</h3>
                  {item.subtitle && (
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.4 }}>{item.subtitle}</p>
                  )}
                  {/* 가격 */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: "auto", marginBottom: 14 }}>
                    {item.original_price && item.original_price > item.price && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through", fontFamily: "var(--font-mono)" }}>
                        ₩{item.original_price.toLocaleString()}
                      </span>
                    )}
                    <span style={{ fontSize: 16, fontWeight: 900, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {formatPoints(item.price)}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); openModal(item); }}
                    style={{
                      width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                      background: canFull ? "var(--accent)" : "var(--ink)",
                      color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                  >
                    {!user
                      ? <><CreditCard size={14} /> ₩{item.price.toLocaleString()} 구매하기</>
                      : canFull
                        ? <><Coins size={14} /> {formatPoints(item.price)} 구매</>
                        : <><CreditCard size={14} /> ₩{item.price.toLocaleString()} 구매</>
                    }
                  </button>
                </div>
              </motion.div>
            );
          })}
          {!loading && shopItems.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              <ShoppingBag size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p>준비 중인 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      {/* 구매 모달 */}
      <AnimatePresence>
        {buyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBuyModal(null)}
              style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, width: "calc(100% - 40px)", maxWidth: 460 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}
              >
                <div style={{ padding: "24px 24px 0", textAlign: "center" }}>
                  <div style={{ marginBottom: 12 }}>{ICON_MAP[buyModal.icon_key] ?? ICON_MAP.gift}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{buyModal.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>{buyModal.description}</p>
                </div>

                <div style={{ padding: "0 24px 24px" }}>
                  {/* 비로그인 안내 */}
                  {!user && (
                    <a href="/api/auth/login" style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, marginBottom: 14, cursor: "pointer" }}>
                        <span style={{ fontSize: 18 }}>💡</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          <strong style={{ color: "var(--accent)" }}>로그인</strong>하면 포인트로 더 저렴하게 구매할 수 있어요.
                        </span>
                      </div>
                    </a>
                  )}
                  {/* 포인트 슬라이더 */}
                  {(() => {
                    const maxUsable = Math.floor(Math.min(points, buyModal.price) / 100) * 100;
                    const canUse = maxUsable >= MIN_POINTS_TO_USE;
                    return (
                      <div style={{ background: "var(--surface-alt)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                            <Coins size={15} color="var(--accent)" /> 포인트 사용
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 900, color: canUse ? "var(--accent)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            {pointsToUse.toLocaleString()}P
                          </span>
                        </div>
                        {!canUse ? (
                          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 0" }}>
                            포인트 사용은 최소 1,000P 이상 보유 시 가능합니다. (보유 {points.toLocaleString()}P)
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
                            />
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                              최소 {MIN_POINTS_TO_USE.toLocaleString()}P 이상 사용 가능 · 0P 선택 시 카드 전액 결제
                            </div>
                            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                              {[
                                { label: "사용 안 함", val: 0 },
                                { label: "절반", val: Math.max(MIN_POINTS_TO_USE, Math.floor(maxUsable / 2 / 100) * 100) },
                                { label: "전부 사용", val: maxUsable },
                              ].map(({ label, val }) => (
                                <button
                                  key={label}
                                  onClick={() => setPointsToUse(val)}
                                  style={{
                                    padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                    border: pointsToUse === val ? "1px solid var(--accent)" : "1px solid var(--border)",
                                    background: pointsToUse === val ? "rgba(99,102,241,0.12)" : "transparent",
                                    color: pointsToUse === val ? "var(--accent)" : "var(--text-secondary)",
                                  }}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* 결제 요약 */}
                  <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "var(--text-secondary)" }}>상품 금액</span>
                      <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>₩{buyModal.price.toLocaleString()}</span>
                    </div>
                    {pointsToUse > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Coins size={13} /> 포인트 차감
                        </span>
                        <span style={{ fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                          −{pointsToUse.toLocaleString()}P
                        </span>
                      </div>
                    )}
                    <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                        {cardAmount === 0 ? "포인트 전액 결제" : pointsToUse > 0 ? "카드 추가 결제" : "카드 전액 결제"}
                      </span>
                      <span style={{ fontWeight: 900, fontSize: 16, fontFamily: "var(--font-mono)", color: cardAmount > 0 ? "var(--text-primary)" : "var(--accent)" }}>
                        {cardAmount > 0 ? `₩${cardAmount.toLocaleString()}` : "무료 (포인트)"}
                      </span>
                    </div>
                    {cardAmount > 0 && cardAmount < 100 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent-no)" }}>
                        ⚠️ 카드 최소 결제 금액은 100원입니다. 포인트 사용량을 조절하세요.
                      </div>
                    )}
                  </div>

                  {/* 연락처 */}
                  {(() => {
                    const filled = contactInfo.trim().length > 0;
                    const valid  = isValidPhone(contactInfo);
                    return (
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                          기프티콘 수신 전화번호
                        </label>
                        <input
                          type="tel"
                          value={contactInfo}
                          onChange={e => setContactInfo(formatPhone(e.target.value))}
                          placeholder="예: 010-1234-5678"
                          style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${filled ? (valid ? "#22c55e" : "var(--accent-no)") : "var(--border)"}`, fontSize: 14, background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
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
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                          이메일 주소
                        </label>
                        <input
                          type="email"
                          value={emailInfo}
                          onChange={e => setEmailInfo(e.target.value)}
                          placeholder="예: name@example.com"
                          style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${filled ? (valid ? "#22c55e" : "var(--accent-no)") : "var(--border)"}`, fontSize: 14, background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                        />
                        {filled && !valid && (
                          <div style={{ fontSize: 12, color: "var(--accent-no)", marginTop: 5 }}>
                            올바른 이메일 형식이 아닙니다.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 버튼 */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setBuyModal(null)}
                      style={{ flex: 1, padding: "13px", borderRadius: 8, background: "var(--surface-alt)", border: "none", color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                    >
                      취소
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePay}
                      disabled={isProcessing || (cardAmount > 0 && cardAmount < 100)}
                      style={{
                        flex: 2, padding: "13px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700,
                        cursor: isProcessing || (cardAmount > 0 && cardAmount < 100) ? "not-allowed" : "pointer",
                        background: cardAmount > 0 ? "var(--ink)" : "var(--accent)",
                        color: "white", opacity: isProcessing ? 0.6 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}
                    >
                      {cardAmount > 0 ? <CreditCard size={15} /> : <Coins size={15} />}
                      {isProcessing ? "처리 중…" : cardAmount > 0
                        ? (pointsToUse > 0 ? `${pointsToUse.toLocaleString()}P + ₩${cardAmount.toLocaleString()} 결제` : `₩${cardAmount.toLocaleString()} 카드 결제`)
                        : `${pointsToUse.toLocaleString()}P 결제`
                      }
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 구매 완료 팝업 */}
      <AnimatePresence>
        {paySuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 301, width: "calc(100% - 40px)", maxWidth: 400 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "32px 28px", boxShadow: "0 24px 48px rgba(0,0,0,0.3)", textAlign: "center" }}
              >
                <CheckCircle size={52} color="#22c55e" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>구매 완료!</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 8 }}>
                  <strong style={{ color: "var(--text-primary)" }}>{paySuccess.itemName}</strong>
                  {paySuccess.cardAmount > 0
                    ? paySuccess.pointsUsed > 0
                      ? ` — ${paySuccess.pointsUsed.toLocaleString()}P + ₩${paySuccess.cardAmount.toLocaleString()} 결제 완료`
                      : ` — ₩${paySuccess.cardAmount.toLocaleString()} 카드 결제 완료`
                    : ` — ${paySuccess.pointsUsed.toLocaleString()}P 결제 완료`}
                </p>
                <div style={{ fontSize: 13, color: "var(--text-muted)", background: "var(--surface-alt)", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
                  📦 기프티콘은 입력하신 전화번호로 발송되며,<br />
                  평일 기준 <strong style={{ color: "var(--text-secondary)" }}>최대 1~2일 소요</strong>될 수 있습니다.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setPaySuccess(null)}
                    style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    계속 쇼핑
                  </button>
                  <button
                    onClick={() => { setPaySuccess(null); router.push("/profile/me"); }}
                    style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: "var(--purple-primary)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    구매 내역 보기
                  </button>
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
                background: toast.type === "success" ? "linear-gradient(135deg,#059669,#22d3a0)" : "linear-gradient(135deg,#be123c,#f43f5e)",
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
