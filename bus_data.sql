-- ============================================================
--  대구대학교 통학버스 데이터 (2026-1학기)
--  이미지에서 추출한 실제 노선/정류장/시간표 데이터
--  ※ 좌표(latitude/longitude)는 모두 0으로 입력됨
--     → 카카오맵에서 각 정류장 검색 후 업데이트 필요
--     UPDATE bus_stops SET latitude=35.X, longitude=128.X WHERE name='정류장명';
-- ============================================================

USE daegu_nav;

-- ============================================================
-- 1. bus_routes (총 30개 노선)
-- ============================================================
INSERT INTO bus_routes (route_number, route_name, route_type, direction, day_type, note) VALUES
-- 대구 등교 (14개)
('4',    '대구 4번 등교',    '대구', '등교', '매일', '대명동캠퍼스 정문 출발'),
('5',    '대구 5번 등교',    '대구', '등교', '화목', '경산↔대명동 연결 노선'),
('9',    '대구 9번 등교',    '대구', '등교', '매일', NULL),
('10',   '대구 10번 등교',   '대구', '등교', '매일', NULL),
('11',   '대구 11번 등교',   '대구', '등교', '매일', NULL),
('11-1', '대구 11-1번 등교', '대구', '등교', '매일', NULL),
('16-1', '대구 16-1번 등교', '대구', '등교', '매일', NULL),
('21',   '대구 21번 등교',   '대구', '등교', '매일', NULL),
('23',   '대구 23번 등교',   '대구', '등교', '매일', '대구국제공항 경유'),
('26',   '대구 26번 등교',   '대구', '등교', '매일', NULL),
('28',   '대구 28번 등교',   '대구', '등교', '매일', NULL),
('30',   '대구 30번 등교',   '대구', '등교', '매일', NULL),
('31-1', '대구 31-1번 등교', '대구', '등교', '매일', NULL),
('32',   '대구 32번 등교',   '대구', '등교', '매일', NULL),

-- 대구 하교 (13개)
('3',    '대구 3번 하교',    '대구', '하교', '매일', NULL),
('4',    '대구 4번 하교',    '대구', '하교', '매일', NULL),
('4-1',  '대구 4-1번 하교',  '대구', '하교', '매일', NULL),
('5-1',  '대구 5-1번 하교',  '대구', '하교', '화목', '대명동→경산 연결 노선'),
('7',    '대구 7번 하교',    '대구', '하교', '매일', NULL),
('9',    '대구 9번 하교',    '대구', '하교', '매일', NULL),
('9-1',  '대구 9-1번 하교',  '대구', '하교', '매일', NULL),
('12',   '대구 12번 하교',   '대구', '하교', '매일', NULL),
('12-1', '대구 12-1번 하교', '대구', '하교', '매일', NULL),
('15',   '대구 15번 하교',   '대구', '하교', '매일', NULL),
('16',   '대구 16번 하교',   '대구', '하교', '매일', NULL),
('16-1', '대구 16-1번 하교', '대구', '하교', '매일', NULL),
('17',   '대구 17번 하교',   '대구', '하교', '매일', NULL),

-- 지하철 2호선 (등교 3 + 하교 1)
('수성알파시티', '지하철2호선 수성알파시티 등교', '지하철2호선', '등교', '매일', '경북학숙 경유'),
('경산역',       '지하철2호선 경산역 등교',       '지하철2호선', '등교', '매일', '경산역→임당역→영남대역'),
('임당역',       '지하철2호선 임당역 등교',       '지하철2호선', '등교', '매일', '임당역→영남대역'),
('임당역하교',   '지하철2호선 임당역 하교',       '지하철2호선', '하교', '매일', '영남대 맞은편 경유'),

-- 지하철 1호선 (등교 1 + 하교 1)
('하양역',       '지하철1호선 하양역 등교',       '지하철1호선', '등교', '매일', NULL),
('하양역하교',   '지하철1호선 하양역 하교',       '지하철1호선', '하교', '매일', NULL),

-- 시외노선 (등교 3 + 하교 3)
('구미',  '시외 구미 등교',  '시외', '등교', '매일', '구미종합터미널 경유'),
('포항',  '시외 포항 등교',  '시외', '등교', '매일', '영천 탑승 가능'),
('울산',  '시외 울산 등교',  '시외', '등교', '매일', NULL),
('구미하교',  '시외 구미 하교',  '시외', '하교', '매일', '18:10 출발'),
('포항하교',  '시외 포항 하교',  '시외', '하교', '매일', '18:10 출발, 영천 경유'),
('울산하교',  '시외 울산 하교',  '시외', '하교', '매일', '18:10 출발');


