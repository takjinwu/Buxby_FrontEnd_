import { useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import {
  ArrowRight,
  BusFront,
  CarFront,
  ChevronRight,
  Info,
  Minus,
  Plus,
  Sparkle,
  SquareArrowOutUpRight,
} from 'lucide-react-native'
import AppText from './AppText'
import { Toggle, inputFont } from './controls'
import { colors, overlay, radius, shadows } from '../theme/tokens'

const PREP_MINUTES_MAX = 120
const clampMinutes = (n) => Math.min(PREP_MINUTES_MAX, Math.max(0, n))

// 누르면 배경이 살짝 어두워지는 줄 (웹에서는 button이던 행들)
const rowPressed = ({ pressed }) => pressed && { backgroundColor: colors.bgCanvas }

// 흰 카드. iOS는 overflow: hidden이 그림자까지 잘라서 그림자 상자(바깥)와 내용 상자(안쪽)를 나눴다.
// - style: 안쪽 내용 상자 (padding·gap·배경 등 웹 className으로 주던 것)
// - containerStyle: 바깥 상자 (margin·flex 등 배치)
export function Card({ padded = false, style, containerStyle, children }) {
  return (
    <View style={[styles.cardShadow, containerStyle]}>
      <View style={[styles.card, padded && styles.cardPadded, style]}>{children}</View>
    </View>
  )
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />
}

const TILE_TONE = {
  brand: { bg: colors.bgBrandSubtle, fg: colors.iconBrand },
  'brand-strong': { bg: colors.bgBrandSubtle, fg: colors.iconStrong },
  danger: { bg: colors.bgDangerSubtle, fg: colors.iconDanger },
  success: { bg: colors.bgSuccessSubtle, fg: colors.iconSuccess },
  solid: { bg: colors.bgBrand, fg: colors.iconInverse },
  white: { bg: colors.bgSurface, fg: colors.iconBrand },
}

export function IconTile({ icon: TileIcon, size = 44, iconSize = 24, tone = 'brand', round = false }) {
  const { bg, fg } = TILE_TONE[tone]
  return (
    <View
      style={[
        styles.iconTile,
        { width: size, height: size, backgroundColor: bg, borderRadius: round ? radius.full : radius.md },
      ]}
    >
      <TileIcon size={iconSize} color={fg} />
    </View>
  )
}

// 피그마 ListRow: 라벨 위 · 값 아래 · 화살표. onPress가 있으면 누를 수 있다
export function ListRow({ icon: RowIcon, label, value, placeholder, onPress, chevron = true, badge }) {
  const body = (
    <>
      {RowIcon && <RowIcon size={24} color={colors.iconStrong} />}
      <View style={styles.listRowText}>
        <AppText variant="bodyS" color="secondary">
          {label}
        </AppText>
        <View style={styles.listRowValue}>
          <AppText variant="bodyLBold" color={value ? 'primary' : 'tertiary'} style={styles.shrink}>
            {value || placeholder}
          </AppText>
          {badge}
        </View>
      </View>
      {chevron && <ChevronRight size={24} color={colors.iconDefault} />}
    </>
  )
  if (!onPress) return <View style={styles.listRow}>{body}</View>
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={(s) => [styles.listRow, rowPressed(s)]}>
      {body}
    </Pressable>
  )
}

// 피그마 SettingRow: Control=Toggle / Value
// onToggle이 있으면 오른쪽에 토글, 없으면 값 + 화살표 (onPress로 누를 수 있음)
export function SettingRow({ title, description, checked, onToggle, value, onPress }) {
  const isToggle = typeof onToggle === 'function'
  const body = (
    <>
      <View style={styles.settingRowText}>
        <AppText variant="bodyMMedium" color="primary">
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" color="secondary">
            {description}
          </AppText>
        ) : null}
      </View>
      {isToggle ? (
        <Toggle checked={checked} onChange={onToggle} label={title} />
      ) : (
        <View style={styles.settingRowValue}>
          <AppText variant="bodyMMedium" color="brand">
            {value}
          </AppText>
          <ChevronRight size={20} color={colors.iconDefault} />
        </View>
      )}
    </>
  )
  if (isToggle || !onPress) return <View style={styles.settingRow}>{body}</View>
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={(s) => [styles.settingRow, rowPressed(s)]}>
      {body}
    </Pressable>
  )
}

