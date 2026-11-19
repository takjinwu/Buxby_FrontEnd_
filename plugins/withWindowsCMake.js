// Windows에서 안드로이드 네이티브(C++) 빌드가 경로 260자 제한에 걸리지 않게 한다.
//
// react-native-gesture-handler 3.x 의 android/CMakeLists.txt 는 자기 폴더 밖(../shared)의 .cpp 를
// 컴파일해서, CMake가 오브젝트 파일 경로에 원본 절대 경로를 통째로 넣는다 → 330자 이상.
// SDK 기본 CMake 3.22.1 의 ninja 1.10 은 260자를 넘는 경로를 못 다룬다.
// ninja 1.12+ (CMake 3.31.6 SDK 패키지에 포함)는 Windows "긴 경로 허용"이 켜져 있으면 다룰 수 있다.
//
// 그래서 Windows에서 SDK에 해당 CMake가 설치돼 있으면 android/local.properties 의 cmake.dir 로
// 모든 모듈이 그 CMake를 쓰게 한다. 다른 OS나 CMake가 없으면 아무것도 하지 않는다.
//
// 이 PC에서 필요한 준비 (한 번만):
//   1. 관리자 PowerShell:
//      New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force
//   2. Android SDK에 cmake;3.31.6 설치 (Android Studio SDK Manager 또는 sdkmanager)
const fs = require('fs')
const path = require('path')
const { withDangerousMod } = require('expo/config-plugins')

const CMAKE_VERSION = '3.31.6'

function sdkDir() {
  if (process.env.ANDROID_HOME) return process.env.ANDROID_HOME
  if (process.env.ANDROID_SDK_ROOT) return process.env.ANDROID_SDK_ROOT
  if (process.env.LOCALAPPDATA) return path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')
  return null
}

module.exports = function withWindowsCMake(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      if (process.platform !== 'win32') return cfg
      const sdk = sdkDir()
      const cmakeDir = sdk && path.join(sdk, 'cmake', CMAKE_VERSION)
      if (!cmakeDir || !fs.existsSync(path.join(cmakeDir, 'bin', 'ninja.exe'))) {
        console.warn(
          `[withWindowsCMake] Android SDK에 cmake;${CMAKE_VERSION} 이 없어 기본 CMake를 씁니다. ` +
            'C++ 빌드가 "Filename longer than 260 characters" 로 실패하면 plugins/withWindowsCMake.js 를 참고하세요.',
        )
        return cfg
      }

      const file = path.join(cfg.modRequest.platformProjectRoot, 'local.properties')
      const lines = fs.existsSync(file)
        ? fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('cmake.dir='))
        : []
      // properties 파일에서 \ 와 : 는 이스케이프가 필요하다 → / 로 바꾸고 : 만 이스케이프
      lines.push(`cmake.dir=${cmakeDir.replace(/\\/g, '/').replace(/:/g, '\\:')}`)
      fs.writeFileSync(file, lines.join('\n') + '\n')
      return cfg
    },
  ])
}