-- ============================================================
-- 2. bus_stops (정류장 목록)
--    ※ 좌표는 모두 0 → 카카오맵 검색 후 UPDATE 필요
-- ============================================================

-- 교내 정류장 (is_school_stop=1)
INSERT INTO bus_stops (name, region, is_school_stop) VALUES
('경산캠퍼스 서문',           '경산', 1),
('경산캠퍼스 점자도서관 건너편','경산', 1),
('경산캠퍼스 창파도서관',      '경산', 1),
('경산캠퍼스 경영1관 맞은편',  '경산', 1),
('경산캠퍼스 생명과학1관',     '경산', 1),
('경산캠퍼스 공학2관',         '경산', 1),
('경산캠퍼스 생명과학3관',     '경산', 1),
('경산캠퍼스 비호생활관 식당앞 주차장', '경산', 1),
('경산캠퍼스 디자인예술5관 앞 정문 도로앞', '경산', 1),
('경산캠퍼스 인문2관 앞 주차장 1호선 승강장', '경산', 1),
('경산캠퍼스 인문2관 앞 주차장 2호선 승강장', '경산', 1),
('대명동캠퍼스 정문', '대구 남구', 1);

-- 대구 달서구 정류장
INSERT INTO bus_stops (name, region) VALUES
('용산역 5번출구',                  '대구 달서구'),
('스타벅스 대구감삼DT점',           '대구 달서구'),
('롯데시네마광장점 앞',             '대구 달서구'),
('서대구역 2번출구 시외버스승강장', '대구 달서구'),
('서대구역 1번출구',                '대구 달서구'),
('대실역 3번출구',                  '대구 달서구'),
('대실역 4번출구',                  '대구 달서구'),
('이곡역 3번출구 타이어뱅크 앞',    '대구 달서구'),
('이곡역 4번출구',                  '대구 달서구'),
('성서한2차 APT 일촐회집 앞',       '대구 달서구'),
('성서홈플러스 건너편',             '대구 달서구'),
('스타벅스 감삼DT점 앞',            '대구 달서구'),
('달서구청',                        '대구 달서구'),
('월촌역 7번 버스승강장',           '대구 달서구'),
('달서구청택시승강장앞',            '대구 달서구'),
('하이요커피 신월성점',             '대구 달서구'),
('월배역 2번출구',                  '대구 달서구'),
('상인역 3번출구 심안과앞',         '대구 달서구'),
('롯데백화점 상인점 앞',            '대구 달서구'),
('엘리바덴신월성점',                '대구 달서구');

-- 대구 달성군/화원 정류장
INSERT INTO bus_stops (name, region) VALUES
('대곡역 4번출구 롯데리아 앞',      '대구 달성'),
('대곡역',                          '대구 달성'),
('대곡지구 사계절타운 301동 옆',    '대구 달성'),
('GS25대구화원점앞',                '대구 달성'),
('투썸플레이스 대구화원점앞',       '대구 달성');

-- 대구 수성구 정류장
INSERT INTO bus_stops (name, region) VALUES
('지산역 1번출구 영남맨션 횡단보도 앞', '대구 수성구'),
('수성못그림책도서관앞',               '대구 수성구'),
('범물역',                             '대구 수성구'),
('지산역',                             '대구 수성구'),
('범물1동 행정복지센터',               '대구 수성구'),
('두산오거리 투썸플레이스 DT점',       '대구 수성구'),
('수성알파시티역 3번출구',             '대구 수성구'),
('경북학숙 청담숲불 앞',              '대구 수성구');

-- 대구 중구/동구 정류장
INSERT INTO bus_stops (name, region) VALUES
('동대구역광장앞 시티버스승강장',   '대구 동구'),
('동대구역',                        '대구 동구'),
('대구공항버스승강장',              '대구 동구'),
('북현태왕아너스앞',                '대구 동구'),
('롯데하이마트앞 북현오거리',       '대구 동구'),
('강남약국맞은편 롯데리아 신암점',  '대구 동구'),
('퀸벨호텔 횡단보도앞',            '대구 동구'),
('중동네거리 타이어뱅크앞',         '대구 중구'),
('중동네거리 스타벅스 DT점',        '대구 중구');

