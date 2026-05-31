-- ============================================================
--  대구대학교 길찾기 통합 DB 스키마
-- ============================================================
DROP DATABASE IF EXISTS daegu_nav;
CREATE DATABASE daegu_nav
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE daegu_nav;

-- ── 1. 캠퍼스 ────────────────────────────────────────────
CREATE TABLE 캠퍼스 (
  캠퍼스_id  INT          NOT NULL AUTO_INCREMENT,
  이름       VARCHAR(100) NOT NULL,
  주소       VARCHAR(200) NULL,
  위도       DECIMAL(10,7) NOT NULL DEFAULT 0,
  경도       DECIMAL(10,7) NOT NULL DEFAULT 0,
  PRIMARY KEY (캠퍼스_id)
);

-- ── 2. 건물 ──────────────────────────────────────────────
CREATE TABLE 건물 (
  건물_id    VARCHAR(10)  NOT NULL,
  이름       VARCHAR(100) NOT NULL,
  건물유형   ENUM('단과대학','학술시설','복지시설','편의시설','기숙사','야외','운동시설')
             NOT NULL DEFAULT '단과대학',
  설명       VARCHAR(200) NULL,
  위도       DECIMAL(10,7) NOT NULL DEFAULT 0,
  경도       DECIMAL(10,7) NOT NULL DEFAULT 0,
  구역       CHAR(1)      NULL COMMENT 'W=서쪽 E=동쪽 C=중앙',
  캠퍼스_id  INT          NULL,
  검색횟수   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (건물_id),
  CONSTRAINT fk_건물_캠퍼스 FOREIGN KEY (캠퍼스_id)
    REFERENCES 캠퍼스(캠퍼스_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ── 3. 외부장소 ──────────────────────────────────────────
CREATE TABLE 외부장소 (
  외부장소_id INT          NOT NULL AUTO_INCREMENT,
  이름        VARCHAR(150) NOT NULL,
  주소        VARCHAR(200) NULL,
  카테고리    VARCHAR(100) NULL,
  위도        DECIMAL(10,7) NOT NULL DEFAULT 0,
  경도        DECIMAL(10,7) NOT NULL DEFAULT 0,
  PRIMARY KEY (외부장소_id)
);

-- ── 4. 회원 ──────────────────────────────────────────────
CREATE TABLE 회원 (
  회원_id      INT          NOT NULL AUTO_INCREMENT,
  학번         VARCHAR(20)  NOT NULL UNIQUE,
  비밀번호해시 VARCHAR(255) NOT NULL,
  이름         VARCHAR(50)  NOT NULL,
  학과         VARCHAR(100) NULL,
  집주소       VARCHAR(200) NULL,
  생성일       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (회원_id)
);

-- ── 5. 노선 ──────────────────────────────────────────────
CREATE TABLE 노선 (
  노선_id   VARCHAR(20)  NOT NULL,
  노선번호  VARCHAR(20)  NULL,
  노선명    VARCHAR(100) NOT NULL,
  노선유형  VARCHAR(30)  NOT NULL COMMENT '대구등교,지하철연계,시외등교,하교',
  방향      ENUM('등교','하교') NOT NULL DEFAULT '등교',
  운행요일  VARCHAR(20)  NOT NULL DEFAULT '매일',
  비고      VARCHAR(200) NULL,
  PRIMARY KEY (노선_id)
);

-- ── 6. 정류장 ────────────────────────────────────────────
CREATE TABLE 정류장 (
  정류장_id   INT          NOT NULL AUTO_INCREMENT,
  정류장명    VARCHAR(150) NOT NULL,
  지역        VARCHAR(100) NULL,
  위도        DECIMAL(10,7) NULL,
  경도        DECIMAL(10,7) NULL,
  캠퍼스정류장 TINYINT(1)  NOT NULL DEFAULT 0,
  인접건물_id VARCHAR(10)  NULL,
  PRIMARY KEY (정류장_id),
  CONSTRAINT fk_정류장_건물 FOREIGN KEY (인접건물_id)
    REFERENCES 건물(건물_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ── 7. 시간표 (노선+정류장 연결 + 출발시간) ─────────────
CREATE TABLE 시간표 (
  시간표_id INT          NOT NULL AUTO_INCREMENT,
  노선_id   VARCHAR(20)  NOT NULL,
  정류장_id INT          NOT NULL,
  정차순서  INT          NOT NULL,
  출발시간  TIME         NOT NULL,
  방향      ENUM('등교','하교') NOT NULL DEFAULT '등교',
  PRIMARY KEY (시간표_id),
  CONSTRAINT fk_시간표_노선    FOREIGN KEY (노선_id)   REFERENCES 노선(노선_id)   ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_시간표_정류장  FOREIGN KEY (정류장_id) REFERENCES 정류장(정류장_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ── 8. 길찾기로그 ─────────────────────────────────────────
CREATE TABLE 길찾기로그 (
  로그_id      INT          NOT NULL AUTO_INCREMENT,
  회원_id      INT          NULL,
  출발건물_id  VARCHAR(10)  NULL,
  출발외부_id  INT          NULL,
  도착건물_id  VARCHAR(10)  NULL,
  도착외부_id  INT          NULL,
  이동거리     DECIMAL(10,2) NULL,
  이동시간     DECIMAL(6,2)  NULL,
  이동수단     ENUM('도보','자동차','셔틀','혼합') NOT NULL DEFAULT '도보',
  검색일시     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (로그_id),
  CONSTRAINT fk_로그_회원       FOREIGN KEY (회원_id)     REFERENCES 회원(회원_id)         ON DELETE SET NULL,
  CONSTRAINT fk_로그_출발건물   FOREIGN KEY (출발건물_id) REFERENCES 건물(건물_id)          ON DELETE SET NULL,
  CONSTRAINT fk_로그_도착건물   FOREIGN KEY (도착건물_id) REFERENCES 건물(건물_id)          ON DELETE SET NULL,
  CONSTRAINT fk_로그_출발외부   FOREIGN KEY (출발외부_id) REFERENCES 외부장소(외부장소_id)  ON DELETE SET NULL,
  CONSTRAINT fk_로그_도착외부   FOREIGN KEY (도착외부_id) REFERENCES 외부장소(외부장소_id)  ON DELETE SET NULL
);

-- ── 9. 경로통계 ───────────────────────────────────────────
CREATE TABLE 경로통계 (
  통계_id      INT         NOT NULL AUTO_INCREMENT,
  출발건물_id  VARCHAR(10) NOT NULL,
  도착건물_id  VARCHAR(10) NOT NULL,
  이동수단     ENUM('도보','자동차','셔틀','혼합') NOT NULL DEFAULT '도보',
  검색횟수     INT         NOT NULL DEFAULT 1,
  마지막검색   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (통계_id),
  UNIQUE KEY uq_경로 (출발건물_id, 도착건물_id, 이동수단),
  CONSTRAINT fk_통계_출발 FOREIGN KEY (출발건물_id) REFERENCES 건물(건물_id) ON DELETE CASCADE,
  CONSTRAINT fk_통계_도착 FOREIGN KEY (도착건물_id) REFERENCES 건물(건물_id) ON DELETE CASCADE
);

-- ── 10. 즐겨찾기 ──────────────────────────────────────────
CREATE TABLE 즐겨찾기 (
  즐겨찾기_id INT         NOT NULL AUTO_INCREMENT,
  회원_id     INT         NOT NULL,
  출발건물_id VARCHAR(10) NOT NULL,
  도착건물_id VARCHAR(10) NOT NULL,
  별칭        VARCHAR(100) NULL,
  생성일      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (즐겨찾기_id),
  UNIQUE KEY uq_즐겨찾기 (회원_id, 출발건물_id, 도착건물_id),
  CONSTRAINT fk_즐겨찾기_회원  FOREIGN KEY (회원_id)     REFERENCES 회원(회원_id) ON DELETE CASCADE,
  CONSTRAINT fk_즐겨찾기_출발  FOREIGN KEY (출발건물_id) REFERENCES 건물(건물_id) ON DELETE CASCADE,
  CONSTRAINT fk_즐겨찾기_도착  FOREIGN KEY (도착건물_id) REFERENCES 건물(건물_id) ON DELETE CASCADE
);

-- ── 11. 건물별점 ──────────────────────────────────────────
CREATE TABLE 건물별점 (
  별점_id  INT         NOT NULL AUTO_INCREMENT,
  회원_id  INT         NOT NULL,
  건물_id  VARCHAR(10) NOT NULL,
  별점     TINYINT     NOT NULL,
  생성일   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  수정일   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (별점_id),
  UNIQUE KEY uq_건물별점 (회원_id, 건물_id),
  CONSTRAINT chk_별점범위 CHECK (별점 BETWEEN 1 AND 5),
  CONSTRAINT fk_별점_회원  FOREIGN KEY (회원_id) REFERENCES 회원(회원_id) ON DELETE CASCADE,
  CONSTRAINT fk_별점_건물  FOREIGN KEY (건물_id) REFERENCES 건물(건물_id) ON DELETE CASCADE
);
