# 자주 쓰는 명령

winemine-app 작업 시 자주 쓰는 Supabase CLI / Expo / git 명령 모음.

---

## Supabase CLI

### 초기 셋업 (한 번만)

```bash
# CLI 설치 (npm 글로벌 비추천 — brew 사용)
brew install supabase/tap/supabase

# 로그인 (브라우저 또는 PAT)
supabase login
# 또는: supabase login --token sbp_xxxxx (https://supabase.com/dashboard/account/tokens)

# 프로젝트 초기화 (supabase/ 디렉토리 생성)
supabase init

# Supabase Dashboard에서 프로젝트 생성 후 link
supabase link --project-ref <project-ref>
```

### 일상 작업

```bash
# 로컬 DB 띄우기 (Docker 필요)
supabase start

# 로컬 DB 끄기
supabase stop

# 상태 확인 (URL, anon key, service_role key, JWT secret 등)
supabase status

# 새 migration 만들기
supabase migration new <description>
# → supabase/migrations/<timestamp>_<description>.sql 생성됨

# 로컬 DB에 migration 적용 (전체 reset)
supabase db reset

# 원격(production)에 schema push
supabase db push

# 원격 schema → 로컬 sync
supabase db pull

# TS 타입 자동 생성 (linked 프로젝트 기준)
supabase gen types typescript --linked > shared/types/database.types.ts
```

### Edge Functions

```bash
# 새 function 만들기
supabase functions new <name>

# 로컬 테스트 (Docker 필요)
supabase functions serve <name>

# production 배포
supabase functions deploy <name>

# Secrets 설정 (Edge Functions 환경변수)
supabase secrets set WINEMINE_ANONYMIZATION_SALT=xxx
supabase secrets list
```

---

## Expo

```bash
# 개발 서버 (Expo Go 앱 또는 시뮬레이터)
npx expo start

# iOS 시뮬레이터 열기
npx expo start --ios

# Android 에뮬레이터 열기
npx expo start --android

# 캐시 클리어 후 재시작
npx expo start --clear

# 의존성 설치
npm install
# 또는 yarn / pnpm

# Expo 패키지 추가
npx expo install <package>     # Expo 호환 버전 자동 매칭
```

---

## EAS Build / Submit (스토어 배포)

```bash
# EAS CLI 설치 (한 번만)
npm install -g eas-cli

# 로그인
eas login

# 빌드 설정 초기화 (한 번만)
eas build:configure

# 개발 빌드
eas build --profile development --platform ios

# Internal Alpha (TestFlight 업로드용)
eas build --profile preview --platform ios
eas submit --profile preview --platform ios

# Production 빌드
eas build --profile production --platform all
```

---

## Git / Submodule

```bash
# 첫 clone (submodule 포함)
git clone --recurse-submodules https://github.com/rocher71/winemine-app.git

# 이미 clone한 경우 submodule 초기화
git submodule update --init --recursive

# specs submodule을 최신 main으로 업데이트
git submodule update --remote specs
git add specs
git commit -m "chore: bump specs to <short SHA>"

# 변경 파악
git submodule status
git diff --submodule specs
```

---

## 점검·디버깅

```bash
# emoji 검출 (winemine 정책 위반)
grep -rP "[\\x{1F300}-\\x{1FAFF}\\x{2600}-\\x{27BF}\\x{1F900}-\\x{1F9FF}]" \
  --include='*.tsx' --include='*.ts' --include='*.sql' --include='*.md' .

# 하드코딩 hex 색 검출 (테마 토큰 우회)
grep -rnE "#[0-9a-fA-F]{3,6}" --include='*.tsx' --include='*.ts' src/ app/ \
  | grep -v "tokens\|theme\|// "

# 한글 누출 검출 (영어 모드 빌드 시) — string literal에 한글
grep -rnE "[가-힣]" --include='*.tsx' --include='*.ts' src/ app/ \
  | grep -v "// \|/\*\|placeholder"
```

---

## 자주 헷갈리는 것

| 헷갈림 | 정답 |
|---|---|
| `supabase init` vs `supabase link` | init = 로컬 supabase/ 폴더 생성, link = 어느 원격 프로젝트와 동기화할지 |
| `SUPABASE_URL` vs `EXPO_PUBLIC_SUPABASE_URL` | RN 빌드는 `EXPO_PUBLIC_` 접두사만 번들 포함 |
| `anon key` vs `service_role key` | anon = RN OK / service_role = Edge Functions만 |
| `supabase db push` vs `supabase db reset` | push = 원격에 적용 / reset = 로컬을 처음부터 재구성 |

---

## 관련 문서

- [CLAUDE.md](../CLAUDE.md) — 정체성·금지·협업 지침
- [docs/SUPABASE_PATTERNS.md](./SUPABASE_PATTERNS.md) — 코드 패턴
- [docs/THEME_VERIFICATION.md](./THEME_VERIFICATION.md) — 테마 검증 규칙
