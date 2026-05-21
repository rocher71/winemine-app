# 디자인 리뷰 — /home WineFeed (horizontal card 1차)

- 일시: 2026-05-21 12:05:12
- 검증자: design-reviewer
- 사이클: 1차 (PATCH §3-8-PATCH 적용 후 첫 게이트)

## 대상

- 사양: `_workspace/design-specs/home.md` §3-8 + §3-8-PATCH (line 980~1108) — **PATCH가 진실 소스**
- 키스크린 원본 (참고): `../winemine-keyscreen/src/components/home/wine-feed.tsx`
- 키스크린 reference: 사용자 제공 image #7 (winemine-keyscreen.vercel.app horizontal card)
- 키스크린 screenshot (보조): `_workspace/keyscreen-shots/home.png`
- 현재 RN: `src/components/home/wine-feed.tsx`
- SCOPE-OUT: BottomNav (F1 fix), 데이터 소스 (mock OK), AppHeader, light gold 대비 (별도 cycle)

## 진실 소스 정책 (사이클 1차)

§3-8-PATCH가 §3-8 원본 매핑표 행을 **override** (사양 line 1105 "PATCH 행이 override"). 따라서:

- 키스크린 verbatim 값(40×130 bottle, padding 12, gap 12, radius 12, name 15/18, chevron 16)은 **참고용**.
- PATCH 값(bottle 90×150 + column 96, padding 16, gap 16, radius 14, name 16/19.2 2줄, chevron 제거, name+stretch 등)이 **PASS 기준**.

## 6항목 체크리스트

---

### (1) 요소 누락 — FAIL

PATCH §3-8-PATCH에서 명시한 신규 구조 요소 누락.

| PATCH 기대 | 현재 RN | 위치 | 판정 |
|---|---|---|---|
| Bottle 전용 column (`width 96, items-center, justify-center`) | 없음. WMBottle이 row의 직접 child | wine-feed.tsx:201 | FAIL |
| ChevronRight **제거** | `<ChevronRight size={16} color={tokens.text.muted} />` 잔존 | wine-feed.tsx:260 | FAIL |
| items 정렬 **stretch** | `alignItems: 'center'` | wine-feed.tsx:195 | FAIL |
| 우측 column `justify-content: center` (chevron 없음 전제) | `justify-content: 'space-between'` (chevron 같이 있음 가정) | wine-feed.tsx:238 | FAIL |
| accessibilityLabel 통합 (`name + producer + vintage + score + price`) | `${wine.name} ${wine.producer} ${wine.vintage}` — 평점/가격 누락 | wine-feed.tsx:191 | FAIL |
| accessibilityHint `home.wineFeed.openDetail` | 미설정 | wine-feed.tsx:185-200 | FAIL |
| Wine name `numberOfLines={2}` (2줄 clamp) | `numberOfLines={1}` | wine-feed.tsx:206 | FAIL |

증거(원본·PATCH·현재 비교):
- PATCH line 994 "Bottle 전용 column: width 96, items-center, justify-center" — RN 미적용
- PATCH line 1007 "ChevronRight: 제거" — RN wine-feed.tsx:260 잔존
- PATCH line 993 "items 정렬: stretch" — RN wine-feed.tsx:195 `alignItems: 'center'`
- PATCH line 1002 "Right column justify: center (chevron 없음)" — RN `space-between`
- PATCH line 996 "Wine name Playfair 16 lh 19.2 (2줄)" — RN `numberOfLines={1}` (1줄)
- PATCH line 1055 accessibilityLabel 4개 정보 통합 — RN 3개만
- PATCH line 1056 accessibilityHint i18n key — RN 미설정

---

### (2) Spacing 비율 — FAIL

| PATCH 기대 | 현재 RN | 위치 | 판정 |
|---|---|---|---|
| WineFeedRow padding **16** | `padding: 12` | wine-feed.tsx:197 | FAIL |
| WineFeedRow gap **16** | `gap: 12` | wine-feed.tsx:196 | FAIL |
| Right column minWidth **76** | `minWidth: 70` | wine-feed.tsx:240 | FAIL |
| Rating row gap **5** | `gap: 4` | wine-feed.tsx:244 | FAIL |
| Bottle column width **96** (신규) | column 자체 없음 (WMBottle 직접) | wine-feed.tsx:201 | FAIL |
| section paddingHorizontal 16 (list 컨테이너) | `paddingHorizontal: 16` | wine-feed.tsx:327 | PASS |
| section header padding 0/20/8 | `paddingBottom: 8, paddingHorizontal: 20` | wine-feed.tsx:286-287 | PASS |
| tab list padding 0/20/10 | `paddingHorizontal: 20, paddingBottom: 10` | wine-feed.tsx:306 | PASS |
| tab list gap 6 | `gap: 6` | wine-feed.tsx:306 | PASS |
| list column gap 8 | `gap: 8` | wine-feed.tsx:327 | PASS |

