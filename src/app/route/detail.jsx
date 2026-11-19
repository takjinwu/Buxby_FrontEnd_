import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import AppText from '../../components/AppText'
import { Content, Footer, Screen, TopBar } from '../../components/layout'
import { Button } from '../../components/controls'
import { Badge, RouteStep } from '../../components/display'
import { BusCongestionSection, SubwayArrivalSection } from '../../components/TransitLive'
import { RECOMMEND, ROUTE_STEPS } from '../../data/mock'
import { alarmView } from '../../lib/time'
import { loadSubwayArrivals, uniqueNames } from '../../lib/transitInfo'
import { useAppState } from '../../store/context'
import { colors, radius } from '../../theme/tokens'

// 지하철 도착정보 자동 갱신 주기
const SUBWAY_REFRESH_MS = 180000

// C2 노선 상세 (타임라인) — 웹 pages/route/RouteDetailPage.jsx
export default function RouteDetailScreen() {
  const { state, update } = useAppState()
  const detail = state.routeDetail
  const [refreshingSubway, setRefreshingSubway] = useState(false)
  // 중복 호출 방지
  const refreshingRef = useRef(false)

  // 선택한 경로에 포함된 지하철 승차역
  const subwayStationNames = useMemo(() => uniqueNames(detail?.subwayStationNames), [detail?.subwayStationNames])

  const refreshSubwayArrivals = useCallback(async () => {
    if (subwayStationNames.length === 0 || refreshingRef.current) return
    refreshingRef.current = true
    setRefreshingSubway(true)
    try {
      update({ subwayArrivals: await loadSubwayArrivals(subwayStationNames) })
    } finally {
      refreshingRef.current = false
      setRefreshingSubway(false)
    }
  }, [subwayStationNames, update])

  // 3분마다 지하철 도착정보 자동 갱신
  useEffect(() => {
    if (subwayStationNames.length === 0) return undefined
    const id = setInterval(refreshSubwayArrivals, SUBWAY_REFRESH_MS)
    return () => clearInterval(id)
  }, [refreshSubwayArrivals, subwayStationNames.length])

  const view = state.plan ? alarmView(state.plan) : null
  const steps = detail?.steps ?? ROUTE_STEPS

  return (
    <Screen bg="surface">
      <TopBar title="경로 상세" />
      <Content gap={16}>
        <View style={styles.summary}>
          <View style={styles.summaryTop}>
            <AppText variant="bodyLBold">{detail ? detail.name : `${RECOMMEND.bus}번`} 이용</AppText>
            {(!detail || detail.recommended) && <Badge tone="brand">추천</Badge>}
          </View>
          <AppText variant="titleM" color="brand">
            {detail ? `약 ${detail.total}분` : `최소 ${RECOMMEND.min}분 ~ 최대 ${RECOMMEND.max}분`}
          </AppText>
          <AppText variant="bodyS" color="secondary">
            {!detail && '오전 7:00 출발 → 7:28 ~ 7:41 도착 · 환승 없음'}
            {detail && (view ? `${view.depart} 출발 → ${view.arrive} 도착 · ${detail.transfer}` : detail.transfer)}
          </AppText>
        </View>

        <View>
          {steps.map((s, i) => (
            <RouteStep key={i} {...s} />
          ))}
        </View>

        <BusCongestionSection congestion={state.busCongestion} detail={detail} />
        <SubwayArrivalSection
          subwayArrivals={state.subwayArrivals}
          detail={detail}
          onRefresh={refreshSubwayArrivals}
          refreshing={refreshingSubway}
        />
      </Content>
      <Footer>
        <View style={styles.twoCol}>
          <Button variant="secondary" onPress={() => router.navigate('/route')} style={styles.col}>
            지도 보기
          </Button>
          <Button variant="tertiary" onPress={() => router.push('/route/options')} style={styles.col}>
            다른 경로
          </Button>
        </View>
      </Footer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  summary: { gap: 8, padding: 20, borderRadius: radius.lg, backgroundColor: colors.bgBrandSubtle },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  twoCol: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
})
