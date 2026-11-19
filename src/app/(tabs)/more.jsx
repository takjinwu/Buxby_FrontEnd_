import Placeholder from '../../components/Placeholder'

// 웹 pages/more/MorePage.jsx
export default function MoreScreen() {
  return (
    <Placeholder
      title="더보기"
      source="pages/more/MorePage.jsx"
      showBack={false}
      links={[
        { label: '광고 제거', href: '/more/ad-free' },
        { label: '권한 설정', href: '/more/permissions' },
        { label: '로그인', href: '/login' },
        { label: '화면 목록 (검수용)', href: '/screens' },
      ]}
    />
  )
}
