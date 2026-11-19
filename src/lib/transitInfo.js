// 선택한 경로의 실시간 교통정보 (버스 혼잡도 · 지하철 도착정보)
// 웹은 RouteSelectPage와 RouteDetailPage에 같은 코드가 따로 있었다 → 여기로 모았다 (결과 모양은 그대로)
import { collectBusCongestion, getSubwayArrivals } from '../api/transit'

// 빈 값을 빼고 중복을 없앤 문자열 목록
export const uniqueNames = (list) => [...new Set((list ?? []).map((v) => String(v ?? '').trim()).filter(Boolean))]

// 버스 노선별 차량 혼잡도 수집. 노선이 없으면 null, 실패하면 REQUEST_FAILED (노선 설정은 계속한다)
export async function loadBusCongestion(busRouteIds) {
  if (busRouteIds.length === 0) return null
  try {
    const response = await collectBusCongestion(busRouteIds)
    return {
      status: response.status,
      requestedCount: response.requestedCount,
      successCount: response.successCount,
      noDataCount: response.noDataCount ?? 0,
      failedCount: response.failedCount,
      collectedAt: new Date().toISOString(),
      routes: (response.results ?? []).map((route) => ({
        busRouteId: route.busRouteId,
        status: route.status,
        fetchedCount: route.fetchedCount ?? 0,
        savedCount: route.savedCount ?? 0,
        collectedAt: route.collectedAt ?? null,
        vehicles: route.vehicles ?? [],
        message: route.message ?? null,
      })),
    }
  } catch (err) {
    console.warn('[혼잡도 수집 실패]', err.message)
    return { status: 'REQUEST_FAILED', message: err.message, routes: [] }
  }
}

// 각 지하철 승차역의 도착정보를 따로 조회해 모은다. 역이 없으면 null
export async function loadSubwayArrivals(stationNames) {
  if (stationNames.length === 0) return null
  const stations = await Promise.all(
    stationNames.map(async (stationName) => {
      try {
        const response = await getSubwayArrivals(stationName)
        return {
          stationName,
          status: response.status ?? 'UNKNOWN',
          count: response.count ?? response.arrivals?.length ?? 0,
          fetchedAt: response.fetchedAt ?? null,
          arrivals: response.arrivals ?? [],
          message: null,
        }
      } catch (err) {
        console.warn(`[지하철 도착정보 조회 실패: ${stationName}]`, err.message)
        return { stationName, status: 'REQUEST_FAILED', count: 0, fetchedAt: null, arrivals: [], message: err.message }
      }
    }),
  )
  const count = (status) => stations.filter((s) => s.status === status).length
  const successCount = count('SUCCESS')
  const noDataCount = count('NO_DATA')
  const failedCount = count('REQUEST_FAILED')
  let status = 'SUCCESS'
  if (failedCount > 0) status = successCount > 0 || noDataCount > 0 ? 'PARTIAL_SUCCESS' : 'REQUEST_FAILED'
  else if (successCount === 0) status = 'NO_DATA'
  return {
    status,
    requestedCount: stationNames.length,
    successCount,
    noDataCount,
    failedCount,
    collectedAt: new Date().toISOString(),
    stations,
  }
}
