import { Pressable, StyleSheet, View } from 'react-native'
import AppText from './AppText'
import { colors, radius } from '../theme/tokens'

// 경로 상세(C2)의 실시간 버스 혼잡도 · 지하철 도착정보 (웹 RouteDetailPage의 BusCongestionSection · SubwayArrivalSection)
// 웹은 인라인 style(고정 색)로 그렸다 → 비슷한 토큰으로 바꾸고, 혼잡도 색은 웹 값을 그대로 쓴다

// 혼잡도별 표시 색상
const CONGESTION_TONE = {
  여유: { bg: '#DCFCE7', fg: '#15803D' },
  보통: { bg: '#FEF3C7', fg: '#B45309' },
  혼잡: { bg: '#FFEDD5', fg: '#C2410C' },
  매우혼잡: { bg: '#FEE2E2', fg: '#B91C1C' },
}
const CONGESTION_NONE = { bg: '#F1F5F9', fg: '#475569' }

const congestionKey = (label) => (label === '매우 혼잡' ? '매우혼잡' : label)

// 수집 시각 표시 (오전 07:05)
function formatCollectedAt(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  const h12 = String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0')
  return `${h < 12 ? '오전' : '오후'} ${h12}:${m}`
}

// ODsay 노선명과 서울시 API 노선명 비교를 위한 정규화
function normalizeSubwayLineName(value) {
  return String(value ?? '')
    .replace(/^수도권\s*/, '')
    .replace(/\s+/g, '')
    .trim()
}

// 선택한 경로에 해당하는 지하철 열차만 남긴다
function filterSubwayArrivals(arrivals, lineNames) {
  const targetLines = (lineNames ?? []).map(normalizeSubwayLineName).filter(Boolean)
  if (targetLines.length === 0) return arrivals
  return arrivals.filter((train) => {
    const actualLine = normalizeSubwayLineName(train.lineName)
    if (!actualLine) return false
    return targetLines.some(
      (targetLine) => actualLine === targetLine || actualLine.includes(targetLine) || targetLine.includes(actualLine),
    )
  })
}

function Section({ children }) {
  return <View style={styles.section}>{children}</View>
}

function Group({ children }) {
  return <View style={styles.group}>{children}</View>
}

function Note({ children, style }) {
  return (
    <AppText variant="bodyS" color="secondary" style={style}>
      {children}
    </AppText>
  )
}

// 차량별 혼잡도
function CongestionVehicle({ vehicle }) {
  const label = vehicle.congestionLabel || vehicle.congestion || '정보없음'
  const tone = CONGESTION_TONE[congestionKey(label)] ?? CONGESTION_NONE
  return (
    <View style={styles.vehicle}>
      <View style={styles.shrink}>
        <AppText variant="bodySMedium">{vehicle.vehicleNumber || '차량번호 미확인'}</AppText>
        <AppText variant="caption" color="secondary">
          {vehicle.nextStopId ? `다음 정류장 ID: ${vehicle.nextStopId}` : '위치 정보 확인 중'}
        </AppText>
      </View>
      <View style={[styles.pill, { backgroundColor: tone.bg }]}>
        <AppText variant="captionMedium" color={tone.fg} style={styles.bold}>
          {label}
        </AppText>
      </View>
    </View>
  )
}

