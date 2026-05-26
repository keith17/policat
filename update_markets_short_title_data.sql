-- update_markets_short_title_data.sql
-- Run this script to update existing markets with short_title

UPDATE public.markets SET short_title = '승리' WHERE title = '대한민국이 첫 경기에서 승리할까?';
UPDATE public.markets SET short_title = '무승부' WHERE title = '대한민국이 첫 경기에서 무승부를 기록할까?';
UPDATE public.markets SET short_title = '패배' WHERE title = '대한민국이 첫 경기에서 패배할까?';

UPDATE public.markets SET short_title = '정규시간 내 승부결정' WHERE title = '정규 시간 내에 승부가 결정되어 우승팀이 가려질까?';
UPDATE public.markets SET short_title = '3골(Over 2.5) 이상' WHERE title = '결승전에서 양 팀 합산 총 3골(Over 2.5) 이상이 터질까?';
UPDATE public.markets SET short_title = '레드카드 발생' WHERE title = '경기 중 레드카드(퇴장)를 받는 선수가 나올까?';

UPDATE public.markets SET short_title = '스윕승 발생' WHERE title = '이번 주말 3연전에서 스윕(3전 전승)을 거두는 팀이 나올까?';
UPDATE public.markets SET short_title = '우천 취소 발생' WHERE title = '비나 기상 악화로 우천 취소되는 경기가 발생할까?';
UPDATE public.markets SET short_title = '관중 30만명 돌파' WHERE title = '주말 3연전 전국 구장 누적 관중 수가 30만 명을 돌파할까?';

UPDATE public.markets SET short_title = 'Siri 2.0 발표' WHERE title = '온디바이스 AI 기능이 대폭 강화된 Siri 2.0이 공식 발표될까?';
UPDATE public.markets SET short_title = '비전프로 저가형' WHERE title = '애플 비전 프로(Vision Pro)의 저가형 모델 라인업이 공개될까?';
UPDATE public.markets SET short_title = '자체 LLM 발표' WHERE title = '자체 대형언어모델(LLM) 생태계가 발표될까?';

UPDATE public.markets SET short_title = '예상치 상회' WHERE title = 'CPI 결과가 월가 예상치를 상회(물가 상승)할까?';
UPDATE public.markets SET short_title = '예상치 부합' WHERE title = 'CPI 결과가 월가 예상치에 정확히 부합할까?';
UPDATE public.markets SET short_title = '예상치 하회' WHERE title = 'CPI 결과가 월가 예상치를 하회(물가 둔화)할까?';

UPDATE public.markets SET short_title = '한국(LCK) 우승' WHERE title = '한국(LCK) 소속 팀이 MSI 최종 우승을 차지할까?';
UPDATE public.markets SET short_title = '중국(LPL) 우승' WHERE title = '중국(LPL) 소속 팀이 MSI 최종 우승을 차지할까?';
UPDATE public.markets SET short_title = '기타 지역 우승' WHERE title = '유럽(LEC) 또는 북미(LCS) 등 기타 지역 팀이 우승할까?';

UPDATE public.markets SET short_title = '금리 인상' WHERE title = '한국은행이 기준금리를 인상할까?';
UPDATE public.markets SET short_title = '금리 동결' WHERE title = '한국은행이 기준금리를 동결할까?';
UPDATE public.markets SET short_title = '금리 인하' WHERE title = '한국은행이 기준금리를 인하할까?';

UPDATE public.markets SET short_title = '100만 돌파' WHERE title = '이번 주 개봉 1주차 헐리우드 블록버스터가 국내 100만 관객을 돌파할까?';
UPDATE public.markets SET short_title = '나스닥 상승 마감' WHERE title = '이번 주 금요일 나스닥(NASDAQ)이 전주 대비 상승 마감할까?';
UPDATE public.markets SET short_title = '스타십 비행 실시' WHERE title = '스페이스X가 이번 주 내로 스타십 테스트 비행을 실시할까?';
UPDATE public.markets SET short_title = '승점 2점 이하 차이' WHERE title = 'EPL 38라운드 최종전에서 리그 우승 승점 차이가 2점 이하로 끝날까?';
UPDATE public.markets SET short_title = '멜론 1위 달성' WHERE title = '뉴진스 선공개 싱글이 발매 24시간 내 멜론 TOP 100 1위를 달성할까?';
UPDATE public.markets SET short_title = '$65k 아래 기록' WHERE title = '이번 주 일요일까지 비트코인이 $65,000 아래로 떨어질까?';
UPDATE public.markets SET short_title = '서울 주말 비' WHERE title = '이번 주말(16~17일) 서울 지역에 비가 내릴까?';

