import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { WebView } from 'react-native-webview'
import { BusFront, Flag, House } from 'lucide-react-native'
import AppText from './AppText'
import { hasKakaoKey } from '../lib/kakao'
import { mapHtml } from '../lib/kakaoHtml'
import { WEB_URL } from '../config'
import { colors, radius, shadows } from '../theme/tokens'

// 카카오 지도 (웹 components/KakaoMap.jsx)
// 키가 있으면 WebView 안에서 카카오 지도 JS SDK로 그리고, 키가 없거나 SDK를 못 불러오면 지도 그림(피그마 MapBase)을 그린다.
// props는 웹과 같다:
// - markers: [{ type: 'home'|'bus'|'destination'|'current', lat, lng, x, y }]  (x, y는 지도 그림용 % 위치)
// - route / walk: [[lat, lng], ...] 버스 구간 / 도보 구간
// - callout: { title, sub, x, y, lat, lng }, labels: [{ text, x, y }] (labels는 그림 지도에서만)
// - center: 바뀌면 지도를 그 위치로 옮긴다 (마커가 없으면 처음 중심으로도 씀)
// - centerPin: 지도 가운데 고정 핀 (위치 고르기용), onCenterChange(lat, lng): 지도를 움직이고 멈출 때마다 가운데 좌표
// - children: 지도 위에 띄울 버튼 (스스로 position: 'absolute'를 준다)

const MARKER = {
  home: { size: 40, bg: colors.bgBrand, Icon: House, icon: 20 },
  bus: { size: 32, bg: colors.iconStrong, Icon: BusFront, icon: 16 },
  destination: { size: 36, bg: colors.textDanger, Icon: Flag, icon: 18 },
  current: { size: 20, bg: colors.bgBrand },
}

export function Marker({ type }) {
  const { size, bg, Icon, icon } = MARKER[type]
  if (type === 'current') {
    return (
      <View style={styles.currentHalo}>
        <View style={[styles.marker, styles.currentDot, { width: size + 8, height: size + 8, backgroundColor: bg }]} />
      </View>
    )
  }
  return (
    <View style={[styles.marker, { width: size + 6, height: size + 6, backgroundColor: bg }]}>
      {Icon && <Icon size={icon} color={colors.iconInverse} />}
    </View>
  )
}

// x%, y% 위치에 가운데를 맞춰 놓는다 (웹 translate(-50%, -50%)). 크기 0인 상자 안에서 가운데 정렬
// inert: 지도를 끄는(드래그하는) 손가락을 막지 않는다 (가운데 고정 핀)
function At({ x, y, inert, children }) {
  return (
    <View style={[styles.at, { left: `${x}%`, top: `${y}%` }, inert && styles.inert]}>
      {children}
    </View>
  )
}

