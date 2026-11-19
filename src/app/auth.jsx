import { useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Content, Screen } from '../components/layout'
import { LoadingLine } from '../components/Spinner'
import { completeSocialLogin } from '../api/auth'
import { useAppState } from '../store/context'

// 간편 로그인이 끝나고 돌아오는 앱 주소 (buxby://auth?socialLogin=success&code=...) — 웹 App.jsx의 SocialLoginRedirect
// 보통은 로그인 화면이 로그인 창의 결과를 받아 처리하지만, 안드로이드는 이 주소로 앱이 열리기도 해서 여기서도 처리한다.
// 같은 코드는 한 번만 교환한다 (api/auth.js)
export default function SocialLoginReturnScreen() {
  const { socialLogin, code } = useLocalSearchParams()
  const { state } = useAppState()
  const next = state.permissionsDone ? '/home' : '/permissions'

  useEffect(() => {
    let cancelled = false
    completeSocialLogin({ socialLogin, code })
      .then(() => !cancelled && router.replace(next))
      .catch((err) => !cancelled && router.replace({ pathname: '/login', params: { error: err.message } }))
    return () => {
      cancelled = true
    }
    // 처음 들어왔을 때 한 번만 처리한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Screen bg="surface">
      <Content style={{ justifyContent: 'center' }}>
        <LoadingLine>로그인하는 중이에요</LoadingLine>
      </Content>
    </Screen>
  )
}