// 노선별 혼잡도
export function BusCongestionSection({ congestion, detail }) {
  const busSegments = detail?.busSegments ?? []
  const routes = congestion?.routes ?? []
  if (busSegments.length === 0) return null

  return (
    <Section>
      <View style={styles.sectionHead}>
        <AppText variant="bodyLBold" accessibilityRole="header">
          실시간 버스 혼잡도
        </AppText>
        <AppText variant="caption" color="secondary">
          선택한 경로에 포함된 버스의 차량별 정보예요.
        </AppText>
      </View>

      {!congestion && <Note>아직 혼잡도 정보를 조회하지 않았어요.</Note>}
      {congestion?.status === 'REQUEST_FAILED' && (
        <Note>혼잡도 정보를 가져오지 못했어요. 경로 이용에는 문제가 없어요.</Note>
      )}

      {routes.map((route) => {
        const segment = busSegments.find((item) => (item.busRouteIds ?? []).includes(route.busRouteId))
        const busName = segment?.busNos?.join(', ') || segment?.busNo || '버스'
        const vehicles = route.vehicles ?? []
        const counts = { 여유: 0, 보통: 0, 혼잡: 0, 매우혼잡: 0 }
        vehicles.forEach((vehicle) => {
          const key = congestionKey(vehicle.congestionLabel || vehicle.congestion)
          if (key in counts) counts[key]++
        })
        const collectedTime = formatCollectedAt(route.collectedAt) || formatCollectedAt(congestion.collectedAt)

        return (
          <Group key={route.busRouteId}>
            <View style={styles.groupHead}>
              <AppText variant="bodyMMedium" style={styles.bold}>
                {busName}번 버스
              </AppText>
              <AppText variant="caption" color="secondary">
                {vehicles.length}대 조회
              </AppText>
            </View>

            {route.status === 'NO_DATA' && <Note>현재 운행 중인 차량 정보가 없습니다.</Note>}
            {route.status === 'FAILED' && <Note>이 노선의 혼잡도 정보를 가져오지 못했어요.</Note>}
            {route.status === 'SUCCESS' && vehicles.length === 0 && <Note>표시할 차량 정보가 없습니다.</Note>}

            {vehicles.length > 0 && (
              <>
                <View style={styles.counts}>
                  {Object.entries(counts).map(([label, count]) => (
                    <View key={label} style={styles.countBox}>
                      <AppText variant="titleS" style={styles.countNumber}>
                        {count}
                      </AppText>
                      <AppText variant="labelNav" color="secondary" style={styles.regular}>
                        {label === '매우혼잡' ? '매우 혼잡' : label}
                      </AppText>
                    </View>
                  ))}
                </View>
                <View>
                  {vehicles.map((vehicle, index) => (
                    <CongestionVehicle key={vehicle.vehicleId || index} vehicle={vehicle} />
                  ))}
                </View>
              </>
            )}

            {collectedTime && (
              <AppText variant="caption" color="secondary" style={styles.stamp}>
                수집 시각: {collectedTime}
              </AppText>
            )}
          </Group>
        )
      })}
    </Section>
  )
}

function TrainRow({ train }) {
  return (
    <View style={styles.train}>
      <View style={styles.trainText}>
        <AppText variant="bodySMedium">
          {train.lineName} · {train.updnLine || ''}
        </AppText>
        <AppText variant="caption" color="secondary">
          {train.trainLineNm || `${train.destinationStation || '행'}`}
        </AppText>
        {train.arrivalDetailMessage ? (
          <AppText variant="caption" color="secondary">
            현재 위치: {train.arrivalDetailMessage}
          </AppText>
        ) : null}
        {train.arrivalCodeLabel ? (
          <AppText variant="caption" color="secondary">
            {train.arrivalCodeLabel}
          </AppText>
        ) : null}
      </View>
      <View style={styles.trainRight}>
        <AppText variant="bodySMedium" color="brand" style={[styles.bold, styles.right]}>
          {train.arrivalMessage || '도착 정보 확인 중'}
        </AppText>
        {train.isLastTrain === '1' && (
          <AppText variant="caption" color="secondary">
            막차
          </AppText>
        )}
      </View>
    </View>
  )
}

