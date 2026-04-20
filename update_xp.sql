-- 1. profiles 테이블에 xp(경험치) 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer default 0 not null;

-- 2. 기존 유저들의 XP를 현재 보유 포인트와 똑같이 맞춰서 티어가 강등되지 않도록 보정 (Backfill)
UPDATE public.profiles SET xp = points WHERE xp = 0;

-- 3. 기존의 정산(resolve_market) 함수를 덮어씌워, 배당금 획득 시 XP도 같이 오르게 수정
CREATE OR REPLACE FUNCTION public.resolve_market(p_market_id uuid, p_winning_side text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_market RECORD;
  v_bet RECORD;
  v_total_win_pool integer;
  v_total_pool integer;
  v_reward integer;
BEGIN
  -- 대상 마켓 잠금 및 가져오기
  SELECT * INTO v_market FROM public.markets WHERE id = p_market_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Market not found or not active';
  END IF;

  v_total_pool := v_market.yes_pool + v_market.no_pool;
  IF p_winning_side = 'yes' THEN
    v_total_win_pool := v_market.yes_pool;
  ELSE
    v_total_win_pool := v_market.no_pool;
  END IF;

  -- 베팅 내역 순회하며 배당금 분배
  FOR v_bet IN SELECT * FROM public.bets WHERE market_id = p_market_id
  LOOP
    IF v_bet.side = p_winning_side THEN
      -- 배당 수익 계산 (전체 파이 배분)
      IF v_total_win_pool > 0 THEN
        v_reward := ROUND((v_bet.amount::float / v_total_win_pool::float) * v_total_pool::float);
      ELSE
        v_reward := v_bet.amount;
      END IF;

      -- 유저 프로필 포인트 및 *XP* 업데이트 (동시 상승)
      UPDATE public.profiles SET points = points + v_reward, xp = xp + v_reward WHERE id = v_bet.user_id;

      -- 트랜잭션 내역 기록
      INSERT INTO public.point_transactions (user_id, amount, type, description)
      VALUES (v_bet.user_id, v_reward, 'reward', '마켓 적중 배당금 (승리: ' || UPPER(p_winning_side) || ')');
    END IF;
  END LOOP;

  -- 마켓 상태를 판정 완료로 변경
  UPDATE public.markets 
  SET status = 'resolved_' || p_winning_side, resolved_at = NOW(), resolved_by = auth.uid() 
  WHERE id = p_market_id;

END;
$$;
