import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { BusFront, Lock, Timer } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Screen, Spacer } from '../../components/layout'
import { Button } from '../../components/controls'
import { Divider, IconTile, Toast } from '../../components/display'
import { ALARM, RECOMMEND } from '../../data/mock'
import { addMinutes, alarmView, clock } from '../../lib/time'
import { activeSnooze, nextSnoozeAt, snoozeLimitAt } from '../../lib/snooze'
import { useToast } from '../../lib/useToast'
import { useAppState } from '../../store/context'
import { colors, radius } from '../../theme/tokens'

// D5 기상 알람 전체화면 (시안③) — 알람 화면에는 광고를 넣지 않음 (중간발표 Q14) — 웹 pages/alarm/WakeAlarmPage.jsx
export default function WakeAlarmScreen() {
  const { state, update } = useAppState()
  const [toast, showToast] = useToast(2800)
  const { plan, settings } = state
  const view = plan ? alarmView(plan) : ALARM
  const snooze = plan ? activeSnooze(state) : null
  const limit = plan ? clock(snoozeLimitAt(plan, settings)) : ALARM.snoozeLimit
  const snoozeAt = plan ? nextSnoozeAt(plan, settings) : addMinutes(new Date(2026, 0, 1, 6, 28), settings.snoozeMinutes)
  const ringTime = plan ? new Date(snooze?.until ?? plan.wakeTime) : null
  const ringingAt = ringTime ? clock(ringTime) : view.wake
  // 홈에서 미리 보기로 연 경우(아직 울릴 시각 전)에는 알람 기록을 건드리지 않는다
  const ringing = Boolean(ringTime) && new Date() >= ringTime

  // 알람을 끄면 미루기 기록을 지우고, 안전 알람이 다시 울리지 않게 표시한다
  // 끈 알람으로 뒤로 가기 해 돌아오지 않도록 replace로 넘어간다 (웹은 push)
  const dismiss = () => {
    if (ringing) {
      update({
        wakeOffAt: new Date().toISOString(),
        snooze: null,
        alarmFired: {
          ...state.alarmFired,
          wake: plan.reservationId,
          safety: plan.reservationId,
          dismissed: plan.reservationId,
        },
      })
    }
    router.replace('/alarm/depart')
  }

  const postpone = () => {
    if (!snoozeAt) return
    if (!ringing) {
      const at = plan ? (nextSnoozeAt(plan, settings, ringTime) ?? snoozeAt) : snoozeAt
      showToast(`누르면 ${clock(at)}에 다시 울려요 · ${limit} 이후로는 미루지 않아요 (미리 보기)`)
      return
    }
    update({
      snooze: { reservationId: plan.reservationId, until: snoozeAt.toISOString(), count: (snooze?.count ?? 0) + 1 },
      // 미룬 시각에 다시 울리도록 기상 알람 기록을 지운다
      alarmFired: { ...state.alarmFired, wake: null },
    })
    // 웹 location.state.toast → 홈의 ?toast= 파라미터
    router.navigate({
      pathname: '/home',
      params: { toast: `${clock(snoozeAt)}에 다시 울려요 · ${limit} 이후로는 미루지 않아요` },
    })
  }

  return (
    <Screen bg="alarm">
      <Content gap={8} style={styles.content}>
        <Lock size={22} color={colors.iconInverse} />
        <AppText variant="displayTime">{ringingAt}</AppText>
        <AppText variant="bodyL">{view.date}</AppText>
        <Spacer />
        <View style={styles.card} accessibilityLabel="기상 알람">
          <View style={styles.cardHead}>
            <IconTile icon={BusFront} tone="solid" />
            <View style={styles.shrink}>
              <AppText variant="titleS" color="primary">
                일어날 시간이에요!
              </AppText>
              <AppText variant="bodyS" color="secondary">
                버스를 타려면 지금 일어나야 해요.
              </AppText>
            </View>
          </View>
          <Divider style={styles.rule} />
          <View style={styles.info}>
            <Timer size={18} color={colors.iconStrong} />
            <AppText variant="bodySMedium" color="primary" style={styles.shrink}>
              출발까지 약 {plan ? plan.preparationMinutes : RECOMMEND.total}분 필요 (평균 준비 시간)
            </AppText>
          </View>
          <View style={styles.info}>
            <BusFront size={18} color={colors.iconStrong} />
            <AppText variant="bodySMedium" color="primary" style={styles.shrink}>
              추천 버스 · {plan ? `${plan.bus} (${view.board} 승차)` : `${RECOMMEND.bus}번 (${ALARM.board} 도착)`}
            </AppText>
          </View>
          <Button onPress={dismiss}>알람 끄기</Button>
          <Button variant="tertiary" onPress={postpone} disabled={!snoozeAt}>
            {settings.snoozeMinutes}분 더 자기
          </Button>
          <AppText variant="caption" color="tertiary" style={styles.center}>
            {snoozeAt
              ? `미루기 상한(${limit})까지만 미룰 수 있어요${snooze ? ` · ${snooze.count}번 미룸` : ''}`
              : `미루기 상한(${limit})이 지나 더 미룰 수 없어요`}
          </AppText>
        </View>
      </Content>
      <Toast message={toast} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  center: { textAlign: 'center' },
  content: { alignItems: 'center', paddingTop: 24, paddingBottom: 24, paddingHorizontal: 16 },
  card: { gap: 16, width: '100%', padding: 20, borderRadius: radius.xl, backgroundColor: colors.bgSurface },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { marginHorizontal: 0 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 10 },
})
