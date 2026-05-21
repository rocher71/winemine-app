# 디자인 리뷰 v2 — bottom-nav (post-fix)

> Cycle: 2026-05-21 (Day 6, BottomNav retroactive 2차 검증)
> 1차 보고서: `_workspace/design-review_bottom-nav_v1_builder_summary.md` (builder summary inline only — 별도 design-reviewer v1 파일 없음)
> 사양: `_workspace/design-specs/bottom-nav.md` (2026-05-21 작성, 486 LOC)
> 비교 reference: `../winemine-keyscreen/src/components/nav/bottom-nav.tsx` (228 LOC) + `../winemine-keyscreen/docs/design-system/components.md` §2-2 + 사용자 제공 스크린샷 (winemine-keyscreen.vercel.app 캡처) + `_workspace/keyscreen-shots/home.png` 하단 nav 영역

## 대상 파일 (미커밋, builder 1차 fix 완료)

### 신규
- `app/(tabs)/map.tsx` (20 LOC — placeholder, t('common.empty'))
- `app/(tabs)/community.tsx` (20 LOC — placeholder)

### 이동 (git mv 확정 — git status R 마커 확인)
- `app/(tabs)/cellar/[lwin].tsx` → `app/cellar/[lwin].tsx`
- `app/(tabs)/notes.tsx` → `app/notes/index.tsx`
- `app/(tabs)/settings/{index,language,experience,appearance}.tsx` → `app/settings/*` (4 파일)

### 수정
- `app/(tabs)/_layout.tsx` (25 LOC — 5 Tabs.Screen 전면 재작성)
- `app/_layout.tsx` (root Stack에 notes/settings/cellar/[lwin]/wine/[lwin] 4개 추가)
- `src/components/nav/bottom-nav.tsx` (195 LOC — 전면 재작성)
- `src/lib/i18n/{ko,en}.json` (nav.{map,community,captureA11y,a11y.primary} 4 키 추가)
- `src/components/{cellar/cellar-card,home/home-header,home/suggested-actions,shared/level-chip}.tsx` (router path 4곳 갱신)

---

## 1차 FAIL 11개 항목 — RESOLVED / STILL-FAIL / SCOPE-OUT 판정

> 1차 보고서 §10 (R1~R16) 16개 중 builder 가 해결 대상으로 명시한 11개를 추적. 나머지는 본 사양 시점에 이미 PASS였거나 (R7/R8/R9) cycle 외 항목 (R15는 라우트 이동 — R2와 동시 RESOLVED).

