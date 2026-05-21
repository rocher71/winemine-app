# home Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen messages (`messages/{ko,en}.json`) > design-system docs > 우리 token/cheatsheet.
> 작성일: 2026-05-20 (Day 6 retroactive hardening) · author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/app/page.tsx` (345 lines — `HomePage`, `PeakGreeting`, `MapCameo`, `MiniMapPreview` 인라인 정의)
- 자식 컴포넌트:
  - `../winemine-keyscreen/src/components/nav/app-header.tsx`
  - `../winemine-keyscreen/src/components/nav/bottom-nav.tsx`
  - `../winemine-keyscreen/src/components/home/stat-hero.tsx`
  - `../winemine-keyscreen/src/components/home/draft-note-resume.tsx`
  - `../winemine-keyscreen/src/components/home/recent-notes-strip.tsx`
  - `../winemine-keyscreen/src/components/home/quick-actions.tsx`
  - `../winemine-keyscreen/src/components/home/first-time-greeting.tsx`
  - `../winemine-keyscreen/src/components/home/empty-stat-hero.tsx`
  - `../winemine-keyscreen/src/components/home/suggested-actions.tsx`
  - `../winemine-keyscreen/src/components/home/wine-feed.tsx`
  - `../winemine-keyscreen/src/components/home/home-community-peek.tsx`
  - `../winemine-keyscreen/src/components/shared/wm-bottle.tsx`
  - `../winemine-keyscreen/src/components/shared/wm-glass-rating.tsx`
  - `../winemine-keyscreen/src/components/shared/primary-button.tsx`
  - `../winemine-keyscreen/src/components/community/comm-user-avatar.tsx`
  - `../winemine-keyscreen/src/components/community/post-type-badge.tsx`
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- i18n: `../winemine-keyscreen/messages/{ko,en}.json` (네임스페이스 `home.*`)
- 스크린샷 reference: `_workspace/keyscreen-shots/home.png` (heavy 모드, dark, ko — peak greeting + draft resume + 3-col stats + map cameo + community peek + recent notes + wine feed + quick actions가 모두 한 스크롤 안에 보임)
- 현재 RN 구현 (retroactive 대상): `app/(tabs)/index.tsx` + `src/components/home/*` (5 파일, ~165 LOC 총합)

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/(tabs)/index.tsx` |
| 진입 경로 | `/` (BottomNav 홈 탭, 앱 기본 진입점) |
| 헤더 | 화면 내부 `<AppHeader />` (인사·레벨칩·벨), 상단 SafeArea 처리 |
| BottomNav | **표시함** (홈 탭 active) — keyscreen은 `position: absolute`, RN에서는 Expo Router (tabs) 자동 |
| 진입 가드 | `mode === 'first-time' && !onboardingComplete` → `/onboarding`으로 `router.replace` (keyscreen `useEffect` 동일) |
| 모드 분기 | `mode === 'heavy'` 변형 (8섹션) vs `mode === 'first-time'` 변형 (4섹션) — 같은 route, 컨텐츠만 분기 |
| 다크/라이트 | 둘 다 지원 (keyscreen에서 검증됨) |

> **redirect 시점**: NW colorScheme/profile 로드 완료 후. Loading 중에는 `<ActivityIndicator/>` 표시 → 깜박임 방지.

---

## 2. Layout Tree (verbatim 변환)

### 2-1. heavy 모드 — 8개 섹션 (순서 verbatim, 키스크린 line 98~128)

```
SafeAreaView (edges=['top'], flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── AppHeader                                              ← 고정, scroll 외부
│     ├── Logo zone (Pressable → '/')
│     │     ├── WMLogoMark (와인잔 SVG, 26px)
│     │     └── WMLogoWordmark ("wine·mine", Playfair 18px, separator '·' gold)
│     ├── Spacer (flex-1)
│     ├── BellButton (36×36, Pressable → '/notifications')
│     │     └── Bell SVG (20px, currentColor=text-secondary)
│     │         + red dot circle (cx=18 cy=6 r=2.5 fill=wine-red) ← unread 시
│     └── LevelChip (heavy) OR Avatar Circle (first-time)
│           ├── Avatar gradient circle (24×24, level color → level color+99)
│           │     └── initial Text (Playfair 12px 700, deepest-dark)
│           └── L{levelId} Text (Inter 11px 600, level color, tracking 0.04em)
├── ScrollView (flex-1, refreshControl, contentContainerStyle.paddingBottom=32)
│     ├── PeakGreeting (sticky NO, padding 18px 20px 0)
│     │     ├── eyebrow Text "오늘의 셀러" (Inter 10px 500, gold, tracking 0.18em UPPER)
│     │     └── animated question Text (Playfair 22px, cream, lineHeight 1.25, tracking -0.01em)
│     │           - wine name inside is italic + gold
│     │           - 5초마다 fade out (-6y) + fade in (+6y → 0), AnimatePresence mode='wait'
│     ├── DraftNoteResume (Pressable → `/notes/new/write?wineId=`, m=14_16_0_16, p=12_14, radius=14)
│     │     ├── background: LinearGradient 135deg [rgba(139,26,42,0.45), surface]
│     │     ├── border: 1px rgba(139,26,42,0.55)
│     │     ├── Row (gap=12 items-center)
│     │     │     ├── Pen Icon Circle (32×32, bg-bg-deep, border-default, radius full)
│     │     │     │     └── Pen SVG (16px, gold)
│     │     │     ├── Text column (flex-1, minWidth 0)
│     │     │     │     ├── Title "작성 중인 노트" (Inter 12px 600, cream, lh 1.3)
│     │     │     │     └── Subtitle "퓌셀 2019 · 90% 작성" (Inter 11px, text-secondary, mt=2, 1줄 truncate)
│     │     │     └── CTA Chip "이어 쓰기" (border 1px gold, gold text, Inter 11px 600, p=7_12, radius full)
│     ├── StatHero (3-col grid, gap=6, padding 12_16_0)
│     │     ├── Card[0] (radius=12, p=8_10, bg-surface, border-default)
│     │     │     ├── Value (Playfair 20px, cream, lh 1.1, tracking -0.02em)
│     │     │     └── Label "방문 국가" (Inter 10px, text-muted, tracking 0.02em)
│     │     ├── Card[1] → "마신 와인"
│     │     └── Card[2] → "작성 노트"
│     ├── MapCameo (Pressable → '/map', m=14_16_0, radius=14, overflow hidden, bg=bg-map, border-default)
│     │     ├── Header row (p=12_14_0, baseline-aligned, space-between)
│     │     │     ├── Left column
│     │     │     │     ├── Title "당신의 와인 지도" (Playfair 14px, cream)
│     │     │     │     └── Meta "{N}개국 · {M}개 지역" (Inter 10px, text-muted, mt=2)
│     │     │     └── Action "전체 →" (Inter 10px 600, gold, tracking 0.04em)
│     │     └── MiniMapPreview (SVG, viewBox 320×100, height 100, mt=6)
│     │           ├── 대륙 6개 ellipse (fill=#2D1540, opacity 0.8)
│     │           └── 방문 국가 dot 14개 (strong=#8B1A2A r=3.5 op 0.9 / soft=gold r=2.5 op 0.7)
│     ├── HomeCommunityPeek (section, mt=22)
│     │     ├── SectionTitle (p=0_20_8, end-aligned, space-between)
│     │     │     ├── Left
│     │     │     │     ├── eyebrow "커뮤니티" (Inter 10px 500, gold, tracking 0.18em UPPER)
│     │     │     │     └── title "팔로잉의 새 노트" (Playfair 17px, cream, lh 1.2)
│     │     │     └── action "모두 보기 →" (Pressable → '/community', Inter 11px 600, gold)
│     │     └── Card (m=0_16, p=4_14, radius=14, bg-surface, border-default)
│     │           └── Post Rows × 2 (각 p=10_0, gap=10, last item border-bottom none)
│     │                 ├── CommUserAvatar (28×28 circle, level-based gradient)
│     │                 ├── Content (flex-1, minWidth 0)
│     │                 │     ├── Meta row (gap=6, mb=3, items-center)
│     │                 │     │     ├── PostTypeBadge (10px 600, tracking 0.04em, type color + 10% bg + 33% border)
│     │                 │     │     └── Author "이름 · 3h" (10px, text-muted)
│     │                 │     ├── Title (Playfair 13px, cream, lh 1.3, 2줄 clamp)
│     │                 │     └── Reactions row (mt=6, gap=12, 10px text-muted)
│     │                 │           ├── Wine icon (10px gold) + count
│     │                 │           ├── MessageSquare icon (10px) + count
│     │                 │           └── Wine appellation chip (gold 9px, tracking 0.06em) — optional
│     ├── RecentNotesStrip (section, mt=18) — 아이템 0개면 렌더 안 함
│     │     ├── SectionHeader (p=0_20_8, baseline-aligned, space-between)
│     │     │     ├── eyebrow "최근 노트" (Inter 10px 500, gold, tracking 0.18em UPPER)
│     │     │     └── h2 "최근 마신 와인" (Playfair 17px, cream, tracking -0.01em)
│     │     └── HorizontalScroll (gap=10, p=0_16_4, snap-x mandatory, hide scrollbar)
│     │           └── NoteCard × N (max 8, width 200, flex-shrink 0, p=12, radius=12, bg-surface, border-default, gap=8 column)
│     │                 ├── Row (gap=8, items-center)
│     │                 │     ├── WMBottle (width 26, height 86, SVG)
│     │                 │     └── Meta column (flex-1, minWidth 0)
│     │                 │           ├── Wine name (Playfair 12px, cream, lh 1.25, 2줄 clamp)
│     │                 │           ├── "{vintage} · {dateStr}" (9px text-muted, mt=4)
│     │                 │           └── WMGlassRating (5 glasses, size 8, mt=6)
│     │                 └── Aroma hint (10px text-secondary, lh 1.45, 1줄 truncate) — optional
│     ├── WineFeed (section, mt=24) — PATCH 2026-05-21: bottle 차원/카드 padding 수정 (§3-8-PATCH 참조)
│     │     ├── SectionHeader (p=0_20_8, baseline-aligned, space-between)
│     │     │     ├── h2 "와인 둘러보기" (Playfair 18px, cream)
│     │     │     └── subtitle "카드 탭하면 상세로" (Inter 11px, text-muted)
│     │     ├── TabChips (HorizontalScroll, gap=6, p=0_20_10)
│     │     │     ├── Chip[featured] (Sparkles 13px) — active: border gold + bg rgba(201,168,76,0.12) + text gold | idle: border default + transparent + text-muted
│     │     │     ├── Chip[trending] (Flame 13px)
│     │     │     └── Chip[explore]  (Globe2 13px)
│     │     └── List (column, gap=10, p=0_16)
│     │           └── WineFeedRow × N — Pressable → `/wine/{lwin}`, **HORIZONTAL flex-row**, gap=16, p=16, bg-surface, border-default, radius=14, items=stretch (병/정보/우측 column 모두 카드 높이 따라 정렬)
│     │                 ├── Bottle column (flex-shrink 0, width=96, items-center, justify-center)
│     │                 │     └── WMBottle (width 90, height 150) ← PATCH: 키스크린 40×130 → 90×150. 컴팩트하지만 카드 안에서 시각적으로 명확히 보이는 사이즈. 비율 (W:H ≈ 1:1.67)은 키스크린 viewBox 40:130 (1:3.25)와 다름 — 카드 내 가시성 우선 (사용자 reference image #7).
│     │                 ├── Meta column (flex-1, minWidth 0, column gap=4, justify-center)
│     │                 │     ├── Wine name (Playfair 16px, cream, lh 1.2, 2줄 clamp) ← 키스크린 15 → 16 (가독성 ↑)
│     │                 │     ├── "{producer} · {vintage}" (Inter 12px, text-secondary, 1줄 clamp) ← 키스크린 11 → 12
│     │                 │     ├── Location row (Inter 11px text-muted, gap=4) — MapPin 11px + "{region}, {country}"
│     │                 │     └── Grapes (Inter 11px text-muted, opacity 0.85, 1줄 truncate) — optional, 키스크린 10 → 11
│     │                 └── Right column (flex-shrink 0, minWidth 76, items-end, justify-between) ← 키스크린 verbatim, 단 chevron 제거 (카드 padding 16 + bottle 96 + meta로 폭 압박 시 시각 노이즈)
│     │                       ├── Top group (column items-end gap=4)
│     │                       │     ├── Rating row (flex-row items-center gap=5) — WMGlassRating size=10 + "{score.toFixed(1)}" (Inter 12px 600 gold) ← 키스크린 size 8 → 10, font 11 → 12
│     │                       │     └── Price (Playfair 14px cream, nowrap) — "₩{formatKrwShort}" ← 키스크린 13 → 14
│     │                       └── (deviation) ChevronRight 제거 — 사용자 reference image #7에서 chevron 없음. 우측 컬럼은 rating/price만 노출. RN deviation §8-PATCH 참조.
│     ├── Spacer (height 12, in-flow)
│     └── QuickActions (2-col grid, gap=12, p=0_16, mt=18)
│           └── Card × 4 (Pressable → href, column gap=6, p=14_16, radius=14, bg-surface, border-default, minHeight=86)
│                 ├── Icon (20px, strokeWidth 1.75, gold) — TrendingUp/Globe2/Star/Award
│                 ├── Title (Inter 14px 600, cream)
│                 └── Sub (card-meta — Inter 12px text-muted, lh 1.2)
└── BottomNav (5 tabs)  ← Expo Router (tabs)에서 자동 렌더 — keyscreen position:absolute 대체
```

### 2-2. first-time 모드 — 4개 섹션 (keyscreen line 129~135)

```
SafeAreaView (edges=['top'], flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── AppHeader  ← 동일, single avatar (no LevelChip, levelId=null)
├── ScrollView (flex-1)
│     ├── FirstTimeGreeting (m=8_16_0, radius=20, p=24, gap=14, minHeight=220, justify=center)
│     │     ├── background: LinearGradient 135deg [surface, rgba(139,26,42,0.18)]
│     │     ├── border: 1px border-default
│     │     ├── eyebrow Text "{name}님, 환영합니다" (Inter 13px, text-secondary)
│     │     ├── headline Text "와인 여정을 시작하세요" (Playfair 28px, cream, lh 1.2)
│     │     ├── sub Text "첫 와인을 등록해보세요" (Inter 14px, text-muted)
│     │     └── PrimaryButton (variant=primary, size=lg, block, leadingIcon=Camera 18px, mt=8)
│     │           label "라벨 스캔하기" → onPress router.push('/capture')
│     ├── EmptyStatHero (m=12_16_0, p=20, radius=16, bg-surface, border DASHED border-default, column gap=8 center text-center)
│     │     ├── SVG cluster of 4 ellipses (viewBox 100×60, height 70, opacity 0.15, fill #2D1540)
│     │     ├── title "아직 마신 와인이 없어요" (Playfair 18px, cream)
│     │     └── hint "당신의 와인 지도를 만들어보세요" (Inter 12px, text-muted)
│     ├── SuggestedActions (column, gap=10, p=0_16, mt=16)
│     │     └── Button × 3 (Pressable, p=14_16, radius=12, bg-surface, border-default, row, items-center, justify-between, Inter 14px 500 cream)
│     │           - "둘러보기 — winemine은 어떤 앱인가요?" → toast (intro 메시지)
│     │           - "추천 입문 와인 보기" → toast (TBD 메시지)
│     │           - "와인 경험 모드 바꾸기" → router.push('/settings/experience')
│     │           우측 ChevronRight (18px, strokeWidth 1.75, text-muted)
│     └── WineFeed (heavy와 동일 구조 — featured/trending/explore 탭 모두 노출)
└── BottomNav (5 tabs, 홈 active)
```

> heavy/first-time 분기 후 ScrollView padding-bottom 32 spacer는 동일 (keyscreen line 137 `<div style={{height: 32}}/>`).

---

## 3. NativeWind 매핑표

각 요소의 keyscreen 인라인 style → RN+NW v4 className/style. 토큰은 `src/lib/design-tokens.ts` + `tailwind.config.ts` 기준.

### 3-1. AppHeader

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| `<header>` container | `padding 12px 20px 14px; flex; gap 10; borderBottom 0.5px var(--color-border-default); bg var(--color-bg-deep)` | `<View className="flex-row items-center gap-2.5 border-b border-border-default bg-bg-deep dark:bg-bg-deep px-5" style={{paddingTop: insets.top+12, paddingBottom:14}}>` |
| WMLogoMark SVG | 32×32 viewBox, stroke gold #C9A84C, fill wine-red #8B1A2A | react-native-svg `<Svg width={26} height={26} viewBox="0 0 32 32">` 안에 `<Path stroke={brand.gold} strokeWidth={1.5} ... />` + `<Path fill={brand.wineRed} opacity={0.9} />` |
| Wordmark "wine·mine" | Playfair 18px 500, cream, tracking -0.01em, separator `·` gold | `<Text className="font-playfair text-[18px] text-text-primary dark:text-text-primary" style={{letterSpacing:-0.18, fontWeight:'500'}}>wine<Text style={{color:brand.gold, marginHorizontal:0.5}}>·</Text>mine</Text>` |
| Bell button | 36×36 circle, transparent, text-secondary | `<Pressable className="w-9 h-9 items-center justify-center rounded-full" accessibilityRole="button">` + Svg 20px stroke currentColor (use `dark`/`light` 분기 색은 useColorScheme로 직접) |
| Bell unread dot | `<circle cx=18 cy=6 r=2.5 fill="#8B1A2A">` | 동일 (brand.wineRed 토큰 사용) |
| LevelChip outer | `display inline-flex; gap 8; h 32; padding 0 10 0 4; radius 999; bg var(--color-surface); border 1px var(--color-border-default)` | `<Pressable className="flex-row items-center gap-2 h-8 rounded-full bg-surface dark:bg-surface border border-border-default" style={{paddingLeft:4, paddingRight:10}} accessibilityRole="link">` |
| LevelChip avatar | `width 24 height 24 radius 999; background linear-gradient(135deg, ${color}, ${color}99)` | `<LinearGradient colors={[level[L], level[L]+'99']} start={{x:0,y:0}} end={{x:1,y:1}} style={{width:24,height:24,borderRadius:9999,...center}}>` + `<Text className="font-playfair text-[12px]" style={{fontWeight:'700', color:brand.deepestDark}}>{initial}</Text>` |
| LevelChip "L{n}" | `Inter 11px 600 color tracking 0.04em` | `<Text className="font-inter-semibold text-[11px]" style={{color: level[L], letterSpacing:0.44}}>L{levelId}</Text>` |
| First-time avatar (no level) | `36×36 circle bg wine-red, color cream, Inter 14px 600` | `<Pressable className="w-9 h-9 items-center justify-center rounded-full bg-wine-red" accessibilityRole="link"><Text className="font-inter-semibold text-[14px]" style={{color:brand.cream}}>{initial}</Text></Pressable>` |

### 3-2. PeakGreeting (heavy 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer | `padding: 18px 20px 0` | `<View className="pt-[18px] px-5">` |
| eyebrow | `Inter 10px 500, #C9A84C, tracking 0.18em UPPER, mb=6` | `<Text className="font-inter-medium text-[10px] mb-1.5 uppercase" style={{color:brand.gold, letterSpacing:1.8}}>{t('home.peakGreeting.eyebrow')}</Text>` |
| question container | `position relative; minHeight 56; Playfair 22px; cream; lh 1.25; tracking -0.01em` | `<View style={{minHeight:56, position:'relative'}}>` + `<Animated.View ...>` 안에 `<Text className="font-playfair text-[22px] text-text-primary dark:text-text-primary" style={{lineHeight:27.5, letterSpacing:-0.22}}>...</Text>` |
| wine name inline | `color #C9A84C, fontStyle italic` | `<Text style={{color:brand.gold, fontStyle:'italic'}}>{wineName}</Text>` (Trans/i18next chunks 패턴) |
| fade animation | framer-motion `initial {opacity:0,y:6}`, `animate {opacity:1,y:0}`, `exit {opacity:0,y:-6}`, `duration 0.45`, `ease easeOut` | Reanimated v3 — `useSharedValue(0)`로 opacity/translateY 관리, key 바뀔 때 entering=FadeInDown(6).duration(450) + exiting=FadeOutUp(6).duration(450). 5초 setInterval로 idx++ (cleanup 필수) |

### 3-3. DraftNoteResume (heavy 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| Pressable container | `margin 14px 16px 0; padding 12px 14px; radius 14; bg linear-gradient(135deg, rgba(139,26,42,0.45), var(--color-surface)); border 1px rgba(139,26,42,0.55)` | `<LinearGradient colors={['rgba(139,26,42,0.45)', currentSurface]} start={{x:0,y:0}} end={{x:1,y:1}} style={{margin:14, marginBottom:0, marginHorizontal:16, padding:12, paddingHorizontal:14, borderRadius:14, borderWidth:1, borderColor:'rgba(139,26,42,0.55)'}}>` wrap inside `<Pressable accessibilityRole="link" onPress={...}>` |
| Pen icon circle | 32×32 radius 999, bg-bg-deep, border-default | `<View className="w-8 h-8 items-center justify-center rounded-full bg-bg-deep dark:bg-bg-deep border border-border-default">` |
| Pen icon | SVG 16×16 stroke #C9A84C 1.7 | lucide-react-native `<Pencil size={16} strokeWidth={1.7} color={brand.gold} />` |
| Title | Inter 12px 600 cream lh 1.3 | `<Text className="font-inter-semibold text-[12px] text-text-primary dark:text-text-primary" style={{lineHeight:15.6}}>{t('home.draftResume.title')}</Text>` |
| Subtitle | Inter 11px text-secondary mt 2 ellipsis nowrap | `<Text className="font-inter text-[11px] text-text-secondary dark:text-text-secondary mt-0.5" numberOfLines={1}>{shortName} {vintage} · {t('home.draftResume.progress',{value:90})}</Text>` |
| CTA pill | padding 7_12 radius 999 border 1px gold color gold Inter 11px 600 | `<View className="rounded-full border border-gold" style={{paddingHorizontal:12, paddingVertical:7}}><Text className="font-inter-semibold text-[11px]" style={{color:brand.gold}}>{t('home.draftResume.cta')}</Text></View>` |

### 3-4. StatHero (heavy 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| grid | `display grid; gridTemplateColumns repeat(3,1fr); gap 6; padding 12 16 0` | `<View className="flex-row gap-1.5 pt-3 px-4">` (각 카드 `flex-1`로 3등분) |
| card | `padding 8 10; radius 12; bg-surface; border 1px border-default; flexCol gap 1` | `<View className="flex-1 rounded-xl bg-surface dark:bg-surface border border-border-default py-2 px-2.5" style={{gap:1}}>` |
| value | Playfair 20px cream lh 1.1 tracking -0.02em | `<Text className="font-playfair text-[20px] text-text-primary dark:text-text-primary" style={{lineHeight:22, letterSpacing:-0.4}}>{value}</Text>` |
| label | Inter 10px text-muted tracking 0.02em | `<Text className="font-inter text-[10px] text-text-muted dark:text-text-muted" style={{letterSpacing:0.2}}>{t(label)}</Text>` |

### 3-5. MapCameo (heavy 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer Link | `margin 14 16 0; radius 14; overflow hidden; bg var(--color-bg-map); border 1px border-default` | `<Pressable className="mx-4 mt-3.5 overflow-hidden rounded-[14px] border border-border-default bg-bg-map dark:bg-bg-map" onPress={()=>router.push('/(tabs)/map')} accessibilityRole="link">` |
| header row | `padding 12 14 0; flex items-baseline justify-between` | `<View className="flex-row items-baseline justify-between pt-3 px-3.5">` |
| title | Playfair 14px cream | `<Text className="font-playfair text-[14px] text-text-primary dark:text-text-primary">{t('home.mapCameo.title')}</Text>` |
| meta | Inter 10px text-muted mt 2 | `<Text className="font-inter text-[10px] text-text-muted dark:text-text-muted mt-0.5">{t('home.countriesRegions',{countries,regions})}</Text>` |
| action `전체 →` | Inter 10px 600 gold tracking 0.04em | `<Text className="font-inter-semibold text-[10px]" style={{color:brand.gold, letterSpacing:0.4}}>{t('home.mapCameo.viewAll')}</Text>` |
| MiniMapPreview | `<svg viewBox="0 0 320 100" width="100%" height={100}>` + 6 대륙 ellipse + 14 dot | react-native-svg `<Svg viewBox="0 0 320 100" width="100%" height={100} style={{marginTop:6}}>` + `<G fill="#2D1540" opacity={0.8}>` 6 `<Ellipse>` + 14 `<Circle cx={x} cy={y} r={r} fill={strong?brand.wineRed:brand.gold} opacity={strong?0.9:0.7}/>` |

> **#2D1540 (대륙 silhouette)** — design-tokens.ts에 토큰 없음. 의도적 dark map tint. **§9 토큰 확장 요청**.

### 3-6. HomeCommunityPeek (heavy 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| section | `marginTop 22` | `<View className="mt-[22px]">` |
| SectionTitle wrapper | `padding 0 20 8; flex items-end justify-between gap 12` | `<View className="flex-row items-end justify-between gap-3 pb-2 px-5">` |
| eyebrow | Inter 10px 500 gold tracking 0.18em UPPER mb 2 | `<Text className="font-inter-medium text-[10px] mb-0.5 uppercase" style={{color:brand.gold, letterSpacing:1.8}}>{t('home.communityPeek.eyebrow')}</Text>` |
| title | Playfair 17px cream lh 1.2 | `<Text className="font-playfair text-[17px] text-text-primary dark:text-text-primary" style={{lineHeight:20.4}}>{t('home.communityPeek.title')}</Text>` |
| action `모두 보기 →` | Pressable, Inter 11px 600 gold | `<Pressable onPress={()=>router.push('/(tabs)/community')} accessibilityRole="link"><Text className="font-inter-semibold text-[11px]" style={{color:brand.gold}}>{t('home.communityPeek.viewAll')}</Text></Pressable>` |
| card outer | `margin 0 16; padding 4 14; radius 14; bg-surface; border 1px border-default` | `<View className="mx-4 rounded-[14px] bg-surface dark:bg-surface border border-border-default py-1 px-3.5">` |
| post row | `padding 10 0; flex gap 10; borderBottom 0.5px (마지막 제외)` | `<Pressable className="flex-row gap-2.5 py-2.5" style={i<last?{borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:currentBorderDefault}:undefined} accessibilityRole="link">` |
| CommUserAvatar | 28×28 radius full, level color gradient (5종) | LinearGradient 135deg (level별 색 spec §3-8) — 28×28 circle |
| PostTypeBadge | inline-flex, Inter 10px 600, tracking 0.04em, bg=`color+'1a'`, border=`color+'55'`, padding 2_6, radius 4 | `<View style={{backgroundColor:typeColor+'1a', borderColor:typeColor+'55', borderWidth:1, paddingHorizontal:6, paddingVertical:2, borderRadius:4}}><Text className="font-inter-semibold text-[10px]" style={{color:typeColor, letterSpacing:0.4}}>{label}</Text></View>` |
| author/ago | 10px text-muted | `<Text className="text-[10px] text-text-muted dark:text-text-muted">{user.name} · {post.ago}</Text>` |
| post title | Playfair 13px cream lh 1.3 2줄 clamp | `<Text className="font-playfair text-[13px] text-text-primary dark:text-text-primary" style={{lineHeight:16.9}} numberOfLines={2}>{post.title}</Text>` |
| reactions row | mt 6 gap 12 10px text-muted | `<View className="flex-row gap-3 mt-1.5 items-center">` + Wine/MessageSquare lucide 10px |
| appellation chip | 9px gold tracking 0.06em | `<Text className="text-[9px]" style={{color:brand.gold, letterSpacing:0.54}}>· {wineLabel}</Text>` |

### 3-7. RecentNotesStrip (heavy 전용, 노트 0개 시 미렌더)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| section | mt 18 | `<View className="mt-[18px]">` |
| header | padding 0 20 8 flex baseline space-between | `<View className="flex-row items-baseline justify-between pb-2 px-5">` |
| eyebrow + h2 | 위 community와 동일 패턴 | (위 §3-6 참조) |
| scroll | `flex; gap 10; overflowX auto; padding 0 16 4; scrollbarWidth none; scrollSnapType x mandatory; -webkit-overflow-scrolling touch` | `<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:16, paddingBottom:4, gap:10}} snapToInterval={210} decelerationRate="fast">` |
| card | `width 200; flex-shrink 0; padding 12; radius 12; bg-surface; border-default; column gap 8` | `<Pressable className="rounded-xl bg-surface dark:bg-surface border border-border-default p-3" style={{width:200, gap:8}} onPress={()=>router.push(`/wine/${wine.lwin}`)}>` |
| row inner | flex items-center gap 8 | `<View className="flex-row items-center gap-2">` |
| WMBottle | width 26 height 86 (SVG composite) | `<WMBottle width={26} height={86} bottleColor={...} producer={...} label={...} vintage={...}/>` — react-native-svg port. **포팅 필요 — §9 컴포넌트 확장 요청** |
| wine name | Playfair 12px cream lh 1.25 2줄 clamp | `<Text className="font-playfair text-[12px] text-text-primary dark:text-text-primary" style={{lineHeight:15}} numberOfLines={2}>{wine.name}</Text>` |
| date row | 9px text-muted mt 4 | `<Text className="text-[9px] text-text-muted dark:text-text-muted mt-1">{vintage} · {dateStr}</Text>` |
| WMGlassRating size=8 | 5 와인잔 SVG | react-native-svg port — **§9** |
| aroma hint | 10px text-secondary lh 1.45 1줄 truncate | `<Text className="text-[10px] text-text-secondary dark:text-text-secondary" style={{lineHeight:14.5}} numberOfLines={1}>{aromas.slice(0,3).join(' · ')}</Text>` |

### 3-8. WineFeed (heavy + first-time 공용)

> **PATCH 2026-05-21** — 사용자 reference image #6 (현재 RN), image #7 (정확한 reference) 비교 후 카드 padding/gap/bottle 사이즈/typography 위계 갱신.
> 변경 요지: WineFeedRow의 horizontal layout 자체는 keyscreen verbatim 유지. **bottle 차원(40×130 → 90×150)**, **카드 padding (12 → 16)**, **gap (12 → 16)**, **radius (12 → 14)**, **typography 1pt씩 ↑** (가독성), **right column chevron 제거**. 토큰은 design-tokens.ts.radius['14'](기존), typography.homeWineFeedRowName(기존, 15→16으로 size만 인라인 override) 재사용.

| 요소 | keyscreen | RN+NW v4 (PATCH) |
|---|---|---|
| section | mt 24 | `<View className="mt-6">` (변경 없음) |
| header | padding 0 20 8 flex baseline space-between | (위 패턴 동일, 변경 없음) |
| h2 | Playfair 18px cream | `<Text className="font-playfair text-[18px] text-text-primary dark:text-text-primary">{t('home.wineFeed.heading')}</Text>` (변경 없음) |
| subtitle | Inter 11px text-muted | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted">{t('home.wineFeed.subtitle')}</Text>` (변경 없음) |
| tab row | `display flex; gap 6; padding 0 20 10; overflowX auto` | `<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:20, paddingBottom:10, gap:6}}>` (변경 없음) |
| chip | `padding 5 11 5 9; radius 14; border 1px (active gold else border-default); bg (active rgba(201,168,76,0.12) else transparent); Inter 11px 600 (active gold else text-muted); inline-flex gap 5` | (변경 없음 — 위 §3-8 원본 매핑 유지) |
| **list** | column gap 8 p 0 16 | `<View className="px-4" style={{gap:10}}>` ← **PATCH: gap 8 → 10** (카드 간 호흡) |
| **row outer** | flex gap 12 p 12 bg-surface border-default radius 12 items-center | `<Pressable className="flex-row rounded-[14px] bg-surface dark:bg-surface border border-border-default" style={({pressed})=>({padding:16, gap:16, alignItems:'stretch', opacity:pressed?0.9:1, transform:[{scale: pressed?0.99:1}]})} onPress={()=>{Haptics.selectionAsync().catch(()=>undefined); router.push(`/wine/${wine.lwin}`)}} accessibilityRole="link" accessibilityLabel={...}>` ← **PATCH: items-center → items-stretch (병/우측 column 카드 높이 따라 늘어남), gap 12 → 16, padding 12 → 16, radius 12 → 14** |
| **bottle column** | 없음 (병이 row의 직접 flex item) | `<View style={{width:96, flexShrink:0, alignItems:'center', justifyContent:'center'}}>` ← **PATCH: bottle 전용 컬럼 신설 — width 96, 병이 컬럼 안에서 center 정렬** |
| **WMBottle** | width 40 height 130 | `<WMBottle width={90} height={150} bottleColor={bottleColor} type={wine.type} />` ← **PATCH: 40×130 → 90×150**. WMBottle viewBox는 40×130 고정(`/Users/yejinkim/dev/winemine-app/src/components/shared/wm-bottle.tsx` line 43-44) → preserveAspectRatio="xMidYMid meet"가 90×150 박스 안에서 41×130 비율 유지하며 자동 fit. **WMBottle 코드 수정 불필요**. |
| **meta col** | flex-1 minWidth 0 column gap 3 | `<View style={{flex:1, minWidth:0, gap:4, justifyContent:'center'}}>` ← **PATCH: gap 3 → 4, justify-center (병/우측 column 높이 늘어남에 따라 텍스트 vertical center)** |
| **wine name** | Playfair 15px cream lh 1.2 1줄 clamp | `<Text className="font-playfair text-text-primary dark:text-text-primary" style={{fontSize:16, lineHeight:19.2}} numberOfLines={2}>{wine.name}</Text>` ← **PATCH: 15 → 16 (lh 18 → 19.2 = 1.2 비율 유지), 1줄 clamp → 2줄 clamp (긴 와인명 보호)** |
| **producer line** | Inter 11px text-secondary 1줄 clamp | `<Text className="font-inter text-text-secondary dark:text-text-secondary" style={{fontSize:12, lineHeight:14.4}} numberOfLines={1}>{wine.producer} · {wine.vintage}</Text>` ← **PATCH: 11 → 12 (lh 1.2)** |
| **location row** | Inter 11px text-muted gap 4 MapPin 10px | `<View className="flex-row items-center gap-1"><MapPin size={11} strokeWidth={1.75} color={tokens.text.muted}/><Text className="font-inter text-text-muted dark:text-text-muted" style={{fontSize:11, lineHeight:13.2}} numberOfLines={1}>{wine.region}, {wine.country}</Text></View>` ← **PATCH: MapPin 10 → 11 (와인명/producer와 시각 균형)** |
| **grapes** | Inter 10px text-muted opacity 0.85 mt 1 1줄 truncate | `<Text className="font-inter text-text-muted dark:text-text-muted" style={{fontSize:11, lineHeight:13.2, opacity:0.85}} numberOfLines={1}>{wine.grapes}</Text>` ← **PATCH: 10 → 11 (a11y 마이크로 텍스트 회피 + 시각 위계 살림)** |
| **right col** | column items-end justify-between flex-shrink 0 minWidth 70 | `<View style={{flexShrink:0, minWidth:76, alignItems:'flex-end', justifyContent:'center', gap:6}}>` ← **PATCH: minWidth 70 → 76, justify-between (chevron 있을 때) → justify-center (chevron 제거됨), gap=6 (rating ↔ price)** |
| **rating row** | inline-flex items-center gap 4 — WMGlassRating size=8 + Inter 11 600 gold score | `<View className="flex-row items-center" style={{gap:5}}><WMGlassRating value={wine.score} size={10}/><Text className="font-inter-semibold" style={{color:brand.gold, fontSize:12, lineHeight:14.4}}>{wine.score.toFixed(1)}</Text></View>` ← **PATCH: WMGlassRating size 8 → 10, score font 11 → 12, gap 4 → 5** |
| **price** | Playfair 13px cream nowrap | `<Text className="font-playfair text-text-primary dark:text-text-primary" style={{fontSize:14, lineHeight:16.8}} numberOfLines={1}>₩{formatKrwShort(krw, locale)}</Text>` ← **PATCH: 13 → 14 (lh 1.2)** |
| **chevron** | 16px text-muted | **PATCH: 제거** — 사용자 reference image #7 명시. RN deviation 사유 §8-PATCH 참조. |

### 3-9. QuickActions (heavy 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| grid | `display grid; gridTemplateColumns 1fr 1fr; gap 12; padding 0 16; mt 18` | `<View className="flex-row flex-wrap px-4 mt-[18px]" style={{gap:12}}>` — 각 카드 `style={{flexBasis:'48%'}}`로 2-col (gap 12 고려) **또는** 4 카드를 2×2로 2개 row로 split |
| card | `flex col gap 6; padding 14 16; radius 14; bg-surface; border-default; minHeight 86` | `<Pressable className="rounded-[14px] bg-surface dark:bg-surface border border-border-default px-4 py-3.5" style={{minHeight:86, gap:6, flexGrow:1, flexBasis:'48%'}} onPress={...}>` |
| icon | 20px strokeWidth 1.75 gold | `<TrendingUp size={20} strokeWidth={1.75} color={brand.gold}/>` (Globe2/Star/Award 4종) |
| title | Inter 14px 600 cream | `<Text className="font-inter-semibold text-[14px] text-text-primary dark:text-text-primary">{title}</Text>` |
| sub | `.wm-card-meta` = Inter 12px text-muted lh 1.2 | `<Text className="font-inter text-card-meta text-text-muted dark:text-text-muted">{sub}</Text>` |

### 3-10. FirstTimeGreeting (first-time 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer | `margin 8 16 0; radius 20; padding 24; bg linear-gradient(135deg, surface 0%, rgba(139,26,42,0.18) 100%); border 1px border-default; flex col gap 14; minHeight 220; justify-center` | `<LinearGradient colors={[currentSurface, 'rgba(139,26,42,0.18)']} start={{x:0,y:0}} end={{x:1,y:1}} style={{marginHorizontal:16, marginTop:8, borderRadius:20, padding:24, gap:14, minHeight:220, justifyContent:'center', borderWidth:1, borderColor:currentBorderDefault}}>` |
| eyebrow `{name}님, 환영합니다` | Inter 13px text-secondary | `<Text className="font-inter text-[13px] text-text-secondary dark:text-text-secondary">{t('home.greetingNew',{name})}</Text>` |
| headline `와인 여정을 시작하세요` | Playfair 28px cream lh 1.2 | `<Text className="font-playfair text-[28px] text-text-primary dark:text-text-primary" style={{lineHeight:33.6}}>{t('home.firstTime.greeting')}</Text>` |
| sub | Inter 14px text-muted | `<Text className="font-inter text-[14px] text-text-muted dark:text-text-muted">{t('home.firstTime.sub')}</Text>` |
| CTA | PrimaryButton variant=primary size=lg block, leadingIcon Camera 18px, mt 8 | `<View className="mt-2"><PrimaryButton label={t('home.firstTime.scanCta')} size="lg" block leadingIcon={<Camera size={18} strokeWidth={1.75} color={brand.cream}/>} onPress={()=>router.push('/(tabs)/capture')}/></View>` |

> 현재 `src/components/home/first-time-home.tsx`는 `flex-1 items-center justify-center` 풀스크린 layout — **keyscreen과 다름**. keyscreen은 화면 상단 카드 형태 (height 220, 다른 섹션이 아래에 흐름). retroactive 수정 §11에 명시.

### 3-11. EmptyStatHero (first-time 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer | `margin 12 16 0; padding 20; radius 16; bg-surface; border 1px DASHED border-default; flex col gap 8 items-center text-center` | `<View className="mx-4 mt-3 rounded-2xl bg-surface dark:bg-surface items-center" style={{padding:20, gap:8, borderWidth:1, borderStyle:'dashed', borderColor:currentBorderDefault}}>` |
| SVG cluster | viewBox 100×60 height 70 opacity 0.15, 4개 ellipse fill #2D1540 | react-native-svg `<Svg viewBox="0 0 100 60" width="100%" height={70} preserveAspectRatio="xMidYMid meet" opacity={0.15}>` + 4 `<Ellipse>` |
| title | Playfair 18px cream | `<Text className="font-playfair text-[18px] text-text-primary dark:text-text-primary">{t('home.firstTime.emptyMap')}</Text>` |
| hint | Inter 12px text-muted | `<Text className="font-inter text-[12px] text-text-muted dark:text-text-muted text-center">{t('home.firstTime.emptyMapHint')}</Text>` |

### 3-12. SuggestedActions (first-time 전용)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| section | column gap 10 p 0 16 mt 16 | `<View className="px-4 mt-4" style={{gap:10}}>` |
| button | `padding 14 16; radius 12; bg-surface; border-default; flex items-center justify-between; Inter 14px 500 cream` | `<Pressable className="flex-row items-center justify-between rounded-xl bg-surface dark:bg-surface border border-border-default" style={{padding:14, paddingHorizontal:16}} onPress={a.onPress}>` + `<Text className="font-inter-medium text-[14px] text-text-primary dark:text-text-primary">{a.label}</Text>` + `<ChevronRight size={18} strokeWidth={1.75} color={currentTextMuted}/>` |

### 3-13. BottomNav (전역)

Expo Router `(tabs)/_layout.tsx`가 자동 렌더. 단, FAB 중앙 카메라 버튼은 keyscreen 특수 — RN tabs API로는 표현 어려움. **§8 deviation 참조**.

---

## 4. 상태 Variants

### default (heavy + dark + ko)
- AppHeader: logo + bell (no dot) + LevelChip(L4 gold)
- PeakGreeting: 5초마다 question 로테이션, 첫 메시지 idx=0 "{name}님, 어젯밤 <wine></wine>의 정점은 어땠나요?"
- DraftNoteResume: bgy-puligny-montrachet 와인 + 90% (현재 mock — Phase 3에서 실 데이터로)
- StatHero 3 카드: countriesExplored / winesTasted / notesCount (profile.stats 기반)
- MapCameo: countries N · regions M 텍스트 + SVG dots
- HomeCommunityPeek: 2 posts (mock)
- RecentNotesStrip: 최근 8개 노트 (tastedAt desc)
- WineFeed: featured 탭 default
- QuickActions: 4 카드 (cellar / map / favorites / badges)

### default (first-time + dark + ko)
- AppHeader: logo + bell + avatar wine-red bg (no LevelChip)
- FirstTimeGreeting: hero card with greeting + sub + CTA
- EmptyStatHero: dashed border card with placeholder svg
- SuggestedActions: 3 rows
- WineFeed: featured 탭 default

### loading
- profile/notes/cellar 로딩 중에 keyscreen은 mock data 즉시 노출 (no skeleton). RN은 supabase 호출 비동기 — **skeleton 필요**:
  - AppHeader: 그대로 (display name fallback)
  - StatHero: 3 카드 각각 height 56 SkeletonBlock (color: surface + opacity 0.5)
  - DraftNoteResume: 1개 SkeletonBlock (radius 14, height 56, margin 14_16_0)
  - HomeCommunityPeek: 2개 row skeleton (28px circle + 2줄 line)
  - RecentNotesStrip: 가로 스크롤 3개 카드 skeleton (200×height ~140)
  - WineFeed: 5개 row skeleton (height 142)
  - QuickActions: 4 카드 skeleton (height 86)
- 로딩 중에도 BottomNav 표시 (Expo Router)
- 인디케이터 색: `brand.gold` (ActivityIndicator는 RefreshControl tintColor에만 사용)

### empty (heavy mode + 노트 0개)
- RecentNotesStrip: **렌더 안 함** (keyscreen line 21: `if (items.length === 0) return null`)
- StatHero notesCount: 0 그대로 표시 (카드는 유지)
- WineFeed: featured는 고정 큐레이션이라 항상 비어있지 않음 — empty 분기 불필요
- HomeCommunityPeek: 2 posts mock — Phase 3에서 실 데이터로 전환 시 EmptyState 필요. **v0.1.0 mock 유지**.

### empty (first-time + 진입 직후)
- EmptyStatHero가 이미 empty 상태를 표현 (dashed border + placeholder svg)
- SuggestedActions, WineFeed는 동일 렌더

### error
- supabase fetch 실패 시: Toast (variant=error, message=`errors.generic`) + 화면 자체는 last-good-state 또는 기본 fallback
- 네트워크 끊김: `errors.network` Toast
- profile.mode를 못 가져오면 default `'first-time'` fallback (현재 RN 코드 line 40 동일 처리 — 유지)

### dark mode (theme=dark)
- bg-bg-deepest: `#251837`
- bg-bg-deep: `#2E1F3F` (AppHeader)
- surface: `#3D2A4A` (모든 카드)
- text-primary: `#F8F4ED` / text-secondary: `#EBE0CB` / text-muted: `#CABDA8`
- border-default: `#5A3D6A`
- gold: `#C9A84C` (brand 고정)
- wine-red: `#8B1A2A` (brand 고정)
- 지도 dot color #2D1540 (대륙) — dark only (light에서는 다른 톤 검토 필요 — **§9 deviation**)

### light mode (theme=light)
- bg-bg-deepest: `#FAF5EC` (크림 종이)
- bg-bg-deep: `#F2EAD9` (AppHeader)
- surface: `#FFFFFF`
- text-primary: `#2A1A14` / text-secondary: `#5A463C` / text-muted: `#8B7766`
- border-default: `#E0D2BC`
- DraftNoteResume gradient: `[rgba(139,26,42,0.45), '#FFFFFF']` (surface가 light에서 #FFFFFF)
- FirstTimeGreeting gradient: `['#FFFFFF', 'rgba(139,26,42,0.18)']`
- MiniMapPreview 대륙 fill #2D1540은 light 배경에선 너무 어둡고 진함 — keyscreen은 라이트 검증된 화면이지만 dot/대륙 색은 dark 의도 — **light에서도 verbatim 유지하되 §9 가독성 검토 요청**
- gold(#C9A84C), wine-red(#8B1A2A), cream(#F5F0E8)은 양 모드 동일

### ko / en
- 모든 텍스트 i18n key 사용 (§7 참조)
- ko는 한글 word-break:keep-all 효과 — RN은 `<Text>` 기본 wrap이 어절 단위 아님. RN 한글은 문자 단위 wrap. **§8 deviation 참조** — minor 가독성 차이.
- en은 letter-spacing 0.04em UPPER 레이블 유지, 한글은 letter-spacing > 0.02em 금지 (디자인 시스템 §6) — RN에서 ko 모드 시 `letterSpacing: 0` 강제, en 모드 시만 적용. **§9 헬퍼 함수 요청**.

---

## 5. 인터랙션

| 위치 | 트리거 | 결과 |
|---|---|---|
| AppHeader logo | onPress | 이미 `/`에 있으므로 no-op (또는 scroll-to-top) — keyscreen은 `<Link href="/">` 그대로. RN은 `if (router.canGoBack()) noop; else scrollViewRef.scrollTo({y:0})` |
| AppHeader Bell | onPress | `Haptics.selectionAsync()` → `router.push('/notifications')` |
| AppHeader LevelChip / Avatar | onPress | `Haptics.selectionAsync()` → `router.push('/profile')` |
| PeakGreeting (no press) | 5초 setInterval | `setIdx((i)=>(i+1)%cycleLength)` — cleanup on unmount + 화면 blur 시 pause (성능) |
| DraftNoteResume | onPress | `Haptics.selectionAsync()` → `router.push('/notes/new/write?wineId={DRAFT_WINE_ID}')` |
| StatHero (no press) | — | — |
| MapCameo | onPress | `Haptics.selectionAsync()` → `router.push('/(tabs)/map')` |
| HomeCommunityPeek 카드 row | onPress | `router.push(`/community/${post.id}`)` |
| HomeCommunityPeek 모두보기 | onPress | `router.push('/(tabs)/community')` |
| RecentNotesStrip 카드 | onPress | `Haptics.selectionAsync()` → `router.push(`/wine/${wine.lwin}`)` |
| WineFeed 탭 chip | onPress | `Haptics.selectionAsync()` → `setTab(opt.key)` (즉시 list 재계산) |
| WineFeedRow | onPress | `Haptics.selectionAsync()` → `router.push(`/wine/${wine.lwin}`)` |
| QuickActions 카드 | onPress | `Haptics.selectionAsync()` → `router.push(href)` |
| FirstTimeGreeting CTA | onPress | `Haptics.selectionAsync()` → `router.push('/(tabs)/capture')` |
| SuggestedActions row 1 | onPress | Toast `'winemine은 와인 라벨을 찍어 지도로 모으는 앱이에요'` (i18n) |
| SuggestedActions row 2 | onPress | Toast `'추천 입문 와인 모달은 추후 연결'` (i18n) |
| SuggestedActions row 3 | onPress | `router.push('/settings/experience')` |
| ScrollView | 풀-투-리프레시 | `RefreshControl` — profile/notes/cellar 모두 refetch (현재 RN 동작 유지) |
| ScrollView | 가로 스크롤 (recent notes, wine feed tabs) | 가로 momentum + snap (recent notes만) |
| pressed state | 모든 Pressable | `{({pressed})=>({opacity: pressed?0.85:1, transform:[{scale: pressed?0.98:1}]})}` — keyscreen은 hover/active CSS 없음. RN press feedback은 표준. **§8 deviation** |
| 첫 마운트 시 first-time + !onboardingComplete | useEffect | `router.replace('/onboarding')` — keyscreen line 35-42 동일 |

### Reanimated PeakGreeting 의사 코드

```tsx
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

function PeakGreeting({ name, wines }: { name: string; wines: string[] }) {
  const [idx, setIdx] = useState(0);
  const cycleLength = Math.max(4, wines.length);
  useEffect(() => {
    if (wines.length === 0) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % cycleLength), 5000);
    return () => clearInterval(id);
  }, [wines.length, cycleLength]);

  const wineName = wines.length > 0 ? wines[idx % wines.length] : null;
  const questionKey = `home.peakGreeting.questions.${idx % 4}`;

  return (
    <View className="pt-[18px] px-5">
      <Text className="font-inter-medium text-[10px] uppercase mb-1.5" style={{ color: brand.gold, letterSpacing: 1.8 }}>
        {t('home.peakGreeting.eyebrow')}
      </Text>
      <View style={{ minHeight: 56, position: 'relative' }}>
        <Animated.View
          key={idx}
          entering={FadeInDown.duration(450).springify().damping(18)}
          exiting={FadeOutUp.duration(450)}
        >
          {wineName ? (
            <Trans i18nKey={questionKey} values={{ name }} components={{ wine: <Text style={{ color: brand.gold, fontStyle: 'italic' }}>{wineName}</Text> }}>
              <Text className="font-playfair text-[22px] text-text-primary dark:text-text-primary" style={{ lineHeight: 27.5, letterSpacing: -0.22 }} />
            </Trans>
          ) : (
            <Text className="font-playfair text-[22px] text-text-primary dark:text-text-primary" style={{ lineHeight: 27.5 }}>
              {t('home.peakGreeting.fallback', { name })}
            </Text>
          )}
        </Animated.View>
      </View>
    </View>
  );
}
```

---

## 6. 접근성

| 요소 | 속성 |
|---|---|
| AppHeader logo | `accessibilityRole="link"`, `accessibilityLabel={ko?'홈으로':'Home'}` |
| Bell | `accessibilityRole="button"`, `accessibilityLabel={t('nav.notifications')}`, unread 시 `accessibilityHint={ko?'읽지 않은 알림 있음':'unread notifications'}` |
| LevelChip | `accessibilityRole="link"`, `accessibilityLabel={`Level ${levelId} · Profile`}` (keyscreen 그대로) |
| First-time avatar | `accessibilityRole="link"`, `accessibilityLabel={t('settings.account')}` |
| PeakGreeting question | `accessibilityRole="text"`, `accessibilityLiveRegion="polite"` (5초마다 변경 — VoiceOver가 매번 읽지 않도록 polite + Android `accessibilityLiveRegion`) |
| DraftNoteResume | `accessibilityRole="link"`, `accessibilityLabel={`${t('home.draftResume.title')} ${shortName} ${vintage}`}`, `accessibilityHint={t('home.draftResume.cta')}` |
| StatHero 카드 | non-interactive `accessibilityRole="text"`, label `{value} {labelText}` (예: "3 방문 국가") — 합쳐서 한 번에 읽음 |
| MapCameo | `accessibilityRole="link"`, `accessibilityLabel={`${t('home.mapCameo.title')} ${t('home.countriesRegions',{countries,regions})}`}` |
| HomeCommunityPeek 카드 | `accessibilityRole="link"`, `accessibilityLabel={`${user.name} ${post.title}`}`, `accessibilityHint={t('home.communityPeek.viewAll')}` |
| RecentNotesStrip 카드 | `accessibilityRole="link"`, `accessibilityLabel={`${wine.name_ko ?? wine.display_name} ${vintage} ${rating}점`}` |
| WineFeed tab chip | `accessibilityRole="tab"`, `accessibilityState={{selected}}`, `accessibilityLabel={t(`home.wineFeed.tabs.${key}`)}` |
| WineFeedRow | `accessibilityRole="link"`, `accessibilityLabel={`${wine.name_ko ?? wine.display_name} ${producer} ${vintage}`}` |
| QuickActions 카드 | `accessibilityRole="link"`, `accessibilityLabel={`${title} ${sub}`}` |
| SuggestedActions row | `accessibilityRole="button"` (toast 트리거) 또는 `"link"` (router.push), `accessibilityLabel={a.label}` |
| ScrollView | RefreshControl 자체에 `accessibilityLabel={t('common.refresh')}` — i18n key 추가 필요 |
| 텍스트 대비 (WCAG AA) | dark: surface(#3D2A4A) 위 text-primary(#F8F4ED) = 10.6:1 ✓ / text-muted(#CABDA8) = 6.8:1 ✓ / gold(#C9A84C) = 4.9:1 ✓ |
| 텍스트 대비 (라이트) | bg-deepest(#FAF5EC) 위 text-primary(#2A1A14) = 13.2:1 ✓ / text-muted(#8B7766) = 4.6:1 ✓ |
| 9px·10px micro text | RN 최소 폰트 11px 권장 (Apple/Google) — keyscreen에 의도적 9px/10px 사용 (date, eyebrow). **검토 필요 — 키스크린 verbatim 유지하되 §9 design-reviewer 확인 요청** |
| dynamic type | `allowFontScaling={false}` 적용 위치: keyscreen 9px/10px 메타 (date, eyebrow) — 크게 키우면 레이아웃 깨짐. 본문(13px 이상)은 `allowFontScaling` 기본 허용 |

---

## 7. i18n 키 매핑

기존 RN 키 (`src/lib/i18n/{ko,en}.json` line 86~103) — `home.anonymousFallback`, `home.firstTime.*`, `home.heavy.*` — **현재 구조는 keyscreen과 다름**. retroactive로 keyscreen 네임스페이스에 맞춰 확장 필요.

### 신규 i18n 키 (keyscreen messages line 54~113 verbatim 이식 + 우리 화면 보완)

```jsonc
// src/lib/i18n/ko.json — home 네임스페이스 확장
"home": {
  "anonymousFallback": "익명 사용자",                    // 기존 유지
  "greeting": "안녕하세요, {{name}}님",
  "greetingNew": "{{name}}님, 환영합니다",
  "bottles": "{{count}}병",
  "countriesRegions": "{{countries}}개국 · {{regions}}개 지역",
  "notifications": "알림",
  "recentTasted": "최근 마신 와인",
  "statCountries": "방문 국가",
  "statWines": "마신 와인",
  "statNotes": "작성 노트",
  "mapCameo": {                                          // 신규 — keyscreen 인라인 텍스트를 키화
    "title": "당신의 와인 지도",
    "viewAll": "전체 →"
  },
  "peakGreeting": {
    "eyebrow": "오늘의 셀러",
    "questions": {
      "0": "{{name}}님, 어젯밤 <wine></wine>의 정점은 어땠나요?",
      "1": "{{name}}님, <wine></wine>의 향이 아직 남아 있나요?",
      "2": "{{name}}님, <wine></wine>의 첫 한 모금을 기억하시나요?",
      "3": "{{name}}님, <wine></wine>은 어떤 시간과 함께였나요?"
    },
    "fallback": "{{name}}님, 오늘은 어떤 와인을 여실 건가요?"
  },
  "draftResume": {
    "title": "작성 중인 노트",
    "progress": "{{value}}%",
    "cta": "이어 쓰기"
  },
  "communityPeek": {
    "eyebrow": "커뮤니티",
    "title": "팔로잉의 새 노트",
    "viewAll": "모두 보기 →"
  },
  "quickActions": {
    "cellar": "셀러",
    "cellarSub": "{{count}}병 보관 중",
    "map": "지도",
    "mapSub": "{{count}}개 지역",
    "favorites": "즐겨찾기",
    "favoritesSub": "{{count}}개",
    "badges": "뱃지",
    "badgesSub": "{{owned}}/{{total}}"
  },
  "wineFeed": {
    "heading": "와인 둘러보기",
    "subtitle": "카드 탭하면 상세로",
    "tabs": {
      "featured": "추천",
      "trending": "트렌딩",
      "explore": "탐험"
    }
  },
  "firstTime": {                                          // 기존 4개 키는 유지, 5개 추가
    "greeting": "와인 여정을 시작하세요",                 // ← 변경 (기존: "환영합니다, {{name}}")
    "title": "첫 와인을 기록해보세요",                    // 기존 유지 — 현재 화면 미사용, retroactive 후 삭제 가능
    "description": "라벨을 촬영하면 시음 노트가 시작됩니다", // 기존 유지 — 삭제 가능
    "cta": "라벨 촬영하기",                               // 기존 유지 → keyscreen은 scanCta
    "sub": "첫 와인을 등록해보세요",                       // 신규
    "scanCta": "라벨 스캔하기",                           // 신규
    "emptyMap": "아직 마신 와인이 없어요",                 // 신규
    "emptyMapHint": "당신의 와인 지도를 만들어보세요",     // 신규
    "suggestTour": "둘러보기 — winemine은 어떤 앱인가요?", // 신규
    "suggestStarter": "추천 입문 와인 보기",              // 신규
    "suggestExperience": "와인 경험 모드 바꾸기"          // 신규
  },
  "suggestedToast": {                                     // 신규 — keyscreen은 hard-coded inline {ko, en}, 우리는 키화
    "tour": "winemine은 와인 라벨을 찍어 지도로 모으는 앱이에요",
    "starter": "추천 입문 와인 모달은 추후 연결"
  },
  "heavy": {                                              // 기존 유지 — 현재 화면이 keyscreen heavy 변형으로 대체되면 일부 키 미사용
    "greeting": "다시 오셨네요, {{name}}",
    "recentNotes": "최근 노트",
    "recentNotesEmpty": "아직 노트가 없습니다",
    "cellarSummary": "셀러",
    "cellaredCount": "보관 중 {{count}}",
    "viewAll": "전체 보기",
    "recommended": "추천 와인",
    "recommendedPlaceholder": "곧 만나보실 수 있습니다"
  }
}

// 추가 — common 네임스페이스
"common": {
  "refresh": "새로고침"
}
```

```jsonc
// src/lib/i18n/en.json — 대응
"home": {
  "anonymousFallback": "Guest",
  "greeting": "Welcome back, {{name}}",
  "greetingNew": "Hello, {{name}}",
  "bottles": "{{count}} bottles",
  "countriesRegions": "{{countries}} countries, {{regions}} regions",
  "notifications": "Notifications",
  "recentTasted": "Recently tasted",
  "statCountries": "Countries",
  "statWines": "Wines",
  "statNotes": "Notes",
  "mapCameo": {
    "title": "Your Wine Map",
    "viewAll": "All →"
  },
  "peakGreeting": {
    "eyebrow": "Today's cellar",
    "questions": {
      "0": "{{name}}, how did <wine></wine> reach its peak last night?",
      "1": "{{name}}, does the scent of <wine></wine> still linger?",
      "2": "{{name}}, do you remember the first sip of <wine></wine>?",
      "3": "{{name}}, what hour did <wine></wine> belong to?"
    },
    "fallback": "{{name}}, which wine will you open today?"
  },
  "draftResume": {
    "title": "Draft in progress",
    "progress": "{{value}}%",
    "cta": "Resume"
  },
  "communityPeek": {
    "eyebrow": "Community",
    "title": "New notes from following",
    "viewAll": "View all →"
  },
  "quickActions": {
    "cellar": "Cellar",
    "cellarSub": "{{count}} stored",
    "map": "Map",
    "mapSub": "{{count}} regions",
    "favorites": "Favorites",
    "favoritesSub": "{{count}} wines",
    "badges": "Badges",
    "badgesSub": "{{owned}}/{{total}}"
  },
  "wineFeed": {
    "heading": "Discover wines",
    "subtitle": "Tap a card for details",
    "tabs": {
      "featured": "Featured",
      "trending": "Trending",
      "explore": "Explore"
    }
  },
  "firstTime": {
    "greeting": "Begin your wine journey",
    "title": "Record your first wine",
    "description": "Scan a label and start tasting notes",
    "cta": "Scan a label",
    "sub": "Add your first bottle to start",
    "scanCta": "Scan a label",
    "emptyMap": "No wines tasted yet",
    "emptyMapHint": "Start building your wine map",
    "suggestTour": "Take a tour — what is winemine?",
    "suggestStarter": "See starter recommendations",
    "suggestExperience": "Change experience level"
  },
  "suggestedToast": {
    "tour": "winemine captures your wine labels into a personal map",
    "starter": "Starter recommendations modal — TBD"
  },
  "heavy": {
    "greeting": "Welcome back, {{name}}",
    "recentNotes": "Recent notes",
    "recentNotesEmpty": "No notes yet",
    "cellarSummary": "Cellar",
    "cellaredCount": "{{count}} in cellar",
    "viewAll": "View all",
    "recommended": "Recommended",
    "recommendedPlaceholder": "Coming soon"
  }
},
"common": {
  "refresh": "Refresh"
}
```

> **i18next vs next-intl key 형식 차이**: keyscreen은 `{name}` (single brace) — next-intl. RN은 `{{name}}` (double brace) — i18next. **변환 시 모든 `{x}` → `{{x}}`** (RN 표준).

> **next-intl `<wine></wine>` rich text** → i18next `<Trans i18nKey="..." components={{ wine: <Text style={{color:gold, fontStyle:'italic'}}>{wineName}</Text> }}/>` 패턴. 의미 동일.

---

## 8. RN deviation 로그

| 항목 | keyscreen | RN 변경 | 사유 |
|---|---|---|---|
| Next `<Link href>` | declarative anchor | `<Pressable onPress={()=>router.push(...)}>` | RN no anchor — expo-router programmatic navigation. **시각 동일**. |
| Next `useRouter()` | client component hook | expo-router `import { router } from 'expo-router'` | 플랫폼 차이 — 효과 동일. |
| `useTranslations('home.peakGreeting')` | next-intl namespace | `useTranslation()` + `t('home.peakGreeting.X')` flat key | i18next는 namespace prefix 불필요. **동일 키 구조**. |
| `<motion.div>` + AnimatePresence | framer-motion | `react-native-reanimated` `Animated.View` + `FadeInDown.springify().damping(18)` + `FadeOutUp` | RN에는 framer 없음. 동일 visual effect 가능. **§5 의사코드 참조**. |
| `t.rich('key', { name, wine: (chunks)=>... })` | next-intl rich text | i18next `<Trans i18nKey="key" components={{wine:<Text/>}} values={{name}}/>` | 등가 변환 — 단, `<Trans>` 내부 fragment 처리가 RN의 `<Text>` nesting 제약과 만나야 함 (text-only children). |
| `localStorage.getItem('winemine.onboardingComplete')` | web storage | `AsyncStorage.getItem(...)` (이미 `src/lib/onboarded.ts` 존재) | 플랫폼 차이. |
| `<div className="wm-scroll-area">` | CSS overflow scroll | `<ScrollView>` | RN 표준. 단, keyscreen wm-scroll-area는 `padding-bottom: var(--bottom-nav-height)` 자동 — RN은 `contentContainerStyle.paddingBottom={insets.bottom+80}` 명시. |
| BottomNav `position: absolute` + spacer | DOM 분리 + spacer dummy | Expo Router (tabs) 자동 — ScrollView는 자동 inset 처리 | RN (tabs) layout이 BottomNav 영역 알아서 처리. spacer 불필요. |
| BottomNav 중앙 FAB 카메라 (52×52, marginTop -24, gradient bg, gold border, custom shadow) | 5번째 nav tab을 중앙에 띄움 | (tabs) `tabBarButton` custom override — 중앙 슬롯에 absolute positioned FAB | Expo Router tabs API의 `tabBarButton` 옵션으로 커스텀 가능. **상당한 구현 비용** — design-tokens.ts에 fab 관련 토큰(gradient, shadow) 이미 존재. **§9 별도 사양 권장 (bottom-nav.md)** — 본 화면 사양에는 "BottomNav 사양 참조"만 명시. |
| `framer-motion` exit animation 시 key 동일 컴포넌트 swap | mode='wait' (exit 끝난 후 enter) | Reanimated layout animations은 mode='wait' 기본. `<Animated.View key={idx} entering={FadeInDown} exiting={FadeOutUp}/>` 표준. | 동일 효과. |
| `data-feature-id` attribute | dev 디버그용 | RN에는 data-* attribute 없음 — `testID` 사용 | testID로 대체. design-reviewer 시각 비교에는 영향 없음. |
| `<img>`, `next/image` priority | 키스크린에 사용 안 됨 (모든 비주얼 SVG) | — | 본 화면은 raster image 0개. WMBottle/WMGlassRating 모두 inline SVG. |
| `position: sticky` | keyscreen에 사용 안 됨 (AppHeader는 fixed flow) | RN ScrollView는 sticky 없음 — stickyHeaderIndices 사용 가능 | AppHeader는 ScrollView 밖에 있어 자동 stuck. 불필요. |
| `backdrop-filter: blur` | keyscreen에 사용 안 됨 (홈 화면) | — | 본 화면에는 BlurView 불필요. |
| CSS gradient `linear-gradient(135deg, ..., ...)` | DraftNoteResume / FirstTimeGreeting / FAB / page-bg / LevelChip avatar | `expo-linear-gradient` `<LinearGradient colors={...} start={{x:0,y:0}} end={{x:1,y:1}}/>` | 표준 변환. design-tokens.ts `gradients.*` 미리 정의됨. |
| `transition` CSS | keyscreen 본 화면 거의 미사용 (PeakGreeting만 framer로 처리) | Reanimated | — |
| `:hover` pseudo-class | keyscreen 본 화면 미사용 (모바일 시안) | — | 불필요. press feedback (opacity/scale)은 RN 표준으로 추가. |
| `overflowX auto` + custom scrollbar 숨김 | `scrollbarWidth: 'none'`, `WebkitOverflowScrolling: 'touch'` | `<ScrollView horizontal showsHorizontalScrollIndicator={false}>` | 표준. |
| `scrollSnapType: 'x mandatory'` | CSS snap | `snapToInterval={210}` `decelerationRate="fast"` | RecentNotesStrip에 적용. 효과 동일. |
| `display: '-webkit-box'` + `WebkitLineClamp` | CSS multi-line truncate | `<Text numberOfLines={N}>` | RN 표준. 동일 효과. |
| 한글 word-break:keep-all | CSS 어절 단위 wrap | RN `<Text>` 기본 — 어절 wrap 없음 (문자 단위 wrap) | RN 제약. 가독성 minor 차이. 한글 긴 줄에서 어색한 줄바꿈 발생 가능. design-reviewer 검증 항목 추가. |
| letter-spacing em 단위 | `letterSpacing: '0.18em'` | px 변환 — em × font-size (예: 0.18em × 10px = 1.8px) | RN은 px만 지원. design-tokens.ts typography에 px 단위 미리 계산됨. |
| `text-transform: uppercase` | CSS | `<Text style={{textTransform:'uppercase'}}>` | RN 지원. 그대로. |
| `cursor: pointer` | CSS | RN 무시 — Pressable이 자동 적용 | — |
| `font-style: italic` | CSS | `<Text style={{fontStyle:'italic'}}>` | RN Playfair italic 폰트 로드 필요 — `PlayfairDisplay_400Regular_Italic` (현재 미로드). **§9 폰트 추가 요청**. |
| `flexShrink: 0` | CSS | RN `flexShrink: 0` 명시 | RN flexbox default가 `flexShrink: 1` — 명시 필수. |
| `minWidth: 0` | CSS for text truncation in flex child | RN `minWidth: 0` (or omit — RN flex child default behavior 다름) | RN에서는 부모 flex와 자식 width 명시 후 numberOfLines로 truncate. 그대로 작성. |

---

## 9. 토큰/i18n/컴포넌트 확장 요청

### 신규 색 토큰

| 토큰 | 값 | 용도 | 추가 위치 |
|---|---|---|---|
| `mapDark.continent` | `#2D1540` | MapCameo MiniMapPreview 대륙 silhouette, recap modal gradient 시작점, Tonight 맵 국경선 | design-tokens.ts (신규 그룹 `mapDark` 또는 `bg.continentSilhouette`) + tailwind `'continent-silhouette': '#2D1540'` |
| `wineRedAlpha.18` | `rgba(139,26,42,0.18)` | FirstTimeGreeting gradient end | design-tokens.ts alpha 헬퍼 (또는 expo-linear-gradient에 인라인 — verbatim 허용) |
| `wineRedAlpha.45` | `rgba(139,26,42,0.45)` | DraftNoteResume gradient start | 동일 |
| `wineRedAlpha.55` | `rgba(139,26,42,0.55)` | DraftNoteResume border | 동일 |
| `goldAlpha.12` | `rgba(201,168,76,0.12)` | WineFeed active chip bg | 동일 |

> **방침**: rgba alpha 변형은 design-tokens.ts에 별도 토큰 추가하지 않고 `brand.wineRed` 기반 helper 함수 `withAlpha(brand.wineRed, 0.18)` 추가 권장. **infra-architect P0 토큰 확장 세션 트리거**.

### 신규 spacing/radius

| 값 | 픽셀 | 키스크린 사용처 | 현재 NW v4 기본 |
|---|---|---|---|
| `radius: 14` | 14px | MapCameo, DraftNoteResume, HomeCommunityPeek card | NW `rounded-xl=12`, `rounded-2xl=16` — **14px 없음** |
| `radius: 20` | 20px | FirstTimeGreeting outer | NW 표준 없음 (사용자 정의 `rounded-[20px]` 또는 토큰 추가) |
| `padding 18px` | 18px | PeakGreeting paddingTop | NW `4.5` 없음 — `style={{paddingTop:18}}` 인라인 또는 spacing 토큰 |
| `padding 22px` | 22px | HomeCommunityPeek marginTop | NW `5.5` 없음 |

> 권장: `tailwind.config.ts`에 `borderRadius: { '14px': '14px', '20px': '20px' }` 또는 `rounded-[14px]` 인라인 사용. 우리 design-tokens.ts radius scale에는 14/20 추가 (별도 키).

### 신규 typography

| 항목 | 값 | 키스크린 사용처 |
|---|---|---|
| `peakGreetingQuestion` | Playfair 22px, cream, lh 1.25, ls -0.22px | PeakGreeting animated question |
| `firstTimeHeadline` | Playfair 28px, cream, lh 1.2 | FirstTimeGreeting headline |
| `mapCameoTitle` | Playfair 14px, cream | MapCameo title |
| `communityPeekTitle` | Playfair 17px, cream, lh 1.2 | HomeCommunityPeek title (기존 `cardTitle` 16px와 1px 차이 — 별도 토큰) |
| `homeMicroMeta` | Inter 9px / 10px, text-muted | RecentNotesStrip date, MiniMapPreview meta — **a11y 검토 필요** |

> `design-tokens.ts.typography`에 추가. tailwind.config.ts `fontSize`에 `peak-greeting`, `first-time-headline` 등 키 추가.

### 신규 폰트 weight/variant

| 폰트 | 현재 로드 | 신규 필요 |
|---|---|---|
| PlayfairDisplay_400Regular_Italic | 미로드 | PeakGreeting wine name inline italic |
| Inter_500Medium | 로드됨 | (재사용) |

> Playfair Italic 추가 로드 — `app/_layout.tsx`의 `useFonts({ ... })`에 `PlayfairDisplay_400Regular_Italic` 추가. **P0 폰트 확장 요청**.

### 신규 shadow

본 화면에 keyscreen에서 추가 shadow 사용처는 없음 (FAB shadow는 BottomNav 사양 별도). **확장 불필요**.

### 신규 gradient (design-tokens.ts.gradients)

| 키 | 값 | 사용처 |
|---|---|---|
| `draftResume.dark` | `{colors: ['rgba(139,26,42,0.45)', '#3D2A4A'], 135deg}` | DraftNoteResume dark |
| `draftResume.light` | `{colors: ['rgba(139,26,42,0.45)', '#FFFFFF'], 135deg}` | DraftNoteResume light |
| `firstTimeGreeting.dark` | `{colors: ['#3D2A4A', 'rgba(139,26,42,0.18)'], 135deg}` | FirstTimeGreeting dark |
| `firstTimeGreeting.light` | `{colors: ['#FFFFFF', 'rgba(139,26,42,0.18)'], 135deg}` | FirstTimeGreeting light |
| `levelChip.{L1..L5}` | `{colors: [level[L], level[L]+'99'], 135deg}` | AppHeader LevelChip avatar |

> 모두 design-tokens.ts.gradients에 추가. **P0 토큰 확장 요청**.

### 신규 컴포넌트 (포팅)

| 컴포넌트 | 원본 | 목표 위치 |
|---|---|---|
| `WMBottle` | `keyscreen src/components/shared/wm-bottle.tsx` | `src/components/shared/wm-bottle.tsx` (react-native-svg port) |
| `WMGlassRating` | `keyscreen src/components/shared/wm-glass-rating.tsx` | `src/components/shared/wm-glass-rating.tsx` |
| `CommUserAvatar` | `keyscreen src/components/community/comm-user-avatar.tsx` | `src/components/community/comm-user-avatar.tsx` |
| `PostTypeBadge` | `keyscreen src/components/community/post-type-badge.tsx` | `src/components/community/post-type-badge.tsx` |
| `Toast` (helper) | `keyscreen src/hooks/use-toast.ts` | 이미 `src/components/shared/toast.tsx` 존재 — 확인 |
| `WMLogoMark` + `WMLogoWordmark` | inline in keyscreen AppHeader | `src/components/nav/app-header.tsx` 내부 또는 `src/components/shared/wm-logo.tsx` 분리 |
| `BellButton` | inline | `src/components/nav/app-header.tsx` 내부 |
| `LevelChip` | inline | `src/components/shared/level-chip.tsx` (기존 `level-pill.tsx`와 별개 — keyscreen은 avatar+레벨번호 chip, level-pill은 단일 chip) |

> **컴포넌트 포팅 P0 세션 트리거** — rn-screen-builder가 본 화면 구현 시 신규로 만들어야 함. design-spec-author는 트리거만, 포팅 자체는 빌더 책임.

### 신규 마이그레이션

본 화면은 **추가 마이그레이션 불필요**. 기존:
- `profiles.mode` (`first-time` | `heavy`) ✓
- `profiles.level` (1~5) ✓
- `profiles.anonymous_display` ✓
- `tasting_notes` ✓
- `cellar_items` ✓

단, keyscreen은 `user.stats.{countriesExplored, winesTasted, notesCount, regionsExplored, cellarCount}` 사용 — 이는 mock. RN은 SQL 집계로 계산:
- `winesTasted` = `count(distinct lwin)` from `tasting_notes where user_id=auth.uid()`
- `notesCount` = `count(*)` from `tasting_notes where user_id=auth.uid()`
- `countriesExplored` = wines_localized JOIN으로 country distinct count
- `regionsExplored` = wines_localized JOIN으로 region distinct count
- `cellarCount` = `count(*)` from `cellar_items where user_id=auth.uid() and consumed_at is null`

**신규 RPC 함수 또는 view 권장** — supabase-engineer 트리거. **§11 retroactive 작업에 포함**.

### NW v4 colorScheme 헬퍼

dark/light 분기에서 직접 색 hex가 필요한 인라인 style 위치(LinearGradient colors, react-native-svg fill, 등) — `useColorScheme()` 훅 + design-tokens.ts {dark, light} 객체 직접 참조. 헬퍼 함수 권장:

```ts
// src/lib/use-theme-tokens.ts
import { useColorScheme } from 'nativewind';
import { dark, light } from './design-tokens';

export function useThemeTokens() {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'light' ? light : dark;
}
```

> **P0 infra-architect 트리거** — 본 화면 LinearGradient/SVG에 의존.

---

## 10. 검증 체크리스트

- [ ] heavy/first-time 모드별 섹션 개수·순서 verbatim (heavy 8 / first-time 4)
- [ ] PeakGreeting 5초 fade rotation 동작, idx 0→1→2→3→0 cycle
- [ ] PeakGreeting wine name italic gold 분리 렌더 (`<Trans>` chunks)
- [ ] DraftNoteResume gradient 135deg [wineRed 0.45 → surface] (dark/light 양쪽 분기)
- [ ] StatHero 3 카드 grid (1fr 1fr 1fr) gap 6 padding 12_16_0
- [ ] MapCameo MiniMapPreview SVG 14 dot (strong 6개 wineRed + soft 8개 gold) + 6 대륙 ellipse
- [ ] HomeCommunityPeek 2 posts row, 마지막 row border-bottom 없음
- [ ] RecentNotesStrip 가로 snap (snapToInterval 210), 노트 0개 시 미렌더
- [ ] WineFeed tabs (featured/trending/explore) 전환 시 list 즉시 재계산, active chip gold border + gold bg 0.12
- [ ] WineFeedRow WMBottle width 40 height 130, rating 우측 정렬
- [ ] QuickActions 2×2 grid, gap 12, 각 카드 minHeight 86
- [ ] FirstTimeGreeting outer minHeight 220, gradient surface→wineRed 0.18, CTA size=lg
- [ ] EmptyStatHero dashed border, 4 ellipse placeholder, gap 8
- [ ] SuggestedActions 3 rows, 우측 ChevronRight, 1번/2번은 Toast, 3번은 navigate
- [ ] AppHeader: heavy LevelChip(L4 gold) / first-time Avatar(wine-red bg + cream initial)
- [ ] AppHeader Bell unread dot (wineRed circle r=2.5)
- [ ] BottomNav 5 tabs (home/map/FAB capture/cellar/community), home active gold + bold
- [ ] BottomNav 중앙 FAB 52×52 marginTop -24 gradient + shadow + gold border
- [ ] dark mode 색 검증 (모든 카드 surface=#3D2A4A, gold/wineRed 고정)
- [ ] light mode 색 검증 (surface=#FFFFFF, text-primary=#2A1A14)
- [ ] ko/en 양쪽 모드 텍스트 검증 (모든 i18n 키 양쪽 채움, 영어 모드 한글 노출 0건)
- [ ] dark+ko / dark+en / light+ko / light+en 4 조합 시각 캡처 (design-reviewer)
- [ ] 풀-투-리프레시 동작 (RefreshControl tintColor gold)
- [ ] 첫 진입 시 first-time + !onboardingComplete → /onboarding redirect
- [ ] PeakGreeting setInterval cleanup on unmount (메모리 누수 점검)
- [ ] PeakGreeting Animated.View `key={idx}` 트랜지션 부드러움 (450ms FadeInDown/FadeOutUp)
- [ ] WMBottle/WMGlassRating react-native-svg 포팅 후 시각 일치
- [ ] CommUserAvatar 5 레벨 gradient 5종 분리 렌더
- [ ] PostTypeBadge 5 타입 color + 10% bg + 33% border
- [ ] 한글 word-break minor 차이 design-reviewer 수동 검증
- [ ] 9px/10px micro text dynamic type a11y 검증 (`allowFontScaling={false}` 적용 위치 확인)
- [ ] Press feedback (opacity 0.85, scale 0.98) 모든 Pressable
- [ ] Haptics.selectionAsync 모든 nav 액션
- [ ] WCAG AA 대비 (text-primary, text-muted, gold on surface/bg-deepest 양쪽 모드)

---

## 11. 현재 RN 구현 차이 (retroactive)

기존 코드: `app/(tabs)/index.tsx` (65 LOC), `src/components/home/{first-time-home,heavy-home,recent-notes-section,cellar-summary-section,recommended-placeholder}.tsx` (~100 LOC 합계).

| 항목 | keyscreen 원본 (verbatim 기준) | 현재 RN 구현 | 수정 필요 |
|---|---|---|---|
| **모드 분기** | heavy 8섹션 / first-time 4섹션 | 두 모드 모두 단순화됨 | 위 §2 트리 전체 적용 — 11 신규 섹션 컴포넌트 필요 |
| **AppHeader** | 화면 내부 자체 컴포넌트 (logo + bell + LevelChip) | shared `<AppHeader title={...} right={...}/>` 사용 — title prop으로 "홈" 표시 | keyscreen은 title 표시 없음. logo만. AppHeader 컴포넌트 자체를 keyscreen 형태로 retro-fit. **`src/components/nav/app-header.tsx` 재작성**. |
| **PeakGreeting** | heavy 모드 상단 5초 rotation | 없음 | 신규 컴포넌트 필요 — Reanimated + i18n Trans |
| **DraftNoteResume** | heavy 모드 카드 | 없음 | 신규 |
| **StatHero** | 3-col grid 카드 | 없음 (heavy-home은 인사말 + 3 섹션) | 신규 |
| **MapCameo + MiniMapPreview** | 정적 SVG 지도 preview | 없음 | 신규 — react-native-svg |
| **HomeCommunityPeek** | 2 posts dense card | 없음 | 신규 — CommUserAvatar/PostTypeBadge 포팅 후 |
| **RecentNotesStrip** | 가로 스크롤 카드 (max 8, WMBottle + glass rating + aroma hint) | `RecentNotesSection` (세로 리스트, 3개) | 가로 → 세로, 카드 디자인 다름. 키스크린 verbatim으로 재작성. |
| **WineFeed** | tabs(featured/trending/explore) + WineFeedRow (병+meta+rating+price+chevron) | `RecommendedPlaceholder` (Coming soon 텍스트만) | 완전 신규 — featured wines 큐레이션 데이터 필요 (현재 supabase에 featured flag 없음 — **supabase-engineer 트리거**) |
| **QuickActions** | 2-col 4 카드 (cellar/map/favorites/badges) | `CellarSummarySection` (1 카드 cellar count만) | 4 카드로 확장 |
| **FirstTimeGreeting** | 화면 상단 카드 (minHeight 220, gradient, CTA) | `FirstTimeHome` (풀스크린 center layout, Wine icon + greeting + CTA) | 레이아웃 완전 다름 — keyscreen으로 재작성 |
| **EmptyStatHero** | dashed border 카드 + SVG placeholder | 없음 (FirstTimeHome이 풀스크린 대체) | 신규 — 첫 마운트 후 FirstTimeGreeting 아래 표시 |
| **SuggestedActions** | 3 row (toast/navigate) | 없음 | 신규 |
| **BottomNav** | 5 tabs (home/map/FAB capture/cellar/community), 중앙 FAB | Expo Router (tabs) — 4 tabs (home/cellar/notes/capture/settings 추정) | tabs 5개로 재구성 + 중앙 FAB. **`app/(tabs)/_layout.tsx` 재작성 필요**. tabs 구성 자체가 다름: keyscreen은 community 탭 / 우리는 settings 탭. **리더 결정 필요 — 키스크린 verbatim이면 community 추가 + settings는 profile 진입로 등으로 이동**. |
| **i18n 키** | `home.peakGreeting.*`, `home.draftResume.*`, `home.communityPeek.*` etc | `home.firstTime.*`, `home.heavy.*` (간소화 버전) | §7 키 일괄 추가 + 기존 키 일부 deprecate (heavy.recentNotesEmpty 등은 keyscreen에 없음 — 우리 자체 추가) |
| **profile.stats RPC** | mock | 없음 | supabase migration + view 또는 RPC 신규 (winesTasted/countriesExplored/regionsExplored/cellarCount 집계) |
| **featured wines** | mock `getFeaturedWines()` 12종 | 없음 | supabase `wines.featured boolean` 컬럼 + seed 또는 별도 `featured_wines` 테이블. **v0.1.0 alpha 결정 필요** — 또는 mock data 그대로 LOC 절감 |
| **community posts** | mock | 없음 | v0.2.0 검토 — v0.1.0은 mock 또는 EmptyState 처리 |

### retroactive 작업 폭

- **신규 컴포넌트**: 8개 (PeakGreeting, DraftNoteResume, StatHero, MapCameo, HomeCommunityPeek, RecentNotesStrip-rewrite, WineFeed, QuickActions, FirstTimeGreeting-rewrite, EmptyStatHero, SuggestedActions)
- **shared 포팅**: 4개 (WMBottle, WMGlassRating, CommUserAvatar, PostTypeBadge)
- **AppHeader 재작성**: 1개
- **BottomNav (`(tabs)/_layout.tsx`) 재작성**: 1개 + tabs 구성 변경 (community 추가/settings 이전)
- **i18n 확장**: ko/en 각 ~30개 키
- **design-tokens.ts 확장**: 5 gradient + 알파 헬퍼 + Playfair Italic 폰트
- **tailwind.config.ts 확장**: borderRadius 14/20, 신규 fontSize 5종
- **supabase**: stats RPC/view + featured flag (선택)

**총 LOC 추정**: 800~1000 LOC 신규/재작성. **2~3일 작업 — Day 6/7 압박**. rn-screen-builder 검토 후 우선순위 분리:
- **P0 (alpha 필수)**: AppHeader + BottomNav + heavy 모드 8섹션 + first-time 모드 4섹션 (mock 데이터로) — 시각만 맞춤
- **P1 (post-alpha)**: profile.stats 실 데이터, featured wines, community posts 실 데이터
- **P2 (v0.2.0)**: PeakGreeting 정점 인사말 실 와인 데이터 연결

---

## 12. 미해결 질문 (리더 판단 필요)

1. **BottomNav 5 tabs 구성**: keyscreen은 home/map/FAB/cellar/community. 우리 현재는 home/cellar/notes/capture/settings. **community 탭을 추가하면 settings는 어디로?** — profile 진입로(LevelChip onPress)로 이동 가능. notes 탭은 keyscreen에 없음 (home의 RecentNotesStrip + 노트 작성은 FAB 또는 wine detail에서) — notes 탭 제거 검토.
2. **community / map 화면 v0.1.0 alpha 포함 여부**: tabs에 추가하면 빈 placeholder 화면이라도 필요. v0.1.0 spec 확인 후 결정.
3. **featured wines 데이터 소스**: mock 그대로 v0.1.0 alpha (LOC 절감) vs supabase featured 컬럼 + seed.
4. **community posts mock 노출 여부**: heavy 모드 HomeCommunityPeek 핵심 섹션. mock 노출 시 "v0.2.0 곧 출시" 패턴 / 완전 미렌더 / mock 그대로 — 셋 중 결정.
5. **draft note "bgy-puligny-montrachet 90%"**: keyscreen mock. v0.1.0에서 실제 draft 시스템(localStorage 기반 unsavedChanges) 구현 여부. 미구현 시 DraftNoteResume 자체를 hide.
6. **PeakGreeting 정점 인사말 실 와인 데이터**: 최근 시음 와인 4개의 appellation 추출 — wines_localized JOIN 필요. v0.1.0에는 fallback ("오늘은 어떤 와인을 여실 건가요?")만 노출하고 wine 회전은 v0.2.0 검토 가능.
7. **9px/10px micro text a11y**: design-reviewer가 dynamic type 검증 후 11px로 상향 여부 결정. 키스크린 verbatim 원칙과 충돌 — 리더 판단.

---

## 13. 진행 로그 메타

- author: design-spec-author
- 작성일: 2026-05-20 (Day 6)
- 키스크린 JSX read: 11개 파일 (page.tsx + 8 home components + 2 shared)
- 기존 RN read: 6개 파일 (index.tsx + 5 home components + app-header)
- 토큰 확장 P0 요청: 5 gradient, 1 alpha helper, 5 fontSize, 2 radius, Playfair Italic, useThemeTokens hook
- i18n 확장 요청: ko/en 30+ 키
- supabase 확장 요청: profile stats view/RPC + featured wines (선택)
- retroactive 폭: heavy 8섹션 + first-time 4섹션 = 11개 신규 컴포넌트 + 2개 재작성 + 4개 shared 포팅 + tabs 재구성
- **rn-screen-builder 작업 추정**: 2~3일 (Day 6/7 압박 — alpha P0 범위로 축소 권장)

---

## §3-8-PATCH. WineFeed 카드 horizontal layout 정합화 (2026-05-21)

> **트리거**: 사용자 image #6 (현재 RN) — bottle SVG가 카드 위쪽에 고립된 큰 사이즈로 표시되고 이름/가격/평점이 카드 하단에 vertical stack됨. 카드 1개가 화면 절반 차지. 정보 위계 깨짐.
> **진실 소스**: 사용자 image #7 (정확한 reference) + `../winemine-keyscreen/src/components/home/wine-feed.tsx` (verbatim horizontal flex-row 구조).
> **결론**: 키스크린 JSX가 이미 horizontal 구조이므로 현재 RN 코드(`src/components/home/wine-feed.tsx`)의 flex-row 자체는 맞음. 문제는 (a) bottle 차원이 40×130으로 카드 안에서 시각 비율이 깨짐 (병이 너무 얇고 김), (b) 카드 padding 12 + gap 12 + radius 12로 시각이 컴팩트하지 않음, (c) chevron 잔존이 카드 폭 압박. PATCH로 §3-8 매핑표·§2-1 트리 양쪽 수정 완료.

### PATCH 변경 요약

| 항목 | 키스크린 원본 | RN PATCH 값 | 변경 사유 |
|---|---|---|---|
| WineFeedRow padding | 12 | **16** | 카드 호흡 + image #7 reference |
| WineFeedRow gap | 12 | **16** | bottle/meta/우측 column 간격 확보 |
| WineFeedRow radius | 12 | **14** | 다른 home 섹션 카드(MapCameo/DraftNoteResume) radius=14와 일관성. design-tokens.ts.radius['14'] 기존 토큰 재사용 |
| items 정렬 | center | **stretch** | 병 컬럼 + 우측 컬럼이 카드 높이 따라 정렬, vertical centering 자연스럽게 |
| Bottle 전용 column | 없음 (row 직접 child) | **width 96, items-center, justify-center** | bottle을 명시적 컬럼에 가두면 가로 정렬 통제 가능 |
| WMBottle 차원 | 40×130 | **90×150** | image #7 reference. WMBottle viewBox 40×130 → preserveAspectRatio meet으로 자동 fit. 컴포넌트 코드 수정 불필요 |
| Wine name | Playfair 15 lh 18 (1줄) | **Playfair 16 lh 19.2 (2줄)** | 가독성 + 긴 와인명 보호 |
| Producer line | Inter 11 (1줄) | **Inter 12 lh 14.4** | 위계 보강 |
| Location MapPin | 10 | **11** | 시각 균형 |
| Location text | Inter 11 | **Inter 11** (변경 없음) | 키스크린 verbatim |
| Grapes | Inter 10 op 0.85 | **Inter 11 op 0.85** | 마이크로 텍스트(<11px) a11y 회피 (사양 §6 dynamic type) |
| Right column minWidth | 70 | **76** | 가격 ₩1.2M 등 긴 값 nowrap 안정 |
| Right column justify | space-between (chevron 있음) | **center (chevron 없음)** | rating/price만 vertical center로 응집 |
| WMGlassRating size | 8 | **10** | 시각 위계 보강 (price 14 ↑) |
| Score font | Inter 11 600 gold | **Inter 12 600 gold** | rating row 크기 균형 |
| Rating row gap | 4 | **5** | glasses ↔ score 간격 |
| Price | Playfair 13 | **Playfair 14 lh 16.8** | 1pt ↑ (가독성) |
| ChevronRight | 16 text-muted | **제거** | image #7 reference에 없음. RN deviation. |

### 신규 토큰

**없음.** 모든 변경은 기존 design-tokens.ts에 있는 토큰(`radius['14']`, `brand.gold`, `brand.cream`, `brand.wineRed`, `withAlpha`, `wineTypeDot`, `bottleColorDefault`) 또는 인라인 px 값으로 처리. typography는 기존 `homeWineFeedTitle`(Playfair 18 — 섹션 h2용, 변경 없음)과 `homeWineFeedRowName`(Playfair 15 lh 18 — 사용 안 함, 인라인 16 lh 19.2로 override) 재사용. P0 토큰 확장 세션 트리거 **불필요**.

### 상태 variants (PATCH 후)

#### default (dark)
- 카드 bg `dark.surface` (#3D2A4A), border 1px `dark.border.default` (#5A3D6A)
- WMBottle bottleColor: `bottleColorDefault[wine.type]` (red=#3a1018, white=#c9b275, rose=#e5a8aa, sparkling=#d8c997)
- Wine name: cream (#F8F4ED)
- Producer/grapes/location text: text-secondary/muted 분기
- Rating gold (#C9A84C) 고정
- Price cream

#### default (light)
- 카드 bg `light.surface` (#FFFFFF), border 1px `light.border.default` (#E0D2BC)
- Wine name: text-primary (#2A1A14)
- 나머지 색은 light 토큰 분기 (`useThemeTokens()`)
- WMBottle 색은 양 모드 동일 (병 색은 와인 타입 표현 — 테마 무관)

#### pressed (양 모드 공통)
- `Pressable style={({pressed})=>({opacity: pressed?0.9:1, transform:[{scale: pressed?0.99:1}]})}`
- Haptics.selectionAsync() 발화
- 키스크린에는 hover/active 없음 — RN press feedback 표준 추가 (deviation §8 기존 항목 재사용)

#### loading
- WineFeedRow 자리에 SkeletonBlock — **height 182** (PATCH 후 카드 높이 = padding 16×2 + max(bottle 150, meta 6줄 ≈ 130) = 182), radius 14, bg `withAlpha(tokens.text.muted, 0.18)`
- 카드 5개 표시 (기존 사양 §4 loading 동일, height만 142 → 182)

#### empty / error
- featured는 큐레이션이라 항상 데이터 있음. 빈 분기 불필요 (기존 사양 §4 유지).
- error는 supabase fetch 실패 시 Toast + 마지막 캐시 표시 (기존 §4 유지).

### 인터랙션

| 트리거 | 결과 |
|---|---|
| 카드 onPress | `Haptics.selectionAsync().catch(()=>undefined)` → `router.push(`/wine/${wine.lwin}`)` |
| 카드 onPressIn/Out | opacity 0.9 + scale 0.99 (Pressable style 함수형) |
| 카드 long-press | (미구현 — Phase 3 즐겨찾기 토글 예약) |

### 접근성

| 속성 | 값 |
|---|---|
| `accessibilityRole` | `"link"` |
| `accessibilityLabel` | `${wine.name} ${wine.producer} ${wine.vintage} 평점 ${wine.score.toFixed(1)} 가격 ${formatKrwSpoken(wine.priceKrw, locale)}` — 4개 정보 합쳐서 한 번에 읽음 (en 모드: `${wine.name}, ${wine.producer}, ${wine.vintage}, rated ${score.toFixed(1)} out of 5, price ${formatKrwSpoken}`) |
| `accessibilityHint` | `t('home.wineFeed.openDetail')` — i18n 신규 키 (예: ko "상세 화면으로", en "Open wine detail") |
| `allowFontScaling` | wine name/producer/price: 기본 허용 (12px 이상). MapPin 옆 location 11px: `allowFontScaling={false}` 권장 (레이아웃 안정) — design-reviewer 검증 항목 |
| 대비 (dark) | cream on #3D2A4A = 10.6:1 (AAA), gold on #3D2A4A = 4.9:1 (AA) ✓ |
| 대비 (light) | #2A1A14 on #FFFFFF = 17.3:1 (AAA), gold #C9A84C on #FFFFFF = 2.9:1 — **FAIL** AA. 라이트 모드 score 텍스트 색은 brand.wineRed (#8B1A2A on #FFFFFF = 8.4:1 AAA) 또는 darker gold로 보완 권장. **§9-PATCH 검토 항목**. |

### i18n 키 호환성

- 기존 `home.wineFeed.heading` / `home.wineFeed.subtitle` / `home.wineFeed.tabs.{featured|trending|explore}` 그대로 사용 (사양 §7 ko/en json 정의됨)
- **신규 추가 권장**: `home.wineFeed.openDetail` (ko: "상세 화면으로", en: "Open wine detail") — accessibilityHint용
- **신규 추가 권장**: `home.wineFeed.priceUnit` (현재 인라인 `₩` + formatKrwShort 사용). 키 추가 없이도 동작 가능 — 변경 없음 채택.
- 가격/평점 단위는 현재 RN의 `formatKrwShort(krw, i18n.language)` 함수 (ko='10만'/en='100K')가 처리. 추가 i18n 키 불필요.

### RN deviation 사유 (PATCH)

| 항목 | 키스크린 | RN 변경 | 사유 |
|---|---|---|---|
| ChevronRight 우측 | 16px text-muted | 제거 | 사용자 image #7 reference에 chevron 없음. 카드 폭 압박 해소. Pressable이 이미 link 역할 — chevron 시각 노이즈 |
| WMBottle 차원 | 40×130 | 90×150 | image #7 reference. 키스크린 next.js wine-feed.tsx는 mobile mock-up 시안이라 작게 그렸으나, 실제 RN 카드 안 시각 균형은 90×150이 적절. WMBottle SVG viewBox(40×130 고정) + preserveAspectRatio="xMidYMid meet"로 자동 fit — 컴포넌트 자체 수정 0 |
| 카드 padding 12 → 16 | 12 | 16 | 키스크린 verbatim 위반. 사유: image #7 reference가 더 큰 padding 사용. 다른 home 카드(DraftNoteResume p=12_14, MapCameo p=12_14_0)와 비교해도 16이 카드 위계상 적합 |
| 카드 radius 12 → 14 | 12 | 14 | home의 다른 large 카드(MapCameo, DraftNoteResume, HomeCommunityPeek)는 모두 radius 14. WineFeedRow만 12였던 것 자체가 키스크린의 inconsistency — 14로 통일 |
| Typography 1pt ↑ | (각 항목 keyscreen verbatim) | name 16, producer 12, grapes/location 11, price 14 | 키스크린 verbatim 위반. 사유: 사용자 image #6 회귀 방지 + a11y dynamic type 10px 미만 회피 + image #7 reference 위계 매칭. 1pt씩만 ↑하여 디자인 시안 정신 유지 |
| items center → stretch | center | stretch | bottle 90×150 + 우측 column이 카드 높이 따라 늘어나야 자연스러운 vertical 분포 |

### 검증 체크리스트 (PATCH 후 design-reviewer 항목)

- [ ] WineFeedRow 카드 padding 16 / gap 16 / radius 14 시각 일치
- [ ] WMBottle 90×150 — 카드 안에서 명확히 보이고 한 컬럼으로 응집
- [ ] Wine name Playfair 16 (Playfair 폰트 로드 확인 — `app/_layout.tsx`)
- [ ] 2줄 clamp 작동 (긴 와인명 ellipsis 노출 확인)
- [ ] 우측 column에 chevron 없음, rating + price만 vertical center
- [ ] Rating row: WMGlassRating size 10, score Inter 12 600 gold, gap 5
- [ ] Price Playfair 14, ₩ prefix + formatKrwShort
- [ ] dark/light 양쪽 모드 카드 bg/border 색 분기 확인
- [ ] **light 모드 gold score 대비 검증** — AA 미달 시 wineRed 또는 darker gold 대안 (위 §접근성 검토)
- [ ] Pressable opacity/scale feedback
- [ ] Haptics.selectionAsync 동작
- [ ] accessibilityLabel 통합 읽기 (와인명 + 평점 + 가격)
- [ ] 한글/영문 양쪽 모드 텍스트 wrap·ellipsis 확인 (한글 어절 단위 wrap 부재로 인한 줄바꿈 점검)

### 영향 범위

- 수정 파일: `src/components/home/wine-feed.tsx` (WineFeedRow JSX inline style + className 일괄 갱신)
- 신규 컴포넌트/토큰/i18n: **0**
- WMBottle (`src/components/shared/wm-bottle.tsx`) 수정: **불필요** (viewBox aspect ratio 자동 fit)
- 다른 home 섹션 영향: **없음** — WineFeed 섹션 단독 변경
- design-reviewer 게이트: image #7 reference와 라이트/다크 양쪽 캡처 비교

### 작업자 노트

- rn-screen-builder는 본 §3-8-PATCH + 갱신된 §2-1 트리만 입력으로 받음. §3-8 원본 매핑표 행은 PATCH 행이 override (table 행 별 "PATCH:" 표기로 명시).
- 코드 변경 분량: ~30 LOC (WineFeedRow 함수 내부만)
- WMBottle viewBox 40×130을 90×150 박스에 그릴 때 — SVG는 카드 가운데 정렬 + 비율 유지 → 실제 SVG drawing은 ~41×150 박스를 차지 (병 모양 키는 150px, 폭은 비율상 ~46px). 나머지 ~50px (96-46)는 좌우 padding으로 자연 흡수. 시각 비례 OK.
- 만약 design-reviewer가 90×150도 시각 부족하다고 판단 시 → 100×166 또는 110×180으로 확장 가능. 단 카드 padding 16 + gap 16 + meta 컬럼 최소 폭 고려하면 bottle column 96~110 범위가 안전.
