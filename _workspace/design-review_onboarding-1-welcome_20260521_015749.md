# 디자인 리뷰 — /onboarding/1-welcome

> **버전:** 1차 검증 (Day 6 retroactive hardening)
> **작성:** design-reviewer
> **타임스탬프:** 20260521_015749
> **소비자:** rn-screen-builder (반려 시), qa-inspector (통과 시)

---

## 0. 대상

| 축 | 경로 | 비고 |
|---|---|---|
| 사양 | `_workspace/design-specs/onboarding-1-welcome.md` | design-spec-author 산출물 (352 lines) |
| 키스크린 JSX (원본) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 47~169 | `<main>` wrapper + `StepWelcome` |
| 키스크린 스크린샷 | `_workspace/keyscreen-shots/onboarding.png` | 1600×2560, welcome step 노출 |
| 현재 RN 구현 | `app/onboarding/1-welcome.tsx` (36 LOC) | + `app/onboarding/_layout.tsx` (13 LOC) |
| 보조 자료 | `src/lib/design-tokens.ts`, `tailwind.config.ts`, `src/lib/i18n/{ko,en}.json` | 토큰·i18n 정합성 검증용 |

**SCOPE-OUT (이번 검증 외):** Day 6 settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav + AppHeader.

---

## 1. 키스크린 시각 요약 (멀티모달 분석)

스크린샷 onboarding.png(welcome step) 시각 측정:

- 상단 중앙: "winemine" (Playfair regular, cream `#F5F0E8`, ~56pt, negative letterspacing, line 1.0)
- 그 아래: "한 잔의 와인, 한 점의 지도" (Playfair italic, gold `#C9A84C`, ~18pt)
- 그 아래 12pt 여백: 90×90 원형 frame, radial glow (중심 cream-tint → wineRed-tint → transparent), 안에 GlassWater 와인잔 아이콘(56px gold stroke 1.25)
- 하단 중앙: "시작하기" wine-red full-width 버튼 (52pt h, cream text)
- 배경: deep purple `#251837` (`bg.deepest` dark)
- 상단 group과 하단 CTA 사이 큰 빈 공간 — viewport 절반 (수직 가운데 정렬 + `marginTop:auto`)

**키 디자인 인텐트:** 워드마크 + tagline + 와인잔 글로우 3-원소가 수직 중앙 정렬되어 brand 첫인상을 형성. CTA는 하단 push.

---

## 2. 6항목 체크리스트

### (a) 요소 누락 — **FAIL**

| 요소 | 키스크린 | 현재 RN | 판정 |
|---|---|---|---|
| Logo "winemine" 워드마크 | O (line 110~124, Playfair 56 cream) | O (1-welcome.tsx:17 `font-playfair text-cream`, fontSize:56) | OK |
| **Tagline (Playfair italic 18 gold)** | O (line 125~138, `t('tagline')`) | **X — 누락. 대신 `welcome.title` (Playfair 24 text-primary "와인의 모든 순간을 기록합니다") + `welcome.subtitle` (Inter 13 text-secondary)로 교체됨** | **MISS** |
| **GlassGlowFrame 90×90 + radial-gradient** | O (line 139~156, radial-gradient) | **X — 완전 누락** | **MISS** |
| **GlassWater 아이콘 56px gold** | O (line 155, `<GlassWater size={56} strokeWidth={1.25}/>`) | **X — 완전 누락. lucide-react-native import 없음** | **MISS** |
| PrimaryButton "시작하기" | O (line 163~165, variant primary, lg, block) | O (1-welcome.tsx:28~32, size="lg") | OK (block 동작은 wrapper로 달성) |
| CTA 하단 push (`marginTop:auto`) | O (line 161) | △ — `<View className="pb-2">`로 단순 pb만. 외부 wrapper 구조가 marginTop:auto 의미와 다름 | 부분 OK (시각상은 비슷하나 패턴 불일치) |
| framer-motion staggered fade-in | O (4 요소, delay 0.2/0.5/0.7/0.8) | X (사양 §5에서 deviation 의도적 — P2 보류) | OK (사양 명시 deviation) |

