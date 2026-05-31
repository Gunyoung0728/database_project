-- ============================================================
--  대구대학교 길찾기 서비스 - 실제 데이터 INSERT v2
--  실행 순서: campuses → places → users
--  ※ 위도/경도: 현재 경산캠퍼스 중심 좌표(35.8888, 128.7511)로 임시 입력
--     → 카카오맵에서 각 건물 검색 후 실제 좌표로 업데이트 필요
-- ============================================================

USE daegu_nav;

-- ============================================================
-- 1. campuses
-- ============================================================
INSERT INTO campuses (name, address, latitude, longitude) VALUES
  ('경산캠퍼스', '경상북도 경산시 진량읍 대구대로 201', 35.8888000, 128.7511000),
  ('대명동캠퍼스', '대구광역시 남구 대명로 201',         35.8465000, 128.5740000);


-- ============================================================
-- 2. places (72개 건물/시설)
--    campus_id 1 = 경산캠퍼스
--    latitude/longitude = 0 이면 아직 좌표 미입력 (나중에 업데이트)
--
--    좌표 업데이트 방법:
--    UPDATE places SET latitude=35.XXXXXXX, longitude=128.XXXXXXX
--    WHERE name='건물이름';
-- ============================================================

-- 기숙사 (DORMITORY)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '신애학사 1호관', 'DORMITORY', 0, 0, '여학생 기숙사'),
  (1, '신애학사 2호관', 'DORMITORY', 0, 0, '여학생 기숙사'),
  (1, '신애학사 3호관', 'DORMITORY', 0, 0, '여학생 기숙사'),
  (1, '신애학사 5호관', 'DORMITORY', 0, 0, '여학생 기숙사'),
  (1, '신애학사 6호관', 'DORMITORY', 0, 0, '여학생 기숙사'),
  (1, '입지학사 1호관', 'DORMITORY', 0, 0, '남학생 기숙사'),
  (1, '입지학사 2호관', 'DORMITORY', 0, 0, '남학생 기숙사'),
  (1, '입지학사 3호관', 'DORMITORY', 0, 0, '남학생 기숙사'),
  (1, '입지학사 5호관', 'DORMITORY', 0, 0, '남학생 기숙사');

-- 운동/체육 시설 (SPORTS)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '학생군사교육관',  'SPORTS', 0, 0, '학군단 교육 시설'),
  (1, '제1운동장',       'SPORTS', 0, 0, '축구 등 야외 운동장'),
  (1, '제3운동장',       'SPORTS', 0, 0, '야외 운동장'),
  (1, '야구장',          'SPORTS', 0, 0, '야구 경기장'),
  (1, '풋살장',          'SPORTS', 0, 0, '풋살 경기장'),
  (1, '테니스장 1',      'SPORTS', 0, 0, '테니스 코트'),
  (1, '테니스장 2',      'SPORTS', 0, 0, '테니스 코트'),
  (1, '테니스장 4',      'SPORTS', 0, 0, '테니스 코트');

-- 야외/자연 (OUTDOOR)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '비호동산',            'OUTDOOR', 0, 0, '캠퍼스 내 산책 가능한 동산'),
  (1, '비호동산 유아숲체험원','OUTDOOR', 0, 0, '숲 체험 공간'),
  (1, '야외공연장',          'OUTDOOR', 0, 0, '각종 공연 및 행사 장소'),
  (1, '자유광장',            'OUTDOOR', 0, 0, '학생 자유 모임 공간'),
  (1, '화훼온실',            'OUTDOOR', 0, 0, '생명과학대학 화훼 실습 온실');

-- 학습/지원 시설 (ACADEMIC)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '기술창업HUB센터',      'ACADEMIC', 0, 0, '창업 지원 센터 (W3-9)'),
  (1, '국제관',               'ACADEMIC', 0, 0, '국제 교류 관련 시설'),
  (1, '다숲관',               'ACADEMIC', 0, 0, '복합 학습 공간'),
  (1, '장애학생지원센터',     'ACADEMIC', 0, 0, '장애 학생 지원 시설 (W3-2)'),
  (1, '점자도서관',           'ACADEMIC', 0, 0, '시각장애인을 위한 점자 도서관 (W3-1)'),
  (1, '스마트캠퍼스 교육센터','ACADEMIC', 0, 0, '스마트 교육 관련 시설'),
  (1, '진로취업관',           'ACADEMIC', 0, 0, '진로 및 취업 지원 센터 (W2-5)');

-- 디자인예술대학 (COLLEGE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '디자인예술 1관', 'COLLEGE', 0, 0, '디자인예술대학 강의동'),
  (1, '디자인예술 2관', 'COLLEGE', 0, 0, '디자인예술대학 강의동'),
  (1, '디자인예술 3관', 'COLLEGE', 0, 0, '디자인예술대학 강의동'),
  (1, '디자인예술 5관', 'COLLEGE', 0, 0, '디자인예술대학 강의동');

-- 사범대학 (COLLEGE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '사범 1관', 'COLLEGE', 0, 0, '사범대학 강의동'),
  (1, '사범 2관', 'COLLEGE', 0, 0, '사범대학 강의동'),
  (1, '사범 3관', 'COLLEGE', 0, 0, '사범대학 강의동');

