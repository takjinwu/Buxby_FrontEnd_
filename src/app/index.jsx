import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { BusFront, Sparkle, Timer } from 'lucide-react-native'
import AppText from '../components/AppText'
import { Content, Footer, Screen } from '../components/layout'
import { Button } from '../components/controls'
import { IconTile, IllustrationSlot } from '../components/display'
import TextLink from '../components/TextLink'

const VALUES = [
  { icon: Sparkle, text: 'AI가 나의 평균 준비 시간을 학습해요' },
  { icon: BusFront, text: '버스가 늦으면 알람도 자동으로 미뤄져요' },
  { icon: Timer, text: '최소·최대 소요 시간을 함께 알려줘요' },
]

// A1 시작 화면 — 웹 pages/auth/StartPage.jsx
export default function StartScreen() {
  return (
    <Screen bg="surface">
      <Content gap={12} style={styles.content}>
        <IllustrationSlot height={260} label="일러스트 자리 · 침대에서 일어나는 사람 (보완 요청)" />
        <AppText variant="titleS" color="brand" style={styles.brand}>
          버스비
        </AppText>
        <AppText variant="displayL" accessibilityRole="header">
          {'버스에 맞춰 깨우는\nAI 기상 알람'}
        </AppText>
        <AppText variant="bodyL" color="secondary">
          {'정류장에서 기다리는 시간을 줄이고,\n여유롭게 준비하는 시간을 돌려드려요.'}
        </AppText>
        <View style={styles.values}>
          {VALUES.map(({ icon, text }) => (
            <View key={text} style={styles.value}>
              <IconTile icon={icon} size={32} iconSize={18} />
              <AppText variant="bodyMMedium" style={styles.shrink}>
                {text}
              </AppText>
            </View>
          ))}
        </View>
      </Content>
      <Footer>
        <Button onPress={() => router.push('/signup')}>시작하기</Button>
        <TextLink prompt="이미 계정이 있나요?" label="로그인" onPress={() => router.push('/login')} />
        {/* 앱에는 주소창이 없어서 개발 빌드에서만 검수용 화면 목록으로 가는 길을 둔다 */}
        {__DEV__ && <TextLink prompt="개발용" label="화면 목록" onPress={() => router.push('/screens')} />}
      </Footer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  content: { paddingTop: 24 },
  brand: { marginTop: 12 },
  values: { gap: 12, paddingTop: 8 },
  value: { flexDirection: 'row', alignItems: 'center', gap: 12 },
})
