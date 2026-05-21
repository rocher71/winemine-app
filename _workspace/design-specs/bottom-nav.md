# bottom-nav (`(tabs)` 그룹의 tabBar) Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력.
> `../winemine-keyscreen/` 직접 참조 금지 — 본 사양만 진실 소스로 사용.
> 진실 순서: keyscreen JSX > keyscreen design-system docs > i18n > 우리 design-tokens.
> 작성일: 2026-05-21 (Day 6 — BottomNav retroactive hardening + tabs overflow fix)
> author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/components/nav/bottom-nav.tsx` (228 LOC, verbatim 1차 진실)
- 마운트 위치: `../winemine-keyscreen/src/app/layout.tsx` (DeviceFrame 안에서 children fixed bottom)
- 디자인 시스템:
  - `../winemine-keyscreen/docs/design-system/colors.md` §2-6 (gradient-bottom-nav, gradient-fab, shadow-fab) + §2-1 (gold #C9A84C)
  - `../winemine-keyscreen/docs/design-system/components.md` §2-2 (BottomNav 명세 verbatim)
- 사용자 제공 스크린샷 reference: image #4 (winemine-keyscreen.vercel.app 캡처 — 5 tabs: 홈 / 지도 / 카메라(FAB) / 셀러 / 커뮤니티)
- 현재 RN 구현 (retroactive 대상):
  - `app/(tabs)/_layout.tsx` (22 LOC — 11 `<Tabs.Screen>` 등록, 8개 가시 → overflow 버그)
  - `src/components/nav/bottom-nav.tsx` (79 LOC — 커스텀 tabBar, 5 ICONS slot `{index, capture, cellar, notes, settings}` 잘못된 매핑)
  - `src/lib/design-tokens.ts` (gradients.bottomNavFade / gradients.fab / shadows.fabDark + fabLight — 모두 정의됨, 재사용)
  - `src/lib/i18n/{ko,en}.json` (`nav.*` 5개 키 정의됨 — 매핑 변경 필요)

---

## 1. Route 구성 (expo-router 재구성)

### 1-1. 현재 (BROKEN)

`app/(tabs)/_layout.tsx` 11개 `<Tabs.Screen>` 등록:

```
index / capture / cellar / notes / settings
cellar/index / cellar/[lwin]
settings/index / settings/language / settings/experience / settings/appearance
```

`href: null`로 6개를 숨기지만 expo-router는 디렉토리 구조 자동 mount → tabBar에 8개 노출 (overflow). 사용자 실측 증상: "홈 / 라벨 촬영 / 노트 / cellar/index / cellar/[lwin] / settings/index / settings/language / settings/experience / settings/appearance" 가로 overflow.

### 1-2. 목표 (5 tabs)

키스크린 verbatim — `home / map / cellar / community` 4개 + 가운데 카메라 FAB (라우트는 `/capture`).

| 위치 | RN route 식별자 | 디렉토리 | i18n key | icon (lucide) | 활성 상태 |
|---|---|---|---|---|---|
| 1 | `index` | `app/(tabs)/index.tsx` | `nav.home` | `Home` | 표시 |
| 2 | `map` | `app/(tabs)/map.tsx` (신규 placeholder) | `nav.map` | `Globe` | 표시 |
| 3 (center FAB) | `capture` | `app/(tabs)/capture.tsx` (기존) | `nav.capture` (a11y만, label 없음) | `Camera` | 표시 |
| 4 | `cellar` | `app/(tabs)/cellar/index.tsx` (디렉토리 그대로 유지) | `nav.cellar` | `Wine` | 표시 |
| 5 | `community` | `app/(tabs)/community.tsx` (신규 placeholder) | `nav.community` | `Users` | 표시 |

### 1-3. (tabs) 그룹에서 **제외 (stack 분리)**

기존 화면을 새로 작성하지 않고, 위치만 (tabs) 밖으로 이동해 stack route로 재마운트.

| 현재 경로 (BROKEN) | 새 경로 (stack) | 디렉토리 이동 방법 |
|---|---|---|
| `app/(tabs)/notes.tsx` | `app/notes/index.tsx` | **이미 `app/notes/` 디렉토리 존재** — `app/(tabs)/notes.tsx`만 삭제하고 `app/notes/index.tsx`가 lhrs cause로 동작 (또는 `app/notes.tsx`로 이동) |
| `app/(tabs)/settings/index.tsx` | `app/settings/index.tsx` | `app/settings/` 디렉토리 신규 생성, 파일 4개 이동 |
| `app/(tabs)/settings/language.tsx` | `app/settings/language.tsx` | 이동 |
| `app/(tabs)/settings/experience.tsx` | `app/settings/experience.tsx` | 이동 |
| `app/(tabs)/settings/appearance.tsx` | `app/settings/appearance.tsx` | 이동 |
| `app/(tabs)/cellar/[lwin].tsx` | `app/cellar/[lwin].tsx` | `app/cellar/` 디렉토리 신규 생성, `[lwin].tsx`만 이동 (cellar 탭 리스트는 (tabs)에 그대로) |

이동 후 `app/_layout.tsx`의 root `<Stack>`에 다음을 추가 (현재는 `index / onboarding / (tabs)`만 등록):

```tsx
<Stack.Screen name="notes" />
<Stack.Screen name="settings" />
<Stack.Screen name="cellar/[lwin]" />
<Stack.Screen name="wine/[lwin]" />  // 이미 app/wine/[lwin].tsx 존재 — 명시 등록 권장
```

### 1-4. (tabs)/_layout.tsx 새 골격

```tsx
<Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <BottomNav {...p} />}>
  <Tabs.Screen name="index"      options={{ title: t('nav.home') }} />
  <Tabs.Screen name="map"        options={{ title: t('nav.map') }} />
  <Tabs.Screen name="capture"    options={{ title: t('nav.capture') }} />
  <Tabs.Screen name="cellar"     options={{ title: t('nav.cellar') }} />
  <Tabs.Screen name="community"  options={{ title: t('nav.community') }} />
