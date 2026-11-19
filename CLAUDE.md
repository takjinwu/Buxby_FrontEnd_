@AGENTS.md

# 버스비 (React Native / Expo)

웹 버전(React + Vite, `D:\mars\Buxby_Frontend`)을 Expo로 옮기는 중인 프로젝트다.
**원본 웹 레포는 읽기 전용 참고 자료로만 쓴다. 그쪽 파일은 수정하지 않는다.**

- Expo SDK 58 · React Native 0.88 · React 19.3 · Expo Router · **JavaScript (TS 아님, 원본과 동일)**
- 패키지는 항상 `npx expo install <pkg>` 로 설치 (SDK 호환 버전 자동 선택)
- 이 PC에서 npm 레지스트리 타임아웃이 잦다 → `-- --fetch-retries=5 --fetch-timeout=120000` 를 붙인다
- 작업을 마치기 전에 `npx expo lint` 와 `npx expo export --platform android --output-dir <임시 폴더>`(번들 확인)를 돌린다

## 이전 단계

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | Expo 뼈대, 라우팅, `lib/`·`api/`·`store/`·`data/` 이식, 디자인 토큰 | 완료 |
| 2 | 공통 컴포넌트 (`controls`, `display`, `layout`, `MinutesSheet`, `BrandLogos`) | |
| 3 | 화면 이식 (`src/app/**` 의 Placeholder를 실제 화면으로) | |
| 4 | 카카오 지도 (`KakaoMap.jsx`, `lib/kakao.js`) — WebView + JS SDK 우선 | |
| 5 | 간편 로그인 (시스템 브라우저 + `buxby://` 딥링크, 토큰 저장) — 백엔드 수정 필요 | |
| 6 | 알람 (`AlarmWatcher.jsx` → 로컬 알림 예약, 출발 알림은 서버 푸시) | |

## 폴더 구조

```
src/
  app/          Expo Router 화면 (파일 = 경로). 화면 외 코드는 두지 않는다
  components/   공통 컴포넌트
  lib/          순수 로직 (원본에서 그대로 복사)
  api/          백엔드 호출 (client.js가 API_URL을 붙임)
  store/        전역 상태 (AppStateProvider: AsyncStorage에 저장)
  data/mock.js  예시 데이터 (원본 그대로)
  theme/tokens.js  디자인 토큰 (원본 styles/tokens.css)
  config.js     환경 변수 (EXPO_PUBLIC_*)
```

## 경로 대응표 (웹 react-router → Expo Router)

URL은 웹과 똑같이 유지해서 `navigate('/x')` 를 `router.push('/x')` 로 바로 바꿀 수 있게 했다.

| 웹 경로 | 원본 파일 (`src/pages/`) | Expo 파일 (`src/app/`) |
|---|---|---|
| `/` | auth/StartPage | `index.jsx` |
| `/login` · `/signup` · `/permissions` | auth/LoginPage · SignupPage · PermissionPage | `login.jsx` · `signup.jsx` · `permissions.jsx` |
| `/home` (탭) | home/HomePage (+ArrivalSheet) | `(tabs)/home.jsx` |
| `/schedule/destination` · `origin` · `route` | home/DestinationSearchPage · OriginSelectPage · RouteSelectPage | `schedule/*.jsx` |
| `/route` (탭) | route/RecommendRoutePage | `(tabs)/route.jsx` |
| `/route/detail` · `options` · `delay` | route/RouteDetailPage · RouteOptionsPage · DelayPage | `route/*.jsx` |
| `/alarm` (탭) | alarm/PrepLearningPage | `(tabs)/alarm.jsx` |
| `/alarm/prep` · `settings` · `wake` · `depart` · `postponed` | alarm/PrepEditPage · AlarmSettingsPage · WakeAlarmPage · DepartAlarmPage · PostponedPage | `alarm/*.jsx` |
| `/more` (탭) | more/MorePage | `(tabs)/more.jsx` |
| `/more/ad-free` · `/more/permissions` | more/AdFreePage · PermissionSettingsPage | `more/*.jsx` |
| `/screens` | ScreensPage | `screens.jsx` |

- 웹의 `<BottomNav />` 는 `(tabs)/_layout.jsx` 의 Tabs가 대신한다. 화면에서 BottomNav를 그리지 않는다.
- 헤더는 모두 `headerShown: false`. 원본처럼 화면마다 TopBar 컴포넌트를 쓴다.

## 변환 규칙 (웹 → RN)

- 태그: `div/section/main/header/nav` → `View`, 글자는 반드시 `Text` 안에, `button`/클릭 요소 → `Pressable`, `input` → `TextInput`, 스크롤 영역 → `ScrollView`, 긴 목록 → `FlatList`
- 이벤트: `onClick` → `onPress`, `onChange(e => e.target.value)` → `onChangeText(text)`
- 스타일: `className` + CSS → 컴포넌트 파일 아래 `StyleSheet.create`. 값은 `theme/tokens.js` 에서 가져온다
  - `var(--text-primary)` → `colors.textPrimary`, `.t-title-s` → `typography.titleS`, `--radius-md` → `radius.md`, `--shadow-card` → `shadows.card`
  - RN은 flexbox만 있고 기본 방향이 `column`. `grid`·`position: fixed`·가상 선택자(`:hover`)·CSS 상속이 없다 (글자색은 Text마다 지정)
- 라우팅: `useNavigate()` → `router` (`expo-router`), `navigate(-1)` → `router.back()`, `navigate(p, { replace: true })` → `router.replace(p)`, `location.state` → `useLocalSearchParams()` 또는 전역 상태
- 아이콘: `lucide-react` → `lucide-react-native` (이름 같음). `color="var(--icon-brand)"` → `color={colors.iconBrand}`
- 안전 영역: 화면 최상단은 `react-native-safe-area-context` 의 `SafeAreaView` / `useSafeAreaInsets`
- 브라우저 API는 그대로 쓰지 않는다:
  - `localStorage` → 이미 AsyncStorage로 바꿈 (`store/AppStateProvider.jsx`)
  - `navigator.geolocation` → `expo-location`
  - `Notification` → `expo-notifications` (6단계)
  - `window.open(url)` → `Linking.openURL(url)`
  - `import.meta.env.VITE_*` → `config.js` (`process.env.EXPO_PUBLIC_*`)

## 1단계에서 원본과 달라진 점

- `api/client.js`: 상대경로 `/api/...` 앞에 `API_URL` 을 붙인다. `URLSearchParams` 대신 직접 쿼리 문자열을 만들고, 값이 `undefined`/`null` 인 항목은 보내지 않는다 (원본은 `"undefined"` 문자열로 보냈음)
- `api/auth.js`: `socialLogin()` 은 5단계 전까지 "준비 중" 에러를 던진다
- `store/AppStateProvider.jsx`: 저장소를 다 읽기 전(`hydrated=false`)에는 아무것도 그리지 않고 스플래시를 유지한다. 읽기 전에는 저장하지 않는다
- 아직 옮기지 않음: `lib/kakao.js`(4단계), `components/AlarmWatcher.jsx`(6단계), 간편 로그인 리다이렉트 처리(5단계)

## 알려진 문제

- `package.json` 의 `overrides: { "react-dom": "$react" }` 는 지우지 않는다. expo-router가 웹용으로 끌어오는 `react-dom@19.3.1` 이 RN의 `react@19.3.0` 과 peer 충돌을 일으켜 `npm install` 이 실패한다
