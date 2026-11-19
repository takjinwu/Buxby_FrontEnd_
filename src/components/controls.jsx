import { createContext, useContext, useEffect, useState } from 'react'
import { Animated, Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Check, Eye, EyeOff } from 'lucide-react-native'
import AppText, { textChildren } from './AppText'
import { GoogleLogo, KakaoLogo, NaverLogo } from './BrandLogos'
import { IconButton } from './layout'
import { colors, radius, typography } from '../theme/tokens'

// TextInput은 lineHeight가 있으면 iOS에서 글자가 위로 치우친다 → 입력칸에는 lineHeight를 뺀 글자 스타일을 쓴다
export function inputFont(variant) {
  const { lineHeight, ...font } = typography[variant]
  return font
}

const BUTTON_TONE = {
  primary: { bg: colors.bgBrand, pressed: colors.bgBrandPressed, text: colors.textOnBrand },
  secondary: { bg: colors.bgBrandSubtle, pressed: colors.bgBrandMuted, text: colors.textBrand },
  tertiary: { bg: colors.bgSubtle, pressed: colors.bgDisabled, text: colors.textPrimary },
}

// 피그마 Button: Style(Primary/Secondary/Tertiary) × Size(L/M) × State(Default/Disabled)
// children이 문자열이면 글자 스타일을 입히고, 아이콘을 섞어 넣을 수도 있다
export function Button({ variant = 'primary', size = 'l', disabled, onPress, style, children, ...rest }) {
  const tone = BUTTON_TONE[variant]
  const large = size === 'l'
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        large ? styles.btnL : styles.btnM,
        { backgroundColor: disabled ? colors.bgDisabled : pressed ? tone.pressed : tone.bg },
        style,
      ]}
      {...rest}
    >
      {textChildren(children, {
        variant: large ? 'bodyLBold' : 'bodySMedium',
        color: disabled ? colors.textDisabled : tone.text,
        numberOfLines: 1,
      })}
    </Pressable>
  )
}

const SOCIAL = {
  kakao: { label: '카카오로 계속하기', Logo: KakaoLogo, bg: colors.bgKakao, text: colors.textOnKakao },
  naver: { label: '네이버로 계속하기', Logo: NaverLogo, bg: colors.bgNaver, text: colors.textOnBrand },
  google: { label: 'Google로 계속하기', Logo: GoogleLogo, bg: colors.bgSurface, text: colors.textPrimary },
}

// 피그마 SocialLoginButton: Provider=Kakao/Naver/Google
export function SocialLoginButton({ provider, onPress }) {
  const { label, Logo, bg, text } = SOCIAL[provider]
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.social,
        { backgroundColor: bg },
        provider === 'google' && styles.socialGoogle,
        pressed && styles.pressedDim,
      ]}
    >
      <Logo size={20} />
      <AppText variant="bodyMMedium" color={text}>
        {label}
      </AppText>
    </Pressable>
  )
}

// 웹 input type → 키보드 종류
const INPUT_TYPES = {
  email: { keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false },
  password: { autoCapitalize: 'none', autoCorrect: false },
  tel: { keyboardType: 'phone-pad' },
  number: { keyboardType: 'number-pad' },
  search: { returnKeyType: 'search' },
}

