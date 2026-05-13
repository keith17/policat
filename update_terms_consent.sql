-- profiles 테이블에 약관 동의 컬럼 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_agreed       BOOLEAN   DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS terms_agreed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_agreed   BOOLEAN   DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_agreed_at TIMESTAMPTZ;
