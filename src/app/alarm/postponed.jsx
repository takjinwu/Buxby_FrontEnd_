import Placeholder from '../../components/Placeholder'

// 웹 pages/alarm/PostponedPage.jsx
export default function AlarmPostponedScreen() {
  return (
    <Placeholder
      title="알람 미룸"
      source="pages/alarm/PostponedPage.jsx"
      links={[
        { label: '지연 안내', href: '/route/delay' },
      ]}
    />
  )
}
