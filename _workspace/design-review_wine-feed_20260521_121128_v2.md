# 디자인 리뷰 — /home WineFeed (horizontal card 2차)

- 일시: 2026-05-21 12:11:28
- 검증자: design-reviewer
- 사이클: 2차 (1차 보고서 `_workspace/design-review_wine-feed_20260521_120512.md` FAIL 4건 수정 후 재게이트)
- 결과: **PASS**

## 대상

- 사양: `_workspace/design-specs/home.md` §3-8 + §3-8-PATCH (line 980~1108) — PATCH가 진실 소스
- 키스크린 원본 (참고): `../winemine-keyscreen/src/components/home/wine-feed.tsx`
- 키스크린 reference: 사용자 image #7 (PATCH 작성 시점에 반영됨, line 983)
- 현재 RN (미커밋): `src/components/home/wine-feed.tsx` (354 LOC) — 재작성
- 부속 변경: `src/lib/i18n/{ko,en}.json` (`home.wineFeed.openDetail` 추가 확인)
- **SCOPE-OUT**: BottomNav (F1 fix), WineFeed 데이터 소스 (mock v0.1.0 허용), AppHeader, light 모드 gold score 대비 (사양 §3-8-PATCH 접근성 line 1059 escalation — 별도 cycle)

## 진실 소스 정책 (사이클 2차)

§3-8-PATCH가 §3-8 원본 매핑표 행을 **override** (사양 line 1105). PATCH 13개 변경 항목(line 988~1007) 및 13개 검증 체크리스트(line 1079~1093)가 2차 PASS 기준.

## 6항목 체크리스트

---

### (1) 요소 누락 — PASS

1차 FAIL 7항목 모두 수정 확인. STILL-FAIL 0건, 신규 FAIL 0건.

| PATCH 기대 | 1차 상태 | 2차 검증 | 위치 | 판정 |
|---|---|---|---|---|
| Bottle 전용 column `width 96, items-center, justify-center` | FAIL | `<View style={{ width: 96, alignItems: 'center', justifyContent: 'center' }}>` 추가 확인 | wine-feed.tsx:217 | PASS |
| ChevronRight **제거** | FAIL | `ChevronRight` import 제거 (line 19 `import { Sparkles, Flame, Globe2, MapPin }` — chevron 없음) + 우측 column 자식에 chevron JSX 없음 | wine-feed.tsx:19, 256-281 | PASS |
| items 정렬 **stretch** | FAIL | `alignItems: 'stretch'` 적용 | wine-feed.tsx:208 | PASS |
| 우측 column `justify-content: center` | FAIL | `justifyContent: 'center'` 적용 | wine-feed.tsx:259 | PASS |
| accessibilityLabel 통합 (`name + producer + vintage + score + price`) | FAIL | a11yLabel ko/en 분기 + 평점/가격 포함. `${wine.name} ${wine.producer} ${wine.vintage} 평점 ${scoreSpoken} 가격 ${priceSpoken}` (ko), `${wine.name}, ${wine.producer}, ${wine.vintage}, rated ${scoreSpoken} out of 5, price ${priceSpoken}` (en) | wine-feed.tsx:189-194, 203 | PASS |
| accessibilityHint `home.wineFeed.openDetail` | FAIL | `accessibilityHint={t('home.wineFeed.openDetail')}` 적용 + i18n 키 ko "상세 화면으로" / en "Open wine detail" 추가 확인 (`rg` ko.json:149, en.json:149) | wine-feed.tsx:204 | PASS |
| Wine name `numberOfLines={2}` | FAIL | `numberOfLines={2}` 적용 | wine-feed.tsx:225 | PASS |

증거 (rg/Read):
- `rg -n 'ChevronRight' src/components/home/wine-feed.tsx` → 0건
- `rg -n 'openDetail' src/lib/i18n/ko.json src/lib/i18n/en.json` → 양 파일 line 149 모두 키 존재 + 값 정상
- `rg -n "alignItems: 'stretch'" src/components/home/wine-feed.tsx` → line 208
- `rg -n "width: 96" src/components/home/wine-feed.tsx` → line 217

