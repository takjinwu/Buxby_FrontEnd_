import Placeholder from '../../components/Placeholder'

// 웹 pages/route/RouteDetailPage.jsx
export default function RouteDetailScreen() {
  return (
    <Placeholder
      title="경로 상세"
      source="pages/route/RouteDetailPage.jsx"
      links={[
        { label: '다른 경로 보기', href: '/route/options' },
      ]}
    />
  )
}
