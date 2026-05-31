const express = require('express');
const db      = require('../db');
const router  = express.Router();

// 방향별 노선 + 시간표
router.get('/schedules', async (req, res) => {
  const { direction } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT n.노선_id AS route_id, n.노선번호 AS route_number,
              n.노선명 AS route_name, n.노선유형 AS route_type,
              n.방향 AS direction,
              GROUP_CONCAT(
                DISTINCT DATE_FORMAT(s.출발시간,'%H:%i')
                ORDER BY s.출발시간
              ) AS times
       FROM 노선 n
       LEFT JOIN 시간표 s ON n.노선_id = s.노선_id AND s.방향 = ?
       WHERE n.방향 = ?
       GROUP BY n.노선_id
       ORDER BY n.노선유형, n.노선_id`,
      [direction||'등교', direction||'등교']
    );
    const result = rows.map(r => ({
      ...r, times: r.times ? r.times.split(',') : []
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

// 다음 셔틀 조회 (프로시저 활용)
router.get('/next', async (req, res) => {
  const { time, building_id } = req.query;
  if (!time || !building_id)
    return res.status(400).json({ message: '시간과 건물 ID가 필요해요.' });
  try {
    const [rows] = await db.query(
      'CALL sp_다음셔틀조회(?, ?)', [time, building_id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

module.exports = router;
