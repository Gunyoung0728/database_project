const express        = require('express');
const db             = require('../db');
const authMiddleware = require('../middleware');
const router         = express.Router();

// 길찾기 로그 저장 (트리거 자동 작동)
router.post('/log', async (req, res) => {
  const { user_id, from_place_id, to_place_id, distance_m, duration_min, travel_mode } = req.body;
  try {
    await db.query(
      `INSERT INTO 길찾기로그
        (회원_id, 출발건물_id, 도착건물_id, 이동거리, 이동시간, 이동수단)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id||null, from_place_id||null, to_place_id||null,
       distance_m||0, duration_min||0, travel_mode||'도보']
    );
    res.status(201).json({ message: '길찾기 로그 저장 완료!' });
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

// 내 길찾기 기록 (로그인 필요)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.로그_id, l.출발건물_id, b1.이름 AS from_name,
              l.도착건물_id, b2.이름 AS to_name,
              l.이동수단, l.검색일시 AS searched_at
       FROM 길찾기로그 l
       LEFT JOIN 건물 b1 ON l.출발건물_id = b1.건물_id
       LEFT JOIN 건물 b2 ON l.도착건물_id = b2.건물_id
       WHERE l.회원_id = ?
       ORDER BY l.검색일시 DESC LIMIT 20`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

// 맞춤 추천 (프로시저 활용)
router.get('/recommend', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_맞춤추천(?)', [req.user.user_id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

module.exports = router;
