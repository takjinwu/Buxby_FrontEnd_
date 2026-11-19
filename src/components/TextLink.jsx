import { Pressable, StyleSheet, View } from 'react-native'
import AppText from './AppText'

// "아직 계정이 없나요? 회원가입" 처럼 안내 문구 + 파란 링크 한 줄 (웹 .text-link)
export default function TextLink({ prompt, label, onPress }) {
  return (
    <View style={styles.row}>
      <AppText variant="bodyS" color="secondary">
        {prompt}
      </AppText>
      <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8}>
        <AppText variant="bodySMedium" color="brand">
          {label}
        </AppText>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 4 },
})
