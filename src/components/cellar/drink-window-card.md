# DrinkWindowCard

셀러 상세 **Section 2**: 시음 적기 전체 섹션 래퍼. Badge + RangeText + Timeline + TipRow 조합.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `status` | `DrinkWindowStatus` | yes | — | 현재 시음 상태 (Badge에 전달) |
| `dw` | `DrinkWindow` | yes | — | from / peak / to 연도 |
| `currentYear` | `number` | no | `new Date().getFullYear()` | 현재 연도 (테스트 주입용) |

### DrinkWindow 타입 (lib/drink-window.ts)

```ts
interface DrinkWindow {
  from: number;   // 시음 시작 연도
  peak: number;   // 절정 연도
  to: number;     // 시음 종료 연도
}
```

## 언제 사용하는가

- 셀러 상세에서 drink window 정보가 **계산 가능할 때** (dw != null, status != null)
- drink window 계산 불가 시: 별도 empty 카드로 대체

```tsx
{dw && dwStatus ? (
  <DrinkWindowCard status={dwStatus} dw={dw} />
) : (
  <View className="mx-4 rounded-2xl bg-surface border border-border-default" style={{ padding: 16 }}>
    <Text className="font-inter text-card-meta text-text-muted">
      {t('cellar.drinkWindow.empty')}
    </Text>
  </View>
)}
```

## 기본 사용법

```tsx
const dw = getDrinkWindow({ vintage, type_canonical, drink_window_from_year, ... });
const dwStatus = getDrinkWindowStatus({ vintage, type_canonical, ... });

{dw && dwStatus && (
  <DrinkWindowCard status={dwStatus} dw={dw} />
)}
```

## 시나리오별 활용

### 1. peak 상태 — 절정 중

```tsx
<DrinkWindowCard
  status="peak"
  dw={{ from: 2022, peak: 2026, to: 2035 }}
  currentYear={2026}
/>
// HeaderRow: [절정] Badge   "2022년 ~ 2035년"
// Timeline: 현재 dot가 peak marker와 겹침
// TipRow: "이 와인은 2026년에 절정에 도달합니다" (절정까지 n년 표시 안 됨)
```

### 2. too-young 상태 — 아직 이름

```tsx
<DrinkWindowCard
  status="too-young"
  dw={{ from: 2028, peak: 2032, to: 2040 }}
  currentYear={2026}
/>
// TipRow: "이 와인은 2032년에 절정에 도달합니다 · 절정까지 +6년"
```

### 3. past-peak 상태

```tsx
<DrinkWindowCard
  status="past-peak"
  dw={{ from: 2010, peak: 2018, to: 2022 }}
  currentYear={2026}
/>
// Timeline: 현재 dot가 to 이후 오른쪽 끝에 고정 (clamp 100%)
// TipRow: "이 와인은 2018년에 절정에 도달합니다" (연도가 과거 — 이미 지남)
```

### 4. 테스트에서 currentYear 주입

```tsx
// 2020년 기준으로 렌더 (snapshot 테스트 등)
<DrinkWindowCard status="too-young" dw={dw} currentYear={2020} />
```

## 내부 구성

```
DrinkWindowCard
  HeaderRow (flex-row, justify-between, mb: 12)
    DrinkWindowBadge  ← status + dw
    RangeText         ← "{dw.from}년 ~ {dw.to}년" (Inter 11 muted, inline)
  DrinkWindowTimeline ← from, peak, to, currentYear
  TipRow (mt: 12)     ← tip 텍스트 + 조건부 gold span
```

## 시각 스펙

- 외곽: `mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default`, `padding: 16`
- TipRow: Inter 12px, `text-text-secondary`, `lineHeight: 14.4`
- 절정까지 n년 span: `color: brand.gold`, inline `<Text>` 중첩

## 주의사항

- `dw` prop이 null이면 사용하지 말 것 — 조건부로 `dw && dwStatus` 체크 후 렌더
- `yearsToPeak > 0`일 때만 "절정까지 +N년" span 표시 (이미 절정 지났거나 절정이면 미표시)