**증거 (파일:라인):**
- `app/onboarding/1-welcome.tsx:20~25` — 키스크린에 없는 title/subtitle 두 줄을 노출 중. 키스크린 원본은 워드마크 바로 아래 한 줄 italic tagline만.
- `app/onboarding/1-welcome.tsx:16~26` — GlassGlowFrame + GlassWater 아이콘 전체 누락. 사양 §1·§9-1 verbatim 요구.

**결론:** 사양 §9의 retroactive 수정 폭 8건 중 큰 3건(아이콘 + 글로우 + tagline 교체)이 미반영. **FAIL**

---

### (b) Spacing 비율 — **FAIL**

| 항목 | 키스크린 (CSS) | 현재 RN | 판정 |
|---|---|---|---|
| PageRoot padding | `32px 24px 40px` (top/horizontal/bottom) | `px-6` + `paddingTop: insets.top` + `paddingBottom: Math.max(insets.bottom, 16)` | **MISS** — top 32 / bottom 40 누락. SafeArea만 적용 (iPhone 13 기준 top~47 bottom~34지만 의미적으로 키스크린 추가 32/40 여백 부재) |
| PageRoot gap | `gap: 24` (자식 간) | 미지정 (`gap-6` 없음) | **MISS** — 단일 자식 구조라 시각상 영향 없으나 키스크린 패턴 불일치 |
| StepRoot gap (Logo/Tagline/Glass 간) | `gap: 16` | Title→subtitle만 `mt-3` (=12), tagline·Glass 없음 | **MISS** — gap-4 (16) 적용 안 됨 |
| Glass top spacing | `marginTop: 12` (tagline → glass) | (Glass 누락) | N/A |
| CTA wrapper | `marginTop: 'auto'` + `width: 100%` | `<View className="pb-2">` — 단순 패딩 | **PARTIAL** — pb-2(=8)만 적용, marginTop:auto 패턴이 아님 (외부 `<View className="flex-1 items-center justify-center">`로 컨텐츠 중앙 + 형제 wrapper로 하단). 시각상은 비슷하나 정렬 의미 다름 |

**증거:**
- `app/onboarding/1-welcome.tsx:14` — `paddingTop: insets.top` (키스크린은 `insets.top + 32`)
- `app/onboarding/1-welcome.tsx:14` — `paddingBottom: Math.max(insets.bottom, 16)` (키스크린은 `insets.bottom + 40`)
- `app/onboarding/1-welcome.tsx:16` — StepRoot에 `gap-4` 미적용

**결론:** 페이지 padding 32/40 누락 + StepRoot gap-4 미적용 + CTA marginTop:auto 패턴 불일치. **FAIL**

---

### (c) Gradient 방향·깊이 — **FAIL**

| 요소 | 키스크린 | 현재 RN | 판정 |
|---|---|---|---|
| GlassGlowFrame radial gradient | `radial-gradient(circle at 50% 35%, rgba(245,240,232,0.18) 0%, rgba(139,26,42,0.18) 60%, rgba(0,0,0,0) 100%)` | **완전 누락** (Glass 자체가 없음) | **MISS** |
| 배경 gradient | 없음 (단색 `var(--color-bg-deepest)`) | 없음 (단색 `bg-bg-deepest`) | OK |

**증거:**
- 키스크린 line 147~148의 radial-gradient가 시각의 가장 강한 ‘브랜드 인상’을 만드는 요소. 스크린샷에서 와인잔 아이콘 뒤 부드러운 글로우가 명확히 보임.
- 사양 §6 deviation에 `react-native-svg <RadialGradient>` 대체안 명시되어 있으나 현재 RN 구현은 이 대체조차 부재.

**결론:** 키 시각 요소인 radial glow 누락. **FAIL**

---

### (d) Corner radius — **FAIL** (Glass 누락에 의한)

| 요소 | 키스크린 | 현재 RN | 판정 |
|---|---|---|---|
| GlassGlowFrame | `borderRadius: 45` (90×90 → full) | 누락 | **MISS** |
| PrimaryButton | 기존 컴포넌트 기본 radius (size=lg) | 기존 컴포넌트 사용 (변경 없음) | OK (PrimaryButton 컴포넌트 위임) |

**증거:** Glass element 자체가 없어 radius 검증 대상 부재.

**결론:** Glass frame 누락으로 인한 PARTIAL FAIL. 단독 radius 이슈는 없음. (실질적 이슈는 (a)·(c)에 포함)

