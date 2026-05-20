# 디자인 리뷰 — /cellar/[lwin] (1차 retroactive)

- 작성일: 2026-05-20 22:34:11
- author: design-reviewer
- 게이트 결과: **FAIL** (6/6)
- FAIL 카운트: **6**
- 다음 액션: rn-screen-builder 반려 (loop) — cellar-detail.md §14 빌드 체크리스트 완수 후 재검증

## 대상

| 축 | 경로 | LOC |
|---|---|---|
| 사양 | `_workspace/design-specs/cellar-detail.md` | 734 |
| 키스크린 (원본) | `../winemine-keyscreen/src/app/cellar/[id]/page.tsx` + 자식 8개 | 447 + 자식 |
| RN 구현 (entry) | `app/(tabs)/cellar/[lwin].tsx` | 236 |
| RN 구현 (자식) | `src/components/cellar/{cellar-fields,drink-window-badge}.tsx` + `src/components/wine/{wine-hero,drinking-window-bar,add-to-cellar-sheet}.tsx` | 70 + 92 + 184 + 86 + (생략) |
| 스크린샷 reference | `_workspace/keyscreen-shots/cellar_lwin.png` (Château Margaux 2018, dark, ko) | 멀티모달 비교 완료 |

> 사양 §2 (verbatim layout tree)와 키스크린 스크린샷이 일치함을 사전 확인. 비교 기준점은 **사양 §2 + 키스크린 PNG**.

---

## SCOPE-OUT (지시 받은 항목 — FAIL 카운트 제외)

다음 항목은 사양·지시에 따라 본 리뷰에서 판정하지 않음:
- Day 6 settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav tabs 구성
- AppHeader 재작성
- 데이터 의존 `tasting_notes.cellar_item_id` FK 마이그레이션 (supabase-engineer 영역)
- DrinkingWindowBar 제거 (사양 §14 dead 명시. cellar/[lwin]이 유일 사용처 — 단 본 화면에서 시각 위반은 별도 카운트)

## SCOPE-IN 재판단 (사양 §13 escalation 9건 중)

| # | 항목 | 본 리뷰 판정 |
|---|---|---|
| 1 | DrinkThis status 업데이트 시점 | UI/시각 영향 없음 — escalation 유지 (P1) |
| 2 | light 모드 bottom fade 색 | DrinkThis CTA 자체가 부재라 본 리뷰 범위 밖. 구현 후 재검토 |
| 3 | `tasting_notes.cellar_item_id` FK | SCOPE-OUT (supabase-engineer) |
| 4 | WineLabelArt SVG 격상 | v0.1.0 단순 View 유지 — 사양 §12 명시. P2 |
| 5 | shade() 헬퍼 위치 | `src/lib/color.ts` 권장 — rn-screen-builder 판단 |
| 6 | ReviewCard 컴포넌트 위치 | v0.1.0 SCOPE-OUT — 결정 보류 |
| 7 | DrinkWindowTimeline 컴포넌트 위치 | `src/components/cellar/drink-window-timeline.tsx` 권장 (사양 §3-4) |
| 8 | `cellar.meta.storage` 라벨 key 중복 | i18n FAIL 항목 (6f)에 포함 — `cellar.meta.storage` 신규 추가 권장 |
| 9 | Edit / Delete / Status toggle 위치 | (a) 요소 누락 FAIL 항목에 영향 — 키스크린에는 없지만 RN은 inline. 현재 RN 유지하되 키스크린 verbatim Section 6 (DrinkThis CTA) 우선 신규 |

---

## 6항목 체크리스트

### (1) 요소 누락 — FAIL

**판정 근거**: 사양 §2 layout tree의 6개 Section 중 **4개 Section이 컴포넌트 자체 부재** + 2개 Section은 다른 화면용 컴포넌트(WineHero/DrinkingWindowBar)로 잘못 매핑됨.

