// server.js - 백엔드 서버 메인 파일
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const db = require('./db');
const authRouter    = require('./routes/auth');
const placesRouter  = require('./routes/places');
const shuttleRouter   = require('./routes/shuttle');
const routesRouter    = require('./routes/routes');
const favoritesRouter = require('./routes/favorites');
const kakaoRouter   = require('./routes/kakao');
const ratingsRouter = require('./routes/ratings');
const app = express();

// 미들웨어(middleware) 설정
// 미들웨어 = 요청이 들어올 때 자동으로 실행되는 처리기
app.use(cors());
app.use(express.json());
app.use('/api/auth',    authRouter);
app.use('/api/places',  placesRouter);
app.use('/api/shuttle',   shuttleRouter);
app.use('/api/routes',    routesRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/kakao',   kakaoRouter);
app.use('/api/ratings', ratingsRouter);

// ─── 테스트용 API ─────────────────────────────────────────

// 서버가 살아있는지 확인
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '서버 정상 작동 중' });
});

// DB 연결 확인
app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS 건물수 FROM 건물');
    res.json({ status: 'DB 연결 성공!', data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'DB 연결 실패', error: err.message });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});