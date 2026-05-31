const express = require('express');
const db      = require('../db');
const router  = express.Router();

// 셔틀 추천 API
router.get('/shuttle-recommend', async (req, res) => {
  const { dest_lat, dest_lng, dest_name, dest_addr, direction } = req.query;
  const 방향 = direction || '하교';
  const 검색텍스트 = `${dest_name||''} ${dest_addr||''}`;
  if (!dest_lat || !dest_lng)
    return res.status(400).json({ shuttle: null });
  try {
    // 1. 시외 노선 키워드 확인
    const 시외키워드 = {
      '구미': { 등교: 'R-OUT-GM', 하교: 'R-OUT-GM' },
      '울산': { 등교: 'R-OUT-US', 하교: 'R-OUT-US' },
      '포항': { 등교: 'R-OUT-PH', 하교: 'R-OUT-PH' },
      '영천': { 등교: 'R-OUT-PH', 하교: 'R-OUT-PH' },
    };
    for (const [keyword, routeIds] of Object.entries(시외키워드)) {
      if (검색텍스트.includes(keyword)) {
        const routeId = 방향 === '등교' ? routeIds.등교 : routeIds.하교;
        const [routes] = await db.query(
          'SELECT 노선_id, 노선명 FROM 노선 WHERE 노선_id = ?', [routeId]
        );
        if (routes.length > 0)
          return res.json({ shuttle: routes[0], reason: `${keyword} 방면 시외버스` });
      }
    }
    // 2. 정류장 좌표와 목적지 거리 계산 (5km 이내 정류장 있는 노선 추천)
    const [stations] = await db.query(
      `SELECT s.정류장_id, s.정류장명, s.위도, s.경도, t.노선_id,
              n.노선명, n.노선유형,
              (6371000 * ACOS(
                COS(RADIANS(?)) * COS(RADIANS(s.위도))
                * COS(RADIANS(s.경도) - RADIANS(?))
                + SIN(RADIANS(?)) * SIN(RADIANS(s.위도))
              )) AS 거리_m
       FROM 정류장 s
       JOIN 시간표 t ON s.정류장_id = t.정류장_id
       JOIN 노선 n ON t.노선_id = n.노선_id
       WHERE s.캠퍼스정류장 = 0
          AND s.위도 IS NOT NULL
          AND s.위도 != 0
          AND n.방향 = ?
        HAVING 거리_m < 5000
        ORDER BY 거리_m ASC
        LIMIT 1`,
      [dest_lat, dest_lng, dest_lat, 방향]
    );
    if (stations.length > 0) {
      return res.json({
        shuttle: { 노선_id: stations[0].노선_id, 노선명: stations[0].노선명 },
        reason: `목적지 근처 정류장(${stations[0].정류장명})까지 운행`,
        distance_m: Math.round(stations[0].거리_m)
      });
    }
    res.json({ shuttle: null });
  } catch (err) { res.status(500).json({ shuttle: null, error: err.message }); }
});

router.post('/directions', async (req, res) => {
  const { origin_x, origin_y, dest_x, dest_y } = req.body;
  if (!origin_x || !origin_y || !dest_x || !dest_y)
    return res.status(400).json({ message: '좌표 정보가 필요해요.' });
  try {
    const response = await fetch(
      `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin_x},${origin_y}&destination=${dest_x},${dest_y}&priority=RECOMMEND`,
      {
        headers: {
          'Authorization': `KakaoAK ${process.env.KAKAO_REST_KEY}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173',
        }
      }
    );
    const data = await response.json();
    if (!data.routes || data.routes[0].result_code !== 0)
      return res.status(400).json({ message: '경로를 찾을 수 없어요.' });
    const summary = data.routes[0].summary;
    const pathCoords = [];
    data.routes[0].sections.forEach(section => {
      section.roads.forEach(road => {
        for (let i = 0; i < road.vertexes.length; i += 2)
          pathCoords.push({ x: road.vertexes[i], y: road.vertexes[i+1] });
      });
    });
    res.json({
      distance_m:        summary.distance,
      car_duration_min:  Math.ceil(summary.duration / 60),
      walk_duration_min: Math.ceil(summary.distance / 80),
      path:              pathCoords,
    });
  } catch (err) { res.status(500).json({ message: '카카오 API 오류', error: err.message }); }
});

module.exports = router;