-- 대구 북구 정류장
INSERT INTO bus_stops (name, region) VALUES
('이마트 칠성점 맞은편 경희사랑한의원 앞', '대구 북구'),
('경대북문 김정민어학원 맞은편',           '대구 북구'),
('대구북중학교 정문',                      '대구 북구'),
('대구국제공항 3번게이트앞',               '대구 북구'),
('칠곡중 정문',                            '대구 북구'),
('세븐밸리(행복한갈비) 앞',                '대구 북구'),
('50사단 더타이어샵 학정점',               '대구 북구'),
('다이소 대구동서변점',                    '대구 북구'),
('운암고건너편 버스승강장',                '대구 북구'),
('어울아트센터',                           '대구 북구'),
('북구어울아트센터',                       '대구 북구'),
('침산동이마트',                           '대구 북구'),
('오페라하우스',                           '대구 북구'),
('새마을금고 새북대구 태전지점',           '대구 북구'),
('팔달교',                                 '대구 북구'),
('태전교',                                 '대구 북구'),
('칠곡면허시험장',                         '대구 북구'),
('구암중',                                 '대구 북구'),
('운암고',                                 '대구 북구'),
('칠곡롯데시네마',                         '대구 북구'),
('50사단 남문 알뜰주유소',                 '대구 북구'),
('칠곡농협건너편 유성타일도기',            '대구 북구'),
('현대칠곡주유소',                         '대구 북구');

-- 경산 정류장
INSERT INTO bus_stops (name, region) VALUES
('경산역 경산성당앞 삼천리자전거 사정점', '경산'),
('임당역 5번출구 버스승강장',             '경산'),
('영남대역',                              '경산'),
('영남대 맞은편',                         '경산'),
('경북학숙 맞은편 현대주유소',           '경산');

-- 하양 정류장
INSERT INTO bus_stops (name, region) VALUES
('하양역 환승정차구역앞', '경산 하양'),
('하양역 맞은편 하이마트앞', '경산 하양');

-- 구미 정류장
INSERT INTO bus_stops (name, region) VALUES
('대구은행 인동지점앞',   '구미'),
('구미종합터미널앞',      '구미');

-- 포항 정류장
INSERT INTO bus_stops (name, region) VALUES
('라한호텔',                                    '포항'),
('오거리 우리은행포항중앙지점앞',               '포항'),
('포항종합터미널 세븐일레븐 포항밸류점앞',      '포항'),
('SK뷰1차APT맞은편 SK주유소',                   '포항'),
('구안강시외터미널건너편',                      '포항 안강'),
('풍산금속앞',                                  '포항 안강');

-- 영천 정류장
INSERT INTO bus_stops (name, region) VALUES
('영천시외버스터미널 건너편', '영천');

-- 울산 정류장
INSERT INTO bus_stops (name, region) VALUES
('야음동 국민요양병원 앞',      '울산'),
('야음 홈플러스 앞',            '울산'),
('수암시장 농협 앞',            '울산'),
('공업탑네거리 시외버스승강장', '울산'),
('수자원공사 군부대 버스정류장','울산'),
('법원 앞 시내버스정류장',      '울산'),
('신복교차로 전세버스정류장 앞','울산');

-- 유천 정류장
INSERT INTO bus_stops (name, region) VALUES
('유천치안센터', '대구 남구');


-- ============================================================
-- 3. bus_schedules (출발 시간표)
-- ============================================================

-- 대구 등교 (노선별 단일 출발시간)
INSERT INTO bus_schedules (route_id, departure_time) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='4'    AND direction='등교'), '07:10'),
((SELECT route_id FROM bus_routes WHERE route_number='5'    AND direction='등교'), '07:30'),
((SELECT route_id FROM bus_routes WHERE route_number='9'    AND direction='등교'), '07:15'),
((SELECT route_id FROM bus_routes WHERE route_number='10'   AND direction='등교'), '07:35'),
((SELECT route_id FROM bus_routes WHERE route_number='11'   AND direction='등교'), '07:37'),
((SELECT route_id FROM bus_routes WHERE route_number='11-1' AND direction='등교'), '07:25'),
((SELECT route_id FROM bus_routes WHERE route_number='16-1' AND direction='등교'), '07:35'),
((SELECT route_id FROM bus_routes WHERE route_number='21'   AND direction='등교'), '07:20'),
((SELECT route_id FROM bus_routes WHERE route_number='23'   AND direction='등교'), '07:10'),
((SELECT route_id FROM bus_routes WHERE route_number='26'   AND direction='등교'), '07:10'),
((SELECT route_id FROM bus_routes WHERE route_number='28'   AND direction='등교'), '07:25'),
((SELECT route_id FROM bus_routes WHERE route_number='30'   AND direction='등교'), '07:20'),
((SELECT route_id FROM bus_routes WHERE route_number='31-1' AND direction='등교'), '07:10'),
((SELECT route_id FROM bus_routes WHERE route_number='32'   AND direction='등교'), '07:20');

