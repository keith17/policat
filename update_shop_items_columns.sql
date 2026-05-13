-- shop_items 테이블에 이미지 URL 및 Giftishow URL 컬럼 추가
ALTER TABLE public.shop_items
  ADD COLUMN IF NOT EXISTS image_url    TEXT,
  ADD COLUMN IF NOT EXISTS giftishow_url TEXT;
