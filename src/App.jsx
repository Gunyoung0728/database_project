import { useState, useEffect } from "react";
import KakaoMap from "./KakaoMap.jsx";
import { TYPE_LABEL, TYPE_COLOR } from "./data/constants.js";
import {
  getPlaces, getShuttleSchedules, getPopularRoutes,
  getFavorites, addFavorite, deleteFavorite,
  saveRouteLog, getMyRoutes, getShuttleRecommend,
  login, register
} from "./api.js";

const getRatings   = () => fetch('https://databaseproject-production-d034.up.railway.app/api/ratings').then(r=>r.json());
const saveRating   = (placeId, rating) => fetch(`https://databaseproject-production-d034.up.railway.app/api/ratings/${placeId}`, {
  method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}`},
  body: JSON.stringify({ rating })
});

const C = {
  p:"#1a56db", pd:"#0f2d6b", bg:"#f0f4ff", card:"#fff",
  bd:"#e2e8f0", tx:"#0f172a", sub:"#64748b",
  g:"#059669", o:"#d97706", r:"#dc2626",
};
const sh  = "0 2px 16px rgba(0,0,0,0.08)";
const inp = {
  border:`1px solid ${C.bd}`, borderRadius:10, padding:"11px 14px",
  fontSize:14, outline:"none", width:"100%", fontFamily:"inherit", background:"#fff",
};

/* ─── 별점 컴포넌트 ──────────────────────────────────────── */
function Stars({ value=0, onRate=null, size=18 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i=>(
        <span key={i}
          onClick={()=>onRate&&onRate(i)}
          onMouseEnter={()=>onRate&&setHover(i)}
          onMouseLeave={()=>onRate&&setHover(0)}
          style={{ fontSize:size, cursor:onRate?"pointer":"default",
            color: i<=(hover||value) ? "#f59e0b" : "#d1d5db",
            transition:"color 0.1s" }}>★</span>
      ))}
    </div>
  );
}

/* ─── 장소 선택 모달 ─────────────────────────────────────── */
function PlaceModal({ open, onClose, onSelect, title, places }) {
  const [tab, setTab]     = useState("school");
  const [q, setQ]         = useState("");
  const [results, setResults] = useState([]);
  if (!open) return null;
  const search = () => {
    if (!q.trim() || !window.kakao?.maps?.services) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(q, (data, status) => {
      setResults(status === window.kakao.maps.services.Status.OK ? data : []);
    });
  };
  const pick = (place) => { onSelect(place); setQ(""); setResults([]); };
  const groups = {};
  (places||[]).forEach(p => { if (!groups[p.place_type]) groups[p.place_type]=[]; groups[p.place_type].push(p); });
  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:"24px 24px 0 0", width:"100%", maxHeight:"82vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"12px 16px 0", borderBottom:`1px solid ${C.bd}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontWeight:700, fontSize:15, color:C.tx }}>{title}</span>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:C.sub }}>✕</button>
          </div>
          <div style={{ display:"flex" }}>
            {[["school","🏫 학교 건물"],["external","🔍 외부 장소"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"9px 0", fontWeight:tab===t?700:500, fontFamily:"inherit", color:tab===t?C.p:C.sub, fontSize:13, borderBottom:tab===t?`2px solid ${C.p}`:"2px solid transparent", marginBottom:-1 }}>{l}</button>
            ))}
          </div>
        </div>
        {tab==="school" && (
          <div style={{ overflowY:"auto", padding:"12px" }}>
            {Object.entries(groups).map(([type, placeList])=>(
              <div key={type} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.sub, marginBottom:7, textTransform:"uppercase", letterSpacing:"0.06em" }}>{TYPE_LABEL[type]||type}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7 }}>
                  {placeList.map(p=>{ const tc=TYPE_COLOR[p.place_type]||{bg:"#f1f5f9",cl:"#475569"}; return (
                    <button key={p.place_id} onClick={()=>pick({id:p.place_id, name:p.name, type:p.place_type, isExternal:false})} style={{ background:tc.bg, border:`1px solid ${tc.cl}30`, borderRadius:11, padding:"9px 7px", cursor:"pointer", textAlign:"center", fontFamily:"inherit" }}>
                      <div style={{ fontSize:12, fontWeight:600, color:tc.cl }}>{p.name}</div>
                      <div style={{ fontSize:10, color:C.sub, marginTop:2 }}>{p.campus_name}</div>
                    </button>
                  );})}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==="external" && (
          <div style={{ padding:14, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ background:"#eff6ff", borderRadius:10, padding:"9px 13px", fontSize:12, color:C.p }}>💡 외부 장소 선택 시 셔틀버스 추천도 함께 표시돼요</div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="장소명 검색 (예: 이마트, 동대구역, 대실초등학교...)" style={{ ...inp, flex:1 }}/>
              <button onClick={search} style={{ background:C.p, color:"#fff", border:"none", borderRadius:10, padding:"11px 14px", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"inherit" }}>검색</button>
            </div>
            {results.length>0 && (
              <div style={{ border:`1px solid ${C.bd}`, borderRadius:12, overflow:"hidden", maxHeight:300, overflowY:"auto" }}>
                {results.map(r=>(
                  <div key={r.id} onClick={()=>pick({ id:r.id, name:r.place_name, addr:r.road_address_name||r.address_name, cat:r.category_name, lat:r.y, lng:r.x, isExternal:true })}
                    style={{ padding:"11px 14px", cursor:"pointer", borderBottom:`1px solid #f1f5f9`, background:"#fff" }}
                    onMouseOver={e=>e.currentTarget.style.background="#f8fafc"} onMouseOut={e=>e.currentTarget.style.background="#fff"}>
                    <div style={{ fontWeight:600, fontSize:13, color:C.tx }}>{r.place_name}</div>
                    <div style={{ color:C.sub, fontSize:11, marginTop:2 }}>{r.road_address_name||r.address_name} · {r.category_name}</div>
                  </div>
                ))}
              </div>
            )}
            {q&&results.length===0&&<div style={{ textAlign:"center", color:C.sub, fontSize:13, padding:"20px 0" }}>검색 결과 없음</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 장소 버튼 ──────────────────────────────────────────── */
function PlaceBtn({ place, onClick, placeholder }) {
  return (
    <button onClick={onClick} style={{ background:place?(place.isExternal?"#f0fdf4":"#eff6ff"):"#f8fafc", border:`1.5px solid ${place?(place.isExternal?C.g:C.p):C.bd}`, borderRadius:12, padding:"11px 14px", cursor:"pointer", textAlign:"left", width:"100%", fontFamily:"inherit", transition:"all 0.15s", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        {place ? (
          <><div style={{ fontWeight:700, fontSize:14, color:place.isExternal?C.g:C.p }}>{place.name}</div><div style={{ fontSize:11, color:C.sub, marginTop:2 }}>{place.isExternal?place.addr:"학교 건물"}</div></>
        ) : <span style={{ color:"#94a3b8", fontSize:13 }}>{placeholder}</span>}
      </div>
      <span style={{ color:C.sub, fontSize:11, flexShrink:0, marginLeft:8 }}>변경 ›</span>
    </button>
  );
}

/* ─── 네비게이션 ─────────────────────────────────────────── */
function Navbar({ page, setPage, loggedIn, setLoggedIn, user }) {
  const ni=(label,key)=>(
    <button onClick={()=>setPage(key)} style={{ background:"none", border:"none", cursor:"pointer", color:page===key?"#93c5fd":"#94a3b8", fontWeight:page===key?700:500, fontSize:13, padding:"6px 10px", fontFamily:"inherit", borderBottom:page===key?"2px solid #93c5fd":"2px solid transparent" }}>{label}</button>
  );
  return (
    <nav style={{ background:C.pd, color:"#fff", padding:"0 20px", display:"flex", alignItems:"center", gap:4, boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
      <div onClick={()=>setPage("main")} style={{ cursor:"pointer", fontWeight:800, fontSize:16, color:"#fff", marginRight:14, padding:"11px 0", letterSpacing:"-0.02em" }}>🗺 대구대 길찾기</div>
      <div style={{ display:"flex", gap:0, flex:1 }}>
        {ni("메인","main")} {ni("장소","places")} {ni("셔틀버스","shuttle")}
        {loggedIn&&ni("마이페이지","mypage")}
      </div>
      {loggedIn?(
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#bfdbfe", fontSize:12 }}>👋 {user}님</span>
          <button onClick={()=>{setLoggedIn(false);setPage("main");localStorage.removeItem('token');}} style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"none", borderRadius:99, padding:"5px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>로그아웃</button>
        </div>
      ):(
        <button onClick={()=>setPage("login")} style={{ background:"#fff", color:C.pd, border:"none", borderRadius:99, padding:"6px 14px", cursor:"pointer", fontWeight:700, fontSize:12, fontFamily:"inherit" }}>로그인</button>
      )}
    </nav>
  );
}

/* ─── 로그인 ─────────────────────────────────────────────── */
function LoginPage({ setPage, setLoggedIn, setUser, setUserId }) {
  const [tab,setTab]=useState("login");
  const [sid,setSid]=useState(""); const [pw,setPw]=useState("");
  const [nm,setNm]=useState("");   const [mj,setMj]=useState("");
  const [err,setErr]=useState("");
  const doLogin = async () => {
    if (!sid||!pw) { setErr("학번과 비밀번호를 입력해주세요."); return; }
    try {
      const res = await login({ student_id: sid, password: pw });
      localStorage.setItem('token', res.data.token);
      setLoggedIn(true); setUser(res.data.user.name);
      setUserId(res.data.user.user_id); setPage("main");
    } catch (e) { setErr(e.response?.data?.message || "로그인 실패"); }
  };
  const doSign = async () => {
    if (!sid||!pw||!nm||!mj) { setErr("모든 항목을 입력해주세요."); return; }
    try {
      await register({ student_id: sid, password: pw, name: nm, major: mj });
      const res = await login({ student_id: sid, password: pw });
      localStorage.setItem('token', res.data.token);
      setLoggedIn(true); setUser(res.data.user.name);
      setUserId(res.data.user.user_id); setPage("main");
    } catch (e) { setErr(e.response?.data?.message || "회원가입 실패"); }
  };
  return (
    <div style={{ minHeight:"calc(100vh - 46px)", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:C.card, borderRadius:20, padding:"28px 28px", width:380, boxShadow:sh }}>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ fontSize:34, marginBottom:6 }}>🗺</div>
          <div style={{ fontSize:20, fontWeight:800, color:C.tx, letterSpacing:"-0.03em" }}>대구대 길찾기</div>
          <div style={{ color:C.sub, fontSize:13, marginTop:3 }}>캠퍼스 내비게이션 서비스</div>
        </div>
        <div style={{ display:"flex", marginBottom:20, borderBottom:`1px solid ${C.bd}` }}>
          {["login","signup"].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setErr("");}} style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"9px 0", fontWeight:tab===t?700:500, color:tab===t?C.p:C.sub, fontFamily:"inherit", fontSize:13, borderBottom:tab===t?`2px solid ${C.p}`:"2px solid transparent", marginBottom:-1 }}>{t==="login"?"로그인":"회원가입"}</button>
          ))}
        </div>
        {err&&<div style={{ background:"#fef2f2", color:C.r, padding:"9px 13px", borderRadius:10, fontSize:13, marginBottom:12 }}>{err}</div>}
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {tab==="signup"&&<><input placeholder="이름" value={nm} onChange={e=>setNm(e.target.value)} style={inp}/><input placeholder="학과" value={mj} onChange={e=>setMj(e.target.value)} style={inp}/></>}
          <input placeholder="학번 (예: 2024001001)" value={sid} onChange={e=>setSid(e.target.value)} style={inp}/>
          <input type="password" placeholder="비밀번호" value={pw} onChange={e=>setPw(e.target.value)} style={inp} onKeyDown={e=>e.key==="Enter"&&(tab==="login"?doLogin():doSign())}/>
          <button onClick={tab==="login"?doLogin:doSign} style={{ background:C.p, color:"#fff", border:"none", borderRadius:12, padding:"12px", fontWeight:700, fontSize:14, cursor:"pointer", marginTop:3, fontFamily:"inherit" }}>{tab==="login"?"로그인":"회원가입"}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── 메인 페이지 ────────────────────────────────────────── */
function MainPage({ loggedIn, setPage, from, setFrom, to, setTo, modal, setModal, popularRoutes, setPopularRoutes, routeResult, setRouteResult, userId, shuttleRoutes }) {
  const [res, setRes]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [favSaved, setFavSaved] = useState(false);

  const swap = () => { const t=from; setFrom(to); setTo(t); setRes(null); setRouteResult(null); };

  const go = async () => {
    if (!from||!to) return;
    setLoading(true); setFavSaved(false);
    const isExt = from.isExternal||to.isExternal;
        let showShuttle = false;
        let shuttleInfo = null;
        if (isExt) {
          try {
            // 출발이 외부 → 등교, 도착이 외부 → 하교
            const direction = from.isExternal ? '등교' : '하교';
            const extPlace  = from.isExternal ? from : to;
            const lat  = extPlace.lat;
            const lng  = extPlace.lng;
            const name = extPlace.name || '';
            if (lat && lng) {
              const sr = await getShuttleRecommend(lat, lng, name, extPlace.addr||'', direction);
              if (sr.data.shuttle) { showShuttle = true; shuttleInfo = sr.data; }
            } else {
              // 좌표 없어도 이름으로만 추천 시도
              const sr = await getShuttleRecommend(0, 0, name);
              if (sr.data.shuttle) { showShuttle = true; shuttleInfo = sr.data; }
            }
          } catch(e) { console.error('셔틀 추천 오류', e); }
        }
        setRes({ fromName:from.name, toName:to.name, isExt, showShuttle, shuttleInfo, nextBus:"17:15" });
    setLoading(false);
    // 길찾기 로그 저장 → 트리거 자동 작동 → 인기 경로 업데이트
    try {
      await saveRouteLog({
        user_id:       userId || null,
        from_place_id: !from.isExternal ? from.id : null,
        to_place_id:   !to.isExternal   ? to.id   : null,
        travel_mode:   '도보'
      });
      // 인기 경로 새로고침
      getPopularRoutes().then(r=>setPopularRoutes(r.data)).catch(console.error);
    } catch(e) { console.error('로그 저장 실패', e); }
  };

  const saveFav = async () => {
    if (!loggedIn) { setPage("login"); return; }
    if (!from||!to||from.isExternal||to.isExternal) return;
    try {
      await addFavorite({ from_place_id: from.id, to_place_id: to.id, label: `${from.name} → ${to.name}` });
      setFavSaved(true);
    } catch(e) {
      if (e.response?.status === 409) setFavSaved(true);
    }
  };

  // 셔틀 추천 정보
  const relevantShuttle = shuttleRoutes?.find(r => res?.isExt ? r.direction==="하교" : r.direction==="등교");
  const shuttleMin = routeResult ? Math.round(routeResult.car_duration_min * 1.3 + 15) : null;

  return (
    <div style={{ background:C.bg, padding:"12px 14px", height:"calc(100vh - 46px)", display:"flex", flexDirection:"column" }}>
      <div style={{ maxWidth:1400, margin:"0 auto", flex:1, display:"flex", flexDirection:"column", width:"100%" }}>
        <div style={{ marginBottom:10 }}>
          <h1 style={{ fontSize:18, fontWeight:800, color:C.tx, letterSpacing:"-0.03em" }}>캠퍼스 길찾기</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>학교 건물 또는 외부 장소를 선택해 경로를 찾아보세요</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:12, flex:1 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:10, height:"100%" }}>
            <div style={{ background:C.card, borderRadius:14, padding:14, boxShadow:sh }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.sub, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>출발지</div>
              <PlaceBtn place={from} onClick={()=>{setRes(null);setRouteResult(null);setModal({open:true,target:"from"});}} placeholder="출발 장소를 선택하세요"/>
              <div style={{ display:"flex", alignItems:"center", gap:8, margin:"8px 0" }}>
                <div style={{ flex:1, height:1, background:C.bd }}/>
                <button onClick={swap} style={{ background:"#f1f5f9", border:`1px solid ${C.bd}`, borderRadius:99, width:28, height:28, cursor:"pointer", fontSize:13, flexShrink:0, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center" }}>⇅</button>
                <div style={{ flex:1, height:1, background:C.bd }}/>
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:C.sub, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>도착지</div>
              <PlaceBtn place={to} onClick={()=>{setRes(null);setRouteResult(null);setModal({open:true,target:"to"});}} placeholder="도착 장소를 선택하세요"/>
              {(from?.isExternal||to?.isExternal)&&(
                <div style={{ marginTop:8, background:"#f0fdf4", border:"1px solid #86efac", borderRadius:9, padding:"7px 11px", fontSize:11, color:C.g }}>🚌 외부 장소 포함 경로 — 셔틀버스 추천이 함께 표시됩니다</div>
              )}
              <button onClick={go} disabled={!from||!to||loading} style={{ background:(!from||!to)?"#cbd5e1":C.p, color:"#fff", border:"none", borderRadius:11, padding:"12px", fontWeight:700, fontSize:14, cursor:(!from||!to)?"not-allowed":"pointer", width:"100%", marginTop:10, fontFamily:"inherit" }}>
                {loading?"검색 중...":"🔍 길찾기"}
              </button>
              {loggedIn && from && to && !from.isExternal && !to.isExternal && (
                <button onClick={saveFav} style={{ background:favSaved?"#f0fdf4":"#fff", color:favSaved?C.g:C.sub, border:`1.5px solid ${favSaved?"#86efac":C.bd}`, borderRadius:11, padding:"10px", fontWeight:600, fontSize:13, cursor:"pointer", width:"100%", marginTop:8, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <span style={{ fontSize:16 }}>{favSaved?"⭐":"☆"}</span>
                  {favSaved ? "즐겨찾기에 저장됨" : "즐겨찾기에 저장"}
                </button>
              )}
              {loggedIn && from && to && (from.isExternal || to.isExternal) && (
                <div style={{ marginTop:8, background:"#f8fafc", border:`1px solid ${C.bd}`, borderRadius:11, padding:"9px 12px", fontSize:12, color:C.sub, textAlign:"center" }}>
                  외부 장소는 즐겨찾기 저장이 지원되지 않아요
                </div>
              )}
              {!loggedIn && from && to && (
                <button onClick={()=>setPage("login")} style={{ background:"#fff", color:C.sub, border:`1.5px solid ${C.bd}`, borderRadius:11, padding:"10px", fontWeight:600, fontSize:13, cursor:"pointer", width:"100%", marginTop:8, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <span style={{ fontSize:16 }}>☆</span>
                  로그인하면 즐겨찾기 저장 가능
                </button>
              )}
            </div>

            {res&&(
              <div style={{ background:C.card, borderRadius:14, padding:14, boxShadow:sh }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                    <span style={{ background:"#eff6ff", color:C.p, padding:"2px 9px", borderRadius:99, fontSize:11, fontWeight:600 }}>{res.fromName}</span>
                    <span style={{ color:C.sub, fontSize:12 }}>→</span>
                    <span style={{ background:res.isExt?"#f0fdf4":"#eff6ff", color:res.isExt?C.g:C.p, padding:"2px 9px", borderRadius:99, fontSize:11, fontWeight:600 }}>{res.toName}</span>
                  </div>
                  {loggedIn&&!res.isExt&&(
                    <button onClick={saveFav} style={{ background:favSaved?"#f0fdf4":"#fff", color:favSaved?C.g:C.sub, border:`1px solid ${favSaved?"#86efac":C.bd}`, borderRadius:99, padding:"3px 10px", cursor:"pointer", fontSize:11, fontFamily:"inherit", flexShrink:0 }}>
                      {favSaved?"⭐ 저장됨":"☆ 즐겨찾기"}
                    </button>
                  )}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ background:"#f8fafc", borderRadius:11, padding:"11px 14px", border:`2px solid ${C.p}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}><span style={{ fontSize:20 }}>🚶</span><div><div style={{ fontWeight:700, color:C.tx, fontSize:13 }}>도보</div><div style={{ color:C.sub, fontSize:11 }}>{routeResult?(routeResult.distance_m>=1000?(routeResult.distance_m/1000).toFixed(1)+"km":routeResult.distance_m+"m"):"계산 중..."}</div></div></div>
                      <div style={{ textAlign:"right" }}><div style={{ fontSize:18, fontWeight:800, color:C.tx }}>{routeResult?`${routeResult.walk_duration_min}분`:"..."}</div><span style={{ background:"#eff6ff", color:C.p, padding:"1px 7px", borderRadius:99, fontSize:10, fontWeight:700 }}>도보</span></div>
                    </div>
                  </div>
                  <div style={{ background:"#f8fafc", borderRadius:11, padding:"11px 14px", border:`1px solid ${C.bd}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}><span style={{ fontSize:20 }}>🚗</span><div><div style={{ fontWeight:700, color:C.tx, fontSize:13 }}>자동차</div><div style={{ color:C.sub, fontSize:11 }}>{routeResult?(routeResult.distance_m>=1000?(routeResult.distance_m/1000).toFixed(1)+"km":routeResult.distance_m+"m"):"계산 중..."}</div></div></div>
                      <div style={{ textAlign:"right" }}><div style={{ fontSize:18, fontWeight:800, color:C.sub }}>{routeResult?`${routeResult.car_duration_min}분`:"..."}</div><span style={{ background:"#f1f5f9", color:C.sub, padding:"1px 7px", borderRadius:99, fontSize:10, fontWeight:700 }}>자동차</span></div>
                    </div>
                  </div>
                  {res.showShuttle&&(
                    <div style={{ background:"#f0fdf4", borderRadius:11, padding:"11px 14px", border:`2px solid ${C.g}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <span style={{ fontSize:20 }}>🚌</span>
                          <div>
                            <div style={{ fontWeight:700, color:C.tx, fontSize:13 }}>셔틀버스 + 도보</div>
                            <div style={{ color:C.sub, fontSize:11 }}>
                              {res.shuttleInfo?.shuttle?.노선명 || "셔틀 정보"}
                              {res.shuttleInfo?.reason && ` · ${res.shuttleInfo.reason.split('(')[0]}`}
                            </div>
                          </div>
                        </div>
                        <span style={{ background:"#dcfce7", color:C.g, padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:700 }}>✓ 셔틀 추천</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ background:C.card, borderRadius:14, padding:14, boxShadow:sh, flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:C.tx }}>🔥 인기 경로 Top 5</div>
              {(popularRoutes||[]).length===0 ? (
                <div style={{ color:C.sub, fontSize:12, textAlign:"center", padding:"20px 0" }}>아직 길찾기 기록이 없어요</div>
              ) : (popularRoutes||[]).map((r,i)=>(
                <div key={i} onClick={()=>{ setFrom({id:r.from_place_id, name:r.from_name, isExternal:false}); setTo({id:r.to_place_id, name:r.to_name, isExternal:false}); setRes(null); setRouteResult(null); }}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 0", borderBottom:`1px solid ${C.bd}`, cursor:"pointer" }}>
                  <span style={{ width:18, height:18, background:i<3?C.p:"#e2e8f0", color:i<3?"#fff":C.sub, borderRadius:99, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, flexShrink:0 }}>{i+1}</span>
                  <div style={{ flex:1, fontSize:12, color:C.tx }}>{r.from_name}<span style={{ color:C.sub, margin:"0 3px" }}>→</span>{r.to_name}</div>
                  <span style={{ color:C.sub, fontSize:11 }}>{r.search_count}회</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column" }}>
            <div style={{ borderRadius:14, flex:1, overflow:"hidden", position:"relative", minHeight:440 }}>
              <KakaoMap fromPlace={from} toPlace={to} onRouteResult={(r)=>setRouteResult(r)}/>
              {res&&(
                <div style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", background:"rgba(255,255,255,0.96)", borderRadius:13, padding:"12px 20px", textAlign:"center", boxShadow:sh, minWidth:210 }}>
                  <div style={{ fontSize:10, color:C.sub, fontWeight:600, marginBottom:3 }}>경로 정보</div>
                  <div style={{ fontWeight:700, color:C.tx, fontSize:13 }}>{res.fromName} → {res.toName}</div>
                  <div style={{ display:"flex", gap:14, justifyContent:"center", marginTop:8 }}>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.sub }}>거리</div><div style={{ fontWeight:700, color:C.p, fontSize:13 }}>{routeResult?(routeResult.distance_m>=1000?(routeResult.distance_m/1000).toFixed(1)+"km":routeResult.distance_m+"m"):"..."}</div></div>
                    <div style={{ width:1, background:C.bd }}/>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.sub }}>도보</div><div style={{ fontWeight:700, color:C.tx, fontSize:13 }}>{routeResult?`${routeResult.walk_duration_min}분`:"..."}</div></div>
                    <div style={{ width:1, background:C.bd }}/>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.sub }}>자동차</div><div style={{ fontWeight:700, color:C.sub, fontSize:13 }}>{routeResult?`${routeResult.car_duration_min}분`:"..."}</div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 장소 별점 페이지 ───────────────────────────────────── */
function PlacesPage({ loggedIn, setPage, places }) {
  const [ratings, setRatings]   = useState({});
  const [myRatings, setMyRatings] = useState({});
  const [filter, setFilter]     = useState("ALL");
  const [saved, setSaved]       = useState({});

  useEffect(()=>{
    getRatings().then(data=>{
      const map = {};
      data.forEach(r=>{ map[r.place_id]={ avg: r.avg_rating, count: r.count }; });
      setRatings(map);
    }).catch(console.error);
    if (loggedIn) {
      fetch('https://databaseproject-production-d034.up.railway.app/api/ratings/my', { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} })
        .then(r=>r.json()).then(data=>{
          const map = {};
          data.forEach(r=>{ map[r.place_id]=r.rating; });
          setMyRatings(map);
        }).catch(console.error);
    }
  },[loggedIn]);

  const handleRate = async (placeId, stars) => {
    if (!loggedIn) { setPage("login"); return; }
    try {
      await saveRating(placeId, stars);
      setMyRatings(prev=>({...prev,[placeId]:stars}));
      setSaved(prev=>({...prev,[placeId]:true}));
      setTimeout(()=>setSaved(prev=>({...prev,[placeId]:false})),1500);
      // 평균 새로고침
      getRatings().then(data=>{
        const map={};
        data.forEach(r=>{map[r.place_id]={avg:r.avg_rating,count:r.count};});
        setRatings(map);
      });
    } catch(e) { console.error(e); }
  };

  const types = ["ALL", ...Object.keys(TYPE_LABEL)];
  const filtered = filter==="ALL" ? places : places.filter(p=>p.place_type===filter);

  return (
    <div style={{ background:C.bg, padding:"12px 20px", minHeight:"calc(100vh - 46px)" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ marginBottom:14 }}>
          <h1 style={{ fontSize:18, fontWeight:800, color:C.tx, letterSpacing:"-0.03em" }}>캠퍼스 장소</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>대구대 건물과 시설에 별점을 남겨보세요</p>
        </div>
        {!loggedIn&&(
          <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:"10px 16px", fontSize:13, color:C.o, marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>🔒 로그인하면 별점을 남길 수 있어요</span>
            <button onClick={()=>setPage("login")} style={{ background:C.o, color:"#fff", border:"none", borderRadius:99, padding:"4px 12px", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>로그인</button>
          </div>
        )}
        <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
          {types.map(t=>(
            <button key={t} onClick={()=>setFilter(t)} style={{ padding:"5px 13px", borderRadius:99, border:"none", cursor:"pointer", background:filter===t?C.p:"#fff", color:filter===t?"#fff":C.sub, fontWeight:filter===t?700:500, fontSize:12, fontFamily:"inherit", boxShadow:filter===t?"none":sh }}>
              {t==="ALL"?"전체":TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
          {filtered.map(p=>{
            const tc   = TYPE_COLOR[p.place_type]||{bg:"#f1f5f9",cl:"#475569"};
            const info = ratings[p.place_id];
            const mine = myRatings[p.place_id]||0;
            return (
              <div key={p.place_id} style={{ background:C.card, borderRadius:14, padding:14, boxShadow:sh }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <span style={{ background:tc.bg, color:tc.cl, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99 }}>{TYPE_LABEL[p.place_type]}</span>
                  {info&&<span style={{ fontSize:12, color:"#f59e0b", fontWeight:700 }}>★ {info.avg} ({info.count})</span>}
                </div>
                <div style={{ fontWeight:700, fontSize:14, color:C.tx, marginBottom:2 }}>{p.name}</div>
                <div style={{ fontSize:11, color:C.sub, marginBottom:10 }}>{p.campus_name}</div>
                <div style={{ borderTop:`1px solid ${C.bd}`, paddingTop:10 }}>
                  <div style={{ fontSize:11, color:C.sub, marginBottom:5 }}>
                    {mine>0 ? `내 별점: ${mine}점` : "별점을 남겨보세요"}
                  </div>
                  <Stars value={mine} onRate={(s)=>handleRate(p.place_id, s)} size={20}/>
                  {saved[p.place_id]&&<div style={{ fontSize:11, color:C.g, marginTop:4 }}>✓ 저장됨</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── 셔틀버스 ───────────────────────────────────────────── */
function ShuttlePage({ shuttleRoutes }) {
  const [dir,setDir]=useState("등교");
  const [allRoutes,setAllRoutes]=useState(shuttleRoutes||[]);
  useEffect(()=>{
    getShuttleSchedules(dir).then(r=>setAllRoutes(r.data)).catch(console.error);
  },[dir]);
  return (
    <div style={{ background:C.bg, padding:"10px 20px", minHeight:"calc(100vh - 46px)" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ fontSize:18, fontWeight:800, color:C.tx, marginBottom:3, letterSpacing:"-0.03em" }}>셔틀버스 시간표</h1>
        <p style={{ color:C.sub, fontSize:12, marginBottom:14 }}>2026-1학기 기준 시간표</p>
        <div style={{ display:"flex", gap:7, marginBottom:16 }}>
          {["등교","하교"].map(d=>(
            <button key={d} onClick={()=>setDir(d)} style={{ padding:"7px 18px", borderRadius:99, border:"none", cursor:"pointer", background:dir===d?C.p:"#fff", color:dir===d?"#fff":C.sub, fontWeight:dir===d?700:500, fontSize:12, boxShadow:dir===d?"none":sh, fontFamily:"inherit" }}>{d==="등교"?"🏫 등교":"🏠 하교"}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
          {allRoutes.map(r=>(
            <div key={r.route_id} style={{ background:C.card, borderRadius:14, padding:16, boxShadow:sh }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.tx }}>{r.route_name}</div>
                {/^\d/.test(r.route_number) && (
                  <span style={{ background:"#eff6ff", color:C.p, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>{r.route_number}번</span>
                )}
              </div>
              <div style={{ color:C.sub, fontSize:11, marginBottom:12 }}>{r.route_type} 노선</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {(r.times||[]).map(t=><span key={t} style={{ background:C.bg, border:`1px solid ${C.bd}`, borderRadius:7, padding:"3px 10px", fontSize:12, fontWeight:600, color:C.tx }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 마이페이지 ─────────────────────────────────────────── */
function MyPage({ popularRoutes, loggedIn, setPage, setFrom, setTo }) {
  const [tab,setTab]         = useState("fav");
  const [favorites,setFavs]  = useState([]);
  const [recentLogs,setLogs] = useState([]);

  useEffect(()=>{
    if (!loggedIn) return;
    getFavorites().then(r=>setFavs(r.data)).catch(console.error);
    getMyRoutes().then(r=>setLogs(r.data)).catch(console.error);
  },[loggedIn]);

  const removeFav = async (id) => {
    try {
      await deleteFavorite(id);
      setFavs(prev=>prev.filter(f=>f.favorite_id!==id));
    } catch(e) {}
  };

  return (
    <div style={{ background:C.bg, padding:"10px 20px", minHeight:"calc(100vh - 46px)" }}>
      <div style={{ maxWidth:820, margin:"0 auto" }}>
        <div style={{ marginBottom:14 }}>
          <h1 style={{ fontSize:18, fontWeight:800, color:C.tx, margin:0, letterSpacing:"-0.03em" }}>마이페이지</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>내 길찾기 기록과 추천을 확인하세요</p>
        </div>
        <div style={{ display:"flex", marginBottom:14, borderBottom:`2px solid ${C.bd}` }}>
          {[["fav","⭐ 즐겨찾기"],["log","🕐 최근 검색"],["rec","🔥 추천 경로"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ background:"none", border:"none", cursor:"pointer", padding:"9px 16px", fontWeight:tab===k?700:500, color:tab===k?C.p:C.sub, fontFamily:"inherit", fontSize:13, borderBottom:tab===k?`2px solid ${C.p}`:"2px solid transparent", marginBottom:-2 }}>{l}</button>
          ))}
        </div>

        {tab==="fav"&&(
          favorites.length===0 ? (
            <div style={{ textAlign:"center", color:C.sub, fontSize:14, padding:"40px 0" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>⭐</div>
              길찾기 후 즐겨찾기 버튼을 눌러보세요!
            </div>
          ) : favorites.map(f=>(
            <div key={f.favorite_id} style={{ background:C.card, borderRadius:13, padding:"11px 16px", boxShadow:sh, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:C.tx }}>{f.from_name||"출발지"} <span style={{ color:C.sub }}>→</span> {f.to_name||"도착지"}</div>
                <div style={{ color:C.sub, fontSize:11, marginTop:2 }}>{f.label}</div>
              </div>
              <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                <button onClick={()=>{
                  setFrom({id:f.출발건물_id, name:f.from_name, isExternal:false});
                  setTo({id:f.도착건물_id, name:f.to_name, isExternal:false});
                  setPage("main");
                }} style={{ background:C.p, color:"#fff", border:"none", borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>길찾기</button>
                <button onClick={()=>removeFav(f.favorite_id)} style={{ background:"#fef2f2", color:C.r, border:"none", borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>삭제</button>
              </div>
            </div>
          ))
        )}

        {tab==="log"&&(
          recentLogs.length===0 ? (
            <div style={{ textAlign:"center", color:C.sub, fontSize:14, padding:"40px 0" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🕐</div>
              아직 길찾기 기록이 없어요
            </div>
          ) : recentLogs.map(l=>(
            <div key={l.route_id} style={{ background:C.card, borderRadius:13, padding:"11px 16px", boxShadow:sh, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:C.tx }}>{l.from_name||"출발지"} <span style={{ color:C.sub }}>→</span> {l.to_name||"도착지"}</div>
                <div style={{ color:C.sub, fontSize:11, marginTop:2 }}>{new Date(l.searched_at).toLocaleString('ko-KR')}</div>
              </div>
              <span style={{ background:"#eff6ff", color:C.p, padding:"2px 8px", borderRadius:99, fontSize:11, fontWeight:600 }}>{l.travel_mode==="도보"?"도보":"셔틀"}</span>
            </div>
          ))
        )}

        {tab==="rec"&&(
          <>
            <div style={{ background:"#eff6ff", borderRadius:11, padding:"10px 14px", fontSize:12, color:C.p, marginBottom:10 }}>📊 전체 인기 경로를 기반으로 추천해드려요</div>
            {(popularRoutes||[]).length===0 ? (
              <div style={{ color:C.sub, fontSize:13, textAlign:"center", padding:"30px 0" }}>길찾기를 이용하면 추천이 생겨요!</div>
            ) : (popularRoutes||[]).map((r,i)=>(
              <div key={i} style={{ background:C.card, borderRadius:13, padding:"11px 16px", boxShadow:sh, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ width:26, height:26, background:i<3?C.p:"#e2e8f0", color:i<3?"#fff":C.sub, borderRadius:99, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{i+1}</span>
                  <div><div style={{ fontWeight:600, fontSize:13, color:C.tx }}>{r.from_name} <span style={{ color:C.sub }}>→</span> {r.to_name}</div><div style={{ color:C.sub, fontSize:11, marginTop:2 }}>{r.search_count}회 이용</div></div>
                </div>
                <button onClick={()=>{
                  setFrom({id:r.from_place_id, name:r.from_name, isExternal:false});
                  setTo({id:r.to_place_id, name:r.to_name, isExternal:false});
                  setPage("main");
                }} style={{ background:C.p, color:"#fff", border:"none", borderRadius:7,
                padding:"4px 10px", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
                길찾기
               </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── 앱 루트 ────────────────────────────────────────────── */
export default function App() {
  const [page,setPage]         = useState("main");
  const [loggedIn,setLoggedIn] = useState(false);
  const [user,setUser]         = useState("");
  const [userId,setUserId]     = useState(null);
  const [from,setFrom]         = useState(null);
  const [to,setTo]             = useState(null);
  const [modal,setModal]       = useState({ open:false, target:null });
  const [routeResult,setRouteResult]   = useState(null);
  const [places,setPlaces]             = useState([]);
  const [shuttleRoutes,setShuttleRoutes] = useState([]);
  const [popularRoutes,setPopularRoutes] = useState([]);

  useEffect(()=>{
    getPlaces().then(r=>setPlaces(r.data)).catch(console.error);
    getPopularRoutes().then(r=>setPopularRoutes(r.data)).catch(console.error);
    getShuttleSchedules('하교').then(r=>setShuttleRoutes(r.data)).catch(console.error);
  },[]);

  const handleSelect = (place) => {
    if (modal.target==="from") setFrom(place); else setTo(place);
    setModal({ open:false, target:null });
  };

  const renderPage = () => {
    switch(page) {
      case "login":   return <LoginPage setPage={setPage} setLoggedIn={setLoggedIn} setUser={setUser} setUserId={setUserId}/>;
      case "places":  return <PlacesPage loggedIn={loggedIn} setPage={setPage} places={places}/>;
      case "shuttle": return <ShuttlePage shuttleRoutes={shuttleRoutes}/>;
      case "mypage":  return loggedIn
        ? <MyPage popularRoutes={popularRoutes} loggedIn={loggedIn}
          setPage={setPage} setFrom={setFrom} setTo={setTo}/>
        : <LoginPage setPage={setPage} setLoggedIn={setLoggedIn} setUser={setUser} setUserId={setUserId}/>;
      default: return (
        <MainPage loggedIn={loggedIn} setPage={setPage}
          from={from} setFrom={setFrom} to={to} setTo={setTo}
          modal={modal} setModal={setModal}
          popularRoutes={popularRoutes} setPopularRoutes={setPopularRoutes}
          routeResult={routeResult} setRouteResult={setRouteResult}
          userId={userId} shuttleRoutes={shuttleRoutes}/>
      );
    }
  };

  return (
    <div style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif", color:C.tx, position:"relative", minHeight:"100vh" }}>
      <Navbar page={page} setPage={setPage} loggedIn={loggedIn} setLoggedIn={setLoggedIn} user={user}/>
      {renderPage()}
      <PlaceModal open={modal.open} onClose={()=>setModal({open:false,target:null})} onSelect={handleSelect} title={modal.target==="from"?"출발지 선택":"도착지 선택"} places={places}/>
    </div>
  );
}