section/header/tab spacing은 모두 PASS. **카드 내부 spacing (padding/gap/bottle column/right column)만 FAIL** — PATCH 핵심 변경 적용 안 됨.

---

### (3) Gradient 방향·깊이 — PASS (해당 없음)

WineFeed 카드에 gradient 사용처 없음 (키스크린·PATCH·RN 모두 단색 surface). 해당 항목 없음 → PASS 처리.

---

### (4) Corner radius — FAIL

| PATCH 기대 | 현재 RN | 위치 | 판정 |
|---|---|---|---|
| WineFeedRow radius **14** | `rounded-xl` (12) | wine-feed.tsx:192 | FAIL |
| TabChip radius 14 | `borderRadius: 14` | wine-feed.tsx:162 | PASS |

증거:
- PATCH line 992 "radius 12 → 14 (다른 home 카드 MapCameo/DraftNoteResume와 일관성)" — RN `rounded-xl` (NW v4 = 12px). PATCH 기대 14px 미적용.
- 수정: `className`의 `rounded-xl` 제거 + `style={{ borderRadius: 14 }}` 추가 (또는 `radius['14']` 토큰 import).

---

### (5) Typography 위계 — FAIL

| 노드 | PATCH 기대 | 현재 RN | 위치 | 판정 |
|---|---|---|---|---|
| Wine name | Playfair **16 / lh 19.2** / numberOfLines 2 | Playfair 15 / lh 18 / numberOfLines 1 | wine-feed.tsx:205-206 | FAIL |
| Producer line | Inter **12 / lh 14.4** | Inter 11 (lh 미설정) | wine-feed.tsx:212 | FAIL |
| Location MapPin size | **11** | 10 | wine-feed.tsx:218 | FAIL |
| Location text | Inter 11 (변경 없음) | Inter 11 | wine-feed.tsx:221 | PASS |
| Grapes | Inter **11 op 0.85** | Inter 10 op 0.85 | wine-feed.tsx:229 | FAIL |
| Rating score | Inter **12 / 600 gold** | Inter 11 / 600 gold | wine-feed.tsx:248 | FAIL |
| WMGlassRating size | **10** | 8 | wine-feed.tsx:245 | FAIL |
| Price | Playfair **14 / lh 16.8** | Playfair 13 (lh 미설정) | wine-feed.tsx:255 | FAIL |
| section h2 | Playfair 18 | Playfair 18 | wine-feed.tsx:292 | PASS |
| section subtitle | Inter 11 | Inter 11 | wine-feed.tsx:298 | PASS |
| TabChip text | Inter 11 600 | Inter 11 (semibold className) | wine-feed.tsx:170-171 | PASS |
| TabChip icon size | 13 | 13 | wine-feed.tsx:168 | PASS |

증거(7개 항목 FAIL):
- PATCH line 996: name 16/19.2 + 2줄 → RN 15/18 + 1줄 (사양 §3-8-PATCH 표 "PATCH:" 행 위반)
- PATCH line 997: producer 12/14.4 → RN 11
- PATCH line 998: MapPin 11 → RN 10
- PATCH line 1000: grapes 11 → RN 10
- PATCH line 1003: WMGlassRating 10 → RN 8
- PATCH line 1004: score 12 → RN 11
- PATCH line 1006: price 14/16.8 → RN 13 (lh 미설정)

위계 자체 순서(name > producer > location > grapes; price > score)는 보존되나 **모든 폰트가 1pt 작게 출력 + lineHeight 누락**. PATCH가 명시한 1pt 상향 + lineHeight 명시 강제 미준수.

---

### (6) Color 사용 — PASS

| 항목 | 현재 RN | 출처 | 판정 |
|---|---|---|---|
| 하드코딩 hex grep | `rg '#[0-9a-fA-F]{6}'` → 0건 | wine-feed.tsx 전체 | PASS |
| 카드 bg | `className="bg-surface dark:bg-surface"` | NW 토큰 | PASS |
| 카드 border | `border border-border-default dark:border-border-default` | NW 토큰 | PASS |
| 텍스트 색 | `text-text-primary/secondary/muted` (NW) + `tokens.text.muted` (theme hook) | design-tokens.ts | PASS |
| Gold | `brand.gold` import | design-tokens.ts | PASS |
| Bottle 색 | `bottleColorDefault[wine.type]` | design-tokens.ts | PASS |
| Alpha (gold 0.12) | `withAlpha(brand.gold, 0.12)` | design-tokens.ts | PASS |

