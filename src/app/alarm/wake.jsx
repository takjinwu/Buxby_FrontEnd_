import Placeholder from '../../components/Placeholder'

// 웹 pages/alarm/WakeAlarmPage.jsx
export default function AlarmWakeScreen() {
  return (
    <Placeholder
      title="기상 알람"
      source="pages/alarm/WakeAlarmPage.jsx"
      links={[
        { label: '출발 알람', href: '/alarm/depart' },
        { label: '알람 미룸', href: '/alarm/postponed' },
        { label: '홈', href: '/home' },
      ]}
    />
  )
}
