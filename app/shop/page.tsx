"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { formatPoints } from "@/lib/data";
import { motion } from "framer-motion";
import { ShoppingBag, Coffee, Gift, Tag, Truck, Zap, Coins, CreditCard } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  coffee: <Coffee size={40} color="var(--purple-primary)" />,
  gift:   <Gift size={40} color="#15c559" />,
  tag:    <Tag size={40} color="#0072bb" />,
  truck:  <Truck size={40} color="#2ac1bc" />,
  zap:    <Zap size={40} color="#eab308" />,
};

export default function ShopPage() {
  const [user, setUser]       = useState<any>(null);
  const [points, setPoints]   = useState(0);
  const [xp, setXp]           = useState(0);
  const [loading, setLoading] = useState(true);
  const [shopItems, setShopItems] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("points, xp").eq("id", user.id).single();
        if (profile) {
          setPoints(profile.points);
          setXp(profile.xp ?? profile.points);
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
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, marginBottom: 24,
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

        {/* 보유 포인트 */}
        {user ? (
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
            padding: 20, background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, marginBottom: 32, gap: 16,
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
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 32,
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
              <Link key={item.id} href={`/shop/${item.id}`} style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ y: -4 }} style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
                  boxShadow: "var(--shadow-sm)", cursor: "pointer", height: "100%",
                }}>
                  {/* 이미지 / 아이콘 */}
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
                    {hasDiscount && (
                      <div style={{
                        position: "absolute", top: 10, right: 10,
                        background: "linear-gradient(135deg,#f43f5e,#be123c)",
                        color: "white", fontSize: 12, fontWeight: 900,
                        padding: "4px 8px", borderRadius: 6, letterSpacing: "-0.02em",
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
                    <div style={{
                      width: "100%", padding: "12px 0", borderRadius: 8,
                      background: user && canFull ? "var(--accent)" : "var(--ink)",
                      color: "white", fontWeight: 700, fontSize: 13,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      {!user
                        ? <><CreditCard size={14} /> ₩{item.price.toLocaleString()} 구매하기</>
                        : canFull
                          ? <><Coins size={14} /> {formatPoints(item.price)} 구매</>
                          : <><CreditCard size={14} /> ₩{item.price.toLocaleString()} 구매</>
                      }
                    </div>
                  </div>
                </motion.div>
              </Link>
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
    </div>
  );
}
