# WineLabelArt

와인 라벨 **placeholder 이미지**. 실제 라벨 사진이 없을 때 병색 그라데이션 + 와인명 첫 글자로 표시.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `bottleColor` | `string` | yes | — | 3-stop 그라데이션 기준 색 (`#RRGGBB`) |
| `displayName` | `string` | yes | — | 이니셜 추출 소스 (첫 글자 uppercase) |
| `width` | `number` | no | `100` | 컨테이너 폭 |
| `height` | `number` | no | `150` | 컨테이너 높이 |

## 언제 사용하는가

- 실제 라벨 이미지가 없는 모든 와인 카드/상세에서 placeholder로 사용
- 현재는 `CellarHero` 내부에서만 호출되지만, 향후 와인 상세·노트 등에서 재사용 가능
- 라벨 스캔 이미지가 있을 때는 이 컴포넌트 대신 `<Image>` 렌더

## 기본 사용법

```tsx
<WineLabelArt
  bottleColor="#5C0A14"
  displayName="Chateau Lafite Rothschild"
/>
// -> 100×150 라벨, 첫 글자 "C" 표시
```

## 시나리오별 활용

### 1. 표준 크기 (100×150) — CellarHero
기본값 그대로 사용.

```tsx
<WineLabelArt bottleColor={bottleColor} displayName={displayName} />
```

### 2. 커스텀 크기 — 작은 썸네일

```tsx
<WineLabelArt bottleColor={bottleColor} displayName={displayName} width={60} height={90} />
// 폰트 크기 자동 조정: Math.max(20, Math.min(60, 90) * 0.42) = 25.2
```

### 3. 큰 크기 — 팝업/모달 뷰

```tsx
<WineLabelArt bottleColor={bottleColor} displayName={displayName} width={160} height={240} />
// 폰트 크기: Math.max(20, Math.min(160, 240) * 0.42) = 67.2
```

### 4. 한글 와인명 첫 글자

```tsx
<WineLabelArt bottleColor="#C8860A" displayName="황금 샤르도네" />
// -> 이니셜 "황" 표시 (한글 첫 글자)
```

### 5. bottleColor fallback 연동

```tsx
const bottleColor = wine.bottle_color ?? getDefaultBottleColor(typeCanon);
<WineLabelArt bottleColor={bottleColor} displayName={wine.display_name} />
```

## 그라데이션 생성 방식

`wineLabelArtGradient(bottleColor)` 함수가 병색에서 3-stop 그라데이션 생성:

```
stop 0: bottleColor (원색)
stop 1: shade(bottleColor, -20%) (어둡게)
stop 2: shade(bottleColor, -40%) (더 어둡게)
```

상단 40% 영역에 흰색 하이라이트 오버레이 추가 (`wineLabelArtHighlightGradient`).

## 시각 스펙

- 컨테이너: `borderRadius: 8`, `overflow: hidden`, `border: 1px withAlpha(brand.gold, 0.18)`
- 이니셜: `Freesentation_4Regular`, `fontSize = Math.max(20, Math.min(width, height) * 0.42)`
- 이니셜 색: `brand.cream`

## 주의사항

- `accessibilityElementsHidden` — 스크린 리더에 노출되지 않음 (장식 요소)
- 향후 실제 라벨 이미지 지원 시 `displayName`과 `bottleColor` 대신 `imageUri` prop 추가 예정
- 폰트 크기는 `min(width, height) * 0.42` — 100×150 기준 42px