증거:
- `rg -n '#[0-9a-fA-F]{6}\|#[0-9a-fA-F]{3}' src/components/home/wine-feed.tsx` → "NO HARDCODED HEX"
- 모든 색이 design-tokens.ts·NativeWind 토큰 경유

색 자체는 PASS. 단 **light 모드 gold score 대비 (AA 미달 2.9:1)**는 PATCH §접근성 line 1059에서 명시한 known issue — SCOPE-OUT 별도 cycle.

---

## 다크/라이트 양쪽 모드

| 모드 | 검증 가능 항목 | 판정 |
|---|---|---|
| dark (코드 정적) | 토큰 분기 (`useThemeTokens`) 정상 사용 — `tokens.border.default`, `tokens.text.muted` | PASS |
| light (코드 정적) | NW `dark:` prefix + theme hook 양쪽 — light 분기 정상 | PASS |
| light gold score 대비 | PATCH line 1059 known issue — `gold(#C9A84C) on #FFFFFF = 2.9:1 FAIL AA` | SCOPE-OUT (별도 cycle, 사양 §3-8-PATCH escalation 명시) |

코드 레벨에서는 양 모드 모두 토큰 분기 적용. 시뮬레이터 시각 캡처 미수행 (1차 게이트는 spec 매핑 검증 중심) — **PATCH 수정 후 2차 게이트에서 양 모드 캡처 비교 필수**.

---

## 멀티모달 스크린샷 비교

- `_workspace/keyscreen-shots/home.png` 존재. 단 이 이미지는 horizontal card **이전 버전** (참고 정보만).
- 사용자 제공 image #7 (winemine-keyscreen.vercel.app horizontal card) — design-reviewer 세션에 첨부되지 않음.
- 진실 소스는 **PATCH 사양**이며, 사용자 image #7은 PATCH 작성 시점에 이미 반영됨 (사양 line 983 "정확한 reference").
- 따라서 본 1차 게이트는 **PATCH 사양 vs RN 코드 매핑 검증**으로 충분. 2차 게이트에서 시뮬레이터 캡처 + image #7 정성 비교 권장.

---

## 결정

- **결과: FAIL** (6항목 중 4 FAIL / 1 PASS / 1 해당없음)
  - (1) 요소 누락 FAIL (7개 항목)
  - (2) Spacing 비율 FAIL (5개 항목, 카드 내부)
  - (3) Gradient 해당없음 (PASS 처리)
  - (4) Corner radius FAIL (1개)
  - (5) Typography 위계 FAIL (7개)
  - (6) Color PASS

- **종합 평가**: 현재 RN은 PATCH **이전**의 §3-8 원본 verbatim 구조로 멈춰있음. PATCH 변경 사항(bottle 90×150 + 96 column, padding/gap 16, radius 14, typography 1pt↑, chevron 제거, name 2줄, accessibility 강화)이 코드에 반영 안 됨. rn-screen-builder가 PATCH 입력을 받지 못했거나 적용 누락.

## 라우팅

### rn-screen-builder — 수정 요청 (1차 FAIL)

**단일 파일 수정**: `src/components/home/wine-feed.tsx` (WineFeedRow 함수 내부, ~30 LOC)

#### 수정 1: WineFeedRow 카드 컨테이너 (line 184-200)

```diff
- className="rounded-xl bg-surface dark:bg-surface border border-border-default dark:border-border-default"
+ className="bg-surface dark:bg-surface border border-border-default dark:border-border-default"
  style={({ pressed }) => ({
    flexDirection: 'row',
-   alignItems: 'center',
-   gap: 12,
-   padding: 12,
+   alignItems: 'stretch',
+   gap: 16,
+   padding: 16,
+   borderRadius: 14,
    opacity: pressed ? 0.9 : 1,
+   transform: [{ scale: pressed ? 0.99 : 1 }],
  })}
+ accessibilityHint={t('home.wineFeed.openDetail')}
+ accessibilityLabel={`${wine.name} ${wine.producer} ${wine.vintage} 평점 ${wine.score.toFixed(1)} 가격 ₩${formatKrwShort(wine.priceKrw, i18n.language)}`}
```

#### 수정 2: Bottle 전용 column 추가 (line 201)

```diff
- <WMBottle width={40} height={130} bottleColor={bottleColor} type={wine.type} />
+ <View style={{ width: 96, alignItems: 'center', justifyContent: 'center' }}>
+   <WMBottle width={90} height={150} bottleColor={bottleColor} type={wine.type} />
+ </View>
```

