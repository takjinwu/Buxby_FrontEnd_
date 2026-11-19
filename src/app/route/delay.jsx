import { useState } from 'react'
import { Linking, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { BottomSheet, Content, Screen, TopBar } from '../../components/layout'
import { Button, Chip, ChipRow } from '../../components/controls'
import { AlertBanner, BusRow, Card, Notice, Toast } from '../../components/display'
import { DELAY, DRT_INFO } from '../../data/mock'
import { useToast } from '../../lib/useToast'
import { colors, radius } from '../../theme/tokens'

const TABS = [
  { id: 'next', label: '다음 버스' },
  { id: 'other', label: '다른 노선' },
  { id: 'drt', label: 'DRT' },
]

// D8 버스 지연 안내 · D9 DRT 안내 시트 — 웹 pages/route/DelayPage.jsx
export default function DelayScreen() {
  const [tab, setTab] = useState('next')
  const [drtOpen, setDrtOpen] = useState(false)
  const [toast, showToast] = useToast()

  const openOperator = () => {
    if (DRT_INFO.operatorUrl) {
      Linking.openURL(DRT_INFO.operatorUrl).catch(() => showToast('운영사 앱을 열지 못했어요.'))
    } else showToast('운영사 앱 연결 주소는 확인 후 연결돼요.')
  }

  return (
    <Screen>
      <TopBar title="버스 지연 안내" />
      <Content gap={12} style={styles.content}>
        <AlertBanner tone="danger" title="버스가 지연되고 있어요">
          현재 약 {DELAY.minutes}분 지연 예상입니다.
        </AlertBanner>
        <Card padded>
          <AppText variant="bodySMedium" color="secondary">
            변경된 도착 예상 시간
          </AppText>
          <View style={styles.changed}>
            <AppText variant="titleM" color="tertiary" style={styles.strike}>
              {DELAY.before}
            </AppText>
            <ArrowRight size={20} color={colors.iconStrong} />
            <AppText variant="titleL" color="danger">
              {DELAY.after}
            </AppText>
          </View>
        </Card>
        <AlertBanner tone="info">
          {`알람이 자동으로 ${DELAY.minutes}분 미뤄졌어요.\n다른 방법으로도 갈 수 있어요.`}
        </AlertBanner>
        <AppText variant="titleS" accessibilityRole="header">
          대안 경로
        </AppText>
        <ChipRow fill>
          {TABS.map((t) => (
            <Chip key={t.id} selected={tab === t.id} onPress={() => setTab(t.id)}>
              {t.label}
            </Chip>
          ))}
        </ChipRow>
        {DELAY.alternatives.map((a) => (
          <View key={a.group} style={tab === a.group && styles.focusRing}>
            <BusRow
              type={a.type}
              route={a.route}
              tag={a.tag}
              sub={a.sub}
              onPress={() => (a.type === 'drt' ? setDrtOpen(true) : router.push('/route/detail'))}
            />
          </View>
        ))}
      </Content>

      <BottomSheet open={drtOpen} title="똑버스(DRT) 안내" onClose={() => setDrtOpen(false)}>
        <AppText variant="bodyM" color="secondary">
          버스를 놓쳤을 때 이 지역에서 탈 수 있는 수요응답형 버스예요.
        </AppText>
        <View style={styles.table}>
          {DRT_INFO.rows.map(([k, v]) => (
            <View key={k} style={styles.tableRow}>
              <AppText variant="bodyS" color="secondary" style={styles.tableKey}>
                {k}
              </AppText>
              <AppText variant="bodySMedium" style={styles.tableValue}>
                {v}
              </AppText>
            </View>
          ))}
        </View>
        <Notice>버스비는 운행 지역과 시간만 안내해요. 실시간 위치·호출은 운영사 앱에서 진행돼요.</Notice>
        <Button onPress={openOperator}>똑타 앱 열기</Button>
      </BottomSheet>
      <Toast message={toast} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingTop: 4, paddingBottom: 12 },
  changed: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  strike: { textDecorationLine: 'line-through' },
  // 웹 box-shadow: 0 0 0 2px (바깥 테두리) → 2px 테두리를 두르고 그만큼 바깥으로 넓힌다
  focusRing: { margin: -2, borderWidth: 2, borderColor: colors.borderBrand, borderRadius: radius.lg + 2 },
  table: { borderRadius: radius.lg, backgroundColor: colors.bgCanvas },
  tableRow: { flexDirection: 'row', gap: 16, paddingVertical: 14, paddingHorizontal: 16 },
  tableKey: { flexShrink: 0, width: 64 },
  tableValue: { flex: 1 },
})
