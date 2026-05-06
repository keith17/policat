"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SeedPage() {
  const [status, setStatus] = useState("");
  const supabase = createClient();

  const handleSeed = async () => {
    setStatus("Loading...");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus("Error: You must be logged in first.");
      return;
    }

    const sampleMarkets = [
      {
        title: "한국은행 2026년 상반기 내 기준금리 인하할까?",
        category: "economy",
        yes_pool: 125000,
        no_pool: 35000,
        status: "active",
        created_by: session.user.id
      },
      {
        title: "2026 월드컵 아시아 최종 예선 대한민국 전승 진출?",
        category: "sports",
        yes_pool: 80000,
        no_pool: 92000,
        status: "active",
        created_by: session.user.id
      },
      {
        title: "뉴진스 정규 2집 빌보드 HOT 100 1위 달성?",
        category: "society",
        yes_pool: 300000,
        no_pool: 150000,
        status: "active",
        created_by: session.user.id
      },
      {
        title: "오픈AI GPT-5 연내 공식 출시 성공?",
        category: "society",
        yes_pool: 500000,
        no_pool: 200000,
        status: "active",
        created_by: session.user.id
      }
    ];

    const { error } = await supabase.from('markets').insert(sampleMarkets);
    
    if (error) {
      console.error(error);
      setStatus("Error: " + error.message);
    } else {
      setStatus("Successfully seeded 4 mock markets!");
    }
  };

  const handleSeedEvent = async () => {
    setStatus("이벤트 생성 중...");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus("Error: 로그인이 필요합니다.");
      return;
    }

    // 1. 관리자 권한 강제 부여 (events RLS 통과를 위해 가장 먼저 실행)
    const { error: profileError } = await supabase.from('profiles').update({ is_admin: true }).eq('id', session.user.id);
    if (profileError) {
      console.error("프로필 업데이트 실패:", profileError);
    }

    // 2. 이벤트 생성
    const { data: evData, error: evError } = await supabase.from('events').insert([
      { title: "2026 북중미 월드컵 조별리그 A조 1위", description: "개최국 멕시코가 속한 A조에서 어느 국가가 1위로 32강에 진출할까요? 각 국가별 전력을 분석해 예측해보세요.", is_featured: true, status: "active" }
    ]).select();

    if (evError || !evData || evData.length === 0) {
      setStatus("이벤트 생성 실패: " + (evError?.message || "알 수 없는 에러"));
      return;
    }

    const eventId = evData[0].id;

    const candidates = [
      { title: "대한민국", category: "sports", yes_pool: 0, no_pool: 0, status: "active", created_by: session.user.id, event_id: eventId },
      { title: "멕시코", category: "sports", yes_pool: 0, no_pool: 0, status: "active", created_by: session.user.id, event_id: eventId },
      { title: "체코", category: "sports", yes_pool: 0, no_pool: 0, status: "active", created_by: session.user.id, event_id: eventId },
      { title: "남아프리카공화국", category: "sports", yes_pool: 0, no_pool: 0, status: "active", created_by: session.user.id, event_id: eventId }
    ];

    const { data: mkData, error: mkError } = await supabase.from('markets').insert(candidates).select();

    if (mkError || !mkData) {
      setStatus("마켓 생성 실패: " + mkError?.message);
      return;
    }

    // 4. 과거 히스토리 베팅 데이터 생성 (과거 30일치 차트용)
    setStatus("히스토리 데이터(차트용) 생성 중... (약 10초 소요)");
    const historicalBets = [];
    const now = new Date();
    
    // 대한민국의 드라마틱한 선두 경쟁, 멕시코의 개최국 이점 시나리오
    const scenarios = [
      { startProb: 30, endProb: 45, variance: 5 }, // 대한민국 (후반기 급상승)
      { startProb: 45, endProb: 40, variance: 4 }, // 멕시코 (개최국 어드밴티지, 약간 주춤)
      { startProb: 20, endProb: 12, variance: 3 }, // 체코
      { startProb: 5, endProb: 3, variance: 1 },   // 남아프리카공화국
    ];

    for (let i = 0; i < mkData.length; i++) {
      const market = mkData[i];
      const scenario = scenarios[i];
      let currentYes = 10000;
      let currentNo = (10000 / (scenario.startProb / 100)) - 10000;

      for (let day = 30; day >= 0; day--) {
        const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
        // 하루에 2~5번의 베팅 발생
        const dailyBets = Math.floor(Math.random() * 4) + 2;
        
        for (let b = 0; b < dailyBets; b++) {
          const progress = (30 - day) / 30;
          const targetProb = scenario.startProb + (scenario.endProb - scenario.startProb) * progress;
          const currentProb = (currentYes / (currentYes + currentNo)) * 100;
          
          const side = currentProb < targetProb ? 'yes' : 'no';
          const amount = Math.floor(Math.random() * 5000) + 1000; // 1000~6000 포인트
          
          if (side === 'yes') currentYes += amount; else currentNo += amount;

          historicalBets.push({
            user_id: session.user.id,
            market_id: market.id,
            side: side,
            amount: amount,
            created_at: new Date(date.getTime() + b * 60 * 60 * 1000).toISOString()
          });
        }
      }
      // 풀 동기화 업데이트
      await supabase.from('markets').update({ yes_pool: currentYes, no_pool: currentNo }).eq('id', market.id);
    }

    // 벌크 인서트 (배열을 100개씩 나눠서)
    for (let i = 0; i < historicalBets.length; i += 100) {
      await supabase.from('bets').insert(historicalBets.slice(i, i + 100));
    }

    setStatus("월드컵 이벤트 및 트렌드 차트용 과거 데이터가 성공적으로 생성되었습니다! 홈 화면에서 확인하세요.");
  };

  return (
    <div style={{ padding: 50, color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <h2>Database Seeder</h2>
      <button 
        onClick={handleSeed}
        style={{ padding: "12px 24px", background: "var(--purple-primary)", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 16, width: 300 }}
      >
        마켓 샘플 데이터 4개 생성하기 (Click)
      </button>
      <button 
        onClick={handleSeedEvent}
        style={{ padding: "12px 24px", background: "var(--accent-yes)", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 16, width: 300 }}
      >
        🌟 월드컵 예제 이벤트 생성하기
      </button>
      <p style={{ marginTop: 20 }}>{status}</p>
    </div>
  );
}
