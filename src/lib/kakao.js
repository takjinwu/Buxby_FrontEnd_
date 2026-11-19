// 카카오 장소 검색 · 좌표 → 주소 (웹 lib/kakao.js)
// 웹은 페이지에 SDK를 불러 바로 썼지만, 앱은 보이지 않는 WebView(components/KakaoBridge.jsx) 안의 SDK에 물어본다.
// 키가 없거나, 창구가 준비되지 않았거나, 시간 안에 답이 없으면 null → 화면이 예시 결과·이전 주소로 대신한다 (웹과 같음)
import { KAKAO_JS_KEY } from '../config'

const TIMEOUT_MS = 8000
const READY_WAIT_MS = 6000

let send = null // KakaoBridge가 준비되면 등록하는 함수: (script) => void
let nextId = 0
const pending = new Map() // id → resolve
const readyWaiters = new Set()

export function hasKakaoKey() {
  return Boolean(KAKAO_JS_KEY)
}

// ----- KakaoBridge 전용 -----
export function attachBridge(sender) {
  send = sender
  readyWaiters.forEach((resolve) => resolve(true))
  readyWaiters.clear()
}

export function detachBridge() {
  send = null
  pending.forEach((resolve) => resolve(null))
  pending.clear()
}

export function receiveBridgeResult(id, result) {
  const resolve = pending.get(id)
  if (!resolve) return
  pending.delete(id)
  resolve(result)
}
// -------------------------

// 앱을 막 켰을 때는 창구가 아직 SDK를 불러오는 중일 수 있어 잠깐 기다린다
function waitForBridge() {
  if (send) return Promise.resolve(true)
  return new Promise((resolve) => {
    readyWaiters.add(resolve)
    setTimeout(() => {
      readyWaiters.delete(resolve)
      resolve(Boolean(send))
    }, READY_WAIT_MS)
  })
}

async function ask(call) {
  if (!hasKakaoKey() || !(await waitForBridge())) return null
  const id = ++nextId
  return new Promise((resolve) => {
    pending.set(id, resolve)
    setTimeout(() => receiveBridgeResult(id, null), TIMEOUT_MS)
    send(call(id))
  })
}

// 좌표 → 주소 (도로명 우선). 못 찾으면 null
export function addressAt(lat, lng) {
  return ask((id) => `window.__buxby.address(${id}, ${Number(lat)}, ${Number(lng)}); true;`)
}

// 카카오 장소 검색 (Places). 결과 없음은 [], 쓸 수 없으면 null
export function searchPlaces(keyword) {
  return ask((id) => `window.__buxby.search(${id}, ${JSON.stringify(String(keyword))}); true;`)
}
