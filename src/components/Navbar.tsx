"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { getTier, tierConfig, formatPoints } from "@/lib/data";

interface NavbarProps {
  points: number;
  streak: number;
}

export default function Navbar({ points, streak }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tier = getTier(points);
  const tierInfo = tierConfig[tier as keyof typeof tierConfig];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(10, 10, 18, 0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 20px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", width: 38, height: 38 }}>
            <Image src="/mascot.png" alt="폴리캣" fill style={{ objectFit: "contain" }} />
          </div>
          <div>
            <span style={{
              fontSize: 20, fontWeight: 800,
              background: "linear-gradient(135deg, #a78bfa, #ec4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>폴리캣</span>
            <span style={{ fontSize: 10, color: "#5a5a7a", display: "block", lineHeight: 1, marginTop: -2 }}>
              예측 마켓
            </span>
          </div>
        </Link>

        {/* Center Nav */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="hidden-mobile">
          {[
            { href: "/", label: "마켓" },
            { href: "/leaderboard", label: "랭킹" },
            { href: "/earn", label: "포인트 획득" },
            { href: "/league", label: "리그" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              color: "#9090b0", textDecoration: "none",
              padding: "8px 14px", borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f0f0ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9090b0")}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: Points + Streak */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Streak */}
          {streak > 0 && (
            <div className="streak-active" style={{
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
          <Link href="/profile/me" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 10, padding: "6px 14px",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: tierInfo.color }}>{tierInfo.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff" }}>
                  {formatPoints(points)}
                </div>
                <div style={{ fontSize: 10, color: tierInfo.color, lineHeight: 1 }}>
                  {tierInfo.label}
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
