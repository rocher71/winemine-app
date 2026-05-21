# bottom-nav v1 — rn-screen-builder 변경 요약

> Cycle: 2026-05-21 (BottomNav retroactive hardening + 라우트 stack 분리)
> 사양: `_workspace/design-specs/bottom-nav.md`
> 1차 design-review FAIL 11개 항목 해결 (R1, R2, R3, R4, R5, R6, R10, R11, R12, R13, R14 — §10 변경표 기준).

## 핵심 변경

### 1. 라우트 stack 분리 (FAIL R2, R15 해결)

- `app/(tabs)/notes.tsx` → `app/notes/index.tsx` (git mv — auto-redirect 화면 그대로 stack root에서 실행)
- `app/(tabs)/cellar/[lwin].tsx` → `app/cellar/[lwin].tsx` (git mv — `app/cellar/` 신규 디렉토리)
- `app/(tabs)/settings/{index,language,experience,appearance}.tsx` → `app/settings/*` (git mv — `app/settings/` 신규 디렉토리, `(tabs)/settings/` 삭제됨)
- root Stack에 `notes` / `settings` / `cellar/[lwin]` / `wine/[lwin]` 4개 등록 (`app/_layout.tsx`)
- 화면 자체 내용 재작성 0 (이동만)

### 2. (tabs)/_layout.tsx 5-tab 재작성 (FAIL R2 해결)

- 11개 `<Tabs.Screen>` → 5개로 축소
- 등록 순서 (좌→우): `index` / `map` / `capture` / `cellar` / `community`
- `href: null` 6개 제거 (디렉토리 자체가 (tabs) 밖에 있으므로 자동 미마운트)

### 3. (tabs)/map.tsx + (tabs)/community.tsx placeholder 신규

- 사양 §11에 따라 EmptyState 1줄 + `TODO(v0.2.0)` 주석
- `<Text className="font-inter text-card-body text-text-muted">` (토큰 사용, 하드코딩 0)

### 4. BottomNav 전면 재작성 (FAIL R1, R3, R4, R5, R6, R10, R11, R12, R13, R14 해결)

| 변경 | 이전 | 이후 |
|---|---|---|
| ICONS 매핑 | `{index, capture, cellar, notes, settings}` | `{index: Home, map: Globe, capture: Camera, cellar: Wine, community: Users}` |
| 컨테이너 bg | 단색 `dark.bg.deep` | `<LinearGradient {...gradients.bottomNavFade[scheme]} style={absoluteFillObject} />` |
| borderTop | 없음 | `borderTopWidth: 0.5, borderTopColor: tokens.border.default` |
| padding | safeArea bottom만 | `paddingTop: 8, paddingHorizontal: 12, paddingBottom: 28 + insets.bottom` |
| FAB | 없음 (평범한 NavTab) | 52×52 floating Pressable, marginTop -24, borderWidth 1 brand.gold, LinearGradient(gradients.fab[scheme]) + shadows.fab{Dark,Light}, Camera icon size 24 brand.cream |
| active indicator bar | 상단 2px gold bar | **제거** (D2 — keyscreen verbatim) |
| label gap | `mt-1` (4) | `gap: spacing['0.75']` (3) |
| label lineHeight | 명시 X | `lineHeight: 10` 명시 (1.0 ratio) |
| icon size | 20 strokeWidth 2 | 22 strokeWidth 1.6 (keyscreen verbatim) |
| a11y 컨테이너 | role 없음 | `accessibilityRole="tablist"`, `accessibilityLabel={t('nav.a11y.primary')}` |
| FAB a11y | (FAB 없었음) | `accessibilityRole="button"`, `accessibilityLabel={t('nav.captureA11y')}` |
| Haptics 탭 전환 | 없음 | `Haptics.selectionAsync()` |
| Haptics FAB | 없음 | `Haptics.impactAsync(Light)` |

### 5. i18n 4 키 추가 (FAIL R16 해결)

- `nav.map` (ko: "지도" / en: "Map")
- `nav.community` (ko: "커뮤니티" / en: "Community")
- `nav.captureA11y` (ko: "와인 라벨 촬영" / en: "Capture wine label")
- `nav.a11y.primary` (ko: "주요 내비게이션" / en: "Primary")

기존 `nav.{home,capture,cellar,notes,settings}` 5개 키는 보존 (notes/settings는 stack route 헤더 타이틀로 재활용).

