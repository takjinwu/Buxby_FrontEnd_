import { Pressable, StyleSheet, View } from 'react-native'
import { Ban, Check } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Footer, Screen, TopBar } from '../../components/layout'
import { Button } from '../../components/controls'
import { IconTile, Notice, Toast } from '../../components/display'
import { useToast } from '../../lib/useToast'
import { colors, radius } from '../../theme/tokens'

const PLANS = [
  { name: '무료', lines: ['AI 기상·출발 알람', '최소·최대 소요 시간', '홈·경로 화면 하단 광고'], on: false },
  { name: '광고 제거', lines: ['AI 기상·출발 알람', '최소·최대 소요 시간', '광고 없음'], on: true },
]

// E2 광고 제거 (₩3,900 일회성 결제) — 결제 연동 전 — 웹 pages/more/AdFreePage.jsx
export default function AdFreeScreen() {
  const [toast, showToast] = useToast()
  return (
    <Screen bg="surface">
      <TopBar title="광고 제거" />
      <Content gap={16} style={styles.content}>
        <IconTile icon={Ban} size={64} iconSize={32} />
        <AppText variant="displayL" accessibilityRole="header">
          {'광고 없이\n버스비 쓰기'}
        </AppText>
        <AppText variant="bodyM" color="secondary">
          ₩3,900을 한 번만 결제하면 계속 광고 없이 써요. 기능은 무료와 똑같아요.
        </AppText>
        <View style={styles.twoCol}>
          {PLANS.map((p) => (
            <View key={p.name} style={[styles.plan, p.on && styles.planOn]}>
              <AppText variant="bodyLBold" color={p.on ? 'brand' : 'primary'}>
                {p.name}
              </AppText>
              {p.lines.map((l) => (
                <View key={l} style={styles.planLine}>
                  <View style={styles.planIcon}>
                    <Check size={16} color={p.on ? colors.iconBrand : colors.iconDefault} />
                  </View>
                  <AppText variant="bodyS" style={styles.shrink}>
                    {l}
                  </AppText>
                </View>
              ))}
            </View>
          ))}
        </View>
        <Notice tone="neutral" center>
          알람이 울리는 화면에는 무료 이용자에게도 광고를 넣지 않아요.
        </Notice>
      </Content>
      <Footer>
        <Button onPress={() => showToast('결제 기능은 준비 중이에요.')}>₩3,900 결제하기</Button>
        <Pressable onPress={() => showToast('구매 내역이 없어요.')} accessibilityRole="button" style={styles.restore}>
          <AppText variant="bodySMedium" color="secondary">
            구매 내역 복원
          </AppText>
        </Pressable>
      </Footer>
      <Toast message={toast} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  content: { paddingTop: 16 },
  twoCol: { flexDirection: 'row', gap: 12, width: '100%' },
  plan: { flex: 1, gap: 10, padding: 16, borderRadius: radius.lg, backgroundColor: colors.bgCanvas },
  planOn: { backgroundColor: colors.bgBrandSubtle },
  planLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  planIcon: { marginTop: 2 },
  restore: { alignSelf: 'center', paddingVertical: 4 },
})
