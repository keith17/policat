-- 주문 시 이메일 수집 컬럼 추가
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS email_info TEXT;
