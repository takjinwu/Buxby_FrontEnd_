import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { Bell, MapPin, ShieldCheck } from 'lucide-react-native'
import AppText from '../components/AppText'
import { Content, Footer, Screen } from '../components/layout'
import { Button } from '../components/controls'
import { Card, IconTile } from '../components/display'
import { useAppState } from '../store/context'

const PERMS = [
  { icon: MapPin, title: '위치 (필수)', desc: '출발 감지와 경로 계산에만 써요. 가능한 부분은 기기 안에서 처리해요.' },
  { icon: Bell, title: '알림 (필수)', desc: '기상 알람·출발 알림·버스 지연 알림을 보내요.' },
  { icon: ShieldCheck, title: '안전 알람', desc: '통신이 끊겨도 정해 둔 시각에는 반드시 울려요.' },
]

// A5 위치·알림 권한 안내 — 웹 pages/auth/PermissionPage.jsx
export default function PermissionScreen() {
  const { update } = useAppState()
  const [busy, setBusy] = useState(false)

  // 웹처럼 거절해도 다음 화면으로 넘어간다 (권한은 더보기 › 권한·알림 설정에서 다시 켤 수 있다)
  const allow = async () => {
    setBusy(true)
    try {
      await Location.requestForegroundPermissionsAsync().catch(() => {})
      // TODO(6단계): expo-notifications 알림 권한 요청 (웹 Notification.requestPermission)
    } finally {
      update({ permissionsDone: true })
      router.replace('/home')
    }
  }

  return (
    <Screen>
      <Content gap={16} style={styles.content}>
        <AppText variant="titleL" accessibilityRole="header">
          {'버스비를 쓰려면\n두 가지 권한이 필요해요'}
        </AppText>
        <AppText variant="bodyM" color="secondary">
          알람이 버스 시간에 맞춰 스스로 바뀌려면 위치와 알림이 필요해요.
        </AppText>
        {PERMS.map(({ icon, title, desc }) => (
          <Card key={title} style={styles.permCard}>
            <IconTile icon={icon} />
            <View style={styles.permText}>
              <AppText variant="bodyLBold">{title}</AppText>
              <AppText variant="bodyS" color="secondary">
                {desc}
              </AppText>
            </View>
          </Card>
        ))}
      </Content>
      <Footer>
        <AppText variant="caption" color="tertiary">
          더보기 › 권한·알림 설정에서 언제든 바꿀 수 있어요.
        </AppText>
        <Button onPress={allow} disabled={busy}>
          {busy ? '권한 요청 중…' : '허용하고 시작하기'}
        </Button>
      </Footer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingTop: 32 },
  permCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 20 },
  permText: { flex: 1, gap: 4 },
})
