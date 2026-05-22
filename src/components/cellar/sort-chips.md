# SortChips

셀러 리스트의 **정렬 선택 칩 행**. 가로 스크롤 ScrollView에 6개 정렬 옵션.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `value` | `CellarSortKey` | yes | — | 현재 선택된 정렬 기준 |
| `onChange` | `(v: CellarSortKey) => void` | yes | — | 정렬 변경 콜백 |

### CellarSortKey 타입 (use-cellar.ts)

```ts
type CellarSortKey = 'recent' | 'drinkSoon' | 'vintage' | 'region' | 'storage' | 'price';
```

| 키 | 정렬 기준 |
|----|----------|
| `recent` | 최근 추가/음용순 (기본값) |
| `drinkSoon` | 시음 시기 임박순 |
| `vintage` | 빈티지 최신순 |
| `region` | 지역 알파벳순 |
| `storage` | 보관 위치 알파벳순 |
| `price` | 구매가 높은순 |

## 언제 사용하는가

- 셀러에 와인이 **1개 이상** 있을 때 `TypeFilterChips` 아래에 배치
- 사용자가 특정 기준으로 목록을 재정렬하고 싶을 때

## 기본 사용법

```tsx
const [sort, setSort] = useState<CellarSortKey>('recent');

<SortChips value={sort} onChange={setSort} />
```

## 시나리오별 활용

### 1. 기본 정렬 — 최근 추가순
초기값은 `'recent'`. 가장 최근에 추가한 와인이 맨 앞.

```tsx
<SortChips value="recent" onChange={setSort} />
```

### 2. 시음 임박 정렬 — drinkSoon
`getDrinkWindow`의 `from` 연도가 가까운 순 정렬. 시음 윈도우가 계산되지 않는 와인은 뒤로 밀림.

```tsx
<SortChips value="drinkSoon" onChange={setSort} />
```

### 3. tasted 탭에서의 정렬
consumed 아이템에서는 `recent` 정렬 기준이 `consumed_at`으로 변경됨.
`applySort(items, sort, isCellared=false)` 호출 시 자동 처리.

```tsx
// tasted 탭에서
const sorted = applySort(consumedItems, 'recent', false);
// -> consumed_at 기준 최신순
```

## 시각 스펙

| 상태 | border | background | 텍스트 |
|------|--------|------------|--------|
| active | `brand.wineRed` | `brand.wineRed` | `brand.cream` |
| idle | `border.default` | transparent | `text.secondary` |

칩: `paddingHorizontal: 11`, `paddingVertical: 5`, `borderRadius: 14`.  
텍스트: `Freesentation_4Regular` 11px.

## 주의사항

- 칩 선택 시 `Haptics.selectionAsync()` 자동 실행
- 정렬 로직은 `lib/cellar-filters.ts`의 `applySort()` 담당 — 이 컴포넌트는 UI만
- `TypeFilterChips`와 달리 dot 아이콘 없음 — 텍스트 전용
