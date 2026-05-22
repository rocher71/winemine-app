# Home Tab — Component Catalog

> 홈 탭(`app/(tabs)/index.tsx`) 컴포넌트 목록 및 사용 설명서.
> 마지막 업데이트: 2026-05-22

---

## 목차

1. [화면 진입점](#1-화면-진입점)
2. [레이아웃 컨테이너](#2-레이아웃-컨테이너)
3. [헤더 컴포넌트](#3-헤더-컴포넌트)
4. [섹션 컴포넌트 — heavy 전용](#4-섹션-컴포넌트--heavy-전용)
5. [섹션 컴포넌트 — 공용](#5-섹션-컴포넌트--공용)
6. [원자 컴포넌트 (홈 전용)](#6-원자-컴포넌트-홈-전용)
7. [공유 컴포넌트 (홈에서 사용)](#7-공유-컴포넌트-홈에서-사용)
8. [미사용 파일 (dead code)](#8-미사용-파일-dead-code)
9. [재사용 기회 분석](#9-재사용-기회-분석)

---

## 1. 화면 진입점

### `app/(tabs)/index.tsx`

홈 탭 루트 화면. 사양 home.md §1.

**역할**
- `useProfile()` 훅으로 프로필 로드
- 온보딩 완료 여부 체크 후 미완료 시 `/onboarding` 리다이렉트
- `mode` 에 따라 `HeavyHome` / `FirstTimeHome` 분기
- 로딩 중: `HomeHeader(first-time fallback)` + `ActivityIndicator`

**내부 헬퍼**

| 함수 | 설명 |
|---|---|
| `toLevelId(level)` | `number` → `1\|2\|3\|4\|5` 클램프 |
| `initialOf(name)` | 표시명의 첫 글자 추출 (한글/영문 공통) |

---

## 2. 레이아웃 컨테이너

### `src/components/home/heavy-home.tsx` — `HeavyHome`

heavy 모드 8-섹션 ScrollView 컨테이너. 사양 home.md §2-1.

**Props**

| prop | type | 설명 |
|---|---|---|
| `displayName` | `string` | 익명화된 표시명 (예: 벨벳폭스) |

**섹션 순서**

```
PeakGreeting → [DraftNoteResume] → StatHero → MapCameo →
HomeCommunityPeek → RecentNotesStrip → WineFeed → [spacer 12] → QuickActions
```

> `DraftNoteResume`는 현재 `null` (draft 시스템 v0.2.0 예정).

**데이터 훅**: `useRecentNotes(8)`, `useCellarSummary()`  
**RefreshControl**: gold tint, 두 훅 동시 refresh

---

### `src/components/home/first-time-home.tsx` — `FirstTimeHome`

first-time 모드 4-섹션 ScrollView 컨테이너.

**Props**

| prop | type | 설명 |
|---|---|---|
| `displayName` | `string` | 익명화된 표시명 (현재 사용 안 함) |

**섹션 순서**

```
StatHero(0/0/0) → MapCameo(empty) → HomeCommunityPeek → WineFeed
```

> heavy와 동일한 섹션을 공용으로 사용. 통계는 모두 0.

---

## 3. 헤더 컴포넌트

### `src/components/home/home-header.tsx` — `HomeHeader`

홈 전용 헤더. AppHeader(다른 화면 공용)와 별개. 사양 home.md §3-1.

**Props**

| prop | type | 기본값 | 설명 |
|---|---|---|---|
| `mode` | `'heavy' \| 'first-time'` | — | 우측 아바타 타입 결정 |
| `levelId` | `1\|2\|3\|4\|5` | — | LevelChip에 전달 |
| `displayInitial` | `string` | — | 아바타 이니셜 |
| `unreadNotifications` | `boolean` | `false` | 벨 아이콘 읽지않은 알림 dot |

**레이아웃**
- `bg-bg-deep` / `paddingTop = insets.top + 12` / `paddingBottom 14` / `paddingHorizontal 20`
- Left: `WMLogoMark` + `WMLogoWordmark`
- Spacer: `flex: 1`
- Right: `BellButton` + (`LevelChip` | `FirstTimeAvatar`)

**내부 컴포넌트 (이 파일에만 존재)**

| 컴포넌트 | 설명 |
|---|---|
| `BellButton` | 벨 아이콘 버튼 (36×36, theme-aware 색상). v0.1.0은 onPress no-op. `nav/bell-button.tsx`와 별도 구현 |
| `FirstTimeAvatar` | first-time 모드 아바타 (36×36 wine-red circle, cream initial). `/settings` 로 이동 |

> `WMLogoMark`, `WMLogoWordmark`는 `src/components/shared/`로 분리됨 (아래 §7 참조).

---

## 4. 섹션 컴포넌트 — heavy 전용

### `src/components/home/peak-greeting.tsx` — `PeakGreeting`

heavy 모드 상단 인사말 (5초마다 문구 회전). 사양 home.md §3-2.

**Props**

| prop | type | 기본값 | 설명 |
|---|---|---|---|
| `name` | `string` | — | 표시명 |
| `wines` | `string[]` | `[]` | 정점 와인 목록. 비어 있으면 fallback 문구만 |

**동작**
- Reanimated `FadeInDown` (450ms, springify) / `FadeOutUp` 전환
- `wines.length > 0`이면 5초마다 `idx++` 순환

> v0.1.0: `wines=[]` (supabase peak wines 데이터 없음). v0.2.0 P2.

---

### `src/components/home/draft-note-resume.tsx` — `DraftNoteResume`

이어 쓰기 카드 (LinearGradient wineRed). 사양 home.md §3-3.

**Props**

| prop | type | 설명 |
|---|---|---|
| `shortWineName` | `string` | 카드에 표시할 와인 단축 이름 |
| `progressPct` | `number` | 작성 진행률 (0-100) |
| `wineLwin` | `string?` | `/notes/new/write?wineLwin=` 쿼리에 사용 |

> v0.1.0: `HeavyHome`에서 `null` 처리로 렌더링 안 됨. draft 시스템 구현 후 활성화.

---

### `src/components/home/recent-notes-strip.tsx` — `RecentNotesStrip`

가로 snap 스크롤 노트 카드 (heavy 전용). 사양 home.md §3-7.

**Props**

| prop | type | 설명 |
|---|---|---|
| `notes` | `TastingNoteWithWine[]` | 최대 8개 렌더. 0개이면 `null` 반환 |

**내부 컴포넌트**

| 컴포넌트 | 설명 |
|---|---|
| `NoteCard` | 200×\* snap 카드. `WMBottle(26×86)` + 와인명/날짜/`WMGlassRating` |

> `NoteCard`가 `recent-notes-section.tsx`에도 동명 컴포넌트 존재 (별도 구현, 현재 dead code).

---

### `src/components/home/quick-actions.tsx` — `QuickActions`

heavy 모드 하단 2×2 바로가기 카드. 사양 home.md §3-9.

**Props**

| prop | type | 기본값 | 설명 |
|---|---|---|---|
| `cellaredCount` | `number` | — | 셀러 와인 수 |
| `regionsCount` | `number` | `0` | 방문 지역 수 |
| `favoritesCount` | `number` | `0` | 즐겨찾기 수 |
| `badgesOwned` | `number` | `0` | 획득 배지 수 |
| `badgesTotal` | `number` | `12` | 전체 배지 수 |

**내부 컴포넌트**

| 컴포넌트 | 설명 |
|---|---|
| `ActionCard` | 아이콘 + 제목 + 부제 카드. `flexBasis: '48%'` outer View + Pressable 2-layer (§4-11) |

---

## 5. 섹션 컴포넌트 — 공용

아래 섹션 컴포넌트들은 `HeavyHome`과 `FirstTimeHome` 양쪽에서 사용됩니다.

### `src/components/home/stat-hero.tsx` — `StatHero`

3-열 통계 카드 (국가 / 와인 / 노트). 사양 home.md §3-4.

**Props**

| prop | type | 설명 |
|---|---|---|
| `countries` | `number` | 방문 국가 수 |
| `wines` | `number` | 시음 와인 수 |
| `notes` | `number` | 작성 노트 수 |

**내부 컴포넌트**

| 컴포넌트 | 설명 |
|---|---|
| `StatCard` | `value` (Playfair 20) + `label` (Inter 10 text-muted). `bg-surface` / `border-default` / `radius 12` |

> v0.1.0: 실 데이터 없음. `HeavyHome`은 notes hook에서 계산, `FirstTimeHome`은 `0/0/0` 고정.

---

### `src/components/home/map-cameo.tsx` — `MapCameo`

와인 세계 지도 미리보기 카드. 사양 home.md §3-5.

**Props**

| prop | type | 설명 |
|---|---|---|
| `countries` | `number` | 방문 국가 수 |
| `regions` | `number` | 방문 지역 수 |

**동작**: 탭 시 `/(tabs)/map` 이동. v0.1.0 route 미존재, 에러 무시.

**내부 컴포넌트**

| 컴포넌트 | 설명 |
|---|---|
| `MiniMapPreview` (`mini-map-preview.tsx`) | 320×100 SVG 지도 실루엣 + 방문지 dot |

---

### `src/components/home/home-community-peek.tsx` — `HomeCommunityPeek`

팔로잉의 새 노트 카드 (heavy + first-time 공용). 사양 home.md §3-6.

**Props**: 없음 (v0.1.0 mock 데이터 내장)

**레이아웃**
- SectionHeader (eyebrow "커뮤니티" gold UPPER + title Playfair 17 + "모두 보기" action)
- `bg-surface` 카드 안에 `PostRow` × 2

**내부 컴포넌트**

| 컴포넌트 | 설명 |
|---|---|
| `PostRow` | `CommUserAvatar(32)` + `PostTypeBadge` + author/ago + title 2줄 + wine/message count |

**의존 공유 컴포넌트**
- `CommUserAvatar` (`src/components/community/`)
- `PostTypeBadge` (`src/components/community/`)

---

### `src/components/home/wine-feed.tsx` — `WineFeed`

와인 둘러보기 (heavy + first-time 공용). 사양 home.md §3-8.

**Props**: 없음 (v0.1.0 mock 데이터 내장)

**레이아웃**
- SectionHeader (Playfair 18 heading + Inter 11 muted subtitle)
- 가로 스크롤 `TabChip` 바 (featured / trending / explore)
- `WineFeedRow` 세로 목록

**의존 컴포넌트**

| 컴포넌트 | 파일 |
|---|---|
| `TabChip` | `src/components/home/tab-chip.tsx` |
| `WineFeedRow` | `src/components/home/wine-feed-row.tsx` |

---

## 6. 원자 컴포넌트 (홈 전용)

### `src/components/home/tab-chip.tsx` — `TabChip`

탭 전환 chip (아이콘 + 텍스트, active/inactive 상태). `WineFeed`에서 사용.

**Props**

| prop | type | 설명 |
|---|---|---|
| `active` | `boolean` | gold border + bg / muted 상태 전환 |
| `Icon` | `LucideIcon` | lucide 아이콘 컴포넌트 |
| `label` | `string` | 탭 레이블 |
| `onPress` | `() => void` | 탭 핸들러 |

> 재사용 후보: 커뮤니티 탭, 셀러 탭 등 아이콘 탭이 필요한 모든 화면.

---

### `src/components/home/wine-feed-row.tsx` — `WineFeedRow`

와인 피드 카드 행. `WineFeed` 리스트 아이템.

**Props**

| prop | type | 설명 |
|---|---|---|
| `wine` | `MockWine` | 와인 데이터 객체 |

**레이아웃**: `[bottle 96] [meta flex-1] [rating+price minWidth 76]`  
**§4-11 패턴**: Pressable(hit+opacity) > inner View(layout/visual, inline style만)

**Exports**

| export | 설명 |
|---|---|
| `WineFeedRow` | 컴포넌트 |
| `MockWine` | 타입 (실 데이터 연결 시 `wine_metadata` row 타입으로 교체) |
| `formatKrwShort(krw, locale)` | 가격 단축 포맷 (`38만` / `380K`) |

> 재사용 후보: 와인 검색 결과, 셀러 목록 등 동일 카드 패턴이 필요한 모든 화면.

---

### `src/components/home/mini-map-preview.tsx` — `MiniMapPreview`

320×100 SVG 세계 지도 (6 대륙 실루엣 + 14 dot). `MapCameo` 하단에 배치.

**Props**

| prop | type | 기본값 | 설명 |
|---|---|---|---|
| `height` | `number` | `100` | SVG 높이 |

> dot 좌표는 현재 mock 고정. 실 데이터(방문 국가) 연결 시 props로 교체 예정.

---

## 7. 공유 컴포넌트 (홈에서 사용)

### `src/components/shared/wm-logo-mark.tsx` — `WMLogoMark`

브랜드 로고마크 SVG (와인잔 실루엣). `HomeHeader` 좌측에 배치.

**Props**

| prop | type | 기본값 | 설명 |
|---|---|---|---|
| `size` | `number` | `26` | SVG 크기 (정방형) |

> 온보딩, 스플래시 등 브랜드 노출이 필요한 모든 화면에서 재사용 가능.

---

### `src/components/shared/wm-logo-wordmark.tsx` — `WMLogoWordmark`

브랜드 워드마크 ("Wine" cream + "Mine" gold, PlayfairDisplay). `HomeHeader` 좌측에 배치.

**Props**: 없음

> locale 무관, 항상 영문 브랜드 폰트 고정. `allowFontScaling={false}`.

---

### `src/components/shared/level-chip.tsx` — `LevelChip`

레벨 gradient 아바타 + `L{n}` 텍스트 chip. `HomeHeader`(heavy 모드) 우측에 배치.

**Props**

| prop | type | 기본값 | 설명 |
|---|---|---|---|
| `levelId` | `1\|2\|3\|4\|5` | — | 레벨 (gradient 색 결정) |
| `initial` | `string` | — | 아바타 이니셜 |
| `onPress` | `() => void` | `/settings` 이동 | 탭 핸들러 |

**사용처**: `HomeHeader`, 기타 레벨 표시 위치.

---

### `src/components/shared/wm-bottle.tsx` — `WMBottle`

와인 병 SVG 일러스트. `WineFeedRow`, `NoteCard`, `WineHero`, `CellarCard` 등에서 공용.

**Props**

| prop | type | 설명 |
|---|---|---|
| `width` / `height` | `number` | SVG 크기 |
| `bottleColor` | `string?` | 병 색상 (null이면 type 기본값) |
| `type` | `TypeCanonical?` | red/white/rose 등 |
| `producer` / `label` / `vintage` | `string?` | 라벨 영역 텍스트 (WineHero에서만 사용) |

**사용처**: `RecentNotesStrip.NoteCard(26×86)`, `WineFeedRow(90×150)`, `wine-detail WineHero(88×290)`, `cellar CellarCard`, `notes cellar-bottom-sheet`

---

### `src/components/shared/wm-glass-rating.tsx` — `WMGlassRating`

와인 잔 아이콘 기반 평점 표시. `WineFeedRow`, `NoteCard` 등에서 공용.

**Props**

| prop | type | 설명 |
|---|---|---|
| `value` | `number` | 0-5 평점 (half-step 지원) |
| `size` | `number` | 잔 아이콘 크기 |

---

### `src/components/shared/wine-name-display.tsx` — `WineNameDisplay`

로케일 기반 와인 이름 표시. `ko` 시 `name_ko` 우선, `en` 시 `display_name`.

**Props**

| prop | type | 설명 |
|---|---|---|
| `lwin` | `string` | LWIN (key) |
| `name_ko` | `string?` | 한글 이름 |
| `display_name` | `string` | 기본 표시명 |
| `size` | `'card' \| 'detail'` | 폰트 크기 preset |

**사용처**: `RecentNotesStrip.NoteCard`, `RecentNotesSection.NoteCard`, cellar/notes 등.

---

### `src/components/community/comm-user-avatar.tsx` — `CommUserAvatar`

레벨 gradient 아바타 circle. `HomeCommunityPeek.PostRow`, `community` 화면 등.

**Props**

| prop | type | 기본값 | 설명 |
|---|---|---|---|
| `levelId` | `1\|2\|3\|4\|5` | — | gradient 색 결정 |
| `initial` | `string` | — | 아바타 이니셜 |
| `size` | `number` | `36` | circle 직경 |
| `userId` | `string?` | — | asLink=true 시 라우팅용 |
| `asLink` | `boolean` | `false` | Pressable wrap 여부 |

**패턴**: `asLink=false` (default) → `View` 래핑 (nested Pressable 안전).

---

### `src/components/community/post-type-badge.tsx` — `PostTypeBadge`

포스트 타입 pill badge (note/album/column 등). `HomeCommunityPeek.PostRow`에서 사용.

---

## 8. 미사용 파일 (dead code)

아래 파일들은 현재 어디에서도 import되지 않습니다. 이전 first-time 구성 또는 초기 heavy 구성에서 쓰이다가 대체된 파일입니다.

| 파일 | 원래 역할 | 대체된 것 |
|---|---|---|
| `home/empty-stat-hero.tsx` | first-time용 점선 빈 지도 카드 | `StatHero(0/0/0)` + `MapCameo(empty)` |
| `home/first-time-greeting.tsx` | first-time 환영 카드 (LinearGradient) | `StatHero` 로 대체 (2026-05-21 재구성) |
| `home/recent-notes-section.tsx` | 세로 노트 목록 | `RecentNotesStrip` (가로 snap) |
| `home/cellar-summary-section.tsx` | 셀러 요약 행 | `QuickActions` 카드 내 셀러 항목으로 통합 |
| `home/recommended-placeholder.tsx` | 추천 와인 플레이스홀더 | 미구현 상태로 제거됨 |

> 삭제 전 다른 탭 컴포넌트로 재사용 가능성 검토 권장.  
> `FirstTimeGreeting`은 `gradients.firstTimeGreeting` 토큰을 사용 — 토큰 자체는 살아 있음.

---

## 9. 재사용 기회 분석

> 코드 수정 없이 보고만 합니다. 실제 적용은 해당 탭 작업 시 검토.

### 9-1. SectionHeader 패턴 — 통합 후보

홈 섹션 컴포넌트 3개가 동일한 헤더 구조를 인라인으로 반복합니다:

```tsx
// 반복 패턴: HomeCommunityPeek, RecentNotesStrip, WineFeed 모두
<View style={{ flexDirection: 'row', alignItems: '...', justifyContent: 'space-between',
               paddingBottom: 8, paddingHorizontal: 20 }}>
  <View>
    <Text /* eyebrow: Inter 10 gold UPPER letterSpacing 1.8 */>...</Text>
    <Text /* title: Playfair 17-18 cream */>...</Text>
  </View>
  <Pressable /* "모두 보기" gold action */>...</Pressable>
</View>
```

**제안**: `src/components/shared/section-header.tsx` — `SectionHeader` 컴포넌트.

```tsx
// 예상 인터페이스
interface SectionHeaderProps {
  eyebrow?: string;         // gold UPPER Inter 10, letterSpacing 1.8
  title: string;            // Playfair 17 cream
  action?: string;          // "모두 보기" gold Inter 11 semibold
  onAction?: () => void;
}
```

**영향 범위**: home, notes, community 탭 등 eyebrow+title+action 구조를 쓰는 모든 섹션.

---

### 9-2. BellButton 두 버전 통합 후보

| 위치 | 색상 | unread prop | 동작 |
|---|---|---|---|
| `home-header.tsx` (inline `BellButton`) | `tokens.text.secondary` (theme-aware) | `boolean` | v0.1.0 no-op |
| `nav/bell-button.tsx` (`BellButton`) | `light.text.secondary` (고정) | `number` | `/notifications` 이동 |

**제안**: `nav/bell-button.tsx`를 확장해 `theme-aware` 색상 + `boolean` / `number` 모두 지원하도록 통합. 또는 홈 헤더용을 `home/home-bell-button.tsx`로 분리해 명확성 확보.

---

### 9-3. TabChip — 커뮤니티/셀러 탭에서 재사용

`src/components/home/tab-chip.tsx`의 `TabChip`은 lucide 아이콘 + 텍스트 + active 상태를 갖는 범용 탭 chip입니다.

**재사용 가능 화면**:
- 커뮤니티 탭 상단 (전체/팔로잉/인기)
- 셀러 탭 타입 필터 (red/white/all)
- 노트 목록 상단 필터

아이콘 없이 텍스트만 필요한 경우 `Icon` prop을 optional로 변경하면 더 넓게 쓸 수 있습니다.

---

### 9-4. WineFeedRow — 검색/추천 화면에서 재사용

`src/components/home/wine-feed-row.tsx`의 `WineFeedRow`는 현재 `MockWine` 타입을 사용하지만 레이아웃 자체는 범용입니다.

**재사용 가능 화면**:
- 와인 검색 결과 리스트 (`/search`)
- 내 셀러 목록 (bottle 크기 조정 필요)

`MockWine` 타입을 `wine_metadata` row 타입으로 교체하거나 필드를 구조분해해서 props로 받는 방식으로 일반화할 수 있습니다.

---

### 9-5. StatHero — 프로필 화면에서 재사용

`src/components/home/stat-hero.tsx`의 `StatHero`는 숫자 + 레이블 3-col 카드입니다.

**재사용 가능 화면**:
- `/profile` 화면 사용자 통계 섹션 (국가/와인/노트 동일 구조)

`countries/wines/notes` prop 명칭만 변경하거나, `items: { value, label }[]` 방식으로 일반화하면 프로필에서 그대로 가져다 쓸 수 있습니다.

---

### 9-6. asTypeCanonical 타입 가드 — util 분리

`recent-notes-strip.tsx`와 `recent-notes-section.tsx`에 동일한 `asTypeCanonical` 함수가 중복 정의되어 있습니다.

**제안**: `src/lib/lwin.ts` 또는 `src/lib/wine-utils.ts`에 한 번만 정의.

> `getDefaultBottleColor(type)` 함수는 이미 `src/lib/lwin.ts`에 있으므로, 같은 파일에 추가하는 것이 자연스럽습니다.
