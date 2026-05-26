"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { getTier, tierConfig, formatPoints } from "@/lib/data";
import { Menu, X, LogIn, User, LogOut, FileText, PlusCircle, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import LoginConsentModal from "./LoginConsentModal";

interface NavbarProps {
  points: number;
  xp?: number;
  streak: number;
}

export default function Navbar({ points, xp = points, streak }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      checkAndUpdateConsent(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAndUpdateConsent(session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const checkAndUpdateConsent = async (currentUser: any) => {
    if (!currentUser) return;
    const pendingConsent = localStorage.getItem("policat_pending_consent");
    if (pendingConsent) {
      const { marketing } = JSON.parse(pendingConsent);
      setTimeout(async () => {
        await supabase.from("profiles").update({ 
          terms_accepted: true, 
          marketing_consent: marketing 
        }).eq("id", currentUser.id);
        
        localStorage.removeItem("policat_pending_consent");
        localStorage.setItem("policat_terms_accepted", "true");
      }, 2000);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    const hasAccepted = localStorage.getItem("policat_terms_accepted");
    if (hasAccepted === "true") {
      executeOAuth();
    } else {
      setConsentModalOpen(true);
    }
  };

  const handleConsentConfirm = (marketingConsent: boolean) => {
    localStorage.setItem("policat_pending_consent", JSON.stringify({ marketing: marketingConsent }));
    executeOAuth();
  };

  const executeOAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileDropdown(false);
  };

  const tier = getTier(xp);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];

  const navLinks = [
    { href: "/guide", label: "이용 안내" },
    { href: "/", label: "마켓" },
    { href: "/leaderboard", label: "랭킹" },
    { href: "/earn", label: "포인트 획득" },
    { href: "/shop", label: "상점(교환)" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--bg-secondary)",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 20px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32 }}>
            <img src="/logo.svg" alt="Policat" width={32} height={32} />
          </div>
          <span style={{
            fontSize: 24, fontWeight: 800,
            color: "var(--text-primary)", letterSpacing: "-0.02em",
            fontFamily: "var(--font-montserrat)"
          }}>POLICAT</span>
        </Link>

        {/* Center Nav */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="hidden-mobile">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} style={{
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                textDecoration: "none",
                padding: "8px 14px", borderRadius: "var(--radius-sm)",
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                transition: "all 0.15s",
                background: isActive ? "var(--surface-alt)" : "transparent"
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--surface-alt)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              {/* Streak */}
              {streak > 0 && (
                <div className="hidden-mobile" style={{
                  background: "var(--accent-gold-soft)",
                  borderRadius: "var(--radius-sm)", padding: "4px 10px",
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 13, fontWeight: 700, color: "var(--accent-gold)"
                }}>
                  🔥 <span style={{ fontFamily: "var(--font-mono)" }}>{streak}</span>
                </div>
              )}

              {/* Points */}
              <Link href="/profile/me" style={{ textDecoration: "none" }} className="hidden-mobile">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  style={{
                    background: "var(--surface-alt)",
                    borderRadius: "var(--radius-sm)", padding: "6px 12px",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{tierInfo.emoji}</span>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums"
                    }}>
                      {formatPoints(points)}
                    </div>
                    <div style={{ fontSize: 10, color: tierInfo.color, lineHeight: 1, fontWeight: 600 }}>
                      {tierInfo.label}
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Profile Dropdown */}
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  style={{
                    background: "var(--surface-alt)", border: "none",
                    borderRadius: "var(--radius-pill)", width: 38, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text-secondary)", overflow: "hidden"
                  }}
                  title="프로필 메뉴"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                  ) : (
                    <User size={18} />
                  )}
                </button>

                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "fixed", top: 68, right: 12,
                        width: 220, background: "var(--bg-card)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--shadow-lg)",
                        overflow: "hidden", zIndex: 1000
                      }}
                    >
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>로그인 됨</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {user.user_metadata?.full_name || user.email}
                        </div>
                      </div>
                      <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                        <Link href="/profile/me" onClick={() => setProfileDropdown(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", textDecoration: "none", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500 }}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <FileText size={16} /> 내 정보 및 내역
                        </Link>
                        <Link href="/create" onClick={() => setProfileDropdown(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", textDecoration: "none", color: "var(--accent)", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500, background: "var(--accent-soft)" }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                          <PlusCircle size={16} /> 마켓 제안하기
                        </Link>
                        {user.email === "koesig@gmail.com" && (
                          <Link href="/admin" onClick={() => setProfileDropdown(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", textDecoration: "none", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500 }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Settings size={16} /> 관리자 패널
                          </Link>
                        )}
                        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", color: "var(--text-muted)", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-alt)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <LogOut size={16} /> 로그아웃
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLoginClick}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <LogIn size={16} /> 로그인
            </motion.button>
          )}

          {/* Mobile Hamburger */}
          <button
            className="mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent", border: "none",
              color: "var(--text-primary)", cursor: "pointer",
              padding: 0, display: "flex", alignItems: "center"
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", background: "var(--bg-card)", boxShadow: "var(--shadow-md)" }}
          >
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {user && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 4
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{tierInfo.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {formatPoints(points)}
                      </div>
                      <div style={{ fontSize: 11, color: tierInfo.color, fontWeight: 600 }}>{tierInfo.label}</div>
                    </div>
                  </div>
                  {streak > 0 && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-gold)" }}>🔥 {streak}일</div>
                  )}
                </div>
              )}
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      color: isActive ? "var(--accent)" : "var(--text-primary)",
                      textDecoration: "none",
                      padding: "12px 0", fontSize: 16, fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginConsentModal 
        isOpen={consentModalOpen} 
        onClose={() => setConsentModalOpen(false)} 
        onConfirm={handleConsentConfirm} 
      />
    </nav>
  );
}
