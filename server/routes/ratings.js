const express        = require('express');
const db             = require('../db');
const authMiddleware = require('../middleware');
const router         = express.Router();

// 전체 별점 평균
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 건물_id AS place_id,
              ROUND(AVG(별점), 1) AS avg_rating,
              COUNT(*) AS count
       FROM 건물별점 GROUP BY 건물_id`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

// 내 별점
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT 건물_id AS place_id, 별점 AS rating FROM 건물별점 WHERE 회원_id = ?',
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

// 별점 저장/수정
router.post('/:placeId', authMiddleware, async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: '별점은 1~5 사이여야 해요.' });
  try {
    await db.query(
      `INSERT INTO 건물별점 (회원_id, 건물_id, 별점)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 별점 = ?, 수정일 = NOW()`,
      [req.user.user_id, req.params.placeId, rating, rating]
    );
    res.json({ message: '별점 저장 완료!' });
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

module.exports = router;