---

### (e) Typography 위계 — **FAIL**

키스크린 시각 위계:
```
Logo:    Playfair Regular  56pt / lh 56     / letterSpacing -1.12 (= 56 × -0.02em) / cream
Tagline: Playfair ITALIC   18pt              / gold
```

현재 RN 위계 (`app/onboarding/1-welcome.tsx:17~25`):
```
Logo:     Playfair text-cream  fontSize 56 / letterSpacing 0.5 (양수, 잘못됨)
Title:    font-playfair text-page-title text-text-primary mt-10 (24pt — 키스크린 미존재 요소)
Subtitle: font-inter   text-card-body text-text-secondary mt-3   (13pt — 키스크린 미존재 요소)
```

**FAIL 사유:**

1. **letterSpacing 부호 오류 (CRITICAL):** Logo letterSpacing이 `0.5` (양수)로 적용됨. 키스크린은 `-0.02em` = `-1.12px` (음수). 양수 letterSpacing은 글자 사이가 벌어지는 효과인데, Playfair Display 같은 serif 워드마크는 negative tracking이 표준 (브랜드 인상 결정). 시각 차이 매우 큼.
   - 파일: `app/onboarding/1-welcome.tsx:17` — `style={{ fontSize: 56, letterSpacing: 0.5 }}`
   - 수정: `letterSpacing: -1.12`

2. **Tagline (Playfair italic 18 gold) 누락:** 키스크린 의도된 brand voice("한 잔의 와인, 한 점의 지도")가 완전히 사라지고, 다른 의미의 카피("와인의 모든 순간을 기록합니다")가 대체. 위계도 다름 (italic vs regular, gold vs text-primary).
   - 파일: `app/onboarding/1-welcome.tsx:20~25`

3. **위계 깊이 부족:** 키스크린은 [56 cream] → [18 italic gold] → [icon] 3단계 위계로 시각 무게가 명확. 현재 RN은 [56 cream양수] → [24 primary] → [13 secondary] → CTA로 4단계 텍스트가 쌓여 산만. 디자인 의도와 다름.

**결론:** letterSpacing 부호 + tagline 교체 + 위계 단계 수 모두 어긋남. **FAIL**

---

### (f) Color 사용 — **PASS (소소한 권고)**

| 항목 | 검사 | 판정 |
|---|---|---|
| 하드코딩 hex 검출 | `app/onboarding/1-welcome.tsx` grep 결과 — hex 없음 | OK |
| bg-bg-deepest 토큰 | `bg-bg-deepest dark:bg-bg-deepest` 사용 (tailwind.config.ts에 dual 정의됨 `#251837`/`#FAF5EC`) | OK |
| text-cream 토큰 | tailwind.config.ts에 `cream: '#F5F0E8'` 등록됨 | OK |
| 하지만: dark:bg-bg-deepest 중복 | `bg-bg-deepest`만으로 NW v4 dual 토큰 자동 분기 가능. `dark:bg-bg-deepest` 중복은 동작은 맞으나 의미 없음 (사양 §9-7 cleanup 권장) | NIT (PASS 인정) |
| (참고) Tagline 추가 시 `text-gold` 사용 가능 여부 | tailwind.config.ts에 `gold: '#C9A84C'` 등록 — OK | OK (사전 검증) |

**증거:** 현재 RN 파일에 raw hex 없음. 토큰 사용 일관.

**결론:** 색 토큰 사용 자체는 PASS. 단, **누락된 tagline + glass icon이 추가될 때 같은 토큰 규율을 유지해야 함**을 rn-screen-builder 작업 시 점검 요청.

---

## 3. 다크/라이트 양쪽 모드

| 모드 | 키스크린 의도 | 현재 RN | 판정 |
|---|---|---|---|
| dark | bg `#251837` / Logo cream / Tagline gold | bg OK / Logo cream OK / Tagline 없음 | PARTIAL (요소 누락) |
| light | bg `#FAF5EC` / Logo `text-primary` → `#2A1A14` / Tagline `gold-deep` `#B89438` | tailwind dual 토큰으로 자동 분기 — bg·Logo 색은 OK / Tagline 없음 | PARTIAL (요소 누락) |

