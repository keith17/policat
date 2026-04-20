"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Info, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function CreateMarketPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "economy",
    endDate: "",
    description: "",
    initialYes: 50,
    initialNo: 50,
  });
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("points").eq("id", user.id).single();
        if (data) setPoints(data.points);
      }
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다!");
      return;
    }
    
    // We insert into markets table. Note: endDate and description might need schema update in DB.
    const { error } = await supabase.from("markets").insert({
      title: formData.title,
      category: formData.category,
      created_by: user.id,
      status: "pending"
    });

    if (!error) {
      setSubmitted(true);
    } else {
      alert("제안 접수 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* Assuming Navbar defaults to 0 if we don't pass real points, but we'll soon connect it */}
      <Navbar points={points} streak={0} />

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "100px 20px 40px" }}>
        
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--purple-primary)", marginBottom: 12 }}>
          💡 새로운 예측 제안하기
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32 }}>
          명확한 기준표가 있는 흥미로운 질문을 제안해 보세요. 관리자 승인 후 마켓이 정식 오픈됩니다.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: "rgba(34,211,160,0.1)", border: "1px solid var(--accent-yes)",
                borderRadius: 16, padding: 32, textAlign: "center"
              }}
            >
              <CheckCircle size={48} color="var(--accent-yes)" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>제안 접수 완료!</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
                제안해주신 마켓이 안전하게 접수되었습니다.<br/>
                관리자 검토 후 사이트에 노출되며, 결과 판정 역시 관리자가 진행합니다.
              </p>
              <Link href="/">
                <button className="btn-primary" style={{ padding: "12px 24px" }}>메인으로 돌아가기</button>
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "32px 24px",
                display: "flex", flexDirection: "column", gap: 24
              }}
            >
              {/* Guidelines Box */}
              <div style={{
                background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: 12, padding: 16, display: "flex", gap: 12
              }}>
                <Info size={24} color="var(--purple-primary)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  <strong>제안 가이드 (TOS 2조 참고)</strong><br/>
                  결과가 "확실하게 객관적으로" 판명나는 질문만 가능합니다. "재미있을까?" 같은 모호한 질문이나, 내부자 정보가 개입된 질문은 거절될 수 있습니다. 
                </div>
              </div>

              {/* Title Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>마켓 제목 (질문형)</label>
                <input 
                  required
                  placeholder="예) 다음 주 수요일에 비가 올까?"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)",
                    background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15
                  }}
                />
              </div>

              {/* Category & End Date */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 140 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>카테고리</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)",
                      background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15
                    }}
                  >
                    <option value="economy">경제</option>
                    <option value="politics">정치</option>
                    <option value="society">사회/문화</option>
                    <option value="sports">스포츠</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 140 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>마감일</label>
                  <input 
                    required
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    style={{
                      padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)",
                      background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15
                    }}
                  />
                </div>
              </div>

              {/* Detail Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>판정 세부 기준</label>
                <textarea 
                  required
                  placeholder="승리 판정의 기준이 되는 정확한 소스나 조건을 적어주세요. (예: 기상청 발표 기준 특정 지역 강수 확률 50% 이상 기록 시)"
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)",
                    background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15, resize: "none"
                  }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: 16, fontSize: 16, marginTop: 12 }}>
                제안서 제출하기
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
