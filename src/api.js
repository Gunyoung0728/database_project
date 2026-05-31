// api.js - 백엔드 API 호출 모음
import axios from 'axios';

// 백엔드 주소 기본 설정
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// 요청할 때마다 토큰 자동으로 붙여주기
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── 인증 ───────────────────────────────────────────────
export const register = (data) =>
  api.post('/api/auth/register', data);

export const login = (data) =>
  api.post('/api/auth/login', data);

// ─── 장소 ───────────────────────────────────────────────
export const getPlaces = () =>
  api.get('/api/places');

export const getPopularRoutes = () =>
  api.get('/api/places/routes/popular');

// ─── 셔틀버스 ────────────────────────────────────────────
export const getShuttleSchedules = (direction) =>
  api.get(`/api/shuttle/schedules?direction=${direction}`);

// ─── 길찾기 로그 ─────────────────────────────────────────
export const saveRouteLog = (data) =>
  api.post('/api/routes/log', data);

export const getMyRoutes = () =>
  api.get('/api/routes/my');

export const getRecommendedRoutes = () =>
  api.get('/api/routes/recommend');

// ─── 즐겨찾기 ────────────────────────────────────────────
export const getFavorites = () =>
  api.get('/api/favorites');

export const addFavorite = (data) =>
  api.post('/api/favorites', data);

export const deleteFavorite = (id) =>
  api.delete(`/api/favorites/${id}`);

// ─── 카카오 길찾기 ───────────────────────────────────────
export const getDirections = (origin_x, origin_y, dest_x, dest_y) =>
  api.post('/api/kakao/directions', { origin_x, origin_y, dest_x, dest_y });

export const getShuttleRecommend = (dest_lat, dest_lng, dest_name, dest_addr, direction) =>
  api.get(`/api/kakao/shuttle-recommend?dest_lat=${dest_lat}&dest_lng=${dest_lng}&dest_name=${encodeURIComponent(dest_name||'')}&dest_addr=${encodeURIComponent(dest_addr||'')}&direction=${direction||'하교'}`);