| Section | 사양 (§2) | 현재 RN | 키스크린 PNG 확인 |
|---|---|---|---|
| 1. Wine Hero (240px gradient frame + WineLabelArt + 이니셜 + h1 + producer · vintage + region · country) | 키스크린 line 71~128 | `app/(tabs)/cellar/[lwin].tsx:142-149` — `WineHero` 사용 (wine-detail용 컴포넌트). WMBottle 88×290 병 + ServingTempPill **표시함** | PNG에는 병이 없음. **240px frame + 라벨 placeholder(중앙 "C" 이니셜)** 만 있음 — 완전히 다른 hero |
| 2. Drink Window Card (DrinkWindowBadge "지금 마시기 좋아요" + RangeText "2026년~2050년" + 5-stop Timeline + peak marker + current dot + from/to 라벨 + TipRow "2035년에 절정 도달 · 절정까지 +9년") | 키스크린 line 130~176 | `app/(tabs)/cellar/[lwin].tsx:163-169` — `DrinkingWindowBar` 사용 (wine-detail용). 단순 12px bar + 3-stop wineRedDeep/gold/wineRed + 4px cream marker | PNG: 4px height **5-stop gradient** (gray-gold-wineRed-gold-gray) + 2px wineRed peak marker + 12px cream **dot** (border) + from/to 라벨 + "절정까지 +9년" gold inline span. **Badge 자체가 카드 헤더에 부재** |
| 3. Notify Toggle Card (Inter 13 500 label + 44×26 Switch + gold ON / border-default OFF + cream knob) | 키스크린 line 178~240 | **부재** | PNG: "절정 시점에 알림받기" + 노란(gold) 토글 ON. **완전 누락** |
| 4. MetaGrid 2×2 (storage / acquiredAt / price / memo — Inter 11 muted label + Inter 13 500 cream value, padding 12 14, radius 12, minHeight 64) | 키스크린 line 242~263 | `app/(tabs)/cellar/[lwin].tsx:151-161` — `CellarFields` 단일 카드 row 리스트 (acquiredAt/consumedAt/storage/quantity/purchasePrice + Edit 버튼) | PNG: **2×2 grid** (보관 위치=셀러 / 구매일=2025-10-04 / 구매가=₩1,180,000 / 메모="결혼 5주년..."). row 형태 아님. **수량/Edit 버튼 그리드에 없음** |
| 5. Community Reviews (h2 + ReviewCard × 3 + ViewWineDetailsLink) | 키스크린 line 266~302 | `app/(tabs)/cellar/[lwin].tsx:171-178` — "내 노트 {count}개" 단순 카드 | v0.1.0 **SCOPE-OUT** (사양 §2 line 133~135 + §12 명시). PNG에 community reviews 3건 보이지만 v0.2.0 hardening 대상. **본 리뷰 카운트 제외** |
| 6. DrinkThis Bottom Fixed CTA (absolute bottom + bottom fade gradient + 풀폭 52px wineRed pill + GlassWater 18 icon + "이 와인 마시기" Inter 15 600 cream) | 키스크린 line 305~320 | **부재** | PNG: 화면 하단 **풀폭 wine-red 버튼 "이 와인 마시기" + 잔 아이콘 + bottom fade**. 현재 RN은 inline PrimaryButton(WriteNote) + PrimaryButton(MarkConsumed) + Delete pressable 3개로 분산. **사양 §11 "신규" 명시** |

추가 누락:
- `app/(tabs)/cellar/[lwin].tsx:163-169` DrinkingWindowBar에 **DrinkWindowBadge 헤더가 없음** — Section 2 (사양 §2 line 86~93) `<DrinkWindowBadge status fromYear={dw.from}/> + RangeText`. PNG에는 카드 좌상단에 gold pill "지금 마시기 좋아요" + 우측 Inter 11 muted "2026년~2050년" 명확.
- `app/(tabs)/cellar/[lwin].tsx:163-169` DrinkingWindowBar에 **peak marker (2px wineRed vertical line) + 현재 dot (12px cream + border)** 미구현. 현재는 4px×18px cream **세로 막대**만 (peak 표기 없음).
- `app/(tabs)/cellar/[lwin].tsx:163-169` DrinkingWindowBar에 **TipRow "2035년에 절정 도달 · 절정까지 +9년"** 없음 — 대신 "before/during/after" phase 텍스트만.
- `app/(tabs)/cellar/[lwin].tsx:171-178` Section 4 외부에 **메모(notes)** MetaCard 부재 — 사양 §2 line 122 + PNG 우하단 "메모 / 결혼 5주년 와인으로 매입. 2032년 즈음 오픈 예정." 명확.
- `WineLabelArt` 컴포넌트 부재 — `src/components/cellar/wine-label-art.tsx` 신규 필요 (사양 §14).
- `MetaCard` 컴포넌트 부재 — `src/components/cellar/meta-card.tsx` 신규 필요 (사양 §14).
- `MetaGrid` 컴포넌트 부재 — `src/components/cellar/meta-grid.tsx` 신규 필요 (사양 §14).
- `DrinkWindowCard` 컴포넌트 부재 — `src/components/cellar/drink-window-card.tsx` 신규 필요 (사양 §14).
- `DrinkWindowTimeline` 컴포넌트 부재 — `src/components/cellar/drink-window-timeline.tsx` 신규 필요 (사양 §14).
- `NotifyToggleCard` 컴포넌트 부재 — `src/components/cellar/notify-toggle-card.tsx` 신규 필요 (사양 §14).
- `DrinkThisCta` 컴포넌트 부재 — `src/components/cellar/drink-this-cta.tsx` 신규 필요 (사양 §14).
- `CellarHero` 컴포넌트 부재 — `src/components/cellar/cellar-hero.tsx` 신규 필요 (사양 §14).
- `shade()` helper 부재 — `src/lib/color.ts` 신규 필요 (사양 §14).
- `ConfirmDialog` 컴포넌트 부재 — DrinkThis CTA에 사용. 현재는 Delete에 `Alert.alert` 사용 중 (line 58-81). 추가 신규 (사양 §3-12, §14).

