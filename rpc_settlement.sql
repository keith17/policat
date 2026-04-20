-- 1. 마켓 정상 판정 및 배당금 지급 RPC (resolve_market)
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

      -- 유저 프로필 포인트 업데이트
      UPDATE public.profiles SET points = points + v_reward WHERE id = v_bet.user_id;

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


-- 2. 마켓 블라인드 및 기 베팅자 전액 환불 RPC (refund_market)
CREATE OR REPLACE FUNCTION public.refund_market(p_market_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_market RECORD;
  v_bet RECORD;
BEGIN
  SELECT * INTO v_market FROM public.markets WHERE id = p_market_id AND (status = 'active' OR status = 'pending') FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Market not found or already resolved';
  END IF;

  -- 베팅 내역 순회하며 해당 금액만큼 100% 원금 스왑
  FOR v_bet IN SELECT * FROM public.bets WHERE market_id = p_market_id
  LOOP
    UPDATE public.profiles SET points = points + v_bet.amount WHERE id = v_bet.user_id;

    INSERT INTO public.point_transactions (user_id, amount, type, description)
    VALUES (v_bet.user_id, v_bet.amount, 'refund', '마켓 반려/블라인드로 인한 원금 전액 환불');
  END LOOP;

  -- 마켓을 투표 숨김 처리
  UPDATE public.markets SET status = 'hidden' WHERE id = p_market_id;
END;
$$;