// 지하철 실시간 도착정보
export function SubwayArrivalSection({ subwayArrivals, detail, onRefresh, refreshing }) {
  const subwaySegments = detail?.subwaySegments ?? []
  if (subwaySegments.length === 0) return null

  const stationNames = [...new Set((detail?.subwayStationNames ?? []).filter(Boolean))]
  const stationMap = new Map((subwayArrivals?.stations ?? []).map((station) => [station.stationName, station]))

  return (
    <Section>
      <View style={styles.subwayHead}>
        <AppText variant="bodyLBold" accessibilityRole="header" style={styles.shrink}>
          실시간 지하철 도착정보
        </AppText>
        <Pressable
          onPress={onRefresh}
          disabled={refreshing}
          accessibilityRole="button"
          style={[styles.refresh, refreshing && styles.refreshBusy]}
        >
          <AppText variant="captionMedium" color="#475569" style={styles.bold}>
            {refreshing ? '조회 중...' : '새로고침'}
          </AppText>
        </Pressable>
      </View>
      <AppText variant="caption" color="secondary">
        선택한 경로에 포함된 노선의 열차만 표시해요.
      </AppText>
      <AppText variant="caption" color="secondary" style={styles.mt4}>
        자동 갱신: 3분마다
      </AppText>

      {!subwayArrivals && <Note style={styles.mt14}>아직 지하철 도착정보를 조회하지 않았어요.</Note>}

      {stationNames.map((stationName) => {
        const station = stationMap.get(stationName)
        // 이 승차역에서 탈 노선만 남긴다
        const lineNames = [
          ...new Set(
            subwaySegments
              .filter((segment) => segment.boardingStationName === stationName)
              .flatMap((segment) => segment.lineNames ?? []),
          ),
        ]
        const rawArrivals = station?.arrivals ?? []
        const arrivals = filterSubwayArrivals(rawArrivals, lineNames)

        return (
          <Group key={stationName}>
            <View style={styles.groupHead}>
              <View style={styles.shrink}>
                <AppText variant="bodyMMedium" style={styles.bold}>
                  {stationName}
                </AppText>
                <AppText variant="caption" color="secondary">
                  {lineNames.join(' · ')}
                </AppText>
              </View>
              <AppText variant="caption" color="secondary">
                {arrivals.length}개 열차
              </AppText>
            </View>

            {station?.status === 'REQUEST_FAILED' && (
              <Note>지하철 도착정보를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.</Note>
            )}
            {station?.status === 'NO_DATA' && <Note>현재 운행 중인 열차 정보가 없습니다.</Note>}
            {station?.status === 'SUCCESS' && rawArrivals.length > 0 && arrivals.length === 0 && (
              <Note>현재 해당 노선의 도착정보가 없습니다.</Note>
            )}

            {arrivals.map((train, index) => (
              <TrainRow key={`${train.trainNumber || 'train'}-${index}`} train={train} />
            ))}

            {!station && subwayArrivals && <Note>아직 이 역의 조회 결과가 없습니다.</Note>}

            {station?.fetchedAt && (
              <AppText variant="caption" color="secondary" style={styles.stamp}>
                조회 시각: {formatCollectedAt(station.fetchedAt)}
              </AppText>
            )}
          </Group>
        )
      })}

      {subwayArrivals?.status === 'PARTIAL_SUCCESS' && (
        <AppText variant="caption" color="secondary" style={styles.mt12}>
          일부 역의 도착정보만 정상적으로 조회되었어요.
        </AppText>
      )}
      {subwayArrivals?.status === 'REQUEST_FAILED' && (
        <AppText variant="caption" color="secondary" style={styles.mt12}>
          교통정보 서버에 연결할 수 없습니다.
        </AppText>
      )}
    </Section>
  )
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1, minWidth: 0 },
  bold: { fontWeight: '700' },
  regular: { fontWeight: '400' },
  right: { textAlign: 'right' },
  mt4: { marginTop: 4 },
  mt12: { marginTop: 12 },
  mt14: { marginTop: 14 },

  section: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
  },
  sectionHead: { marginBottom: 14 },
  group: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.borderDefault },
  groupHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stamp: { marginTop: 10, textAlign: 'right' },

  counts: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  countBox: { flex: 1, alignItems: 'center', paddingVertical: 9, paddingHorizontal: 3, borderRadius: 10, backgroundColor: colors.bgCanvas },
  countNumber: { fontSize: 19, lineHeight: 24 },

  vehicle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  pill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },

  subwayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 },
  refresh: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurface,
  },
  refreshBusy: { backgroundColor: '#F1F5F9' },

  train: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: colors.bgCanvas,
  },
  trainText: { flex: 1, minWidth: 0 },
  trainRight: { flexShrink: 0, maxWidth: 120, alignItems: 'flex-end' },
})
