-- shop_orders 테이블 생성 (없을 경우) + 카드 결제 컬럼 포함
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  item_id text NOT NULL,
  item_name text NOT NULL,
  price integer NOT NULL,
  contact_info text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  payment_method text DEFAULT 'points',
  payment_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 이미 테이블이 있는 경우 컬럼 추가
ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'points',
  ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- payment_id 중복 방지 인덱스 (동일 결제 ID 재사용 차단)
CREATE UNIQUE INDEX IF NOT EXISTS shop_orders_payment_id_unique
  ON public.shop_orders (payment_id)
  WHERE payment_id IS NOT NULL;

-- RLS 활성화
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 후 재생성 (이미 있을 경우 오류 방지)
DROP POLICY IF EXISTS "Users can create their own shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Users can view their own shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Admins can do everything on shop orders" ON public.shop_orders;

CREATE POLICY "Users can create their own shop orders"
  ON public.shop_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shop orders"
  ON public.shop_orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can do everything on shop orders"
  ON public.shop_orders FOR ALL USING (
    (auth.jwt() ->> 'email') = 'koesig@gmail.com'
  );
