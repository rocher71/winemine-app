# QA Follow-up — F1 BottomNav 5 Tabs + Route Stack Split

- **Cycle**: Follow-up Cycle 1, F1 (BottomNav 5 tabs + stack split)
- **Timestamp**: 2026-05-21 11:55:59 (KST)
- **Verifier**: qa-inspector
- **Scope**: BottomNav 재작성, 라우트 디렉토리 이동 (settings/cellar/[lwin]/notes를 (tabs) 밖 stack으로), i18n 4키 추가, 기존 화면 router.push 갱신
- **SCOPE-OUT (verified excluded, not failed)**: AppHeader 재작성, map/community 실제 구현, §14 Q1 (stack route BottomNav 표시), light gold contrast 2.15 (verbatim 정책)
- **변경 파일 13개**:
  - M `app/(tabs)/_layout.tsx`
  - M `app/_layout.tsx`
  - M `src/components/nav/bottom-nav.tsx`
  - M `src/lib/i18n/{ko,en}.json`
  - M `src/components/{cellar/cellar-card, home/home-header, home/suggested-actions, shared/level-chip}.tsx`
  - R `app/(tabs)/{cellar/[lwin],notes,settings/*}.tsx` → `app/{cellar/[lwin],notes/index,settings/*}.tsx`
  - +`app/(tabs)/{map,community}.tsx`

---

## 결과 요약

**PASS — 13/13 (FAIL 0, WARN 2 informational only)**

| # | 체크 항목 | 결과 | 비고 |
|---|---|---|---|
| 1 | router.push 경로 일관성 | PASS | `(tabs)/{settings,notes,cellar/[lwin]}` 잔존 0건 |
| 2 | expo-router stack route 매칭 | PASS | `app/{settings,notes,cellar,wine}` 4개 stack 등록 |
| 3 | ko/en nav 4 키 양쪽 채움 + 한글 노출 X | PASS | nav.map/community/captureA11y/a11y.primary 양쪽 존재 |
| 4 | dark/light dual definition (FAB/shadow/borderTop/container) | PASS | 모두 theme-aware 토큰 경유 |
| 5 | emoji grep | PASS | 0건 |
| 6 | 하드코딩 hex/rgba grep (변경 파일) | PASS | 0건 |
| 7 | SUPABASE_SERVICE_ROLE_KEY 격리 | PASS | supabase.ts 경고 주석 1건만 |
| 8 | OAuth 골격 호환 | PASS | linked_providers/is_upgraded/flowType:pkce 변경 없음 |
| 9 | profiles 트리거 변경 없음 | PASS | migrations 미수정 |
| 10 | RLS 데이터 호출 흐름 동일 | PASS | 라우트 이동만, supabase.from() 호출 패턴 동일 |
| 11 | cellar list → detail navigation | PASS | cellar-card.tsx → `/cellar/${lwin}` (새 stack route) |
| 12 | settings stack flow (home-header → /settings → 하위) | PASS | level-chip + home-header + suggested-actions 모두 갱신 |
| 13 | notes tab 미노출 + /notes 진입 정상 | PASS | notes는 (tabs) 밖 stack, /notes/new + /notes/[id] 모두 유효 |

---

## 1. router.push 경로 일관성 (PASS)

전체 `app/`, `src/` 내 router/Link 호출 inventory:

