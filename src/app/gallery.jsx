import { useState } from 'react'
import { View } from 'react-native'
import { BedDouble, Clock, MapPin, School } from 'lucide-react-native'
import AppText from '../components/AppText'
import { BottomSheet, Content, Footer, Screen, TopBar } from '../components/layout'
import { Button, Checkbox, Chip, ChipRow, DayChip, InputField, SocialLoginButton, Toggle } from '../components/controls'
import {
  AdBanner,
  AlertBanner,
  Badge,
  BusRow,
  Card,
  Divider,
  IconTile,
  IllustrationSlot,
  ListRow,
  MinutesField,
  Notice,
  NotificationCard,
  PrepRow,
  RouteStep,
  SectionLabel,
  SettingRow,
  TimeRange,
  Toast,
} from '../components/display'
import MinutesSheet from '../components/MinutesSheet'
import { DAYS } from '../store/context'
import { ROUTE_STEPS } from '../data/mock'
import { useToast } from '../lib/useToast'

// 2단계 공통 컴포넌트 검수용 화면 (/gallery). 화면 목록(/screens)에서 들어온다
export default function GalleryScreen() {
  const [category, setCategory] = useState('수업')
  const [days, setDays] = useState(['월', '화', '수', '목', '금'])
  const [toggle, setToggle] = useState(true)
  const [check, setCheck] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [prep, setPrep] = useState(15)
  const [total, setTotal] = useState(30)
  const [sheet, setSheet] = useState(false)
  const [minutesSheet, setMinutesSheet] = useState(false)
  const [buffer, setBuffer] = useState(10)
  const [toast, showToast] = useToast()

  const toggleDay = (d) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  return (
    <Screen>
      <TopBar title="컴포넌트 검수" action={{ label: '토스트', onPress: () => showToast('토스트 메시지예요') }} />
      <Content gap={16}>
        <SectionLabel>글자 스타일</SectionLabel>
        <AppText variant="displayL">7:12</AppText>
        <AppText variant="titleL">제목 L</AppText>
        <AppText variant="titleS" color="brand">
          제목 S · 브랜드색
        </AppText>
        <AppText variant="bodyS" color="secondary">
          본문 S · 보조색
        </AppText>

        <SectionLabel>버튼</SectionLabel>
        <Button onPress={() => showToast('Primary')}>Primary L</Button>
        <Button variant="secondary">Secondary L</Button>
        <Button variant="tertiary">Tertiary L</Button>
        <Button disabled>Disabled</Button>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="m" variant="secondary" style={{ flex: 1 }}>
            Secondary M
          </Button>
          <Button size="m" style={{ flex: 1 }}>
            Primary M
          </Button>
        </View>
        <SocialLoginButton provider="kakao" onPress={() => showToast('카카오')} />
        <SocialLoginButton provider="naver" />
        <SocialLoginButton provider="google" />

        <SectionLabel>입력</SectionLabel>
        <InputField label="이메일" type="email" placeholder="buxby@example.com" value={email} onChangeText={setEmail} />
        <InputField
          label="비밀번호"
          type="password"
          placeholder="8자 이상"
          value={password}
          onChangeText={setPassword}
          error={password && password.length < 8 ? '8자 이상 입력해 주세요.' : ''}
          helper="영문·숫자 포함"
        />

        <SectionLabel>칩 · 요일 · 토글 · 체크박스</SectionLabel>
        <ChipRow>
          {['수업', '출근', '기타'].map((c) => (
            <Chip key={c} icon={c === '수업' ? School : undefined} selected={category === c} onPress={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow fill>
          {[5, 10, 15].map((m) => (
            <Chip key={m} selected={buffer === m} onPress={() => setBuffer(m)}>
              {m}분
            </Chip>
          ))}
        </ChipRow>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {DAYS.map((d) => (
            <DayChip key={d} selected={days.includes(d)} onPress={() => toggleDay(d)}>
              {d}
            </DayChip>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Toggle checked={toggle} onChange={setToggle} label="토글" />
          <Checkbox checked={check} onChange={setCheck} label="체크박스" />
          <AppText variant="bodyS" color="secondary">
            토글 {toggle ? '켜짐' : '꺼짐'} · 체크 {check ? '됨' : '안 됨'}
          </AppText>
        </View>

        <SectionLabel>카드 · 목록</SectionLabel>
        <Card>
          <ListRow icon={MapPin} label="목적지" value="동양미래대학교" onPress={() => showToast('목적지')} badge={<Badge>추천</Badge>} />
          <Divider />
          <ListRow icon={Clock} label="도착 시간" placeholder="도착 시간을 정해 주세요" onPress={() => {}} />
          <Divider />
          <SettingRow title="안전 알람" description="미루기 상한에 한 번 더 울려요" checked={toggle} onToggle={setToggle} />
          <Divider />
          <SettingRow title="여유 시간" value={`${buffer}분`} onPress={() => setMinutesSheet(true)} />
        </Card>
        <Card padded>
          <AppText variant="titleS">패딩 카드</AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Badge tone="success">실시간</Badge>
            <Badge tone="danger">지연</Badge>
            <Badge tone="brand">추천</Badge>
            <Badge tone="neutral">광고</Badge>
          </View>
        </Card>
        <Card>
          <PrepRow icon={BedDouble} name="세면 및 샤워" sub={`${prep}분`} minutes={prep} onChange={setPrep} />
        </Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <MinutesField name="한 번에" minutes={total} onChange={setTotal} size="l" />
        </View>

        <SectionLabel>안내</SectionLabel>
        <AlertBanner tone="danger" title="160번 12분 지연">
          {'도로 상황으로 늦어지고 있어요.\n다른 방법을 확인해 보세요.'}
        </AlertBanner>
        <AlertBanner title="준비 시간을 배우는 중">7일 동안 기록하면 더 정확해져요.</AlertBanner>
        <Notice>알람은 앱이 꺼져 있어도 울려요.</Notice>
        <Notice tone="neutral" center>
          중립 안내 · 가운데 정렬
        </Notice>
        <TimeRange min={28} max={41} />
        <TimeRange min={32} />
        <BusRow route="160번" tag="(다음 버스)" sub="오전 7:32" onPress={() => showToast('160번')} />
        <BusRow type="alt" route="503번" tag="(대체 노선)" sub="오전 7:36" />
        <BusRow type="drt" route="똑버스(DRT) 안내" sub="운행 지역·시간 확인하기" />
        <View>
          {ROUTE_STEPS.map((step, i) => (
            <RouteStep key={i} {...step} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <IconTile icon={School} />
          <IconTile icon={School} tone="danger" />
          <IconTile icon={School} tone="success" round />
          <IconTile icon={School} tone="solid" size={56} iconSize={28} />
        </View>
        <IllustrationSlot height={120} label="일러스트 자리" />
        <AdBanner />
        <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#1c2340' }}>
          <NotificationCard title="지금 나가야 해요" body="160번이 3정류장 전, 약 7분 후 도착해요." onPress={() => showToast('알림')} />
        </View>
      </Content>
      <Footer>
        <Button variant="secondary" onPress={() => setSheet(true)}>
          바텀시트 열기
        </Button>
      </Footer>

      <BottomSheet open={sheet} title="바텀시트" onClose={() => setSheet(false)}>
        <AppText variant="bodyS" color="secondary">
          바깥을 누르거나 안드로이드 뒤로 가기로 닫혀요.
        </AppText>
        <Button onPress={() => setSheet(false)}>닫기</Button>
      </BottomSheet>
      <MinutesSheet
        open={minutesSheet}
        title="여유 시간"
        description="정류장에 도착해서 기다릴 시간이에요."
        presets={[5, 10, 15]}
        value={buffer}
        min={1}
        max={60}
        onClose={() => setMinutesSheet(false)}
        onConfirm={(m) => {
          setBuffer(m)
          setMinutesSheet(false)
        }}
      />
      <Toast message={toast} />
    </Screen>
  )
}
