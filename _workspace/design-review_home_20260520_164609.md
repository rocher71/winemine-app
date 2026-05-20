# Design Review — home (retroactive 1차)

> design-reviewer 6항목 시각 게이트. 작성일: 2026-05-20 16:46:09 (Day 6 retroactive hardening)
> 비교 3축:
> 1. 사양: `_workspace/design-specs/home.md` (972 lines, 2026-05-20 design-spec-author)
> 2. 현재 RN 구현: `app/(tabs)/index.tsx` + `src/components/home/{first-time-home,heavy-home,recent-notes-section,cellar-summary-section,recommended-placeholder}.tsx` + `src/components/nav/app-header.tsx`
> 3. 키스크린: `_workspace/keyscreen-shots/home.png` (멀티모달 직접 로드 + 사양 §2-1 verbatim 트리)

---

## 0. 범위/사전 인지

### 범위 제외 (SCOPE-OUT, FAIL 카운트 0)
- Day 6 settings 3 sub 화면 (`/settings/{language,experience,appearance}`)
- settings hub (`app/(tabs)/settings/index.tsx`)
- `app/(tabs)/_layout.tsx` Stack/Tabs 분리 자체
- BottomNav tabs 구성 변경 (settings 이동/community 추가 등) — sublayout과 직결
- AppHeader logo wordmark / Bell / LevelChip 디자인 자체 (사양 §3-1) — `src/components/nav/app-header.tsx`는 다른 화면에서도 공유되며, 본 home review에서는 "AppHeader가 home에서 사용되는 형태(title 표시 vs logo)" 까지만 본다

### 검증한 키스크린 reference
- `_workspace/keyscreen-shots/home.png` heavy mode dark ko (이미지에서 PeakGreeting eyebrow "오늘의 셀러" + animated question, DraftNoteResume 빨강 카드 "작성 중인 노트 ... 이어 쓰기", 3-col stats, MapCameo dark map silhouette + dots, HomeCommunityPeek 2 post rows, RecentNotesStrip 가로 카드 strip, WineFeed 대형 와인 리스트 ~10개 row, 하단 QuickActions 2-col 4 카드, 최하단 BottomNav 5 tabs + 중앙 FAB이 모두 한 스크롤 안에 보임)

### 사전 인지된 retroactive 폭 (사양 §11)
- 신규 컴포넌트 ~11개 / shared 포팅 4개 / AppHeader·BottomNav 재작성 — 사양 자체에 P0/P1/P2 분할 권장 명시

---

## 1. 6항목 체크리스트 (각 항목 PASS/FAIL + 증거)

### (a) 요소 누락 — **FAIL**

