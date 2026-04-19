"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { ShieldAlert, Users, TrendingUp, Lock, Coins, EyeOff, CheckCircle } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"users" | "markets">("users");

  const [mockUsers, setMockUsers] = useState<MockUser[]>([
    { id: "1", email: "koesig@gmail.com", name: "최고 관리자", points: 1530000, isAdmin: true },
    { id: "2", email: "test1@gmail.com", name: "일반유저A", points: 300, isAdmin: false },
    { id: "3", email: "predictor@gmail.com", name: "예측의신", points: 450000, isAdmin: false },
  ]);

  const [mockMarkets, setMockMarkets] = useState<MockMarket[]>([
    { id: "m1", title: "비트코인 4월 내 100K 돌파?", status: "pending", yesAmount: 0, noAmount: 0 },
    { id: "m2", title: "코스피가 이번 달 안에 2,700선을 돌파할까?", status: "active", yesAmount: 31200, noAmount: 19100 },
    { id: "m3", title: "삼성전자 주가가 한 달 내 8만 원 회복할까?", status: "active", yesAmount: 22400, noAmount: 28500 },
  ]);

  // Modals state
  const [pointModal, setPointModal] = useState<{ userId: string; name: string } | null>(null);
  const [pointAdj, setPointAdj] = useState({ amount: "", reason: "", type: "add" as "add"|"sub" });

  const [refundModal, setRefundModal] = useState<{ marketId: string; title: string, total: number } | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, [supabase]);

  if (loading) return <div className="animated-bg" style={{ minHeight: "100vh" }} />;

  // Authorization check
  if (!user || user.email !== "koesig@gmail.com") {
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

  const toggleAdmin = (id: string) => {
    if (id === "1") return;
    setMockUsers(prev => prev.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  const handleMarketAction = (id: string, action: MockMarket["status"]) => {
    setMockMarkets(prev => prev.map(m => m.id === id ? { ...m, status: action } : m));
  };

  const executePointAdjustment = () => {
    if (!pointModal) return;
    const val = parseInt(pointAdj.amount);
    if (isNaN(val) || val <= 0) return;

    setMockUsers(prev => prev.map(u => {
      if (u.id === pointModal.userId) {
        return { ...u, points: pointAdj.type === "add" ? u.points + val : Math.max(0, u.points - val) };
      }
      return u;
    }));
    setPointModal(null);
    setPointAdj({ amount: "", reason: "", type: "add" });
  };

  const executeRefund = () => {
    if (!refundModal) return;
    // 1. Set market status to hidden
    handleMarketAction(refundModal.marketId, "hidden");
    // (Here, actual backend would return YES/NO participants their amounts via TX processing)
    setRefundModal(null);
    setRefundReason("");
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
                  {mockUsers.map(u => {
                    const tInfo = tierConfig[getTier(u.points) as keyof typeof tierConfig];
                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{u.name}</div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{u.email}</div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 800 }}>{formatPoints(u.points)}</span>
                            <button 
                              onClick={() => setPointModal({ userId: u.id, name: u.name })}
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
                            onClick={() => toggleAdmin(u.id)}
                            disabled={u.id === "1"}
                            style={{
                              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: u.id === "1" ? "not-allowed" : "pointer",
                              border: `1px solid ${u.isAdmin ? "var(--accent-no)" : "var(--border)"}`,
                              background: u.isAdmin ? "rgba(244,63,94,0.1)" : "transparent",
                              color: u.isAdmin ? "var(--accent-no)" : "var(--text-secondary)"
                            }}
                          >
                            {u.isAdmin ? "✔️ Admin" : "권한 부여"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {mockMarkets.map(m => (
                <div key={m.id} style={{
                  padding: 24, borderRadius: 12, border: "1px solid var(--border)",
                  background: m.status === "hidden" ? "var(--bg-secondary)" : (m.status === "pending" ? "rgba(245, 158, 11, 0.05)" : "transparent"),
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
                  opacity: m.status === "hidden" ? 0.6 : 1
                }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 800 }}>
                      상태: <span style={{
                        color: m.status === "pending" ? "#f59e0b" : 
                               m.status === "active" ? "#22d3a0" :
                               m.status === "hidden" ? "var(--text-secondary)" : "var(--accent-no)"
                      }}>{m.status.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, textDecoration: m.status === "hidden" ? "line-through" : "none" }}>
                      {m.title}
                    </div>
                    {["active", "hidden"].includes(m.status) && (
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        누적 베팅: YES {formatPoints(m.yesAmount)} / NO {formatPoints(m.noAmount)} (합계: {formatPoints(m.yesAmount + m.noAmount)})
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {m.status === "pending" && (
                      <>
                        <button onClick={() => handleMarketAction(m.id, "active")} style={{ padding: "8px 16px", background: "var(--accent-yes)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>승인/게시</button>
                        <button onClick={() => handleMarketAction(m.id, "cancelled")} style={{ padding: "8px 16px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>거절</button>
                      </>
                    )}
                    {m.status === "active" && (
                      <>
                        <button onClick={() => setRefundModal({ marketId: m.id, title: m.title, total: m.yesAmount + m.noAmount })} style={{ padding: "8px 16px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                          <EyeOff size={14} /> 숨김 및 전체 환불
                        </button>
                        <button onClick={() => handleMarketAction(m.id, "resolved_yes")} style={{ padding: "8px 16px", background: "rgba(34,211,160,0.1)", color: "var(--accent-yes)", border: "1px solid var(--accent-yes)", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>YES 판정</button>
                        <button onClick={() => handleMarketAction(m.id, "resolved_no")} style={{ padding: "8px 16px", background: "rgba(244,63,94,0.1)", color: "var(--accent-no)", border: "1px solid var(--accent-no)", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>NO 판정</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
}
