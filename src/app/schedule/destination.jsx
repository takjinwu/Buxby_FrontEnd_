import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { MapPin, Search, X } from 'lucide-react-native'
import AppText from '../../components/AppText'
import { Content, IconButton, Screen, TopBar } from '../../components/layout'
import { inputFont } from '../../components/controls'
import { Badge } from '../../components/display'
import { DESTINATION_RESULTS, RECENT_SEARCHES } from '../../data/mock'
import { searchPlaces } from '../../lib/kakao'
import { useAppState } from '../../store/context'
import { colors, radius } from '../../theme/tokens'

// B4 목적지 검색 (카카오 장소 검색, 키가 없으면 예시 결과) — 웹 pages/home/DestinationSearchPage.jsx
export default function DestinationSearchScreen() {
  const { update } = useAppState()
  const [keyword, setKeyword] = useState('동양미래')
  const [results, setResults] = useState(DESTINATION_RESULTS)

  useEffect(() => {
    const q = keyword.trim()
    let cancelled = false
    const timer = setTimeout(async () => {
      if (!q) {
        if (!cancelled) setResults([])
        return
      }
      const found = await searchPlaces(q)
      if (cancelled) return
      setResults(found ?? DESTINATION_RESULTS.filter((p) => p.name.includes(q) || p.address.includes(q)))
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [keyword])

  const select = (place) => {
    // 목적지가 바뀌면 이전 경로는 쓸 수 없다
    update({ destination: place, route: null, routeDetail: null, routeOptions: null })
    router.navigate('/home')
  }

  return (
    <Screen bg="surface">
      <TopBar title="목적지" />
      <Content gap={16}>
        <View style={styles.searchBox}>
          <Search size={20} color={colors.iconDefault} />
          <TextInput
            style={[styles.searchInput, inputFont('bodyM')]}
            value={keyword}
            onChangeText={setKeyword}
            placeholder="학교, 회사, 장소 이름"
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel="목적지 검색"
            returnKeyType="search"
            autoFocus
          />
          {keyword ? (
            <IconButton onPress={() => setKeyword('')} accessibilityLabel="검색어 지우기">
              <X size={18} color={colors.iconDefault} />
            </IconButton>
          ) : null}
        </View>
        <View style={styles.recent}>
          <AppText variant="captionMedium" color="secondary">
            최근
          </AppText>
          {RECENT_SEARCHES.map((w) => (
            <Pressable key={w} onPress={() => setKeyword(w)} accessibilityRole="button" style={styles.pill}>
              <AppText variant="caption" color="secondary">
                {w}
              </AppText>
            </Pressable>
          ))}
        </View>
        <AppText variant="bodySMedium" color="secondary">
          검색 결과 {results.length}
        </AppText>
        <View>
          {results.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => select(p)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.result, pressed && styles.resultPressed]}
            >
              <MapPin size={20} color={i === 0 ? colors.iconBrand : colors.iconDefault} />
              <View style={styles.resultText}>
                <AppText variant="bodyMMedium">{p.name}</AppText>
                <AppText variant="caption" color="secondary">
                  {p.address}
                </AppText>
              </View>
              <Badge tone="neutral">{p.category}</Badge>
            </Pressable>
          ))}
        </View>
        <AppText variant="caption" color="tertiary">
          장소 검색은 카카오 장소 검색(Places) 결과를 보여줘요.
        </AppText>
      </Content>
    </Screen>
  )
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: colors.borderBrand,
    borderRadius: radius.md,
    backgroundColor: colors.bgSubtle,
  },
  searchInput: { flex: 1, minWidth: 0, height: '100%', padding: 0, color: colors.textPrimary },
  recent: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  pill: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: colors.bgSubtle },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  resultPressed: { backgroundColor: colors.bgCanvas },
  resultText: { flex: 1, gap: 2 },
})
