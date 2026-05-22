# TypeFilterChips

셀러 리스트의 **와인 타입 필터 칩 행**. 가로 스크롤 ScrollView에 all / red / white / sparkling / rose / fortified 6개 칩.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `value` | `TypeFilter` | yes | — | 현재 선택된 필터 |
| `onChange` | `(v: TypeFilter) => void` | yes | — | 필터 변경 콜백 |

### TypeFilter 타입

```ts
type TypeFilter = 'all' | 'red' | 'white' | 'sparkling' | 'rose' | 'fortified';
```

`dessert` 타입은 의도적으로 제외 (보관 비율 낮음, 사양 §12-5).

## 언제 사용하는가

- 셀러에 와인이 **1개 이상** 있을 때 `CellarSearchInput` 아래에 배치
- 여러 타입이 혼재한 셀러에서 특정 타입만 보고 싶을 때
- `SortChips`, `ResultCount`와 항상 세트로 렌더

## 기본 사용법

```tsx
const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

<TypeFilterChips value={typeFilter} onChange={setTypeFilter} />
```

## 시나리오별 활용

### 1. 초기 상태 — "all" 선택
모든 와인 표시. gradient TypeDot으로 시각적으로 구분.

```tsx
<TypeFilterChips value="all" onChange={setTypeFilter} />
```

### 2. 특정 타입 선택
해당 타입 칩이 gold border + bg gold/0.12 + gold 텍스트로 강조.

```tsx
<TypeFilterChips value="red" onChange={setTypeFilter} />
// -> "레드" 칩 활성화, 나머지 idle
```

### 3. 검색과 조합 초기화
필터 + 검색을 동시에 리셋.

```tsx
const onClearFilters = () => {
  setQuery('');
  setTypeFilter('all');
};
```

### 4. 필터 적용 여부 판단
`typeFilter !== 'all'`이면 필터 활성 상태 — `ResultCount.isFiltered` 계산에 사용.

```tsx
const isFiltered = query.trim().length > 0 || typeFilter !== 'all';
```

## 시각 스펙

| 상태 | border | background | 텍스트 |
|------|--------|------------|--------|
| active | `brand.gold` | `cellar.typeFilterActiveBg` (gold/0.12) | `brand.gold` |
| idle | `border.default` | transparent | `text.muted` |

TypeDot (8×8 원형):
| 타입 | 색 |
|------|-----|
| all | 135deg 3-stop gradient (`typeFilterAllGradient`) |
| red | `typeFilterDot.red` |
| white | `typeFilterDot.white` |
| sparkling | `typeFilterDot.sparkling` |
| rose | `typeFilterDot.rose` |
| fortified | `typeFilterDot.fortified` |

active opacity 1 / idle opacity 0.55 (all idle 0.5).

## 주의사항

- 칩 선택 시 `Haptics.selectionAsync()` 자동 실행
- `scrollView` 이므로 칩이 많아도 가로 스크롤로 대응 — 줄바꿈 없음
- `lib/cellar-filters.ts`의 `applyTypeFilter(items, typeFilter)` 와 함께 사용
