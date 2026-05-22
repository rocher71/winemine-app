# Cellar Components

셀러 리스트 (`/(tabs)/cellar`) 및 셀러 상세 (`/cellar/[lwin]`) 화면에서 사용하는 컴포넌트 카탈로그.

---

## 화면 트리

### 셀러 리스트 `/(tabs)/cellar`

```
AppHeader (nav/)                   title="내 셀러", right= BellButton + LevelChip
  FlatList
    ListHeader
      TitleBar row
        CellarTabs                 cellar | tasted 탭 세그먼트
        AddCta                     "+ 등록" 버튼 (cellar 탭에서만)
      [아이템 있을 때]
        CellarSearchInput          검색바 + X 클리어
        TypeFilterChips            all / red / white / sparkling / rose / fortified
        SortChips                  recent / drinkSoon / vintage / region / storage / price
        ResultCount                "총 N병" / "N병 중 M개 결과" + ClearFilters
    ListEmptyComponent
      [로딩]  ActivityIndicator
      [셀러 비어있음]  EmptyState (shared/) + PrimaryButton (shared/) -> /capture
      [필터 0건]  NoResults
    Item
      CellarCard                   2-col 그리드 카드
        BottleZone LinearGradient
          WMBottle (shared/)
        MetaZone
          TypeDot (inline)
          wine name / producer / vintage
          DrinkWindowBadge
  Toast (shared/)                  addToast 피드백
```

### 셀러 상세 `/cellar/[lwin]`

```
BackHeader (nav/)                  title=wine name, right= DeleteButton
  ScrollView
    CellarHero                     240px 그라데이션 프레임 + 텍스트 메타
      WineLabelArt                 라벨 placeholder (병색 그라데이션 + 이니셜)
    DrinkWindowCard                시음 적기 섹션
      DrinkWindowBadge             5-status pill (peak/opening/mature/too-young/past-peak)
      RangeText                    "YYYY년 ~ YYYY년" (inline)
      DrinkWindowTimeline          5-stop 그라데이션 트랙 + 현재 dot + peak marker
    NotifyToggleCard               절정 알림 토글
      AnimatedSwitch (shared/)     44x26 gold/border-default 애니메이션 스위치
    MetaGrid                       2x2 메타 그리드
      MetaCard x4                  label + value 카드
    NotesSummaryRow (inline)       노트 카운트 + ViewWineDetailsLink
    PrimaryButton x2 (shared/)     편집 / 상태 전환 (Edit / 마심 처리)
  DrinkThisCta                     absolute 하단 고정 CTA (cellared 상태에서만)
    ConfirmDialog (shared/)
  AddToCellarSheet (wine/)         편집 모드 바텀 시트
  Toast (shared/)
```

---

## 컴포넌트 레퍼런스

### CellarTabs
**파일:** `cellar-tabs.tsx`  
**사용처:** `app/(tabs)/cellar.tsx`

| Prop | Type | 설명 |
|------|------|------|
| `value` | `'cellar' \| 'tasted'` | 현재 활성 탭 |
| `onChange` | `(v: CellarTab) => void` | 탭 변경 콜백 |
| `cellarCount` | `number` | 셀러 탭 count 배지 |
| `tastedCount` | `number` | 마신 탭 count 배지 |

active 탭: wine-red bg + cream 텍스트. idle: transparent + text-muted.  
내부 `TabButton`은 파일 내 private 컴포넌트.

---

### AddCta
**파일:** `add-cta.tsx`  
**사용처:** `app/(tabs)/cellar.tsx` (TitleBar, cellar 탭에서만)

| Prop | Type | 설명 |
|------|------|------|
| `onPress` | `() => void` | v0.1.0: toast 표시. v0.2.0: 바텀시트 open |

lucide `Plus` 14 gold + Inter 12 gold 텍스트. border 1px border-default.

---

### CellarSearchInput
**파일:** `cellar-search-input.tsx`  
**사용처:** `app/(tabs)/cellar.tsx`

| Prop | Type | 설명 |
|------|------|------|
| `query` | `string` | 현재 검색어 |
| `onQueryChange` | `(v: string) => void` | 변경 콜백 |

검색 중: X 클리어 버튼 노출. `cellar.clearBtnBg[scheme]`으로 다크/라이트 자동 대응.

---

### TypeFilterChips
**파일:** `type-filter-chips.tsx`  
**사용처:** `app/(tabs)/cellar.tsx`

| Prop | Type | 설명 |
|------|------|------|
| `value` | `TypeFilter` | `'all' \| 'red' \| 'white' \| 'sparkling' \| 'rose' \| 'fortified'` |
| `onChange` | `(v: TypeFilter) => void` | 변경 콜백 |

