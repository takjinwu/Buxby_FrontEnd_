import { API_URL } from '../config'

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

// 소셜 로그인 시작
// 웹은 window.location 으로 백엔드 OAuth 페이지로 이동했지만, 앱은
// 시스템 브라우저로 열고 딥링크(buxby://)로 돌아오는 방식이 필요하다. → 5단계에서 구현
// (Google은 앱 내부 WebView 로그인을 막기 때문에 WebView로 대신할 수 없다)
export async function socialLogin(provider) {
  if (!SOCIAL_PROVIDERS.includes(provider)) {
    throw new Error('지원하지 않는 로그인 방식입니다.')
  }

  throw new Error('앱 간편 로그인은 준비 중이에요. 이메일로 로그인해 주세요.')
}
