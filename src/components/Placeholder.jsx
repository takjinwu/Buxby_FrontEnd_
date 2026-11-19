import { Fragment } from 'react'
import { router } from 'expo-router'
import AppText from './AppText'
import { Content, Screen, TopBar } from './layout'
import { Card, Divider, ListRow, Notice } from './display'

// 1단계(뼈대)용 임시 화면. 3단계에서 실제 화면으로 바꾼다.
// links: 원본 웹 화면에서 이동하던 경로들 — 화면 흐름을 미리 눌러 볼 수 있게 한다.
// showBack={false}: 하단 탭 화면 (큰 제목, 뒤로 가기 없음)
export default function Placeholder({ title, source, links = [], showBack = true }) {
  return (
    <Screen tab={!showBack}>
      <TopBar variant={showBack ? 'back' : 'large'} title={title} />
      <Content gap={12}>
        <Notice>
          3단계에서 웹 화면을 옮겨 올 예정이에요.{source ? `\n원본: ${source}` : ''}
        </Notice>
        {links.length > 0 && (
          <Card>
            {links.map((link, i) => (
              <Fragment key={link.href}>
                {i > 0 && <Divider />}
                <ListRow label={link.href} value={link.label} onPress={() => router.push(link.href)} />
              </Fragment>
            ))}
          </Card>
        )}
        {links.length === 0 && (
          <AppText variant="bodyS" color="tertiary">
            이 화면에서 이동하는 화면이 없어요.
          </AppText>
        )}
      </Content>
    </Screen>
  )
}