active: gold border + gold/0.12 bg + gold 텍스트. `TypeDot`(8×8 원형)으로 와인 타입 색 표시.  
`TypeFilter` 타입을 export함 — `cellar-filters.ts`에서 import.

---

### SortChips
**파일:** `sort-chips.tsx`  
**사용처:** `app/(tabs)/cellar.tsx`

| Prop | Type | 설명 |
|------|------|------|
| `value` | `CellarSortKey` | `'recent' \| 'drinkSoon' \| 'vintage' \| 'region' \| 'storage' \| 'price'` |
| `onChange` | `(v: CellarSortKey) => void` | 변경 콜백 |

active: wine-red bg + cream 텍스트. idle: border-default + text-secondary.

---

### ResultCount
**파일:** `result-count.tsx`  
**사용처:** `app/(tabs)/cellar.tsx`

| Prop | Type | 설명 |
|------|------|------|
| `total` | `number` | 전체 아이템 수 |
| `shown` | `number` | 필터 후 표시 수 |
| `isFiltered` | `boolean` | 필터/검색 적용 여부 |
| `onClear` | `() => void` | 필터 초기화 콜백 |

라이트 모드에서 ClearFilters 버튼 색: `brand.goldDeep` (WCAG AA 5.0:1 확보).

---

### NoResults
**파일:** `no-results.tsx`  
**사용처:** `app/(tabs)/cellar.tsx`

| Prop | Type | 설명 |
|------|------|------|
| `onClear` | `() => void` | 필터 초기화 콜백 |

dashed border 카드. 필터 적용 상태에서 결과 0건일 때만 렌더.

---

### CellarCard
**파일:** `cellar-card.tsx`  
**사용처:** `app/(tabs)/cellar.tsx` (FlatList numColumns=2)

| Prop | Type | 설명 |
|------|------|------|
| `item` | `CellarItemWithWine` | 셀러 아이템 (wine join 포함) |

wine.lwin 또는 display_name 없으면 null 반환.  
tap → `/cellar/${lwin}?id=${item.id}` 내비게이션.  
내부에서 `DrinkWindowBadge` 재사용.

---

### DrinkWindowBadge
**파일:** `drink-window-badge.tsx`  
**사용처:** `CellarCard`, `DrinkWindowCard`

| Prop | Type | 설명 |
|------|------|------|
| `status` | `DrinkWindowStatus` | `'peak' \| 'opening' \| 'mature' \| 'too-young' \| 'past-peak'` |
| `dw` | `DrinkWindow \| null` | too-young 상태 "YYYY년부터" 라벨에 사용 |

5가지 상태에 따라 bg/color/label 분기. `alignSelf: 'flex-start'` — 폭이 텍스트에 맞게 수축.

---

### CellarHero
**파일:** `cellar-hero.tsx`  
**사용처:** `app/cellar/[lwin].tsx`

| Prop | Type | 설명 |
|------|------|------|
| `wineName` | `string` | 헤더 h1 텍스트 (로컬라이즈된 이름) |
| `displayName` | `string` | WineLabelArt 이니셜 소스 |
| `bottleColor` | `string` | 그라데이션 시작 색 |
| `producerName` | `string \| null` | producer · vintage 라인 |
| `vintage` | `number \| null` | producer · vintage 라인 |
| `region` | `string \| null` | region · country 라인 |
| `country` | `string \| null` | region · country 라인 |

---

### WineLabelArt
**파일:** `wine-label-art.tsx`  
**사용처:** `CellarHero`

| Prop | Type | 설명 |
|------|------|------|
| `bottleColor` | `string` | 3-stop 그라데이션 기준 색 |
| `displayName` | `string` | 이니셜 추출 소스 |
| `width` | `number` | 기본 100 |
| `height` | `number` | 기본 150 |

라벨 placeholder — 병색 그라데이션 + 이니셜(첫 글자). 향후 실제 라벨 이미지로 교체 예정.

---

### DrinkWindowCard
**파일:** `drink-window-card.tsx`  
**사용처:** `app/cellar/[lwin].tsx`

| Prop | Type | 설명 |
|------|------|------|
| `status` | `DrinkWindowStatus` | 배지 상태 |
| `dw` | `DrinkWindow` | from / peak / to 연도 |
| `currentYear` | `number` | 기본 `new Date().getFullYear()` (테스트 주입용) |

`DrinkWindowBadge` + RangeText + `DrinkWindowTimeline` + TipRow 래퍼.

---

### DrinkWindowTimeline
**파일:** `drink-window-timeline.tsx`  
**사용처:** `DrinkWindowCard`

