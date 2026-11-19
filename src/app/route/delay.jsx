import Placeholder from '../../components/Placeholder'

// 웹 pages/route/DelayPage.jsx
export default function RouteDelayScreen() {
  return (
    <Placeholder
      title="지연 안내"
      source="pages/route/DelayPage.jsx"
      links={[
        { label: '경로 상세', href: '/route/detail' },
      ]}
    />
  )
}
