import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { attachBridge, detachBridge, hasKakaoKey, receiveBridgeResult } from '../lib/kakao'
import { bridgeHtml } from '../lib/kakaoHtml'
import { WEB_URL } from '../config'

// 장소 검색·주소 변환용으로 화면에 보이지 않게 띄워 두는 카카오 SDK 창구 (lib/kakao.js 가 쓴다)
// 루트 레이아웃에 한 번만 둔다. 키가 없으면 아무것도 그리지 않는다
export default function KakaoBridge() {
  const webRef = useRef(null)
  const [html] = useState(() => (hasKakaoKey() ? bridgeHtml() : null))

  useEffect(() => detachBridge, [])

  if (!html) return null

  const onMessage = (event) => {
    let msg
    try {
      msg = JSON.parse(event.nativeEvent.data)
    } catch {
      return
    }
    if (msg.type === 'ready') attachBridge((script) => webRef.current?.injectJavaScript(script))
    else if (msg.type === 'result') receiveBridgeResult(msg.id, msg.result)
    else if (msg.type === 'error' && __DEV__) console.warn('[카카오 검색]', msg.message)
  }

  return (
    <View style={styles.hidden} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <WebView
        ref={webRef}
        source={{ html, baseUrl: WEB_URL }}
        originWhitelist={['*']}
        onMessage={onMessage}
        // 창구가 죽으면(안드로이드 렌더러 종료 등) 검색은 예시 결과로 돌아간다
        onRenderProcessGone={detachBridge}
        onContentProcessDidTerminate={detachBridge}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  // 크기가 0이면 일부 기기에서 스크립트가 돌지 않아 1px로 두고 화면 밖으로 뺀다
  hidden: { position: 'absolute', left: -10, top: -10, width: 1, height: 1, opacity: 0, pointerEvents: 'none' },
})
