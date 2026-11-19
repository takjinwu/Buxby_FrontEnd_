import Placeholder from '../components/Placeholder'

// 웹 pages/auth/StartPage.jsx
export default function StartScreen() {
  return (
    <Placeholder
      title="시작"
      source="pages/auth/StartPage.jsx"
      links={[
        { label: '로그인', href: '/login' },
        { label: '회원가입', href: '/signup' },
        { label: '화면 목록 (검수용)', href: '/screens' },
      ]}
    />
  )
}