| # | 사양/키스크린 기대 요소 | 현재 RN | 위치 (현재) | 수정 방향 |
|---|---|---|---|---|
| a1 | **PeakGreeting** (heavy 모드 상단 eyebrow "오늘의 셀러" + animated 22px Playfair question + wine name italic gold + 5초 fade rotation) — 사양 §2-1 line 70-72, 키스크린 home.png 최상단 핵심 hero | **부재** | `heavy-home.tsx:33-37` — `font-playfair text-page-title`로 단순 인사말("home.heavy.greeting") 1줄만 | 신규 컴포넌트 `src/components/home/peak-greeting.tsx` 생성 (사양 §5 의사코드 그대로). Reanimated `FadeInDown(450).springify().damping(18)` + `FadeOutUp(450)` + `setInterval(5000)` + `<Trans>` chunks. 키 `home.peakGreeting.eyebrow`, `home.peakGreeting.questions.0..3`, `home.peakGreeting.fallback` |
| a2 | **DraftNoteResume** (heavy 모드 빨강 카드 — Pen icon circle + "작성 중인 노트" + "퓌셀 2019 · 90%" + "이어 쓰기" pill, gradient 135deg wineRed.45→surface + border wineRed.55) — 사양 §2-1 line 74-83, 키스크린 home.png 빨강 카드로 명확히 보임 | **부재** | — | 신규 `src/components/home/draft-note-resume.tsx`. `<LinearGradient>` (expo-linear-gradient) + Pen icon (lucide-react-native) + CTA pill. v0.1.0 mock data 또는 hide (사양 §12 Q5 미해결) |
| a3 | **StatHero 3-col grid** (방문 국가 / 마신 와인 / 작성 노트, Playfair 20px value + Inter 10px label) — 사양 §2-1 line 84-89, 키스크린 home.png에서 3개 동등 카드 명확 | **부재** | — | 신규 `src/components/home/stat-hero.tsx`. profile.stats 데이터(현재 hook 미존재 — 사양 §9 supabase RPC/view 요청, 또는 mock count 0 표시) |
| a4 | **MapCameo + MiniMapPreview** (link → /map, 헤더 "당신의 와인 지도" + "{N}개국 · {M}개 지역" + "전체 →" + SVG 320×100 6 대륙 ellipse + 14 dots) — 사양 §2-1 line 90-98, 키스크린 home.png에서 dark map 영역 + dot 점 보임 | **부재** | — | 신규 `src/components/home/map-cameo.tsx` + `src/components/home/mini-map-preview.tsx`. react-native-svg `<Svg viewBox="0 0 320 100"/>` |
| a5 | **HomeCommunityPeek** (eyebrow "커뮤니티" + h2 "팔로잉의 새 노트" + 모두 보기 → + 2 post rows: CommUserAvatar 28+badge+title 13px+reactions row) — 사양 §2-1 line 99-116, 키스크린 home.png에서 2 post rows 보임 | **부재** | — | 신규 `src/components/home/home-community-peek.tsx` + shared 포팅 `CommUserAvatar`, `PostTypeBadge`. v0.1.0 mock posts 또는 EmptyState (사양 §12 Q4) |
| a6 | **RecentNotesStrip** (가로 스크롤, snap, max 8 카드 width 200, WMBottle 26×86 + wine name Playfair 12px + WMGlassRating + aroma) — 사양 §2-1 line 117-129, 키스크린 home.png 영역에서 가로 카드 strip 보임 | **부분 — 세로 list로 변형** | `recent-notes-section.tsx:74-79` — `<View className="mt-3 gap-3">` 세로 리스트, 3개만, NoteCard는 `flex-row` (병+meta 가로) | 가로 ScrollView로 재작성. `<ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={210} decelerationRate="fast" contentContainerStyle={{paddingHorizontal:16, gap:10}}>`. 카드 width 200, WMBottle (포팅 필요) + WMGlassRating (포팅 필요) + aroma hint. **0개 시 미렌더** (현재는 빈 메시지 출력 line 70-73 — 키스크린 verbatim과 충돌) |
| a7 | **WineFeed** (heavy + first-time 공용, h2 "와인 둘러보기" + 탭 chips featured/trending/explore + WineFeedRow 리스트 WMBottle 40×130 + meta + rating + price) — 사양 §2-1 line 130-150, 키스크린 home.png 큰 영역 (10+ 와인 카드) | **부재** | `recommended-placeholder.tsx` — "Coming soon" 텍스트 1줄만 | 완전 신규 `src/components/home/wine-feed.tsx` + `src/components/home/wine-feed-row.tsx`. 탭 상태 + Sparkles/Flame/Globe2 lucide icon + 가로 chips ScrollView + 세로 row list. mock featured wines (사양 §12 Q3 — alpha mock 또는 `wines.featured` 컬럼 신규) |
| a8 | **QuickActions 2-col 4 카드** (cellar/map/favorites/badges, TrendingUp/Globe2/Star/Award icon + title 14px 600 + sub card-meta) — 사양 §2-1 line 152-156, 키스크린 home.png 최하단 (BottomNav 위) 2×2 grid 보임 | **부분 — 1 카드만** | `cellar-summary-section.tsx` cellar 1개만 존재 (single row pressable) | 4 카드 grid로 확장. `<View className="flex-row flex-wrap" style={{gap:12}}>` 각 카드 `flexBasis:'48%'`. 키: `home.quickActions.{cellar,cellarSub,map,mapSub,favorites,favoritesSub,badges,badgesSub}` |
| a9 | **FirstTimeGreeting (first-time)** — outer 카드 (m=8_16_0, radius 20, padding 24, gradient surface→wineRed.18, minHeight 220) + eyebrow `{name}님, 환영합니다` + headline Playfair 28px + sub + scan CTA — 사양 §2-2 line 166-173 | **레이아웃 완전 다름** | `first-time-home.tsx:15-40` — `flex-1 items-center justify-center px-6` 풀스크린 center layout, Wine 원형 icon 96×96 + 인사말 + CTA. 키스크린은 화면 상단 카드 + EmptyStatHero/SuggestedActions/WineFeed가 아래 흐름 | 풀스크린 center → 화면 상단 카드로 재작성. `<LinearGradient colors={[surface, 'rgba(139,26,42,0.18)']} start={{x:0,y:0}} end={{x:1,y:1}} style={{minHeight:220, padding:24, borderRadius:20, gap:14, justifyContent:'center', borderWidth:1, borderColor:currentBorderDefault}}>` |
| a10 | **EmptyStatHero (first-time)** — dashed border 카드 + SVG 4 ellipse cluster (opacity 0.15) + title "아직 마신 와인이 없어요" + hint | **부재** | — | 신규 `src/components/home/empty-stat-hero.tsx`. dashed border + react-native-svg ellipse cluster. 현재는 FirstTimeHome이 풀스크린이라 공간 없음 — a9 수정 후 자연 흐름 |
| a11 | **SuggestedActions (first-time)** — 3 row 버튼 (둘러보기 toast / 추천 입문 toast / 경험 모드 navigate), 우측 ChevronRight | **부재** | — | 신규 `src/components/home/suggested-actions.tsx`. 3 row Pressable. Toast helper (`src/components/shared/toast.tsx` 확인 필요). 키 `home.firstTime.suggest{Tour,Starter,Experience}`, `home.suggestedToast.{tour,starter}` |
| a12 | **AppHeader logo + bell + LevelChip 형태** — title 텍스트 없음, 좌측 WMLogoMark+wordmark "wine·mine" + 우측 Bell+LevelChip — 사양 §2-1 line 60-67, §3-1 | **title 텍스트 노출 + level pill** | `app/(tabs)/index.tsx:57` `<AppHeader title={t('nav.home')} right={headerRight}/>` — title prop으로 "홈" 글자 표시. `src/components/nav/app-header.tsx:17-19`는 page-title 24px Playfair로 title 렌더. 키스크린엔 title 글자 없음. | SCOPE-OUT 일부 (AppHeader 컴포넌트 자체 재작성은 별도 화면 영향) — 본 home 화면 한정 수정: `app/(tabs)/index.tsx`에서 home 진입 시 title 비우거나(""), AppHeader가 home에선 logo만 렌더하도록 `variant="logo"` prop 추가. 단, 영향 범위 확정은 리더 라우팅 권장. |
| a13 | **ScrollView 자체** (heavy/first-time 두 모드 모두) — RefreshControl 필수, contentContainerStyle.paddingBottom 32 | **heavy만 있음 / first-time은 정적 View** | `heavy-home.tsx:26-32` ScrollView+RefreshControl O. `first-time-home.tsx:15-40` 정적 `<View className="flex-1 ...">` — ScrollView 없음 (a9 풀스크린 center 결과) | a9 수정 시 first-time도 ScrollView로 감싸기 (EmptyStatHero/SuggestedActions/WineFeed가 아래 흐름 필요) |
| a14 | **진입 가드** — `mode === 'first-time' && !onboardingComplete` → `router.replace('/onboarding')` — 사양 §1 | **불명** | `app/(tabs)/index.tsx`에 useEffect redirect 코드 없음. 기존 onboarding 흐름이 별도 일층에 있는지 확인 필요 | useEffect로 onboarding 미완료 시 `router.replace('/onboarding')`. `src/lib/onboarded.ts` 활용 |