// 피그마 InputField: State=Default/Focus/Error
// 웹 onChange(e => e.target.value) 대신 onChangeText(text) 를 쓴다. 나머지 props는 TextInput으로 넘긴다
export function InputField({ label, error, helper, type = 'text', style, onFocus, onBlur, ...rest }) {
  const [focused, setFocused] = useState(false)
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const message = error || helper
  const boxState = error ? styles.fieldBoxError : focused ? styles.fieldBoxFocus : null

  return (
    <View style={[styles.field, style]}>
      <AppText variant="bodySMedium" color="secondary">
        {label}
      </AppText>
      <View style={[styles.fieldBox, boxState]}>
        <TextInput
          style={[styles.fieldInput, inputFont('bodyM')]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword && !reveal}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          {...INPUT_TYPES[type]}
          {...rest}
        />
        {isPassword && (
          <IconButton
            onPress={() => setReveal((v) => !v)}
            accessibilityLabel={reveal ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {reveal ? <EyeOff size={22} color={colors.iconDefault} /> : <Eye size={22} color={colors.iconDefault} />}
          </IconButton>
        )}
      </View>
      {message ? (
        <AppText variant="caption" color={error ? 'danger' : 'secondary'}>
          {message}
        </AppText>
      ) : null}
    </View>
  )
}

// 칩을 가로로 늘어놓는 줄 (웹 .chip-row). fill이면 칩들이 같은 너비로 줄을 채운다 (.chip-row--fill)
const ChipRowContext = createContext(false)

export function ChipRow({ fill = false, style, children }) {
  return (
    <ChipRowContext.Provider value={fill}>
      <View style={[styles.chipRow, style]}>{children}</View>
    </ChipRowContext.Provider>
  )
}

// 피그마 Chip: 일정 유형 · 정렬 · 대안 경로 탭
export function Chip({ selected, icon: ChipIcon, onPress, style, children }) {
  const fill = useContext(ChipRowContext)
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        fill && styles.chipFill,
        selected && styles.chipSelected,
        pressed && !selected && styles.chipPressed,
        style,
      ]}
    >
      {ChipIcon && <ChipIcon size={20} color={selected ? colors.iconInverse : colors.iconStrong} />}
      {textChildren(children, { variant: 'bodyMMedium', color: selected ? 'onBrand' : 'primary', numberOfLines: 1 })}
    </Pressable>
  )
}

// 켜짐/꺼짐 스위치. 손잡이는 0.15초 동안 미끄러진다
export function Toggle({ checked, onChange, label }) {
  const [knob] = useState(() => new Animated.Value(checked ? 1 : 0))

  useEffect(() => {
    Animated.timing(knob, { toValue: checked ? 1 : 0, duration: 150, useNativeDriver: true }).start()
  }, [checked, knob])

  const translateX = knob.interpolate({ inputRange: [0, 1], outputRange: [0, 20] })
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      hitSlop={6}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: !!checked }}
      style={[styles.toggle, checked && styles.toggleOn]}
    >
      <Animated.View style={[styles.toggleKnob, { transform: [{ translateX }] }]} />
    </Pressable>
  )
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: !!checked }}
      style={[styles.checkbox, checked && styles.checkboxOn]}
    >
      {checked && <Check size={16} color={colors.iconInverse} strokeWidth={3} />}
    </Pressable>
  )
}

export function DayChip({ selected, onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.dayChip, selected && styles.dayChipOn]}
    >
      <AppText variant="bodySMedium" color={selected ? 'onBrand' : 'secondary'}>
        {children}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressedDim: { opacity: 0.85 },

  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnL: { height: 56, paddingHorizontal: 24, borderRadius: radius.lg },
  btnM: { height: 44, paddingHorizontal: 16, borderRadius: radius.md },

  social: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.md,
  },
  socialGoogle: { borderWidth: 1, borderColor: colors.borderStrong },

  field: { gap: 8, width: '100%' },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
  },
  // 테두리가 두꺼워진 만큼 안쪽 여백을 줄여 글자가 움직이지 않게 한다
  fieldBoxFocus: { borderWidth: 2, borderColor: colors.borderBrand, paddingHorizontal: 15 },
  fieldBoxError: { borderWidth: 2, borderColor: colors.borderDanger, paddingHorizontal: 15 },
  fieldInput: { flex: 1, height: '100%', padding: 0, color: colors.textPrimary },

  chipRow: { flexDirection: 'row', gap: 8, width: '100%' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  chipFill: { flex: 1, paddingHorizontal: 8 },
  chipSelected: { backgroundColor: colors.bgBrand, borderColor: colors.bgBrand },
  chipPressed: { backgroundColor: colors.bgSubtle },

  toggle: {
    width: 51,
    height: 31,
    padding: 2,
    borderRadius: radius.full,
    backgroundColor: colors.bgToggleOff,
  },
  toggleOn: { backgroundColor: colors.bgBrand },
  toggleKnob: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: colors.bgSurface,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSurface,
  },
  checkboxOn: { backgroundColor: colors.bgBrand, borderColor: colors.bgBrand },

  dayChip: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
  },
  dayChipOn: { backgroundColor: colors.bgBrand },
})
