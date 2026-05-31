const express = require('express');
const db      = require('../db');
const router  = express.Router();

// 전체 건물 목록
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.건물_id AS place_id, b.이름 AS name, b.건물유형 AS place_type,
              b.설명 AS description, b.위도 AS latitude, b.경도 AS longitude,
              b.구역 AS zone, b.검색횟수 AS search_count,
              c.이름 AS campus_name
       FROM 건물 b
       LEFT JOIN 캠퍼스 c ON b.캠퍼스_id = c.캠퍼스_id
       ORDER BY b.건물유형, b.이름`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

// 인기 경로 Top 5 (뷰 활용)
router.get('/routes/popular', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 출발건물_id AS from_place_id,
              출발건물명  AS from_name,
              도착건물_id AS to_place_id,
              도착건물명  AS to_name,
              검색횟수    AS search_count
       FROM v_인기경로
       ORDER BY 순위
       LIMIT 5`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

module.exports = router;