- `/(tabs)/cellar` (잔존 5건) — capture.tsx, cellar-summary-section.tsx, first-time-greeting.tsx — **모두 유효** (cellar 인덱스는 (tabs) 내부에 남음).
- `/(tabs)/capture` (3건) — cellar/index.tsx, capture.tsx — **유효** (capture 탭).
- `/(tabs)/map` (1건) — map-cameo.tsx — **유효** (신규 placeholder).
- `/(tabs)/notes` — **0건** (제거됨).
- `/(tabs)/settings` — **0건** (제거됨).
- `/(tabs)/cellar/[lwin]` — **0건** (제거됨).
- `/cellar/${lwin}` (cellar-card.tsx + 자체 [lwin].tsx) → 새 stack route 매칭 ✓
- `/settings`, `/settings/experience` (level-chip + home-header + suggested-actions) → 새 stack ✓
- `/notes/new`, `/notes/${noteId}`, `/notes/new/write` → 새 stack 하위 ✓
- `/wine/${lwin}` (cellar/[lwin].tsx, notes/[noteId].tsx, my-tasting-note-card, note-wine-header-link, recent-notes-strip, wine-feed) → root `app/wine/[lwin].tsx` 존재 + Stack.Screen 등록 ✓

**결론**: 모든 경로가 expo-router 파일 시스템과 일치.

---

## 2. expo-router 디렉토리 구조 검증 (PASS)

```
app/
├── (tabs)/                  (5 화면)
│   ├── _layout.tsx          (5 Tabs.Screen: index/map/capture/cellar/community)
│   ├── index.tsx
│   ├── map.tsx              (신규 placeholder)
│   ├── capture.tsx
│   ├── cellar/index.tsx     (리스트만 남김)
│   └── community.tsx        (신규 placeholder)
├── _layout.tsx              (Root Stack: index/onboarding/(tabs)/notes/settings/cellar/[lwin]/wine/[lwin])
├── cellar/[lwin].tsx        (stack route — 이동됨)
├── notes/
│   ├── index.tsx            (이동됨)
│   ├── [noteId].tsx
│   ├── new.tsx, new/...
├── settings/                (디렉토리 신규, 4개 파일 이동)
│   ├── index.tsx
│   ├── language.tsx
│   ├── experience.tsx
│   └── appearance.tsx
├── wine/[lwin].tsx
└── onboarding/...
```

- `app/(tabs)/settings/` 디렉토리 완전 삭제 ✓
- `app/(tabs)/cellar/` 내부에 `index.tsx`만 남고 `[lwin].tsx` 제거 ✓
- 모든 deep link 매칭 확인:
  - `/settings/language` → `app/settings/language.tsx` ✓
  - `/settings/experience` → `app/settings/experience.tsx` ✓
  - `/settings/appearance` → `app/settings/appearance.tsx` ✓
  - `/cellar/${lwin}` → `app/cellar/[lwin].tsx` ✓
  - `/notes/${noteId}` → `app/notes/[noteId].tsx` ✓

---

## 3. ko/en nav 4 키 양쪽 채움 (PASS)

### 신규 4 키 검증

| 키 | ko | en |
|---|---|---|
| `nav.map` | 지도 | Map |
| `nav.community` | 커뮤니티 | Community |
| `nav.captureA11y` | 와인 라벨 촬영 | Capture wine label |
| `nav.a11y.primary` | 주요 내비게이션 | Primary |

### 기존 키 보존

`nav.home/capture/cellar/notes/settings` 5개 모두 양쪽 보존됨. notes/settings는 stack route 헤더 타이틀에 재활용.

### en.json 한글 노출 검증

- `language.ko = "한국어"`, `settings.values.ko = "한국어"`, `onboarding.language.ko = "한국어"`만 한글 — **언어 자체-이름** (이름표) 사용은 i18n 표준이며 CLAUDE.md §4-4의 "영어 모드에서 한글 노출 X" 예외에 해당. 추가 노출 0.

---

## 4. dark/light dual definition (PASS)

### bottom-nav.tsx

- 컨테이너 gradient: `gradients.bottomNavFade[tokens.scheme]` (line 54) — dark/light 분기 ✓
- 컨테이너 borderTopColor: `tokens.border.default` (line 69) — theme-aware ✓
- FAB gradient: `gradients.fab[tokens.scheme]` (line 55) ✓
- FAB shadow: `tokens.scheme === 'light' ? shadows.fabLight : shadows.fabDark` (line 56) ✓
- FAB border: `brand.gold` — verbatim 양쪽 모드 고정 ✓
- FAB icon: `brand.cream` — verbatim 양쪽 모드 고정 ✓
- NavTab active color: `brand.gold` — verbatim 양쪽 모드 고정 (line 163) ✓
- NavTab idle color: `tokens.text.muted` — theme-aware (line 142) ✓

