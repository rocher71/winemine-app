# MetaCard

**라벨 + 값** 구조의 단순 정보 카드. MetaGrid의 기본 단위.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `label` | `string` | yes | — | 상단 작은 레이블 텍스트 |
| `value` | `string` | yes | — | 하단 본문 값 텍스트 |
| `widthPercent` | `` `${number}%` `` | no | `'48%'` | 카드 폭 (2-col gap 10 보정) |

## 언제 사용하는가

- `MetaGrid` 내부에서 4개 셋으로 사용 (현재)
- 단일 정보를 라벨+값으로 표시해야 하는 모든 화면에서 재사용 가능
  - 노트 상세의 시음 조건 (온도, 디캔팅 시간 등)
  - 와인 상세의 스펙 정보 (알코올, 토양, 품종 등)

## 기본 사용법

```tsx
<MetaCard label="보관 장소" value="와인 셀러" />
```

## 시나리오별 활용

### 1. MetaGrid 2×2 배치 (현재 사용 방식)

```tsx
<View className="mx-4 flex-row flex-wrap" style={{ gap: 10 }}>
  <MetaCard label="보관 장소" value="와인 셀러" />
  <MetaCard label="구매일" value="2024-03-15" />
  <MetaCard label="구매 가격" value="₩85,000" />
  <MetaCard label="메모" value="생일 선물" />
</View>
// 각 카드 48% 폭 → 2열 자동 배치
```

### 2. 풀 폭 단일 카드

```tsx
<MetaCard label="메모" value="긴 메모 내용..." widthPercent="100%" />
```

### 3. 3열 배치 (커스텀 폭)

```tsx
<View className="flex-row flex-wrap" style={{ gap: 8 }}>
  <MetaCard label="알코올" value="13.5%" widthPercent="31%" />
  <MetaCard label="토양" value="자갈" widthPercent="31%" />
  <MetaCard label="품종" value="카베르네 소비뇽" widthPercent="31%" />
</View>
```

### 4. 값 없음 — 대시 표시

```tsx
// MetaGrid에서 값 없을 때 "—" 전달
<MetaCard label="구매 가격" value="—" />
```

### 5. 긴 값 — 2줄까지 허용

```tsx
<MetaCard label="메모" value="아주 긴 메모 내용이 들어가는 경우 2줄까지 표시됩니다. 그 이상은 잘림." />
// numberOfLines={2} — 3번째 줄부터 "..."
```

## 시각 스펙

| 요소 | 스펙 |
|------|------|
| 컨테이너 | `bg-surface`, `border border-border-default`, `borderRadius: 12`, `paddingHorizontal: 14`, `paddingVertical: 12`, `minHeight: 64` |
| 레이블 | Inter 11px, `text-text-muted`, `marginBottom: 4`, `numberOfLines: 1` |
| 값 | `font-inter-medium` 13px, `text-text-primary`, `numberOfLines: 2` |

## 주의사항

- `widthPercent` 타입이 `` `${number}%` `` — `'48%'`, `'100%'` 등 퍼센트 문자열만 허용
- gap 10의 2-col 배치에서 `48%` 폭은 `(100% - 10px gap) / 2`에 근사 — 완벽한 50%는 아님
- `minHeight: 64`로 값이 짧아도 카드 최소 높이 보장
