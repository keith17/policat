-- 비로그인(게스트) 카드 결제 지원
-- user_id NOT NULL 제약 제거
ALTER TABLE public.shop_orders ALTER COLUMN user_id DROP NOT NULL;

-- 게스트 주문 INSERT 허용 (user_id IS NULL인 경우)
CREATE POLICY "Guests can create orders"
  ON public.shop_orders FOR INSERT WITH CHECK (user_id IS NULL);
