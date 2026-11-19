// 앱 설정값. EXPO_PUBLIC_ 로 시작하는 환경 변수는 빌드할 때 코드에 들어간다 (.env.example 참고).
// 앱에는 웹의 Vite 프록시·vercel.json 같은 중계가 없어서 백엔드 주소를 직접 적는다.

const DEFAULT_API_URL = 'https://buxby-backend.onrender.com'

// 끝의 / 는 지워서 `${API_URL}/api/...` 로 이어 붙인다
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

// 카카오 지도 JavaScript 키 (4단계 지도 이식 때 사용)
export const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY || ''

// 개발 중 true면 로그인 버튼이 백엔드 확인 없이 다음 화면으로 이동
export const SKIP_LOGIN = __DEV__ && process.env.EXPO_PUBLIC_SKIP_LOGIN === 'true'
