import { useEffect, useState } from 'react'
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { ChevronLeft, X } from 'lucide-react-native'
import AppText, { ForegroundContext } from './AppText'
import { colors, overlay, radius, shadows } from '../theme/tokens'

// 좁은 화면(360px 미만: iPhone SE·폴드 접은 화면)은 좌우 여백을 24 → 16으로 줄인다 (웹 @media max-width: 359px)
export function useGutter() {
  const { width } = useWindowDimensions()
  return width < 360 ? 16 : 24
}

const SCREEN_BG = {
  canvas: colors.bgCanvas,
  surface: colors.bgSurface,
  alarm: colors.bgAlarm,
  brand: colors.bgBrand,
}
const DARK_BG = { alarm: true, brand: true }

// 화면 틀: 상단바 · 스크롤 영역 · 하단(버튼)을 세로로 배치
// - bg: canvas | surface | alarm | brand. alarm·brand는 기본 글자색이 흰색이 되고 상태바 글자도 밝아진다
// - tab: 하단 탭이 있는 화면 (웹에서 <BottomNav />를 그리던 화면). 아래쪽 안전 영역은 탭 바가 처리한다
export function Screen({ bg = 'canvas', tab = false, style, children }) {
  const dark = !!DARK_BG[bg]
  return (
    <ForegroundContext.Provider value={dark ? colors.textOnBrand : colors.textPrimary}>
      <SafeAreaView
        edges={tab ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
        style={[styles.screen, { backgroundColor: SCREEN_BG[bg] }, style]}
      >
        <StatusBar style={dark ? 'light' : 'dark'} />
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {children}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ForegroundContext.Provider>
  )
}

// 스크롤 영역. style은 안쪽 내용 상자(contentContainerStyle)에 적용된다.
// scroll={false}면 스크롤 없이 남은 높이를 채운다 (알람 화면처럼 한 화면에 고정된 레이아웃)
export function Content({ gap = 16, scroll = true, style, children }) {
  const gutter = useGutter()
  const box = [styles.content, { gap, paddingHorizontal: gutter }, style]
  if (!scroll) return <View style={[styles.fill, ...box]}>{children}</View>
  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={box}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  )
}

export function Footer({ style, children }) {
  const gutter = useGutter()
  return <View style={[styles.footer, { paddingHorizontal: gutter }, style]}>{children}</View>
}

// 남는 세로 공간을 채워 아래 요소를 밀어낸다
export function Spacer() {
  return <View style={styles.spacer} />
}

// 아이콘만 있는 버튼 (웹 .icon-button)
export function IconButton({ onPress, accessibilityLabel, style, children }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed, style]}
    >
      {children}
    </Pressable>
  )
}

// 피그마 TopBar (Type=Back / Type=Large)
// - action: { label, onPress } 오른쪽 알약 버튼
// - backTo: 뒤로 가기 대신 이동할 경로
export function TopBar({ variant = 'back', title, action, right, backTo }) {
  const gutter = useGutter()
  const goBack = () => {
    if (backTo) router.navigate(backTo)
    else if (router.canGoBack()) router.back()
    else router.replace('/home')
  }

  if (variant === 'large') {
    return (
      <View style={[styles.topbar, styles.topbarLarge, { paddingHorizontal: gutter }]}>
        <AppText variant="titleL" accessibilityRole="header">
          {title}
        </AppText>
        <View style={styles.topbarRight}>{right}</View>
      </View>
    )
  }

  return (
    <View style={[styles.topbar, styles.topbarBack]}>
      <View style={styles.topbarSide}>
        <IconButton onPress={goBack} accessibilityLabel="뒤로 가기">
          <ChevronLeft size={24} color={colors.iconStrong} />
        </IconButton>
      </View>
      <AppText variant="titleS" numberOfLines={1} style={styles.topbarTitle} accessibilityRole="header">
        {title}
      </AppText>
      <View style={[styles.topbarSide, styles.topbarSideRight]}>
        {action && (
          <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button" style={styles.topbarAction}>
            <AppText variant="captionMedium" color="brand">
              {action.label}
            </AppText>
          </Pressable>
        )}
        {right}
      </View>
    </View>
  )
}

// 피그마 SheetHeader + 바텀시트. 안드로이드 뒤로 가기·바깥 영역을 누르면 onClose
export function BottomSheet({ open, title, onClose, children }) {
  const insets = useSafeAreaInsets()
  const gutter = useGutter()
  const [rise] = useState(() => new Animated.Value(24))

  useEffect(() => {
    if (!open) return
    rise.setValue(24)
    Animated.timing(rise, { toValue: 0, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()
  }, [open, rise])

  return (
    <Modal
      visible={!!open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {/* 어두운 화면(알람)에서 열어도 시트 안 글자는 기본색 */}
      <ForegroundContext.Provider value={colors.textPrimary}>
        <KeyboardAvoidingView style={styles.sheetLayer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.sheetDim} onPress={onClose} accessibilityLabel="닫기" />
          <Animated.View
            accessibilityViewIsModal
            style={[styles.sheet, { paddingBottom: 24 + insets.bottom, transform: [{ translateY: rise }] }]}
          >
            <View style={styles.sheetHandle} />
            <View style={[styles.sheetHeader, { paddingHorizontal: gutter }]}>
              <AppText variant="titleM" accessibilityRole="header">
                {title}
              </AppText>
              <IconButton onPress={onClose} accessibilityLabel="닫기">
                <X size={24} color={colors.iconDefault} />
              </IconButton>
            </View>
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={[styles.sheetBody, { paddingHorizontal: gutter }]}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </ForegroundContext.Provider>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { flex: 1 },
  content: { flexGrow: 1, paddingTop: 8, paddingBottom: 24 },
  footer: { gap: 12, paddingTop: 12, paddingBottom: 16 },
  spacer: { flexGrow: 1, minHeight: 8 },

  iconButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  iconButtonPressed: { backgroundColor: 'rgba(17, 24, 39, 0.06)' },

  topbar: { height: 56, flexDirection: 'row', alignItems: 'center' },
  topbarBack: { paddingHorizontal: 8 },
  topbarLarge: { justifyContent: 'space-between' },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topbarSide: { width: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  topbarSideRight: { justifyContent: 'flex-end' },
  topbarTitle: { flex: 1, textAlign: 'center' },
  topbarAction: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.bgBrandSubtle,
  },

  sheetLayer: { flex: 1, justifyContent: 'flex-end' },
  sheetDim: { ...StyleSheet.absoluteFillObject, backgroundColor: overlay.dim },
  sheet: {
    maxHeight: '90%',
    paddingTop: 8,
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadows.sheet,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    marginBottom: 12,
    alignSelf: 'center',
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  // 내용이 짧으면 내용 높이만큼, 길면 시트 최대 높이(90%) 안에서 스크롤
  sheetScroll: { flexGrow: 0, flexShrink: 1 },
  sheetBody: { gap: 16 },
})