판정: **FAIL** — 사양 §14 빌드 체크리스트 12개 중 0개 완료. 키스크린의 6개 Section 중 0개가 verbatim 매핑됨.

수정 방향:
- (사양 §14 — rn-screen-builder 빌드 체크리스트 전수 수행) 9개 신규 컴포넌트 + shade helper + 27개 i18n 키 + 5개 gradient 토큰을 사양대로 신규 작성.
- `app/(tabs)/cellar/[lwin].tsx`는 ~150 LOC로 단순화 (신규 컴포넌트 조립). 기존 Edit/Delete/Status toggle은 사양 §13-9 권장대로 위치 조정 (Edit MetaGrid 우상단 / Delete 헤더 right slot / Status toggle DrinkThis 위 작은 텍스트 링크).

---

### (2) Spacing 비율 — FAIL

| 위치 | 사양 (§2/§3) — 키스크린 verbatim | 현재 RN | 차이 |
|---|---|---|---|
| ScrollView contentContainerStyle | `paddingBottom: 96 + BottomNav 인셋 16 = 112`, **gap 16** between sections | `app/(tabs)/cellar/[lwin].tsx:139` `paddingBottom: 32` | bottom padding **35% 미달** (32 vs 112). DrinkThis CTA absolute fixed 시 CTA가 컨텐츠 가림. 또한 gap 16이 아닌 `mt-5`(20) 사용 — 사양 §11 line 673 명시 |
| Section 1 outer | `padding 0 16 8` (px-4 pb-2) | `WineHero` line 92: `px-4 pb-5` (pb 20) | pb 20 → pb 8 (사양). 현재는 `pb-5` (wine-detail용으로 producer/region 텍스트 메타까지 포함하기 때문) |
| Section 2 Drink Window Card | `padding 16, mx 16, mb between sections 16` | `DrinkingWindowBar` line 45: `px-4 py-4 mx-4` — 동일. 단 mb는 entry `mt-5` (20px) | mt-5 vs 16 — **20% 초과**. 사양은 ScrollView gap 16 일관 |
| Section 2 HeaderRow mb | `marginBottom 12` (mb-3) | 헤더(Badge + RangeText) **부재** | 적용 불가 — (1) 요소 누락 FAIL과 연동 |
| Section 2 TipRow mt | `marginTop 12` (mt-3) | TipRow 부재. 현재는 `mt-2` phase 텍스트 (line 80) | 적용 불가 — (1)과 연동 |
| Section 3 Notify Toggle padding | `padding 14 16` | **부재** | (1)과 연동 |
| Section 4 MetaGrid gap | `gap 10` (gap-2.5) | **부재** | (1)과 연동 |
| Section 4 MetaCard padding | `padding 12 14, minHeight 64` | `CellarFields` Row `py-2` (8) + Inter row layout | 카드 형태가 아닌 row 형태. 적용 불가 |
| Section 5 reviews margin | `mx 16, gap 10` | 자기 노트 카드 `mx-4` + `mt-5` | SCOPE-OUT (v0.2.0) |
| Section 6 DrinkThis CTA outer | `padding 12 16 18` (pt-3 px-4 pb-[18]) + absolute bottom 0 | **부재** | (1)과 연동 |
| Hero h1 margin | `mt 12 mb 4` | WineHero `WineNameDisplay` 사용 — 내부 margin은 별도 컴포넌트 | 검증 불가 (다른 컴포넌트 — wine-detail용) |
| ProducerLine | `mt 0` (직후), RegionLine `mt 2` | WineHero `mt-1` (4) + `mt-1.5` (6) | sample 차이 작음. 단 producer 형식이 사양 `${producer} · ${vintage}` 단일 줄인데 현재 RN은 분리됨 |

판정: **FAIL** — 가장 큰 이슈는 `paddingBottom 32 → 112` (DrinkThis CTA가 컨텐츠 위에 absolute일 때 가림 방지 필요). 사양 §11 line 673 명시. 그 외 spacing 비교는 컴포넌트 부재로 검증 불가 — (1) FAIL과 연쇄.

수정 방향:
- `app/(tabs)/cellar/[lwin].tsx:139` `paddingBottom: 32` → `paddingBottom: 112` (CTA 신규 후).
- ScrollView 자식 사이 `mt-5` (20) → ScrollView contentContainerStyle `gap: 16` (RN ≥ 0.71 지원) 또는 각 자식 `mt-4` (16).
- Section 1 outer `pb-5` → `pb-2` (사양). 단 wine-detail용 WineHero 그대로 쓸 게 아니라 CellarHero 신규 작성하면서 적용.

---

### (3) Gradient 방향·깊이 — FAIL

