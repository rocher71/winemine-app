---
name: eas-build-deploy
description: "winemine EAS Build + TestFlight 릴리즈 가이드. eas.json 작성 (preview/production), iOS preview 빌드 실행 (eas build), TestFlight 자동 업로드, 빌드 사이즈 50MB 이하 검증, production migrations push (사전 기존 wines count diff 0 검증), Edge Function 배포. Day 7 빌드·릴리즈·배포 요청 시 사용."
---

# EAS Build & Deploy — winemine v0.1.0 릴리즈

이 스킬은 release-engineer가 Day 7 빌드·배포를 진행할 때 따른다.

## 사전 조건 (Day 7 진입 전)

- qa-inspector "전체 통과" 메시지 수신
- 모든 에이전트 작업 freeze
- Apple Developer 계정 (사용자 제공)
- ascAppId, ios.bundleIdentifier 결정
- EAS 프로젝트 ID (없으면 `eas init` 수행)

## eas.json 작성

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false, "resourceClass": "m-medium" },
      "android": { "buildType": "apk" },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": { "resourceClass": "m-medium" },
      "android": { "buildType": "app-bundle" },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      }
    }
  },
  "submit": {
    "preview": {
      "ios": { "ascAppId": "{ascAppId}" }
    },
    "production": {
      "ios": { "ascAppId": "{ascAppId}" }
    }
  }
}
```

EAS Secrets 등록:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."
eas secret:create --scope project --name EXPO_PUBLIC_ANONYMIZATION_SALT_DEV --value "..."
```

## app.config.ts 릴리즈 값

```ts
// app.config.ts
export default {
  expo: {
    name: 'winemine',
    slug: 'winemine',
    version: '0.1.0',
    orientation: 'portrait',
    scheme: 'winemine',  // v0.2.0 OAuth deep link 대비
    ios: {
      bundleIdentifier: 'com.winemine.app',
      supportsTablet: false,
      infoPlist: {
        NSCameraUsageDescription: 'winemine은 와인 라벨을 촬영해 와인을 인식합니다 / winemine uses the camera to recognize wine labels.',
        NSPhotoLibraryUsageDescription: '갤러리에서 와인 라벨 사진을 선택합니다 / winemine accesses your photo library to select wine label photos.',
      },
    },
    android: {
      package: 'com.winemine.app',
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE'],
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      anonymizationSaltDev: process.env.EXPO_PUBLIC_ANONYMIZATION_SALT_DEV,
      appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    },
    plugins: ['expo-router', 'expo-camera', 'expo-image-picker', 'expo-haptics'],
  },
};
```

## production 백엔드 배포 절차 (supabase-engineer 협력)

```bash
# 1. 사전 검증 — 기존 데이터 count 기록
psql "$REMOTE_DB_URL" -c "SELECT 'wines', count(*) FROM public.wines UNION ALL SELECT 'wine_korean_names', count(*) FROM public.wine_korean_names" > pre_deploy.txt

# 2. 마이그레이션 적용
supabase db push --linked

# 3. 동일 검증
psql "$REMOTE_DB_URL" -c "SELECT 'wines', count(*) FROM public.wines UNION ALL SELECT 'wine_korean_names', count(*) FROM public.wine_korean_names" > post_deploy.txt

diff pre_deploy.txt post_deploy.txt
# diff 0이 아니면 즉시 rollback + critical alert

# 4. Edge Function 배포
supabase functions deploy label-scan --linked

# 5. Storage 버킷 확인
psql "$REMOTE_DB_URL" -c "SELECT * FROM storage.buckets WHERE id = 'label-photos';"
# 1 row 있어야 함

# 6. RLS 정책 확인
psql "$REMOTE_DB_URL" -c "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;"
```

count diff 0 보장이 가장 중요. 0이 아니면 즉시 모든 작업 stop.

## EAS 빌드 실행

```bash
# iOS preview (TestFlight 자동 업로드 가능)
eas build --profile preview --platform ios --auto-submit
# 또는 빌드만:
eas build --profile preview --platform ios

# 빌드 시간: 15~25분
# 빌드 결과: https://expo.dev/accounts/.../projects/winemine/builds/{id}
```

## 빌드 사이즈 검증

```bash
# .ipa 다운로드 후
unzip -l winemine.ipa | tail -5
# 또는
ls -lh winemine.ipa
# < 50MB

# 초과 시 분석
find . -name '*.bundle' -size +1M | xargs du -h | sort -hr | head
```

초과 시 rn-screen-builder에게:
- expo-image 사용 확인 (Image 컴포넌트 X)
- 이미지 압축 (jpeg quality 0.8 이하)
- 사용하지 않는 lucide 아이콘 trim
- node_modules 큰 의존성 검토 (date-fns 전체 → 필요 함수만 import)

## TestFlight 업로드 & 테스터 핸드오프

EAS Submit 자동:
```bash
eas submit -p ios --latest
```

또는 수동:
```bash
# .ipa 다운로드 후 Xcode Transporter 또는 altool로 업로드
```

업로드 후 App Store Connect → TestFlight → Internal Testing → 테스터 추가.

## 테스터 안내 (`_workspace/05_release_notes.md`)

```markdown
# winemine v0.1.0 Internal Alpha — 테스터 가이드

## 설치
1. TestFlight 앱 설치 (App Store)
2. 초대 이메일의 링크 탭 → "Accept" → "Install"

## 첫 부팅 시나리오
1. 앱 실행 → 자동 익명 로그인
2. 온보딩 4단계: 언어(한국어) → 경험(beginner) → 모드(first-time)
3. 홈에서 "첫 와인 캡처" 탭 → 카메라 권한 허용

## 라벨 캡처 시나리오
1. 카메라로 와인 라벨 촬영 (또는 갤러리 선택)
2. 라벨 분석 중... → mock 와인 정보 표시 (v0.1.0은 실제 인식 X)
3. "기록하기" → 노트 작성 → 저장
4. 홈에서 방금 작성한 노트 확인

## 알려진 제약 (v0.1.0)
- 라벨 인식은 mock 응답 (실제 인식은 v0.2.0)
- 지도 화면 없음 (v0.2.0)
- 회원가입·OAuth 없음 (v0.2.0 — 구조만 준비)
- 양식 빌더·커뮤니티·즐겨찾기 없음 (v0.3.0+)

## 피드백
- 버그·UI 이슈는 {피드백 채널 — 사용자가 결정}
```

## 에러 시나리오

| 에러 | 대응 |
|---|---|
| EAS 빌드 실패 — native module conflict | 로그 분석 → infra-architect에게 의존성 조정 요청 |
| TestFlight 거부 — 메타데이터 누락 | App Store Connect에서 정보 보완 후 재제출 |
| count diff 발견 | 즉시 rollback, supabase-engineer 협력 |
| 빌드 사이즈 50MB+ | rn-screen-builder asset 최적화 요청, 재빌드 |
| Apple 인증서 만료 | 사용자에게 갱신 안내, EAS credentials 재발급 |

## 절대 금지

- count diff 확인 없이 production db push
- EXPO_PUBLIC_ 외 시크릿을 eas.json에 하드코딩
- TestFlight 업로드 전 빌드 사이즈 확인 안 함
- 인증서·프로필 자체 생성 — Apple 정책 위반 가능. EAS managed credentials 사용

## 자세한 reference

스펙: `docs/spec/v0.1.0.md`의 `<build_output>`. Supabase 명령: `docs/COMMANDS.md`.
