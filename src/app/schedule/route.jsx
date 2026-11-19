import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { ArrowRight, BusFront, Check } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Footer, Screen, Spacer, TopBar } from '../../components/layout'
import { Button } from '../../components/controls'
import { Badge, IconTile, Notice } from '../../components/display'
import { LoadingLine } from '../../components/Spinner'
import OptionCard from '../../components/OptionCard'
import { searchRoutes } from '../../api/transit'
import { loadBusCongestion, loadSubwayArrivals, uniqueNames } from '../../lib/transitInfo'
import { toRouteOptions } from '../../lib/routes'
import { ROUTE_OPTIONS } from '../../data/mock'
import { formatArrival, useAppState } from '../../store/context'
import { colors } from '../../theme/tokens'

const PREVIEW_OPTIONS = ROUTE_OPTIONS.map((r) => ({ ...r, id: r.no, name: `${r.no}번`, walkToStop: r.walk }))

function RouteOption({ option: r, on, onPress }) {
  return (
    <OptionCard selected={on} onPress={onPress}>
      <View style={styles.optionTop}>
        <IconTile icon={BusFront} size={32} iconSize={18} tone={on ? 'solid' : 'brand'} />
        <AppText variant="bodyLBold">{r.name}</AppText>
        <AppText variant="caption" color="secondary">
          {r.type}
        </AppText>
        {r.recommended && <Badge tone="brand">추천</Badge>}
        <Spacer />
        {on && <Check size={20} color={colors.iconBrand} />}
      </View>
      <AppText variant="bodyS" color="secondary">
        {r.stop} · 도보 {r.walkToStop}분{r.transfer ? ` · ${r.transfer}` : ''}
      </AppText>
      <View style={styles.optionRange}>
        {r.max == null ? (
          <AppText variant="bodySMedium">약 {r.min}분</AppText>
        ) : (
          <>
            <AppText variant="bodySMedium">최소 {r.min}분</AppText>
            <ArrowRight size={14} color={colors.iconDefault} />
            <AppText variant="bodySMedium">최대 {r.max}분</AppText>
          </>
        )}
        {r.headway != null && (
          <AppText variant="bodyS" color="secondary">
            · 배차 {r.headway}분
          </AppText>
        )}
      </View>
    </OptionCard>
  )
}

// B7 이용 노선 선택 (출발지·목적지가 있으면 ODsay 검색 결과, 없으면 검수용 예시) — 웹 pages/home/RouteSelectPage.jsx
export default function RouteSelectScreen() {
  const { state, update } = useAppState()
  const { origin, destination } = state
  const live = Boolean(origin && destination)
  const [options, setOptions] = useState(live ? null : PREVIEW_OPTIONS)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState(state.routeDetail?.id ?? null)
  // 버스 혼잡도·지하철 도착정보 수집 중 여부
  const [collecting, setCollecting] = useState(false)

  useEffect(() => {
    if (!live) return undefined
    let cancelled = false
    searchRoutes(origin, destination)
      .then((json) => {
        if (cancelled) return
        const all = toRouteOptions(json, origin.name, destination.name)
        setOptions(all.filter((o) => o.no))
        update({ routeOptions: all })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [live, origin, destination, attempt, update])

  const retry = () => {
    setError('')
    setOptions(null)
    setAttempt((n) => n + 1)
  }

  const selected = options?.find((o) => o.id === picked) ?? options?.find((o) => o.recommended) ?? options?.[0]

  const confirm = async () => {
    if (!selected || collecting) return
    setCollecting(true)
    const [busCongestion, subwayArrivals] = await Promise.all([
      loadBusCongestion(live ? uniqueNames(selected.busRouteIds) : []),
      loadSubwayArrivals(live ? uniqueNames(selected.subwayStationNames) : []),
    ])
    update({
      route: selected.no,
      routeDetail: live ? selected : null,
      busCongestion,
      subwayArrivals,
    })
    setCollecting(false)
    router.navigate('/home')
  }

  return (
    <Screen>
      <TopBar title="이용 노선" />
      <Content gap={12}>
        <AppText variant="bodyM" color="secondary">
          {origin?.name ?? '내 집'} → {destination?.name ?? '동양미래대학교'}
          {'\n'}
          {state.arrival ? formatArrival(state.arrival) : '오전 9:00'} 도착 기준으로 추천해요
        </AppText>
        {error ? (
          <>
            <Notice>{error}</Notice>
            <Button variant="secondary" size="m" onPress={retry}>
              다시 시도
            </Button>
          </>
        ) : null}
        {!error && !options && (
          <LoadingLine>경로를 찾는 중이에요</LoadingLine>
        )}
        {options?.length === 0 && <Notice>버스로 갈 수 있는 경로를 찾지 못했어요. 출발 위치나 목적지를 바꿔 보세요.</Notice>}
        {options?.map((r) => (
          <RouteOption key={r.id} option={r} on={selected?.id === r.id} onPress={() => setPicked(r.id)} />
        ))}
      </Content>
      <Footer>
        <Button disabled={!selected || collecting} onPress={confirm}>
          {collecting ? '교통정보 확인 중...' : selected ? `${selected.name}으로 설정` : '노선을 선택하세요'}
        </Button>
      </Footer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  optionTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionRange: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
})