| 위치 | 사양 (§3) — 키스크린 verbatim | 현재 RN | 차이 |
|---|---|---|---|
| Hero outer (Section 1) | `linear-gradient(160deg, ${bottle_color} 0%, #1a0a1e 70%)` → expo `start={0,0} end={0.342, 0.94} locations=[0, 0.7]` (160deg) | `WineHero` line 94-110: `start={0.5, 0} end={0.5, 1}` (180deg 수직) + `withAlpha(startColor, 0.21)` + dark.bg.bottleShelf | **각도 불일치** (160 → 180), **bottle_color alpha** (full → 0.21). PNG에선 좌상에서 우하 대각 grad가 명확. 깊이 부족 |
| WineLabelArt inner (Section 1 내부) | `linear-gradient(160deg, ${bottle_color} 0%, shade(bc,-20) 60%, shade(bc,-40) 100%)` 3-stop | **부재** (WMBottle은 별개 컴포넌트로 병 모양 SVG, 라벨 그라데이션 아님) | **3-stop gradient 자체 없음**. 사양 §9-2 `gradients.wineLabelArt` factory 신규 필요 |
| WineLabelArt highlight overlay (Section 1 내부) | `linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 100%)` top 40% | **부재** | 광택 effect 누락. PNG에서 라벨 상단 미세 highlight 식별 가능 |
| DrinkWindowTimeline track (Section 2) | `linear-gradient(90deg, rgba(155,139,122,0.3) 0%, gold 45%, wineRed 50%, gold 55%, rgba(155,139,122,0.3) 100%)` 5-stop 좌→우 | `DrinkingWindowBar` line 50-55: 3-stop `[wineRedDeep, gold, wineRed]` 좌→우 | **stop 수 다름** (5 → 3), **색 순서 다름** (사양은 gray-gold-wineRed-gold-gray 중앙 강조 / 현재는 wineRedDeep-gold-wineRed 우측 강조). 시각 의미 완전 다름 — peak 중앙 강조 사라짐 |
| Notify Switch ON track | bg `brand.gold` (solid) | **부재** | (1)과 연동 |
| DrinkThis CTA bottom fade | `linear-gradient(180deg, rgba(5,2,10,0) 0%, rgba(5,2,10,0.95) 60%)` (light 모드 분기 권장) | **부재** | (1)과 연동. 사양 §9-2 `gradients.cellarBottomFade.{dark,light}` 신규 필요 |
| DrinkThis CTA shadow | sample 권장: `shadows.wineRedCardLg` (이미 토큰 존재) | **부재** | (1)과 연동 |

판정: **FAIL** — Hero gradient 각도(160→180)와 alpha(full→21%) 차이로 PNG 대비 **명도·채도 깊이 부족**. Timeline은 5-stop → 3-stop 중앙 강조 손실. 사양 §9-2의 신규 5개 gradient 토큰 모두 부재.

수정 방향:
- `src/lib/design-tokens.ts`에 사양 §9-2 토큰 5개 추가:
  - `gradients.cellarDetailHero` factory (bottleColor, scheme)
  - `gradients.wineLabelArt` factory (bottleColor)
  - `gradients.wineLabelArtHighlight`
  - `gradients.drinkWindowTimeline` (5-stop)
  - `gradients.cellarBottomFade.{dark,light}`
- `shade()` helper를 `src/lib/color.ts` 또는 design-tokens 신규 (사양 §9-2 + §13-5).
- CellarHero / WineLabelArt / DrinkWindowTimeline / DrinkThisCta 4개 컴포넌트에서 위 토큰 사용.

---

### (4) Corner radius — FAIL

| 위치 | 사양 (§3) — 키스크린 verbatim | 현재 RN | 차이 |
|---|---|---|---|
| Hero frame | radius **18** (`rounded-[18px]`) | `WineHero` `borderRadius: 18` (line 100) | PASS (동일) |
| WineLabelArt | radius **8** (`rounded-lg`) | **부재** | (1)과 연동 |
| DrinkWindow Card | radius **16** (`rounded-2xl`) | `DrinkingWindowBar` line 45: `rounded-xl` (12) | **12 vs 16 — 25% 미달**. 사양 §3-3 line 192 명시 |
| Notify Toggle Card | radius **14** (`rounded-[14px]`) | **부재** | (1)과 연동 |
| MetaCard | radius **12** (`rounded-xl`) | `CellarFields` outer `rounded-xl` (12) — 단일 카드, MetaCard 아님 | (1)과 연동 |
| ReviewCard | radius **12** (`rounded-xl`) | SCOPE-OUT (v0.2.0) | — |
| DrinkThis CTA | radius **14** (`rounded-[14px]`) | **부재** | (1)과 연동 |
| Notify Switch outer | radius **13** (44×26 half) | **부재** | (1)과 연동 |
| Notify Switch knob | radius **10** (20×20 half) | **부재** | (1)과 연동 |
| Timeline track bar | radius **2** | **부재** (현재 DrinkingWindowBar는 12px height + radius 6 — track 자체 다른 모양) | (1)과 연동. 사양 §3-4 line 204 명시 (height 4 + radius 2) |
| Timeline current dot | radius **6** (12×12 half) | DrinkingWindowBar line 67: `width 4 height 18 marginLeft -2 radius 2` — **막대 형태** | sample 차이 큼: 사양은 **원형 dot 12×12 cream + border 2px deepest**; 현재는 4×18 cream 막대. **시각 완전 다름** |
| 노트 카운트 단순 카드 | n/a (SCOPE-OUT) | `app/(tabs)/cellar/[lwin].tsx:171` `rounded-xl` | SCOPE-OUT |

