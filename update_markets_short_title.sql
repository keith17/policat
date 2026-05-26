-- update_markets_short_title.sql
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS short_title text;