**소계**: 14개 항목 중 부재/심한 변형이 12개. PASS 항목 0. 키스크린의 핵심 hero 영역(PeakGreeting/DraftNoteResume/MapCameo/HomeCommunityPeek/WineFeed/QuickActions 등)이 통째로 없음. **FAIL 명백**.

---

### (b) Spacing 비율 — **FAIL**

키스크린 verbatim 비율 (사양 §2-1):
- PeakGreeting: padding 18px 20px 0
- DraftNoteResume: margin 14_16_0, padding 12_14
- StatHero grid gap 6 padding 12_16_0
- MapCameo margin 14_16_0, header padding 12_14_0
- HomeCommunityPeek mt 22, card padding 4_14
- RecentNotesStrip mt 18, header padding 0_20_8, scroll padding 0_16_4 gap 10
- WineFeed mt 24, header padding 0_20_8, list padding 0_16 gap 8
- QuickActions mt 18, grid padding 0_16 gap 12
- FirstTimeGreeting margin 8_16_0, padding 24 gap 14 minHeight 220

| # | 위치 | 현재 RN | 기대 (사양·키스크린) | 수정 |
|---|---|---|---|---|
| b1 | `heavy-home.tsx:28` ScrollView contentContainerStyle | `paddingHorizontal:16, paddingTop:8, paddingBottom:24` — 모든 자식이 horizontal padding 16 inherit | 키스크린은 섹션마다 padding이 다름 (PeakGreeting 20px, StatHero 16px, RecentNotesStrip header 20px / scroll 16px). 글로벌 horizontal 16은 PeakGreeting과 SectionHeader 좌우 20을 못 표현 | ScrollView contentContainerStyle은 `paddingHorizontal:0` (또는 0_0_0_0) — 각 섹션이 자체 padding 관리 |
| b2 | `heavy-home.tsx:33,38` 인사말 + 섹션 간격 | `<View className="px-2 py-3">` 인사말 + `<View className="mt-6 gap-6">` 섹션 wrapper (mt 24, gap 24) | 키스크린: PeakGreeting pt 18 + DraftNoteResume mt 14 + StatHero pt 12 + MapCameo mt 14 + Community mt 22 + Recent mt 18 + Feed mt 24 + Spacer 12 + QuickActions mt 18 — 섹션마다 다른 간격 | 글로벌 `gap-6` 제거. 섹션별 mt-{14|18|22|24} 직접 명시 (NW 임의값 또는 style 인라인) |
| b3 | `recent-notes-section.tsx:75` 카드 간 gap | `mt-3 gap-3` (12px) 세로 | 가로 strip gap 10 + 카드 width 200 + paddingHorizontal 16 + paddingBottom 4 | a6 수정 시 함께 |
| b4 | `cellar-summary-section.tsx:18,22` cell card padding | `px-4 py-4` (16px 양쪽) — 단일 카드 row | 키스크린 QuickActions 카드: padding 14_16 minHeight 86 (2-col grid의 카드) | a8 수정 시 함께 |
| b5 | `first-time-home.tsx:16,32` 풀스크린 padding | `flex-1 items-center justify-center px-6` (px 24) — 키스크린의 카드 구조 자체 부재 | margin 8_16_0, padding 24, gap 14 (수직), minHeight 220, justify-center | a9 수정 시 함께 |
| b6 | `first-time-home.tsx:23,26,29,32` 텍스트 마진 | `mt-6 / mt-3 / mt-2 / mt-8` | 키스크린은 gap 14 (gap 단일) — 모든 텍스트가 같은 간격 | gap-14 wrapper로 단순화 (a9 수정 시) |
| b7 | `app-header.tsx:14-15` 헤더 padding | `px-4`(16px) + `paddingTop: insets.top, height: insets.top+56` (height 56) | 키스크린 padding 12_20_14 (px 20, pt 12, pb 14, 별도 height 명시 없음) | SCOPE-OUT (AppHeader 자체 재작성은 다른 화면도 영향) — 단, home에서 비율 비교 시 명백 차이 |