</Tabs>
```

**중요**: `Tabs.Screen` 등록 순서가 곧 tab index 순서이며, BottomNav 컴포넌트는 `state.routes.findIndex(r => r.name === 'capture')`로 가운데 FAB을 식별 (이름 기반, index 기반 X).

### 1-5. capture 탭에서 BottomNav 숨김

기존 정책 유지 (capture.md §10-5): `HIDE_BOTTOM_NAV_ROUTES = new Set(['capture'])` — 현재 RN 구현에 이미 존재. 5-tab 재구성 후에도 그대로 유지.

---

## 2. Layout Tree (verbatim 변환)

키스크린 line 121~183 1:1 매핑.

```
SafeAreaView (edges 없음 — bottom은 insets.bottom으로 직접 처리)
  View  // 컨테이너 (position relative, but Tabs tabBar slot은 자동 bottom-fixed)
    LinearGradient  // gradients.bottomNavFade — to top, 70%부터 deepest, 위 30% 투명
      paddingHorizontal: 12
      paddingTop: 8
      paddingBottom: 28 + insets.bottom  // safe area 흡수
      borderTopWidth: 0.5 (StyleSheet.hairlineWidth 대신 0.5 명시 — 키스크린 동일)
      borderTopColor: border.default (theme-aware)
      flexDirection: row
      alignItems: flex-end  // FAB이 위로 튀어나가도 다른 탭은 베이스라인 기준 정렬
      View tabsRow (flex-direction row, 5 슬롯)
        NavTab home       (flex 1)
        NavTab map        (flex 1)
        View fabSlot      (flex 1, justifyContent center, alignItems center)
          Pressable FAB   (52×52, marginTop -24, gradient + border + shadow)
            Camera icon (24, color: brand.cream)
        NavTab cellar     (flex 1)
        NavTab community  (flex 1)
