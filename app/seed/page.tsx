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

  return (
    <div style={{ padding: 50, color: 'white', textAlign: 'center' }}>
      <h2>Database Seeder</h2>
      <button 
        onClick={handleSeed}
        style={{ padding: "12px 24px", background: "var(--purple-primary)", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 16, marginTop: 20 }}
      >
        마켓 샘플 데이터 4개 생성하기 (Click)
      </button>
      <p style={{ marginTop: 20 }}>{status}</p>
    </div>
  );
}
