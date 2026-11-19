import Placeholder from '../components/Placeholder'

// 웹 pages/auth/LoginPage.jsx
export default function LoginScreen() {
  return (
    <Placeholder
      title="로그인"
      source="pages/auth/LoginPage.jsx"
      links={[
        { label: '회원가입', href: '/signup' },
        { label: '권한 안내', href: '/permissions' },
        { label: '홈', href: '/home' },
      ]}
    />
  )
}
