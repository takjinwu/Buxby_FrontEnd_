import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { BusFront, ChevronRight, CircleAlert, CircleDot } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Screen, Spacer, TopBar } from '../../components/layout'
import { Button } from '../../components/controls'
import { AdBanner, Badge, Card, IconTile, Notice, TimeRange } from '../../components/display'
import { LoadingLine, Skeleton } from '../../components/Spinner'
import BusNow from '../../components/BusNow'
import KakaoMap from '../../components/KakaoMap'
import { ALARM, PLACES, RECOMMEND, RECOMMEND_SOON } from '../../data/mock'
import { loadRealtime } from '../../lib/busApproach'
import { snoozeLimitAt } from '../../lib/snooze'
import { clockLabel } from '../../lib/time'
import { useAppState } from '../../store/context'
import { colors } from '../../theme/tokens'

const ROUTE_PATH = [
  [PLACES.stop.lat, PLACES.stop.lng],
  [37.4905, 126.8902],
  [37.4968, 126.8768],
  [PLACES.destination.lat, PLACES.destination.lng],
]

// 두 칸 나란히 (웹 .two-col)
function TwoCol({ children }) {
  return <View style={styles.twoCol}>{children}</View>
}

function NextCard({ children }) {
  return (
    <Card padded style={styles.nextCard} containerStyle={styles.col}>
      {children}
    </Card>
  )
}

function ErrorCard({ children }) {
  return (
    <Card padded style={styles.errorCard}>
      {children}
    </Card>
  )
}