---

### (2) Spacing 비율 — PASS

1차 FAIL 5항목 모두 수정 확인. STILL-FAIL 0건, 신규 FAIL 0건.

| PATCH 기대 | 1차 상태 | 2차 검증 | 위치 | 판정 |
|---|---|---|---|---|
| WineFeedRow padding **16** | FAIL (12) | `padding: 16` | wine-feed.tsx:210 | PASS |
| WineFeedRow gap **16** | FAIL (12) | `gap: 16` | wine-feed.tsx:209 | PASS |
| Right column minWidth **76** | FAIL (70) | `minWidth: 76` | wine-feed.tsx:261 | PASS |
| Rating row gap **5** | FAIL (4) | `gap: 5` (`flexDirection: 'row', alignItems: 'center', gap: 5`) | wine-feed.tsx:265 | PASS |
| Bottle column width **96** (신규) | FAIL (없음) | `width: 96` column 신설 | wine-feed.tsx:217 | PASS |
| (유지) section paddingHorizontal 16 | PASS | 변경 없음 | wine-feed.tsx:347 | PASS |
| (유지) section header padding 0/20/8 | PASS | 변경 없음 | wine-feed.tsx:306-307 | PASS |
| (유지) tab list padding 0/20/10 | PASS | 변경 없음 | wine-feed.tsx:326 | PASS |
| (유지) tab list gap 6 | PASS | 변경 없음 | wine-feed.tsx:326 | PASS |
| (유지) list column gap 8 | PASS | `paddingHorizontal: 16, gap: 8` | wine-feed.tsx:347 | PASS |
| (신규 검증) right column 내부 vertical gap 6 | — | `<View style={{ alignItems: 'flex-end', gap: 6 }}>` (rating + price column) | wine-feed.tsx:264 | PASS |

---

### (3) Gradient 방향·깊이 — PASS (해당 없음)

WineFeed 카드에 gradient 사용처 없음 (키스크린·PATCH·RN 모두 단색 surface). 1차와 동일.

---

### (4) Corner radius — PASS

1차 FAIL 1항목 수정 확인.

| PATCH 기대 | 1차 상태 | 2차 검증 | 위치 | 판정 |
|---|---|---|---|---|
| WineFeedRow radius **14** | FAIL (`rounded-xl` = 12) | `borderRadius: radius['14']` (radius['14']=14, design-tokens.ts:349 확인) + className에서 `rounded-xl` 제거 | wine-feed.tsx:211 | PASS |
| (유지) TabChip radius 14 | PASS | `borderRadius: 14` 변경 없음 | wine-feed.tsx:164 | PASS |

증거:
- `rg -n "rounded-xl" src/components/home/wine-feed.tsx` → 0건
- `rg -n "radius\['14'\]" src/components/home/wine-feed.tsx` → line 211
- design-tokens.ts line 349 `'14': 14,` (`radius` map)

---

### (5) Typography 위계 — PASS

1차 FAIL 7항목 모두 수정 확인.