**WCAG 대비 (light 모드 사전 점검):**
- Logo `#2A1A14` / 배경 `#FAF5EC` → 약 16:1 (AAA) — OK
- (Tagline 추가 후 검증 필요) gold `#B89438` / 배경 `#FAF5EC` → 약 3.9:1 — 18pt Playfair는 Large Text 분류 (3:1 통과) — OK

**결론:** 양쪽 모드 자동 분기 동작은 OK. 누락 요소가 보강된 후 재검증 필요.

---

## 4. 멀티모달 스크린샷 비교

`_workspace/keyscreen-shots/onboarding.png` (welcome step) vs 현재 RN 구현 시각 차이:

| 시각 인상 | 키스크린 | 현재 RN (코드 기반 추정) |
|---|---|---|
| 첫 인상 | 워드마크 + italic tagline + 와인잔 글로우 = brand 시그니처 | 워드마크 + 일반 카피 + 부제 = 일반 앱 splash |
| 수직 무게 분포 | Logo(중심) → Tagline → Glass(아래) — 점층 | Logo → Title → Subtitle → (큰 빈 공간) → CTA — 분산 |
| 색감 | Cream(top) + Gold(middle) + Wine-red glow(bottle 아이콘 주변) — warm 3색 | Cream(top) + 회색 톤(아래) — 2색 |
| 시각 임팩트 | 강함 (radial glow가 시선 집중 효과) | 약함 (텍스트만으로 채워짐, 브랜드 자산 부재) |

**결론:** 시각 차이 매우 큼. 사용자가 첫 화면에서 받는 brand 인상이 키스크린 의도와 크게 다름.

---

## 5. SCOPE-IN 사양 escalation 검토 (사양 §10 Q1·Q2)

### Q1 — 기존 `onboarding.welcome.title/subtitle` i18n 키 보존 vs 제거

**design-reviewer 판단:** **보존 권장 (사양 권장과 일치)**

사유:
- i18n 키 삭제는 다른 화면/컴포넌트가 참조할 가능성을 닫음. 현재 빠른 grep 결과 1-welcome.tsx 외 참조처 없으나, 향후 onboarding step 확장 시 재활용 가능성.
- 키 보존 비용 = 0 (i18n linter가 dead key 경고 시에만 정리).
- 다만 **사용 위치에서는 반드시 제거**하고 `onboarding.tagline` 신규 키로 교체.

### Q2 — framer-motion staggered fade-in 애니메이션 RN 구현 여부

**design-reviewer 판단:** **이번 cycle 보류, P2 후속**

사유:
- 1주 alpha 빌드 우선 (디자인 게이트 통과가 우선, polish는 후행).
- Welcome은 1회성 화면 — 사용자가 두 번째 노출되지 않음. 애니메이션 가치 대비 Reanimated 의존 도입 비용 큼.
- 시각 본체(아이콘·tagline·glow)가 정적으로도 충분히 brand 표현 가능.
- **단, 이번 디자인 리뷰의 다른 FAIL이 해결된 후** 정적 상태가 키스크린 시각 인상의 90% 이상을 달성하면 P2에서 추가 검토. 미달 시 Reanimated FadeInUp 추가.

---

## 6. 결정

### 결과: **FAIL (6항목 중 5 FAIL)**

| 항목 | 판정 |
|---|---|
| (a) 요소 누락 | FAIL |
| (b) Spacing 비율 | FAIL |
| (c) Gradient 방향·깊이 | FAIL |
| (d) Corner radius | PARTIAL FAIL (Glass 누락 의존) |
| (e) Typography 위계 | FAIL |
| (f) Color 사용 | PASS |

**FAIL 수: 5 / 6**

---

## 7. rn-screen-builder 수정 요청 (구체)

우선순위 P0 (시각 인상 회복 — 반드시):

**[1] Tagline 추가 (Playfair italic 18 gold) — Logo 바로 아래**
- 파일: `app/onboarding/1-welcome.tsx` (16~26 사이)
- 변경: title/subtitle 두 줄 제거 → tagline 한 줄로 교체
- i18n 키 신규 추가 필요:
  - `src/lib/i18n/ko.json` `onboarding.tagline`: `"한 잔의 와인, 한 점의 지도"`
  - `src/lib/i18n/en.json` `onboarding.tagline`: `"A glass of wine, a pin on the map"`
