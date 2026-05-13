-- 상점 상품 테이블
CREATE TABLE IF NOT EXISTS public.shop_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL,
  icon_key text NOT NULL DEFAULT 'gift',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shop items"
  ON public.shop_items FOR SELECT USING (is_active = true OR (auth.jwt() ->> 'email') = 'koesig@gmail.com');

CREATE POLICY "Admins can manage shop items"
  ON public.shop_items FOR ALL USING ((auth.jwt() ->> 'email') = 'koesig@gmail.com');

-- 기본 상품 시드
INSERT INTO public.shop_items (id, name, category, description, price, icon_key, sort_order) VALUES
  ('coffee-1',     '스타벅스 아이스 아메리카노 T',  '음료/디저트', '전국 스타벅스 매장에서 사용 가능한 기프티콘',     4500,  'coffee', 1),
  ('naver-5000',   '네이버페이 포인트 5,000원권',    '상품권',      '네이버페이 결제 시 사용 가능한 포인트 쿠폰',       5000,  'gift',   2),
  ('gs25-3000',    'GS25 모바일 상품권 3,000원권',   '편의점',      '전국 GS25 편의점에서 현금처럼 사용 가능',         3000,  'tag',    3),
  ('baemin-10000', '배달의민족 상품권 10,000원권',   '배달/외식',   '배민 앱에서 배달/포장 주문 시 사용 가능',         10000, 'truck',  4)
ON CONFLICT (id) DO NOTHING;

-- shop_orders payment 컬럼 (아직 없는 경우)
ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'points',
  ADD COLUMN IF NOT EXISTS payment_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS shop_orders_payment_id_unique
  ON public.shop_orders (payment_id)
  WHERE payment_id IS NOT NULL;