**소계**: 7개 차이 모두 FAIL. 모든 위치의 spacing이 키스크린 비율 보존 못 함.

---

### (c) Gradient 방향·깊이 — **FAIL**

키스크린 home에서 사용되는 gradient:
- DraftNoteResume bg: `linear-gradient(135deg, rgba(139,26,42,0.45) 0%, surface 100%)` — heavy 모드
- FirstTimeGreeting bg: `linear-gradient(135deg, surface 0%, rgba(139,26,42,0.18) 100%)` — first-time 모드
- LevelChip avatar bg: `linear-gradient(135deg, level[L], level[L]+'99')` — 모든 모드
- (BottomNav FAB gradient는 SCOPE-OUT)

| # | 위치 | 현재 RN | 기대 | 수정 |
|---|---|---|---|---|
| c1 | DraftNoteResume bg | **gradient 자체 부재** (컴포넌트 부재 — a2 참조) | `<LinearGradient colors={['rgba(139,26,42,0.45)', currentSurface]} start={{x:0,y:0}} end={{x:1,y:1}}>` (start/end = 135deg) | a2 수정 시 함께 |
| c2 | FirstTimeGreeting bg | **gradient 부재**: `first-time-home.tsx:17-20` `className="items-center justify-center rounded-full bg-surface"` 단색 surface 원형 (Wine icon 배경) — 그러나 외곽 카드 자체는 없음 | `<LinearGradient colors={[currentSurface, 'rgba(139,26,42,0.18)']} start={{x:0,y:0}} end={{x:1,y:1}} style={{borderRadius:20, padding:24, minHeight:220}}>` | a9 수정 시 함께. design-tokens.ts.gradients에 신규 키 `firstTimeGreeting.{dark,light}` 추가 (사양 §9) |
| c3 | LevelPill (AppHeader 우측 우리 구현) | `LevelPill level={levelId} size="md"` — gradient 없을 가능성 (LevelPill 소스 미확인 — 직접 검증 필요) | LevelChip avatar 원형은 135deg gradient `[level[L], level[L]+'99']` | SCOPE-OUT 일부 (AppHeader 영향 큼) — LevelPill 별도 검증 권장. |
| c4 | bottle-shelf gradient (WineFeedRow / RecentNotesStrip bottle 배경) | **부재** (WMBottle 자체 부재) | WMBottle SVG는 bottle 자체에 다중 stop gradient — sketch 사양 §3-7 line 281 ("react-native-svg port") | shared 포팅 시 동반 — 본 home 화면 한정 deferred |

