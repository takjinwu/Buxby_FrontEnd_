import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import AppText from './AppText'
import { BottomSheet, IconButton } from './layout'
import { Button, DayChip } from './controls'
import { Notice } from './display'
import { DAYS } from '../store/context'
import { colors, radius } from '../theme/tokens'

// 웹 pages/home/ArrivalSheet.jsx (홈 화면 전용이지만 src/app 에는 화면만 두므로 여기에 둔다)

const AMPM = ['오전', '오후']
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = [0, 10, 20, 30, 40, 50]

function WheelColumn({ label, items, value, onChange, format = (v) => v }) {
  const index = items.indexOf(value)
  const at = (i) => items[(i + items.length) % items.length]
  return (
    <View style={styles.col} accessibilityLabel={label}>
      <IconButton onPress={() => onChange(at(index - 1))} accessibilityLabel={`${label} 이전`} style={styles.nav}>
        <ChevronUp size={18} color={colors.iconDefault} />
      </IconButton>
      <View style={styles.cell}>
        <AppText variant="bodyL" color="tertiary">
          {format(at(index - 1))}
        </AppText>
      </View>
      <View style={[styles.cell, styles.cellOn]}>
        <AppText variant="titleM" accessibilityLiveRegion="polite">
          {format(value)}
        </AppText>
      </View>
      <View style={styles.cell}>
        <AppText variant="bodyL" color="tertiary">
          {format(at(index + 1))}
        </AppText>
      </View>
      <IconButton onPress={() => onChange(at(index + 1))} accessibilityLabel={`${label} 다음`} style={styles.nav}>
        <ChevronDown size={18} color={colors.iconDefault} />
      </IconButton>
    </View>
  )
}

// B6 도착 희망 시간 선택 (바텀시트)
export default function ArrivalSheet({ open, initial, days, bufferMinutes, onClose, onConfirm }) {
  return (
    <BottomSheet open={open} title="도착 희망 시간" onClose={onClose}>
      {open && <ArrivalForm initial={initial} days={days} bufferMinutes={bufferMinutes} onConfirm={onConfirm} />}
    </BottomSheet>
  )
}

function ArrivalForm({ initial, days, bufferMinutes, onConfirm }) {
  const [time, setTime] = useState(initial ?? { ampm: '오전', hour: 9, minute: 0 })
  const [picked, setPicked] = useState(days ?? [])
  const toggleDay = (d) => setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]))

  return (
    <>
      <View style={styles.wheel}>
        <WheelColumn label="오전·오후" items={AMPM} value={time.ampm} onChange={(ampm) => setTime((t) => ({ ...t, ampm }))} />
        <WheelColumn label="시" items={HOURS} value={time.hour} onChange={(hour) => setTime((t) => ({ ...t, hour }))} />
        <WheelColumn
          label="분"
          items={MINUTES}
          value={time.minute}
          onChange={(minute) => setTime((t) => ({ ...t, minute }))}
          format={(m) => String(m).padStart(2, '0')}
        />
      </View>
      <AppText variant="bodySMedium" color="secondary">
        반복 요일
      </AppText>
      <View style={styles.dayRow}>
        {DAYS.map((d) => (
          <DayChip key={d} selected={picked.includes(d)} onPress={() => toggleDay(d)}>
            {d}
          </DayChip>
        ))}
      </View>
      <Notice>기본 여유 시간 {bufferMinutes}분을 더해 계산해요 (알람 설정에서 변경)</Notice>
      <Button onPress={() => onConfirm(time, picked)}>확인</Button>
    </>
  )
}

const styles = StyleSheet.create({
  wheel: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.bgCanvas,
  },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  nav: { paddingVertical: 2, paddingHorizontal: 16 },
  cell: { width: '100%', alignItems: 'center', paddingVertical: 6, borderRadius: radius.sm },
  cellOn: { backgroundColor: colors.bgSurface },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
})