// C1 추천 경로 · C4 불러오는 중 · C5 불러오기 실패 · C6 곧 도착(5분 이하) — 웹 pages/route/RecommendRoutePage.jsx
// ?state=preview | loading | error | soon 은 예시 데이터로 보는 검수용
export default function RecommendRouteScreen() {
  const params = useLocalSearchParams()
  const { state, update } = useAppState()
  const forced = typeof params.state === 'string' ? params.state : null
  const { origin, destination, routeDetail: detail } = state
  const live = !forced && Boolean(detail && origin && destination)
  const [status, setStatus] = useState(forced === 'error' ? 'error' : 'loading')
  const [attempt, setAttempt] = useState(0)
  const [realtime, setRealtime] = useState(null)

  useEffect(() => {
    if (live) {
      let cancelled = false
      loadRealtime(origin, destination, detail)
        .then((next) => {
          if (cancelled) return
          setRealtime(next)
          if (next) update({ lastRealtime: next })
          setStatus('ready')
        })
        .catch(() => {
          if (!cancelled) setStatus('error')
        })
      return () => {
        cancelled = true
      }
    }
    // ?state=loading | error 로 들어오면 첫 화면을 그 상태로 고정 (검수용)
    if (attempt === 0 && (forced === 'loading' || forced === 'error')) return undefined
    const timer = setTimeout(() => setStatus('ready'), 700)
    return () => clearTimeout(timer)
  }, [attempt, forced, live, origin, destination, detail, update])

  const load = () => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  if (!forced && !live) {
    return (
      <Screen tab>
        <TopBar title="추천 경로" backTo="/home" />
        <Content gap={12} style={styles.top}>
          <ErrorCard>
            <IconTile icon={BusFront} size={56} iconSize={28} />
            <AppText variant="titleS" style={styles.center}>
              아직 설정한 경로가 없어요
            </AppText>
            <AppText variant="bodyS" color="secondary" style={styles.center}>
              목적지와 출발 위치, 이용 노선을 먼저 정해 주세요.
            </AppText>
            <Button variant="secondary" size="m" onPress={() => router.navigate('/home')}>
              일정 설정하기
            </Button>
          </ErrorCard>
        </Content>
      </Screen>
    )
  }

  const preview = forced === 'soon' ? { ...RECOMMEND, ...RECOMMEND_SOON } : RECOMMEND
  const data = live
    ? {
        bus: detail.no,
        sub: detail.stop,
        arrivesIn: null,
        arrivalText: '도착 정보 없음',
        stop: detail.stop,
        walk: detail.walkToStop,
        next: [],
        ...realtime,
        total: detail.total,
        min: detail.min,
        max: detail.max,
        totalWalk: detail.walk,
      }
    : { ...preview, totalWalk: preview.walk }
  const home = live ? origin : PLACES.home
  const stop = live ? { lat: detail.stopLat, lng: detail.stopLng } : PLACES.stop
  const goal = live ? destination : PLACES.destination
  const lastInfo = live ? state.lastRealtime : RECOMMEND
  const refresh = status === 'loading' ? undefined : { label: '새로고침', onPress: load }
  const safetyTime =
    live && state.plan ? clockLabel(snoozeLimitAt(state.plan, state.settings)) : `오전 ${ALARM.snoozeLimit}`

  return (
    <Screen tab>
      <TopBar title="추천 경로" action={refresh} backTo="/home" />
      {status === 'ready' && (
        <KakaoMap
          height={190}
          markers={[
            { type: 'home', ...home, x: 13, y: 55 },
            { type: 'bus', ...stop, x: 32, y: 60 },
            { type: 'destination', ...goal, x: 85.5, y: 42 },
          ]}
          walk={[
            [home.lat, home.lng],
            [stop.lat, stop.lng],
          ]}
          route={live ? detail.path : ROUTE_PATH}
          callout={{
            title: `약 ${data.total}분`,
            sub: `(도보 ${data.totalWalk}분 포함)`,
            x: 50,
            y: 26,
            lat: (home.lat + goal.lat) / 2,
            lng: (home.lng + goal.lng) / 2,
          }}
          labels={[{ text: goal.name, x: 80, y: 66 }]}
        />
      )}
      {status === 'loading' && <Skeleton height={190} radius={0} color={colors.bgDisabled} />}

      {status === 'ready' && (
        <Content gap={12} style={styles.readyContent}>
          <Card padded>
            <View style={styles.cardHead}>
              <AppText variant="bodyLBold">추천 경로</AppText>
              {live && !realtime ? <Badge tone="neutral">실시간 정보 없음</Badge> : <Badge tone="success">실시간</Badge>}
              <Spacer />
              <Pressable
                onPress={() => router.push('/route/detail')}
                accessibilityRole="link"
                hitSlop={8}
                style={styles.moreLink}
              >
                <AppText variant="bodyS" color="secondary">
                  상세보기
                </AppText>
                <ChevronRight size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            {/* 지연 정보 API가 아직 없어 실제 경로에서는 지연 안내(예시)로 보내지 않는다 */}
            <BusNow data={data} onPress={live ? undefined : () => router.push('/route/delay')} />
            <View style={styles.stopLine}>
              <CircleDot size={16} color={colors.iconBrand} />
              <AppText variant="bodyS" color="secondary" style={styles.shrink}>
                {data.stop} · 도보 {data.walk}분
              </AppText>
            </View>
          </Card>
          {data.next.length > 0 && (
            <TwoCol>
              {data.next.map((n) => (
                <NextCard key={n.label}>
                  <AppText variant="bodySMedium">{n.label}</AppText>
                  <AppText variant="caption" color="secondary">
                    {n.in != null ? `${n.in}분 후 · ${n.at}` : n.text}
                  </AppText>
                </NextCard>
              ))}
            </TwoCol>
          )}
          <TimeRange min={data.min} max={data.max} />
          <AdBanner />
        </Content>
      )}

      {status === 'loading' && (
        <Content gap={12} style={styles.top}>
          <Card padded>
            <Skeleton width={120} height={18} />
            <Skeleton width={260} height={14} style={styles.skeletonShrink} />
            <Skeleton width={200} height={14} />
          </Card>
          <TwoCol>
            {[0, 1].map((i) => (
              <NextCard key={i}>
                <Skeleton width={70} height={12} />
                <Skeleton width={110} height={12} style={styles.skeletonShrink} />
              </NextCard>
            ))}
          </TwoCol>
          <LoadingLine>실시간 버스 정보를 불러오는 중이에요</LoadingLine>
        </Content>
      )}

      {status === 'error' && (
        <Content gap={12} style={styles.top}>
          <ErrorCard>
            <IconTile icon={CircleAlert} size={56} iconSize={28} tone="danger" />
            <AppText variant="titleS" style={styles.center}>
              버스 정보를 불러오지 못했어요
            </AppText>
            <AppText variant="bodyS" color="secondary" style={styles.center}>
              {'공공데이터 버스 도착 정보 응답이 늦어지고 있어요.\n마지막으로 받은 정보로 알람을 유지하고 있어요.'}
            </AppText>
            <Button variant="secondary" size="m" onPress={load}>
              다시 시도
            </Button>
          </ErrorCard>
          {lastInfo && (
            <Card padded>
              <View style={styles.cardHead}>
                <AppText variant="bodyLBold">마지막 정보</AppText>
                <Badge tone="neutral">{lastInfo.updatedAt} 기준</Badge>
              </View>
              <BusNow data={lastInfo} sub={lastInfo.stop} atSuffix=" 예정" />
            </Card>
          )}
          <Notice>안전 알람 {safetyTime}는 통신과 관계없이 그대로 울려요.</Notice>
          <Spacer />
          <AdBanner />
        </Content>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  center: { textAlign: 'center' },
  top: { paddingTop: 16 },
  readyContent: { paddingTop: 16, paddingBottom: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moreLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  stopLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  twoCol: { flexDirection: 'row', gap: 12, width: '100%' },
  col: { flex: 1, width: 'auto' },
  nextCard: { gap: 2, paddingVertical: 12, paddingHorizontal: 16 },
  errorCard: { alignItems: 'center', padding: 24, paddingVertical: 24, paddingHorizontal: 24 },
  skeletonShrink: { maxWidth: '100%' },
})