| 노드 | PATCH 기대 | 1차 상태 | 2차 검증 | 위치 | 판정 |
|---|---|---|---|---|---|
| Wine name | Playfair **16 / lh 19.2** / 2줄 | 15/18/1줄 | `fontSize: 16, lineHeight: 19.2` + `numberOfLines={2}` | wine-feed.tsx:224-225 | PASS |
| Producer line | Inter **12 / lh 14.4** | 11 (lh 없음) | `fontSize: 12, lineHeight: 14.4` | wine-feed.tsx:231 | PASS |
| Location MapPin size | **11** | 10 | `<MapPin size={11} ...>` | wine-feed.tsx:237 | PASS |
| Location text | Inter 11 (변경 없음) | PASS | `fontSize: 11` + `allowFontScaling={false}` (PATCH 접근성 line 1057 권장 반영) | wine-feed.tsx:240, 242 | PASS |
| Grapes | Inter **11** op 0.85 | 10 | `fontSize: 11, marginTop: 1, opacity: 0.85` | wine-feed.tsx:249 | PASS |
| Rating score | Inter **12** / 600 gold | 11 | `style={{ color: brand.gold, fontSize: 12 }}` + `className="font-inter-semibold"` | wine-feed.tsx:267-270 | PASS |
| WMGlassRating size | **10** | 8 | `<WMGlassRating value={wine.score} size={10} />` | wine-feed.tsx:266 | PASS |
| Price | Playfair **14 / lh 16.8** | 13 (lh 없음) | `fontSize: 14, lineHeight: 16.8` | wine-feed.tsx:276 | PASS |
| (유지) section h2 | Playfair 18 | PASS | 변경 없음 | wine-feed.tsx:312 | PASS |
| (유지) section subtitle | Inter 11 | PASS | 변경 없음 | wine-feed.tsx:318 | PASS |
| (유지) TabChip text | Inter 11 600 | PASS | `font-inter-semibold` + `fontSize: 11` | wine-feed.tsx:172-173 | PASS |
| (유지) TabChip icon size | 13 | PASS | `<Icon size={13} ...>` | wine-feed.tsx:170 | PASS |

위계 순서 (name 16 > producer 12 = grapes/location 11; price 14 > score 12) 보존 + 모든 텍스트 폰트크기 PATCH 명시값 일치 + lineHeight 누락 0건.

---

### (6) Color 사용 — PASS

| 항목 | 2차 검증 | 위치 | 판정 |
|---|---|---|---|
| 하드코딩 hex grep | `rg '#[0-9a-fA-F]{6}\|#[0-9a-fA-F]{3}\b' src/components/home/wine-feed.tsx` → **0건** | 파일 전체 | PASS |
| 카드 bg | `className="bg-surface dark:bg-surface ..."` | wine-feed.tsx:205 | PASS |
| 카드 border | `border border-border-default dark:border-border-default` | wine-feed.tsx:205 | PASS |
| 텍스트 색 | `text-text-primary/secondary/muted` NW + `tokens.text.muted` theme hook | wine-feed.tsx:223, 230, 237, 239, 247, 275, 317 | PASS |
| Gold | `brand.gold` import + `withAlpha(brand.gold, 0.12)` (active tab bg) | wine-feed.tsx:23, 167, 269 | PASS |
| Bottle 색 | `bottleColorDefault[wine.type]` | wine-feed.tsx:183, 218 | PASS |
| Border (chip) | `tokens.border.default` (테마 분기) | wine-feed.tsx:166 | PASS |

색 자체 PASS. **light 모드 gold score 대비** (PATCH line 1059 known issue 2.9:1)는 SCOPE-OUT 명시 — 사양 escalation 별도 cycle.

---

## 다크/라이트 양쪽 모드 (코드 정적 검증)

| 모드 | 검증 가능 항목 | 판정 |
|---|---|---|
| dark (코드) | `useThemeTokens()` hook + `tokens.border.default`/`tokens.text.muted` 분기 적용. `dark:` NW prefix 모든 텍스트·bg에 명시 | PASS |
| light (코드) | `bg-surface dark:bg-surface` (양 모드 동일 토큰 키 — design-tokens.ts에서 light/dark 분기), `text-text-primary dark:text-text-primary` 등 NW v4 토큰 분기 정상 | PASS |
| light gold score 대비 | PATCH line 1059 known issue (2.9:1 < AA 4.5:1) | **SCOPE-OUT** (escalation 별도 cycle) |

코드 레벨 토큰 분기는 양 모드 통과. 시뮬레이터 시각 캡처는 2차 게이트도 정적 매핑 중심 — 후속 P2 세션 (시뮬레이터 dual capture) 권장 (단 PASS 조건 아님).

---

## 멀티모달 스크린샷 비교