**소계**: 4개 항목 중 사용해야 할 gradient 모두 부재. design-tokens.ts.gradients에 home 관련 `draftResume.{dark,light}`, `firstTimeGreeting.{dark,light}`, `levelChip.L1..L5` 키 신규 (사양 §9 line 805-813). **infra-architect P0 토큰 세션 트리거 필요**.

---

### (d) Corner radius — **FAIL**

키스크린 home radius (사양 §2-1):
- DraftNoteResume / MapCameo / HomeCommunityPeek card / QuickActions card: 14
- StatHero card / RecentNotesStrip card / WineFeed row / SuggestedActions button: 12
- FirstTimeGreeting outer: 20
- EmptyStatHero: 16
- LevelChip / CTA pill: 9999 (full)

| # | 위치 | 현재 RN | 기대 | 수정 |
|---|---|---|---|---|
| d1 | `cellar-summary-section.tsx:22` cellar 카드 | `rounded-xl` (12px) — NW v4 기본 | QuickActions 카드는 14px (사양 §2-1 line 153) | tailwind.config.ts에 `borderRadius: { '14': '14px', '20': '20px' }` 또는 `style={{borderRadius:14}}` 인라인. 사양 §9 line 770-776 P0 요청. |
| d2 | `recent-notes-section.tsx:36` 노트 카드 | `rounded-xl` (12) | RecentNotesStrip 카드 12 — 일치하지만 a6 가로 변환 후 같은 12 유지 | 유지 OK (재작성 시 12 보존) |
| d3 | `recent-notes-section.tsx:39-46` 병 placeholder | `borderRadius: 6` (사각형 — 56×80) | 키스크린은 WMBottle SVG 자체 (radius 없음, 병 모양) | 본 화면 한정 — WMBottle 포팅 시 사라짐 (SCOPE deferred) |
| d4 | `first-time-home.tsx:18` Wine icon circle | `rounded-full` (9999) — 단, 외곽 카드 자체 부재 | FirstTimeGreeting outer radius 20 | a9 수정 시 함께. tailwind `rounded-[20px]` 또는 `style={{borderRadius:20}}` |
| d5 | DraftNoteResume / MapCameo / HomeCommunityPeek 카드 모두 14 | **컴포넌트 부재** | 14 | 신규 컴포넌트 작성 시 `borderRadius:14` (NW 키 없으므로 인라인 또는 `rounded-[14px]`) |
| d6 | EmptyStatHero | **부재** | 16 (`rounded-2xl`) | NW `rounded-2xl` 사용 |

**소계**: 6개 항목 중 d2 부분 OK, 나머지 5개 FAIL. **14 / 20 radius 토큰 부재 — tailwind.config.ts 확장 또는 인라인 필요**.

---

### (e) Typography 위계 — **FAIL**

키스크린 home 위계 (사양 §2-1, §9):
- PeakGreeting question: Playfair 22 / lh 27.5 / ls -0.22 (사양 §9 신규 토큰 `peakGreetingQuestion`)
- FirstTimeGreeting headline: Playfair 28 / lh 33.6 (신규 `firstTimeHeadline`)
- MapCameo title: Playfair 14 (신규 `mapCameoTitle`)
- HomeCommunityPeek h2: Playfair 17 / lh 20.4 (신규 `communityPeekTitle`)
- WineFeed h2: Playfair 18
- StatHero value: Playfair 20 / lh 22 / ls -0.4
- WineFeedRow wine name: Playfair 15 / lh 18
- RecentNotesStrip wine name: Playfair 12 / lh 15
- DraftNoteResume title: Inter 12 600 / lh 15.6
- QuickActions title: Inter 14 600
- QuickActions sub: Inter 12 (card-meta)
- SuggestedActions button: Inter 14 500
- eyebrow (PeakGreeting/Community/RecentNotes): Inter 10 500 gold ls 1.8 UPPER
- meta / date: Inter 9~11 text-muted

토큰 매핑 검증:
- 기존 design-tokens.ts.typography에 `pageTitle(24)`, `cardTitle(16)`, `emptyTitle(22)`, `sectionTitle(14ls0.56UPPER)`, `cardBody(13)`, `cardMeta(12)` 만 존재
- **부재**: Playfair 28 / 22 / 20 / 18 / 17 / 15 / 12 / Inter 14 600 / Inter 10 500 ls 1.8 UPPER 등 — 사양 §9 line 779-788 신규 토큰 5종 요청

