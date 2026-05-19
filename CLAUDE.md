# winemine-app — RN + Expo

> winemine 모바일 앱 (iOS + Android). React Native + Expo로 구현.
> Phase 3 시작: 2026-05 · Phase 2 시안 reference: `../winemine-keyscreen/` (frozen)

---

## 0. 이 레포의 정체성

winemine의 사용자가 직접 쓰는 모바일 앱. 와인 라벨 촬영 → AI 인식 → 세계 지도 시각화 → 테이스팅 노트 작성 → 커뮤니티 기능.

- 플랫폼: iOS + Android (Expo managed)
- 언어: TypeScript (strict 권장)
- API contract: `specs/api/openapi.yaml`에서 codegen
- 도메인 지식: `specs/domain/`

---

## 1. 핵심 의존 레포

### `specs/` (submodule)

`https://github.com/rocher71/winemine-specs.git`이 `specs/`에 마운트됨.

- **API contract**: `specs/api/openapi.yaml` → TS 타입 자동 생성
- **API 컨벤션**: `specs/api/CONVENTIONS.md` (LocalizedString, envelope, pagination, error code)
- **도메인 지식**: `specs/domain/glossary/`, `specs/domain/policies/`, `specs/domain/i18n/`, `specs/domain/design-tokens/` 등
- **wine-research** (nested submodule): `specs/domain/wine-research/`
- **변경 시 절차**:
  ```bash
  git submodule update --remote specs
  git add specs
  git commit -m "chore: bump specs to <short SHA>"
  ```

submodule 운영: [specs/docs/SUBMODULE_OPERATIONS.md](./specs/docs/SUBMODULE_OPERATIONS.md)
Setup 전체 가이드: [specs/docs/DOWNSTREAM_SETUP.md](./specs/docs/DOWNSTREAM_SETUP.md)

### `../winemine-keyscreen/` (sibling, read-only)

Phase 2 키스크린 시안 (Next.js 15 + React로 구현). 변환 작업의 **input reference**.

**read-only 참조 — 절대 수정 X.**

변환 작업의 진실 소스:

| 자료 | 경로 | 용도 |
|---|---|---|
| 화면별 상세 명세 (39개) | `../winemine-keyscreen/pages/{route}.md` | 화면 변환의 진실 소스. 헤더·BottomNav·인터랙션·상태·i18n 키·feature flag까지 |
| 전체 시스템 개요 | `../winemine-keyscreen/FEATURES.md` | 시스템 컨텍스트 파악 |
| React 컴포넌트 원본 | `../winemine-keyscreen/src/` | 구현 디테일 reference |
| 디자인 시스템 docs | `../winemine-keyscreen/docs/design-system/` | 색·타이포·컴포넌트 (아래 ↓) |
| 색·타이포 CSS 토큰 | `../winemine-keyscreen/styles/tokens.css` | RN StyleSheet 변환 base |

**디자인 시스템 (`../winemine-keyscreen/docs/design-system/`)**:
- `README.md` — 디자인 시스템 전체 개요
- `colors.md` (362줄) — 색 팔레트·CSS 변수·다크/라이트 분기
- `typography.md` (118줄) — Playfair·Inter·Noto Sans KR 폰트 규칙
- `components.md` (307줄) — WMBottle·LevelPill·BottomNav 등 컴포넌트별 스펙
- `legacy/` — 이전 결정 기록 (참고용)

---

## 2. 변환 작업 워크플로우

키스크린(React)을 RN+Expo로 변환:

```
INPUT:
  ../winemine-keyscreen/pages/{route}.md           Phase 2 화면 명세
  ../winemine-keyscreen/src/app/{route}/page.tsx   Phase 2 React 구현
  specs/api/openapi.yaml                            Phase 3 API contract
  specs/domain/...                                  Phase 3 도메인 지식

OUTPUT:
  app/(tabs)/{route}.tsx                            Phase 3 RN+Expo (예시 경로)
  components/{section}/{Component}.tsx
```

### 변환 규칙

1. **specs 우선** — API shape, 라벨 텍스트(LocalizedString), 정책 결정은 specs를 우선
2. **키스크린은 UX reference** — 인터랙션·레이아웃·상태 흐름·시각 디테일만 참조
3. **Next.js 패턴 직역 금지** — Next.js App Router·CSS Modules는 RN에 없음. 의도를 재구현
4. **mock 직접 import 금지** — `specs/api/examples/`의 정형화된 예시 사용 또는 dev mode 임시 fixture

---

## 3. 절대 금지 규칙 (winemine 정책 승계)

### 3-1. emoji 사용 금지

모든 UI·코드·docs에 emoji 금지. 아이콘은 lucide-react-native 등 vector 아이콘 라이브러리.

점검:
```bash
grep -rP "[\\x{1F300}-\\x{1FAFF}\\x{2600}-\\x{27BF}\\x{1F900}-\\x{1F9FF}]" \
  --include='*.tsx' --include='*.ts' --include='*.md' .
```

