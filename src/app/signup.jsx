import Placeholder from '../components/Placeholder'

// 웹 pages/auth/SignupPage.jsx
export default function SignupScreen() {
  return (
    <Placeholder
      title="회원가입"
      source="pages/auth/SignupPage.jsx"
      links={[
        { label: '로그인', href: '/login' },
        { label: '권한 안내', href: '/permissions' },
      ]}
    />
  )
}