const BADGE_TONE = {
  success: { bg: colors.bgSuccessSubtle, text: colors.textSuccess },
  danger: { bg: colors.bgDangerSubtle, text: colors.textDanger },
  brand: { bg: colors.bgBrandSubtle, text: colors.textBrand },
  neutral: { bg: colors.bgSubtle, text: colors.textSecondary },
}

// 피그마 Badge: Tone=Success(실시간)/Danger(지연)/Brand(추천)/Neutral(광고)
export function Badge({ tone = 'brand', style, children }) {
  const { bg, text } = BADGE_TONE[tone]
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <AppText variant="captionMedium" color={text} numberOfLines={1}>
        {children}
      </AppText>
    </View>
  )
}

// 피그마 AlertBanner: Tone=Danger/Info. children은 본문 (안에 <AppText>를 넣어 일부만 굵게 할 수 있다)
export function AlertBanner({ tone = 'info', icon, title, children }) {
  const danger = tone === 'danger'
  const BannerIcon = icon ?? (danger ? BusFront : Info)
  return (
    <View
      style={[styles.alert, { backgroundColor: danger ? colors.bgDangerSubtle : colors.bgBrandSubtle }]}
      accessibilityRole={danger ? 'alert' : 'summary'}
    >
      <View style={styles.alertTile}>
        <BannerIcon size={28} color={danger ? colors.iconDanger : colors.iconBrand} />
      </View>
      <View style={styles.alertText}>
        {title ? (
          <AppText variant="titleS" color={danger ? 'danger' : 'brand'}>
            {title}
          </AppText>
        ) : null}
        <AppText variant="bodyS" color="primary">
          {children}
        </AppText>
      </View>
    </View>
  )
}

const BUS_ROW = {
  bus: { tone: 'brand', Icon: BusFront, Trail: ChevronRight, trailColor: colors.iconDefault },
  alt: { tone: 'danger', Icon: BusFront, Trail: ChevronRight, trailColor: colors.iconDefault },
  drt: { tone: 'success', Icon: CarFront, Trail: SquareArrowOutUpRight, trailColor: colors.iconStrong },
}

// 피그마 BusRow: Type=Bus/AltBus/DRT
export function BusRow({ type = 'bus', route, tag, sub, onPress }) {
  const { tone, Icon, Trail, trailColor } = BUS_ROW[type]
  return (
    <View style={styles.busRowShadow}>
      <Pressable onPress={onPress} accessibilityRole="button" style={(s) => [styles.busRow, rowPressed(s)]}>
        <IconTile icon={Icon} tone={tone} />
        <View style={styles.busRowText}>
          <View style={styles.busRowTitle}>
            <AppText variant="bodyLBold" color="primary">
              {route}
            </AppText>
            {tag ? (
              <AppText variant="bodyS" color="secondary">
                {tag}
              </AppText>
            ) : null}
          </View>
          <AppText variant="bodyS" color="secondary">
            {sub}
          </AppText>
        </View>
        <Trail size={24} color={trailColor} />
      </Pressable>
    </View>
  )
}

function TimeBox({ label, minutes }) {
  return (
    <View style={styles.timeBox}>
      <AppText variant="bodyS" color="secondary">
        {label}
      </AppText>
      <AppText variant="titleS" color="primary">
        {minutes}분
      </AppText>
    </View>
  )
}

