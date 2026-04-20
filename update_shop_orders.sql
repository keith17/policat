-- 1. 상점 실물 쿠폰 주문 내역 테이블 생성
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  item_id text not null,
  item_name text not null,
  price integer not null,
  contact_info text not null,
  status text default 'pending' not null, -- 'pending', 'completed', 'canceled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 정책 설정 (유저는 자신의 주문만 볼 수 있고, insert 가능. Admin은 전부 조회/수정 가능)
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own shop orders"
  ON public.shop_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shop orders"
  ON public.shop_orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can do everything on shop orders"
  ON public.shop_orders FOR ALL USING (
    (auth.jwt() ->> 'email') = 'koesig@gmail.com'
  );
