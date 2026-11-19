import Placeholder from '../../components/Placeholder'

// 웹 pages/home/HomePage.jsx
export default function HomeScreen() {
  return (
    <Placeholder
      title="홈"
      source="pages/home/HomePage.jsx"
      showBack={false}
      links={[
        { label: '목적지 검색', href: '/schedule/destination' },
        { label: '출발지 선택', href: '/schedule/origin' },
        { label: '노선 선택', href: '/schedule/route' },
        { label: '알람 설정', href: '/alarm/settings' },
        { label: '기상 알람', href: '/alarm/wake' },
      ]}
    />
  )
}
