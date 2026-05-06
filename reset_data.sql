-- 이 스크립트는 기존의 테스트용 마켓, 이벤트, 베팅, 댓글 데이터를 모두 삭제합니다.
-- 주의: 실제 운영 중인 서비스에서는 실행하지 마세요.

delete from comments;
delete from point_transactions where type = 'bet';
delete from bets;
delete from markets;
delete from events;
