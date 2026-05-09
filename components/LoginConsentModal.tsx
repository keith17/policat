"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface LoginConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (marketingConsent: boolean) => void;
}

export default function LoginConsentModal({ isOpen, onClose, onConfirm }: LoginConsentModalProps) {
  const [agreedTOS, setAgreedTOS] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);

  // 초기화
  useEffect(() => {
    if (isOpen) {
      setAgreedTOS(false);
      setAgreedPrivacy(false);
      setAgreedMarketing(false);
    }
  }, [isOpen]);

  const allRequiredChecked = agreedTOS && agreedPrivacy;
  const allChecked = agreedTOS && agreedPrivacy && agreedMarketing;

  const handleAllCheck = () => {
    if (allChecked) {
      setAgreedTOS(false);
      setAgreedPrivacy(false);
      setAgreedMarketing(false);
    } else {
      setAgreedTOS(true);
      setAgreedPrivacy(true);
      setAgreedMarketing(true);
    }
  };

  const Checkbox = ({ checked, onChange, label, required, link }: any) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", flex: 1 }}>
        <div style={{ 
          width: 24, height: 24, borderRadius: 6, border: `2px solid ${checked ? "var(--purple-primary)" : "var(--border)"}`, 
          background: checked ? "var(--purple-primary)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s"
        }}>
          {checked && <Check size={16} color="white" strokeWidth={3} />}
        </div>
        <span style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: checked ? 700 : 500 }}>
          <span style={{ color: required ? "var(--accent-no)" : "var(--text-muted)", marginRight: 4 }}>
            [{required ? "필수" : "선택"}]
          </span>
          {label}
        </span>
      </label>
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "underline", marginLeft: 16 }}>
          보기
        </a>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-primary)",
              borderRadius: 24,
              width: "100%", maxWidth: 420,
              padding: 32,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, margin: "0 auto 16px" }}>
                <img src="/logo.svg" alt="Policat" width={48} height={48} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>
                PoliCat 시작하기
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                서비스 이용을 위해 약관에 동의해 주세요.
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div 
                onClick={handleAllCheck}
                style={{ 
                  display: "flex", alignItems: "center", gap: 12, padding: "16px", 
                  background: allChecked ? "rgba(139,92,246,0.1)" : "var(--bg-secondary)", 
                  borderRadius: 12, cursor: "pointer", marginBottom: 16, border: `1px solid ${allChecked ? "var(--purple-primary)" : "transparent"}`
                }}
              >
                <div style={{ 
                  width: 24, height: 24, borderRadius: 6, border: `2px solid ${allChecked ? "var(--purple-primary)" : "var(--border)"}`, 
                  background: allChecked ? "var(--purple-primary)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {allChecked && <Check size={16} color="white" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>네, 모두 동의합니다.</span>
              </div>

              <div style={{ padding: "0 8px" }}>
                <Checkbox checked={agreedTOS} onChange={() => setAgreedTOS(!agreedTOS)} label="서비스 이용약관 동의" required link="/tos" />
                <Checkbox checked={agreedPrivacy} onChange={() => setAgreedPrivacy(!agreedPrivacy)} label="개인정보 수집 및 이용 동의" required link="/privacy" />
                <Checkbox checked={agreedMarketing} onChange={() => setAgreedMarketing(!agreedMarketing)} label="마케팅 알림 수신 동의" required={false} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={onClose}
                style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer" }}
              >
                취소
              </button>
              <button 
                onClick={() => {
                  if (allRequiredChecked) onConfirm(agreedMarketing);
                }}
                disabled={!allRequiredChecked}
                style={{ 
                  flex: 2, padding: "14px", borderRadius: 12, border: "none", 
                  background: allRequiredChecked ? "var(--purple-primary)" : "var(--bg-secondary)", 
                  color: allRequiredChecked ? "white" : "var(--text-muted)", 
                  fontWeight: 700, cursor: allRequiredChecked ? "pointer" : "not-allowed",
                  transition: "all 0.2s"
                }}
              >
                Google 계정으로 시작하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
