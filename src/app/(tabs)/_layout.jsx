import { Tabs } from 'expo-router'
import { AlarmClock, Ellipsis, House, Route } from 'lucide-react-native'
import { colors, typography } from '../../theme/tokens'

// 피그마 BottomNav: 홈 · 알람 · 경로 · 더보기 (웹 components/layout.jsx 의 BottomNav)
const TABS = [
  { name: 'home', title: '홈', Icon: House },
  { name: 'alarm', title: '알람', Icon: AlarmClock },
  { name: 'route', title: '경로', Icon: Route },
  { name: 'more', title: '더보기', Icon: Ellipsis },
]

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.iconBrand,
        tabBarInactiveTintColor: colors.iconDefault,
        tabBarLabelStyle: typography.labelNav,
        tabBarStyle: { backgroundColor: colors.bgSurface, borderTopColor: colors.borderDefault },
      }}
    >
      {TABS.map(({ name, title, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, tabBarIcon: ({ color }) => <Icon size={24} color={color} /> }}
        />
      ))}
    </Tabs>
  )
}