- 코드 (참고 — 정확한 구현은 builder 판단):
  ```tsx
  <Text
    className="font-playfair italic text-gold text-center"
    style={{ fontSize: 18 }}
  >
    {t('onboarding.tagline')}
  </Text>
  ```

**[2] GlassGlowFrame + GlassWater 아이콘 추가**
- 파일: `app/onboarding/1-welcome.tsx` (tagline 아래에 추가)
- 의존 라이브러리: `react-native-svg` (이미 설치되어 있을 것 — capture 화면 사용), `lucide-react-native` (확인 필요)
- 사양 §6 deviation 표 verbatim 따름. RadialGradient + Circle + GlassWater overlay.
- 사양 §9 P0 신규 토큰 0건 (기존 brand.cream / brand.wineRed / brand.gold 사용).

**[3] Logo letterSpacing 부호 수정**
- 파일: `app/onboarding/1-welcome.tsx:17`
- 변경: `letterSpacing: 0.5` → `letterSpacing: -1.12`
- 추가: `lineHeight: 56` (키스크린 `lineHeight: 1` = size × 1.0).

**[4] PageRoot 추가 padding 32/40**
- 파일: `app/onboarding/1-welcome.tsx:14`
- 변경:
  ```tsx
  style={{
    paddingTop: insets.top + 32,
    paddingBottom: Math.max(insets.bottom, 0) + 40,
  }}
  ```
  (insets에 키스크린 의도된 32/40을 추가)

**[5] StepRoot gap-4 + marginTop:auto CTA 패턴**
- 파일: `app/onboarding/1-welcome.tsx:16, 27`
- 변경: 내부 wrapper를 사양 §1 트리 구조로 정렬
  ```tsx
  <View className="flex-1 items-center justify-center gap-4">
    {/* Logo / Tagline / Glass */}
  </View>
  <View className="w-full" style={{ marginTop: 'auto' }}>
    <PrimaryButton ... />
  </View>
  ```
  또는 동일 의미가 되도록 정렬 (현재 `<View className="pb-2">`는 marginTop:auto 패턴이 아님).

**[6] (cleanup) 중복 dark: prefix 제거**
- 파일: `app/onboarding/1-welcome.tsx:13`
- 변경: `className="flex-1 bg-bg-deepest dark:bg-bg-deepest px-6"` → `className="flex-1 bg-bg-deepest px-6"` (NW v4 dual 토큰이 자동 분기)
- 사양 §9-7 권장. 비차단 — 후속 cleanup 권장.

**예상 LOC 변화:** 36 → 약 65 LOC (사양 §9 예측과 일치).

---

## 8. design-spec-author 보강 요청

해당 없음 — **사양 자체는 충분히 정합**. 갭은 모두 RN 구현 미반영에서 발생.

단, **사양 §10 escalation Q1/Q2에 대한 design-reviewer 판단**(위 §5)이 추가 정보로 사양 v2에 부록 가능. 필수 아님.

---

## 9. 토큰 / i18n 보강 요청

| 종류 | 항목 | 대상 | 우선순위 |
|---|---|---|---|
| 신규 토큰 | (없음) — 기존 brand.cream/wineRed/gold + tailwind cream/gold/bg-deepest로 충분 | — | — |
| 신규 i18n 키 | `onboarding.tagline` (ko + en 2건) | rn-screen-builder 작업 시 함께 commit | **P0** |
| 의존 라이브러리 확인 | `react-native-svg` (radial gradient용) — 이미 설치 추정 | builder가 import 시 확인 | P0 |
| 의존 라이브러리 확인 | `lucide-react-native` (GlassWater 아이콘) — capture 화면에서 사용 중일 가능성 | builder가 import 시 확인 | P0 |

---

## 10. 재검증 시점

rn-screen-builder가 위 §7의 [1]~[5]를 수정한 뒤 design-reviewer에 재검증 요청. 동일 6항목 체크리스트로 2차 검증 실행.

**[6] cleanup은 차단 사유 아님** — 2차에서 PASS 처리 후 별도 cleanup PR 가능.

---

## 11. 보고서 메타

- 작성: design-reviewer / Day 6
- 보고 대상: rn-screen-builder (수정), 리더 (FAIL 통지)
- 다음 단계: rn-screen-builder 수정 → 2차 재검증 → PASS 시 qa-inspector
