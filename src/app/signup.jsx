import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import AppText from '../components/AppText'
import { Content, Footer, Screen, TopBar } from '../components/layout'
import { Button, Checkbox, InputField } from '../components/controls'
import { signup } from '../api/auth'
import { colors, radius } from '../theme/tokens'

const AGREEMENTS = [
  { id: 'terms', required: true, label: '서비스 이용약관 동의' },
  { id: 'location', required: true, label: '위치기반서비스 이용약관 동의' },
  { id: 'marketing', required: false, label: '버스 지연·이벤트 알림 수신' },
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// A4 회원가입 (백엔드 제약: 닉네임 30자, 비밀번호 8~64자) — 웹 pages/auth/SignupPage.jsx
export default function SignupScreen() {
  const [form, setForm] = useState({ nickname: '', email: '', password: '' })
  const [agreed, setAgreed] = useState({ terms: false, location: false, marketing: false })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (text) => setForm((f) => ({ ...f, [key]: text }))
  const allAgreed = AGREEMENTS.every((a) => agreed[a.id])
  const requiredAgreed = AGREEMENTS.filter((a) => a.required).every((a) => agreed[a.id])
  const filled = form.nickname.trim() && form.email.trim() && form.password

  const validate = () => {
    const next = {}
    if (form.nickname.trim().length > 30) next.nickname = '닉네임은 30자까지 쓸 수 있어요.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = '이메일 형식을 확인해 주세요.'
    if (form.password.length < 8 || form.password.length > 64) next.password = '비밀번호는 8~64자로 입력해 주세요.'
    return next
  }

  const handleSubmit = async () => {
    if (!filled || !requiredAgreed || submitting) return
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    try {
      await signup({ nickname: form.nickname.trim(), email: form.email.trim(), password: form.password })
      router.replace({ pathname: '/login', params: { message: '회원가입이 완료되었어요. 로그인해 주세요.' } })
    } catch (err) {
      const message = err.message || '회원가입에 실패했어요.'
      setErrors(message.includes('이메일') ? { email: message } : { form: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen bg="surface">
      <TopBar title="회원가입" />
      <Content gap={16}>
        <InputField
          label="닉네임"
          placeholder="닉네임을 입력하세요"
          maxLength={30}
          value={form.nickname}
          onChangeText={set('nickname')}
          helper="최대 30자"
          error={errors.nickname}
        />
        <InputField
          label="이메일"
          type="email"
          autoComplete="email"
          textContentType="emailAddress"
          placeholder="이메일을 입력하세요"
          value={form.email}
          onChangeText={set('email')}
          error={errors.email}
        />
        <InputField
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          textContentType="newPassword"
          placeholder="비밀번호를 입력하세요"
          maxLength={64}
          value={form.password}
          onChangeText={set('password')}
          helper="8~64자로 입력해 주세요"
          error={errors.password}
        />
        <View style={styles.agreements}>
          <View style={styles.row}>
            <Checkbox
              checked={allAgreed}
              label="전체 동의"
              onChange={(v) => setAgreed({ terms: v, location: v, marketing: v })}
            />
            <AppText variant="bodyLBold">전체 동의</AppText>
          </View>
          {AGREEMENTS.map((a) => (
            <View key={a.id} style={styles.row}>
              <Checkbox
                checked={agreed[a.id]}
                label={a.label}
                onChange={(v) => setAgreed((s) => ({ ...s, [a.id]: v }))}
              />
              <AppText variant="bodyS" style={styles.label}>
                <AppText variant="bodySMedium" color={a.required ? 'brand' : 'secondary'}>
                  [{a.required ? '필수' : '선택'}]
                </AppText>{' '}
                {a.label}
              </AppText>
              <ChevronRight size={16} color={colors.iconDefault} />
            </View>
          ))}
        </View>
        <AppText variant="caption" color="tertiary">
          위치정보는 출발 감지와 경로 계산에만 사용해요. (위치정보법에 따른 위치기반서비스 신고 예정)
        </AppText>
        {errors.form ? (
          <AppText variant="caption" color="danger">
            {errors.form}
          </AppText>
        ) : null}
      </Content>
      <Footer>
        <Button disabled={!filled || !requiredAgreed || submitting} onPress={handleSubmit}>
          {submitting ? '가입 중…' : '가입하기'}
        </Button>
      </Footer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  agreements: { gap: 12, padding: 16, borderRadius: radius.lg, backgroundColor: colors.bgCanvas },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { flex: 1 },
})
