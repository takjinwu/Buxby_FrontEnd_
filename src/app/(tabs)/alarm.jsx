import { Fragment, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { AlarmClock, DoorOpen, Info, Pencil, Settings } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Footer, IconButton, Screen, Spacer, TopBar } from '../../components/layout'
import { Button } from '../../components/controls'
import { Badge, Card, Divider, PrepRow } from '../../components/display'
import { prepIcon } from '../../components/prepIcons'
import { LEARNING, PREP_BY_DAY } from '../../data/mock'
import { predictPreparation } from '../../api/alarm'
import { useAppState } from '../../store/context'
import { colors, radius } from '../../theme/tokens'

function SettingsLink() {
  return (
    <IconButton onPress={() => router.push('/alarm/settings')} accessibilityLabel="알람 설정">
      <Settings size={22} color={colors.iconDefault} />
    </IconButton>
  )
}

// D1 준비 시간 학습 (시안②)
function Learned({ prep, prediction }) {
  const max = Math.max(...PREP_BY_DAY.map((d) => d.minutes))
  return (
    <>
      <Card padded>
        <AppText variant="bodyMMedium" color="secondary">
          평균 준비 시간
        </AppText>
        <View style={styles.bigNumber}>
          <AppText variant="displayL">{prediction ? prediction.predictedMinutes : LEARNING.averageMinutes}분</AppText>
          <Info
            size={18}
            color={colors.iconDefault}
            accessibilityLabel={prediction ? '최근 기록 평균으로 계산' : '요일별 평균으로 계산'}
          />
        </View>
        {!prediction && (
          <View style={styles.chart} accessibilityRole="image" accessibilityLabel="요일별 평균 준비 시간">
            {PREP_BY_DAY.map((d) => (
              <View key={d.day} style={styles.chartCol}>
                <View
                  style={[
                    styles.bar,
                    { height: Math.round((d.minutes / max) * 64) },
                    !d.highlight && styles.barMuted,
                  ]}
                />
                <AppText variant="caption" color="secondary">
                  {d.day}
                </AppText>
              </View>
            ))}
          </View>
        )}
        <AppText variant="caption" color="tertiary">
          {prediction
            ? `최근 ${prediction.samples}회 기록의 평균이에요.`
            : '최근 2주간의 기록을 기반으로 계산했어요. 요일별 차이도 반영해요.'}
        </AppText>
      </Card>
      <Card>
        {prep.map((p, i) => (
          <Fragment key={p.id}>
            {i > 0 && <Divider />}
            <PrepRow icon={prepIcon(p.icon)} name={p.name} sub={prediction ? `${p.minutes}분` : `평균 ${p.minutes}분`} />
          </Fragment>
        ))}
      </Card>
    </>
  )
}

const HOW = [
  [AlarmClock, '알람을 끈 시각을 기상 시각으로'],
  [DoorOpen, '‘출발했어요’를 누른 시각(또는 집을 벗어난 시각)을 출발 시각으로'],
  [Pencil, '처음에는 항목별 시간을 직접 입력하고, 기록으로 보정해요'],
]

// D2 기록 부족 (직접 입력값으로 계산)
function Learning({ records, manualMinutes }) {
  const count = Math.min(records, LEARNING.requiredDays)
  return (
    <>
      <Card padded>
        <View style={styles.cardHead}>
          <AppText variant="titleS">기록이 더 필요해요</AppText>
          <Spacer />
          <Badge tone="neutral">직접 입력값 사용 중</Badge>
        </View>
        <View style={styles.bigNumber}>
          <AppText variant="displayL">{manualMinutes}분</AppText>
          <AppText variant="bodyS" color="secondary">
            직접 입력
          </AppText>
        </View>
        <View
          style={styles.progress}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: LEARNING.requiredDays, now: count }}
        >
          <View style={[styles.progressBar, { width: `${(count / LEARNING.requiredDays) * 100}%` }]} />
        </View>
        <AppText variant="captionMedium" color="brand">
          {LEARNING.requiredDays}회 중 {count}회 기록됨
        </AppText>
        <AppText variant="bodyS" color="secondary">
          기록이 {LEARNING.requiredDays}회 쌓이면 최근 기록의 평균 준비 시간으로 바꿔 계산해요.
        </AppText>
      </Card>
      <View style={styles.how}>
        <AppText variant="bodyMMedium" color="brand">
          이렇게 기록해요
        </AppText>
        {HOW.map(([HowIcon, text]) => (
          <View key={text} style={styles.howRow}>
            <View style={styles.howIcon}>
              <HowIcon size={18} color={colors.iconBrand} />
            </View>
            <AppText variant="bodyS" style={styles.shrink}>
              {text}
            </AppText>
          </View>
        ))}
      </View>
    </>
  )
}

// D1 준비 시간 학습 · D2 기록 부족 — 웹 pages/alarm/PrepLearningPage.jsx
export default function PrepLearningScreen() {
  const params = useLocalSearchParams()
  const { state } = useAppState()
  const forced = typeof params.state === 'string' ? params.state : null // learned | learning 은 예시 데이터로 보는 검수용
  // undefined: 불러오는 중, null: 불러오기 실패
  const [prediction, setPrediction] = useState(undefined)

  useEffect(() => {
    if (forced) return undefined
    let cancelled = false
    predictPreparation()
      .then((result) => !cancelled && setPrediction(result))
      .catch(() => !cancelled && setPrediction(null))
    return () => {
      cancelled = true
    }
  }, [forced])

  const samples = prediction?.samples ?? 0
  const learning = forced ? forced === 'learning' : samples < LEARNING.requiredDays
  const manualMinutes =
    state.prepMode === 'total' && state.prepTotal != null
      ? state.prepTotal
      : state.prep.reduce((s, p) => s + p.minutes, 0)
  const loading = !forced && prediction === undefined

  return (
    <Screen tab>
      <TopBar title="준비 시간 학습" right={<SettingsLink />} backTo="/home" />
      <Content gap={12}>
        {!loading &&
          (learning ? (
            <Learning records={forced ? 3 : samples} manualMinutes={manualMinutes} />
          ) : (
            <Learned prep={state.prep} prediction={forced ? null : prediction} />
          ))}
      </Content>
      <Footer>
        <Button variant="secondary" onPress={() => router.push('/alarm/prep')}>
          {learning ? '준비 항목 직접 입력하기' : '준비 시간 다시 설정하기'}
        </Button>
      </Footer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bigNumber: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 88 },
  chartCol: { alignItems: 'center', gap: 6 },
  bar: { width: 24, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: colors.chartBar },
  barMuted: { backgroundColor: colors.chartBarMuted },
  progress: { width: '100%', height: 8, borderRadius: radius.full, backgroundColor: colors.bgSubtle, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: radius.full, backgroundColor: colors.bgBrand },
  how: { gap: 10, padding: 16, borderRadius: radius.lg, backgroundColor: colors.bgBrandSubtle },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  howIcon: { marginTop: 1 },
})
