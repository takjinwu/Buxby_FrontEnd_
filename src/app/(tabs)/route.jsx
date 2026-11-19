import Placeholder from '../../components/Placeholder'

// 웹 pages/route/RecommendRoutePage.jsx
export default function RouteScreen() {
  return (
    <Placeholder
      title="추천 경로"
      source="pages/route/RecommendRoutePage.jsx"
      showBack={false}
      links={[
        { label: '경로 상세', href: '/route/detail' },
        { label: '지연 안내', href: '/route/delay' },
      ]}
    />
  )
}
