# MetaGrid

셀러 상세 **Section 4**: `MetaCard` 4개를 2×2 flex-wrap 그리드로 배치하는 래퍼.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `acquiredAt` | `string` | yes | — | 구매일 (ISO datetime — YYYY-MM-DD로 slice) |
| `consumedAt` | `string \| null` | no | `null` | 음용일 (consumed 상태에서 4번째 카드로 표시) |
| `storage` | `string \| null` | no | `null` | 보관 장소 키 또는 자유 입력값 |
| `purchasePriceKrw` | `number \| null` | no | `null` | 구매 가격 (원화, 없으면 "—") |
| `memo` | `string \| null` | no | `null` | 메모 (없으면 i18n "—") |
| `status` | `'cellared' \| 'consumed'` | yes | — | 4번째 카드 내용 결정 |

## 언제 사용하는가

- 셀러 상세에서 NotifyToggleCard 아래에 항상 렌더
- 아이템의 핵심 메타 정보(보관/구매/가격/메모)를 2×2 그리드로 표시

## 기본 사용법

```tsx
<MetaGrid
  acquiredAt={item.acquired_at}
  consumedAt={item.consumed_at}
  storage={item.storage}
  purchasePriceKrw={item.purchase_price_krw}
  memo={null}
  status={item.status as CellarStatus}
/>
```

## 시나리오별 활용

### 1. cellared 상태 — 4번째 카드 = 메모

```tsx
<MetaGrid
  acquiredAt="2024-03-15T00:00:00Z"
  consumedAt={null}
  storage="cellar"
  purchasePriceKrw={85000}
  memo="생일 선물용"
  status="cellared"
/>
// 카드 1: "보관 장소" / "와인 셀러"
// 카드 2: "구매일" / "2024-03-15"
// 카드 3: "구매 가격" / "₩85,000"
// 카드 4: "메모" / "생일 선물용"
```

### 2. consumed 상태 — 4번째 카드 = 음용일

```tsx
<MetaGrid
  acquiredAt="2024-03-15T00:00:00Z"
  consumedAt="2026-05-10T00:00:00Z"
  storage="fridge"
  purchasePriceKrw={null}
  memo={null}
  status="consumed"
/>
// 카드 1: "보관 장소" / "냉장고"
// 카드 2: "구매일" / "2024-03-15"
// 카드 3: "구매 가격" / "—"
// 카드 4: "음용일" / "2026-05-10"
```

### 3. storage 키 분기

| `storage` 값 | 표시 텍스트 |
|-------------|----------|
| `null` | "와인 셀러" (기본값) |
| `'cellar'` | "와인 셀러" |
| `'fridge'` | "냉장고" |
| `'room'` | "상온 보관" |
| `'offsite'` | "외부 보관" |
| 자유 입력 (예: "지하 창고") | 그대로 표시 |

### 4. 가격 포맷 — 로케일 분기

```tsx
// ko 로케일
purchasePriceKrw = 1180000
// -> "₩1,180,000"

// en 로케일
// -> "1,180,000 KRW"
```

## 시각 스펙

- 외곽: `mx-4 flex-row flex-wrap`, `gap: 10`
- 각 `MetaCard`: `widthPercent="48%"` (기본값 그대로)

## 주의사항

- `acquiredAt` ISO 문자열에서 앞 10자리만 슬라이스 — timezone 무관
- 메모가 빈 문자열 `''`이면 i18n fallback "메모 없음" 표시
- 4번째 카드 결정 로직은 컴포넌트 내부에서 처리 — 호출부에서 분기 불필요