// 피그마 TimeRange: 최소·최대 소요 시간 (max가 없으면 '약 N분' 하나만)
export function TimeRange({ min, max, header = '예상 소요 시간 (도보 포함)' }) {
  return (
    <View style={styles.timeRange}>
      <AppText variant="bodySMedium" color="secondary">
        {header}
      </AppText>
      <View style={styles.timeRangeRow}>
        {max == null ? (
          <TimeBox label="약" minutes={min} />
        ) : (
          <>
            <TimeBox label="최소" minutes={min} />
            <ArrowRight size={24} color={colors.iconDefault} />
            <TimeBox label="최대" minutes={max} />
          </>
        )}
      </View>
    </View>
  )
}

// 피그마 AdBanner: 무료 이용자 광고 자리 (홈·경로 하단만, 알람 화면 제외)
export function AdBanner({ hidden }) {
  if (hidden) return null
  return (
    <View style={styles.adBanner} accessibilityLabel="광고">
      <Badge tone="neutral">광고</Badge>
      <View style={styles.adBannerText}>
        <AppText variant="bodySMedium" color="secondary">
          광고 영역
        </AppText>
        <AppText variant="caption" color="tertiary">
          광고 제거 ₩3,900 (한 번 결제)
        </AppText>
      </View>
    </View>
  )
}

// 숫자 + '분' 입력 상자 (웹 .stepper__field). MinutesField·MinutesSheet가 같이 쓴다
// - size 's': −/+ 사이의 작은 칸, 'l': 큰 한 줄 입력칸
// 웹은 숫자 자릿수(ch)만큼 너비를 잡아 숫자+단위를 가운데 정렬했다 → 자릿수 × 글자 폭으로 근사
const NUMBER_BOX = {
  s: { font: 'bodyMMedium', unit: 'bodyS', digit: 9.5 },
  l: { font: 'displayL', unit: 'titleS', digit: 21 },
}

export function NumberBox({ value, onChangeText, size = 's', error, style, ...rest }) {
  const [focused, setFocused] = useState(false)
  const large = size === 'l'
  const { font, unit, digit } = NUMBER_BOX[size]
  return (
    <View
      style={[
        styles.numberBox,
        large ? styles.numberBoxL : styles.numberBoxS,
        !large && focused && styles.numberBoxFocus,
        error && styles.numberBoxError,
        style,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={3}
        selectTextOnFocus
        style={[
          inputFont(font),
          styles.numberInput,
          { width: Math.max(1, value.length) * digit + 4 },
        ]}
        {...rest}
        onFocus={(e) => {
          setFocused(true)
          rest.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          rest.onBlur?.(e)
        }}
      />
      <AppText variant={unit} color="secondary">
        분
      </AppText>
    </View>
  )
}

// 분 입력칸: 입력하는 동안은 글자 그대로 두고, 포커스가 빠지거나 완료를 누르면 0~120분으로 맞춰 저장
// size="l": D3-1 한 번에 입력용 큰 입력칸
export function MinutesField({ name, minutes, onChange, size = 's' }) {
  const [draft, setDraft] = useState(null)
  const commit = () => {
    if (draft === null) return
    const n = Number.parseInt(draft, 10)
    onChange(Number.isNaN(n) ? minutes : clampMinutes(n))
    setDraft(null)
  }
  return (
    <NumberBox
      size={size}
      value={draft ?? String(minutes)}
      onChangeText={setDraft}
      onBlur={commit}
      accessibilityLabel={`${name} 준비 시간(분)`}
    />
  )
}

function StepButton({ label, onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.stepBtn, pressed && { backgroundColor: colors.bgDisabled }]}
    >
      {children}
    </Pressable>
  )
}

