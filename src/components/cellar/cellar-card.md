# CellarCard

셀러 리스트의 **2열 그리드 카드**. 병 이미지 영역(BottleZone) + 메타 정보 영역(MetaZone)으로 구성.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `item` | `CellarItemWithWine` | yes | — | 셀러 아이템 (wine join 포함) |

### CellarItemWithWine 주요 필드

```ts
{
  id: string;
  status: 'cellared' | 'consumed';
  acquired_at: string;
  consumed_at: string | null;
  purchase_price_krw: number | null;
  storage: string | null;
  quantity: number;
  wine: {
    lwin: string;
    display_name: string;
    name_ko: string | null;
    producer_name: string | null;
    vintage: number | null;
    type_canonical: string | null;
    bottle_color: string | null;
    region: string | null;
    country: string | null;
    drink_window_from_year: number | null;
    drink_window_peak_year: number | null;
    drink_window_to_year: number | null;
  } | null;
}
```

## 언제 사용하는가

- 셀러 리스트(보관 중) FlatList `numColumns={2}`
- 마신 탭(consumed) FlatList `numColumns={2}`
- 두 탭 모두 동일 컴포넌트 사용

## 기본 사용법

```tsx
<FlatList
  data={items}
  numColumns={2}
  columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
  contentContainerStyle={{ gap: 12 }}
  renderItem={({ item }) => <CellarCard item={item} />}
  keyExtractor={(it) => it.id}
/>
```

## 시나리오별 활용

### 1. wine 데이터 정상 — 표준 카드
BottleZone 그라데이션 + WMBottle + 메타 정보 + DrinkWindowBadge.

```tsx
<CellarCard item={cellarItem} />
```

### 2. wine 데이터 없음 — null 반환
`wine?.lwin` 또는 `wine?.display_name` 이 없으면 컴포넌트가 `null` 반환.
FlatList 아이템에서 빈 슬롯이 생길 수 있으므로, 데이터 레이어에서 wine join 보장 필요.

### 3. vintage 없음
`wine.vintage`가 null이면 `parseLwinVintage(lwin)`으로 fallback 시도.
둘 다 없으면 vintage 행 미렌더.

### 4. drink window 계산 불가
vintage가 없거나 type_canonical이 없으면 `getDrinkWindowStatus` 반환값이 null.
이 경우 `DrinkWindowBadge` 미렌더.

```tsx
// DrinkWindowBadge는 status가 있을 때만 렌더됨
{status ? (
  <View style={{ marginTop: 4 }}>
    <DrinkWindowBadge status={status} dw={dw} />
  </View>
) : null}
```

### 5. tap → 상세 화면 이동
`/cellar/${lwin}?id=${item.id}` 형식으로 이동.
`id` 파라미터로 여러 셀러 아이템 중 정확한 아이템 특정.

## 시각 스펙

| 영역 | 스펙 |
|------|------|
| 외곽 컨테이너 | `bg.surface`, `border.default`, `borderRadius: 14`, `overflow: hidden` |
| flex wrapper | `flex: 1` (2-col 균등 폭) |
| BottleZone | LinearGradient 160deg, `bottleColor/0.157 → bottleShelf 80%`, `paddingTop: 14`, `paddingBottom: 8` |
| WMBottle | width 40, height 130 |
| MetaZone | `paddingHorizontal: 12`, `paddingTop: 10`, `paddingBottom: 12`, `gap: 4` |
| TypeDot | 6×6 원형, `wineTypeDot[type]` 색 |
| 와인명 | Playfair 12px, `text-text-primary`, `numberOfLines: 2`, `minHeight: 30` |
| 생산자 | Inter 10px, `text-text-muted`, `numberOfLines: 1` |
| 빈티지 | Inter 10px, `text-text-secondary` |

## 주의사항

- press: `opacity 0.85` — scale 없음 (layout 리플로우 방지, §4-11)
- 카드 외곽에 `flex: 1` wrapper 필수 — 없으면 2-col 폭이 균등하지 않음
- `bottleColor`는 `wine.bottle_color ?? getDefaultBottleColor(typeCanon)` fallback
