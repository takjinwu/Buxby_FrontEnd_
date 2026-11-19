// 카카오 장소 검색·주소 변환 (웹 lib/kakao.js)
// TODO(4단계): 카카오 지도 이식 때 실제 검색·주소 변환으로 바꾼다.
// 웹도 키가 없으면 null을 돌려주고 화면이 예시 데이터를 쓰므로, 지금은 항상 그 경로로 간다.

export function hasKakaoKey() {
  return false
}

// 좌표 → 도로명(없으면 지번) 주소. 찾지 못하면 null
export async function addressAt() {
  return null
}

// 키워드 장소 검색. 쓸 수 없으면 null (화면이 예시 결과로 대신한다)
export async function searchPlaces() {
  return null
}
