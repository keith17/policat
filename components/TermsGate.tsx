"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const TERMS_SERVICE = `제1조 (목적)
본 약관은 폴리캣(이하 '회사')이 제공하는 예측 콘텐츠, 포인트 적립 및 보상 서비스(이하 '서비스')의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. '포인트'란 회원이 서비스 내 예측 참여, 광고 시청, 이벤트 참여 등을 통해 무상으로 적립 받고, 상품권 교환 등에 사용할 수 있는 가상의 데이터를 말합니다.
2. '보상'이란 회원이 보유한 포인트를 소진하여 획득할 수 있는 네이버페이, 배달의민족, 카카오톡 상품권 등의 모바일 교환권을 말합니다.

제3조 (회원가입 및 계정 정책)
1. 회원가입은 구글(Google) 소셜 로그인 연동을 통해 이루어집니다.
2. 회사는 보상의 중복 수령 및 어뷰징 방지를 위해, 보상 신청(상품 구매) 시점에 최초 1회의 휴대전화 본인인증을 요구합니다.
3. 1인의 회원은 본인인증을 완료한 1개의 계정만으로 보상을 수령할 수 있으며, 타인의 명의를 도용하거나 다중 계정을 생성하는 경우 서비스 이용이 제한될 수 있습니다.

제4조 (포인트의 적립 및 유효기간)
1. 회원은 서비스 내 콘텐츠 참여 및 광고 시청 등을 통해 포인트를 무상으로 적립할 수 있습니다.
2. 포인트의 유효기간은 적립일로부터 6개월이며, 유효기간이 경과한 포인트는 순차적으로 자동 소멸됩니다.
3. 회원이 최종 접속일로부터 180일간 로그인 기록이 없는 경우 휴면 계정으로 전환되며, 보유 중인 모든 포인트는 자동 소멸됩니다.

제5조 (포인트 사용 및 보상 지급)
1. 회원은 누적된 포인트를 사용하여 상점에서 상품을 구매할 수 있습니다.
2. 포인트는 현금으로 환전할 수 없으며, 제3자에게 양도하거나 유료로 구매할 수 없습니다.
3. 부정한 방법으로 포인트를 획득한 경우 회사는 즉각 포인트 몰수 및 계정 정지 조치를 취할 수 있습니다.

제6조 (콘텐츠의 성격 및 책임 제한)
1. 서비스 내 예측 콘텐츠는 정보 제공 및 재미를 위한 것이며, 금융·투자 조언이 아닙니다.
2. 회원은 예측 결과를 기반으로 불법 도박 행위를 할 수 없습니다.`;

const TERMS_PERSONAL = `수집 및 이용 목적 · 항목 · 보유기간

[회원 가입 시]
목적: 회원 식별 및 계정 관리
항목: 구글 계정 이메일, 닉네임, 프로필 이미지
보유기간: 회원 탈퇴 시 즉시 파기

[보상 신청 시]
목적: 본인 확인, 중복 수령 방지, 상품권 발송
항목: 이름, 휴대전화 번호, 연계정보(CI), 중복가입확인정보(DI)
보유기간: 목적 달성 시 즉시 파기

귀하는 위 개인정보 수집 및 이용에 대한 동의를 거부할 수 있습니다. 단, 가입 시 동의를 거부할 경우 서비스 이용이 불가하며, 보상 신청 시 본인인증에 동의하지 않을 경우 상품권 수령이 제한됩니다.`;

const TERMS_MARKETING = `수집 및 이용 목적
- 새로운 예측 주제 및 핫이슈 알림
- 포인트 적립 이벤트 및 상품권 프로모션 안내
- 서비스 이용 기록에 기반한 맞춤형 혜택 정보 제공

수집 항목
이메일, 휴대전화 번호(본인인증 완료 시), 서비스 이용 기록

보유 및 이용 기간
회원 탈퇴 시 또는 마케팅 수신 동의 철회 시까지

