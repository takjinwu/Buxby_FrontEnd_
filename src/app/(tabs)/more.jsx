import { Fragment, useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { AlarmClock, Bed, Bell, ChevronRight, LogOut, MapPin, ShieldCheck, User } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, Screen, TopBar } from '../../components/layout'
import { Button } from '../../components/controls'
import { Card, Divider, IconTile } from '../../components/display'
import { getMe, logout } from '../../api/auth'
import { colors, radius } from '../../theme/tokens'

const PROVIDER = {
  KAKAO: { label: '카카오', bg: colors.bgKakao, fg: colors.textOnKakao },
  NAVER: { label: '네이버', bg: colors.bgNaver, fg: colors.textOnBrand },
  GOOGLE: { label: 'Google', bg: colors.bgSubtle, fg: colors.textSecondary },
  LOCAL: { label: '이메일', bg: colors.bgSubtle, fg: colors.textSecondary },
}

const MENUS = [
  { icon: AlarmClock, label: '알람 설정', to: '/alarm/settings' },
  { icon: Bed, label: '준비 시간 학습', to: '/alarm' },
  { icon: Bell, label: '권한·알림 설정', to: '/more/permissions' },
  { icon: MapPin, label: '서비스 지역 안내 (경기도 우선)', to: null },
  { icon: ShieldCheck, label: '이용약관·위치기반서비스 약관', to: null },
]

function MenuRow({ icon: RowIcon, label, onPress, danger }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
    >
      <RowIcon size={20} color={danger ? colors.iconDanger : colors.iconStrong} />
      <AppText variant="bodyMMedium" color={danger ? 'danger' : 'primary'} style={styles.fill}>
        {label}
      </AppText>
      <ChevronRight size={18} color={colors.iconDefault} />
    </Pressable>
  )
}

// E1 더보기 — 웹 pages/more/MorePage.jsx
export default function MoreScreen() {
  const [me, setMe] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((data) => !cancelled && setMe(data))
      .catch(() => !cancelled && setMe(null))
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // 이미 로그아웃된 상태여도 로그인 화면으로 보낸다
    }
    router.replace('/login')
  }

  const provider = PROVIDER[me?.provider] ?? PROVIDER.LOCAL

  return (
    <Screen tab>
      <TopBar variant="large" title="더보기" />
      <Content gap={16}>
        <Card padded style={styles.profile}>
          <IconTile icon={User} size={52} iconSize={26} round />
          {me ? (
            <>
              <View style={styles.profileText}>
                <AppText variant="bodyLBold" numberOfLines={1}>
                  {me.nickname} 님
                </AppText>
                <AppText variant="bodyS" color="secondary" numberOfLines={1}>
                  {me.email ?? '이메일 정보 없음'}
                </AppText>
              </View>
              <View style={[styles.provider, { backgroundColor: provider.bg }]}>
                <AppText variant="captionMedium" color={provider.fg}>
                  {provider.label}
                </AppText>
              </View>
            </>
          ) : (
            <>
              <View style={styles.profileText}>
                <AppText variant="bodyLBold">{me === undefined ? '불러오는 중…' : '로그인이 필요해요'}</AppText>
                <AppText variant="bodyS" color="secondary">
                  일정과 알람을 계정에 저장해요
                </AppText>
              </View>
              {me === null && (
                <Button size="m" variant="secondary" onPress={() => router.push('/login')}>
                  로그인
                </Button>
              )}
            </>
          )}
        </Card>
        <View style={styles.adFree}>
          <View style={styles.adFreeText}>
            <AppText variant="bodyLBold" color="onBrand">
              광고 없이 쓰기
            </AppText>
            <AppText variant="bodyS" color="onBrand">
              ₩3,900 · 한 번만 결제
            </AppText>
          </View>
          <Button size="m" variant="secondary" onPress={() => router.push('/more/ad-free')}>
            자세히
          </Button>
        </View>
        <Card>
          {MENUS.map((m, i) => (
            <Fragment key={m.label}>
              {i > 0 && <Divider />}
              <MenuRow icon={m.icon} label={m.label} onPress={() => m.to && router.push(m.to)} />
            </Fragment>
          ))}
        </Card>
        <Card>
          <MenuRow icon={LogOut} label="로그아웃" danger onPress={handleLogout} />
        </Card>
      </Content>
    </Screen>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
  profileText: { flex: 1, gap: 2, minWidth: 0 },
  provider: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.sm },
  adFree: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.bgBrand,
  },
  adFreeText: { flex: 1, gap: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 20 },
  menuRowPressed: { backgroundColor: colors.bgCanvas },
})
