# CellarHero

셀러 상세 화면 **Section 1**: 240px 그라데이션 프레임 + WineLabelArt + 와인명 h1 + producer·vintage + region·country.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `wineName` | `string` | yes | — | h1 제목 (locale 기반 우선 이름) |
| `displayName` | `string` | yes | — | WineLabelArt 이니셜 소스 (영문 표준명) |
| `bottleColor` | `string` | yes | — | Hero 그라데이션 시작 색 (`#RRGGBB`) |
| `producerName` | `string \| null` | no | `null` | ProducerLine에 표시, vintage와 " · " 결합 |
| `vintage` | `number \| null` | no | `null` | ProducerLine에 표시 |
| `region` | `string \| null` | no | `null` | RegionLine에 표시, country와 " · " 결합 |
| `country` | `string \| null` | no | `null` | RegionLine에 표시 |

## 언제 사용하는가

- 셀러 상세 화면 최상단 히어로 섹션
- 와인 상세 화면에서도 유사 레이아웃으로 재사용 가능 (현재는 셀러 전용)

## 기본 사용법

```tsx
<CellarHero
  wineName={headerTitle}
  displayName={wineDisplayName}
  bottleColor={bottleColor}
  producerName={wine.producer_name}
  vintage={vintage}
  region={wine.region}
  country={wine.country}
/>
```

## 시나리오별 활용

### 1. 모든 정보 있음 — 풀 렌더

```tsx
<CellarHero
  wineName="샤또 라피트 로칠드"
  displayName="Chateau Lafite Rothschild"
  bottleColor="#5C0A14"
  producerName="Domaine de la Romanée-Conti"
  vintage={2018}
  region="Pauillac"
  country="France"
/>
// h1: "샤또 라피트 로칠드"
// ProducerLine: "Domaine de la Romanée-Conti · 2018"
// RegionLine: "Pauillac · France"
```

### 2. producer만 있고 vintage 없음

```tsx
<CellarHero wineName="..." displayName="..." bottleColor="..." producerName="Krug" vintage={null} />
// ProducerLine: "Krug" (vintage 없이)
```

### 3. vintage만 있고 producer 없음

```tsx
<CellarHero wineName="..." displayName="..." bottleColor="..." producerName={null} vintage={2020} />
// ProducerLine: "2020"
```

### 4. producer, vintage, region, country 모두 없음
h1만 렌더. ProducerLine, RegionLine 모두 미렌더.

```tsx
<CellarHero wineName="Unknown Wine" displayName="Unknown" bottleColor="#3D1C02" />
// h1만 표시
```

### 5. bottleColor fallback
`wine.bottle_color`가 null이면 `getDefaultBottleColor(typeCanon)` 로 fallback.

```tsx
const typeCanon = asTypeCanonical(wine.type_canonical);
const bottleColor = wine.bottle_color ?? getDefaultBottleColor(typeCanon);

<CellarHero bottleColor={bottleColor} ... />
```

## 시각 스펙

| 요소 | 스펙 |
|------|------|
| 외곽 패딩 | `px-4 pb-2` |
| Hero 프레임 | height 240, `borderRadius: 18`, `border: 1px border.default` |
| 그라데이션 | 160deg, `bottleColor → #1a0a1e` at 70% (`cellarDetailHeroGradient`) |
| WineLabelArt | 100×150, 중앙 정렬 |
| h1 | Playfair 24px, `text-text-primary`, `marginTop: 12`, `marginBottom: 4`, `letterSpacing: -0.24`, `numberOfLines: 2` |
| ProducerLine | Inter 13px, `text-text-secondary`, `numberOfLines: 1` |
| RegionLine | Inter 12px, `text-text-muted`, `marginTop: 2`, `numberOfLines: 1` |

## 주의사항

- `wineName`과 `displayName`을 분리한 이유: h1은 locale 기반(한국어 우선), WineLabelArt 이니셜은 영문 표준명에서 추출
- producer + vintage 조합 로직은 컴포넌트 내부에서 처리 — 호출부에서 별도 포맷팅 불필요
