import { Fragment, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Minus, Plus } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Footer, Screen, TopBar } from '../../components/layout'
import { Button, Chip, ChipRow } from '../../components/controls'
import { Card, Divider, MinutesField, Notice, PrepRow } from '../../components/display'
import { prepIcon } from '../../components/prepIcons'
import { useAppState } from '../../store/context'
import { colors, radius } from '../../theme/tokens'

const MODES = [
  { id: 'items', label: '항목별로' },
  { id: 'total', label: '한 번에' },
]
const PRESETS = [20, 30, 40, 50]
const STEP = 5
const MAX = 120

function RoundButton({ label, onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}
    >
      {children}
    </Pressable>
  )
}

// D3-1 한 번에 입력: 항목을 나누지 않고 전체 준비 시간만 정함
function TotalInput({ value, onChange }) {
  const step = (d) => onChange(Math.min(MAX, Math.max(0, value + d)))
  return (
    <Card padded style={styles.bulkCard}>
      <AppText variant="bodyMMedium" color="secondary">
        전체 준비 시간
      </AppText>
      <View style={styles.bulkInput}>
        <RoundButton label={`${STEP}분 줄이기`} onPress={() => step(-STEP)}>
          <Minus size={20} color={colors.iconStrong} />
        </RoundButton>
        <MinutesField name="전체" minutes={value} onChange={onChange} size="l" />
        <RoundButton label={`${STEP}분 늘리기`} onPress={() => step(STEP)}>
          <Plus size={20} color={colors.iconStrong} />
        </RoundButton>
      </View>
      <AppText variant="caption" color="tertiary" style={styles.center}>
        −/+는 {STEP}분씩 조절돼요
      </AppText>
      <ChipRow fill>
        {PRESETS.map((m) => (
          <Chip key={m} selected={value === m} onPress={() => onChange(m)}>
            {m}분
          </Chip>
        ))}
      </ChipRow>
    </Card>
  )
}

// D3 준비 항목 편집 · D3-1 한 번에 입력 — 웹 pages/alarm/PrepEditPage.jsx
export default function PrepEditScreen() {
  const params = useLocalSearchParams()
  const { state, update } = useAppState()
  const initialMode = params.mode === 'total' || params.mode === 'items' ? params.mode : (state.prepMode ?? 'items')
  const [mode, setMode] = useState(initialMode)
  const [items, setItems] = useState(state.prep)
  const itemsTotal = items.reduce((sum, p) => sum + p.minutes, 0)
  const [bulk, setBulk] = useState(state.prepTotal ?? itemsTotal)

  const change = (id, minutes) => setItems((list) => list.map((p) => (p.id === id ? { ...p, minutes } : p)))
  const addItem = () =>
    setItems((list) => [...list, { id: `custom-${list.length}`, icon: 'etc', name: '새 준비 항목', minutes: 5 }])

  const save = () => {
    update(mode === 'total' ? { prepMode: 'total', prepTotal: bulk } : { prepMode: 'items', prep: items })
    if (router.canGoBack()) router.back()
    else router.replace('/alarm')
  }

  return (
    <Screen>
      <TopBar title="준비 시간 설정" />
      <Content gap={12}>
        <AppText variant="bodyM" color="secondary">
          {'일어나서 집을 나서기까지 하는 일을 적어 주세요.\n기록이 쌓이면 최근 기록의 평균으로 바꿔 계산해요.'}
        </AppText>
        <ChipRow fill>
          {MODES.map((m) => (
            <Chip key={m.id} selected={mode === m.id} onPress={() => setMode(m.id)}>
              {m.label}
            </Chip>
          ))}
        </ChipRow>

        {mode === 'items' ? (
          <>
            <AppText variant="caption" color="brand">
              숫자를 눌러 직접 입력하거나, −/+로 1분씩 조절해요.
            </AppText>
            <Card>
              {items.map((p, i) => (
                <Fragment key={p.id}>
                  {i > 0 && <Divider />}
                  <PrepRow
                    icon={prepIcon(p.icon)}
                    name={p.name}
                    sub={`저장값 ${state.prep.find((s) => s.id === p.id)?.minutes ?? p.minutes}분`}
                    minutes={p.minutes}
                    onChange={(m) => change(p.id, m)}
                  />
                </Fragment>
              ))}
              <Divider />
              <Pressable
                onPress={addItem}
                accessibilityRole="button"
                style={({ pressed }) => [styles.addRow, pressed && styles.addRowPressed]}
              >
                <Plus size={20} color={colors.iconBrand} />
                <AppText variant="bodyMMedium" color="brand">
                  항목 추가
                </AppText>
              </Pressable>
            </Card>
            <View style={styles.totalBox}>
              <AppText variant="bodyMMedium">합계 준비 시간</AppText>
              <AppText variant="titleS" color="brand">
                {itemsTotal}분
              </AppText>
            </View>
          </>
        ) : (
          <>
            <TotalInput value={bulk} onChange={setBulk} />
            <Notice center>항목을 나누지 않고 전체 시간만 정해요. 기록이 쌓이면 최근 기록의 평균으로 바꿔 계산해요.</Notice>
          </>
        )}
      </Content>
      <Footer>
        <Button onPress={save}>저장</Button>
      </Footer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  bulkCard: { gap: 16, padding: 20 },
  bulkInput: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roundBtn: {
    flexShrink: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
  },
  roundBtnPressed: { backgroundColor: colors.bgDisabled },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 20 },
  addRowPressed: { backgroundColor: colors.bgCanvas },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.bgBrandSubtle,
  },
})
