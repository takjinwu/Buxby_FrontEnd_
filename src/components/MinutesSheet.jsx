import { useState } from 'react'
import { StyleSheet } from 'react-native'
import AppText from './AppText'
import { BottomSheet } from './layout'
import { Button, Chip, ChipRow } from './controls'
import { NumberBox } from './display'

// 분 단위 설정 바텀시트: 자주 쓰는 값은 칩으로 고르고, 그 밖의 값은 직접 입력
export default function MinutesSheet({ open, title, description, presets, value, min, max, onClose, onConfirm }) {
  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      {open && (
        <MinutesForm description={description} presets={presets} value={value} min={min} max={max} onConfirm={onConfirm} />
      )}
    </BottomSheet>
  )
}

function MinutesForm({ description, presets, value, min, max, onConfirm }) {
  const [draft, setDraft] = useState(String(value))
  const minutes = Number.parseInt(draft, 10)
  const valid = !Number.isNaN(minutes) && minutes >= min && minutes <= max
  const error = draft !== '' && !valid ? `${min}분에서 ${max}분 사이로 입력해 주세요.` : ''

  return (
    <>
      {description ? (
        <AppText variant="bodyS" color="secondary">
          {description}
        </AppText>
      ) : null}
      <ChipRow fill>
        {presets.map((p) => (
          <Chip key={p} selected={minutes === p} onPress={() => setDraft(String(p))}>
            {p}분
          </Chip>
        ))}
      </ChipRow>
      <AppText variant="bodySMedium" color="secondary">
        직접 입력
      </AppText>
      <NumberBox
        size="l"
        value={draft}
        onChangeText={setDraft}
        error={!!error}
        style={styles.input}
        accessibilityLabel="직접 입력(분)"
        onSubmitEditing={() => {
          if (valid) onConfirm(minutes)
        }}
      />
      <AppText variant="caption" color={error ? 'danger' : 'tertiary'}>
        {error || `${min}~${max}분까지 입력할 수 있어요.`}
      </AppText>
      <Button disabled={!valid} onPress={() => onConfirm(minutes)}>
        확인
      </Button>
    </>
  )
}

const styles = StyleSheet.create({
  // 시트 본문은 세로 배치라 flex: 1 대신 고정 높이로 둔다
  input: { flex: 0 },
})
