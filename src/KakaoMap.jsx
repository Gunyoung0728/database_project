// KakaoMap.jsx - 카카오 지도 + 실제 경로 표시
import { useEffect, useRef } from "react";

// 백엔드 경유해서 카카오 길찾기 API 호출
async function fetchDirections(ox, oy, dx, dy) {
  const res = await fetch('http://localhost:3001/api/kakao/directions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin_x: ox, origin_y: oy, dest_x: dx, dest_y: dy })
  });
  return res.json();
}

export default function KakaoMap({ fromPlace, toPlace, onRouteResult }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const overlaysRef = useRef([]);
  const polylineRef = useRef(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;
    mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(35.9020, 128.8488),
      level: 4
    });
  }, []);

  // 출발/도착 바뀔 때 경로 그리기
  useEffect(() => {
    if (!mapInstance.current || !window.kakao || !fromPlace || !toPlace) return;

    // 기존 오버레이/선 제거
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const ps = new window.kakao.maps.services.Places();

    const fromQuery = fromPlace.isExternal ? fromPlace.name : `대구대학교 ${fromPlace.name}`;
    const toQuery   = toPlace.isExternal   ? toPlace.name   : `대구대학교 ${toPlace.name}`;

    // 출발지 좌표 검색
    ps.keywordSearch(fromQuery, (fromData, fromStatus) => {
      if (fromStatus !== window.kakao.maps.services.Status.OK || !fromData[0]) return;
      const ox = fromData[0].x;
      const oy = fromData[0].y;

      // 도착지 좌표 검색
      ps.keywordSearch(toQuery, async (toData, toStatus) => {
        if (toStatus !== window.kakao.maps.services.Status.OK || !toData[0]) return;
        const dx = toData[0].x;
        const dy = toData[0].y;

        // 출발/도착 마커 표시
        const addLabel = (y, x, text, color) => {
          const content = `
            <div style="background:${color};color:#fff;padding:5px 10px;
              border-radius:20px;font-size:12px;font-weight:700;
              font-family:'Noto Sans KR',sans-serif;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);white-space:nowrap;">
              ${text}
            </div>`;
          const overlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(y, x),
            content, yAnchor: 2.2,
          });
          overlay.setMap(mapInstance.current);
          overlaysRef.current.push(overlay);

          const marker = new window.kakao.maps.Marker({
            map: mapInstance.current,
            position: new window.kakao.maps.LatLng(y, x),
          });
          overlaysRef.current.push(marker);
        };

        addLabel(oy, ox, `출발: ${fromPlace.name}`, "#1a56db");
        addLabel(dy, dx, `도착: ${toPlace.name}`,   "#059669");

        try {
          // 백엔드 경유 카카오 길찾기 API 호출
          const result = await fetchDirections(ox, oy, dx, dy);

          if (result.path && result.path.length > 0) {
            // 실제 경로 좌표로 선 그리기
            const linePath = result.path.map(p =>
              new window.kakao.maps.LatLng(p.y, p.x)
            );
            polylineRef.current = new window.kakao.maps.Polyline({
              path:           linePath,
              strokeWeight:   5,
              strokeColor:    "#1a56db",
              strokeOpacity:  0.85,
              strokeStyle:    "solid",
            });
            polylineRef.current.setMap(mapInstance.current);

            // 경로 전체가 보이도록 지도 범위 조정
            const bounds = new window.kakao.maps.LatLngBounds();
            linePath.forEach(p => bounds.extend(p));
            mapInstance.current.setBounds(bounds, 60);

            // 거리/시간 결과를 부모 컴포넌트로 전달
            if (onRouteResult) {
              onRouteResult(result);
            }
          } else {
            // 경로 못 찾으면 직선으로 fallback
            const linePath = [
              new window.kakao.maps.LatLng(oy, ox),
              new window.kakao.maps.LatLng(dy, dx),
            ];
            polylineRef.current = new window.kakao.maps.Polyline({
              path: linePath, strokeWeight:4,
              strokeColor:"#94a3b8", strokeOpacity:0.6, strokeStyle:"dashed",
            });
            polylineRef.current.setMap(mapInstance.current);
            const bounds = new window.kakao.maps.LatLngBounds();
            linePath.forEach(p => bounds.extend(p));
            mapInstance.current.setBounds(bounds, 60);
          }
        } catch (err) {
          console.error("경로 API 오류:", err);
        }
      });
    });
  }, [fromPlace, toPlace]);

  return <div ref={mapRef} style={{ width:"100%", height:"100%", borderRadius:14 }}/>;
}