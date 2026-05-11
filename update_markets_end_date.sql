-- 마켓 테이블에 종료일시 컬럼 추가
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS end_date timestamptz;

-- 기존 데이터 임의 업데이트 (현재 시간 기준 + 7일 뒤로 설정)
UPDATE public.markets 
SET end_date = created_at + interval '7 days' 
WHERE end_date IS NULL;
