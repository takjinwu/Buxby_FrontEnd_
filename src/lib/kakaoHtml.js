// WebView 안에서 돌릴 카카오 지도 JS SDK 페이지 (웹 lib/kakao.js · components/KakaoMap.jsx 의 지도 코드)
// RN ↔ 페이지는 문자열 메시지(JSON)로 주고받는다
// - 페이지 → RN: window.ReactNativeWebView.postMessage(JSON.stringify({ type, ... }))
// - RN → 페이지: webView.injectJavaScript('window.__buxby.xxx(...)')
import { KAKAO_JS_KEY } from '../config'
import { colors } from '../theme/tokens'

const SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`

// </script> 가 들어간 문자열이 페이지를 깨지 않게 JSON을 스크립트에 넣는다
const embed = (value) => JSON.stringify(value).replace(/</g, '\\u003c')

// 카카오 SDK를 불러온 뒤 main(kakao)을 부른다. 실패하면 RN에 error를 보낸다
function page(main) {
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: ${colors.bgSubtle}; }
  body { font-family: -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', Roboto, sans-serif; -webkit-tap-highlight-color: transparent; }
  .marker { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; color: #fff;
    box-shadow: 0 0 0 3px #fff, 0 2px 6px rgba(17, 24, 39, 0.12); }
  .marker--home { width: 40px; height: 40px; background: ${colors.bgBrand}; }
  .marker--bus { width: 32px; height: 32px; background: ${colors.iconStrong}; }
  .marker--destination { width: 36px; height: 36px; background: ${colors.textDanger}; }
  .marker--current { width: 20px; height: 20px; background: ${colors.bgBrand};
    box-shadow: 0 0 0 4px #fff, 0 0 0 10px rgba(74, 108, 247, 0.2); }
  .callout { display: inline-flex; flex-direction: column; padding: 8px 14px; border: 1px solid ${colors.borderBrand};
    border-radius: 12px; background: #fff; box-shadow: 0 2px 6px rgba(17, 24, 39, 0.06); white-space: nowrap; }
  .callout strong { font-size: 18px; line-height: 26px; color: ${colors.textPrimary}; }
  .callout span { font-size: 12px; line-height: 16px; color: ${colors.textSecondary}; }
</style>
</head><body>
<div id="map"></div>
<script>
  function send(msg) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
  window.onerror = function (message) { send({ type: 'error', message: String(message) }); };
  var script = document.createElement('script');
  script.src = ${embed(SDK_URL)};
  script.onerror = function () { send({ type: 'error', message: '카카오 지도 SDK 로딩에 실패했습니다.' }); };
  script.onload = function () {
    if (!window.kakao || !window.kakao.maps) { send({ type: 'error', message: '카카오 지도 SDK를 불러오지 못했습니다.' }); return; }
    window.kakao.maps.load(function () {
      try { (${main})(window.kakao, send); }
      catch (e) { send({ type: 'error', message: String(e && e.message || e) }); }
    });
  };
  document.head.appendChild(script);
</script>
</body></html>`
}