| Prop | Type | 설명 |
|------|------|------|
| `from` | `number` | 시음 시작 연도 |
| `peak` | `number` | 절정 연도 |
| `to` | `number` | 시음 종료 연도 |
| `currentYear` | `number` | 현재 연도 (기본값: 올해) |

height 28 고정. 5-stop 그라데이션 트랙 + peak 수직 마커(wine-red 2×16) + 현재 위치 dot(cream 12×12).

---

### NotifyToggleCard
**파일:** `notify-toggle-card.tsx`  
**사용처:** `app/cellar/[lwin].tsx`

| Prop | Type | 설명 |
|------|------|------|
| `notify` | `boolean` | 알림 on/off 상태 |
| `onChange` | `(next: boolean) => void` | 변경 콜백 (상위에서 Toast 처리) |

내부적으로 `AnimatedSwitch` (`shared/`) 사용.

---

### MetaGrid
**파일:** `meta-grid.tsx`  
**사용처:** `app/cellar/[lwin].tsx`

| Prop | Type | 설명 |
|------|------|------|
| `acquiredAt` | `string` | ISO 날짜 문자열 |
| `consumedAt` | `string \| null` | consumed 상태에서 4번째 카드로 표시 |
| `storage` | `string \| null` | 'cellar' / 'fridge' / 'room' / 'offsite' 또는 자유입력 |
| `purchasePriceKrw` | `number \| null` | ko: ₩ 포맷 / en: KRW 포맷 |
| `memo` | `string \| null` | 메모 (없으면 "—") |
| `status` | `'cellared' \| 'consumed'` | consumed 시 4번째 카드 = consumedAt |

`MetaCard` 4개를 flex-wrap으로 배치. 각 카드 width 48%.

---

### MetaCard
**파일:** `meta-card.tsx`  
**사용처:** `MetaGrid`

| Prop | Type | 설명 |
|------|------|------|
| `label` | `string` | Inter 11 muted 상단 레이블 |
| `value` | `string` | Inter 13 medium primary 값 |
| `widthPercent` | `` `${number}%` `` | 기본 `'48%'` (2-col gap 10 보정) |

범용 label+value 카드. 셀러 외 화면(노트 상세, 와인 상세 등)에서도 재사용 가능.

---

### DrinkThisCta
**파일:** `drink-this-cta.tsx`  
**사용처:** `app/cellar/[lwin].tsx` (cellared 상태에서만)

| Prop | Type | 설명 |
|------|------|------|
| `onConfirm` | `() => void \| Promise<void>` | ConfirmDialog 확인 후 콜백 |
| `disabled` | `boolean` | 버튼 비활성 (기본 false) |

`position: absolute` 하단 고정. LinearGradient fade (transparent → bg-deepest 0.95).  
내부에서 `ConfirmDialog` (`shared/`)로 확인 단계 처리.

---

## 공유 컴포넌트 (셀러에서 사용)

| 컴포넌트 | 파일 | 셀러 사용처 |
|----------|------|-------------|
| `AppHeader` | `nav/app-header.tsx` | 리스트 화면 상단 |
| `BackHeader` | `nav/back-header.tsx` | 상세 화면 상단 |
| `BellButton` | `nav/bell-button.tsx` | AppHeader right |
| `LevelChip` | `shared/level-chip.tsx` | AppHeader right |
| `EmptyState` | `shared/empty-state.tsx` | 셀러 비어있음 / 상세 미발견 |
| `PrimaryButton` | `shared/primary-button.tsx` | EmptyState action / Edit / 상태 전환 |
| `Toast` | `shared/toast.tsx` | addToast / 편집 성공·실패 |
| `ConfirmDialog` | `shared/confirm-dialog.tsx` | DrinkThisCta 확인 단계 |
| `AnimatedSwitch` | `shared/animated-switch.tsx` | NotifyToggleCard |
| `WMBottle` | `shared/wm-bottle.tsx` | CellarCard BottleZone |

---

## 로직 분리

| 파일 | 담당 |
|------|------|
| `src/lib/cellar-filters.ts` | `applySearch` / `applyTypeFilter` / `applySort` 순수 함수 |
| `src/lib/drink-window.ts` | `getDrinkWindow` / `getDrinkWindowStatus` — 시음 적기 계산 |
| `src/lib/lwin.ts` | `parseLwinVintage` / `getDefaultBottleColor` / `getLocalizedWineName` |
| `src/hooks/use-cellar.ts` | `useCellarList` / `useCellarItem` / `useCellarSummary` / `setCellarStatus` / `deleteCellarItem` |
