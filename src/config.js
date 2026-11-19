// 앱 설정값. EXPO_PUBLIC_ 로 시작하는 환경 변수는 빌드할 때 코드에 들어간다 (.env.example 참고).
// 앱에는 웹의 Vite 프록시·vercel.json 같은 중계가 없어서 백엔드 주소를 직접 적는다.

const DEFAULT_API_URL = 'https://buxby-backend.onrender.com'

// 끝의 / 는 지워서 `${API_URL}/api/...` 로 이어 붙인다
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

// 카카오 지도 JavaScript 키 (REST 키 아님). 비우면 지도 자리에 미리보기 그림이 나온다
export const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY || ''

// 웹 서비스 주소. 두 군데에 쓴다
// - 카카오 지도: JS 키는 카카오 개발자 콘솔에 등록한 도메인에서만 동작해서, WebView 페이지를 이 주소에서 연 것처럼 띄운다
// - 간편 로그인: 웹과 같은 주소(Vercel 프록시)에서 시작해야 소셜 로그인 콜백 주소·세션이 맞는다
const DEFAULT_WEB_URL = 'https://buxby.vercel.app'
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || DEFAULT_WEB_URL).replace(/\/+$/, '')

// 개발 중 true면 로그인 버튼이 백엔드 확인 없이 다음 화면으로 이동
export const SKIP_LOGIN = __DEV__ && process.env.EXPO_PUBLIC_SKIP_LOGIN === 'true'