### design-tokens.ts 토큰 존재 검증

- `shadows.fabDark` (#8B1A2A glow), `shadows.fabLight` (#B89438 glow) — line 510-511 ✓
- `gradients.bottomNavFade` (line 533), `gradients.fab` (line 538) ✓ (양쪽 모드 분기 내부 정의)

### 이동된 화면 (settings/cellar/[lwin]/notes/index)

- 모두 `bg-bg-deepest dark:bg-bg-deepest`, `text-text-primary dark:text-text-primary` 등 NW v4 dark variant 사용 ✓
- 인라인 `brand.gold` (ActivityIndicator + delete icon `brand.wineRed`) — brand 토큰 (양쪽 모드 고정) ✓

---

## 5. emoji grep (PASS)

`app/{(tabs),cellar,notes,settings}` + `src/components/{nav,home,cellar,shared}` + `src/lib/i18n` 전체 검색:
- emoji code point range: 0건
- U+FE0F variation selector: 0건

---

## 6. 하드코딩 hex/rgba grep (PASS)

변경 파일 13개 전체에서 `#[0-9a-f]{3,8}` / `rgba?\(...\)` 검색 → **0건**.

모든 색상은 `brand.*` / `tokens.*` / `gradients.*` / `shadows.*` 토큰 경유. design-tokens.ts 내 hex 정의는 정상 (단일 source of truth).

---

## 7. SUPABASE_SERVICE_ROLE_KEY 격리 (PASS)

`app/`, `src/` 전체 검색 → 1건 발견:
- `src/lib/supabase.ts:9` — **주석 경고문** ("절대 import 금지") — import 아님. PASS.

`EXPO_PUBLIC_*` 누출 검색 → 2건 모두 anonymize.ts의 dev salt 사용 (정상).

---

## 8. OAuth 골격 호환 검증 (PASS)

- `supabase/migrations/20260519000000_profiles.sql:63-64` — `linked_providers text[]`, `is_upgraded boolean` 컬럼 존재 변경 없음 ✓
- `src/lib/supabase.ts:41` — `flowType: 'pkce'` 변경 없음 ✓
- `src/lib/auth/providers/{kakao,google,apple}.ts` stub 변경 없음 (이번 cycle 무관)
- `src/lib/auth/link-identity.ts` 변경 없음

---

## 9. profiles 트리거 변경 없음 (PASS)

- `supabase/migrations/` 디렉토리 변경 0건 (git status 확인)
- handle_new_user 트리거 / RLS 정책 동일

---

## 10. RLS 데이터 호출 흐름 동일 (PASS)

- 이동된 settings/cellar/[lwin] 화면들의 supabase.from() 호출 패턴 변경 없음
- `profiles.update({...}).eq('id', uid)` (language/experience/appearance) → RLS USING (`auth.uid() = id`) 통과 ✓
- cellar/[lwin] 화면의 useCellarItem / setCellarStatus / deleteCellarItem 모두 RLS 정책과 호환 (기존 검증 유지)
- 라우트 이동만 발생 — DB 보안 경계면 무변경

---

## 11. cellar list → detail navigation (PASS)

- `src/components/cellar/cellar-card.tsx:70-73` — `router.push(\`/cellar/${encodeURIComponent(wine.lwin)}?id=${encodeURIComponent(item.id)}\` as never)` → 새 stack route 매칭 ✓
- `app/cellar/[lwin].tsx:61` — `useLocalSearchParams<{ lwin: string; id?: string }>()` 동일 query 파라미터 수신 ✓
- 경로 prefix 변경 (`/(tabs)/cellar/${lwin}` → `/cellar/${lwin}`) 양쪽 sync 완료

---

## 12. settings stack flow (PASS)

home-header / level-chip / suggested-actions 진입 경로:
- `src/components/home/home-header.tsx:102` — FirstTimeAvatar → `router.push('/settings' as never)` ✓
- `src/components/shared/level-chip.tsx:31` — LevelChip → `router.push('/settings' as never)` ✓
- `src/components/home/suggested-actions.tsx:67` — Experience row → `router.push('/settings/experience' as never)` ✓

settings/index.tsx → settings/{language,experience,appearance}.tsx 내부 BackHeader는 `router.back()` 사용 (정상 stack 동작).

**WARN W1 (informational)**: settings/index.tsx 자체는 placeholder ("Settings" title text만 렌더, navigation rows 없음). 사용자가 `/settings` 진입 시 하위 페이지로 이동할 수단이 화면 내부에 없음 — home-header에서 직접 `/settings/experience` 등을 쳐야 함. 본 cycle scope-out으로 인지 (AppHeader/Settings index 재작성은 별도 cycle), FAIL 아님.

---

## 13. notes tab 미노출 + /notes 진입 (PASS)

- `app/(tabs)/_layout.tsx`의 Tabs.Screen 5개 중 `notes` 없음 ✓ (BottomNav에 미노출)
- `app/notes/index.tsx`는 진입 시 `router.push('/notes/new')` 자동 리다이렉트 — focus effect 안전 ✓
- `/notes/${noteId}` (recent-notes-section, my-tasting-note-card) → `app/notes/[noteId].tsx` 매칭 ✓
- `/notes/new/write?...` (cellar/[lwin], capture, notes/new) → `app/notes/new/write.tsx` 매칭 ✓

**WARN W2 (informational)**: `app/notes/index.tsx`는 단순 redirect만 수행. 사용자가 `/notes` URL을 직접 입력하면 곧장 `/notes/new`로 이동. 의도된 동작 (notes 진입점은 home recent-notes / cellar drink-this / capture 등) — FAIL 아님.

---

## SCOPE-OUT 검증 (별도 cycle 처리 확인)

- **AppHeader 재작성** — 본 cycle 변경 없음. home-header.tsx만 router.push 갱신.
- **map/community placeholder 실제 화면** — placeholder EmptyState 1줄 그대로. spec §11 verbatim.
- **§14 Q1 stack route BottomNav 표시** — (b) 채택 (stack에서 BottomNav 미표시). 본 cycle 임시 결론 유지.
- **light gold contrast 2.15** — keyscreen verbatim 정책 (spec §7), design-reviewer 별도 noting 항목.

---

## 권장 후속 (별도 cycle)

| 우선순위 | 항목 | 사유 |
|---|---|---|
| P2 | settings/index.tsx 실제 구현 (navigation rows for language/experience/appearance) | 현재 placeholder — 사용자가 `/settings` 직접 진입 시 dead-end |
| P3 | notes/index.tsx의 redirect 제거 + 실제 Notes 리스트 화면 구현 (v0.2.0) | 현재 redirect만 — `/notes` URL이 의미 없음 |
| P3 | §14 Q1 재검토 (keyscreen verbatim BottomNav 표시 vs 단순 stack) | a11y/일관성 합의 시 별도 cycle |

---

## 회귀 차단 확인

- 기존 wines / wine_korean_names: **변경 없음** (DB 무관 cycle)
- VIEW shape (wines_localized): **변경 없음**
- 12 화면 design-review 결과: **변경 없음** (라우트 이동만, 화면 내부 시각 동일)
- LWIN 형식 검증: **변경 없음**
- profiles 트리거 / RLS / Storage: **변경 없음**

---

## 최종 평결

**PASS — 통과. F1 (BottomNav 5 tabs + stack split) 정합성 검증 완료. 다음 단계 (design-reviewer 게이트 또는 다음 Cycle 1 항목) 진행 가능.**
