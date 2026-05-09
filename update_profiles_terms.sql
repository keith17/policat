-- 1. profiles 테이블에 약관 동의 관련 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;

-- 2. 기존 사용자들은 기본적으로 필수 약관에 동의한 것으로 간주하여 업데이트 (필요에 따라 생략 가능)
UPDATE public.profiles SET terms_accepted = true WHERE terms_accepted = false;
