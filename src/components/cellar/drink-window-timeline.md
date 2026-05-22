# DrinkWindowTimeline

시음 적기를 **5-stop 그라데이션 트랙 + 현재 위치 dot + peak 마커**로 시각화하는 타임라인.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `from` | `number` | yes | — | 시음 시작 연도 |
| `peak` | `number` | yes | — | 절정 연도 |
| `to` | `number` | yes | — | 시음 종료 연도 |
| `currentYear` | `number` | no | `new Date().getFullYear()` | 현재 연도 (dot 위치 계산, 테스트 주입용) |

## 언제 사용하는가

- `DrinkWindowCard` 내부에서 단독 사용 (현재)
- 독립적으로 타임라인만 필요한 화면에서도 재사용 가능

## 기본 사용법

```tsx
<DrinkWindowTimeline from={2020} peak={2028} to={2040} />
// currentYear는 올해로 자동 설정
```

## 시나리오별 활용

### 1. 정상 범위 내 현재 위치

```tsx
<DrinkWindowTimeline from={2020} peak={2028} to={2040} currentYear={2024} />
// total = 20, nowPct = (2024-2020)/20 * 100 = 20%, peakPct = (2028-2020)/20 * 100 = 40%
// 현재 dot이 트랙 20% 위치에, peak 마커가 40% 위치에
```

### 2. 시음 전 (too-young) — dot이 왼쪽 끝

```tsx
<DrinkWindowTimeline from={2028} peak={2032} to={2040} currentYear={2026} />
// nowPct = (2026-2028)/12 * 100 = -16.7% → clamp(0) → dot이 0% 위치 (맨 왼쪽)
```

### 3. 시음 종료 후 (past-peak) — dot이 오른쪽 끝

```tsx
<DrinkWindowTimeline from={2010} peak={2018} to={2022} currentYear={2026} />
// nowPct = (2026-2010)/12 * 100 = 133% → clamp(100) → dot이 100% 위치 (맨 오른쪽)
```

### 4. 현재가 절정에 정확히 일치

```tsx
<DrinkWindowTimeline from={2020} peak={2026} to={2035} currentYear={2026} />
// peakPct = (2026-2020)/15 * 100 = 40%
// nowPct = (2026-2020)/15 * 100 = 40%
// dot과 peak 마커 겹침
```

### 5. 테스트 주입

```tsx
// 2020년 기준 스냅샷
<DrinkWindowTimeline from={2018} peak={2025} to={2030} currentYear={2020} />
```

## 내부 레이아웃

```
height: 28 (position: relative)
  track bar    (top:12, left:0, right:0, height:4, borderRadius:2)
               5-stop LinearGradient (drinkWindowTimelineGradient)
  peak marker  (top:6, left:`${peakPct}%`, width:2, height:16, bg:brand.wineRed, marginLeft:-1)
  current dot  (top:8, left:`${nowPct}%`, width:12, height:12, radius:6, bg:brand.cream, border:2px bg.deepest, marginLeft:-6)
  labels row   (top:22, left:0, right:0, flexDirection:row, justifyContent:space-between)
               from year   to year
```

## 퍼센트 계산

```ts
total = to - from
nowPct  = clamp(((currentYear - from) / total) * 100, 0, 100)
peakPct = clamp(((peak - from) / total) * 100, 0, 100)
```

`total === 0`일 경우 nowPct/peakPct 모두 50 (중앙) fallback.

## 시각 스펙

| 요소 | 스펙 |
|------|------|
| 트랙 그라데이션 | `drinkWindowTimelineGradient` (5-stop, 토큰에서 정의) |
| peak 마커 | 2×16px, `brand.wineRed`, `accessibilityElementsHidden` |
| 현재 dot | 12×12px, `brand.cream`, `border: 2px bg.deepest` |
| 연도 라벨 | Inter 10px, `text-text-muted` |

## 주의사항

- `left: '${n}%'` RN percent string — `position: absolute` 부모에서만 동작
- peak 마커의 `marginLeft: -1` (폭 2px 중앙 정렬), 현재 dot의 `marginLeft: -6` (폭 12px 중앙 정렬)
- 접근성: 현재 dot에 `accessibilityRole="text"`, `accessibilityLabel: "현재 연도 YYYY"` 부여
