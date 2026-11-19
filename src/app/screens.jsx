import Placeholder from '../components/Placeholder'

// 웹 pages/ScreensPage.jsx — 모든 화면으로 바로 가는 검수용 목록
const SCREENS = [
  { label: '공통 컴포넌트 검수', href: '/gallery' },
  { label: '시작', href: '/' },
  { label: '로그인', href: '/login' },
  { label: '회원가입', href: '/signup' },
  { label: '권한 안내', href: '/permissions' },
  { label: '홈', href: '/home' },
  { label: '목적지 검색', href: '/schedule/destination' },
  { label: '출발지 선택', href: '/schedule/origin' },
  { label: '노선 선택', href: '/schedule/route' },
  { label: '추천 경로', href: '/route' },
  { label: '경로 상세', href: '/route/detail' },
  { label: '다른 경로', href: '/route/options' },
  { label: '지연 안내', href: '/route/delay' },
  { label: '준비 시간 학습', href: '/alarm' },
  { label: '준비 항목 편집', href: '/alarm/prep' },
  { label: '알람 설정', href: '/alarm/settings' },
  { label: '기상 알람', href: '/alarm/wake' },
  { label: '출발 알람', href: '/alarm/depart' },
  { label: '알람 미룸', href: '/alarm/postponed' },
  { label: '더보기', href: '/more' },
  { label: '광고 제거', href: '/more/ad-free' },
  { label: '권한 설정', href: '/more/permissions' },
]

export default function ScreensScreen() {
  return <Placeholder title="화면 목록" source="pages/ScreensPage.jsx" links={SCREENS} />
}
