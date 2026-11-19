import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { DoorOpen } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Footer, Screen } from '../../components/layout'
import { Button } from '../../components/controls'
import { TimeRange } from '../../components/display'
import { RECOMMEND } from '../../data/mock'
import { recordPreparation } from '../../api/alarm'
import { addMinutes, clockLabel, prepMinutesSince } from '../../lib/time'
import { catchableArrival, remainingSeconds, stopsLabel } from '../../lib/busApproach'
import { useAppState } from '../../store/context'
import { colors, radius } from '../../theme/tokens'

const PREVIEW = {
  bus: `${RECOMMEND.bus}번`,
  minutes: 12,
  stop: RECOMMEND.stop,
  walk: RECOMMEND.walk,
  arrivesAt: RECOMMEND.arrivesAt,
  spare: 4,
  min: RECOMMEND.min,
  max: RECOMMEND.max,
  nextLabel: '다음 버스(7:23)로 갈게요',
}

const FRESH_MS = 3 * 60000

// 3분 안에 받은 실시간 접근 정보가 있으면 그 버스 기준으로, 없으면 예약한 탑승 시각 기준으로 안내
function liveBus(plan, detail, approach, now = new Date()) {
  const fresh =
    approach?.status === 'FOUND' &&
    approach.reservationId === plan.reservationId &&
    now - new Date(approach.receivedAt) < FRESH_MS
  if (fresh) {
    const arrivals = approach.arrivals.map((a) => ({
      ...a,
      arrivalSeconds: remainingSeconds(a, approach.receivedAt, now),
    }))
    const bus = catchableArrival(arrivals, detail.walkToStop)
    if (bus) {
      return {
        bus: `${bus.routeNo}번`,
        boarding: addMinutes(now, bus.arrivalSeconds / 60),
        stops: ` (${stopsLabel(bus.remainingStops)})`,
        stop: approach.stopName,
      }
    }
  }
  return { bus: plan.bus, boarding: new Date(plan.boardingTime), stops: '', stop: detail.stop }
}

function liveInfo(plan, detail, approach) {
  const { bus, boarding, stops, stop } = liveBus(plan, detail, approach)
  const minutes = Math.max(0, Math.ceil((boarding.getTime() - Date.now()) / 60000))
  return {
    bus,
    stops,
    minutes,
    stop,
    walk: detail.walkToStop,
    arrivesAt: clockLabel(boarding),
    spare: Math.max(0, minutes - detail.walkToStop),
    min: detail.min,
    max: detail.max,
    nextLabel: '다음 버스로 갈게요',
  }
}

// 세 칸을 같은 너비로 나눠 가운데 칸(버스 도착)을 카드 정가운데에 둔다
const CELL_ALIGN = [
  { alignItems: 'flex-start', textAlign: 'left' },
  { alignItems: 'center', textAlign: 'center' },
  { alignItems: 'flex-end', textAlign: 'right' },
]

// D6 출발 알람 전체화면 — '출발했어요'로 준비 시간 기록 (중간발표 Q5) — 웹 pages/alarm/DepartAlarmPage.jsx
export default function DepartAlarmScreen() {
  const { state, update } = useAppState()
  const { plan, routeDetail } = state
  const info = plan && routeDetail ? liveInfo(plan, routeDetail, state.lastApproach) : PREVIEW

  // 알람 화면은 뒤로 돌아오지 않도록 replace로 경로 탭에 간다 (웹은 push)
  const goRoute = () => router.replace('/route')

  const departed = async () => {
    const minutes = plan ? prepMinutesSince(state.wakeOffAt) : null
    if (minutes) {
      // 기록 실패가 출발 안내를 막으면 안 되므로 다음 화면으로 그대로 이동한다
      await recordPreparation({ minutes }).catch(() => {})
    }
    if (plan) update({ wakeOffAt: null })
    goRoute()
  }

  return (
    <Screen bg="brand">
      <Content gap={12} style={styles.content}>
        <View style={styles.pill}>
          <DoorOpen size={16} color={colors.iconInverse} />
          <AppText variant="captionMedium">출발 알림</AppText>
        </View>
        <AppText variant="displayL" accessibilityRole="header">
          지금 나가야 해요
        </AppText>
        <AppText variant="bodyL">
          {info.bus}이{info.stops ?? ''} {info.minutes}분 후 {info.stop}에 도착해요.
        </AppText>
        <View style={styles.countCard}>
          <View style={styles.countRow}>
            {[
              ['정류장까지', `도보 ${info.walk}분`, 'primary'],
              ['버스 도착', info.arrivesAt, 'brand'],
              ['여유', `${info.spare}분`, 'success'],
            ].map(([k, v, c], i) => (
              <View key={k} style={[styles.countCell, { alignItems: CELL_ALIGN[i].alignItems }]}>
                <AppText variant="caption" color="secondary">
                  {k}
                </AppText>
                <AppText variant="titleS" color={c} style={{ textAlign: CELL_ALIGN[i].textAlign }}>
                  {v}
                </AppText>
              </View>
            ))}
          </View>
          <TimeRange min={info.min} max={info.max} />
        </View>
      </Content>
      <Footer>
        <Button variant="secondary" onPress={departed}>
          출발했어요
        </Button>
        <AppText variant="caption" style={styles.center}>
          누르면 오늘 준비 시간 기록에 반영돼요
        </AppText>
        <Pressable onPress={goRoute} accessibilityRole="button" hitSlop={8} style={styles.link}>
          <AppText variant="bodySMedium" style={styles.underline}>
            {info.nextLabel}
          </AppText>
        </Pressable>
      </Footer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  underline: { textDecorationLine: 'underline' },
  content: { paddingTop: 48 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.bgAlarmCard,
  },
  countCard: { gap: 12, padding: 20, borderRadius: radius.xl, backgroundColor: colors.bgSurface },
  countRow: { flexDirection: 'row', gap: 8 },
  countCell: { flex: 1, gap: 2 },
  link: { alignSelf: 'center' },
})
