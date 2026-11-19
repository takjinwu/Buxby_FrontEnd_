# Buxby_FrontEnd_
버스비 프론트엔드(react native)입니다.

버스 도착에 맞춰 깨워 주는 AI 기상 알람 앱. 웹 버전(React + Vite)을 Expo(React Native)로 옮기는 중입니다.

## 시작하기

```bash
npm install
cp .env.example .env.local   # 필요한 값 채우기
npx expo start
```

- **Android 에뮬레이터**: Android Studio에서 에뮬레이터를 켠 뒤 `npx expo start` 화면에서 `a`
- **실기기**: 폰에 Expo Go를 설치하고 터미널의 QR 코드를 스캔 (PC와 같은 Wi-Fi)
  - 지도·알림 등 네이티브 모듈이 추가되면 Expo Go 대신 개발 빌드(`npx expo run:android` 또는 `eas build --profile development`)가 필요합니다
- **iOS**: Windows에서는 시뮬레이터를 쓸 수 없어 EAS 클라우드 빌드 + Apple 개발자 계정이 필요합니다

## 명령어

| 명령 | 설명 |
|---|---|
| `npx expo start` | 개발 서버 |
| `npm run lint` | ESLint |
| `npm run doctor` | 의존성·설정 진단 |

## 구조

`src/app` 이 화면(파일 기반 라우팅), 나머지는 `src/components`, `src/lib`, `src/api`, `src/store`, `src/theme` 입니다. 자세한 이전 규칙과 진행 상황은 [CLAUDE.md](CLAUDE.md)를 참고하세요.
