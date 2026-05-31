// KakaoMap.jsx - 카카오 지도 + 실제 경로 표시
import { useEffect, useRef } from "react";

async function fetchDirections(ox, oy, dx, dy) {
  const res = await fetch('https://databaseproject-production-d034.up.railway.app/api/kakao/directions', {
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
      center: new window.kakao.maps.LatLng(35.8873, 128.7505),
      level: 3
    });
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !window.kakao || !fromPlace || !toPlace) return;

    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const ps = new window.kakao.maps.services.Places();

    // 외부 장소는 카카오 검색 좌표, 학교 건물은 이름으로 검색
    const getCoords = (place, callback) => {
      if (place.isExternal && place.lat && place.lng) {
        callback(place.lng, place.lat);
      } else {
        const query = place.isExternal ? place.name : `대구대학교 ${place.name}`;
        ps.keywordSearch(query, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK && data[0]) {
            callback(data[0].x, data[0].y);
          }
        });
      }
    };

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

    getCoords(fromPlace, (ox, oy) => {
      getCoords(toPlace, async (dx, dy) => {

        addLabel(oy, ox, `출발: ${fromPlace.name}`, "#1a56db");
        addLabel(dy, dx, `도착: ${toPlace.name}`,   "#059669");

        try {
          const result = await fetchDirections(ox, oy, dx, dy);

          if (result.path && result.path.length > 0) {
            const linePath = result.path.map(p =>
              new window.kakao.maps.LatLng(p.y, p.x)
            );
            polylineRef.current = new window.kakao.maps.Polyline({
              path: linePath, strokeWeight: 5,
              strokeColor: "#1a56db", strokeOpacity: 0.85, strokeStyle: "solid",
            });
            polylineRef.current.setMap(mapInstance.current);

            const bounds = new window.kakao.maps.LatLngBounds();
            linePath.forEach(p => bounds.extend(p));
            mapInstance.current.setBounds(bounds, 60);

            if (onRouteResult) onRouteResult(result);
          } else {
            const linePath = [
              new window.kakao.maps.LatLng(oy, ox),
              new window.kakao.maps.LatLng(dy, dx),
            ];
            polylineRef.current = new window.kakao.maps.Polyline({
              path: linePath, strokeWeight: 4,
              strokeColor: "#94a3b8", strokeOpacity: 0.6, strokeStyle: "dashed",
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
