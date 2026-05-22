# CellarSearchInput

셀러 리스트의 **인라인 검색 바**. 와인명·생산자·지역·국가 대상 실시간 필터링.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `query` | `string` | yes | — | 현재 검색어 (controlled) |
| `onQueryChange` | `(v: string) => void` | yes | — | 입력 변경 콜백 |

## 언제 사용하는가

- 셀러에 와인이 **1개 이상** 있을 때만 렌더 (`hasAnyItems` 조건)
- 검색 결과가 없으면 `NoResults` 컴포넌트와 함께 사용
- `TypeFilterChips`, `SortChips`와 항상 세트로 배치

## 기본 사용법

```tsx
const [query, setQuery] = useState('');

<CellarSearchInput query={query} onQueryChange={setQuery} />
```

## 시나리오별 활용

### 1. 검색어 없음 — 기본 상태
placeholder "와인, 생산자, 지역 검색..." 표시. X 버튼 미노출.

```tsx
<CellarSearchInput query="" onQueryChange={setQuery} />
```

### 2. 검색 중 — X 클리어 버튼 표시
`query.length > 0` 이면 오른쪽에 원형 X 버튼 자동 노출.

```tsx
<CellarSearchInput query="Chateau" onQueryChange={setQuery} />
// -> 오른쪽에 X 버튼 표시됨
```

### 3. 필터와 조합
검색 + 타입 필터를 동시에 초기화할 때 부모에서 두 상태를 함께 리셋.

```tsx
const onClearFilters = () => {
  setQuery('');
  setTypeFilter('all');
};
```

### 4. 검색 결과 0건 처리
`applySearch` 후 결과가 빈 배열이면 `NoResults`를 렌더. `CellarSearchInput`은 계속 표시.

```tsx
{displayItems.length === 0 && hasAnyItems
  ? <NoResults onClear={() => { setQuery(''); setTypeFilter('all'); }} />
  : <CellarGrid items={displayItems} />
}
```

## 시각 스펙

| 영역 | 스펙 |
|------|------|
| 컨테이너 | `paddingHorizontal: 16`, `paddingBottom: 10` |
| 입력 박스 | `bg-surface`, `border border-border-default`, `rounded-xl`, `px: 12`, `py: 10` |
| 검색 아이콘 | `lucide Search` 16px, `text.muted` |
| TextInput | `flex-1`, `fontSize: 13`, `text-text-primary` |
| X 버튼 | 22×22 원형, `cellar.clearBtnBg[scheme]` (dark/light 자동) |

## 주의사항

- 검색 로직은 컴포넌트 밖 `applySearch()` (`lib/cellar-filters.ts`)에서 처리 — 이 컴포넌트는 입력 UI만 담당
- `returnKeyType="search"` 설정되어 있어 키보드 검색 버튼으로 dismiss 가능
- 빈 셀러 상태(`!hasAnyItems`)에서는 렌더하지 말 것 — 필터할 데이터가 없음
