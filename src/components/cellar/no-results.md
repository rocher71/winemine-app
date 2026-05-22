# NoResults

필터·검색 결과가 **0건일 때** 표시하는 dashed border 카드.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `onClear` | `() => void` | yes | — | 필터 초기화 콜백 |

## 언제 사용하는가

- 셀러에 와인이 **존재하지만** 현재 검색/타입 필터 조건에 맞는 결과가 없을 때
- 빈 셀러 상태(데이터 자체가 없음)와는 다른 상황 — 그때는 `EmptyState` 사용

## 빈 셀러 vs NoResults 구분

| 상황 | 컴포넌트 |
|------|---------|
| 셀러에 와인이 한 개도 없음 | `EmptyState` (GlassWater 아이콘 + /capture CTA) |
| 와인은 있지만 필터 결과 0건 | `NoResults` (dashed 카드 + ClearFilters 버튼) |

## 기본 사용법

```tsx
// FlatList ListEmptyComponent에서 분기
const renderEmpty = () => {
  if (!hasAnyItems) {
    return <EmptyState ... />;
  }
  return <NoResults onClear={onClearFilters} />;
};
```

## 시나리오별 활용

### 1. 타입 필터 적용 후 해당 타입 없음

```tsx
// "스파클링" 필터 선택했는데 셀러에 스파클링이 없는 경우
<TypeFilterChips value="sparkling" onChange={setTypeFilter} />
// 아래 목록:
<NoResults onClear={() => setTypeFilter('all')} />
```

### 2. 검색어 입력 후 일치 없음

```tsx
// "Petrus" 검색했는데 없는 경우
<CellarSearchInput query="Petrus" onQueryChange={setQuery} />
// 아래 목록:
<NoResults onClear={() => setQuery('')} />
```

### 3. 복합 필터 초기화
검색 + 타입 필터 동시 초기화.

```tsx
const onClearFilters = useCallback(() => {
  setQuery('');
  setTypeFilter('all');
}, []);

<NoResults onClear={onClearFilters} />
```

## 시각 스펙

- 컨테이너: `marginTop: 8`, `marginHorizontal: 16`, `marginBottom: 24`, `paddingHorizontal: 20`, `paddingVertical: 32`
- border: 1px `dashed`, `border.default`, `borderRadius: 14`
- 제목: Playfair 16px, `text-text-primary`, `marginBottom: 6`
- 본문: Inter 12px, `text-text-muted`, `lineHeight: 18`, `marginBottom: 14`
- 버튼: `paddingHorizontal: 16`, `paddingVertical: 8`, `borderRadius: 10`, border 1px `brand.gold`, 텍스트 `brand.gold`

## 주의사항

- i18n 키: `cellar.noResults.title`, `cellar.noResults.body`, `cellar.clearFilters`
- 로딩 중에는 렌더하지 말 것 — 로딩이 끝난 후 데이터 유무 확인 후 렌더
