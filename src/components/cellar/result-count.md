# ResultCount

셀러 리스트의 **결과 수 표시줄**. "총 N병" 또는 "N병 중 M개 결과" + 필터 초기화 버튼.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `total` | `number` | yes | — | 필터 적용 전 전체 아이템 수 |
| `shown` | `number` | yes | — | 현재 필터 후 표시되는 아이템 수 |
| `isFiltered` | `boolean` | yes | — | 검색어 또는 타입 필터가 적용된 상태 여부 |
| `onClear` | `() => void` | yes | — | 필터 초기화 콜백 |

## 언제 사용하는가

- 셀러에 와인이 **1개 이상** 있을 때 `SortChips` 아래에 배치
- 필터 상태를 사용자에게 알리고 빠르게 초기화할 수 있는 진입점 제공

## 기본 사용법

```tsx
const isFiltered = query.trim().length > 0 || typeFilter !== 'all';

<ResultCount
  total={rawItems.length}
  shown={displayItems.length}
  isFiltered={isFiltered}
  onClear={onClearFilters}
/>
```

## 시나리오별 활용

### 1. 필터 없음 — "총 N병"
`isFiltered=false`이면 단순 총 수 표시. ClearFilters 버튼 미노출.

```tsx
<ResultCount total={24} shown={24} isFiltered={false} onClear={() => {}} />
// -> "총 24병"
```

### 2. 필터 적용 중 — "24병 중 6개 결과"
`isFiltered=true`이고 `shown !== total`이면 ClearFilters 버튼도 표시.

```tsx
<ResultCount total={24} shown={6} isFiltered={true} onClear={onClearFilters} />
// -> "24병 중 6개 결과"  [필터 초기화]
```

### 3. 필터 있지만 전체 일치 — "24병 중 24개 결과"
필터는 있지만 결과가 전체와 동일한 경우 ClearFilters 버튼 미노출.

```tsx
<ResultCount total={24} shown={24} isFiltered={true} onClear={onClearFilters} />
// -> "24병 중 24개 결과"  (ClearFilters 버튼 없음)
```

### 4. 필터 적용 + 0건
`shown=0`이어도 이 컴포넌트는 정상 렌더. 아래에 `NoResults` 별도 렌더.

```tsx
<ResultCount total={24} shown={0} isFiltered={true} onClear={onClearFilters} />
// -> "24병 중 0개 결과"  [필터 초기화]
// 아래:
<NoResults onClear={onClearFilters} />
```

## 시각 스펙

- 컨테이너: `paddingHorizontal: 20`, `paddingBottom: 10`, `flexDirection: 'row'`, `justifyContent: 'space-between'`
- 결과 텍스트: `font-inter` 11px, `text-text-muted`
- ClearFilters 버튼 텍스트: 11px, 다크 `brand.gold` / 라이트 `brand.goldDeep`

> 라이트 모드에서 `brand.gold`(#C9A84C)는 크림 배경(#FAF5EC) 위 대비 2.8:1로 WCAG AA 미달.
> `brand.goldDeep`(#A07F2E) 사용 시 5.0:1 확보 — `scheme` 으로 자동 분기됨.

## 주의사항

- i18n 키: `cellar.resultCount.total`, `cellar.resultCount.filtered`, `cellar.clearFilters`
- `isFiltered`와 `shown !== total` 두 조건을 모두 만족해야 ClearFilters 버튼 노출