본 동의는 선택 사항이며, 거부하시더라도 기본 예측 서비스와 포인트 적립은 정상적으로 이용 가능합니다.`;

interface TermsItem {
  key: "terms" | "personal" | "marketing";
  label: string;
  required: boolean;
  content: string;
  link?: string;
}

const ITEMS: TermsItem[] = [
  { key: "terms",     label: "서비스 이용약관",            required: true,  content: TERMS_SERVICE,  link: "/tos" },
  { key: "personal",  label: "개인정보 수집 및 이용 동의",  required: true,  content: TERMS_PERSONAL },
  { key: "marketing", label: "마케팅 활용 동의",            required: false, content: TERMS_MARKETING },
];

interface TermsGateProps {
  userId: string;
  onComplete: (agreed: boolean) => void;
}

export default function TermsGate({ userId, onComplete }: TermsGateProps) {
  const [saving, setSaving]     = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checked, setChecked]   = useState({ terms: false, personal: false, marketing: false });

  const allRequired = checked.terms && checked.personal;
  const allChecked  = checked.terms && checked.personal && checked.marketing;

  const toggleAll = () => {
    const val = !allChecked;
    setChecked({ terms: val, personal: val, marketing: val });
  };

  const handleSubmit = async () => {
    if (!allRequired || saving) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      terms_agreed: true,
      terms_agreed_at: new Date().toISOString(),
      marketing_agreed: checked.marketing,
      marketing_agreed_at: checked.marketing ? new Date().toISOString() : null,
    }).eq("id", userId);
    onComplete(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,10,15,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 64px rgba(0,0,0,0.3)" }}
      >
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 6 }}>서비스 이용 약관 동의</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            폴리캣 서비스를 이용하시려면 아래 약관에 동의해 주세요.
          </div>
        </div>

        {/* 전체 동의 */}
        <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--border)" }}>
          <button onClick={toggleAll} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${allChecked ? "var(--accent)" : "var(--border)"}`, background: allChecked ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              {allChecked && <Check size={13} color="white" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>전체 동의하기</span>
          </button>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, marginLeft: 32 }}>필수 및 선택 약관 전체 동의</div>
        </div>

        {/* 항목 목록 */}
        <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
          {ITEMS.map(item => {
            const isChecked  = checked[item.key];
            const isExpanded = expanded[item.key];
            return (
              <div key={item.key} style={{ borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 28px" }}>
                  <button onClick={() => setChecked(prev => ({ ...prev, [item.key]: !prev[item.key] }))} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, flex: 1 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${isChecked ? "var(--accent)" : "var(--border)"}`, background: isChecked ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                      {isChecked && <Check size={11} color="white" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, textAlign: "left" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 4, marginRight: 6, background: item.required ? "rgba(99,102,241,0.12)" : "var(--surface-alt)", color: item.required ? "var(--accent)" : "var(--text-secondary)" }}>
                        {item.required ? "필수" : "선택"}
                      </span>
                      {item.label}
                    </span>
                  </button>
                  <button onClick={() => setExpanded(prev => ({ ...prev, [item.key]: !prev[item.key] }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: 4, flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                      <div style={{ margin: "0 28px 16px", background: "var(--bg-secondary)", borderRadius: 10, padding: "14px 16px", maxHeight: 200, overflowY: "auto" }}>
                        <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: "var(--text-secondary)", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{item.content}</pre>
                        {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "var(--accent)", textDecoration: "underline" }}>전문 보기 →</a>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ padding: "20px 28px", borderTop: "1px solid var(--border)" }}>
          {!allRequired && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, textAlign: "center" }}>필수 항목에 동의해야 서비스를 이용할 수 있습니다.</div>}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!allRequired || saving}
            style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: allRequired ? "var(--accent)" : "var(--surface-alt)", color: allRequired ? "white" : "var(--text-muted)", fontSize: 16, fontWeight: 800, cursor: allRequired ? "pointer" : "not-allowed", transition: "all 0.2s" }}
          >
            {saving ? "저장 중…" : "동의하고 서비스 시작하기"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
