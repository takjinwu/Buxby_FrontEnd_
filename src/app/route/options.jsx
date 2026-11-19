import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from '../../components/AppText'
import { Content, Screen, TopBar } from '../../components/layout'
import { Chip, ChipRow } from '../../components/controls'
import { Badge } from '../../components/display'
import OptionCard from '../../components/OptionCard'
import { ROUTE_COMPARE } from '../../data/mock'
import { useAppState } from '../../store/context'
import { colors } from '../../theme/tokens'

const SORTS = [
  { id: 'recommend', label: '추천순' },
  { id: 'fast', label: '빨리 도착' },
  { id: 'walk', label: '도보 적게' },
]

// C3 경로 옵션 비교 — 웹 pages/route/RouteOptionsPage.jsx
export default function RouteOptionsScreen() {
  const { state } = useAppState()
  const routes = state.routeOptions?.length ? state.routeOptions : ROUTE_COMPARE
  const [sort, setSort] = useState('recommend')
  const [selected, setSelected] = useState(state.routeDetail?.id ?? routes[0].id)

  const list = useMemo(() => {
    const copy = [...routes]
    if (sort === 'fast') copy.sort((a, b) => a.min - b.min)
    if (sort === 'walk') copy.sort((a, b) => a.walk - b.walk)
    return copy
  }, [sort, routes])

  return (
    <Screen>
      <TopBar title="다른 경로" />
      <Content gap={12}>
        <ChipRow>
          {SORTS.map((s) => (
            <Chip key={s.id} selected={sort === s.id} onPress={() => setSort(s.id)}>
              {s.label}
            </Chip>
          ))}
        </ChipRow>
        {list.map((o) => {
          const total = o.walk + o.ride
          return (
            <OptionCard key={o.id} selected={selected === o.id} onPress={() => setSelected(o.id)}>
              <View style={styles.top}>
                <AppText variant="bodyLBold">
                  {o.max == null ? `약 ${o.min}분` : `최소 ${o.min}분 ~ 최대 ${o.max}분`}
                </AppText>
                {o.recommended && <Badge tone="brand">추천</Badge>}
              </View>
              <View style={styles.ratio}>
                <View style={[styles.bar, styles.walk, { flexGrow: o.walk / total }]} />
                <View style={[styles.bar, styles.ride, { flexGrow: o.ride / total }]} />
              </View>
              <AppText variant="bodyS" color="secondary">
                {o.name} · 도보 {o.walk}분 · {o.transfer}
              </AppText>
            </OptionCard>
          )
        })}
        {!state.routeOptions?.length && (
          <AppText variant="caption" color="tertiary">
            최소·최대 소요 시간은 최근 도착 기록의 오차를 반영해 계산해요.
          </AppText>
        )}
      </Content>
    </Screen>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratio: { flexDirection: 'row', gap: 2, width: '100%', height: 8 },
  bar: { flexBasis: 0, borderRadius: 4 },
  walk: { backgroundColor: colors.bgDisabled },
  ride: { backgroundColor: colors.bgBrand },
})
