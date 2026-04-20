"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { getTier, tierConfig, formatPoints } from "@/lib/data";
import { Menu, X, LogIn, User, LogOut, FileText, PlusCircle, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
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
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 20px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38 }}>
            <img src="/logo.svg" alt="Policat" width={38} height={38} />
          </div>
          <div>
            <span style={{
              fontSize: 22, fontWeight: 900,
              color: "var(--purple-primary)", letterSpacing: "-0.04em"
            }}>Policat</span>
          </div>
        </Link>

        {/* Center Nav */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="hidden-mobile">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} style={{
                color: isActive ? "var(--purple-primary)" : "var(--text-secondary)", 
                textDecoration: "none",
                padding: "8px 14px", borderRadius: 8,
                fontSize: 15, fontWeight: isActive ? 800 : 600,
                transition: "all 0.2s",
                background: isActive ? "rgba(139, 92, 246, 0.1)" : "transparent"
              }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
                }}
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
                <div className="streak-active hidden-mobile" style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: 8, padding: "4px 10px",
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 13, fontWeight: 700, color: "#f59e0b"
                }}>
                  🔥 {streak}
                </div>
              )}
              {/* Points */}
              <Link href="/profile/me" style={{ textDecoration: "none" }} className="hidden-mobile">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10, padding: "6px 14px",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{tierInfo.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>
                      {formatPoints(points)}
                    </div>
                    <div style={{ fontSize: 10, color: tierInfo.color, lineHeight: 1, fontWeight: 700 }}>
                      {tierInfo.label}
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Profile Dropdown Container */}
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  style={{
                    background: "transparent", border: "1px solid var(--border)",
                    borderRadius: "50%", width: 38, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text-secondary)"
                  }}
                  title="프로필 메뉴"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                  ) : (
                    <User size={18} />
                  )}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: "absolute", top: 48, right: 0,
                        width: 220, background: "var(--bg-primary)",
                        border: "1px solid var(--border)", borderRadius: 12,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        overflow: "hidden", zIndex: 1000
                      }}
                    >
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>로그인 됨</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {user.user_metadata?.full_name || user.email}
                        </div>
                      </div>
                      <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        <Link href="/profile/me" onClick={() => setProfileDropdown(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", textDecoration: "none", color: "var(--text-primary)", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                          <FileText size={16} /> 내 정보 및 내역
                        </Link>
                        <Link href="/create" onClick={() => setProfileDropdown(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", textDecoration: "none", color: "var(--purple-primary)", borderRadius: 8, fontSize: 14, fontWeight: 600, background: "rgba(139, 92, 246, 0.05)" }}>
                          <PlusCircle size={16} /> 마켓 제안하기
                        </Link>
                        {user.email === "koesig@gmail.com" && (
                          <Link href="/admin" onClick={() => setProfileDropdown(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", textDecoration: "none", color: "white", borderRadius: 8, fontSize: 14, fontWeight: 700, background: "var(--accent-no)", marginTop: 4 }}>
                            <Settings size={16} /> 관리자 패널
                          </Link>
                        )}
                        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", color: "var(--text-secondary)", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", textAlign: "left" }}>
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
              onClick={handleLogin}
              style={{
                background: "var(--purple-primary)",
                color: "white", padding: "8px 16px", borderRadius: 8,
                fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              <LogIn size={16} /> 로그인
            </motion.button>
          )}

          {/* Mobile Hamburger toggle */}
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

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: "hidden",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border)"
            }}
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
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatPoints(points)}
                      </div>
                      <div style={{ fontSize: 11, color: tierInfo.color, fontWeight: 600 }}>
                        {tierInfo.label}
                      </div>
                    </div>
                  </div>
                  {streak > 0 && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>🔥 {streak}일 달성</div>
                  )}
                </div>
              )}
              
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href} 
                    onClick={() => setMenuOpen(false)}
                    style={{
                      color: isActive ? "var(--purple-primary)" : "var(--text-primary)", 
                      textDecoration: "none",
                      padding: "12px 0", fontSize: 16, fontWeight: isActive ? 800 : 600,
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
    </nav>
  );
}