### 6. router.push 호출부 동기화 (라우트 이동 후속)

- `src/components/cellar/cellar-card.tsx`: `/(tabs)/cellar/${lwin}` → `/cellar/${lwin}`
- `src/components/home/home-header.tsx`: `/(tabs)/settings` → `/settings`
- `src/components/home/suggested-actions.tsx`: `/(tabs)/settings/experience` → `/settings/experience`
- `src/components/shared/level-chip.tsx`: `/(tabs)/settings` → `/settings`

`router.push('/(tabs)/cellar')` (list, capture·cellar-summary 등 6곳)는 그대로 유지 — `cellar/index.tsx`는 여전히 (tabs) 그룹 안.
`router.push('/notes/new')` 등 notes 내부 라우트는 변경 없음 (디렉토리 위치만 이동, 경로 그대로).

## 토큰 사용 inventory (신규 추가 0)

- `gradients.bottomNavFade.{dark,light}` (컨테이너 to-top fade)
- `gradients.fab.{dark,light}` (FAB 135deg gradient)
- `shadows.fabDark` / `shadows.fabLight` (FAB outer shadow)
- `brand.gold` (FAB border + active color, 양쪽 모드 고정)
- `brand.cream` (FAB icon color)
- `spacing['13']` (52 — FAB w/h), `spacing['2']` (8 — paddingTop), `spacing['3']` (12 — paddingHorizontal), `spacing['1.5']` (6 — NavTab paddingVertical), `spacing['0.75']` (3 — NavTab gap)
- `radius.full` (9999 — FAB 원형)
- `tokens.border.default` / `tokens.text.muted` (theme-aware via useThemeTokens)

## 검증 결과

- TypeScript 컴파일: 내 변경 한정 0 에러 (pre-existing: supabase/functions/label-scan deno import + tailwind.config nativewind d.ts — 본 cycle 범위 외)
- 하드코딩 hex/rgba: 변경 파일에서 0건
- emoji: 0건

## 미해결

- **Q1 (사양 §14 미해결)**: settings/cellar-detail/notes stack route에서 BottomNav 미표시 — 본 cycle은 사양 §14-임시-결론(b) 채택. keyscreen은 settings/cellar에서도 BottomNav 표시하지만 그 정합성 보존은 후속 cycle에서 재검토 필요. 현재 stack 안으로 빠지면 자동 미표시.
- **Q2 (사양 §14)**: 활성 indicator bar 제거 후 색 + fontWeight만으로 active 변별성 — design-reviewer 시각 확인 필요. 부족 판단 시 indicator bar 복원을 D2 deviation에 명시.
- **사양 §7 light 모드 contrast FAIL (gold #C9A84C on light.bg.deepest #FAF5EC = 2.15)**: 본 cycle 변경 X — 사양 verbatim 우선 정책 준수. design-reviewer noting 가능.

## 변경 파일 목록

### 신규
- `app/(tabs)/map.tsx`
- `app/(tabs)/community.tsx`
- `app/cellar/[lwin].tsx` (이동)
- `app/notes/index.tsx` (이동)
- `app/settings/{index,language,experience,appearance}.tsx` (이동)

### 수정
- `app/(tabs)/_layout.tsx` (5 Tabs.Screen로 전면 재작성)
- `app/_layout.tsx` (root Stack에 notes/settings/cellar/[lwin]/wine/[lwin] 4개 추가)
- `src/components/nav/bottom-nav.tsx` (전면 재작성 — FAB 분기 + gradient + 5 ICONS + indicator bar 제거 + a11y + haptic)
- `src/lib/i18n/ko.json` (nav.map/community/captureA11y/a11y.primary 4 키 추가)
- `src/lib/i18n/en.json` (동일)
- `src/components/cellar/cellar-card.tsx` (router path 갱신)
- `src/components/home/home-header.tsx` (router path 갱신)
- `src/components/home/suggested-actions.tsx` (router path 갱신)
- `src/components/shared/level-chip.tsx` (router path 갱신)

### 삭제 (디렉토리)
- `app/(tabs)/settings/` (4 파일 + 디렉토리 자체)
- `app/(tabs)/notes.tsx`
- `app/(tabs)/cellar/[lwin].tsx` (`cellar/index.tsx`는 그대로 유지)
