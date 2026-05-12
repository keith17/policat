-- 공유 클릭 추적 테이블
CREATE TABLE IF NOT EXISTS public.share_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES public.profiles(id),
  market_id uuid REFERENCES public.markets(id),
  visitor_ip text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 같은 IP가 같은 마켓에서 같은 referrer에 대해 중복 클릭 방지
CREATE UNIQUE INDEX IF NOT EXISTS share_clicks_unique 
ON public.share_clicks (referrer_id, market_id, visitor_ip);

-- RLS
ALTER TABLE public.share_clicks ENABLE ROW LEVEL SECURITY;

-- 서비스 역할(service_role)에서만 INSERT 가능하도록 하는 것이 이상적이지만,
-- 현재는 anon에서도 INSERT 허용 (API route에서 검증)
CREATE POLICY "Allow insert for all" ON public.share_clicks 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for referrer" ON public.share_clicks 
  FOR SELECT USING (auth.uid() = referrer_id);
