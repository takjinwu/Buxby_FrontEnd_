// 버스비 디자인 토큰 — 피그마 01 Foundations(Variables)와 같은 이름·값
// 웹 src/styles/tokens.css 의 CSS 변수를 JS 객체로 옮긴 것 (--text-primary → colors.textPrimary)
import { Platform } from 'react-native'

export const palette = {
  white: '#ffffff',
  black: '#191919',
  gray50: '#f5f6fa',
  gray100: '#eef0f4',
  gray200: '#e2e5eb',
  gray300: '#c9ced8',
  gray400: '#9aa1ae',
  gray500: '#6b7280',
  gray700: '#374151',
  gray900: '#111827',
  blue50: '#eef2ff',
  blue100: '#dfe6ff',
  blue300: '#a9b9fb',
  blue500: '#4a6cf7',
  blue600: '#3a57e0',
  blue800: '#1e3a8a',
  navy900: '#1c2340',
  navy700: '#2e3760',
  red50: '#fdecec',
  red500: '#e5383b',
  green50: '#e7f7ec',
  green600: '#16a34a',
  brandKakao: '#fee500',
  brandNaver: '#03c75a',
}

const p = palette

export const colors = {
  // background
  bgCanvas: p.gray50,
  bgSurface: p.white,
  bgSubtle: p.gray100,
  bgBrand: p.blue500,
  bgBrandPressed: p.blue600,
  bgBrandSubtle: p.blue50,
  bgBrandMuted: p.blue100,
  bgDangerSubtle: p.red50,
  bgSuccessSubtle: p.green50,
  bgAlarm: p.navy900,
  bgAlarmCard: p.navy700,
  bgKakao: p.brandKakao,
  bgNaver: p.brandNaver,
  bgDisabled: p.gray200,
  bgToggleOff: p.gray300,

  // text
  textPrimary: p.gray900,
  textSecondary: p.gray500,
  textTertiary: p.gray400,
  textOnBrand: p.white,
  textBrand: p.blue500,
  textDanger: p.red500,
  textSuccess: p.green600,
  textOnKakao: p.black,
  textDisabled: p.gray400,

  // icon
  iconDefault: p.gray500,
  iconStrong: p.blue800,
  iconBrand: p.blue500,
  iconDanger: p.red500,
  iconSuccess: p.green600,
  iconInverse: p.white,

  // border, chart
  borderDefault: p.gray200,
  borderStrong: p.gray300,
  borderBrand: p.blue500,
  borderDanger: p.red500,
  chartBar: p.blue500,
  chartBarMuted: p.blue300,
}

// 텍스트 색 이름 (웹 .c-primary · .c-secondary ... 클래스) → AppText의 color prop
export const textTones = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  brand: colors.textBrand,
  danger: colors.textDanger,
  success: colors.textSuccess,
  onBrand: colors.textOnBrand,
  disabled: colors.textDisabled,
}

// 바텀시트 뒤 어두운 막, 토스트 배경
export const overlay = {
  dim: 'rgba(17, 24, 39, 0.45)',
  toast: p.gray900,
}

export const spacing ={ 2: 2, 4: 4, 8: 8, 12: 12, 16: 16, 20: 20, 24: 24, 32: 32, 40: 40 }

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 }

// box-shadow는 RN에서 iOS(shadow*)와 Android(elevation)가 따로 쓴다
export const shadows = {
  card: Platform.select({
    ios: { shadowColor: p.gray900, shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    default: { elevation: 2 },
  }),
  sheet: Platform.select({
    ios: { shadowColor: p.gray900, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } },
    default: { elevation: 12 },
  }),
}

// 텍스트 스타일 (피그마 Text Styles). letter-spacing의 em은 font-size 기준 px로 환산했다.
// 폰트는 우선 시스템 기본 폰트 (Noto Sans KR 적용은 2단계에서 결정)
export const typography = {
  displayTime: { fontSize: 72, lineHeight: 84, fontWeight: '300' },
  displayL: { fontSize: 32, lineHeight: 40, fontWeight: '700', letterSpacing: -0.64 },
  titleL: { fontSize: 24, lineHeight: 32, fontWeight: '700', letterSpacing: -0.48 },
  titleM: { fontSize: 20, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  titleS: { fontSize: 18, lineHeight: 26, fontWeight: '700', letterSpacing: -0.18 },
  bodyLBold: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  bodyL: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMMedium: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  bodyM: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodySMedium: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  bodyS: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  captionMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  labelNav: { fontSize: 11, lineHeight: 14, fontWeight: '500' },
}
