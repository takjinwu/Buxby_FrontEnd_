import { useCallback, useEffect, useState } from 'react'
import { AppState, Linking } from 'react-native'
import * as Location from 'expo-location'
import { Content, Screen, TopBar } from '../../components/layout'
import { Card, Divider, Notice, SectionLabel, SettingRow, Toast } from '../../components/display'
import { useAppState } from '../../store/context'
import { useToast } from '../../lib/useToast'

// 위치 권한 상태 → 표시 문구 (웹은 "앱 사용 중" 고정)
const LOCATION_LABEL = { granted: '앱 사용 중', denied: '허용 안 함', undetermined: '묻기 전' }

// E3 권한·알림 설정 — 웹 pages/more/PermissionSettingsPage.jsx
export default function PermissionSettingsScreen() {
  const { state, setSetting } = useAppState()
  const [toast, showToast] = useToast()
  const [locationStatus, setLocationStatus] = useState(null)

  const readLocation = useCallback(() => {
    Location.getForegroundPermissionsAsync()
      .then(({ status }) => setLocationStatus(status))
      .catch(() => setLocationStatus(null))
  }, [])

  // 시스템 설정에서 권한을 바꾸고 돌아오면 다시 읽는다
  useEffect(() => {
    readLocation()
    const sub = AppState.addEventListener('change', (s) => s === 'active' && readLocation())
    return () => sub.remove()
  }, [readLocation])

  // 웹은 "브라우저 설정에서 바꾸세요" 안내만 했다 → 앱은 시스템 설정의 앱 권한 화면을 연다
  const openSettings = () => Linking.openSettings().catch(() => showToast('설정 앱을 열지 못했어요.'))

  // TODO(6단계): expo-notifications로 알림 권한을 요청하고 상태(허용됨·차단됨·묻기 전)를 보여준다
  const toggleNotifications = (value) => setSetting('notifications', value)

  return (
    <Screen>
      <TopBar title="권한·알림 설정" />
      <Content gap={12}>
        <SectionLabel>권한</SectionLabel>
        <Card>
          <SettingRow
            title="위치 접근"
            description="출발 감지·경로 계산에만 사용해요"
            value={LOCATION_LABEL[locationStatus] ?? '확인 중'}
            onPress={openSettings}
          />
          <Divider />
          <SettingRow
            title="알림"
            description="기상·출발·지연 알림을 받아요"
            checked={state.settings.notifications}
            onToggle={toggleNotifications}
          />
          <Divider />
          <SettingRow
            title="정확한 시각 알람"
            description="버스 상황에 맞춰 알람 시각을 다시 맞춰요"
            checked={state.settings.exactAlarm}
            onToggle={(v) => setSetting('exactAlarm', v)}
          />
        </Card>
        <SectionLabel>개인정보</SectionLabel>
        <Card>
          <SettingRow
            title="위치정보 이용 동의 내역"
            value="보기"
            onPress={() => showToast('동의 내역 화면은 준비 중이에요.')}
          />
          <Divider />
          <SettingRow
            title="위치 기록 삭제"
            description="기기와 서버의 출발 기록을 지워요"
            value="삭제"
            onPress={() => showToast('출발 기록 삭제는 백엔드 연동 후 동작해요.')}
          />
        </Card>
        <Notice>앱을 닫아 두어도 알람이 울리도록 알림 기능을 연결하는 중이에요.</Notice>
      </Content>
      <Toast message={toast} />
    </Screen>
  )
}