UPDATE public.markets SET short_title = '어닝 서프라이즈' WHERE title = '엔비디아(NVDA) 1분기 실적에서 어닝 서프라이즈를 기록할까?';
UPDATE public.markets SET short_title = '나달 출전' WHERE title = '프랑스 오픈 남자 단식에 나달이 출전 명단에 이름을 올릴까?';
UPDATE public.markets SET short_title = '30분 내 첫 골' WHERE title = '월드컵 개막전(멕시코 경기)에서 30분 이내에 첫 골이 터질까?';
UPDATE public.markets SET short_title = '코스닥 900 돌파' WHERE title = '5월 31일 코스닥 지수가 900 포인트를 회복할까?';
UPDATE public.markets SET short_title = '사우디 이적 발표' WHERE title = '손흥민이 6월 초 이전에 사우디 리그 이적을 발표할까?';
UPDATE public.markets SET short_title = '금리 인하' WHERE title = '미국 연준(Fed)이 6월 FOMC에서 기준금리를 인하할까?';
UPDATE public.markets SET short_title = '평가전 승리' WHERE title = '월드컵 직전 마지막 친선 평가전에서 대한민국이 승리할까?';
UPDATE public.markets SET short_title = '티저 발표' WHERE title = '넷플릭스가 6월 내로 오징어 게임 시즌3 공식 티저를 발표할까?';

UPDATE public.markets SET short_title = '첫 우승국 탄생' WHERE title = '월드컵 결승전에서 사상 최초 우승국(뉴 챔피언)이 탄생할까?';
UPDATE public.markets SET short_title = '30홈런 달성' WHERE title = '오타니 쇼헤이가 올스타전 전까지 시즌 30홈런을 달성할까?';
UPDATE public.markets SET short_title = '반지 공개' WHERE title = '삼성 갤럭시 언팩 2026에서 반지형 웨어러블을 공개할까?';
UPDATE public.markets SET short_title = '나눔 올스타 MVP' WHERE title = '2026 KBO 올스타전 MVP는 나눔 올스타에서 배출될까?';
UPDATE public.markets SET short_title = '쿠팡이츠 MAU 2위' WHERE title = '8월 1일 기준 쿠팡이츠가 요기요를 꺾고 MAU 2위를 굳힐까?';
UPDATE public.markets SET short_title = '1억 원 붕괴' WHERE title = '7월 내에 비트코인이 1억 원(KRW) 아래로 하락하는 날이 있을까?';
UPDATE public.markets SET short_title = '500만 관객 돌파' WHERE title = '여름 개봉 한국 영화 중 누적 관객 500만 넘기는 작품이 나올까?';
UPDATE public.markets SET short_title = 'X Payments 런칭' WHERE title = '일론 머스크가 8월 전에 X Payments를 미국 내 정식 런칭할까?';
UPDATE public.markets SET short_title = '카카오 6만원' WHERE title = '8월 13일 카카오(KAKAO) 주가가 6만 원 선을 회복할까?';
UPDATE public.markets SET short_title = '조코비치 우승' WHERE title = '2026 윔블던 남자 단식에서 조코비치가 우승할까?';
UPDATE public.markets SET short_title = '고용 쇼크 기록' WHERE title = '8월 초 미국 7월 비농업 고용지수(NFP)가 고용 쇼크를 기록할까?';
UPDATE public.markets SET short_title = 'GTA 6 트레일러 2' WHERE title = '락스타가 8월 말 전에 GTA 6 두 번째 공식 트레일러를 공개할까?';
UPDATE public.markets SET short_title = '예비전력률 저하' WHERE title = '이번 여름 예비 전력률이 관심 단계 미만으로 떨어질까?';
UPDATE public.markets SET short_title = '유닛 콜라보 발표' WHERE title = '하이브(HYBE) 소속 그룹 간 유닛 콜라보 앨범이 기습 발표될까?';
