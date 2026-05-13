"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { ShieldAlert, Users, TrendingUp, Lock, Coins, EyeOff, CheckCircle, Star, Calendar, Eye, Bell, LayoutDashboard, Store, Zap, Megaphone, PlusCircle } from "lucide-react";
import { sendMarketApprovalEmail, sendMarketSettlementEmails } from "@/app/actions/email";
import { motion, AnimatePresence } from "framer-motion";
import { formatPoints, getTier, tierConfig } from "@/lib/data";

interface MockUser {
  id: string;
  email: string;
  name: string;
  points: number;
  isAdmin: boolean;
}

interface MockMarket {
  id: string;
  title: string;
  status: "pending" | "active" | "resolved_yes" | "resolved_no" | "cancelled" | "hidden";
  yesAmount: number;
  noAmount: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "markets" | "orders" | "events" | "notices" | "shop_items">("users");
  const [marketFilter, setMarketFilter] = useState<"all" | "pending" | "active" | "ended" | "resolved">("all");

  const [users, setUsers] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [adminShopItems, setAdminShopItems] = useState<any[]>([]);
  const [shopCategories, setShopCategories] = useState<string[]>([]);
  const [newShopItem, setNewShopItem] = useState({
    name: "", category: "", description: "", subtitle: "",
    price: "", original_price: "", discount_rate: "",
    issuer_name: "", usage_notes: "", image_url: "", giftishow_url: "",
  });
  const [categoryInput, setCategoryInput] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [giftishowUrl, setGiftishowUrl] = useState("");
  const [scraping, setScraping] = useState(false);

  const supabase = createClient();

  const [toast, setToast] = useState<{ msg: string; type: "success" | "warn" } | null>(null);

  const showToast = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadAdminData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const ADMIN_EMAILS = ["koesig@gmail.com", "tlw.seoul@gmail.com"];
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        // Fetch profiles
        const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (profiles) setUsers(profiles);
        // Fetch markets
        const { data: mkts } = await supabase.from("markets").select("*").order("created_at", { ascending: false });
        if (mkts) setMarkets(mkts);
        
        // Fetch shop orders
        const { data: ords } = await supabase.from("shop_orders").select("*").order("created_at", { ascending: false });
        if (ords) setOrders(ords);

        // Fetch events
        const { data: evts } = await supabase.from("events").select("*").order("created_at", { ascending: false });
        if (evts) setEvents(evts);

        // Fetch notices
        const { data: ntc } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
        if (ntc) setNotices(ntc);

