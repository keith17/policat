import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AdBanner } from "@/components/AdBanner";
// Note: In real app, you might want to fetch points/streak on server or inside Navbar 
// For this static guide page we just render Navbar with 0 points (it uses client-side fetch for user)

export default function GuidePage() {
  return (
    <div className="animated-bg" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* Navbar will handle user fetching on client side */}
      <Navbar points={0} streak={0} />
      
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", marginBottom: 16 }}>
            폴리캣 시작하기
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            어렵고 복잡한 뉴스, 이제 직관적인 예측으로 가볍게 즐겨보세요! <br />
            폴리캣은 경제·정치 이슈의 결과를 예측하고 보상을 얻는 플랫폼입니다.
          </p>
        </div>

        <section style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Step 1 */}
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{
                background: "var(--purple-primary)", color: "white", 
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 18
              }}>1</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>이슈 마켓 참여하기</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              매일 쏟아지는 뜨거운 이슈들! "한국은행 금리가 오를까?", "이번 선거의 승자는?"<br />
              질문에 대해 자신이 생각하는 방향(YES 또는 NO)에 포인트를 걸어 투표하세요.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{
                background: "var(--accent-yes)", color: "white", 
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 18
              }}>2</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>포인트 획득 방법</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              결제가 전혀 필요 없습니다. 가입 시 <strong>기본 포인트</strong>를 제공해 드리며, 포인트가 부족할 땐 <strong>광고를 시청(포인트 획득 탭)</strong>하여 언제든 충전할 수 있습니다.<br/>
              예측에 성공하면 배당률에 따라 더 큰 포인트를 획득할 수 있습니다!
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{
                background: "var(--accent-gold)", color: "white", 
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 18
              }}>3</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>티어 상승과 기프티콘 리워드</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              꾸준히 예측에 참여하여 랭킹(리더보드)를 올리고 상위 티어를 달성하세요.<br />
              상위 랭커들에게는 커피, 치킨 등 실생활에서 유용한 <strong>모바일 기프티콘(기프티쇼)</strong>을 정기적으로 지급합니다.
            </p>
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: 60 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ padding: "16px 40px", fontSize: 18 }}>
              지금 바로 투표하러 가기
            </button>
          </Link>
        </div>
      </main>
      
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
        <AdBanner type="horizontal" />
      </div>
    </div>
  );
}