판정: **FAIL** — DrinkWindow Card radius 12→16 미달 (4px). Timeline current dot이 원형이 아닌 막대. 그 외는 (1) FAIL과 연쇄.

수정 방향:
- `DrinkingWindowBar` 폐기 → `DrinkWindowCard` 신규: outer `rounded-2xl` (16).
- Timeline track height 4 + radius 2 + current dot 12×12 cream **원형** + border 2px scheme-aware bg-deepest.
- 모든 Section 신규 컴포넌트는 사양 §3 매핑표 verbatim radius 적용.

---

### (5) Typography 위계 — FAIL

| 위치 | 사양 (§3) — 키스크린 verbatim | 현재 RN | 차이 |
|---|---|---|---|
| Hero h1 (wine name) | Playfair 24, color cream, mt 12 mb 4 | `WineHero` line 149: `WineNameDisplay size="title"` (typography.pageTitle = Playfair 24/28.8/-0.24) | PASS (동일 — pageTitle 토큰 재사용) |
| ProducerLine | Inter 13, text-secondary, `${producer} · ${vintage}` 단일 줄 | `WineHero` line 158-162: Inter 13 text-secondary `mt-1` — **producer 단독** (vintage 별도 줄) | PNG: "Château Margaux · 2018" **한 줄**. 현재 RN은 producer만 + 다음 줄 region/country/vintage 별도 — **위계 분산** |
| RegionLine | Inter 12, text-muted, `${region} · ${country}` 단일 줄, mt 2 | `WineHero` line 168-178: Inter 11 text-muted `mt-1.5` + lineHeight 16.5, 두 줄(region+country 줄 + vintage 줄) | **fontSize 12 vs 11**, **mt 2 vs 6**, **vintage가 ProducerLine 대신 RegionLine 아래로 분리** |
| Hero type dot row | 사양에 **없음** (cellar/[lwin]은 type dot 없음 — wine-detail만 type dot 존재) | `WineHero` line 128-146: type dot 8×8 + type text Inter 11 text-secondary capitalize | **사양 미정의 추가 요소 — keyscreen verbatim 위반** |
| Section 1 ServingTempPill | 사양에 **없음** | `WineHero` line 121-123: abs right:12 bottom:12 | **사양 미정의 추가 요소** |
| DrinkWindowBadge | Inter 10 600 / lh 12 (`typography.drinkWindowBadge` 토큰) | DrinkWindowBadge 컴포넌트는 토큰 사용 OK — 단 cellar/[lwin]에서 호출 안 됨 | (1)과 연동 |
| RangeText | Inter 11, text-muted | **부재** | (1)과 연동 |
| TipRow main | Inter 12, text-secondary | `DrinkingWindowBar` line 80: phase text `text-card-meta text-text-muted` (Inter 12/14.4 muted) | **색 muted vs secondary** — 더 어둡고 약함. 또한 텍스트 의미 다름 (phase vs peak year 강조) |
| TipRow inline gold span | Inter 12, color gold, ml 6 — "절정까지 +9년" | `DrinkingWindowBar` line 75-77: `peakLabel` 별도 row, `text-card-meta text-gold` (Inter 12 gold) | **inline span이 아닌 분리된 row** — PNG는 한 줄 안에 muted text + gold inline (시각 위계 다름) |
| Notify label | Inter 13 500, cream | **부재** | (1)과 연동 |
| MetaCard label | Inter 11, text-muted, mb 4 | `CellarFields` Row line 17-19: `text-card-meta text-text-muted uppercase` (Inter 12/14.4 muted **uppercase**) | **fontSize 11 vs 12**, **uppercase 추가 (사양 미정의)** — 키스크린은 normal case "보관 위치", "구매일" |
| MetaCard value | Inter 13 500, cream | `CellarFields` Row line 21-23: `text-card-body text-text-primary` (Inter 13/19.5 400) | **fontWeight 500 vs 400** — 굵기 위계 미달 |
| ViewWineDetailsLink | Inter 12 600, color gold, mt 12 | **부재** | (1)과 연동 (v0.2.0 SCOPE 위에 있지만 사양 §3-10 v0.1.0 영역) |
| DrinkThis label | Inter 15 600, cream | **부재** | (1)과 연동 |
| Timeline from/to 양끝 라벨 | Inter 10, text-muted | **부재** | (1)과 연동. 사양 §3-4 line 207 명시 |
| Delete CTA | n/a (키스크린 미정의) | `app/(tabs)/cellar/[lwin].tsx:195-206`: Inter-semibold card-body wine-red | 키스크린에 없음 — UX enhancement (escalation 9 권장: 헤더 right slot로 이동) |