-- 글로컬라이프대학 / 생명과학 (COLLEGE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '생명과학 1관', 'COLLEGE', 0, 0, '생명과학 관련 강의 및 실험동'),
  (1, '생명과학 2관', 'COLLEGE', 0, 0, '생명과학 관련 강의 및 실험동'),
  (1, '생명과학 3관', 'COLLEGE', 0, 0, '생명과학 관련 강의 및 실험동'),
  (1, '생명과학 5관', 'COLLEGE', 0, 0, '생명과학 관련 강의 및 실험동'),
  (1, '생명과학 6관', 'COLLEGE', 0, 0, '생명과학 관련 강의 및 실험동');

-- IT·공과대학 (COLLEGE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '공학 1관', 'COLLEGE', 0, 0, 'IT·공과대학 강의동'),
  (1, '공학 2관', 'COLLEGE', 0, 0, 'IT·공과대학 강의동'),
  (1, '공학 3관', 'COLLEGE', 0, 0, 'IT·공과대학 강의동'),
  (1, '공학 5관', 'COLLEGE', 0, 0, 'IT·공과대학 강의동'),
  (1, '공학 6관', 'COLLEGE', 0, 0, 'IT·공과대학 강의동'),
  (1, '공학 7관', 'COLLEGE', 0, 0, 'IT·공과대학 강의동'),
  (1, '공학 8관', 'COLLEGE', 0, 0, 'IT·공과대학 강의동');

-- 글로벌경영대학 (COLLEGE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '경영 1관',        'COLLEGE', 0, 0, '글로벌경영대학 강의동'),
  (1, '경영 2관',        'COLLEGE', 0, 0, '글로벌경영대학 강의동'),
  (1, '경영대학 강당동', 'COLLEGE', 0, 0, '글로벌경영대학 강당');

-- 인문대학 (COLLEGE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '인문 1관', 'COLLEGE', 0, 0, '인문대학 강의동'),
  (1, '인문 2관', 'COLLEGE', 0, 0, '인문대학 강의동'),
  (1, '인문 3관', 'COLLEGE', 0, 0, '인문대학 강의동');

-- 재활과학대학 (COLLEGE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '재활과학 1관',   'COLLEGE', 0, 0, '재활과학대학 강의동'),
  (1, '재활과학 2관',   'COLLEGE', 0, 0, '재활과학대학 강의동'),
  (1, '재활과학대학관', 'COLLEGE', 0, 0, '재활과학대학 본관');

-- 복지/문화 시설 (WELFARE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '동편복지관', 'WELFARE', 0, 0, '학생 복지 시설'),
  (1, '웅지관',     'WELFARE', 0, 0, '복합 문화 시설'),
  (1, '성산홀',     'WELFARE', 0, 0, '대형 강당 및 공연장');

-- 편의시설 (CONVENIENCE)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '파리바게뜨 대구대점',      'CONVENIENCE', 0, 0, '제과/카페'),
  (1, '써브웨이 경산대구대점',    'CONVENIENCE', 0, 0, '샌드위치 전문점'),
  (1, 'CU 대구대비호생활관점',    'CONVENIENCE', 0, 0, '편의점'),
  (1, '세븐일레븐 대구대기숙사점','CONVENIENCE', 0, 0, '편의점'),
  (1, '이마트24 대구대복지관점',  'CONVENIENCE', 0, 0, '편의점'),
  (1, '버거킹 대구대점',          'CONVENIENCE', 0, 0, '패스트푸드'),
  (1, '스타벅스 대구대학교점',    'CONVENIENCE', 0, 0, '카페'),
  (1, '다이소 경산대구대점',      'CONVENIENCE', 0, 0, '생활용품점'),
  (1, '미즈컨테이너',             'CONVENIENCE', 0, 0, '음식점'),
  (1, '헌혈의집 대구대센터',      'CONVENIENCE', 0, 0, '헌혈 센터'),
  (1, '씨아이케이스텔라',         'CONVENIENCE', 0, 0, '기타 편의시설');

-- 기타 (OTHER)
INSERT INTO places (campus_id, name, place_type, latitude, longitude, description) VALUES
  (1, '대구사이버대학교',  'OTHER', 0, 0, '캠퍼스 내 위치한 사이버대학교');


-- ============================================================
-- 3. users (테스트용 더미 사용자 5명)
--    실제 서비스 시 삭제 후 실제 가입 데이터로 대체
-- ============================================================
INSERT INTO users (student_id, password_hash, name, major, home_place_id) VALUES
  ('2024001001', 'hashed_pw_1', '김민준', '컴퓨터공학과',     (SELECT place_id FROM places WHERE name='공학 1관')),
  ('2024002002', 'hashed_pw_2', '이서연', '경영학과',         (SELECT place_id FROM places WHERE name='경영 1관')),
  ('2024003003', 'hashed_pw_3', '박지호', '사회복지학과',     (SELECT place_id FROM places WHERE name='인문 1관')),
  ('2023004004', 'hashed_pw_4', '최예은', '물리치료학과',     (SELECT place_id FROM places WHERE name='재활과학 1관')),
  ('2023005005', 'hashed_pw_5', '정태양', '산업디자인학과',   (SELECT place_id FROM places WHERE name='디자인예술 1관'));
