-- ============================================================
--  고급 SQL 수정본 (뷰, 프로시저, 트리거)
--  schema_v3.sql 실행 후 이 파일을 실행하세요
-- ============================================================

USE daegu_nav;

-- 기존 뷰/프로시저 있으면 삭제 후 재생성
DROP VIEW IF EXISTS v_popular_routes;
DROP VIEW IF EXISTS v_shuttle_usage;
DROP PROCEDURE IF EXISTS sp_recommend_route;
DROP PROCEDURE IF EXISTS sp_user_recommendations;
DROP PROCEDURE IF EXISTS sp_nearest_bus_stops;
DROP TRIGGER IF EXISTS tr_route_stats_update;

-- ============================================================
-- [뷰 1] v_popular_routes - 인기 경로 + RANK 윈도우 함수
-- ============================================================
CREATE VIEW v_popular_routes AS
SELECT
    sub.from_place_id,
    sub.from_name,
    sub.to_place_id,
    sub.to_name,
    sub.search_count,
    sub.shuttle_use_count,
    RANK() OVER (ORDER BY sub.search_count DESC) AS route_rank
FROM (
    SELECT
        rs.from_place_id,
        fp.name                    AS from_name,
        rs.to_place_id,
        tp.name                    AS to_name,
        SUM(rs.search_count)       AS search_count,
        SUM(
            CASE WHEN rs.travel_mode IN ('SHUTTLE','MIXED')
                 THEN rs.search_count ELSE 0 END
        )                          AS shuttle_use_count
    FROM route_stats rs
    JOIN places fp ON rs.from_place_id = fp.place_id
    JOIN places tp ON rs.to_place_id   = tp.place_id
    GROUP BY rs.from_place_id, rs.to_place_id, fp.name, tp.name
) sub;

-- ============================================================
-- [뷰 2] v_shuttle_usage - 셔틀 이용 현황
-- ============================================================
CREATE VIEW v_shuttle_usage AS
SELECT
    br.route_id,
    br.route_name,
    br.route_type,
    br.direction,
    COUNT(rl.route_id)                             AS use_count,
    RANK() OVER (ORDER BY COUNT(rl.route_id) DESC) AS usage_rank
FROM bus_routes br
LEFT JOIN route_logs rl ON rl.shuttle_route_id = br.route_id
GROUP BY br.route_id, br.route_name, br.route_type, br.direction;