| # | 위치 | 현재 RN | 기대 | 수정 |
|---|---|---|---|---|
| e1 | `heavy-home.tsx:34` 인사말 | `font-playfair text-page-title` (24px Playfair) | 키스크린엔 인사말 자체 부재 (PeakGreeting이 그 자리 점유). 24px 한 줄 인사말 → 위계상 PeakGreeting hero (22px Playfair animated)와 충돌 | a1 수정 시 인사말 컴포넌트 제거, PeakGreeting으로 대체 |
| e2 | `cellar-summary-section.tsx:15,27` 섹션 타이틀 + cell text | 섹션 타이틀 `font-inter text-section-title ... uppercase` (Inter 14 ls 0.56 UPPER) + cell text `font-inter-semibold text-card-title` (Playfair 16 — fontFamily playfair 아님? class semibold + size card-title 충돌). | QuickActions 카드 title은 `Inter 14px 600 cream` (사양 §3-9). 섹션 타이틀은 키스크린엔 없음 (QuickActions는 별도 SectionHeader 없이 mt 18로 흐름) | a8 수정 시 섹션 타이틀 제거. cell title은 `font-inter-semibold text-[14px]` |
| e3 | `recent-notes-section.tsx:67,71` 섹션 타이틀 + empty | `font-inter text-section-title ... uppercase` (Inter 14 ls 0.56 UPPER) + empty `font-inter text-card-body text-text-muted` (Inter 13 / lh 19.5) | 키스크린 RecentNotesStrip은 eyebrow Inter 10 500 gold UPPER + h2 Playfair 17 cream — **두 줄 위계**. 섹션 타이틀 1줄 + uppercase ls 0.56이 아닌, eyebrow(10)+title(17 Playfair) 2단 hero | a6 수정 시 SectionHeader 컴포넌트로 (eyebrow + h2 2-line). empty 상태는 키스크린 verbatim상 미렌더 (사양 §4 empty 변형) |
| e4 | `recommended-placeholder.tsx:8,12` 섹션 타이틀 + 본문 | 동일 `text-section-title uppercase` + `text-card-body` | WineFeed h2 Playfair 18 + subtitle Inter 11 muted | a7 수정 시 — SectionHeader 패턴(eyebrow 없이 h2 + subtitle 우측) |
| e5 | `first-time-home.tsx:23,26,29` 텍스트 위계 | eyebrow `text-card-meta uppercase` (12px) + title `text-empty-title` (Playfair 22 / lh 28.6) + desc `text-card-body` (13 / lh 19.5) | 사양: eyebrow Inter 13 text-secondary (UPPER 아님) + headline Playfair 28 / lh 33.6 + sub Inter 14 text-muted | 위계 모두 작음. eyebrow 12→13, uppercase 제거. headline 22→28, lh 28.6→33.6. sub 13→14 |
| e6 | `app-header.tsx:17` title | `font-playfair text-page-title` (24 Playfair) — "홈" 글자 표시 | 키스크린 home AppHeader엔 title 글자 없음 (logo만) | SCOPE-OUT 일부 — 본 home 호출자에서 title prop 제거 또는 빈 문자열로 |
| e7 | LevelPill text (AppHeader 우측) + display name Text | `font-inter text-card-meta` (12) display name | 키스크린 LevelChip은 Inter 11 600 ls 0.04em + L{n} 텍스트만. display name은 LevelChip 안에 없음 (별도 라벨 부재) | SCOPE-OUT (AppHeader 자체) |

**소계**: 7개 위계 항목 중 5개 위계 깨짐. 신규 typography 토큰 5종 필요 (사양 §9 line 779-788). Playfair Italic 폰트 미로드 (PeakGreeting wine name italic용 — 사양 §9 line 794).

---

### (f) Color 사용 — **PASS (조건부 — 하드코딩 없음 + 토큰 사용 OK / 단 부재 요소 색은 평가 불가)**

검증:
- `app/(tabs)/index.tsx`: `bg-bg-deepest dark:bg-bg-deepest` (토큰), `brand.gold` for ActivityIndicator (토큰)
- `heavy-home.tsx`: `bg-bg-deepest dark:bg-bg-deepest`, `text-page-title text-text-primary dark:text-text-primary`, `brand.gold` for RefreshControl
- `first-time-home.tsx`: `bg-surface`, `text-text-muted dark:text-text-muted`, `text-text-primary dark:text-text-primary`, `text-text-secondary dark:text-text-secondary`, `brand.gold`
- `cellar-summary-section.tsx`: `text-text-secondary`, `bg-surface`, `text-text-primary`, `brand.gold`
- `recent-notes-section.tsx`: `text-text-secondary`, `bg-surface`, `text-text-muted` + `bottleColor` (lwin.ts 기반 = bottle_color hex 허용, design-tokens.ts에서 import) + `text-text-primary`
- `recommended-placeholder.tsx`: `text-text-secondary`, `bg-surface`, `text-text-muted`