// 피그마 PrepRow: Mode=View/Edit (Edit = 분 직접 입력 + −/+ 1분 조절)
// 이름 칸이 120px보다 좁아지면 −/분/+ 조절을 다음 줄로 내린다
export function PrepRow({ icon, name, sub, minutes, onChange }) {
  return (
    <View style={styles.prepRow}>
      <IconTile icon={icon} tone="brand-strong" />
      <View style={styles.prepRowText}>
        <AppText variant="bodyMMedium" color="primary">
          {name}
        </AppText>
        <AppText variant="bodyS" color="secondary">
          {sub}
        </AppText>
      </View>
      {onChange && (
        <View style={styles.stepper}>
          <StepButton label={`${name} 1분 줄이기`} onPress={() => onChange(clampMinutes(minutes - 1))}>
            <Minus size={16} color={colors.iconStrong} />
          </StepButton>
          <MinutesField name={name} minutes={minutes} onChange={onChange} />
          <StepButton label={`${name} 1분 늘리기`} onPress={() => onChange(clampMinutes(minutes + 1))}>
            <Plus size={16} color={colors.iconStrong} />
          </StepButton>
        </View>
      )}
    </View>
  )
}

const STEP_DOT = {
  walk: { backgroundColor: colors.bgSurface, borderColor: colors.borderStrong },
  ride: { backgroundColor: colors.bgBrandSubtle },
  arrive: { backgroundColor: colors.textDanger, borderColor: colors.borderDanger },
}

// 피그마 RouteStep: Type=Walk/Board/Ride/Alight/Arrive (세로 선으로 이어지는 경로 단계)
export function RouteStep({ type, title, sub }) {
  return (
    <View style={styles.routeStep}>
      <View style={styles.routeRail}>
        <View style={[styles.routeDot, STEP_DOT[type]]} />
        {type !== 'arrive' && <View style={[styles.routeLine, type === 'walk' && styles.routeLineWalk]} />}
      </View>
      <View style={styles.routeStepText}>
        <AppText variant={type === 'ride' ? 'bodyS' : 'bodyMMedium'} color={type === 'ride' ? 'secondary' : 'primary'}>
          {title}
        </AppText>
        <AppText variant="caption" color="secondary">
          {sub}
        </AppText>
      </View>
    </View>
  )
}

// 피그마 NotificationCard: 푸시 알림 모양 카드 (어두운 알람 화면 위에 놓인다)
export function NotificationCard({ icon: CardIcon = BusFront, title, body, time = '지금', onPress }) {
  return (
    <View style={styles.notiShadow}>
      <Pressable onPress={onPress} accessibilityRole="button" style={(s) => [styles.notiCard, rowPressed(s)]}>
        <View style={styles.notiIcon}>
          <CardIcon size={20} color={colors.iconInverse} />
        </View>
        <View style={styles.notiText}>
          <View style={styles.notiTop}>
            <AppText variant="captionMedium" color="secondary">
              버스비
            </AppText>
            <AppText variant="caption" color="tertiary">
              {time}
            </AppText>
          </View>
          <AppText variant="bodyMMedium" color="primary">
            {title}
          </AppText>
          <AppText variant="bodyS" color="secondary">
            {body}
          </AppText>
        </View>
      </Pressable>
    </View>
  )
}

// 일러스트 자리 (디자인 보완 요청 대상)
export function IllustrationSlot({ height = 96, width, label }) {
  return (
    <View style={[styles.illust, { height }, width != null && { width }]} accessibilityRole="image" accessibilityLabel={label || '일러스트'}>
      <Sparkle size={height > 120 ? 40 : 28} color={colors.iconBrand} />
      {label ? (
        <AppText variant="caption" color="brand">
          {label}
        </AppText>
      ) : null}
    </View>
  )
}

export function SectionLabel({ children }) {
  return (
    <AppText variant="bodySMedium" color="secondary" style={styles.sectionLabel}>
      {children}
    </AppText>
  )
}

const NOTICE_TONE = {
  brand: { bg: colors.bgBrandSubtle, fg: colors.textBrand, variant: 'captionMedium' },
  neutral: { bg: colors.bgCanvas, fg: colors.textSecondary, variant: 'caption' },
}

// 안내 문구 상자. center: 아이콘(16px)을 문구와 세로 가운데로 맞춤 (E2)
export function Notice({ icon: NoticeIcon = Info, tone = 'brand', center = false, children }) {
  const { bg, fg, variant } = NOTICE_TONE[tone]
  return (
    <View style={[styles.notice, { backgroundColor: bg, alignItems: center ? 'center' : 'flex-start' }]}>
      <NoticeIcon size={center ? 16 : 18} color={fg} />
      <AppText variant={variant} color={fg} style={styles.shrink}>
        {children}
      </AppText>
    </View>
  )
}

