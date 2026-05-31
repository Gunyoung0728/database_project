// middleware.js - 로그인 확인 미들웨어
// 미들웨어 = API 호출 전에 자동으로 실행되는 검사기
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers['authorization'];

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: '로그인이 필요해요.' });
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // user_id, student_id, name 담김
    next(); // 다음 단계로 진행
  } catch (err) {
    return res.status(401).json({ message: '토큰이 유효하지 않아요.' });
  }
};