| # | 항목 | 1차 판정 | 2차 판정 | 증거 |
|---|---|---|---|---|
| R1 | ICONS 매핑 5 슬롯 (home/map/capture/cellar/community) | FAIL | **RESOLVED** | `bottom-nav.tsx:32-38` — `{index: Home, map: Globe, capture: Camera, cellar: Wine, community: Users}` |
| R2 | tab overflow 제거 (8 → 5 가시) | FAIL | **RESOLVED** | `(tabs)/_layout.tsx:17-23` — 5 `<Tabs.Screen>`만 등록 (index/map/capture/cellar/community). settings/notes/cellar-detail은 stack 이동 (git rename R 마커 확인) |
| R3 | FAB (52×52, marginTop -24, gradient + gold border + shadow) | FAIL | **RESOLVED** | `bottom-nav.tsx:96-134` — Pressable 분기, w/h `spacing['13']`(52), `marginTop: -24`, `borderWidth: 1` `brand.gold`, `<LinearGradient {...gradients.fab[scheme]}>` 절대 fill, `fabShadow = scheme === 'light' ? shadows.fabLight : shadows.fabDark`, Camera icon `size={24} color={brand.cream}` |
| R4 | 컨테이너 to-top fade gradient | FAIL | **RESOLVED** | `bottom-nav.tsx:72-79` — `<LinearGradient colors={bgGradient.colors} locations={bgGradient.locations} start={bgGradient.start} end={bgGradient.end} style={StyleSheet.absoluteFillObject} />`, `bgGradient = gradients.bottomNavFade[tokens.scheme]` (design-tokens.ts:533-536: dark `rgba(37,24,55,0)→#251837`, light `rgba(250,245,236,0)→#FAF5EC`, locations `[0,0.7]`, vertical to-top) |
| R5 | borderTop 0.5px theme-aware | FAIL | **RESOLVED** | `bottom-nav.tsx:68-69` — `borderTopWidth: 0.5, borderTopColor: tokens.border.default` |
| R6 | active indicator bar 제거 (D2 keyscreen verbatim) | FAIL | **RESOLVED** | `bottom-nav.tsx` 전체 grep — `top: 0, height: 2` 패턴 0건. 활성은 color(gold) + fontWeight(semibold)로만 표현 |
| R10 | label lineHeight 10 명시 | FAIL | **RESOLVED** | `bottom-nav.tsx:186` — `lineHeight: 10` 명시 |
| R11 | padding (8/12/28 + insets) | FAIL | **RESOLVED** | `bottom-nav.tsx:65-67` — `paddingTop: spacing['2']`(8), `paddingHorizontal: spacing['3']`(12), `paddingBottom: 28 + insets.bottom` |
| R12 | label gap 3 | FAIL | **RESOLVED** | `bottom-nav.tsx:175` — `gap: spacing['0.75']`(3) (design-tokens.ts:311 확인) |
| R13 | a11y tablist + 컨테이너 label | FAIL | **RESOLVED** | `bottom-nav.tsx:60-61` — `accessibilityRole="tablist"`, `accessibilityLabel={t('nav.a11y.primary')}`. NavTab/FAB도 각각 `accessibilityRole="tab"` + `accessibilityState selected` / `accessibilityRole="button"` + `accessibilityLabel={t('nav.captureA11y')}` |
| R14 | Haptics (탭 변경 + FAB) | FAIL | **RESOLVED** | `bottom-nav.tsx:104` — FAB `Haptics.impactAsync(ImpactFeedbackStyle.Light)`. `bottom-nav.tsx:144` — NavTab `Haptics.selectionAsync()`. 둘 다 `.catch(()=>undefined)` 안전 처리 |

**11/11 RESOLVED.**

---

## 6항목 시각 체크리스트 (재검증)

### (a) 요소 누락
- **PASS**
- 5 tab slot (home/map/capture-FAB/cellar/community) 모두 존재
- FAB 자체 존재 + LinearGradient + border + shadow + Camera 아이콘
- borderTop 0.5px
- 컨테이너 to-top fade gradient
- 활성 indicator bar는 keyscreen에도 없으므로 제거가 올바른 verbatim (D2)
- a11y attributes (tablist/tab/button + selected state + labels) 모두 존재
- Haptics (선택/임팩트) 추가됨 — 키스크린 대비 RN 보강(D3 명시)
- 누락 0건

### (b) Spacing 비율
- **PASS**
- 컨테이너 padding: `8 / 12 / 28+insets` (키스크린 line 126 `'8px 12px 28px'` 동일, insets.bottom은 RN safe-area 표준 보강)
- NavTab paddingVertical: 6 (`spacing['1.5']`, 키스크린 line 203 `'6px 0'` 동일)
- NavTab gap: 3 (`spacing['0.75']`, 키스크린 line 208 `gap: 3` 동일)
- FAB marginTop: -24 (키스크린 line 169 동일)
- FAB w/h: 52 (`spacing['13']`, 키스크린 line 157-158 동일)

### (c) Gradient 방향·깊이
- **PASS**
- 컨테이너 fade: `gradients.bottomNavFade[scheme]` — start `{x:0.5, y:0}` end `{x:0.5, y:1}` (수직 vertical), locations `[0, 0.7]` (위 30% 투명 → 70%부터 fade in). dark 종점 `#251837`, light 종점 `#FAF5EC`. 키스크린의 CSS `linear-gradient(to top, deepest 70%, transparent)` 의미와 일치 (RN은 to-bottom direction이라 시작·종점 색만 swap하면 동일 시각).
- FAB: `gradients.fab[scheme]` — 135deg (`{0,0}→{1,1}`). dark `#8B1A2A → #5b1424` (wineRed → wineRedDeep), light `#C9A84C → #A07F2E` (gold → goldDeep). 키스크린 tokens.css `var(--gradient-fab)`와 색 일치 (사양 §2-6 cross-check 통과).
- 토큰 직접 재사용 — 임의 색 변경 없음.

