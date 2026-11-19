import { useEffect, useState } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import { RefreshCw } from 'lucide-react-native'
import AppText from './AppText'
import { colors } from '../theme/tokens'

// 계속 도는 아이콘 (웹 .spin). spinning이 false면 멈춘 채로 그린다
export function Spin({ spinning = true, children }) {
  const [turn] = useState(() => new Animated.Value(0))

  useEffect(() => {
    if (!spinning) {
      turn.stopAnimation()
      turn.setValue(0)
      return undefined
    }
    const loop = Animated.loop(
      Animated.timing(turn, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
    )
    loop.start()
    return () => loop.stop()
  }, [spinning, turn])

  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  return <Animated.View style={{ transform: [{ rotate }] }}>{children}</Animated.View>
}

// 불러오는 동안 보이는 회색 상자 (웹 .skeleton). 1.2초 주기로 깜빡인다
export function Skeleton({ width = '100%', height = 16, radius = 6, color = colors.bgSubtle, style }) {
  const [pulse] = useState(() => new Animated.Value(1))

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.55, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius: radius, backgroundColor: color, opacity: pulse }, style]}
    />
  )
}

// 도는 아이콘 + 안내 문구 한 줄 (웹 .loading-line)
export function LoadingLine({ children }) {
  return (
    <View style={styles.line} accessibilityRole="progressbar" accessibilityLiveRegion="polite">
      <Spin>
        <RefreshCw size={18} color={colors.iconBrand} />
      </Spin>
      <AppText variant="bodyS" color="secondary">
        {children}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  base: { flexShrink: 0 },
  line: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 8 },
})
