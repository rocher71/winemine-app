# CellarTabs

셀러 리스트 화면 상단의 **탭 세그먼트 컨트롤**. "내 셀러"(보관 중) ↔ "마신 와인" 전환.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `value` | `'cellar' \| 'tasted'` | yes | — | 현재 활성 탭 |
| `onChange` | `(v: CellarTab) => void` | yes | — | 탭 선택 콜백 |
| `cellarCount` | `number` | yes | — | "내 셀러" 탭 오른쪽 숫자 배지 |
| `tastedCount` | `number` | yes | — | "마신 와인" 탭 오른쪽 숫자 배지 |

## 언제 사용하는가

- 동일 화면 안에서 **보관 중 와인** / **마신 와인** 두 목록을 전환해야 할 때
- count 배지가 있어야 탭 전환 전에 각 목록의 규모를 확인할 수 있을 때

## 기본 사용법

```tsx
const [tab, setTab] = useState<CellarTab>('cellar');
const { cellaredCount, consumedCount } = useCellarSummary();

<CellarTabs
  value={tab}
  onChange={setTab}
  cellarCount={cellaredCount}
  tastedCount={consumedCount}
/>
```

## 시나리오별 활용

### 1. TitleBar 왼쪽 고정 (현재)
탭을 TitleBar 왼쪽에, 오른쪽에 `AddCta`를 붙여 한 행으로 배치.

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
  <CellarTabs
    value={tab}
    onChange={setTab}
    cellarCount={cellaredCount}
    tastedCount={consumedCount}
  />
  <View style={{ flex: 1 }} />
  <AddCta onPress={onAdd} />
</View>
```

### 2. cellar 탭만 보이는 경우 (초기 데이터 없음)
count가 0이어도 렌더는 정상. 배지에 0 표시.

```tsx
<CellarTabs value="cellar" onChange={setTab} cellarCount={0} tastedCount={0} />
```

### 3. FlatList ListHeader 안에 포함
스크롤 시 리스트 상단에 고정되지 않고 콘텐츠와 함께 스크롤됨.
고정이 필요하면 `stickyHeaderIndices` 또는 `AppHeader` 아래에 별도 배치할 것.

## 시각 스펙

| 상태 | 배경 | 텍스트 | count 색 |
|------|------|--------|---------|
| active | `brand.wineRed` | `brand.cream` | `cellar.tabCountActive` (cream/0.7) |
| idle | transparent | `text.muted` | `text.disabled` |

컨테이너: `bg-surface border border-border-default rounded-[10px]`, padding 3, gap 2.  
각 탭 버튼: `paddingHorizontal: 10`, `paddingVertical: 5`, `borderRadius: 7`.

## 주의사항

- `flexShrink: 0`이 적용되어 있어 컨테이너가 좁아져도 탭이 줄어들지 않음
- 탭 전환 시 `Haptics.selectionAsync()` 자동 실행됨 — 별도 haptic 처리 불필요
- 같은 탭을 다시 탭해도 onChange 호출되지 않음 (내부에서 `if (next === value) return` 처리)
