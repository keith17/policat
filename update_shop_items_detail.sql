-- shop_items 테이블 상세 정보 컬럼 추가
-- (update_shop_items_columns.sql 이후 실행)
ALTER TABLE public.shop_items
  ADD COLUMN IF NOT EXISTS original_price INTEGER,      -- 정상가
  ADD COLUMN IF NOT EXISTS discount_rate   NUMERIC(5,2), -- 할인율 (%)
  ADD COLUMN IF NOT EXISTS subtitle        TEXT,         -- 목록 부제목
  ADD COLUMN IF NOT EXISTS issuer_name     TEXT,         -- 발행자
  ADD COLUMN IF NOT EXISTS usage_notes     TEXT;         -- 전체 이용안내
