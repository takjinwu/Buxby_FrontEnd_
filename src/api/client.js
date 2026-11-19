import { API_URL } from '../config'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function fallbackMessage(status) {
  if (status === 400) return '입력한 시간이나 위치를 다시 확인해 주세요.'
  if (status === 502 || status === 503) return '교통 정보를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.'
  return `요청을 처리하지 못했어요. (${status})`
}

// 쿼리 객체를 문자열로. 값이 없는 항목은 뺀다.
function toQueryString(query) {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

// 백엔드 JSON API 공통 호출. path는 '/api/...' 형태로 받아 백엔드 주소를 붙인다.
// 세션 쿠키는 네이티브 fetch가 기기 쿠키 저장소에 보관한다 (5단계에서 토큰 방식으로 바꿀 예정).
export async function request(path, { method = 'GET', query, body } = {}) {
  const qs = query ? toQueryString(query) : ''
  const url = `${API_URL}${path}${qs ? `?${qs}` : ''}`
  let response
  try {
    response = await fetch(url, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.', 0)
  }

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // 프록시 오류 페이지처럼 JSON이 아닌 응답은 상태 코드로만 처리한다
  }

  if (!response.ok) throw new ApiError(data?.message || fallbackMessage(response.status), response.status)
  return data
}
