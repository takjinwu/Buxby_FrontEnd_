import { Children, createContext, useContext } from 'react'
import { Text, useWindowDimensions } from 'react-native'
import { colors, textTones, typography } from '../theme/tokens'

// 좁은 화면(360px 미만)에서 큰 숫자 글자를 줄인다 (웹 @media max-width: 359px)
const NARROW_VARIANTS = {
  displayTime: { fontSize: 60, lineHeight: 72 },
  displayL: { fontSize: 28, lineHeight: 36 },
}

// RN은 CSS처럼 글자색이 부모에서 자식으로 상속되지 않는다.
// 어두운 화면(알람·브랜드 배경)은 이 컨텍스트로 기본 글자색을 흰색으로 바꾼다.
export const ForegroundContext = createContext(colors.textPrimary)

// 웹의 className="t-title-s c-secondary" → <AppText variant="titleS" color="secondary">
// - variant: theme/tokens.js 의 typography 키 (기본 bodyM)
// - color: textTones 키(primary·secondary·tertiary·brand·danger·success·onBrand·disabled) 또는 색 값.
//          지정하지 않으면 화면의 기본 글자색
export default function AppText({ variant = 'bodyM', color, style, ...rest }) {
  const foreground = useContext(ForegroundContext)
  const { width } = useWindowDimensions()
  const resolved = color ? (textTones[color] ?? color) : foreground
  const narrow = width < 360 ? NARROW_VARIANTS[variant] : null
  return <Text style={[typography[variant], narrow, { color: resolved }, style]} {...rest} />
}

// 버튼·칩처럼 아이콘과 글자를 가로로 늘어놓는 곳에서 children을 그린다.
// 연속된 문자열·숫자는 하나의 AppText로 묶는다 ({p}분 → "10분" 한 덩어리), 나머지(아이콘 등)는 그대로.
export function textChildren(children, textProps) {
  const out = []
  let run = []
  const flush = () => {
    if (run.length === 0) return
    out.push(
      <AppText key={`text-${out.length}`} {...textProps}>
        {run}
      </AppText>,
    )
    run = []
  }
  Children.toArray(children).forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') run.push(child)
    else {
      flush()
      out.push(child)
    }
  })
  flush()
  return out
}
