import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Lock, Route } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Screen } from '../../components/layout'
import { NotificationCard } from '../../components/display'
import { ALARM, DELAY } from '../../data/mock'
import { colors } from '../../theme/tokens'

// D7 알람 자동 연기 · 푸시 알림 (잠금화면 예시) — 웹 pages/alarm/PostponedPage.jsx
export default function PostponedScreen() {
  return (
    <Screen bg="alarm">
      <Content gap={8} style={styles.content}>
        <Lock size={22} color={colors.iconInverse} />
        <AppText variant="displayTime">{ALARM.postponedNow}</AppText>
        <AppText variant="bodyL">{ALARM.date}</AppText>
        <View style={styles.stack}>
          <NotificationCard
            title={`알람이 ${ALARM.postponedTo}으로 미뤄졌어요`}
            body={`160번이 ${DELAY.minutes}분 늦게 와요. ${DELAY.minutes}분 더 주무셔도 돼요. (미루기 상한 ${ALARM.snoozeLimit})`}
            onPress={() => router.push('/route/delay')}
          />
          <NotificationCard
            icon={Route}
            title="다른 방법도 있어요"
            body="503번(7:36)을 타면 비슷하게 도착해요. 눌러서 대안 경로 보기"
            onPress={() => router.push('/route/delay')}
          />
        </View>
      </Content>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingTop: 24, paddingBottom: 24, paddingHorizontal: 16 },
  stack: { gap: 8, width: '100%', paddingTop: 24 },
})