// 잠깐 보였다 사라지는 안내 (useToast와 함께). Screen 바로 안쪽 맨 끝에 둔다
export function Toast({ message }) {
  if (!message) return null
  return (
    <View style={styles.toastLayer} accessibilityLiveRegion="polite">
      <View style={styles.toast}>
        <AppText variant="bodySMedium" color="onBrand" style={styles.toastText}>
          {message}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },

  cardShadow: { width: '100%', borderRadius: radius.lg, backgroundColor: colors.bgSurface, ...shadows.card },
  card: { borderRadius: radius.lg, overflow: 'hidden' },
  cardPadded: { paddingVertical: 16, paddingHorizontal: 20, gap: 12 },
  divider: { height: 1, marginHorizontal: 20, backgroundColor: colors.borderDefault },

  iconTile: { alignItems: 'center', justifyContent: 'center' },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.bgSurface,
  },
  listRowText: { flex: 1, gap: 2, minWidth: 0 },
  listRowValue: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.bgSurface,
  },
  settingRowText: { flex: 1, gap: 2 },
  settingRowValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  badge: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.sm },

  alert: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%', padding: 20, borderRadius: radius.lg },
  alertTile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
  },
  alertText: { flex: 1, gap: 4 },

  busRowShadow: { width: '100%', borderRadius: radius.lg, backgroundColor: colors.bgSurface, ...shadows.card },
  busRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
  },
  busRowText: { flex: 1, gap: 2 },
  busRowTitle: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },

  timeRange: { gap: 12, width: '100%', padding: 16, borderRadius: radius.lg, backgroundColor: colors.bgSubtle },
  timeRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
  },

  adBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minHeight: 72,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
  },
  adBannerText: { flex: 1, gap: 2 },

  numberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSurface,
  },
  numberBoxS: {
    gap: 2,
    width: 64,
    height: 32,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
  },
  numberBoxFocus: { borderWidth: 2, borderColor: colors.borderBrand, paddingHorizontal: 7 },
  numberBoxL: {
    flex: 1,
    gap: 4,
    height: 64,
    borderWidth: 2,
    borderColor: colors.borderBrand,
    borderRadius: radius.md,
  },
  numberBoxError: { borderColor: colors.borderDanger },
  numberInput: {
    padding: 0,
    textAlign: 'center',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  prepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: 8,
    columnGap: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.bgSurface,
  },
  prepRowText: { flexGrow: 1, flexShrink: 1, flexBasis: 120, gap: 2, minWidth: 0 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
  },

  routeStep: { flexDirection: 'row', gap: 16 },
  routeRail: { width: 16, alignItems: 'center' },
  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.borderBrand,
    backgroundColor: colors.bgBrand,
  },
  routeLine: { flex: 1, width: 4, minHeight: 40, backgroundColor: colors.bgBrand },
  routeLineWalk: { width: 2, backgroundColor: colors.borderStrong },
  routeStepText: { flex: 1, gap: 2, paddingBottom: 20 },

  notiShadow: { width: '100%', borderRadius: radius.xl, backgroundColor: colors.bgSurface, ...shadows.card },
  notiCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.bgSurface,
  },
  notiIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.bgBrand,
  },
  notiText: { flex: 1, gap: 2 },
  notiTop: { flexDirection: 'row', justifyContent: 'space-between' },

  illust: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.bgBrandSubtle,
  },

  sectionLabel: { paddingTop: 4 },

  notice: { flexDirection: 'row', gap: 8, width: '100%', paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.md },

  toastLayer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 96,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  toast: {
    maxWidth: 342,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: overlay.toast,
    ...shadows.card,
  },
  toastText: { textAlign: 'center' },
})