### 3-2. `specs/` 직접 수정 금지

submodule, read-only. 변경은 winemine-specs 본 레포에서 PR.

### 3-3. `../winemine-keyscreen/` 수정 금지

Phase 2 frozen. 변환 완료 후 GitHub archive 처리 예정.

### 3-4. 한쪽 locale 누락 금지

영어 모드에서 한글이 단 한 글자도 노출되면 안 됨 (키스크린 시안 i18n 누출 60+곳 사고 반복 X). LocalizedString shape는 `specs/api/CONVENTIONS.md`.

### 3-5. 익명화 우회 금지

다른 사용자 정보 표시 시 실명 노출 X. 항상 `specs/domain/policies/anonymization.md`의 익명 ID 패턴 사용 (`velvety-fox-37`).

---

## 4. AI(Claude Code) 협업 지침

### 할 일
- 키스크린 화면을 RN+Expo 컴포넌트로 변환
- `specs/api/openapi.yaml` 기반 API client 코드 생성·사용
- `specs/domain/` 도메인 지식 참고해 UX 결정
- 정책 위반 점검 (emoji, locale 누락, 익명화 우회 등)

### 하면 안 되는 것
- `specs/` 안 파일 수정 (read-only)
- `../winemine-keyscreen/` 안 파일 수정
- 정책 임의 변경 (XP·익명화 등은 specs/domain/policies/에 정의)
- mock 데이터 하드코딩 (`specs/api/examples/` 사용)

### 컨텍스트 흐름
RN+Expo 작업 중:
1. 화면 변환 시 → 키스크린 명세(`../winemine-keyscreen/pages/{route}.md`) + 키스크린 구현(`../winemine-keyscreen/src/app/{route}/page.tsx`) 동시 참조
2. API 호출 시 → `specs/api/openapi.yaml`에서 endpoint 확인 후 codegen된 타입 사용
3. 도메인 결정 필요 시 → `specs/domain/` 안 문서 우선
4. 정책 모호 시 → 사용자에게 질문 (임의 결정 X)

---

## 5. 결정 필요 (TBD)

| 항목 | 옵션 |
|---|---|
| Navigation | Expo Router vs React Navigation |
| 스타일링 | StyleSheet vs styled-components vs NativeWind |
| 상태 관리 | Zustand vs Jotai vs Redux Toolkit |
| 네트워크 | TanStack Query vs SWR |
| OpenAPI codegen | openapi-typescript vs openapi-fetch vs orval |
| 아이콘 | lucide-react-native vs @expo/vector-icons |
| i18n | i18next vs lingui vs format.js |
| 지도 | react-native-maps vs MapLibre GL vs Mapbox |
| 차트 | Victory Native vs react-native-svg + 직접 |
| 인증 흐름 | 익명 우선 (`specs/domain/wine-research/site/src/content/docs/misc/75_auth_anonymous_first.md`) |

결정되면 본 섹션 갱신 + 필요 시 specs/TBD.md에 영향 사항 기록.

---

## 6. Quick Reference

| 작업 / 궁금증 | 어디 보면 됨 |
|---|---|
| API endpoint 명세 | `specs/api/openapi.yaml` |
| API 컨벤션 (LocalizedString·envelope·pagination·error) | `specs/api/CONVENTIONS.md` |
| 화면별 변환 명세 | `../winemine-keyscreen/pages/{route}.md` |
| Phase 2 전체 개요 | `../winemine-keyscreen/FEATURES.md` |
| 색 팔레트·CSS 변수 | `../winemine-keyscreen/docs/design-system/colors.md` |
| 타이포 (Playfair·Inter·Noto Sans KR) | `../winemine-keyscreen/docs/design-system/typography.md` |
| 컴포넌트별 스펙 (WMBottle·LevelPill 등) | `../winemine-keyscreen/docs/design-system/components.md` |
| 디자인 시스템 전체 README | `../winemine-keyscreen/docs/design-system/README.md` |
| 용어 사전 | `specs/domain/glossary/` |
| 익명화 정책 (표시 패턴) | `specs/domain/policies/anonymization.md` |
| Phase 3 RN 기술 계획 | `specs/domain/wine-research/site/src/content/docs/misc/71_frontend_react_native.md` |
| 와인 도메인 리서치 | `specs/domain/wine-research/_workspace/` |
| submodule 갱신 명령 | `specs/docs/SUBMODULE_OPERATIONS.md` |

---

## 7. 자주 쓰는 명령

```bash
# specs를 최신 main으로 업데이트
git submodule update --remote specs
git add specs
git commit -m "chore: bump specs to <short SHA>"

# 처음 clone하는 사람
git clone --recurse-submodules https://github.com/rocher71/winemine-app.git
```

(Expo·codegen 명령은 첫 endpoint 작성 + 빌드 도구 결정 후 추가)
