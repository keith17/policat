-- shop_orders 테이블에 카드 결제 관련 컬럼 추가
ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'points',
  ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- payment_id 중복 방지 인덱스 (카드 결제 동일 결제 ID 재사용 차단)
CREATE UNIQUE INDEX IF NOT EXISTS shop_orders_payment_id_unique
  ON public.shop_orders (payment_id)
  WHERE payment_id IS NOT NULL;