// ----- 지도 화면 -----
// 아래 스크립트는 WebView 안에서 돈다. 앱 번들(Hermes)은 함수 소스를 남기지 않아서 fn.toString()을 쓸 수 없고,
// 문자열로 적어 둔다. 설정은 window.__config 로 받는다
const mapMain = `function (kakao, send) {
  var cfg = window.__config
  var LatLng = kakao.maps.LatLng
  var points = cfg.markers.map(function (m) { return new LatLng(m.lat, m.lng) })
  var start = points[0] || (cfg.center ? new LatLng(cfg.center.lat, cfg.center.lng) : new LatLng(37.4852, 126.9013))
  var map = new kakao.maps.Map(document.getElementById('map'), { center: start, level: cfg.centerPin ? 3 : 5 })

  kakao.maps.event.addListener(map, 'idle', function () {
    var c = map.getCenter()
    send({ type: 'center', lat: c.getLat(), lng: c.getLng() })
  })

  cfg.markers.forEach(function (m, i) {
    var el = document.createElement('span')
    el.className = 'marker marker--' + m.type
    if (cfg.icons[m.type]) el.innerHTML = cfg.icons[m.type]
    new kakao.maps.CustomOverlay({ map: map, position: points[i], content: el, yAnchor: 0.5 })
  })
  if (cfg.walk) {
    new kakao.maps.Polyline({
      map: map,
      path: cfg.walk.map(function (p) { return new LatLng(p[0], p[1]) }),
      strokeWeight: 4, strokeColor: '#9AA1AE', strokeStyle: 'shortdash',
    })
  }
  if (cfg.route) {
    new kakao.maps.Polyline({
      map: map,
      path: cfg.route.map(function (p) { return new LatLng(p[0], p[1]) }),
      strokeWeight: 6, strokeColor: cfg.routeColor,
    })
  }
  if (cfg.callout && cfg.callout.lat) {
    var box = document.createElement('span')
    box.className = 'callout'
    var title = document.createElement('strong')
    title.textContent = cfg.callout.title
    var sub = document.createElement('span')
    sub.textContent = cfg.callout.sub || ''
    box.appendChild(title)
    box.appendChild(sub)
    new kakao.maps.CustomOverlay({ map: map, position: new LatLng(cfg.callout.lat, cfg.callout.lng), content: box, yAnchor: 1.4 })
  }
  if (points.length > 1) {
    var bounds = new kakao.maps.LatLngBounds()
    points.forEach(function (p) { bounds.extend(p) })
    map.setBounds(bounds, 40, 40, 40, 40)
  }

  // RN이 현재 위치 버튼 등으로 center를 바꾸면 지도를 옮긴다
  window.__buxby = {
    panTo: function (lat, lng) { map.panTo(new LatLng(lat, lng)) },
    relayout: function () { map.relayout() },
  }
  send({ type: 'ready' })
  // 처음 그릴 때는 idle이 오지 않을 수 있어 시작 위치를 한 번 알려준다
  send({ type: 'center', lat: start.getLat(), lng: start.getLng() })
}`

// ----- 보이지 않는 검색 창구 (장소 검색 · 좌표 → 주소) -----
const bridgeMain = `function (kakao, send) {
  var places = new kakao.maps.services.Places()
  var geocoder = new kakao.maps.services.Geocoder()
  var OK = kakao.maps.services.Status.OK

  window.__buxby = {
    search: function (id, keyword) {
      places.keywordSearch(keyword, function (data, status) {
        if (status !== OK) return send({ type: 'result', id: id, result: [] })
        send({
          type: 'result',
          id: id,
          result: data.map(function (p) {
            var category = p.category_group_name || (p.category_name ? p.category_name.split(' > ').pop() : '') || '장소'
            return { id: p.id, name: p.place_name, address: p.road_address_name || p.address_name, category: category, lat: Number(p.y), lng: Number(p.x) }
          }),
        })
      })
    },
    address: function (id, lat, lng) {
      geocoder.coord2Address(lng, lat, function (result, status) {
        if (status !== OK || !result[0]) return send({ type: 'result', id: id, result: null })
        var road = result[0].road_address
        var addr = result[0].address
        send({ type: 'result', id: id, result: (road && road.address_name) || (addr && addr.address_name) || null })
      })
    },
  }
  send({ type: 'ready' })
}`

// 마커 안 아이콘 (lucide house · bus-front · flag)
const MARKER_SVG = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  bus: '<path d="M4 6 2 7"/><path d="M10 6h4"/><path d="m22 7-2-1"/><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="M6 19v2"/><path d="M18 21v-2"/>',
  destination: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
}
const MARKER_ICON_SIZE = { home: 20, bus: 16, destination: 18 }
const ICONS = Object.fromEntries(
  Object.entries(MARKER_SVG).map(([type, svg]) => {
    const s = MARKER_ICON_SIZE[type]
    return [
      type,
      `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`,
    ]
  }),
)

// 지도 페이지. 마커·경로 등은 처음 한 번만 그린다 (웹과 같음)
export function mapHtml({ markers, route, walk, callout, center, centerPin }) {
  const config = {
    markers: markers.filter((m) => m.lat != null && m.lng != null),
    route: route ?? null,
    walk: walk ?? null,
    callout: callout ?? null,
    center: center ?? null,
    centerPin: !!centerPin,
    icons: ICONS,
    routeColor: colors.iconBrand,
  }
  return page(mapMain).replace('<script>', `<script>window.__config = ${embed(config)};</script>\n<script>`)
}

export function bridgeHtml() {
  return page(bridgeMain)
}