function FallbackMap({ height, markers, callout, labels, route }) {
  const h = height
  return (
    <>
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 390 ${h}`} preserveAspectRatio="xMidYMid slice">
        <Rect width="390" height={h} fill="#ECEFF3" />
        <Path d={`M262 0C276 70 336 110 326 ${h * 0.6}C318 ${h * 0.8} 352 ${h * 0.92} 390 ${h}V0Z`} fill="#CFE2F6" />
        <Rect x="24" y={h * 0.1} width="78" height="56" rx="8" fill="#DCEFD8" />
        <Rect x="150" y={h * 0.74} width="84" height="62" rx="8" fill="#DCEFD8" />
        <Path d={`M0 ${h * 0.4}L390 ${h * 0.33}`} stroke="#fff" strokeWidth="12" />
        <Path d={`M0 ${h * 0.7}L390 ${h * 0.8}`} stroke="#fff" strokeWidth="9" />
        <Path d={`M118 0L142 ${h}`} stroke="#fff" strokeWidth="12" />
        <Path d={`M224 0L206 ${h}`} stroke="#fff" strokeWidth="7" />
        <Path
          d={`M0 60L118 52M142 ${h * 0.56}L390 ${h * 0.53}M30 0L50 ${h}M300 110L290 ${h}`}
          stroke="#fff"
          strokeWidth="4"
        />
        {route && (
          <>
            <Path
              d={`M58 ${h * 0.55} L126 ${h * 0.6}`}
              stroke="#9AA1AE"
              strokeWidth="4"
              strokeDasharray="2 8"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={`M126 ${h * 0.6} C 170 ${h * 0.78}, 210 ${h * 0.62}, 236 ${h * 0.58} S 300 ${h * 0.5}, 334 ${h * 0.42}`}
              stroke={colors.iconBrand}
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </Svg>
      {markers.map((m) => (
        <At key={m.type} x={m.x} y={m.y}>
          <Marker type={m.type} />
        </At>
      ))}
      {callout && (
        <At x={callout.x} y={callout.y}>
          <View style={styles.callout}>
            <AppText variant="titleS" numberOfLines={1}>
              {callout.title}
            </AppText>
            {callout.sub ? (
              <AppText variant="caption" color="secondary" numberOfLines={1}>
                {callout.sub}
              </AppText>
            ) : null}
          </View>
        </At>
      )}
      {labels?.map((l) => (
        <At key={l.text} x={l.x} y={l.y}>
          <View style={styles.label}>
            <AppText variant="captionMedium" numberOfLines={1}>
              {l.text}
            </AppText>
          </View>
        </At>
      ))}
    </>
  )
}

export default function KakaoMap({
  height = 236,
  markers = [],
  route,
  walk,
  callout,
  labels,
  center,
  centerPin,
  onCenterChange,
  children,
}) {
  const webRef = useRef(null)
  const onCenterChangeRef = useRef(onCenterChange)
  const [mode, setMode] = useState(hasKakaoKey() ? 'loading' : 'fallback')
  // 지도는 처음 한 번만 그린다 (웹과 같음). 이후 바뀌는 건 center뿐
  const [html] = useState(() => (hasKakaoKey() ? mapHtml({ markers, route, walk, callout, center, centerPin }) : null))
  const firstCenter = useRef(center)

  useEffect(() => {
    onCenterChangeRef.current = onCenterChange
  }, [onCenterChange])

  useEffect(() => {
    // 그림 지도는 움직이지 않으니 center가 바뀔 때 그 좌표를 그대로 알려준다
    if (mode === 'fallback') {
      if (center) onCenterChangeRef.current?.(center.lat, center.lng)
      return
    }
    // 현재 위치 버튼 등으로 center가 바뀌면 지도를 옮긴다 (처음 center는 페이지가 이미 알고 있다)
    if (mode !== 'kakao' || !center || center === firstCenter.current) return
    webRef.current?.injectJavaScript(`window.__buxby && window.__buxby.panTo(${Number(center.lat)}, ${Number(center.lng)}); true;`)
  }, [center, mode])

  const onMessage = (event) => {
    let msg
    try {
      msg = JSON.parse(event.nativeEvent.data)
    } catch {
      return
    }
    if (msg.type === 'ready') setMode('kakao')
    else if (msg.type === 'error') {
      if (__DEV__) console.warn('[카카오 지도]', msg.message)
      setMode('fallback')
    } else if (msg.type === 'center') onCenterChangeRef.current?.(msg.lat, msg.lng)
  }

  return (
    <View style={[styles.map, { height }]}>
      {mode === 'fallback' ? (
        <>
          <FallbackMap height={height} markers={markers} callout={callout} labels={labels} route={!!route} />
          <View style={styles.badge}>
            <AppText variant="caption" color="secondary">
              지도 미리보기
            </AppText>
          </View>
        </>
      ) : (
        <WebView
          ref={webRef}
          // 카카오 JS 키는 콘솔에 등록한 도메인에서만 동작한다 → 웹 서비스 주소에서 연 페이지처럼 띄운다
          source={{ html, baseUrl: WEB_URL }}
          originWhitelist={['*']}
          onMessage={onMessage}
          onError={() => setMode('fallback')}
          style={styles.web}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          nestedScrollEnabled
          setSupportMultipleWindows={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      )}
      {centerPin && (
        <At x={50} y={50} inert>
          <Marker type="home" />
        </At>
      )}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: colors.bgSubtle },
  inert: { pointerEvents: 'none' },
  map: { position: 'relative', flexShrink: 0, width: '100%', overflow: 'hidden', backgroundColor: colors.bgSubtle },
  at: { position: 'absolute', width: 0, height: 0, pointerEvents: 'box-none', alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  badge: {
    position: 'absolute',
    left: 12,
    top: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.bgSurface,
    ...shadows.card,
  },
  currentHalo: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(74, 108, 247, 0.2)',
  },
  currentDot: { borderWidth: 4 },
  callout: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    ...shadows.card,
  },
  label: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurface,
    ...shadows.card,
  },
})
