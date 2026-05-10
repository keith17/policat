-- 1. 프로필 테이블에 본인인증 관련 컬럼 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS real_name text,
ADD COLUMN IF NOT EXISTS ci text UNIQUE, -- 동일 명의 다계정 가입 방지용 고유값
ADD COLUMN IF NOT EXISTS di text,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

-- 2. 중복된 CI 가입 시도를 원천 차단하기 위한 UNIQUE 제약조건 확인/추가
-- (위의 ADD COLUMN에서 UNIQUE를 지정했으므로 이미 생성됩니다.)