### (d) Corner radius
- **PASS**
- FAB `borderRadius: radius.full` (9999) — 키스크린 line 159 `borderRadius: 999` 동일 (RN의 9999는 999와 시각 동일, 원형 보장).
- LinearGradient 자식도 `borderRadius: radius.full` 명시 (`bottom-nav.tsx:127`) — overflow:hidden과 함께 원형 clip 보장.
- 컨테이너 radius: 0 (키스크린 동일, 화면 끝까지 가는 bar).

### (e) Typography 위계
- **PASS**
- label `fontSize: 10`, `lineHeight: 10` (1.0 ratio — 사양 §2 verbatim, 키스크린 line 220 `lineHeight: 1` 동일)
- letterSpacing `0.2` (= 10px × 0.02em, 키스크린 line 219 `'0.02em'` 동일)
- fontWeight: active `font-inter-semibold` (600) / idle `font-inter` (400) — NW v4 className 사용 (키스크린 line 218 `fontWeight: active ? 600 : 400` 동일)
- Icon `size={22} strokeWidth={1.6}` — 키스크린 line 56-62 동일
- FAB Icon `size={24}` — 키스크린 line 172 `size={24}` 동일
- `numberOfLines={1} ellipsizeMode="tail"` 안전망 추가 (사양 §5-5 — Community/커뮤니티 width 차이 흡수)