        // Fetch shop items (admin sees all including inactive)
        const { data: si } = await supabase.from("shop_items").select("*").order("sort_order", { ascending: true });
        if (si) {
          setAdminShopItems(si);
          const cats = [...new Set(si.map((i: any) => i.category).filter(Boolean))] as string[];
          setShopCategories(cats);
        }
      }
      setLoading(false);
    }
    loadAdminData();
  }, [supabase]);

  // Modals state
  const [pointModal, setPointModal] = useState<{ userId: string; name: string } | null>(null);
  const [pointAdj, setPointAdj] = useState({ amount: "", reason: "", type: "add" as "add"|"sub" });

  const [refundModal, setRefundModal] = useState<{ marketId: string; title: string, total: number } | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [newEvent, setNewEvent] = useState({ title: "", description: "" });
  const [newNotice, setNewNotice] = useState({ title: "", content: "" });

  const handleScrapeGiftishow = async () => {
    if (!giftishowUrl) { showToast("URL을 입력하세요.", "warn"); return; }
    setScraping(true);
    try {
      const res = await fetch("/api/giftishow-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: giftishowUrl }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "가져오기 실패", "warn"); return; }
      setNewShopItem(prev => ({
        ...prev,
        name:           data.name          || prev.name,
        category:       data.category      || prev.category,
        description:    data.description   || prev.description,
        subtitle:       data.subtitle      || prev.subtitle,
        price:          data.price         ? String(data.price)          : prev.price,
        original_price: data.originalPrice ? String(data.originalPrice)  : prev.original_price,
        discount_rate:  data.discountRate  ? String(data.discountRate)   : prev.discount_rate,
        issuer_name:    data.issuerName    || prev.issuer_name,
        usage_notes:    data.usageNotes    || prev.usage_notes,
        image_url:      data.imageUrl      || prev.image_url,
        giftishow_url:  giftishowUrl,
      }));
      if (data.category && !shopCategories.includes(data.category)) {
        setShopCategories(prev => [...prev, data.category]);
      }
      setCategoryInput(data.category || "");
      showToast("✅ 상품 정보를 가져왔습니다. 확인 후 등록하세요.");
    } catch {
      showToast("스크래핑 오류", "warn");
    } finally {
      setScraping(false);
    }
  };

  const handleAddShopItem = async () => {
    const { name, description, price, image_url, giftishow_url, subtitle, issuer_name, usage_notes, original_price, discount_rate } = newShopItem;
    const category = showNewCategory ? categoryInput : (newShopItem.category || categoryInput);
    if (!name || !category || !price) { showToast("이름, 카테고리, 가격은 필수입니다.", "warn"); return; }
    const autoId = giftishow_url?.match(/goodsNo=(\d+)/)
      ? `gifti-${giftishow_url.match(/goodsNo=(\d+)/)![1]}`
      : `item-${Date.now()}`;
    const { error } = await supabase.from("shop_items").insert({
      id: autoId,
      name, category, description,
      price:          parseInt(price),
      original_price: original_price ? parseInt(original_price) : null,
      discount_rate:  discount_rate  ? parseFloat(discount_rate)  : null,
      subtitle:       subtitle       || null,
      issuer_name:    issuer_name    || null,
      usage_notes:    usage_notes    || null,
      image_url:      image_url      || null,
      giftishow_url:  giftishow_url  || null,
      icon_key:       "gift",
      sort_order:     adminShopItems.length + 1,
    });
    if (error) { showToast("추가 실패: " + error.message, "warn"); return; }
    const { data } = await supabase.from("shop_items").select("*").order("sort_order", { ascending: true });
    if (data) {
      setAdminShopItems(data);
      const cats = [...new Set(data.map((i: any) => i.category).filter(Boolean))] as string[];
      setShopCategories(cats);
    }
    setNewShopItem({ name: "", category: "", description: "", subtitle: "", price: "", original_price: "", discount_rate: "", issuer_name: "", usage_notes: "", image_url: "", giftishow_url: "" });
    setCategoryInput(""); setShowNewCategory(false); setGiftishowUrl("");
    showToast("상품 추가 완료");
  };

  const handleToggleShopItem = async (id: string, is_active: boolean) => {
    await supabase.from("shop_items").update({ is_active: !is_active }).eq("id", id);
    setAdminShopItems(prev => prev.map(i => i.id === id ? { ...i, is_active: !is_active } : i));
  };

  const handleDeleteShopItem = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from("shop_items").delete().eq("id", id);
    setAdminShopItems(prev => prev.filter(i => i.id !== id));
    showToast("상품 삭제 완료");
  };

  // (Data loading moved up)

  if (loading) return <div className="animated-bg" style={{ minHeight: "100vh" }} />;

  // Authorization check
  const ADMIN_EMAILS = ["koesig@gmail.com", "tlw.seoul@gmail.com"];
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return (
      <div className="animated-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar points={0} streak={0} />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              background: "var(--bg-card)", border: "1px solid var(--accent-no)", 
              padding: 40, borderRadius: 20, textAlign: "center", maxWidth: 400 
            }}
          >
            <ShieldAlert size={64} color="var(--accent-no)" style={{ margin: "0 auto 20px" }} />
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>접근 권한 없음</h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>이 페이지는 최고 관리자만 접근할 수 있는 보안 구역입니다.</p>
          </motion.div>
        </main>
      </div>
    );
  }

  const toggleAdmin = async (id: string, currentAdmin: boolean) => {
    if (id === user.id) return;
    await supabase.from("profiles").update({ is_admin: !currentAdmin }).eq("id", id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: !currentAdmin } : u));
  };

  const handleMarketAction = async (id: string, action: MockMarket["status"]) => {
    const market = markets.find(m => m.id === id);
    if (!market) return;
    const creatorEmail = users.find(u => u.id === market.created_by)?.email;

    if (action === "resolved_yes" || action === "resolved_no") {
      const sideLabel = action === "resolved_yes" ? "YES 승리" : "NO 승리";
      if (!confirm(`정말 이 마켓을 "${sideLabel}"로 최종 확정하시겠습니까?\n\n마켓: ${market.title}\n\n이 작업은 되돌릴 수 없습니다.`)) return;

      const side = action === "resolved_yes" ? "yes" : "no";
      await supabase.rpc('resolve_market', { p_market_id: id, p_winning_side: side });
      
      // 정산 메일 발송 로직 추가
      const { data: betsData } = await supabase
        .from("bets")
        .select(`
          user_id, amount, side,
          profiles ( email, full_name )
        `)
        .eq("market_id", id);
        
      if (betsData && betsData.length > 0) {
        sendMarketSettlementEmails(betsData, market.title, side).catch(console.error);
      }
      
    } else {
      await supabase.from("markets").update({ status: action }).eq("id", id);
      
      // 승인/반려 메일 발송
      if ((action === "active" || action === "cancelled") && creatorEmail) {
        sendMarketApprovalEmail(creatorEmail, market.title, action).catch(console.error);
      }
    }
    setMarkets(prev => prev.map(m => m.id === id ? { ...m, status: action } : m));
  };

  const toggleMarketFeatured = async (id: string, current: boolean) => {
    await supabase.from("markets").update({ is_featured: !current }).eq("id", id);
    setMarkets(prev => prev.map(m => m.id === id ? { ...m, is_featured: !current } : m));
  };

  const assignMarketEvent = async (id: string, eventId: string) => {
    const val = eventId === "none" ? null : eventId;
    await supabase.from("markets").update({ event_id: val }).eq("id", id);
    setMarkets(prev => prev.map(m => m.id === id ? { ...m, event_id: val } : m));
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title) return;
    const { data } = await supabase.from("events").insert([newEvent]).select();
    if (data && data.length > 0) {
      setEvents(prev => [data[0], ...prev]);
      setNewEvent({ title: "", description: "" });
    }
  };

  const toggleEventFeatured = async (id: string, current: boolean) => {
    await supabase.from("events").update({ is_featured: !current }).eq("id", id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, is_featured: !current } : e));
  };

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) return;
    const { data } = await supabase.from("announcements").insert([newNotice]).select();
    if (data && data.length > 0) {
      setNotices(prev => [data[0], ...prev]);
      setNewNotice({ title: "", content: "" });
      showToast("공지사항이 등록되었습니다.", "success");
    }
  };

  const toggleNoticeActive = async (id: string, current: boolean) => {
    await supabase.from("announcements").update({ is_active: !current }).eq("id", id);
    setNotices(prev => prev.map(n => n.id === id ? { ...n, is_active: !current } : n));
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    setNotices(prev => prev.filter(n => n.id !== id));
    showToast("삭제되었습니다.", "success");
  };

  const handleCompleteOrder = async (id: string) => {
    await supabase.from("shop_orders").update({ status: "completed" }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "completed" } : o));
  };

  const executePointAdjustment = async () => {
    if (!pointModal) return;
    const val = parseInt(pointAdj.amount);
    if (isNaN(val) || val <= 0) return;

    const userProfile = users.find(u => u.id === pointModal.userId);
    const newPoints = pointAdj.type === "add" ? userProfile.points + val : Math.max(0, userProfile.points - val);

    await supabase.from("profiles").update({ points: newPoints }).eq("id", pointModal.userId);
    await supabase.from("point_transactions").insert({
      user_id: pointModal.userId,
      amount: pointAdj.type === "add" ? val : -val,
      type: pointAdj.type === "add" ? "reward" : "refund",
      description: `관리자 조정: ${pointAdj.reason}`
    });

    setUsers(prev => prev.map(u => u.id === pointModal.userId ? { ...u, points: newPoints } : u));
    setPointModal(null);
    setPointAdj({ amount: "", reason: "", type: "add" });
  };

  const executeRefund = async () => {
    if (!refundModal) return;
    await supabase.rpc('refund_market', { p_market_id: refundModal.marketId });
    setMarkets(prev => prev.map(m => m.id === refundModal.marketId ? { ...m, status: "hidden" } : m));
    setRefundModal(null);
    setRefundReason("");
  };

  const handleEventAction = async (eventId: string, newStatus: string) => {
    if (!confirm(`이 이벤트를 ${newStatus === 'hidden' ? '숨김' : '활성'} 처리하시겠습니까?`)) return;
    
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
    
    const { error } = await supabase.from("events").update({ status: newStatus }).eq("id", eventId);
    if (error) {
      showToast(`에러: ${error.message}`, "warn");
      const { data: evts } = await supabase.from("events").select("*").order("created_at", { ascending: false });
      if (evts) setEvents(evts);
    } else {
      showToast(`이벤트가 성공적으로 ${newStatus === 'hidden' ? '숨겨졌' : '활성화되었'}습니다.`, "success");
    }
  };

  const handleDeduplicate = async () => {
    if (!confirm("중복된 이벤트와 마켓을 정리하시겠습니까? (이름이 같은 항목 중 가장 처음 생성된 것만 남기고 삭제합니다)")) return;
    
    // Events
    const { data: evts } = await supabase.from("events").select("id, title, created_at").order("created_at", { ascending: true });
    if (evts) {
      const titleMap: Record<string, string[]> = {};
      for (const ev of evts) {
        if (!titleMap[ev.title]) titleMap[ev.title] = [];
        titleMap[ev.title].push(ev.id);
      }
      for (const [title, ids] of Object.entries(titleMap)) {
        if (ids.length > 1) {
          const toDelete = ids.slice(1);
          for (const id of toDelete) {
            await supabase.from("events").update({ status: 'hidden' }).eq("id", id);
          }
        }
      }
    }

    // Markets
    const { data: mkts } = await supabase.from("markets").select("id, title, created_at").order("created_at", { ascending: true });
    if (mkts) {
      const titleMap: Record<string, string[]> = {};
      for (const m of mkts) {
        if (!titleMap[m.title]) titleMap[m.title] = [];
        titleMap[m.title].push(m.id);
      }
      for (const [title, ids] of Object.entries(titleMap)) {
        if (ids.length > 1) {
          const toDelete = ids.slice(1);
          for (const id of toDelete) {
            await supabase.from("markets").update({ status: 'hidden' }).eq("id", id);
          }
        }
      }
    }

    showToast("중복 데이터 정리가 완료되었습니다.", "success");
    // Refresh Data
    const { data: newEvts } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    if (newEvts) setEvents(newEvts);
    const { data: newMkts } = await supabase.from("markets").select("*").order("created_at", { ascending: false });
    if (newMkts) setMarkets(newMkts);
  };

  return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={1530000} streak={100} />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 20px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Lock size={32} color="var(--accent-no)" />
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)" }}>관리자 패널</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <button 
            onClick={() => setActiveTab("users")}
            style={{
              padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", border: "none",
              background: activeTab === "users" ? "var(--purple-primary)" : "var(--bg-card)",
              color: activeTab === "users" ? "white" : "var(--text-secondary)",
            }}
          >
            <Users size={18} /> 회원/포인트 관리
          </button>
          <button 
            onClick={() => setActiveTab("markets")}
            style={{
              padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", border: "none",
              background: activeTab === "markets" ? "var(--accent-yes)" : "var(--bg-card)",
              color: activeTab === "markets" ? "white" : "var(--text-secondary)",
            }}
          >
            <TrendingUp size={18} /> 마켓 숨김/정산 관리
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", border: "none",
              background: activeTab === "orders" ? "var(--purple-primary)" : "var(--bg-card)",
              color: activeTab === "orders" ? "white" : "var(--text-secondary)",
            }}
          >
            <CheckCircle size={18} /> 상점 주문
          </button>
          <button 
            onClick={() => setActiveTab("events")}
            style={{
              padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", border: "none",
              background: activeTab === "events" ? "var(--accent-yes)" : "var(--bg-card)",
              color: activeTab === "events" ? "white" : "var(--text-secondary)",
            }}
          >
            <Calendar size={18} /> 이벤트 관리
          </button>
          <button 
            onClick={() => setActiveTab("notices")}
            style={{
              padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", border: "none",
              background: activeTab === "notices" ? "var(--purple-primary)" : "var(--bg-card)",
              color: activeTab === "notices" ? "white" : "var(--text-secondary)",
            }}
          >
            <Bell size={18} /> 공지사항 관리
          </button>
          <button
            onClick={() => setActiveTab("shop_items")}
            style={{
              padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", border: "none",
              background: activeTab === "shop_items" ? "var(--accent-yes)" : "var(--bg-card)",
              color: activeTab === "shop_items" ? "white" : "var(--text-secondary)",
            }}
          >
            <Store size={18} /> 상점 상품
          </button>
        </div>

        {/* Contents Area */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {activeTab === "users" ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>회원 정보</th>
                    <th style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>티어 / 포인트</th>
                    <th style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)", textAlign: "center" }}>운영권한</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const tInfo = tierConfig[getTier(u.points) as keyof typeof tierConfig];
                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{u.full_name || u.email}</div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{u.email}</div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 800 }}>{formatPoints(u.points)}</span>
                            <button 
                              onClick={() => setPointModal({ userId: u.id, name: u.full_name || u.email })}
                              style={{ 
                                background: "rgba(139,92,246,0.1)", border: "1px solid var(--purple-primary)", color: "var(--purple-primary)",
                                borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 
                              }}>
                              <Coins size={12} /> 관리
                            </button>
                          </div>
                          <div style={{ fontSize: 12, color: tInfo.color }}>{tInfo.emoji} {tInfo.label}</div>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                          <button 
                            onClick={() => toggleAdmin(u.id, u.is_admin)}
                            disabled={["koesig@gmail.com", "tlw.seoul@gmail.com"].includes(u.email)}
                            style={{
                              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: ["koesig@gmail.com", "tlw.seoul@gmail.com"].includes(u.email) ? "not-allowed" : "pointer",
                              border: `1px solid ${u.is_admin ? "var(--accent-no)" : "var(--border)"}`,
                              background: u.is_admin ? "rgba(244,63,94,0.1)" : "transparent",
                              color: u.is_admin ? "var(--accent-no)" : "var(--text-secondary)",
                            }}
                          >
                            {u.is_admin ? "✔️ Admin" : "권한 부여"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : activeTab === "markets" ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Market Filter */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {(["all", "pending", "active", "ended", "resolved"] as const).map(f => (
                  <button key={f} onClick={() => setMarketFilter(f)} style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none",
                    background: marketFilter === f ? "var(--purple-primary)" : "var(--bg-secondary)",
                    color: marketFilter === f ? "white" : "var(--text-secondary)"
                  }}>
                    {f === "all" ? `전체 (${markets.length})` : f === "pending" ? `대기중 (${markets.filter(m => m.status === "pending").length})` : f === "active" ? `진행중 (${markets.filter(m => m.status === "active" && (!m.end_date || new Date(m.end_date) > new Date())).length})` : f === "ended" ? `마감됨 (${markets.filter(m => m.status === "active" && m.end_date && new Date(m.end_date) <= new Date()).length})` : `판정됨 (${markets.filter(m => m.status.startsWith("resolved")).length})`}
                  </button>
                ))}
              </div>
              {markets.filter(m => {
                if (marketFilter === "all") return true;
                if (marketFilter === "pending") return m.status === "pending";
                if (marketFilter === "active") return m.status === "active" && (!m.end_date || new Date(m.end_date) > new Date());
                if (marketFilter === "ended") return m.status === "active" && m.end_date && new Date(m.end_date) <= new Date();
                if (marketFilter === "resolved") return m.status.startsWith("resolved");
                return true;
              }).map(m => {
                const isEnded = m.status === "active" && m.end_date && new Date(m.end_date) <= new Date();
                const isResolved = m.status === "resolved_yes" || m.status === "resolved_no";
                return (
                <div key={m.id} style={{
                  padding: 24, borderRadius: 12, border: "1px solid var(--border)",
                  background: m.status === "hidden" ? "var(--bg-secondary)" : (m.status === "pending" ? "rgba(245, 158, 11, 0.05)" : isResolved ? "rgba(139,92,246,0.03)" : "transparent"),
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
                  opacity: m.status === "hidden" ? 0.6 : 1
                }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 800, display: "flex", gap: 8, alignItems: "center" }}>
                      상태: <span style={{
                        color: m.status === "pending" ? "#f59e0b" : 
                               isEnded ? "#f97316" :
                               m.status === "active" ? "#22d3a0" :
                               m.status === "hidden" ? "var(--text-secondary)" : "var(--purple-primary)"
                      }}>{isEnded ? "마감됨 (결과 대기)" : isResolved ? (m.status === "resolved_yes" ? "✅ YES 승리 확정" : "✅ NO 승리 확정") : m.status.toUpperCase()}</span>
                      {m.end_date && <span style={{ color: "var(--text-muted)", fontSize: 11 }}>마감: {new Date(m.end_date).toLocaleString('ko-KR')}</span>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, textDecoration: m.status === "hidden" ? "line-through" : "none" }}>
                      {m.title}
                    </div>
                    
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                      <button 
                        onClick={() => toggleMarketFeatured(m.id, m.is_featured)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: m.is_featured ? "#eab308" : "var(--text-muted)" }}
                      >
                        <Star size={16} fill={m.is_featured ? "#eab308" : "none"} /> Featured
                      </button>
                      <select 
                        value={m.event_id || "none"} 
                        onChange={(e) => assignMarketEvent(m.id, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 4, background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontSize: 12 }}
                      >
                        <option value="none">-- 이벤트 없음 --</option>
                        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                      </select>
                    </div>

                    {!m.status.startsWith("resolved") && m.status !== "hidden" && (
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        누적 베팅: YES {formatPoints(m.yes_pool)} / NO {formatPoints(m.no_pool)} (합계: {formatPoints(m.yes_pool + m.no_pool)})
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {m.status === "pending" && (
                      <>
                        <button onClick={() => handleMarketAction(m.id, "active" as any)} style={{ padding: "8px 16px", background: "var(--accent-yes)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>승인/게시</button>
                        <button onClick={() => handleMarketAction(m.id, "cancelled" as any)} style={{ padding: "8px 16px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>거절</button>
                      </>
                    )}
                    {(isEnded || m.status === "active") && !isResolved && (
                      <>
                        <button onClick={() => { if (!confirm(`정말 "${m.title}" 마켓을 숨기고 전액 환불 처리하시겠습니까?`)) return; setRefundModal({ marketId: m.id, title: m.title, total: m.yes_pool + m.no_pool }); }} style={{ padding: "8px 16px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                          <EyeOff size={14} /> 환불
                        </button>
                        {isEnded && (
                          <>
                            <button onClick={() => handleMarketAction(m.id, "resolved_yes" as any)} style={{ padding: "8px 16px", background: "rgba(34,211,160,0.1)", color: "var(--accent-yes)", border: "1px solid var(--accent-yes)", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>YES 판정</button>
                            <button onClick={() => handleMarketAction(m.id, "resolved_no" as any)} style={{ padding: "8px 16px", background: "rgba(244,63,94,0.1)", color: "var(--accent-no)", border: "1px solid var(--accent-no)", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>NO 판정</button>
                          </>
                        )}
                      </>
                    )}
                    {isResolved && (
                      <div style={{ padding: "8px 16px", background: "rgba(139,92,246,0.1)", borderRadius: 8, fontWeight: 700, color: "var(--purple-primary)", fontSize: 13 }}>
                        {m.status === "resolved_yes" ? "✅ YES 승리 확정" : "✅ NO 승리 확정"}
                      </div>
                    )}
                  </div>
                </div>
              );})}
            </div>
          ) : activeTab === "orders" ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {orders.map(o => {
                const userProfile = users.find(u => u.id === o.user_id);
                return (
                  <div key={o.id} style={{
                    padding: 20, borderRadius: 8, border: "1px solid var(--border)",
                    background: "var(--bg-card)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>주문일시: {o.created_at.replace("T", " ").substring(0, 16)}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>{o.item_name} ({formatPoints(o.price)})</div>
                      <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                        신청자: {userProfile ? userProfile.email : "알 수 없음"} <br/>
                        수신 연락처: <strong style={{ color: "var(--purple-primary)" }}>{o.contact_info}</strong>
                      </div>
                    </div>
                    <div>
                      {o.status === "pending" ? (
                        <button onClick={() => handleCompleteOrder(o.id)} style={{ padding: "10px 20px", background: "var(--accent-yes)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                          카톡/SMS 전송 완료 (승인)
                        </button>
                      ) : (
                        <span style={{ padding: "8px 16px", background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontWeight: 700 }}>
                          발송 완료됨
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {orders.length === 0 && <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>들어온 상점 주문이 없습니다.</div>}
            </div>
          ) : activeTab === "events" ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "var(--bg-secondary)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>새 이벤트 생성</h3>
                <div style={{ display: "flex", gap: 12 }}>
                  <input type="text" placeholder="이벤트 제목 (예: 2027년 대통령 선거)" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
                  <input type="text" placeholder="설명 (선택)" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} style={{ flex: 2, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
                  <button onClick={handleCreateEvent} style={{ padding: "10px 20px", background: "var(--purple-primary)", color: "white", borderRadius: 8, fontWeight: 700, border: "none", cursor: "pointer" }}>생성</button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>이벤트 목록</h3>
                <button onClick={handleDeduplicate} style={{ padding: "8px 16px", background: "rgba(244,63,94,0.1)", color: "var(--accent-no)", border: "1px solid var(--accent-no)", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  🧹 중복 일괄 정리
                </button>
              </div>

              <div>
                {events.map(ev => (
                  <div key={ev.id} style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{ev.description || "설명 없음"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                        포함된 마켓: {markets.filter(m => m.event_id === ev.id).length}개
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <button 
                        onClick={() => toggleEventFeatured(ev.id, ev.is_featured)}
                        style={{ padding: "8px 16px", borderRadius: 8, background: ev.is_featured ? "rgba(234,179,8,0.1)" : "transparent", border: ev.is_featured ? "1px solid #eab308" : "1px solid var(--border)", color: ev.is_featured ? "#eab308" : "var(--text-secondary)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <Star size={16} fill={ev.is_featured ? "#eab308" : "none"} /> Featured
                      </button>

                      {ev.status !== 'hidden' ? (
                        <button 
                          onClick={() => handleEventAction(ev.id, 'hidden')}
                          style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "var(--accent-no)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <EyeOff size={16} /> 숨김
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEventAction(ev.id, 'active')}
                          style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(34,211,160,0.1)", border: "1px solid rgba(34,211,160,0.3)", color: "var(--accent-yes)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <Eye size={16} /> 복구
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {events.length === 0 && <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>등록된 이벤트가 없습니다.</div>}
              </div>
            </div>
          ) : activeTab === "notices" ? (
            <div style={{ padding: 20 }}>
              <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>신규 공지사항 등록</h3>
                <input 
                  type="text" placeholder="공지 제목" 
                  value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                  style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", marginBottom: 12 }}
                />
                <textarea 
                  placeholder="공지 내용" 
                  value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", minHeight: 120, resize: "vertical", marginBottom: 12 }}
                />
                <button onClick={handleCreateNotice} style={{ background: "var(--purple-primary)", color: "white", padding: "12px 24px", borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer" }}>
                  등록하기
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {notices.map(n => (
                  <div key={n.id} style={{ background: "var(--bg-primary)", borderRadius: 12, border: `1px solid ${n.is_active ? 'var(--purple-primary)' : 'var(--border)'}`, padding: 20, opacity: n.is_active ? 1 : 0.6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <h4 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>
                          {n.is_active ? "🟢 " : "🔴 "}{n.title}
                        </h4>
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(n.created_at).toLocaleString('ko-KR')}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleNoticeActive(n.id, n.is_active)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface-alt)", fontSize: 13, cursor: "pointer" }}>
                          {n.is_active ? "비활성화" : "활성화"}
                        </button>
                        <button onClick={() => handleDeleteNotice(n.id)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--accent-no)", background: "rgba(244,63,94,0.1)", color: "var(--accent-no)", fontSize: 13, cursor: "pointer" }}>
                          삭제
                        </button>
                      </div>
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {n.content}
                    </div>
                  </div>
                ))}
                {notices.length === 0 && <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>등록된 공지사항이 없습니다.</div>}
              </div>
            </div>
          ) : activeTab === "shop_items" ? (
            <div style={{ padding: 20 }}>
              <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>신규 상품 등록</h3>

                {/* Giftishow URL 자동 가져오기 */}
                <div style={{ marginBottom: 14, padding: "14px", background: "rgba(99,102,241,0.06)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>🔗 Giftishow Biz URL로 자동 가져오기</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="url"
                      placeholder="https://biz.giftishow.com/ggoods/detail?goodsNo=..."
                      value={giftishowUrl}
                      onChange={e => setGiftishowUrl(e.target.value)}
                      style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 13 }}
                    />
                    <button
                      onClick={handleScrapeGiftishow}
                      disabled={scraping}
                      style={{ padding: "10px 18px", background: scraping ? "var(--surface-alt)" : "var(--accent)", color: scraping ? "var(--text-muted)" : "white", borderRadius: 8, fontWeight: 700, border: "none", cursor: scraping ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontSize: 13 }}
                    >
                      {scraping ? "가져오는 중…" : "정보 가져오기"}
                    </button>
                  </div>
                </div>

                {/* 상품명 */}
                <input type="text" placeholder="상품명 *" value={newShopItem.name} onChange={e => setNewShopItem({...newShopItem, name: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", marginBottom: 10, boxSizing: "border-box" }} />

                {/* 카테고리 */}
                <div style={{ marginBottom: 10 }}>
                  {!showNewCategory ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <select
                        value={newShopItem.category}
                        onChange={e => setNewShopItem({...newShopItem, category: e.target.value})}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: newShopItem.category ? "var(--text-primary)" : "var(--text-muted)" }}
                      >
                        <option value="">카테고리 선택 *</option>
                        {shopCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button onClick={() => setShowNewCategory(true)} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontSize: 13 }}>+ 직접 입력</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" placeholder="새 카테고리 입력" value={categoryInput} onChange={e => setCategoryInput(e.target.value)} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--purple-primary)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
                      <button onClick={() => setShowNewCategory(false)} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>목록 선택</button>
                    </div>
                  )}
                </div>

                {/* 정상가 / 판매가 / 할인율 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>정상가 (원)</div>
                    <input type="number" placeholder="예: 5000" value={newShopItem.original_price} onChange={e => setNewShopItem({...newShopItem, original_price: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>판매가 (포인트) *</div>
                    <input type="number" placeholder="예: 4500" value={newShopItem.price} onChange={e => setNewShopItem({...newShopItem, price: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>할인율 (%)</div>
                    <input type="number" placeholder="예: 10" value={newShopItem.discount_rate} onChange={e => setNewShopItem({...newShopItem, discount_rate: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* 한줄 설명 (subtitle) */}
                <input type="text" placeholder="목록 부제목 (예: 스타벅스 아메리카노 Tall)" value={newShopItem.subtitle} onChange={e => setNewShopItem({...newShopItem, subtitle: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", marginBottom: 10, boxSizing: "border-box" }} />

                {/* 상품 설명 */}
                <input type="text" placeholder="상품 설명 (카드 하단 안내)" value={newShopItem.description} onChange={e => setNewShopItem({...newShopItem, description: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", marginBottom: 10, boxSizing: "border-box" }} />

                {/* 발행사 */}
                <input type="text" placeholder="발행사 (예: 스타벅스커피코리아)" value={newShopItem.issuer_name} onChange={e => setNewShopItem({...newShopItem, issuer_name: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", marginBottom: 10, boxSizing: "border-box" }} />

                {/* 이용안내 */}
                <textarea placeholder="이용안내 (이용 유의사항 전문)" value={newShopItem.usage_notes} onChange={e => setNewShopItem({...newShopItem, usage_notes: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: 80, resize: "vertical", marginBottom: 10, boxSizing: "border-box" }} />

                {/* 이미지 URL + 미리보기 */}
                <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                  <input type="url" placeholder="이미지 URL (스크래핑 시 자동 입력)" value={newShopItem.image_url} onChange={e => setNewShopItem({...newShopItem, image_url: e.target.value})} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 13 }} />
                  {newShopItem.image_url && <img src={newShopItem.image_url} alt="preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)", flexShrink: 0 }} />}
                </div>

                <button onClick={handleAddShopItem} style={{ padding: "12px 24px", background: "var(--accent-yes)", color: "white", borderRadius: 8, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <PlusCircle size={16} /> 상품 등록
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {adminShopItems.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 10, border: `1px solid ${item.is_active ? "var(--border)" : "rgba(0,0,0,0.1)"}`, background: item.is_active ? "var(--bg-card)" : "var(--bg-secondary)", opacity: item.is_active ? 1 : 0.55 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        [{item.id}] · {item.category} · {item.price.toLocaleString()}P · 아이콘: {item.icon_key}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleToggleShopItem(item.id, item.is_active)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: item.is_active ? "rgba(34,211,160,0.1)" : "rgba(244,63,94,0.1)", color: item.is_active ? "var(--accent-yes)" : "var(--accent-no)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        {item.is_active ? "활성" : "비활성"}
                      </button>
                      <button onClick={() => handleDeleteShopItem(item.id)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.1)", color: "var(--accent-no)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
                {adminShopItems.length === 0 && <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>등록된 상품이 없습니다.</div>}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Point Adjusted Modal */}
      <AnimatePresence>
        {pointModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: 20 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400 }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>사용자 포인트 관리</h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>대상: <strong>{pointModal.name}</strong></p>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button 
                  onClick={() => setPointAdj({ ...pointAdj, type: "add" })}
                  style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 700, border: `1px solid ${pointAdj.type === "add" ? "var(--purple-primary)" : "var(--border)"}`, background: pointAdj.type === "add" ? "rgba(139,92,246,0.1)" : "transparent", color: pointAdj.type === "add" ? "var(--purple-primary)" : "var(--text-secondary)", cursor: "pointer" }}>➕ 지급(Add)</button>
                <button 
                  onClick={() => setPointAdj({ ...pointAdj, type: "sub" })}
                  style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 700, border: `1px solid ${pointAdj.type === "sub" ? "var(--accent-no)" : "var(--border)"}`, background: pointAdj.type === "sub" ? "rgba(244,63,94,0.1)" : "transparent", color: pointAdj.type === "sub" ? "var(--accent-no)" : "var(--text-secondary)", cursor: "pointer" }}>➖ 차감(Sub)</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                <input type="number" placeholder="포인트 금액 (예: 5000)" value={pointAdj.amount} onChange={e => setPointAdj({ ...pointAdj, amount: e.target.value })} style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }} />
                <input type="text" placeholder="사유 (이벤트 지급, 어뷰징 패널티 등)" value={pointAdj.reason} onChange={e => setPointAdj({ ...pointAdj, reason: e.target.value })} style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setPointModal(null)} style={{ flex: 1, padding: 14, borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer" }}>취소</button>
                <button onClick={executePointAdjustment} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: "var(--purple-primary)", color: "white", fontWeight: 700, cursor: "pointer" }}>실행</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Hide & Refund Modal */}
        {refundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: 20 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: "var(--bg-primary)", border: "1px solid var(--accent-no)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440 }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--accent-no)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={20} /> 마켓 블라인드 및 환불
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
                <strong>"{refundModal.title}"</strong> 마켓을 메인에서 숨김 처리하고, 참가자들이 걸었던 총 <strong>{formatPoints(refundModal.total)}</strong> 포인트를 사용자들에게 전액 반환합니까?
              </p>

              <input type="text" placeholder="약관 위배/기준 모호 등 환불 사유 기입" value={refundReason} onChange={e => setRefundReason(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15, marginBottom: 24 }} />

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setRefundModal(null)} style={{ flex: 1, padding: 14, borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer" }}>취소</button>
                <button onClick={executeRefund} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: "var(--accent-no)", color: "white", fontWeight: 700, cursor: "pointer" }}>숨김 및 환불 승인</button>
              </div>
            </motion.div>
          </motion.div>
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
