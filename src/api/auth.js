import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { API_URL, WEB_URL } from '../config'

const AUTH_URL = `${API_URL}/api/auth`

// 서버 응답 처리 공통 함수
async function handleResponse(response) {
  const text = await response.text()

  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.message || `요청 실패 (${response.status})`)
  }

  return data
}

// 회원가입
export async function signup(userData) {
  const response = await fetch(`${AUTH_URL}/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })

  return handleResponse(response)
}

// 로그인
export async function login(userData) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })

  return handleResponse(response)
}

// 현재 로그인한 사용자 조회
export async function getMe() {
  const response = await fetch(`${AUTH_URL}/me`, {
    method: 'GET',
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  return handleResponse(response)
}

// 로그아웃
export async function logout() {
  const response = await fetch(`${AUTH_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`로그아웃 실패 (${response.status})`)
  }
}

const SOCIAL_PROVIDERS = ['kakao', 'google', 'naver']

export const SOCIAL_FAILED_MESSAGE = '간편 로그인에 실패했어요. 다시 시도해 주세요.'

// 일회용 코드 → 앱 세션. 같은 코드를 두 번 내지 않도록 진행 중인 요청을 함께 쓴다
// (안드로이드는 로그인 창이 결과를 돌려주면서 /auth 딥링크로도 들어올 수 있다)
const exchanges = new Map()

function exchangeCode(code) {
  if (!exchanges.has(code)) {
    const run = fetch(`${API_URL}/api/auth/app/exchange`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).then(handleResponse)
    exchanges.set(code, run)
  }
  return exchanges.get(code)
}

// 백엔드가 돌려보낸 앱 주소(buxby://auth?socialLogin=success&code=...)의 결과를 마무리한다
// - 성공: 앱 세션을 만들고 내 정보를 돌려준다
// - 실패: 에러를 던진다
export async function completeSocialLogin({ socialLogin: result, code }) {
  if (result !== 'success' || !code) throw new Error(SOCIAL_FAILED_MESSAGE)
  await exchangeCode(code)
  const me = await getMe()
  if (!me) throw new Error('로그인 상태를 확인할 수 없습니다.')
  return me
}

// 소셜 로그인 (웹은 window.location 으로 백엔드 OAuth 페이지로 이동)
// 앱은 시스템 브라우저(로그인 세션 창)로 열고, 끝나면 백엔드가 앱 주소로 일회용 코드를 붙여 돌려보낸다.
// Google은 앱 내부 WebView 로그인을 막기 때문에 WebView로 대신할 수 없다.
// 웹과 같은 주소(WEB_URL, Vercel 프록시)에서 시작해야 소셜 콜백 주소·브라우저 세션이 맞는다.
// 반환: 내 정보 (성공) · null (사용자가 창을 닫음)
export async function socialLogin(provider) {
  if (!SOCIAL_PROVIDERS.includes(provider)) {
    throw new Error('지원하지 않는 로그인 방식입니다.')
  }

  // 개발 빌드·설치 앱은 buxby://auth, Expo Go는 exp://.../--/auth
  const redirectUri = Linking.createURL('auth')
  const startUrl = `${WEB_URL}/api/auth/app/social/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`
  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri)
  if (result.type !== 'success') return null
  return completeSocialLogin(Linking.parse(result.url).queryParams ?? {})
}
