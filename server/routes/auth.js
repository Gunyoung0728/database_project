const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');
const router   = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  const { student_id, password, name, major } = req.body;
  if (!student_id || !password || !name || !major)
    return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
  try {
    const [existing] = await db.query(
      'SELECT 회원_id FROM 회원 WHERE 학번 = ?', [student_id]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: '이미 사용 중인 학번이에요.' });
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO 회원 (학번, 비밀번호해시, 이름, 학과) VALUES (?, ?, ?, ?)',
      [student_id, hash, name, major]
    );
    res.status(201).json({ message: '회원가입 성공!' });
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

// 로그인
router.post('/login', async (req, res) => {
  const { student_id, password } = req.body;
  if (!student_id || !password)
    return res.status(400).json({ message: '학번과 비밀번호를 입력해주세요.' });
  try {
    const [rows] = await db.query(
      'SELECT * FROM 회원 WHERE 학번 = ?', [student_id]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: '학번 또는 비밀번호가 틀렸어요.' });
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.비밀번호해시);
    if (!isMatch)
      return res.status(401).json({ message: '학번 또는 비밀번호가 틀렸어요.' });
    const token = jwt.sign(
      { user_id: user.회원_id, student_id: user.학번, name: user.이름 },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      message: '로그인 성공!', token,
      user: { user_id: user.회원_id, student_id: user.학번, name: user.이름, major: user.학과 }
    });
  } catch (err) { res.status(500).json({ message: '서버 오류', error: err.message }); }
});

module.exports = router;
