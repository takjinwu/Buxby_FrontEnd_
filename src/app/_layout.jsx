import { useCallback } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppStateProvider } from '../store/AppStateProvider'
import { colors } from '../theme/tokens'

// 저장된 상태(AsyncStorage)를 다 읽을 때까지 스플래시 화면을 유지한다
SplashScreen.preventAutoHideAsync()

// TODO(5단계): 간편 로그인 딥링크(buxby://...?socialLogin=success|failed) 처리 — 웹 App.jsx의 SocialLoginRedirect
// TODO(6단계): 알람 감시·알림 예약 — 웹 components/AlarmWatcher.jsx
export default function RootLayout() {
  const hideSplash = useCallback(() => SplashScreen.hide(), [])

  return (
    <SafeAreaProvider>
      <AppStateProvider onHydrated={hideSplash}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgCanvas } }}>
          {/* 알람이 울리는 화면은 뒤로 스와이프로 닫히지 않게 한다 */}
          <Stack.Screen name="alarm/wake" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="alarm/depart" options={{ gestureEnabled: false, animation: 'fade' }} />
        </Stack>
      </AppStateProvider>
    </SafeAreaProvider>
  )
}
