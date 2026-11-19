import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import AppText from '../components/AppText'
import { Content, Footer, Screen, TopBar } from '../components/layout'
import { Button, InputField, SocialLoginButton } from '../components/controls'
import { Notice, Toast } from '../components/display'
import TextLink from '../components/TextLink'
import { getMe, login, socialLogin } from '../api/auth'
import { SKIP_LOGIN } from '../config'
import { useToast } from '../lib/useToast'
import { useAppState } from '../store/context'
import { colors } from '../theme/tokens'

// A2 로그인 · A3 로그인 오류 — 웹 pages/auth/LoginPage.jsx
// 웹 location.state.message · error → ?message= · ?error= 파라미터
export default function LoginScreen() {
  const params = useLocalSearchParams()
  const { state } = useAppState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(typeof params.error === 'string' ? params.error : '')
  const [submitting, setSubmitting] = useState(false)
  const [toast, showToast] = useToast(2800)
  const notice = typeof params.message === 'string' ? params.message : ''

  const canSubmit = SKIP_LOGIN || (email.trim() && password && !submitting)
  const next = state.permissionsDone ? '/home' : '/permissions'

  const handleSubmit = async () => {
    if (!canSubmit) return
    if (SKIP_LOGIN) {
      router.replace(next)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await login({ email, password })
      const me = await getMe()
      if (!me) throw new Error('로그인 상태를 확인할 수 없습니다.')
      router.replace(next)
    } catch (err) {
      // 백엔드 메시지를 그대로 보여준다 (예: "이메일 또는 비밀번호가 올바르지 않습니다.")
      setError(err.message || '로그인에 실패했어요.')
      setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  // TODO(5단계): 시스템 브라우저 + buxby:// 딥링크. 지금은 api/auth.js가 "준비 중" 에러를 던진다
  const social = (provider) => socialLogin(provider).catch((err) => showToast(err.message))

  return (
    <Screen bg="surface">
      <TopBar title="" backTo="/" />
      <Content gap={16}>
        <View style={styles.heading}>
          <AppText variant="titleS" color="brand">
            버스비
          </AppText>
          <AppText variant="titleL" accessibilityRole="header">
            다시 만나서 반가워요
          </AppText>
        </View>
        {notice ? <Notice>{notice}</Notice> : null}
        <InputField
          label="이메일"
          type="email"
          autoComplete="email"
          textContentType="emailAddress"
          placeholder="이메일을 입력하세요"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
        />
        <InputField
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          textContentType="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          error={error}
          onChangeText={setPassword}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        <Button disabled={!canSubmit} onPress={handleSubmit}>
          {submitting ? '로그인 중…' : '로그인'}
        </Button>
        <View style={styles.or}>
          <View style={styles.orLine} />
          <AppText variant="caption" color="tertiary">
            또는 간편 로그인
          </AppText>
          <View style={styles.orLine} />
        </View>
        <SocialLoginButton provider="kakao" onPress={() => social('kakao')} />
        <SocialLoginButton provider="naver" onPress={() => social('naver')} />
        <SocialLoginButton provider="google" onPress={() => social('google')} />
      </Content>
      <Footer>
        <TextLink prompt="아직 계정이 없나요?" label="회원가입" onPress={() => router.push('/signup')} />
      </Footer>
      <Toast message={toast} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  heading: { gap: 8, paddingBottom: 8 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.borderDefault },
})