판정: **FAIL** — Hero 메타 텍스트 구조 자체가 사양 layout과 다름 (ProducerLine: producer만 / RegionLine: region+country+vintage). Section 2 TipRow는 inline gold span 손실. MetaCard label uppercase (사양 미정의 추가). 위계 약함 (value 500 → 400).

수정 방향:
- `CellarHero` 신규 시 ProducerLine = `${producer_name} · ${vintage}` 단일 줄 (Inter 13 secondary), RegionLine = `${region} · ${country}` 단일 줄 (Inter 12 muted mt 2). type dot / ServingTempPill 제거.
- `MetaCard` 신규 시 label normal case (uppercase 제거), fontWeight 500 (cream value).
- `DrinkWindowCard` 신규 시 TipRow는 단일 Text + inline gold `<Text style={{color:gold}}>`.

---

### (6) Color 사용 — FAIL

| 위치 | 사양 (§4-5) — 키스크린 verbatim + 토큰 | 현재 RN | 차이 |
|---|---|---|---|
| Screen bg | `bg-bg-deepest dark:bg-bg-deepest` | `app/(tabs)/cellar/[lwin].tsx:135` 동일 | PASS |
| Hero gradient bottom | dark `#1a0a1e` (fixed) — light도 동일 | `WineHero` line 78-79: scheme 분기 — light는 `light.bg.bottleShelf` (`#FFFFFF`) | **사양 §4-5 line 356 verbatim 위반** — light 모드 cream 화면에서 hero 끝이 흰색 → 와인병의 어두운 분위기 손실. **사양은 양쪽 모드 모두 `#1a0a1e` 유지 명시** |
| Hero bottle_color alpha | full color (사양 line 70) | `withAlpha(startColor, 0.21)` (line 82) | **alpha 추가 — 사양 미정의** (wine-detail용 21%를 cellar에 그대로 적용). PNG: bottle color 진하고 채도 높음 |
| WineLabelArt border | `rgba(201, 168, 76, 0.18)` = withAlpha(gold, 0.18) | **부재** | (1)과 연동 |
| Timeline gold stops | `brand.gold` (#C9A84C) | DrinkingWindowBar line 51 동일 사용 | PASS (단일 stop만 일치, 5-stop 중 2개 자리) |
| Timeline gray stops | `withAlpha('#9B8B7A', 0.3)` | **부재** | (1)과 연동 |
| Timeline current dot border | scheme-aware `bg-deepest` (dark `#251837` / light `#FAF5EC`) | **부재** (4×18 막대로 border 자체 없음) | (1)과 연동 |
| Notify Switch ON | `brand.gold` | **부재** | (1)과 연동 |
| Notify Switch OFF | `border-default` (dark `#5A3D6A` / light `#E0D2BC`) | **부재** | (1)과 연동 |
| Notify Switch knob | `brand.cream` | **부재** | (1)과 연동 |
| MetaCard bg | `bg-surface` (dark `#3D2A4A` / light `#FFFFFF`) | `CellarFields` outer `bg-surface` (dark `#3D2A4A`) — light 분기 부재 | **light 모드 dark:bg-surface 미정의** — 단일 className `bg-surface`만 |
| MetaCard border | `border border-border-default` | `CellarFields` outer **border 미정의** | **border 누락** |
| MetaCard label | `text-text-muted` | `text-text-muted dark:text-text-muted` | PASS |
| MetaCard value | `text-text-primary` cream | `text-text-primary dark:text-text-primary` | PASS |
| DrinkThis CTA bg | `brand.wineRed` (#8B1A2A) | **부재** (대신 PrimaryButton primary — design-tokens 통해 wine-red 사용 가능하지만 fixed bottom 아님) | (1)과 연동 |
| DrinkThis CTA label | `brand.cream` | **부재** | (1)과 연동 |
| Bottom fade | dark `rgba(5,2,10, 0~0.95)` / light `rgba(250,245,236, 0~0.95)` (사양 §4-5 권장) | **부재** | (1)과 연동 |
| Delete CTA | `text-wine-red` + wineRed icon | `app/(tabs)/cellar/[lwin].tsx:202-204`: `brand.wineRed` icon + `text-wine-red` | PASS — 단 사양에 없는 요소 (escalation 9) |
| 노트 카운트 카드 | n/a (v0.1.0 SCOPE-OUT 자기 노트로 대체) | `bg-surface` mx-4 px-4 py-3 + section-title uppercase | SCOPE-OUT |
| 하드코딩 hex | 없어야 함 (design-tokens.ts·tailwind·lwin.ts·color util 외) | grep 결과: `app/(tabs)/cellar/[lwin].tsx` / `CellarFields` / `DrinkingWindowBar` 모두 **0건** | PASS — 하드코딩 hex 없음 (`brand.*`, `dark.*`, `light.*` 토큰 사용) |

판정: **FAIL** — 주 위반 2건:
1. Hero gradient end 사양 §4-5 line 356 verbatim 위반 (light 모드 `light.bg.bottleShelf` = `#FFFFFF` 사용 vs 사양 `#1a0a1e` fixed).
2. Hero bottle_color에 사양에 없는 alpha 21% 적용 → 깊이 부족.
3. Section 4 단일 카드(CellarFields)의 border 미정의 + light 모드 dark 분기 없음 (`bg-surface dark:bg-surface` 없음 — 단순 `bg-surface`만).

수정 방향:
- `CellarHero` 신규 시 gradient end는 **scheme 무관 `#1a0a1e` 고정** (사양 §4-5 line 356). bottle_color는 full (alpha 미적용).
- `MetaCard` 신규 시 `bg-surface dark:bg-surface border border-border-default` 적용.
- `gradients.cellarDetailHero` factory에서 `dark.bg.bottleShelf`만 사용 (light scheme 인자 무시).

---

## 다크/라이트 양쪽 모드

- 다크 모드 캡처: 가능 — Château Margaux 2018 PNG (사양 §1 reference)
- 라이트 모드 캡처: **수집 불가** (P2 세션 보류) — 사양 §4-5 토큰 분기는 코드 정적 검증으로만
- 코드 정적 검증 결과:
  - `WineHero` gradient end만 scheme 분기 (사양 위반 — 위 (6) 참고)
  - `DrinkingWindowBar` trackColor scheme 분기 — 단 track 자체가 사양과 다른 모양
  - `CellarFields` light 분기 없음 — 카드 bg는 dark surface만 (사양 위반 — 위 (6) 참고)
  - `DrinkWindowBadge` `useThemeTokens()` scheme 분기 OK — 단 호출처(`app/(tabs)/cellar/[lwin].tsx`)에서 미사용

판정: light 모드 실측 부재 + 정적 분석 결과 양쪽 모드 대응이 사양보다 부족. **(6) Color FAIL에 합산** — 별도 카운트 X.

---

## 스크린샷 비교 (멀티모달 — dark 모드만)

`_workspace/keyscreen-shots/cellar_lwin.png` 분석:

PNG 요소 (위→아래):
1. 헤더 `< Château Margaux` — Inter 16 600 cream + ChevronLeft 24
2. 240px Hero frame — dark wineish gradient (좌상→우하 대각) + 중앙 라벨 placeholder (rounded 8 + 진한 wineish gradient + 큰 "C" Playfair 이니셜)
3. h1 "Château Margaux" Playfair 24 cream + ProducerLine "Château Margaux · 2018" Inter 13 secondary + RegionLine "보르도 · 프랑스" Inter 12 muted (단일 줄들)
4. Drink Window Card (rounded 16, bg surface, border) — 좌상 gold pill "지금 마시기 좋아요" + 우상 Inter 11 muted "2026년 ~ 2050년" + 4px height 5-stop track (gray-gold-wineRed-gold-gray) + 좌 "2026" 우 "2050" + Tip "이 와인은 2035년에 절정에 도달합니다 · 절정까지 +9년" (muted + gold inline)
5. Notify Card (rounded 14) — "절정 시점에 알림받기" + gold ON Switch (44×26 + 20×20 cream knob)
6. MetaGrid 2×2 (gap 10) — 보관 위치/셀러, 구매일/2025-10-04, 구매가/₩1,180,000, 메모/결혼 5주년...
7. Community Reviews (h2 "다른 사람의 리뷰") — 3건 ReviewCard (L4 소믈리에 / L2 애호가 / L5 마스터, beginner/expert rating 분기)
8. "와인 상세 보기 →" gold link
9. Bottom fixed CTA — 풀폭 wine-red rounded 14 "이 와인 마시기 [잔 icon]"

현재 RN 시각 차이 (코드 기준 추론):
- (2) wine-detail용 WineHero (병 88×290 + ServingTempPill) — 라벨 placeholder 아님
- (4) Drink Window Card는 단순 12px bar + 4×18 막대 (peak/from-to 라벨/Tip 모두 부재)
- (5) Notify Card 자체 부재
- (6) MetaGrid 2×2 아닌 단일 카드 row 리스트
- (7) ReviewCard 자체 부재 (SCOPE-OUT)
- (8) "와인 상세 보기 →" 부재
- (9) Bottom fixed CTA 부재

전체 시각 차이: 화면의 6개 Section 중 **0개 verbatim 일치**. (1) 요소 누락 FAIL과 일치.

---

## i18n 신규 키 검증 (사양 §7)

사양 §7-1 ~ §7-5에 명시된 27개 신규 키 grep:

| key | 존재 여부 (ko.json) |
|---|---|
| `cellar.drinkWindow.tip` | **부재** |
| `cellar.drinkWindow.peakInYears` | **부재** |
| `cellar.drinkWindow.fromTo` | **부재** |
| `cellar.drinkWindow.a11y.{currentYear,peak,opening,mature,tooYoung,pastPeak}` | **부재** (6개) |
| `cellar.notify.{label,toggledOn,toggledOff,a11yHint}` | **부재** (4개) |
| `cellar.meta.{storage,memo,memoEmpty,storageCellar,storageFridge,storageRoom,storageOffsite}` | **부재** (7개) |
| `cellar.drinkThis` | **부재** |
| `cellar.drinkThisConfirm` | **부재** |
| `cellar.communityReviews` | **부재** (v0.2.0 OK) |
| `cellar.viewWineDetails` | **부재** |
| `cellar.detail.a11y.{drinkThisHint,heroLabel}` | **부재** (2개) |
| `common.{yes,no,back}` | (검증 보류) |

신규 추가 필요 수: **~25개** (v0.1.0 영역; communityReviews 등 v0.2.0 영역은 SCOPE-OUT).

판정: (6) Color FAIL에 흡수되지 않는 별도 이슈 — i18n 누락은 qa-inspector 단계에서 양쪽 locale 누락 grep으로 잡힘. **본 리뷰는 시각 검증이지만 사양 §7 명시 항목이라 부수 보고**.

---

## 결정

- 결과: **FAIL**
- FAIL 항목: (1) 요소 누락 / (2) Spacing 비율 / (3) Gradient 방향·깊이 / (4) Corner radius / (5) Typography 위계 / (6) Color 사용 — **6/6**
- 핵심 원인: 본 화면은 cellar-detail.md §11 "retroactive 대상" 명시 — Day 4 구현이 wine-detail용 컴포넌트(WineHero/DrinkingWindowBar)를 재사용했으나 키스크린의 cellar-detail 구조는 wine-detail과 완전히 다름. 사양 §14 빌드 체크리스트 12개 중 0개 미진행 상태.

### 라우팅

- **rn-screen-builder** (수정 대상):
  - 사양 §14 빌드 체크리스트 12개 항목 전수 실행
  - 신규 컴포넌트 9개 작성 (`cellar-hero`, `wine-label-art`, `drink-window-card`, `drink-window-timeline`, `notify-toggle-card`, `meta-grid`, `meta-card`, `drink-this-cta`, `confirm-dialog`)
  - `src/lib/color.ts` shade() 헬퍼 신규
  - `app/(tabs)/cellar/[lwin].tsx` ~150 LOC 단순화 (조립만)
  - 기존 `DrinkingWindowBar` (`src/components/wine/drinking-window-bar.tsx`) cellar/[lwin] 교체 후 dead — **삭제**
  - 기존 `CellarFields` (`src/components/cellar/cellar-fields.tsx`) — MetaGrid + MetaCard로 대체 후 dead → 삭제 또는 v0.2.0 hardening 대상 보관

- **infra-architect** (토큰 확장 — P0):
  - `src/lib/design-tokens.ts` 신규 5개 gradient 토큰 (`gradients.cellarDetailHero/wineLabelArt/wineLabelArtHighlight/drinkWindowTimeline/cellarBottomFade`)
  - `typography` 신규 2개 (사양 §9-2 line 580 — `timelineYearLabel`, 그 외 재사용 가능)
  - `shade()` helper 위치 결정 (`src/lib/color.ts` 신규 vs design-tokens.ts 내장 — 권장 `src/lib/color.ts`)

- **design-spec-author** (사양 보강 — 선택):
  - §13 escalation 9건 중 light 모드 bottom fade 색 (P0 토큰 확장 시 결정), shade() 위치, ReviewCard 위치 등 결정 사항 명시 또는 보류 명시

- **qa-inspector** (대기):
  - rn-screen-builder + design-reviewer 재검증 PASS 후 진입

- **리더 alert**:
  - 본 화면 retroactive hardening 작업량 = +250 LOC (사양 §11 line 675). Day 6 settings 3 sub 작업과 병행 시 리소스 분배 필요.
  - 사양 §13 escalation 9건 중 (1)(2) 두 항목은 P0 토큰 확장과 연쇄 — 리더 판단 필요.

### 재검증 시점

rn-screen-builder가 사양 §14 빌드 체크리스트 12개를 완수하고 design-reviewer에 재검증 요청 SendMessage → 동일 6항목 체크리스트 재실행. 부분 완료 (예: 컴포넌트 3~4개만) 시점에 mid-check 요청 가능.