-- ============================================================
-- [트리거] tr_route_stats_update - 길찾기 로그 저장 시 자동 집계
-- ============================================================
DELIMITER $$
CREATE TRIGGER tr_route_stats_update
AFTER INSERT ON route_logs
FOR EACH ROW
BEGIN
    IF NEW.from_place_id IS NOT NULL AND NEW.to_place_id IS NOT NULL THEN
        INSERT INTO route_stats
            (from_place_id, to_place_id, travel_mode, search_count, last_searched)
        VALUES
            (NEW.from_place_id, NEW.to_place_id, NEW.travel_mode, 1, NEW.searched_at)
        ON DUPLICATE KEY UPDATE
            search_count  = search_count + 1,
            last_searched = NEW.searched_at;

        UPDATE places SET search_count = search_count + 1
        WHERE place_id = NEW.from_place_id;

        UPDATE places SET search_count = search_count + 1
        WHERE place_id = NEW.to_place_id;
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- [프로시저 1] sp_recommend_route - 도보 vs 셔틀 추천
-- ============================================================
DELIMITER $$
CREATE PROCEDURE sp_recommend_route(
    IN  p_from_place_id INT,
    IN  p_to_place_id   INT,
    IN  p_now           TIME,
    OUT p_mode          VARCHAR(20),
    OUT p_duration_min  DECIMAL(6,2),
    OUT p_reason        TEXT
)
BEGIN
    DECLARE v_walk_time    DECIMAL(6,2) DEFAULT 15;
    DECLARE v_shuttle_time DECIMAL(6,2) DEFAULT 9999;
    DECLARE v_stop_id      INT          DEFAULT NULL;
    DECLARE v_walk_to_stop INT          DEFAULT 5;
    DECLARE v_next_dep     TIME         DEFAULT NULL;
    DECLARE v_wait_time    DECIMAL(6,2) DEFAULT 0;
    DECLARE v_stop_name    VARCHAR(150) DEFAULT '';

    -- 도보 시간: 과거 로그 평균, 없으면 기본 15분
    SELECT COALESCE(AVG(duration_min), 15)
    INTO   v_walk_time
    FROM   route_logs
    WHERE  from_place_id = p_from_place_id
      AND  to_place_id   = p_to_place_id
      AND  travel_mode   = 'WALK';

    -- 가장 가까운 정류장 찾기
    SELECT css.stop_id, css.walk_time_min, bs.name
    INTO   v_stop_id, v_walk_to_stop, v_stop_name
    FROM   college_shuttle_stops css
    JOIN   bus_stops bs ON css.stop_id = bs.stop_id
    WHERE  css.place_id = p_from_place_id
    ORDER BY css.walk_time_min ASC
    LIMIT 1;

    -- 다음 버스 시간 계산
    IF v_stop_id IS NOT NULL THEN
        SELECT bs.departure_time
        INTO   v_next_dep
        FROM   bus_schedules bs
        JOIN   bus_route_stops brs ON bs.route_id = brs.route_id
        WHERE  brs.stop_id       = v_stop_id
          AND  bs.departure_time >= p_now
        ORDER BY bs.departure_time ASC
        LIMIT 1;

        IF v_next_dep IS NOT NULL THEN
            SET v_wait_time    = TIME_TO_SEC(TIMEDIFF(v_next_dep, p_now)) / 60;
            SET v_shuttle_time = v_walk_to_stop + v_wait_time + 10;
        END IF;
    END IF;

    -- 비교 후 추천
    IF v_shuttle_time < v_walk_time THEN
        SET p_mode         = 'SHUTTLE';
        SET p_duration_min = v_shuttle_time;
        SET p_reason       = CONCAT('셔틀 추천: 도보(', ROUND(v_walk_time,0), '분)보다 ', ROUND(v_walk_time - v_shuttle_time, 0), '분 빠름. 탑승: ', v_stop_name);
    ELSE
        SET p_mode         = 'WALK';
        SET p_duration_min = v_walk_time;
        SET p_reason       = CONCAT('도보 추천: ', ROUND(v_walk_time, 0), '분');
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- [프로시저 2] sp_user_recommendations - 맞춤 경로 추천
-- ============================================================
DELIMITER $$
CREATE PROCEDURE sp_user_recommendations(IN p_user_id INT)
BEGIN
    SELECT
        rl.from_place_id,
        COALESCE(fp.name, ep_from.name) AS from_name,
        rl.to_place_id,
        COALESCE(tp.name, ep_to.name)   AS to_name,
        COUNT(*)                        AS use_count,
        ROUND(AVG(rl.duration_min), 1)  AS avg_duration_min,
        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS user_rank
    FROM route_logs rl
    LEFT JOIN places         fp      ON rl.from_place_id    = fp.place_id
    LEFT JOIN places         tp      ON rl.to_place_id      = tp.place_id
    LEFT JOIN external_places ep_from ON rl.from_external_id = ep_from.external_id
    LEFT JOIN external_places ep_to   ON rl.to_external_id   = ep_to.external_id
    WHERE rl.user_id = p_user_id
    GROUP BY rl.from_place_id, from_name, rl.to_place_id, to_name
    ORDER BY use_count DESC
    LIMIT 5;
END$$
DELIMITER ;

-- ============================================================
-- [프로시저 3] sp_nearest_bus_stops - 집 근처 정류장 찾기
-- ============================================================
DELIMITER $$
CREATE PROCEDURE sp_nearest_bus_stops(
    IN p_lat   DECIMAL(10,7),
    IN p_lng   DECIMAL(10,7),
    IN p_limit INT
)
BEGIN
    SELECT
        bs.stop_id,
        bs.name,
        bs.region,
        bs.latitude,
        bs.longitude,
        ROUND(
            6371000 * ACOS(
                COS(RADIANS(p_lat)) * COS(RADIANS(bs.latitude))
                * COS(RADIANS(bs.longitude) - RADIANS(p_lng))
                + SIN(RADIANS(p_lat)) * SIN(RADIANS(bs.latitude))
            )
        ) AS distance_m
    FROM bus_stops bs
    WHERE bs.latitude  != 0
      AND bs.longitude != 0
      AND bs.is_school_stop = 0
    ORDER BY distance_m ASC
    LIMIT p_limit;
END$$
DELIMITER ;
