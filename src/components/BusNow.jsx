import { Pressable, StyleSheet, View } from 'react-native'
import { BusFront } from 'lucide-react-native'
import AppText from './AppText'
import { IconTile } from './display'
import { RECOMMEND, URGENT_MINUTES } from '../data/mock'

// 지금 탈 버스 한 줄 (웹 RecommendRoutePage의 BusNow)
// 버스 도착까지 URGENT_MINUTES(5분) 이하면 도착 시간을 빨간색으로 표시 (C6)
export default function BusNow({ data = RECOMMEND, sub = data.sub, atSuffix = '', onPress }) {
  const hasTime = data.arrivesIn != null
  const urgent = hasTime ? data.arrivesIn <= URGENT_MINUTES : data.arrivalText === '곧 도착'
  const when = hasTime ? `${data.arrivesIn}분 후` : data.arrivalText
  const body = (
    <>
      <IconTile icon={BusFront} />
      <View style={styles.text}>
        <AppText variant="titleS">{data.bus}번</AppText>
        <AppText variant="bodyS" color="secondary">
          {sub}
        </AppText>
      </View>
      <View style={styles.right}>
        <AppText
          variant="titleS"
          color={urgent ? 'danger' : 'brand'}
          accessibilityLabel={urgent && hasTime ? `곧 도착, ${when}` : undefined}
        >
          {when}
        </AppText>
        {hasTime && (
          <AppText variant="caption" color={urgent ? 'danger' : 'secondary'}>
            ({data.arrivesAt}
            {atSuffix})
          </AppText>
        )}
      </View>
    </>
  )
  if (!onPress) return <View style={styles.row}>{body}</View>
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
})
