"use client";
import Link from "next/link";
import { Instagram, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "48px 20px 32px", marginTop: "auto" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
        
        {/* Brand */}
        <div>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28 }}>
              <img src="/logo.svg" alt="Policat" width={28} height={28} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>POLICAT</span>
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            세상의 모든 이슈를 예측하고 즐기는<br />광고 기반 무료 예측 마켓 플랫폼
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="mailto:koesig@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)", background: "var(--surface-alt)", padding: 8, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>서비스</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li><Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>마켓 둘러보기</Link></li>
            <li><Link href="/leaderboard" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>랭킹 리더보드</Link></li>
            <li><Link href="/shop" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>포인트 상점</Link></li>
            <li><Link href="/notices" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>공지사항</Link></li>
            <li><Link href="/guide" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>이용 안내 (가이드)</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>고객 지원</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li><Link href="/tos" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>서비스 이용약관</Link></li>
            <li><Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>개인정보 처리방침</Link></li>
            <li><a href="mailto:koesig@gmail.com" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>제휴 및 문의</a></li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "40px auto 0", paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          &copy; {new Date().getFullYear()} Policat. All rights reserved. 본 플랫폼의 예측에 사용되는 포인트는 실제 현금 가치가 없습니다.
        </p>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Made with 💙 in Korea
        </div>
      </div>
    </footer>
  );
}
