import Placeholder from '../../components/Placeholder'

// 웹 pages/alarm/PrepLearningPage.jsx
export default function AlarmScreen() {
  return (
    <Placeholder
      title="준비 시간 학습"
      source="pages/alarm/PrepLearningPage.jsx"
      showBack={false}
      links={[
        { label: '준비 항목 편집', href: '/alarm/prep' },
        { label: '알람 설정', href: '/alarm/settings' },
      ]}
    />
  )
}
