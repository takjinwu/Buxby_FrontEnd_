import { useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { House, LocateFixed } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { IconButton, Screen, Spacer, TopBar, useGutter } from '../../components/layout'
import { Button, Chip, ChipRow, InputField } from '../../components/controls'
import { Toast } from '../../components/display'
import KakaoMap from '../../components/KakaoMap'
import { ORIGIN_LABELS, PLACES } from '../../data/mock'
import { useAppState } from '../../store/context'
import { useToast } from '../../lib/useToast'
import { addressAt } from '../../lib/kakao'
import { colors, radius, shadows } from '../../theme/tokens'

const LABEL_NAME = { 집: '내 집', 기숙사: '기숙사' }

// 저장된 출발지 이름으로 칩과 직접 입력 값을 되살린다
function initialLabel(name) {
  if (!name || name === '내 집') return ['집', '']
  if (name === '기숙사') return ['기숙사', '']
  return ['직접 입력', name]
}

// B5 출발 위치 선택 (지도 가운데 핀에 맞춘 위치를 출발지로 쓴다) — 웹 pages/home/OriginSelectPage.jsx
export default function OriginSelectScreen() {
  const { state, update } = useAppState()
  const gutter = useGutter()
  const saved = state.origin ?? PLACES.home
  const [initLabel, initCustom] = initialLabel(state.origin?.name)
  const [label, setLabel] = useState(initLabel)
  const [customName, setCustomName] = useState(initCustom)
  // spot: 지금 핀이 가리키는 위치, target: 지도를 옮길 위치 (처음엔 저장된 출발지, 이후 현재 위치 버튼)
  // target은 옮길 때만 새 객체로 바꾼다 (렌더마다 새로 만들면 지도를 움직일 때마다 되돌아감)
  const [spot, setSpot] = useState({ lat: saved.lat, lng: saved.lng, address: saved.address ?? '' })
  const [target, setTarget] = useState(() => ({ lat: saved.lat, lng: saved.lng }))
  const [locating, setLocating] = useState(false)
  const [toast, showToast] = useToast()
  const lookup = useRef(0)

  // 지도가 멈추면 가운데 좌표를 출발지로 삼고 주소를 찾는다 (늦게 온 이전 응답은 버린다)
  // 주소를 찾지 못하면 이전 주소를 그대로 둔다 (4단계 전에는 주소 변환이 없어 저장된 주소를 유지)
  const moveTo = async (lat, lng) => {
    const id = ++lookup.current
    setSpot((s) => ({ ...s, lat, lng }))
    const address = await addressAt(lat, lng)
    if (id === lookup.current && address) setSpot({ lat, lng, address })
  }

  // 웹 navigator.geolocation → expo-location
  const locate = async () => {
    if (locating) return
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        showToast('위치 권한을 허용해 주세요.')
        return
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setTarget({ lat: coords.latitude, lng: coords.longitude })
      // 주소 변환(4단계) 전에는 이전 주소가 남지 않게 표시만 바꾼다
      setSpot((s) => ({ ...s, address: '현재 위치' }))
      showToast('현재 위치로 이동했어요.')
    } catch {
      showToast('현재 위치를 찾지 못했어요.')
    } finally {
      setLocating(false)
    }
  }

  const name = label === '직접 입력' ? customName.trim() : LABEL_NAME[label]

  const confirm = () => {
    if (!name) return showToast('출발 위치 이름을 입력해 주세요.')
    // 출발지가 바뀌면 이전 경로는 쓸 수 없다
    update({
      origin: { name, address: spot.address, lat: spot.lat, lng: spot.lng },
      route: null,
      routeDetail: null,
      routeOptions: null,
    })
    router.navigate('/home')
  }

  return (
    <Screen bg="surface">
      <TopBar title="출발 위치" />
      <KakaoMap height={400} center={target} centerPin onCenterChange={moveTo}>
        <IconButton onPress={locate} accessibilityLabel="현재 위치로 이동" style={styles.fab}>
          <LocateFixed size={22} color={colors.iconStrong} />
        </IconButton>
      </KakaoMap>
      <View style={styles.panel}>
        <ScrollView
          contentContainerStyle={[styles.panelBody, { paddingHorizontal: gutter }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="bodyS" color="secondary">
            지도를 움직여 핀을 출발 위치에 맞춰 주세요
          </AppText>
          <View style={styles.place}>
            <House size={24} color={colors.iconBrand} />
            <View style={styles.placeText}>
              <AppText variant="bodyLBold">{name || '이름을 입력해 주세요'}</AppText>
              <AppText variant="bodyS" color="secondary">
                {spot.address || '주소를 찾는 중이에요'}
              </AppText>
            </View>
          </View>
          <ChipRow>
            {ORIGIN_LABELS.map((l) => (
              <Chip key={l} selected={label === l} onPress={() => setLabel(l)}>
                {l}
              </Chip>
            ))}
          </ChipRow>
          {label === '직접 입력' && (
            <InputField
              label="장소 이름"
              placeholder="예: 학교, 회사"
              value={customName}
              maxLength={20}
              onChangeText={setCustomName}
            />
          )}
          <Spacer />
          <Button onPress={confirm}>이 위치로 설정</Button>
        </ScrollView>
      </View>
      <Toast message={toast} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 40,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    ...shadows.card,
  },
  panel: {
    flex: 1,
    marginTop: -24,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.bgSurface,
    ...shadows.sheet,
  },
  panelBody: { flexGrow: 1, gap: 16, paddingTop: 24, paddingBottom: 16 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  placeText: { flex: 1 },
})
