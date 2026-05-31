// db.js - MySQL 연결 설정 파일
const mysql = require('mysql2');
require('dotenv').config();

// 연결 풀(pool) 생성 - 여러 요청을 효율적으로 처리하는 연결 묶음
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Promise 방식으로 사용할 수 있게 변환
const promisePool = pool.promise();

module.exports = promisePool;