# DrinkWindowBadge

와인의 **시음 적기 상태**를 나타내는 5가지 상태 pill 배지.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `status` | `DrinkWindowStatus` | yes | — | 현재 시음 상태 |
| `dw` | `DrinkWindow \| null` | no | `undefined` | `too-young` 상태에서 "YYYY년부터" 라벨 생성에 사용 |

### DrinkWindowStatus 타입 (lib/drink-window.ts)

```ts
type DrinkWindowStatus = 'peak' | 'opening' | 'mature' | 'too-young' | 'past-peak';
```

## 언제 사용하는가

- 셀러 카드(`CellarCard`)에서 카드 하단 정보 행
- 셀러 상세(`DrinkWindowCard`) 헤더 좌측
- 향후 와인 상세 화면에서도 재사용 가능

## 기본 사용법

```tsx
const dw = getDrinkWindow({ vintage, type_canonical });
const status = getDrinkWindowStatus({ vintage, type_canonical });

// status가 있을 때만 렌더
{status && <DrinkWindowBadge status={status} dw={dw} />}
```

## 시나리오별 활용

### 1. peak — "절정" 상태
현재 연도가 peak 연도에 해당할 때.

```tsx
<DrinkWindowBadge status="peak" dw={{ from: 2022, peak: 2026, to: 2035 }} />
// -> wine-red 배지, "절정"
```

### 2. opening — "지금 마시기 좋아요"
시음 시작 시점(from)은 지났지만 peak 이전.

```tsx
<DrinkWindowBadge status="opening" dw={dw} />
// -> gold 배지, "지금 마시기 좋아요"
```

### 3. mature — "성숙기"
peak 이후 to 이전 안정적 시음 구간.

```tsx
<DrinkWindowBadge status="mature" dw={dw} />
// -> gold 배지, "성숙기"
```

### 4. too-young — "YYYY년부터" 또는 "아직 일러요"
`dw.from`이 있으면 "2028년부터", 없으면 fallback.

```tsx
// dw.from 있음
<DrinkWindowBadge status="too-young" dw={{ from: 2028, peak: 2032, to: 2040 }} />
// -> "2028년부터"

// dw 없음 (vintage 불명)
<DrinkWindowBadge status="too-young" dw={null} />
// -> "아직 일러요"
```

### 5. past-peak — "절정 지남"
현재 연도가 to 이후일 때.

```tsx
<DrinkWindowBadge status="past-peak" dw={dw} />
// -> `cellar.pastPeakBg[scheme]` 배지, "절정 지남"
```

### 6. CellarCard 내 조건부 렌더
vintage 미상이거나 type 없으면 status가 null — 배지 미렌더.

```tsx
const status = getDrinkWindowStatus({ vintage, type_canonical });
{status ? <DrinkWindowBadge status={status} dw={dw} /> : null}
```

## 시각 스펙

| status | background | 텍스트 색 |
|--------|------------|---------|
| `peak` | `brand.wineRed` | `brand.cream` |
| `opening` | `brand.gold` | `brand.deepestDark` |
| `mature` | `brand.gold` | `brand.deepestDark` |
| `too-young` | `cellar.tooYoungBg[scheme]` | `text.muted` |
| `past-peak` | `cellar.pastPeakBg[scheme]` | `text.muted` |

컨테이너: `paddingHorizontal: 8`, `paddingVertical: 3`, `borderRadius: 10`, `alignSelf: 'flex-start'`.  
텍스트: `Freesentation_4Regular` 10px.

## 주의사항

- `too-young`, `past-peak`는 `scheme`(dark/light)에 따라 배경색이 달라짐 — `useThemeTokens()` 내부 사용
- `alignSelf: 'flex-start'` 이므로 부모가 `flexDirection: 'column'`이어야 칩이 콘텐츠 폭에 맞게 수축