| # | 위치 | 평가 |
|---|---|---|
| f1 | 하드코딩 hex (design-tokens.ts·tailwind.config.ts·lwin.ts 외) | **검출 0건** — 전 5개 컴포넌트 + index.tsx + app-header.tsx grep 결과 모두 토큰 사용 |
| f2 | `recent-notes-section.tsx:43` bottleColor inline style backgroundColor | `getDefaultBottleColor(asTypeCanonical(...))` → `bottleColorDefault[type]` (design-tokens.ts 토큰) + `wine.bottle_color` (DB 컬럼, lwin.ts 허용) — **PASS** |
| f3 | dark/light dual 토큰 사용 | 모든 색 className에 `dark:bg-X` `dark:text-X` 형태로 dual 명시 — NW v4 darkMode:'class' 패턴 준수 — **PASS** |
| f4 | brand.gold / brand.wineRed 사용 | RefreshControl tintColor, lucide-react-native icon color, ActivityIndicator color 모두 `brand.gold` (토큰) — **PASS** |
| f5 | 신규 컴포넌트 추가 시 사용해야 할 색 | wineRed alpha 0.18/0.45/0.55, goldAlpha 0.12, `#2D1540` (대륙 silhouette) — design-tokens.ts에 부재. **사양 §9 line 758-764 P0 토큰 확장 요청** (현재 본 화면 구현엔 이들 색 사용처 자체가 부재 — 신규 컴포넌트 작성 전 토큰 확보 필요) |
| f6 | light 모드 검증 | 본 화면 RN 코드는 모든 색이 dual-mode 토큰 사용 → light 모드 자동 적용 OK. 단, 부재 요소(DraftNoteResume/MapCameo/MiniMapPreview의 #2D1540 등)는 light에서 가독성 검토 필요 (사양 §4 line 419) — 현재 코드 한정 light 검증은 PASS |

**소계**: 현재 6개 파일 코드 한정으로 **color 사용 PASS** — 모든 색이 design-tokens.ts·tailwind.config.ts·lwin.ts 토큰 경유, dark/light dual 명시, brand.gold/wineRed 토큰 참조. **단, 부재 요소(a1~a11)를 신규 작성할 때 wineRed alpha / goldAlpha / `#2D1540` 토큰 부재 → infra-architect 확장 사전 필요** (이 항목은 부재 요소 작성 후 재검증).

---

## 2. 다크/라이트 양쪽 모드

- [ ] dark 모드 시뮬레이터 캡처 일치 — **현재 RN 구현 자체가 키스크린 home 8/4 섹션 구조의 ~5~10%만 표현**. 양쪽 모드 캡처 자체가 무의미한 단계 (요소 누락이 압도적). dark/light 토글 시 색 깨짐은 없을 것(토큰 사용 OK)으로 추정.
- [ ] light 모드 일치 — 동일.

**a1~a11 수정 후 4 조합(dark+ko / dark+en / light+ko / light+en) 캡처 재검증 필수** (사양 §10 line 890).

---

## 3. 멀티모달 스크린샷 비교

- 키스크린: `_workspace/keyscreen-shots/home.png` (heavy dark ko) — 한 스크롤 안에 8섹션 모두 보임
- 현재 RN: heavy 모드 인사말(24px Playfair 1줄) + 최근 노트 세로 3개 + 셀러 카드 1개 + "Coming soon" 1줄 = 4 요소만
- 시각 갭: **압도적**. 키스크린의 hero(PeakGreeting + DraftNoteResume + StatHero + MapCameo) 영역 자체가 부재. 키스크린은 정보 밀도가 매우 높은 dense hero (info-rich) — 현재 RN은 미니멀 mock state.

---

## 4. 결정

### 결과: **FAIL** (6항목 중 5 FAIL — a/b/c/d/e, f만 조건부 PASS)

### 부재/심한 변형 항목 카운트 (SCOPE-OUT 제외)
- 요소 누락 (a): 11개 (a1~a11) FAIL + a14 진입 가드 1개 = 12 (a12, a13은 다른 항목과 동반 수정)
- spacing 비율 (b): 6개 (b1~b6, b7은 SCOPE-OUT)
- gradient (c): 3개 (c1, c2 명확 FAIL; c4 deferred; c3 SCOPE-OUT)
- radius (d): 5개 (d1, d4, d5, d6; d2 부분 OK; d3 deferred)
- typography (e): 5개 (e1~e5; e6/e7 SCOPE-OUT)
- color (f): 0개 본 화면 한정 PASS (단 신규 작성 시 5개 색 토큰 사전 필요)

### 라우팅

1. **rn-screen-builder** (본 화면 작업 주체) — 위 §1 (a)~(e) 모두 수정. 단, **infra-architect 토큰 확장 P0 세션 선행 권장** (아래 2번 완료 후 시작):
   - 11개 신규 컴포넌트 (PeakGreeting, DraftNoteResume, StatHero, MapCameo, MiniMapPreview, HomeCommunityPeek, RecentNotesStrip-rewrite, WineFeed + WineFeedRow, QuickActions, FirstTimeGreeting-rewrite, EmptyStatHero, SuggestedActions)
   - heavy-home.tsx / first-time-home.tsx 전체 재작성 (사양 §2 트리 verbatim)
   - recent-notes-section.tsx 가로 strip 재작성 + 0개 시 미렌더
   - cellar-summary-section.tsx → QuickActions 4 카드로 흡수 (deprecate)
   - recommended-placeholder.tsx → WineFeed로 대체 (deprecate)
   - app/(tabs)/index.tsx: AppHeader `title=""` 또는 home variant + onboarding redirect useEffect
   - 사양 §11 P0 범위(시각만 맞춤, 데이터는 mock)로 1차 작업 권장 — alpha 압박

2. **infra-architect** (P0 토큰 확장 — rn-screen-builder 작업 시작 전 필수):
   - design-tokens.ts.gradients: `draftResume.{dark,light}`, `firstTimeGreeting.{dark,light}`, `levelChip.L1..L5` 5종 신규
   - design-tokens.ts.typography: `peakGreetingQuestion(Playfair 22/27.5/-0.22)`, `firstTimeHeadline(Playfair 28/33.6)`, `mapCameoTitle(Playfair 14)`, `communityPeekTitle(Playfair 17/20.4)`, `homeMicroMeta(Inter 9/10)` 5종 신규
   - design-tokens.ts: alpha helper 함수 `withAlpha(brand.wineRed, 0.18)` 패턴 또는 `wineRedAlpha.{18,45,55}`, `goldAlpha.12` 토큰
   - design-tokens.ts: `mapDark.continent` = `#2D1540` 신규 토큰
   - tailwind.config.ts: `borderRadius: { '14px':'14px', '20px':'20px' }` (또는 NW 임의값 `rounded-[14px]` 패턴 허용)
   - tailwind.config.ts.fontSize: 위 typography 5종 키 추가
   - `app/_layout.tsx` useFonts에 `PlayfairDisplay_400Regular_Italic` 추가
   - `src/lib/use-theme-tokens.ts` 신규 헬퍼 (LinearGradient colors / SVG fill에서 useColorScheme 분기용)

3. **design-spec-author** (사양 명확화 — 미해결 질문 §12):
   - Q1 BottomNav 5 tabs 구성 — SCOPE-OUT 항목이지만 home의 footer 영향 → 리더 결정 후 사양 반영
   - Q3 featured wines 데이터 소스 — mock vs supabase featured 컬럼
   - Q4 community posts mock 노출 — 핵심 섹션이라 결정 시급
   - Q5 draft note "bgy-puligny-montrachet 90%" mock 유지 여부
   - Q7 9px/10px micro text a11y — verbatim vs 11px 상향

4. **supabase-engineer** (P1 — alpha 후 가능):
   - profile.stats RPC/view 신규 (winesTasted/countriesExplored/regionsExplored/cellarCount 집계)
   - featured wines (mock 유지 결정 시 불필요)

5. **리더** (P0 결정):
   - Q1 BottomNav 5 tabs 구성 (community 추가 / settings 이동) — 본 home 검증과 직결되진 않지만 다음 검증 라운드 전 결정 필요
   - rn-screen-builder 작업 우선순위 (P0 alpha vs 전체 spec verbatim) — Day 6/7 압박과 trade-off

### 재검증 시점

infra-architect P0 토큰 확장 완료 → rn-screen-builder 11 신규 컴포넌트 + 2 재작성 완료 → 본 보고서 동일 6항목 + dark/light 4 조합 캡처 재실행 → PASS 시 qa-inspector로.

---

## 5. 보고서 메타

- author: design-reviewer
- 작성일: 2026-05-20 16:46:09 (Day 6 retroactive)
- 입력 read: 사양 1개(972 lines), RN 7 파일, 키스크린 스크린샷 1개(home.png), design-tokens.ts, tailwind.config.ts, app-header.tsx
- 비교 방식: 사양 §2 verbatim 트리 + §11 retroactive diff 표 + 스크린샷 멀티모달
- FAIL 항목 합계 (SCOPE-OUT 제외): 12(a) + 6(b) + 3(c) + 5(d) + 5(e) = **31 FAIL 포인트** (6항목 중 5 FAIL, f는 본 코드 한정 PASS)
- 결론: **전체 FAIL** — qa-inspector로 진행 불가. rn-screen-builder 광범위 작업 필요. infra-architect 토큰 P0 선행.