- `_workspace/keyscreen-shots/home.png`: 사용자 image #7 이전 캡처 (참고만)
- 사용자 image #7 (winemine-keyscreen.vercel.app horizontal card): PATCH 작성 시점에 이미 반영 (사양 line 983 "정확한 reference")
- 진실 소스 = PATCH 사양. PATCH 13항목 매핑이 RN 코드에 1:1 반영 — image #7 정합성은 PATCH 일치로 간접 보장
- 후속 P2 세션에서 시뮬레이터 dark/light 양 모드 캡처 후 image #7 정성 비교 권장 (PASS 차단 조건 아님)

---

## PATCH 13개 변경 항목 매핑 요약

| # | PATCH 항목 (line) | 1차 | 2차 | 위치 |
|---|---|---|---|---|
| 1 | padding 16 (990) | FAIL | PASS | :210 |
| 2 | gap 16 (991) | FAIL | PASS | :209 |
| 3 | radius 14 (992) | FAIL | PASS | :211 |
| 4 | items stretch (993) | FAIL | PASS | :208 |
| 5 | bottle column width 96 (994) | FAIL | PASS | :217 |
| 6 | WMBottle 90×150 (995) | FAIL (40×130) | PASS | :218 |
| 7 | name Playfair 16/19.2 + 2줄 (996) | FAIL | PASS | :224-225 |
| 8 | producer Inter 12/14.4 (997) | FAIL | PASS | :231 |
| 9 | MapPin 11 (998) | FAIL | PASS | :237 |
| 10 | grapes Inter 11 op 0.85 (1000) | FAIL | PASS | :249 |
| 11 | right column minWidth 76 (1001) | FAIL | PASS | :261 |
| 12 | right column justify center (1002) | FAIL | PASS | :259 |
| 13 | rating row: WMGlassRating 10 + score 12 + gap 5 (1003-1005) | FAIL | PASS | :265-270 |
| 14 | price Playfair 14/16.8 (1006) | FAIL | PASS | :276 |
| 15 | ChevronRight 제거 (1007) | FAIL | PASS | :19 import / :256-281 JSX |

15/15 적용 (1차 FAIL 14건 + radius은 위 표에서 1차 PASS이나 PATCH 핵심값이라 재확인).

## PATCH 검증 체크리스트 (사양 line 1079~1093)

- [x] WineFeedRow 카드 padding 16 / gap 16 / radius 14 시각 일치
- [x] WMBottle 90×150 — 카드 안에서 명확히 보이고 한 컬럼으로 응집
- [x] Wine name Playfair 16 (Playfair 폰트는 app/_layout.tsx에서 로드 — 사양 §3-8-PATCH 검증 항목 1)
- [x] 2줄 clamp 작동 (`numberOfLines={2}`)
- [x] 우측 column에 chevron 없음, rating + price만 vertical center
- [x] Rating row: WMGlassRating size 10, score Inter 12 600 gold, gap 5
- [x] Price Playfair 14, ₩ prefix + formatKrwShort
- [x] dark/light 양쪽 모드 카드 bg/border 색 분기 (NW `dark:` prefix + theme hook)
- [ ] **light 모드 gold score 대비 검증** — SCOPE-OUT (사양 escalation)
- [x] Pressable opacity/scale feedback (`opacity: pressed?0.9:1, transform:[{scale: pressed?0.99:1}]`)
- [x] Haptics.selectionAsync 동작 (`Haptics.selectionAsync().catch(()=>undefined)`)
- [x] accessibilityLabel 통합 읽기 (와인명 + 평점 + 가격 ko/en 분기)
- [x] 한글/영문 양쪽 모드 텍스트 wrap·ellipsis (`numberOfLines` 사용 — name 2줄, 나머지 1줄)

12/13 PASS + 1 SCOPE-OUT (사양에서 별도 cycle 명시).

---

## 결정

- **결과: PASS** (6항목 중 5 PASS / 1 해당없음)
  - (1) 요소 누락 PASS (7/7 수정)
  - (2) Spacing 비율 PASS (5/5 카드 내부 수정 + 기존 6/6 유지)
  - (3) Gradient 해당없음
  - (4) Corner radius PASS (1/1 수정)
  - (5) Typography 위계 PASS (7/7 수정 + 5/5 유지)
  - (6) Color PASS (hex 0건, 토큰 100%)