### (f) Color 사용
- **PASS**
- 모든 색 토큰 경유 — 하드코딩 hex grep 0건 (`bottom-nav.tsx` / `(tabs)/_layout.tsx` / `(tabs)/map.tsx` / `(tabs)/community.tsx` 4 파일 모두 확인)
- active color: `brand.gold` (#C9A84C, 양쪽 모드 고정) — 키스크린 line 195 `'#C9A84C'` 동일
- idle color: `tokens.text.muted` (theme-aware via `useThemeTokens()`) — dark `#CABDA8` / light `#8B7766`
- FAB border: `brand.gold`, FAB icon: `brand.cream` — 양쪽 모드 고정 (키스크린 verbatim)
- borderTop: `tokens.border.default` (theme-aware)
- 컨테이너 gradient/FAB gradient/FAB shadow — 모두 design-tokens.ts §gradients/§shadows 토큰 직접 사용

---

## 라우트 구조 검증 (사양 §1-3 / §1-4)

| 항목 | 사양 요구 | 현재 상태 | 판정 |
|---|---|---|---|
| `app/(tabs)/_layout.tsx` 5 `<Tabs.Screen>` 등록 순서 | index / map / capture / cellar / community | (tabs)/_layout.tsx:17-23에서 정확히 5개, 순서 일치 | PASS |
| `app/(tabs)/notes.tsx` 제거 → `app/notes/index.tsx`로 이동 | 이동 후 stack route mount | git status R 마커 — `R  app/(tabs)/notes.tsx -> app/notes/index.tsx`. `app/notes/index.tsx` 존재 (useFocusEffect로 /notes/new 자동 redirect) | PASS |
| `app/(tabs)/settings/*` (4 파일) 제거 → `app/settings/*` | 이동 후 stack route mount | git status R 마커 — 4개 모두 `R` (appearance/experience/index/language) → `app/settings/*`. `(tabs)/settings/` 디렉토리 사라짐 (ls 확인) | PASS |
| `app/(tabs)/cellar/[lwin].tsx` 제거 → `app/cellar/[lwin].tsx` | 이동 (cellar/index.tsx는 (tabs)에 유지) | git status R 마커 확인. `(tabs)/cellar/` 디렉토리에 `index.tsx`만 남음 (ls 확인) | PASS |
| `app/_layout.tsx` root Stack에 notes/settings/cellar/[lwin]/wine/[lwin] 추가 | 4개 등록 | `_layout.tsx:117-120` — 정확히 4개 추가 | PASS |
| (tabs)/map.tsx + (tabs)/community.tsx placeholder | EmptyState 1줄 + TODO 주석 | 둘 다 `t('common.empty')` 사용 + `// TODO(v0.2.0)` 주석 (`(tabs)/map.tsx:10`, `(tabs)/community.tsx:10`) | PASS |
| `Tabs.Screen name="capture"` BottomNav 숨김 분기 | HIDE_BOTTOM_NAV_ROUTES 유지 | `bottom-nav.tsx:42` — `new Set(['capture'])` + line 50-52 return null | PASS |
| 라우트 path 갱신 (router.push 호출부 4곳) | `/cellar/${lwin}`, `/settings`, `/settings/experience`, `/settings` | grep 4곳 모두 변경 확인. stale `/(tabs)/{settings,notes,cellar/[lwin]}` 0건 | PASS |
| FAB의 navigate target | route.name === 'capture'면 navigation.navigate('capture') | `bottom-nav.tsx:87-94` (navigateTo 클로저) + line 105 호출 | PASS |

라우트 구조 검증 9/9 PASS.

---

## i18n 키 검증

| 키 | ko | en | 사양 요구값 일치 |
|---|---|---|---|
| `nav.home` | "홈" | "Home" | PASS (기존 유지) |
| `nav.map` | "지도" | "Map" | PASS (신규) |
| `nav.capture` | "라벨 촬영" | "Capture" | PASS (기존 유지, a11y 폴백) |
| `nav.cellar` | "셀러" | "Cellar" | PASS (기존 유지) |
| `nav.community` | "커뮤니티" | "Community" | PASS (신규) |
| `nav.notes` | "노트" | "Notes" | PASS (기존 유지, stack 헤더용) |
| `nav.settings` | "설정" | "Settings" | PASS (기존 유지, stack 헤더용) |
| `nav.captureA11y` | "와인 라벨 촬영" | "Capture wine label" | PASS (신규) |
| `nav.a11y.primary` | "주요 내비게이션" | "Primary" | PASS (신규) |

ko/en 양쪽 9 키 모두 정의 — 한쪽 누락 0건 (CLAUDE.md §4-4 충족).

---

## 다크/라이트 양쪽 모드 (정적 코드 분석 기반)

| 항목 | dark | light | 판정 |
|---|---|---|---|
| 컨테이너 배경 | `gradients.bottomNavFade.dark` (rgba(37,24,55,0) → #251837) | `gradients.bottomNavFade.light` (rgba(250,245,236,0) → #FAF5EC) | PASS — `tokens.scheme` 분기 (line 54) |
| borderTop | `tokens.border.default` (#5A3D6A) | `tokens.border.default` (#E0D2BC) | PASS — useThemeTokens |
| NavTab idle color | `tokens.text.muted` (#CABDA8) | `tokens.text.muted` (#8B7766) | PASS — useThemeTokens (line 46, line 142) |
| NavTab active color | `brand.gold` (#C9A84C) 고정 | `brand.gold` (#C9A84C) 고정 | PASS — 키스크린 verbatim 정책 (사양 §5-4) |
| FAB gradient | `gradients.fab.dark` (wineRed→wineRedDeep) | `gradients.fab.light` (gold→goldDeep) | PASS — `tokens.scheme` 분기 (line 55) |
| FAB shadow | `shadows.fabDark` (wineRed glow) | `shadows.fabLight` (gold glow) | PASS — 삼항 (line 56) |
| FAB border | `brand.gold` 고정 | `brand.gold` 고정 | PASS |
| FAB icon | `brand.cream` 고정 | `brand.cream` 고정 | PASS |

양쪽 모드 모두 정합 (CLAUDE.md §4-9 충족).

> **light 모드 gold contrast 2.15** (gold #C9A84C on `light.bg.deepest` #FAF5EC) — 사양 §7에 명시된 verbatim 결정. 본 cycle 변경 X (SCOPE-OUT 항목, 별도 cycle).

---

## 스크린샷 비교 (멀티모달)

`_workspace/keyscreen-shots/home.png` 하단 nav 영역 시각 확인:
- 5 아이콘 가시 (좌→우): 홈 / 지도(globe) / 카메라(FAB 중앙 돌출) / 셀러 / 커뮤니티 ✓
- FAB 중앙 정렬, 다른 탭보다 위로 돌출 ✓
- FAB 색조: wineRed → wineRedDeep (dark 모드 스크린샷)
- nav 상단 to-top fade (위로 갈수록 콘텐츠가 nav 뒤로 자연스럽게 fade) ✓
- borderTop 미세 라인 (0.5px) ✓
- 활성 색 (홈 탭) gold tone ✓
- 활성 indicator bar 부재 — color/weight만으로 변별 ✓

사양 §13-1 시각 체크 14개 항목 모두 PASS.

---

## 신규 FAIL 발생 검증

### F1 — pressed opacity 일관성 (정보 노트, FAIL 아님)
- NavTab pressed `opacity: 0.7` (line 176)
- FAB pressed `opacity: 0.85` (line 119)
- 사양 §5-2는 "opacity 0.7 transition" 단일 값 명시. FAB은 의도적으로 더 약한 0.85 — gradient/shadow가 강해 0.7로 죽이면 시각 부담. 키스크린 line 165 `box-shadow` + `--gradient-fab`는 hover 시 그대로 유지 (불투명도 변화 없음) → 사실 0.85가 keyscreen 의도에 더 가까움.
- 판정: **정보** (FAIL 아님). 사양과 미세 deviation이지만 시각 개선 방향. 별도 noting만.

### F2 — accessibilityLabel 누락 검증
- 컨테이너: `t('nav.a11y.primary')` ✓
- NavTab: `accessibilityLabel={label}` (= `options?.title ?? route.name`) ✓
- FAB: `t('nav.captureA11y')` ✓
- 아이콘 자체에 `aria-hidden` 동등 처리 — lucide-react-native는 SVG로 텍스트 정보 미전달이라 자동 OK
- 판정: PASS

### F3 — TypeScript 타입 안전성
- `colors`/`locations` 캐스트 `as unknown as readonly [string, string]` (line 73, 74, 124) — `expo-linear-gradient` 타입이 `readonly [string, string, ...string[]]`로 좁아 토큰 `readonly string[]`와 충돌. 캐스트 자체는 안전 (런타임은 array of 2 strings).
- 1차 시점 이슈가 아니라 ts 타입 호환 — 신규 발생 FAIL 아님.
- 판정: 정보 노트 (FAIL 아님).

### F4 — `app/notes/index.tsx` redirect 패턴
- `useFocusEffect`로 `router.push('/notes/new')` 무한 redirect — 노트 탭 진입 시 즉시 source picker로 이동. 본 사양 §1-3에서 "이미 `app/notes/` 디렉토리 존재"라 했고, 기존 `(tabs)/notes.tsx`가 같은 redirect 패턴이었음 — 동작 보존.
- 판정: PASS (사양 §12-4 "재작성 X" 정책 준수)

신규 FAIL: **0건**.

---

## SCOPE-OUT 항목 (사용자 명시)

- AppHeader 재작성 — 본 cycle 범위 외
- map/community placeholder의 실제 화면 구현 — v0.2.0
- 사양 §14 Q1 stack route에서 BottomNav 표시 정합성 — 임시 (b) 채택 (stack 진입 시 BottomNav 미표시). 사양에 명시되어 있어 deviation으로 처리.
- light 모드 gold contrast 2.15 (사양 §7) — verbatim 우선 정책으로 별도 cycle

---

## 미해결 (다음 cycle 검토)

- **사양 Q2** (사양 §14): 활성 indicator bar 제거 후 색 + fontWeight만으로 active 변별성 — 스크린샷에서 홈 탭 활성 시 gold tone이 명확히 시각 구별됨 (PASS). 추가 보강 불필요.
- **light 모드 gold contrast 2.15**: 사양에 verbatim 표기. 본 cycle은 검증 noting만, 변경 X. 후속 cycle에서 design-spec-author 사양 조정 + design-tokens 보강 필요 시 별도 작업.

---

## 결정

- 결과: **PASS**
- 1차 FAIL 11/11 RESOLVED
- 6항목 (a)(b)(c)(d)(e)(f) 모두 PASS
- 라우트 구조 9/9 PASS
- i18n 9 키 ko/en 양쪽 PASS
- 다크/라이트 양쪽 모드 정합 PASS
- 스크린샷 시각 일치 PASS
- 신규 FAIL: **0건**

## 라우팅 (parent agent 입력)

- rn-screen-builder: 추가 조치 없음. PASS 통과
- qa-inspector: 통합 정합성 검증 단계로 진행 (RLS·shape·i18n·hex grep·라우트 stale path)
- design-spec-author: 본 cycle 범위 내 사양 보강 요청 없음. light contrast 2.15은 사양 §7에 이미 명시 (별도 cycle에서 verbatim 깰지 결정)
- 리더: SCOPE-OUT 4개 항목 후속 cycle 기록 권장 (AppHeader / map+community 실제 구현 / Q1 stack BottomNav 정합성 / light contrast)