#### 수정 3: Meta 컬럼 typography (line 203-233)

```diff
  <Text
    className="font-playfair text-text-primary dark:text-text-primary"
-   style={{ fontSize: 15, lineHeight: 18 }}
-   numberOfLines={1}
+   style={{ fontSize: 16, lineHeight: 19.2 }}
+   numberOfLines={2}
  >

  <Text
    className="font-inter text-text-secondary dark:text-text-secondary"
-   style={{ fontSize: 11 }}
+   style={{ fontSize: 12, lineHeight: 14.4 }}

- <MapPin size={10} ... />
+ <MapPin size={11} ... />

  <Text  /* grapes */
-   style={{ fontSize: 10, marginTop: 1, opacity: 0.85 }}
+   style={{ fontSize: 11, marginTop: 1, opacity: 0.85 }}
```

#### 수정 4: 우측 column — chevron 제거 + center 정렬 (line 235-261)

```diff
  <View
    style={{
      alignItems: 'flex-end',
-     justifyContent: 'space-between',
+     justifyContent: 'center',
      flexShrink: 0,
-     minWidth: 70,
+     minWidth: 76,
    }}
  >
-   <View style={{ alignItems: 'flex-end', gap: 3 }}>
+   <View style={{ alignItems: 'flex-end', gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
-       <WMGlassRating value={wine.score} size={8} />
+       <WMGlassRating value={wine.score} size={10} />
        <Text
          className="font-inter-semibold"
-         style={{ color: brand.gold, fontSize: 11 }}
+         style={{ color: brand.gold, fontSize: 12 }}
        >
          {wine.score.toFixed(1)}
        </Text>
      </View>
      <Text
        className="font-playfair text-text-primary dark:text-text-primary"
-       style={{ fontSize: 13 }}
+       style={{ fontSize: 14, lineHeight: 16.8 }}
      >
        ₩{formatKrwShort(wine.priceKrw, i18n.language)}
      </Text>
    </View>
-   <ChevronRight size={16} color={tokens.text.muted} />
  </View>
```

#### 수정 5: t import 추가 (WineFeedRow 함수 내부)

```diff
  function WineFeedRow({ wine }: { wine: MockWine }) {
    const tokens = useThemeTokens();
    const bottleColor = bottleColorDefault[wine.type];
-   const { i18n } = useTranslation();
+   const { t, i18n } = useTranslation();
```

### design-spec-author — 보강 요청 없음

PATCH 사양 자체는 완전. RN이 PATCH를 누락한 게 원인.

단 **i18n 신규 키** (`home.wineFeed.openDetail`)는 PATCH line 1064에 명시되어 있으나 `src/lib/i18n/{ko,en}.json`에 추가 필요 — rn-screen-builder가 같은 수정 사이클에 처리 가능 (사양 갭 아님).

### infra-architect — 토큰 확장 요청 없음

PATCH line 1011 "신규 토큰 없음" 명시. 모든 변경은 기존 `radius['14']`, `brand.gold`, `bottleColorDefault` 등 재사용. P0 세션 트리거 불필요.

### 리더 — escalation 없음

1차 FAIL은 정상 사이클. PATCH 반영 후 2차 게이트 (시뮬레이터 캡처 + 양 모드 시각 비교)로 진행.

## 토큰 확장 누적 (P0 세션)

본 사이클 추가 항목 **없음**. 기존 P0 큐 변경 없음.

## 재검증 시점

rn-screen-builder가 위 5개 diff 적용 → 동일 6항목 체크리스트로 2차 게이트 실행.

**2차 게이트 추가 항목**:
- 시뮬레이터 dark/light 양 모드 캡처
- 사용자 image #7과 정성 비교
- 카드 1개 시각 비율 (병:meta:right column ≈ 96:flex:76)
- 한글/영문 긴 와인명 wrap·ellipsis 확인
- accessibilityLabel 통합 읽기 (스크린리더 시뮬레이션)

## 작업자 노트

- 본 1차 게이트는 PATCH 사양 line 1079-1093의 "검증 체크리스트" 항목을 그대로 기준 삼음.
- PATCH 13개 체크 항목 중 9개 FAIL (padding/gap/radius, bottle 차원, name font + 2줄, chevron 제거, rating row, price) + 4개 PASS (color 토큰, dark 분기, Playfair 폰트, Haptics).
- 카드 1개당 시각 영향이 크고 mock 와인 3종 모두 동일 패턴 — 수정 후 시각 차이 가시.
- WMBottle 컴포넌트 자체 수정 불필요 (PATCH line 1099 "viewBox 자동 fit" 확인 — width/height props만 변경).