-- 대구 하교
INSERT INTO bus_schedules (route_id, departure_time) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='3'    AND direction='하교'), '17:15'),
((SELECT route_id FROM bus_routes WHERE route_number='4'    AND direction='하교'), '17:15'),
((SELECT route_id FROM bus_routes WHERE route_number='4-1'  AND direction='하교'), '18:30'),
((SELECT route_id FROM bus_routes WHERE route_number='7'    AND direction='하교'), '18:00'),
((SELECT route_id FROM bus_routes WHERE route_number='9'    AND direction='하교'), '17:15'),
((SELECT route_id FROM bus_routes WHERE route_number='9-1'  AND direction='하교'), '18:30'),
((SELECT route_id FROM bus_routes WHERE route_number='12'   AND direction='하교'), '17:15'),
((SELECT route_id FROM bus_routes WHERE route_number='12-1' AND direction='하교'), '18:30'),
((SELECT route_id FROM bus_routes WHERE route_number='15'   AND direction='하교'), '17:15'),
((SELECT route_id FROM bus_routes WHERE route_number='16'   AND direction='하교'), '17:15'),
((SELECT route_id FROM bus_routes WHERE route_number='16-1' AND direction='하교'), '18:30'),
((SELECT route_id FROM bus_routes WHERE route_number='17'   AND direction='하교'), '17:15');

-- 5-1번 하교 (화/목 다른 시간)
INSERT INTO bus_schedules (route_id, departure_time, note) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='5-1'), '17:20', '화요일'),
((SELECT route_id FROM bus_routes WHERE route_number='5-1'), '18:20', '목요일');

-- 지하철 2호선 수성알파시티 등교 (5회)
INSERT INTO bus_schedules (route_id, departure_time, note) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='수성알파시티'), '07:50', '경북학숙 경유'),
((SELECT route_id FROM bus_routes WHERE route_number='수성알파시티'), '08:00', '경북학숙 경유'),
((SELECT route_id FROM bus_routes WHERE route_number='수성알파시티'), '09:00', '경북학숙 경유'),
((SELECT route_id FROM bus_routes WHERE route_number='수성알파시티'), '09:30', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='수성알파시티'), '10:00', NULL);

-- 지하철 2호선 경산역 등교 (2회)
INSERT INTO bus_schedules (route_id, departure_time) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='경산역'), '07:50'),
((SELECT route_id FROM bus_routes WHERE route_number='경산역'), '09:10');

-- 지하철 2호선 임당역 등교 (3회)
INSERT INTO bus_schedules (route_id, departure_time) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='임당역'), '07:50'),
((SELECT route_id FROM bus_routes WHERE route_number='임당역'), '08:05'),
((SELECT route_id FROM bus_routes WHERE route_number='임당역'), '09:10');

-- 지하철 2호선 임당역 하교 (12회)
INSERT INTO bus_schedules (route_id, departure_time, note) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '15:30', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '16:00', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '16:10', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '16:20', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '16:30', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '16:40', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '16:50', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '17:00', '경산역 도착'),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '17:20', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '17:45', '경북학숙 경유'),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '18:00', NULL),
((SELECT route_id FROM bus_routes WHERE route_number='임당역하교'), '19:00', '경산역 도착');

-- 지하철 1호선 하양역 등교 (9회)
INSERT INTO bus_schedules (route_id, departure_time) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '08:10'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '08:25'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '08:30'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '08:40'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '08:50'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '09:15'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '09:30'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '09:50'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역'), '10:10');

-- 지하철 1호선 하양역 하교 (11회)
INSERT INTO bus_schedules (route_id, departure_time) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '15:00'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '15:30'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '16:00'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '16:30'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '16:45'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '17:00'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '17:10'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '17:20'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '17:30'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '18:00'),
((SELECT route_id FROM bus_routes WHERE route_number='하양역하교'), '18:30');

-- 시외노선 등교
INSERT INTO bus_schedules (route_id, departure_time, note) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='구미'),  '07:20', '대구은행 인동지점 출발'),
((SELECT route_id FROM bus_routes WHERE route_number='포항'),  '06:50', '라한호텔 출발'),
((SELECT route_id FROM bus_routes WHERE route_number='울산'),  '07:07', '야음동 국민요양병원 출발');

-- 시외노선 하교 (전 노선 18:10 출발)
INSERT INTO bus_schedules (route_id, departure_time, note) VALUES
((SELECT route_id FROM bus_routes WHERE route_number='구미하교'),  '18:10', '등교 역순 정차'),
((SELECT route_id FROM bus_routes WHERE route_number='포항하교'),  '18:10', '등교 역순 정차, 영천 경유'),
((SELECT route_id FROM bus_routes WHERE route_number='울산하교'),  '18:10', '등교 역순 정차');
