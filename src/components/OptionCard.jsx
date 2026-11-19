import { Pressable, StyleSheet } from 'react-native'
import { colors, radius, shadows } from '../theme/tokens'

// 고를 수 있는 경로 카드 (웹 .option-card). 고르면 파란 테두리 — B7 노선 선택 · C3 다른 경로
export default function OptionCard({ selected, onPress, style, children }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.card, selected && styles.cardOn, style]}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.bgSurface,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.lg,
    ...shadows.card,
  },
  cardOn: { borderColor: colors.borderBrand },
})