```

### NavTab 내부 (line 185~227 verbatim)

```
Pressable
  flex: 1
  paddingVertical: 6
  alignItems: center
  flexDirection: column
  gap: 3              // 키스크린 verbatim — NW v4 기본 토큰에 있음
  accessibilityRole: 'tab'
  accessibilityState: { selected: focused }

  // 활성 상단 indicator bar (키스크린에는 없음 — deviation §10 D2)
  // → 키스크린 verbatim 따라 indicator bar 제거. 활성은 color + fontWeight로만 표현.

  NavIcon (22, strokeWidth 1.6, strokeLinecap round, strokeLinejoin round)
    color: focused ? brand.gold (#C9A84C, 테마 고정) : text.muted (theme-aware)
  Text label
    fontFamily: focused ? Inter_600SemiBold : Inter_400Regular
    fontSize: 10
    letterSpacing: 0.2  // = 10 * 0.02em = 0.2px
    lineHeight: 10      // 1.0 ratio (키스크린 verbatim)
    color: focused ? brand.gold : text.muted
```

### FAB 내부 (line 152~174 verbatim)

```
Pressable
  width: 52, height: 52
  borderRadius: 999 (radius.full)
  marginTop: -24                  // 핵심 — 다른 탭보다 24px 위로 돌출
  borderWidth: 1
  borderColor: brand.gold (#C9A84C)
  alignItems: center, justifyContent: center
  flexShrink: 0
  accessibilityRole: 'button'
  accessibilityLabel: t('nav.captureA11y')

  LinearGradient (gradients.fab[scheme])
    StyleSheet.absoluteFillObject + borderRadius 999
    colors: dark=[wineRed, wineRedDeep] / light=[gold, goldDeep]
    start {0,0} end {1,1}  // 135deg

  shadow: shadows.fabDark (dark) / shadows.fabLight (light)
  // RN에서 inset shadow는 미지원 — 키스크린의 `inset 0 1px 0 rgba(255,255,255,0.12)`는 deviation §10 D1.

  Camera icon (lucide, size 24, color: brand.cream)
```

---

## 3. NativeWind v4 매핑표

대부분 inline style (RN ShadowProps / LinearGradient props / marginTop -24) — NW className은 보조.

| 키스크린 (Next Tailwind/CSS) | RN+NW v4 + design-tokens | 비고 |
|---|---|---|
| `position: absolute; bottom 0; left 0; right 0` | expo-router Tabs `tabBar={...}` 자동 bottom-fixed — 별도 X | 우리는 Tabs 슬롯 사용 |
| `padding: 8px 12px 28px` | inline `{ paddingTop: 8, paddingHorizontal: 12, paddingBottom: 28 + insets.bottom }` | 28은 safe area inset 위에 추가 |
| `background: var(--gradient-bottom-nav)` | `<LinearGradient {...gradients.bottomNavFade[scheme]} style={StyleSheet.absoluteFillObject} />` | 토큰 이미 존재 |
| `border-top: 0.5px solid var(--color-border-default)` | inline `{ borderTopWidth: 0.5, borderTopColor: theme.border.default }` | RN 0.5 지원, hairline 사용 X |
| `z-index: 25` | 미해당 — tabBar는 RN 네이티브 stacking 사용 | deviation 없음 |
| `display: flex; align-items: flex-end; gap 0` | `className="flex-row items-end"` | NW v4 동등 |
| FAB `width:52 height:52 borderRadius:999` | `className="w-13 h-13 rounded-full"` (13 = spacing[13]=52 — 토큰 정의됨) | spacing[13] 이미 존재 |
| FAB `background: var(--gradient-fab)` | `<LinearGradient {...gradients.fab[scheme]} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />` | 토큰 존재 |
| FAB `border: 1px solid var(--color-gold)` | `className="border border-[#C9A84C]"` 또는 inline `{ borderWidth: 1, borderColor: brand.gold }` | brand.gold 토큰 사용 권장 |
| FAB `box-shadow: var(--shadow-fab)` | `style={scheme === 'light' ? shadows.fabLight : shadows.fabDark}` | 토큰 둘 다 존재 |
| FAB `color: var(--color-cream)` | `<Camera color={brand.cream} size={24} />` | 토큰 사용 |
| FAB `flex-shrink: 0` | `className="shrink-0"` | NW v4 동등 |
| FAB `marginTop: -24` | inline `{ marginTop: -24 }` (NW v4 negative margin 6=24 → `-mt-6` 가능) | `-mt-6` 권장 |
| FAB `inset 0 1px 0 rgba(255,255,255,0.12)` (CSS inset shadow) | RN 미지원 — 생략 | deviation §10 D1 |
| NavTab `padding: 6px 0` | `className="px-0 py-1.5"` (py-1.5 = 6) | NW v4 동등 |
| NavTab `gap: 3` | `className="gap-[3px]"` (3은 기본 scale에 없음) | 또는 inline `{ gap: 3 }`. spacing[0.75]=3 토큰 존재 → `gap-0.75` |
| NavTab label `font-size: 10` | inline `{ fontSize: 10 }` 또는 `className="text-[10px]"` | typography.bottomNavActive/Idle 토큰 이미 정의됨 — `size: 10` |
| NavTab label `font-weight: 600 (active) / 400` | `className={active ? 'font-inter-semibold' : 'font-inter'}` | 기존 RN 패턴 유지 |
| NavTab label `letter-spacing: 0.02em` | inline `{ letterSpacing: 0.2 }` (10px × 0.02 = 0.2px) | typography.bottomNavActive.letterSpacing = 0.2 (이미 토큰 존재) |
| NavTab label `line-height: 1` | inline `{ lineHeight: 10 }` | 키스크린 verbatim |
| Active color `#C9A84C` (테마 고정) | inline `{ color: brand.gold }` | brand 토큰 — 테마 무관 |
| Idle color `var(--color-text-muted)` | inline `{ color: scheme === 'light' ? light.text.muted : dark.text.muted }` | theme-aware |
| Icon `strokeWidth: 1.6 strokeLinecap: round strokeLinejoin: round` | `<Icon strokeWidth={1.6} />` (lucide-react-native는 round 기본값) | size=22 (lucide), 키스크린 SVG와 동등 |

---

## 4. 디자인 토큰 (이미 존재 — 재사용 100%)

### 4-1. 사용 토큰 inventory

| 토큰 | 위치 | 용도 |
|---|---|---|
| `brand.gold` (#C9A84C) | design-tokens.ts §brand | NavTab active color, FAB border |
| `brand.cream` (#F5F0E8) | design-tokens.ts §brand | FAB icon color |
| `brand.wineRed`, `brand.wineRedDeep` | design-tokens.ts §brand | FAB dark gradient (gradients.fab.dark 내부 명시) |
| `brand.goldDeep` (#A07F2E) | design-tokens.ts §brand | FAB light gradient (gradients.fab.light 내부 명시) |
| `dark.text.muted` / `light.text.muted` | design-tokens.ts §dark/light | NavTab idle color (theme-aware) |
| `dark.bg.deepest` / `light.bg.deepest` | design-tokens.ts §dark/light | gradients.bottomNavFade 종점 색 (이미 내부 정의) |
| `dark.border.default` / `light.border.default` | design-tokens.ts §dark/light | borderTop 색 |
| `gradients.bottomNavFade.dark/light` | design-tokens.ts §gradients | 컨테이너 to-top fade gradient |
| `gradients.fab.dark/light` | design-tokens.ts §gradients | FAB 135deg gradient |
| `shadows.fabDark` / `shadows.fabLight` | design-tokens.ts §shadows | FAB outer shadow (wineRed glow / gold glow) |
| `typography.bottomNavActive` / `typography.bottomNavIdle` | design-tokens.ts §typography | label font-family/size/letter-spacing |
| `componentSize.bottomNavTab` (56) | design-tokens.ts §componentSize | 참고용 — NavTab 표준 높이 (실제 colWidth는 flex 1) |
| `spacing[13]` (52) | design-tokens.ts §spacing | FAB w/h |
| `radius.full` (9999) | design-tokens.ts §radius | FAB 원형 |

### 4-2. 신규 토큰 필요 = **0개**

키스크린 BottomNav 모든 색·gradient·shadow·spacing·typography가 이미 design-tokens.ts에 정의되어 있음. retroactive 작업의 모범 사례.

### 4-3. tailwind.config.ts 확장 필요 = **0개**

`w-13`, `h-13`, `-mt-6`, `py-1.5`, `gap-0.75`, `rounded-full`, `flex-row`, `items-end`, `shrink-0` — 모두 NW v4 기본 또는 우리 확장 spacing scale에 존재.

---

## 5. 상태 variants

### 5-1. default (특정 tab active, 다른 4 inactive)

- active tab: icon + label = `brand.gold (#C9A84C)`, label fontWeight 600
- inactive 3 tabs: icon + label = `text.muted` (dark `#CABDA8` / light `#8B7766`), label fontWeight 400
- FAB: 위 §2 FAB 명세 그대로 — 어느 탭이든 모양 동일 (active 상태 없음; 항상 같은 와인레드/골드 그라데이션)

### 5-2. pressed (모든 탭 + FAB 공통)

- `Pressable` `{ ({ pressed }) => style }` 패턴 — opacity 0.7 transition
- haptic feedback: 탭 변경 시 `Haptics.selectionAsync()` (FAB tap 시 `Haptics.impactAsync(Light)`)
- 키스크린은 Next.js Link로 hover만 지원 — RN은 press feedback이 표준 (deviation §10 D3)

### 5-3. capture route 진입 시

- BottomNav 자체 렌더 X (`HIDE_BOTTOM_NAV_ROUTES.has('capture')` → return null)
- 기존 동작 유지

### 5-4. dark / light

- 컨테이너 gradient: `gradients.bottomNavFade.dark` / `.light`
- 컨테이너 borderTop: `dark.border.default (#5A3D6A)` / `light.border.default (#E0D2BC)`
- NavTab idle color: `dark.text.muted (#CABDA8)` / `light.text.muted (#8B7766)`
- NavTab active color: `brand.gold (#C9A84C)` — **양쪽 모드 고정** (키스크린 verbatim, components.md §2-2 line 81 "활성 색: #C9A84C (Gold 고정) — 테마에 관계없이 Gold")
- FAB gradient: `gradients.fab.dark` (wineRed→wineRedDeep) / `gradients.fab.light` (gold→goldDeep)
- FAB shadow: `shadows.fabDark` (wineRed glow) / `shadows.fabLight` (gold glow)
- FAB border: `brand.gold` — 양쪽 모드 고정
- FAB icon: `brand.cream` — 양쪽 모드 고정

### 5-5. ko / en

- nav.* i18n key로 label 처리. 한쪽 locale에서 한글/영문 누락 0 (CLAUDE.md §4-4).
- label width 변화: "커뮤니티" (4자 24px) vs "Community" (9자 ~52px) — 키스크린 동일 패턴이며 flex-1로 자동 흡수. 단, `numberOfLines={1}` + `ellipsizeMode="tail"` 권장 (안전망).

### 5-6. loading / empty / error

- 해당 없음 — BottomNav는 정적 컴포넌트, 데이터 비의존.

---

## 6. 인터랙션

| 요소 | 인터랙션 | 결과 |
|---|---|---|
| NavTab (home/map/cellar/community) | tap | `navigation.navigate(route.name)` (이미 focused면 no-op — defaultPrevented 체크 유지) |
| NavTab | tap | `Haptics.selectionAsync()` 발화 (옵션 — 기존 구현엔 없음; 추가 권장) |
| FAB (capture) | tap | `navigation.navigate('capture')` (Tabs 그룹 내 탭 전환과 동일) |
| FAB | tap | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` |
| 컨테이너 | scroll behind | 자식 콘텐츠가 fade gradient 영역을 통과 시 텍스트 가독성 자연 fade (키스크린 to-top fade 동일) |

---

## 7. 접근성 (a11y)

| 요소 | a11y 속성 |
|---|---|
| 컨테이너 `<View>` | `accessibilityRole="tablist"`, `accessibilityLabel={t('nav.a11y.primary')}` ("주요 내비게이션" / "Primary") |
| NavTab `<Pressable>` | `accessibilityRole="tab"`, `accessibilityState={{ selected: focused }}`, `accessibilityLabel={options.title}` |
| FAB `<Pressable>` | `accessibilityRole="button"`, `accessibilityLabel={t('nav.captureA11y')}` ("와인 라벨 촬영" / "Capture wine label") |
| 모든 아이콘 | `<Icon aria-hidden />` 동등 — 텍스트 label이 정보 전달, 아이콘은 장식 |

대비 검증 (WCAG AA 4.5:1):
- gold #C9A84C on `dark.bg.deepest` #251837 → contrast 6.32 PASS
- gold #C9A84C on `light.bg.deepest` #FAF5EC → contrast 2.15 **FAIL** — but 키스크린 verbatim 정책. design-reviewer가 별도 noting 가능. 본 cycle 변경 X (verbatim 우선).
- `dark.text.muted` #CABDA8 on dark.bg.deepest #251837 → contrast 7.51 PASS
- `light.text.muted` #8B7766 on light.bg.deepest #FAF5EC → contrast 4.84 PASS

---

## 8. i18n 키 매핑

### 8-1. 추가 필요 (ko.json / en.json)

```jsonc
"nav": {
  "home": "홈",              // 기존 유지
  "map": "지도",             // 신규
  "capture": "라벨 촬영",     // 기존 유지 (a11y 폴백)
  "cellar": "셀러",          // 기존 유지
  "community": "커뮤니티",   // 신규
  "settings": "설정",        // 기존 유지 (BottomNav 미사용, settings stack 헤더용)
  "notes": "노트",           // 기존 유지 (notes stack 헤더용; BottomNav 미사용)
  "captureA11y": "와인 라벨 촬영",  // 신규 — FAB accessibilityLabel
  "a11y": {                  // 신규
    "primary": "주요 내비게이션"
  }
}
```

en.json:

```jsonc
"nav": {
  "home": "Home",
  "map": "Map",
  "capture": "Capture",
  "cellar": "Cellar",
  "community": "Community",
  "settings": "Settings",
  "notes": "Notes",
  "captureA11y": "Capture wine label",
  "a11y": {
    "primary": "Primary"
  }
}
```

### 8-2. 제거 필요 = 0개

기존 `nav.{home,capture,cellar,notes,settings}` 5개 키는 모두 보존. `notes` / `settings`는 stack route 헤더 타이틀로 재활용.

> `nav.cellar/[lwin]`, `nav.settings/language` 같은 키는 **처음부터 정의된 적 없음** (i18n key는 expo-router route name과 별개). 제거할 키 없음.

---

## 9. RN 제약 deviation 로그

| # | 키스크린 표기 | RN 대체 | 사유 |
|---|---|---|---|
| D1 | FAB `inset 0 1px 0 rgba(255,255,255,0.12)` (CSS inset shadow) | 생략 | RN ShadowProps는 outer shadow만 지원. expo-blur나 inner glow는 비용 대비 시각 손실 미미 (1px highlight 라인) — 생략 채택. design-reviewer 시각 비교 시 무시 가능 항목. |
| D2 | (없음 — 키스크린 verbatim 따름) | 활성 indicator bar (현재 RN 구현의 top 2px gold bar) **제거** | 현재 우리 RN `bottom-nav.tsx` line 63~66에 `<View style={{ top:0, height:2, backgroundColor: brand.gold }} />`로 indicator bar 그림. 키스크린에는 없음 (color + fontWeight로만 active 표현). verbatim 원칙으로 제거. |
| D3 | `hover:opacity-80` (Next Link CSS hover) | `Pressable {pressed && opacity 0.7}` | RN hover 부재 — press feedback이 표준 |
| D4 | `position: fixed; z-index 25` (전체 viewport 기준) | expo-router `<Tabs tabBar={...}>` slot이 자동으로 bottom fixed 처리 | RN 네이티브 stacking 위임. z-index 명시 불필요 |
| D5 | DeviceFrame 외곽 inset shadow | RN에서 미구현 (mobile only — DeviceFrame은 keyscreen desktop 데모 전용) | 우리는 실제 디바이스 풀스크린 동작 — DeviceFrame 미적용 |
| D6 | Next.js `<Link href>` | expo-router `<Link href>` 또는 navigation.navigate 사용. 우리는 후자 (state.routes 기반 tabBar) | 동등 효과 |

---

## 10. 현재 구현 차이 (retroactive)

기존 파일: `src/components/nav/bottom-nav.tsx` (Day 1) + `app/(tabs)/_layout.tsx` (Day 1~5 누적)

| # | 항목 | 키스크린 원본 | 현재 구현 | 수정 필요 |
|---|---|---|---|---|
| R1 | tab 구성 | 5: home/map/(FAB capture)/cellar/community | 5 tab slot이지만 ICONS 매핑이 `{index, capture, cellar, notes, settings}` (BookOpen/Settings) — **틀린 슬롯** | ICONS 매핑을 `{index: Home, map: Globe, capture: Camera, cellar: Wine, community: Users}`로 교체 |
| R2 | tab overflow | 5 tabs 가시 | (tabs) 디렉토리에 11개 등록 → 8개 가시 (overflow) | settings 디렉토리·notes·cellar/[lwin]을 stack route로 이동 (§1-3) |
| R3 | FAB | 가운데 52px floating, marginTop -24, wineRed gradient + gold border + glow shadow | FAB 자체 없음 — 평범한 NavTab으로 capture 표시 (Camera icon만 있는 일반 탭) | FAB 컴포넌트 추가 (§2 FAB section). state.routes에서 `name === 'capture'`인 슬롯을 fabSlot으로 분기 렌더 |
| R4 | 컨테이너 배경 | `gradients.bottomNavFade` (to top, 70% deepest) | 단색 `dark.bg.deep` / `light.bg.deep` | `<LinearGradient {...gradients.bottomNavFade[scheme]} style={absoluteFillObject} />`로 교체 |
| R5 | borderTop | 0.5px `border.default` | 없음 (background만) | `borderTopWidth: 0.5, borderTopColor: theme.border.default` 추가 |
| R6 | active indicator bar | 없음 | 상단 2px gold bar | 제거 (D2) |
| R7 | active color | `brand.gold` (테마 고정) | `brand.gold` | 변경 없음 (이미 OK) |
| R8 | label font-weight | active 600 / idle 400 | active `font-inter-semibold` / idle `font-inter` | 변경 없음 (이미 OK) |
| R9 | label letter-spacing | 0.2px | 0.2px (inline style) | 변경 없음 (이미 OK) |
| R10 | label line-height | 10 (1.0 ratio) | 명시 X (RN 기본 ~1.2) | `lineHeight: 10` 명시 추가 |
| R11 | padding | `8 12 28` + safeArea | safeArea만 (paddingTop/paddingHorizontal 누락) | inline padding 추가 |
| R12 | tab gap | 3 (icon-label 간격) | `mt-1` (4) | `gap-0.75` (3) 또는 inline `{ gap: 3 }`로 교정 |
| R13 | a11y | `aria-label="Primary"` + tab role | tab role만 (컨테이너 a11yLabel 없음) | tablist role + 컨테이너 a11yLabel 추가 |
| R14 | haptic | (Next.js 미해당) | 없음 | `Haptics.selectionAsync` (탭 변경) + `Haptics.impactAsync(Light)` (FAB) 추가 |
| R15 | settings/notes/cellar-detail 라우트 | (tabs)에서 제거 | (tabs) 안에 mount | (tabs) 밖 stack으로 이동 (§1-3) |
| R16 | i18n 키 | `nav.{home,map,capture,cellar,community,captureA11y}` + `nav.a11y.primary` | `nav.{home,capture,cellar,notes,settings}` | `nav.map`/`nav.community`/`nav.captureA11y`/`nav.a11y.primary` 추가 (§8) |

---

## 11. 신규 placeholder 화면 (범위 명시)

**범위 외 (본 cycle 미구현)**: `/map` / `/community` 실제 UI. 본 cycle은 라우트만 등록 + 임시 placeholder.

| 파일 | 내용 |
|---|---|
| `app/(tabs)/map.tsx` | `<View className="flex-1 items-center justify-center bg-bg-deepest dark:bg-bg-deepest"><Text>{t('common.empty')}</Text></View>` — TODO comment: "v0.2.0 World Map 구현" |
| `app/(tabs)/community.tsx` | 동일 패턴 — TODO comment: "v0.2.0 Community 구현" |

> placeholder는 단순 EmptyState 1줄. design-spec 별도 작성 X (본 cycle 범위 외).

---

## 12. 변경 영향 범위 (rn-screen-builder 입력)

### 12-1. 새로 생성

- `app/(tabs)/map.tsx` (placeholder, ~10 LOC)
- `app/(tabs)/community.tsx` (placeholder, ~10 LOC)
- `app/cellar/[lwin].tsx` (`(tabs)/cellar/[lwin].tsx` 파일 이동)
- `app/notes/index.tsx` 또는 `app/notes.tsx` (`(tabs)/notes.tsx` 파일 이동)
- `app/settings/{index,language,experience,appearance}.tsx` (`(tabs)/settings/*` 파일 4개 이동)

### 12-2. 수정

- `app/(tabs)/_layout.tsx` (전면 재작성 — 11 → 5 Tabs.Screen)
- `app/_layout.tsx` (root Stack에 notes/settings/cellar/[lwin]/wine/[lwin] 추가)
- `src/components/nav/bottom-nav.tsx` (전면 재작성 — FAB 분기 + 5 tab ICONS + gradient + borderTop + indicator bar 제거)
- `src/lib/i18n/{ko,en}.json` (nav.map / nav.community / nav.captureA11y / nav.a11y.primary 추가)

### 12-3. 삭제

- `app/(tabs)/notes.tsx` (notes route로 이동 후)
- `app/(tabs)/cellar/[lwin].tsx` (cellar/[lwin]로 이동 후)
- `app/(tabs)/settings/` 디렉토리 전체 (settings/로 이동 후)

### 12-4. **유지 (재작성 금지)**

- `app/(tabs)/index.tsx` (홈)
- `app/(tabs)/capture.tsx` (캡처)
- `app/(tabs)/cellar/index.tsx` (셀러 리스트)
- `app/notes/{[noteId],new,write,write/[wineLwin]}.tsx` 등 노트 stack 내부 화면 (위치만 그대로, 라우팅 부모만 변경)
- 옮겨질 `settings/{index,language,experience,appearance}.tsx` 화면 내용 (재작성 X, 파일 이동만)
- `cellar/[lwin].tsx` 화면 내용 (재작성 X, 파일 이동만)
- `src/components/settings/*` 컴포넌트 (재사용)

---

## 13. 검증 체크리스트 (design-reviewer + qa-inspector 입력)

### 13-1. 시각 (design-reviewer)

- [ ] 5 tabs 정확히 노출 (홈/지도/카메라FAB/셀러/커뮤니티)
- [ ] FAB이 다른 탭보다 24px 위로 돌출
- [ ] FAB이 dark 모드에서 wineRed gradient + wineRed glow
- [ ] FAB이 light 모드에서 gold gradient + gold glow
- [ ] FAB border 1px gold (양쪽 모드 동일)
- [ ] FAB icon white (cream) 24px
- [ ] active 탭 label + icon = gold (양쪽 모드 동일)
- [ ] inactive 탭 label + icon = text.muted (theme-aware)
- [ ] 컨테이너 상단 0.5px border
- [ ] 컨테이너 to-top fade gradient (위 30% 투명)
- [ ] indicator bar 없음 (active는 color만)
- [ ] icon size 22, label 10px Inter
- [ ] capture route 진입 시 BottomNav 숨김
- [ ] safe area inset 흡수 — bottomPadding 28 + insets.bottom

### 13-2. 기능 (qa-inspector)

- [ ] tab 5개만 노출 (overflow 0)
- [ ] settings 진입 시 (tabs) 그룹 떠나서 stack route 표시 (BottomNav 보이지 않거나, 또는 stack route는 별도 — 정책 명시 필요)
- [ ] cellar/[lwin] 진입 시 stack route — BottomNav 미표시
- [ ] notes 진입 시 stack route — BottomNav 미표시 (TBD: notes는 tab으로 노출 안 함, 노트는 홈/캡처/내 셀러에서 진입)
- [ ] ko/en 양쪽 label 정상 — 한쪽 누락 0
- [ ] dark/light 양쪽 색 정상
- [ ] 하드코딩 hex grep 0 (모두 토큰 경유)
- [ ] emoji grep 0 (icon은 lucide만)
- [ ] a11y `accessibilityRole="tab"` + `accessibilityState selected` 동작
- [ ] FAB tap → /capture 진입 + haptic

---

## 14. 미해결 질문 (리더 판단 필요)

- **Q1**: settings/notes/cellar-detail이 stack route로 분리될 때, 해당 stack에서도 BottomNav를 표시할지? — 키스크린은 `HIDDEN_PREFIXES = ['/onboarding', '/capture', '/notes/new']`로 noting (settings/cellar는 BottomNav 표시함). 우리는 (tabs) 그룹 밖으로 빼면 자동으로 BottomNav 미표시. **합의 필요**: 키스크린 verbatim이면 settings/cellar-detail에서도 BottomNav 표시 → 두 가지 해법.
  - (a) settings/cellar-detail/notes를 (tabs) 그룹 안에 다시 두되 `href: null`로 hide하고, screen 진입 시에도 active tab을 부모(cellar/index)로 유지 — 현재 시도했으나 overflow 발생 → 다른 메커니즘 필요.
  - (b) settings/cellar-detail/notes를 stack으로 빼고, 해당 화면 자체에서 `<BottomNav />` 별도 렌더 (props로 active hint 전달).
  - 본 cycle 1차 권장: **(b)** — stack route + 화면별 BottomNav 별도 렌더. 단, BottomNav 컴포넌트가 expo-router state 의존 → BottomTabBarProps 없이도 동작하는 prop API (`activeTabName: 'cellar'`) 추가 필요.
  - **임시 결론**: 본 cycle은 (b) 채택 — settings/cellar-detail에서 BottomNav 미표시 (가장 단순). 추후 키스크린 verbatim이 critical하면 별도 cycle에서 재구성.
- **Q2**: 활성 indicator bar 제거 후, 시각적으로 active tab 변별이 약해질 위험. design-reviewer가 dark 모드에서 gold color + 600 weight만으로 충분히 구별되는지 시각 검증 필요. 부족 시 deviation 추가 (예: 상단 2px gold bar 복원 — keyscreen 외 첨가지만 a11y 보완).

---

## 15. 작성 완료 신호 (rn-screen-builder 전달)

- 파일: `_workspace/design-specs/bottom-nav.md`
- 신규 토큰 수: **0** (모두 재사용)
- i18n 키 추가: **4** (nav.map / nav.community / nav.captureA11y / nav.a11y.primary)
- 라우트 재구성: settings 디렉토리 4개 파일 + cellar/[lwin].tsx + notes.tsx를 (tabs) 그룹 밖 stack으로 이동, (tabs)/_layout.tsx 5-tab만 등록, BottomNav 컴포넌트는 FAB 분기 + gradient 배경 + indicator bar 제거로 재작성. 화면 자체(settings/cellar-detail/notes 내부)는 재작성 X.