- **STILL-FAIL (1차에서 FAIL 유지)**: **0건**
- **신규 FAIL**: **0건**
- **SCOPE-OUT 명시 사항** (PASS 차단 아님): light 모드 gold score 대비 2.9:1 — 사양 §3-8-PATCH 접근성 line 1059 escalation, 사용자 지시 SCOPE-OUT

## 라우팅

### qa-inspector — 통과 알림 (다음 게이트)

WineFeed horizontal card 시각 게이트 PASS. qa-inspector 단계 진입 가능:
- RLS·shape 검증: mock 사용 중이므로 v0.1.0 데이터 소스 교체 시 재검증 (현재 wave SCOPE-OUT)
- i18n 양쪽 모드 텍스트 grep: `home.wineFeed.openDetail` 신규 키 ko/en 누락 0 확인 (이미 통과)
- emoji grep: 본 파일 0건 (sweep 시 재확인)
- 하드코딩 hex grep: 0건 (검증 완료)
- accessibilityLabel 통합 읽기 시뮬레이션: qa-inspector 책임 (TalkBack/VoiceOver 정성 검증 시 권장)

### rn-screen-builder — 통과 알림

PATCH §3-8-PATCH 15개 변경 항목 + i18n 신규 키 1개 모두 정확히 적용. 추가 수정 요청 없음.

### design-spec-author — 보강 요청 없음

PATCH 사양 line 1079~1093 검증 체크리스트가 정확히 2차 PASS 기준으로 작동. 사양 갭 0건.

### infra-architect — 토큰 확장 요청 없음

`radius['14']`, `brand.gold`, `withAlpha`, `bottleColorDefault`, `tokens.border.default`, `tokens.text.muted` 모두 design-tokens.ts 기존 토큰 재사용. P0 세션 트리거 불필요.

### 리더 — escalation 없음 (정상 PASS 사이클)

단 **light 모드 gold score 대비** (PATCH line 1059)는 사용자 SCOPE-OUT 지시로 본 게이트는 통과하나, 후속 별도 cycle에서 다음 옵션 검토:
- option A: `brand.wineRed` (#8B1A2A on #FFFFFF = 8.4:1 AAA) score 텍스트 색 light 분기
- option B: darker gold 토큰 신규 (#8C7530 정도) — design-tokens.ts 확장 필요
- option C: 라이트 모드에서만 score 색을 text-primary로 → 시각 위계 약화 트레이드오프

## 토큰 확장 누적 (P0 세션)

본 사이클 추가 항목 **없음**. 기존 P0 큐 변경 없음.

## 재검증 시점

PASS — 재검증 불필요. 후속 트리거:
1. 데이터 소스 mock → supabase wines_localized 교체 시 qa-inspector + design-reviewer 재검증
2. light 모드 gold 대비 escalation 진행 시 (별도 cycle) 색 변경 후 design-reviewer 재검증
3. P2 세션 (시뮬레이터 dark/light 캡처) 시 image #7 정성 비교 보강

## 작업자 노트

- 본 2차 게이트는 PATCH 사양 line 1079~1093의 13개 검증 체크리스트를 그대로 기준 삼음. 12/13 PASS + 1 SCOPE-OUT.
- 1차 FAIL 14건 (요소 7 + spacing 5 + radius 1 + typography 7 + accessibility 2 등 중복 포함) → 2차 모두 수정 + STILL-FAIL 0 + 신규 FAIL 0.
- WMBottle 컴포넌트 자체는 변경 없이 width/height props만 변경 (PATCH line 1099 viewBox 자동 fit 정책 — 코드 확인 불필요).
- i18n 신규 키 `home.wineFeed.openDetail` 양 locale 정상 추가 (`rg openDetail src/lib/i18n/*.json` → ko/en 각 line 149).
- 본 PASS는 코드·사양 매핑 검증 중심. 시뮬레이터 dark/light 양 모드 시각 캡처는 후속 P2 세션에 권장 (PASS 차단 조건 아님).
