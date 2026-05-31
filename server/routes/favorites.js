const express        = require('express');
const db             = require('../db');
const authMiddleware = require('../middleware');
const router         = express.Router();

// 즐겨찾기 목록
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.즐겨찾기_id AS favorite_id, f.별칭 AS label,
              f.출발건물_id, b1.이름 AS from_name,
              f.도착건물_id, b2.이름 AS to_name,
              f.생성일 AS created_at
       FROM 즐겨찾기 f
       LEFT JOIN 건물 b1 ON f.출발건물_id = b1.건물_id
       LEFT JOIN 건물 b2 ON f.도착건물_id = b2.건물_id
       WHERE f.회원_id = ?
       ORDER BY f.생성일 DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

// 즐겨찾기 추가
router.post('/', authMiddleware, async (req, res) => {
  const { from_place_id, to_place_id, label } = req.body;
  if (!from_place_id || !to_place_id)
    return res.status(400).json({ message: '출발지와 도착지를 선택해주세요.' });
  try {
    await db.query(
      `INSERT INTO 즐겨찾기 (회원_id, 출발건물_id, 도착건물_id, 별칭)
       VALUES (?, ?, ?, ?)`,
      [req.user.user_id, from_place_id, to_place_id, label||null]
    );
    res.status(201).json({ message: '즐겨찾기 추가 완료!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: '이미 즐겨찾기에 있어요.' });
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 즐겨찾기 삭제
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM 즐겨찾기 WHERE 즐겨찾기_id = ? AND 회원_id = ?',
      [req.params.id, req.user.user_id]
    );
    res.json({ message: '즐겨찾기 삭제 완료!' });
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

module.exports = router;
