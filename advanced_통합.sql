USE daegu_nav;

DROP TRIGGER  IF EXISTS tr_경로통계_자동갱신;
DROP VIEW     IF EXISTS v_인기경로;
DROP VIEW     IF EXISTS v_노선이용현황;
DROP PROCEDURE IF EXISTS sp_다음셔틀조회;
DROP PROCEDURE IF EXISTS sp_맞춤추천;
DROP PROCEDURE IF EXISTS sp_건물별점통계;

-- ============================================================
-- [트리거] 길찾기로그 INSERT → 경로통계 자동 갱신
-- ============================================================
DELIMITER $$
CREATE TRIGGER tr_경로통계_자동갱신
AFTER INSERT ON 길찾기로그
FOR EACH ROW
BEGIN
  IF NEW.출발건물_id IS NOT NULL AND NEW.도착건물_id IS NOT NULL THEN
    INSERT INTO 경로통계
      (출발건물_id, 도착건물_id, 이동수단, 검색횟수, 마지막검색)
    VALUES
      (NEW.출발건물_id, NEW.도착건물_id, NEW.이동수단, 1, NEW.검색일시)
    ON DUPLICATE KEY UPDATE
      검색횟수   = 검색횟수 + 1,
      마지막검색 = NEW.검색일시;

    UPDATE 건물 SET 검색횟수 = 검색횟수 + 1 WHERE 건물_id = NEW.출발건물_id;
    UPDATE 건물 SET 검색횟수 = 검색횟수 + 1 WHERE 건물_id = NEW.도착건물_id;
  END IF;
END$$
DELIMITER ;

-- ============================================================
-- [뷰 1] v_인기경로 — RANK() 윈도우 함수 포함
-- ============================================================
CREATE OR REPLACE VIEW v_인기경로 AS
SELECT
  sub.출발건물_id,
  sub.출발건물명,
  sub.도착건물_id,
  sub.도착건물명,
  sub.검색횟수,
  RANK() OVER (ORDER BY sub.검색횟수 DESC) AS 순위
FROM (
  SELECT
    rs.출발건물_id,
    b1.이름  AS 출발건물명,
    rs.도착건물_id,
    b2.이름  AS 도착건물명,
    SUM(rs.검색횟수) AS 검색횟수
  FROM 경로통계 rs
  JOIN 건물 b1 ON rs.출발건물_id = b1.건물_id
  JOIN 건물 b2 ON rs.도착건물_id = b2.건물_id
  GROUP BY rs.출발건물_id, b1.이름, rs.도착건물_id, b2.이름
) sub;

-- ============================================================
-- [뷰 2] v_노선이용현황 — ROW_NUMBER() 윈도우 함수 포함
-- ============================================================
CREATE OR REPLACE VIEW v_노선이용현황 AS
SELECT
  n.노선_id,
  n.노선명,
  n.노선유형,
  n.방향,
  COUNT(l.로그_id)                               AS 이용횟수,
  ROW_NUMBER() OVER (ORDER BY COUNT(l.로그_id) DESC) AS 이용순위
FROM 노선 n
LEFT JOIN 길찾기로그 l ON l.이동수단 = '셔틀'
GROUP BY n.노선_id, n.노선명, n.노선유형, n.방향;

-- ============================================================
-- [프로시저 1] sp_다음셔틀조회 — 특정 시간 이후 다음 버스
-- ============================================================
DELIMITER $$
CREATE PROCEDURE sp_다음셔틀조회(
  IN p_검색시간    TIME,
  IN p_도착건물_id VARCHAR(10)
)
BEGIN
  SELECT
    n.노선_id,
    n.노선명,
    n.노선유형,
    dep.정류장명  AS 출발정류장,
    sd.출발시간   AS 출발시간,
    arr.정류장명  AS 도착정류장,
    sa.출발시간   AS 도착시간
  FROM 노선 n
  JOIN 시간표 sd  ON n.노선_id = sd.노선_id
  JOIN 정류장 dep ON sd.정류장_id  = dep.정류장_id
  JOIN 시간표 sa  ON n.노선_id = sa.노선_id
  JOIN 정류장 arr ON sa.정류장_id  = arr.정류장_id
  WHERE n.방향        = '등교'
    AND sd.방향       = '등교'
    AND sa.방향       = '등교'
    AND sd.출발시간  >= p_검색시간
    AND arr.인접건물_id = p_도착건물_id
    AND sd.정차순서   < sa.정차순서
  ORDER BY sd.출발시간, n.노선_id
  LIMIT 3;
END$$
DELIMITER ;

-- ============================================================
-- [프로시저 2] sp_맞춤추천 — 회원별 자주 이용 경로
-- ============================================================
DELIMITER $$
CREATE PROCEDURE sp_맞춤추천(IN p_회원_id INT)
BEGIN
  SELECT
    l.출발건물_id,
    b1.이름        AS 출발건물명,
    l.도착건물_id,
    b2.이름        AS 도착건물명,
    COUNT(*)       AS 이용횟수,
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS 추천순위
  FROM 길찾기로그 l
  JOIN 건물 b1 ON l.출발건물_id = b1.건물_id
  JOIN 건물 b2 ON l.도착건물_id = b2.건물_id
  WHERE l.회원_id       = p_회원_id
    AND l.출발건물_id   IS NOT NULL
    AND l.도착건물_id   IS NOT NULL
  GROUP BY l.출발건물_id, b1.이름, l.도착건물_id, b2.이름
  ORDER BY 이용횟수 DESC
  LIMIT 5;
END$$
DELIMITER ;

-- ============================================================
-- [프로시저 3] sp_건물별점통계 — 건물 별점 평균/분포
-- ============================================================
DELIMITER $$
CREATE PROCEDURE sp_건물별점통계(IN p_건물_id VARCHAR(10))
BEGIN
  SELECT
    b.건물_id,
    b.이름,
    ROUND(AVG(r.별점), 1) AS 평균별점,
    COUNT(r.별점_id)      AS 평가수,
    SUM(CASE WHEN r.별점 = 5 THEN 1 ELSE 0 END) AS 별점5,
    SUM(CASE WHEN r.별점 = 4 THEN 1 ELSE 0 END) AS 별점4,
    SUM(CASE WHEN r.별점 = 3 THEN 1 ELSE 0 END) AS 별점3,
    SUM(CASE WHEN r.별점 = 2 THEN 1 ELSE 0 END) AS 별점2,
    SUM(CASE WHEN r.별점 = 1 THEN 1 ELSE 0 END) AS 별점1
  FROM 건물 b
  LEFT JOIN 건물별점 r ON b.건물_id = r.건물_id
  WHERE b.건물_id = p_건물_id
  GROUP BY b.건물_id, b.이름;
END$$
DELIMITER ;
