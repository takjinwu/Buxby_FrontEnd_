import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { colors, radius, spacing, typography } from '../theme/tokens'

// 1단계(뼈대)용 임시 화면. 3단계에서 실제 화면으로 바꾼다.
// links: 원본 웹 화면에서 이동하던 경로들 — 화면 흐름을 미리 눌러 볼 수 있게 한다.
export default function Placeholder({ title, source, links = [], showBack = true }) {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'))

  return (
    <SafeAreaView style={styles.screen} edges={showBack ? ['top', 'bottom'] : ['top']}>
      <View style={styles.topbar}>
        {showBack && (
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="뒤로 가기">
            <ChevronLeft size={24} color={colors.iconStrong} />
          </Pressable>
        )}
        <Text style={[typography.titleS, styles.title]}>{title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <Text style={[typography.bodyMMedium, { color: colors.textBrand }]}>준비 중인 화면</Text>
          <Text style={[typography.bodyS, { color: colors.textSecondary }]}>
            3단계에서 웹 화면을 옮겨 올 예정이에요.
          </Text>
          {source && <Text style={[typography.caption, { color: colors.textTertiary }]}>원본: {source}</Text>}
        </View>

        {links.map((link) => (
          <Pressable
            key={link.href}
            onPress={() => router.push(link.href)}
            style={({ pressed }) => [styles.link, pressed && { backgroundColor: colors.bgSubtle }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMMedium, { color: colors.textPrimary }]}>{link.label}</Text>
              <Text style={[typography.caption, { color: colors.textTertiary }]}>{link.href}</Text>
            </View>
            <ChevronRight size={20} color={colors.iconDefault} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    height: 56,
    paddingHorizontal: spacing[16],
  },
  title: { color: colors.textPrimary },
  content: { padding: spacing[16], gap: spacing[12] },
  notice: {
    gap: spacing[4],
    padding: spacing[16],
    borderRadius: radius.lg,
    backgroundColor: colors.bgBrandSubtle,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[16],
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderDefault,
  },
})
