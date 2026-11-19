import { Redirect } from 'expo-router'

// 없는 경로는 시작 화면으로 (웹 App.jsx 의 <Route path="*" element={<Navigate to="/" replace />} />)
export default function NotFound() {
  return <Redirect href="/" />
}
