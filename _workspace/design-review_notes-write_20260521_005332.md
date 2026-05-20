# 디자인 리뷰 — /notes/new/write (Beginner 우선)

> 1차 retroactive 시각 게이트 검증. design-reviewer 단독 보고서.
> 작성일: 2026-05-21
> 모드 범위: Beginner(dark, ko) — 키스크린 reference png. Expert 보조 검증.

## 대상

- 사양: `_workspace/design-specs/notes-write.md` (1006 LOC, v2026-05-21)
- 원본 reference (시각): `_workspace/keyscreen-shots/notes_new_write.png` (Beginner, dark, ko)
- 원본 JSX (사양 §원본 소스):
  - `../winemine-keyscreen/src/app/notes/new/write/page.tsx`
  - `../winemine-keyscreen/src/components/tasting-note/{beginner-note,note-write-beginner,note-write-expert}.tsx`
- 구현:
  - `app/notes/new/write.tsx` (341 LOC)
  - `src/components/notes/beginner-form.tsx` (130 LOC)
  - `src/components/notes/expert-form.tsx` (345 LOC)
  - `src/components/notes/{mode-toggle, wset-slider, aroma-chips, star-rating, wine-link-card}.tsx`

검증 기준: 사양 §2 Layout Tree + §3 NW 매핑 + §4 토큰 + §14 retroactive 차이 + 키스크린 스크린샷.

---

## 0. 핵심 요약 (먼저)

스크린샷 reference (Beginner / dark / ko)는 6 Step 흐름 + AutoSummaryCard + PriceCapture + ShareToCommunity + Save pill의 **사양 verbatim 구조**를 보여준다. 현재 RN BeginnerForm은 WSET 4-dim slider + AromaChips 12 + Memo 만으로 구성되어 **Step 1~6 구조 전체 부재 + 보조 카드 3종(AutoSummary/PriceCapture/Share) 전체 부재 + footer Save pill 부재**. 사양 §14의 retroactive marshall plan A~I 전부 미반영.

`app/notes/new/write.tsx` 자체는 컨테이너로서는 사양 §2-1과 거의 일치 (BackHeader + KAV + ScrollView padding 12/16/48 + WineLinkCard + ModeToggle + Form + Toast). 컨테이너 PASS. **폼 내부가 키스크린 verbatim 6-step과 완전히 다름** → 6항목 중 5 FAIL.

ExpertForm은 D4 BlindMode gradient direction(135deg) 1건만 visual FAIL (현재 RN x:0,y:0 → x:1,y:1, 사양은 180deg 위→아래 verbatim 요구).

전체 결과: **FAIL (6항목 중 5 FAIL — typography·spacing·요소 누락·color·gradient).**

---

## 1. 6항목 체크리스트

### (a) 요소 누락 — FAIL

스크린샷 Beginner 화면에 존재하는 요소 중 현재 RN BeginnerForm/write.tsx에 **부재**:

| # | 요소 | 키스크린 출처 | 현재 RN | 권장 |
|---|---|---|---|---|
| a-1 | **BeginnerHeader (eyebrow + WineName + Producer + Greeting)** | beginner-note.tsx L98~136 / 스크린샷 상단 "입문자 모드" gold uppercase / "오늘의 한 잔" Playfair 22 / 안내문 muted 12 | **없음** (WineLinkCard로 와인명만 표시) | 사양 §2-2 BeginnerHeader 신규 컴포넌트. 사양 §14 "B 신규" |
| a-2 | **Step 1 — 첫 인상 ImpressionTriad** | 와! 최고! / 괜찮아요 / 음... 글쎄 — Sparkles/Smile/HelpCircle 3-button | **없음** | 사양 §2-2 Step 1. 신규 컴포넌트 `src/components/notes/impression-triad.tsx` |
| a-3 | **Step 2 — 맛의 균형 PalateTriad (5 dim × low/mid/high)** | 단맛/신맛/무게감(바디)/떫은맛(타닌)/기포 — 각 dim 3 button | **WSETSlider 1~5 dot × 4 dim** (sweetness/acidity/tannin/body) — 구조 자체 다름 | 사양 §2-2 Step 2. WSETSlider 대체 → PalateTriad. tannin/bubble은 variant 분기 |
| a-4 | **Step 3 — AromaGrid 4×2 (8 카드, 아이콘+라벨)** | 베리/시트러스/복숭아·살구/꽃/향신료/꿀·캐러멜/흙·허브/빵·이스트 — Cherry/Citrus/Apple/Flower2/Flame/Candy/Sprout/Wheat | **AromaChips 12 chip pill** (fruit/floral/spice/wood/earth/citrus/berry/vanilla/tobacco/chocolate/leather/mineral) — 아이콘 없는 텍스트 pill 12개 | 사양 §2-2 Step 3 + §10 E9 verbatim. 신규 컴포넌트 `aroma-grid.tsx`. 아이콘 lucide-react-native |
| a-5 | **Step 4 — FinishTriad (짧음/중간/긴)** | 여운 3-button (Palate triad 패턴) | **없음** (Expert form의 palate.finish 1~5와 별개 — Beginner는 finish 자체 없음) | 사양 §2-2 Step 4. 신규 컴포넌트 `finish-triad.tsx` |
| a-6 | **Step 5 — 평점 StepHeader + StarRating** | 번호 ⑤ 배지 + "평점" + Star × 5 | **카드 안 단순 라벨 "RATING" + StarRating** (별 컴포넌트 자체는 존재) | StarRating keep (D2 — half-step 정밀). StepHeader 신규 + 카드 wrapper 제거 |
| a-7 | **Step 6 — MemoInput (한 줄 메모 multiline 3 rows)** | "예: 새 친구가 추천해준 와인. ..." placeholder | **comments TextInput multiline 4 rows** (commentLabel + commentPlaceholder 사용) — 라벨/플레이스홀더 키스크린과 다름 | placeholder 키스크린 verbatim (`beginnerMemoPlaceholder` 신규). 라벨도 "한 줄 메모" / "A line about this wine" |
| a-8 | **AutoSummaryCard (Playfair italic 13 cream lh 19.5 + gold tint bg/border + gold eyebrow "오늘의 한 잔")** | beginner-note.tsx 자동 요약 + note-write-beginner.tsx 가격/공유 위 / 스크린샷 "오늘의 한 잔" + "완만했던 한 잔. 향은 아직 가벼웠고, 균형 잡힌 바디에 적당한 산도와 남감이 5점." | **없음** | 사양 §14 "B 신규" + §17 체크리스트 |
| a-9 | **PriceCapture 카드 (Switch + collapsible NumberInput)** | "가격 입력 (+5 XP)" + Switch 우측 + 켜졌을 때 KRW input 노출 / 스크린샷 표시 | **없음** (ExpertForm conclusions.estimated_price_krw는 있지만 Beginner엔 부재) | 사양 §14 "C 신규" |
| a-10 | **ShareToCommunity 카드 (Switch + title + sub)** | "커뮤니티에 공유" + sub "커뮤니티의 시음 노트 탭에서 이 노트가 보여요." + Switch / 스크린샷 표시 | **없음** | 사양 §14 "C 신규" + §10 E16 `is_public` 컬럼 supabase-engineer 영역 |
| a-11 | **Save pill (footer wineRed pill padding 14_16 radius 999 cream Inter 15 600 center)** | note-write-beginner.tsx footer / 스크린샷 "저장" 빨간 pill | **header SaveBtn 텍스트만 (Pressable Text gold)** | header keep + footer pill 추가 (사양 §10 E8) |
| a-12 | **StepHeader 컴포넌트 자체** | 22×22 wineRed circle + Inter 11 700 cream 번호 + Inter 14 600 cream title (gap 8) | **없음** (모든 BeginnerForm 카드가 단순 `text-card-meta uppercase` 라벨) | 사양 §2-4 + §17 신규 `step-header.tsx` |
| a-13 | **ModeToggle 표시 자체는 keyscreen에 없음** (keyscreen은 templateId/experience로 진입 시 결정) | — | 있음 (Beginner/Expert pill) | **keep (현재 RN enhancement)** — 사양 §1 deviation 명시. **검증: PASS (사양 허용)** |
| a-14 | **tasted_at 날짜 입력 카드** | keyscreen은 openedAt timestamp 내부 자동 — UI 표면화 없음 | 있음 (BeginnerForm 카드 안 "TASTED ON" + YYYY-MM-DD TextInput) | **keep RN** (D 시리즈 명시). **PASS** |
| a-15 | Expert WSETSlider 5-stage enum vs number | low/mediumMinus/medium/mediumPlus/high enum 라벨 | 1~5 dot + "value/max" 표시 | 사양 E5 keep 1~5. **PASS** |
| a-16 | Expert VariantTabs (white/red/sparkling/blind) | 4-tab | BlindToggle Switch만 | 사양 E4 SCOPE-OUT v0.1.0. **PASS** |
| a-17 | Expert 7-step (Capture/Aroma/Palate/Finish/Faults/Evolution/Peak ETA) | — | 5-section (Blind/Rating/Appearance/Nose/Palate/Conclusions) | 사양 E3 keep 5-section. **PASS** |

**a-1 ~ a-12 = 12건 FAIL** (스크린샷 verbatim 요소 누락). a-13~17은 사양에서 명시적으로 허용된 deviation/scope-out.

판정: **(a) FAIL (12건)**.

---

### (b) Spacing 비율 — FAIL

| # | 요소 | 키스크린 비율 | 현재 RN | 평가 |
|---|---|---|---|---|
| b-1 | ScrollView contentContainer (paddingTop 12, paddingHorizontal 16, paddingBottom 48) | 12/16/48 | 12/16/48 (write.tsx L293) | **PASS** |
| b-2 | KeyboardAvoidingView behavior iOS=padding | OK | OK (write.tsx L289) | **PASS** |
| b-3 | BeginnerForm container `<section gap 18>` (row gap 18) | 18px | `gap-5` = 20px (beginner-form.tsx L46) | 미세 차이 — keyscreen verbatim 18 권장 (`style={{rowGap:18}}`). **WARN** |
| b-4 | Step 내부 gap (StepHeader → 컨트롤 8~10px) | 8~10px | 카드 padding `p-4` = 16px + label `mt-2` = 8px | 카드 wrapper 자체가 잉여. 사양은 카드 X (StepGroup gap 8~10). **FAIL** |
| b-5 | 카드 wrapper 사용 빈도 | beginner-note.tsx는 6 Step을 카드 wrapper 없이 일렬로 (gap 18) — PriceCapture/Share만 카드 (padding 14 radius 12) | **모든 6 group이 `rounded-xl bg-surface p-4` 카드** (Rating/WSET/Aroma/TastedAt/Comments) | 카드 5개로 분할 → 시각적 위계 깨짐. 사양 §2-2 verbatim 위반. **FAIL** |
| b-6 | PriceCapture 카드 padding 14 / radius 12 | 14px / 12px | — (부재) | 부재 — 신규 시 사양값 사용. **FAIL (요소 부재)** |
| b-7 | ShareToCommunity 카드 padding 14 / radius 12 | 14px / 12px | — (부재) | 동일. **FAIL** |
| b-8 | Save pill padding 14_16 / radius 999 | — | — (부재 — header text Pressable px-3 py-2만) | 부재. **FAIL** |
| b-9 | ImpressionTriad gap 8 / 카드 padding 14_8 / radius 12 | 8 / 14_8 / 12 | — (부재) | **FAIL** |
| b-10 | Palate triad gap 6 / 카드 padding 8 / radius 8 | 6 / 8 / 8 | (대체된 WSETSlider 26×26 dot 사이 균등 분포 — 비율 다름) | **FAIL** |
| b-11 | AromaGrid 4 cols gap 6 / 카드 padding 10_4 / radius 10 | 6 / 10_4 / 10 | AromaChips: flex-wrap gap-2(8) / pill `px-3 py-2` / radius-full(9999) — 카드 ≠ pill | **FAIL** (요소 구조 자체 다름) |
| b-12 | AutoSummaryCard padding 12 / radius 12 | 12 / 12 | — (부재) | **FAIL** |
| b-13 | Step 5 (Rating) 카드 안 라벨 → 별 사이 `mt-2`=8px | StepHeader → StarRating 사이 사양은 카드 wrapper 없음 직접 stack | wrapper 있음 + mt-2 | **FAIL** (구조) |
| b-14 | Memo TextInput minHeight | `<textarea rows={3}>` ≈ 80px | `minHeight: 96` (beginner-form.tsx L116) | 미세 차이 (3 rows ≈ 80 vs 4 rows ≈ 96 — `numberOfLines={4}` L112). 사양 권장 rows=3 minHeight 80. **WARN** |
| b-15 | Memo input padding 10_12 | 10 vertical / 12 horizontal | `px-3 py-3` = 12/12 (L115) — fontSize default | py 12 vs 10 — 2px 차이. **WARN** |

판정: **(b) FAIL** (구조적 spacing 위반 8건 + 미세 차이 3건). 사양 verbatim `gap-row 18 + 카드 wrapper 제거 + step group gap 8~10 + 신규 5종 카드 padding/radius 표준`이 모두 미적용.

---

### (c) Gradient 방향·깊이 — FAIL

| # | 요소 | 키스크린 | 현재 RN | 평가 |
|---|---|---|---|---|
| c-1 | BlindMode LinearGradient (ExpertForm) | `linear-gradient(180deg, #5A1A24, #2D0D12)` — 위→아래 | `start={{x:0,y:0}} end={{x:1,y:1}}` — 135deg 대각 (expert-form.tsx L98~99) | **FAIL (D4)**. `gradients.expertBlind` 사용 (start {0.5,0} end {0.5,1}) 필요 |
| c-2 | AutoSummaryCard bg = withAlpha(gold, 0.06) flat (gradient 아님) | flat alpha | — (부재) | 요소 부재 — 향후 신규 시 사양값. **N/A (a-8에 포함)** |
| c-3 | BeginnerHeader / Step / Card 어디에도 gradient 없음 (verbatim flat) | flat | flat | **PASS** |
| c-4 | Save pill bg = wineRed solid | solid | — (부재 — header text만) | **N/A (a-11에 포함)** |

판정: **(c) FAIL (1건 — D4 BlindMode gradient direction).** Beginner는 gradient 자체 없음 (PASS), Expert만 수정 필요.

---

### (d) Corner radius — FAIL

| # | 요소 | 키스크린 | 현재 RN | 평가 |
|---|---|---|---|---|
| d-1 | Impression button radius 12 | 12 | — (부재) | **FAIL (a-2)** |
| d-2 | Palate triad button radius 8 | 8 | WSETSlider dot radius 13 (원형) — 다른 컴포넌트 | **FAIL (a-3)** |
| d-3 | AromaCard radius 10 | 10 | AromaChips: `rounded-full` (9999) — pill ≠ 카드 | **FAIL (a-4)** |
| d-4 | FinishTriad button radius 8 | 8 | — (부재) | **FAIL (a-5)** |
| d-5 | StepHeader badge radius 999 (circle) | 999 | — (부재) | **FAIL (a-12)** |
| d-6 | Memo TextInput radius 10 | 10 | `rounded-lg` = 8 (beginner-form.tsx L115) | 차이 2 — keyscreen verbatim 10. **FAIL** |
| d-7 | TastedAt TextInput radius (Beginner) | — (keyscreen에 없음) | `rounded-lg` 8 | **PASS** (keep RN — D 시리즈) |
| d-8 | AutoSummaryCard radius 12 | 12 | — (부재) | **FAIL (a-8)** |
| d-9 | PriceCapture radius 12 / NumberInput radius 8 | 12 / 8 | — (부재) | **FAIL (a-9)** |
| d-10 | ShareToggle radius 12 | 12 | — (부재) | **FAIL (a-10)** |
| d-11 | Save pill radius 999 | 999 | — (부재) | **FAIL (a-11)** |
| d-12 | BlindMode gradient inner radius 8 | 8 | `borderRadius: 8` (expert-form.tsx L100) | **PASS** |
| d-13 | Expert Section/RatingCard radius (`rounded-xl` = 12) | — (keyscreen Expert 카드 padding 16 radius 12) | `rounded-xl` 12 (expert-form.tsx L83/109/210) | **PASS** |
| d-14 | ReadinessPicker button radius 8 | — (keyscreen step 7 가까운 패턴) | `rounded-lg` 8 (L278) | **PASS** |

판정: **(d) FAIL (9건 — 모두 a 항목의 요소 부재에 따른 radius 부재).** Memo radius 10 vs 8 차이 1건 추가.

---

### (e) Typography 위계 — FAIL

| # | 요소 | 키스크린 typography | 현재 RN | 평가 |
|---|---|---|---|---|
| e-1 | BeginnerHeader eyebrow "입문자 모드" | Inter 11 600 gold uppercase ls 1.76 | — (부재) | **FAIL (a-1)** |
| e-2 | BeginnerHeader WineName "오늘의 한 잔" | Playfair 22 600 cream | — (WineLinkCard 와인명 사용 — 다른 typography) | **FAIL** |
| e-3 | BeginnerHeader Producer | Inter 13 secondary | — | **FAIL** |
| e-4 | BeginnerHeader Greeting | Inter 12 muted lh 18 | — | **FAIL** |
| e-5 | StepHeader badge text | Inter 11 700 cream | — | **FAIL (a-12)** |
| e-6 | StepHeader title | Inter 14 600 cream (cardSectionTitle 재사용) | 카드 안 라벨이 "Inter font-text-card-meta(12) text-text-secondary uppercase" (beginner-form.tsx L48 등) — **사이즈 12, weight 400, color secondary, uppercase** | **FAIL — 위계 깨짐**. 키스크린은 14 600 primary normal-case, 현재는 12 400 secondary uppercase (전혀 다른 위계) |
| e-7 | Impression label | Inter 12 600 cream | — (부재) | **FAIL (a-2)** |
| e-8 | Palate dim label | Inter 12 cream + dim level button text Inter 12 active cream / idle secondary | WSETSlider label Inter 12 400 secondary uppercase + value "1/5" Inter 600 13 primary | **FAIL — uppercase 위반 + 라벨 위계 다름**. 키스크린은 라벨 자체 normal-case primary, value는 dim 안 button text |
| e-9 | Aroma label | Inter 10 cream/gold | AromaChips "AROMA" Inter 12 400 secondary uppercase 카드 라벨 + 각 chip text Inter 12 400 active deepest / idle secondary | **FAIL** (사이즈 10 vs 12 + 카드 wrapper) |
| e-10 | Finish button text | Inter 13 active cream / idle secondary | — (부재) | **FAIL (a-5)** |
| e-11 | Memo label | (StepHeader 14 600 cream) | "COMMENT" Inter 12 400 secondary uppercase (beginner-form.tsx L103) | **FAIL — 위계 깨짐** (e-6과 동일 근본 원인) |
| e-12 | Memo input text | Inter 14 cream | font-inter text-card-body (13) text-text-primary (L115) | size 13 vs 14, 1px 차이. **WARN** |
| e-13 | AutoSummaryCard eyebrow | Inter 11 400 gold uppercase ls 1.1 | — (부재) | **FAIL (a-8)** |
| e-14 | AutoSummaryCard body | Playfair 13 italic cream lh 19.5 | — (부재) | **FAIL (a-8)** |
| e-15 | PriceCapture label | Inter 14 600 cream | — (부재) | **FAIL (a-9)** |
| e-16 | ShareToggle title / sub | Inter 13 600 cream / Inter 11 muted lh 13.2 | — (부재) | **FAIL (a-10)** |
| e-17 | Save pill text | Inter 15 600 cream center | header SaveBtn: font-inter-semibold text-card-body (13) text-gold (write.tsx L274) | **FAIL (a-11)** + 현재 header text size 13 vs 사양 15 footer pill |
| e-18 | BackHeader title "테이스팅 노트" vs "노트 작성" | "테이스팅 노트" / "Tasting note" (사양 §10 E2 권장) | `t('notes.write')` = "노트 작성" / "Write note" (ko.json L? — 사양 §8-3에 변경 권장) | **WARN** (i18n 값 변경 — E2 escalation 결정 후) |
| e-19 | Expert Section title | (keyscreen은 step 흐름) | "font-inter text-section-title text-gold uppercase" (expert-form.tsx L211) | Expert 5-section keep 결정이라 **PASS** |
| e-20 | Expert WSETSlider label | Inter 12 secondary uppercase | 동일 (wset-slider.tsx L29) | Expert는 keyscreen 1:1 매핑 아님 — **PASS** |
| e-21 | Expert Blind text "블라인드 모드" | Inter 13 cream center | font-inter text-card-body text-cream text-center (expert-form.tsx L102) | **PASS** |

판정: **(e) FAIL (위계 근본 위반)**. 라벨 위계 (Inter 14 600 primary normal-case StepHeader vs Inter 12 400 secondary uppercase 카드 라벨) 가 모든 Beginner 그룹에 누적 (e-6/e-8/e-9/e-11). 신규 요소 부재로 e-1~e-5/e-7/e-10/e-13~e-17 추가.

---

### (f) Color 사용 — FAIL

| # | 요소 | 키스크린 색 | 현재 RN | 평가 |
|---|---|---|---|---|
| f-1 | BeginnerHeader eyebrow color | gold #C9A84C | — (부재) | **FAIL (a-1)** |
| f-2 | BeginnerHeader WineName | text-primary cream/dark | — (WineLinkCard 사용) | **FAIL** |
| f-3 | StepHeader badge bg (beginner) | wineRed #8B1A2A | — (부재) | **FAIL (a-12)** |
| f-4 | StepHeader badge text | cream #F5F0E8 | — | **FAIL** |
| f-5 | Impression active bg | withAlpha(gold, 0.18) | — (부재) | **FAIL (a-2)** |
| f-6 | Impression active border / icon | gold | — | **FAIL** |
| f-7 | Impression idle bg | bg-surface | — | **FAIL** |
| f-8 | Palate triad active bg/border | wineRed bg + wineRed border + cream text | WSETSlider dot active bg/border = gold (wset-slider.tsx L53/55) | **FAIL — wineRed 대신 gold 사용**. 키스크린 Palate triad는 명백히 wineRed, 현재 RN은 WSETSlider라 gold dot 사용 (모든 1~5 슬라이더 동일 색) |
| f-9 | Palate idle bg/border | bg-surface + border-default | dot idle: transparent + border-default | 구조 다름 — **FAIL (a-3)** |
| f-10 | AromaCard active bg / border / icon | withAlpha(gold, 0.18) + gold border + gold icon | AromaChips active bg = gold solid (`bg-gold`) + transparent border (aroma-chips.tsx L55) — text-bg-deepest | **FAIL — gold solid 대신 gold@0.18 tint** (시각 톤 다름) |
| f-11 | FinishTriad active | wineRed | — (부재) | **FAIL (a-5)** |
| f-12 | StarRating star fill (gold) | gold | gold (star-rating L?) | **PASS** (별도 검증 결과 keep) |
| f-13 | Memo bg (dark) | #1A0A1E (map-dark 양쪽 동일) | `bg-bg-deep` = #2D1B36 (dark) / #F2EAD9 (light) — **dark 모드에서 #1A0A1E ≠ #2D1B36** | **FAIL (D3)** — keyscreen verbatim 위반. dark 모드는 bg-bottle-shelf(#1A0A1E) 권장, light은 bg-deep(#F2EAD9). 현재 dark에서 bg-deep 사용은 너무 밝음 (memo 영역 식별성 ↓) |
| f-14 | Memo border idle | border-default | brand.gold (beginner-form.tsx L116 `borderColor: brand.gold`) — **idle도 gold** | **FAIL — 항상 gold border**, 키스크린은 default(#5A3D6A) idle / gold는 focus or active만. **현재 RN은 focus 개념 없이 항상 gold ring** — 시각 강조 과도. |
| f-15 | TastedAt TextInput border | (사양 §2-2에 미정 — keyscreen Beginner에 표면화 없음) | gold (beginner-form.tsx L98) | f-14와 동일 — **FAIL** (단 사양에서 explicit 명시 없으므로 WARN 가능). |
| f-16 | AutoSummaryCard bg/border | withAlpha(gold, 0.06) / withAlpha(gold, 0.30) | — (부재) | **FAIL (a-8)** |
| f-17 | PriceCapture / ShareToggle bg | bg-surface | — | **FAIL (a-9/a-10)** |
| f-18 | Save pill bg | wineRed #8B1A2A | — (header text gold만) | **FAIL (a-11)** |
| f-19 | Save text | cream | gold (text-gold or text-text-disabled when no wine) | header keep — footer pill 추가 시 cream. **WARN** |
| f-20 | Expert BlindMode gradient colors | #5A1A24 → #2D0D12 (expertBlindBg) | 동일 colors (expert-form.tsx L97 `[expertBlindBg.start, expertBlindBg.end]`) | **PASS** (방향만 c-1) |
| f-21 | Expert ReadinessPicker active | (keyscreen Expert step7 가까운 패턴 — gold bg + bg-deepest text) | `bg-gold` + `text-bg-deepest` (L278/L282) | **PASS** |
| f-22 | Hardcoded hex 발견 grep | `brand.gold` (디자인 토큰) | `brand.gold` / `brand.cream` (design-tokens.ts 경유) — design-tokens.ts·tailwind.config.ts 외 raw hex 없음 | **PASS** (Plan D §4 위반 없음) |

판정: **(f) FAIL (핵심 색 위반 3건)**:
- f-8: Palate dim color **gold dot이 아니라 wineRed triad** 가 키스크린의 맛 균형 강조 색.
- f-10: AromaCard active bg **gold@0.18 tint가 아니라 gold solid** — 톤 과강.
- f-13: Memo bg **bg-bottle-shelf(#1A0A1E) 아니라 bg-deep(#2D1B36)** dark mode — keyscreen verbatim 위반.
- f-14/f-15: idle border **항상 gold**, focus 개념 없음 — 시각 강조 분산.

raw hex 위반 없음 (PASS).

---

## 2. 다크/라이트 양쪽 모드

- 스크린샷 reference: **dark / ko 만 제공**됨 (`_workspace/keyscreen-shots/notes_new_write.png`). light 모드 캡처 없음.
- 시뮬레이터 캡처 미수행 (이번 검증은 JSX + 스크린샷 비교 한정).
- 토큰 분기 검증: `useColorScheme()` 사용은 일부만 (beginner-form.tsx L38, expert-form.tsx L59) — placeholder color 분기만 처리. memo bg는 NW `bg-bg-deep` 토큰으로 dark/light 자동 분기 (tailwind config 확인 필요).
- 사양 §5-7 dark/light 표는 토큰 분기 완비 — 현재 RN BeginnerForm은 6-step 구조 자체가 없어 light 모드 검증 의미 없음. 재작성 시 양쪽 모드 동시 캡처 필요.

**결과: 양쪽 모드 검증 미완 — Day 6 재작성 후 재검증 필수.** 사양 17 체크리스트 마지막 항목 "양쪽 모드 + 양쪽 언어 캡처 → design-reviewer" 미이행.

---

## 3. 스크린샷 비교 (멀티모달 시각 차이)

**키스크린 reference (notes_new_write.png) 시각 요소** (top → bottom):

1. BackHeader `< 테이스팅 노트` (사양 E2 — 현재 RN은 "노트 작성")
2. **"입문자 모드"** gold uppercase eyebrow (현재 RN 부재)
3. **"오늘의 한 잔"** Playfair 22 cream large title (현재 RN: WineLinkCard CTA)
4. 안내문 muted 2줄 "와인 한 잔, 5분이면 끝나는 짧은 기록. ..." (현재 RN 부재)
5. **① 첫 인상** triad — Sparkles/Smile/HelpCircle 3 column (현재 RN 부재)
6. **② 맛의 균형** — 단/신/무게/떫음 4 dim × low/mid/high triad (현재 RN: WSET 4 dot slider)
7. **③ 어떤 향이 떠올라요?** — 4×2 그리드 8 카드 with 아이콘 (현재 RN: AromaChips 12 텍스트 pill flex-wrap)
8. **④ 여운은 얼마나?** — 짧음/중간/긴 triad (현재 RN 부재)
9. **⑤ 평점** Star × 5 (현재 RN 있음 — half-step)
10. **⑥ 한 줄 메모** textarea + 한국어 placeholder (현재 RN: comments TextInput — placeholder 다름)
11. **AutoSummaryCard** "오늘의 한 잔" Playfair italic 안내문 (현재 RN 부재)
12. **PriceCapture 카드** "가격 입력 (+5 XP)" Switch (현재 RN 부재)
13. **ShareToCommunity 카드** "커뮤니티에 공유" + sub Switch (현재 RN 부재)
14. **Save pill** wineRed full-width pill (현재 RN: header text only)

시각 갭 평가:
- **전체 폼 길이가 키스크린 verbatim 대비 1/3 이하** (현재 RN: 4 카드 + 별점 + comments).
- **수직 위계가 평면적** (모든 그룹이 동일 카드 wrapper p-4 bg-surface) — 키스크린은 카드 wrapper 없이 StepHeader로 위계 형성 + 보조 카드 3종만 wrapper.
- **색 톤 다름** — 키스크린은 wineRed × gold 이중 강조 (Palate=wineRed, Aroma=gold tint, Save=wineRed). 현재 RN은 gold 단일 강조 (모든 active 색이 gold).

---

## 4. 결정

- **결과: FAIL**
- **6항목 중 5 FAIL** (a 요소 누락 / b spacing / d radius / e typography / f color). c gradient는 Expert BlindMode 1건만 FAIL — Beginner에는 gradient 없음 (해당 항목 작은 영향).
- 누적 FAIL 항목 수 (sub-item 기준): a=12 + b=8(구조)+3(미세) + c=1 + d=9 + e=14+1(WARN) + f=8 = **약 55건** (구조적 + 미세 차이 + 미해결 i18n 1건 포함).
- 핵심 원인: BeginnerForm이 사양 §14 retroactive marshall plan A~I 미반영 상태 (Day 5 구현 그대로). Day 6 retroactive hardening 작업 본격 진행 필요.

### 라우팅

- **rn-screen-builder** — 사양 §14 marshall plan A~I 전체 + §17 변환 체크리스트 실행. 핵심 sub-task 9개:
  - A: BeginnerForm 재작성 (6 Step verbatim)
  - B: AutoSummaryCard + `summarize()` 함수
  - C: PriceCapture + ShareToCommunity 카드
  - D: StepHeader 컴포넌트 (variant beginner/expert)
  - E: write.tsx query 처리 확장 (templateId/from/itemId)
  - F: zod schema 변경 (BeginnerFields jsonb shape) + note-body-beginner.tsx 동시 수정
  - G: BlindMode gradient direction 수정 (135deg → 180deg)
  - H: design-tokens.ts + tailwind.config.ts 신규 토큰 + i18n 38 키
  - I: supabase-engineer `is_public` 컬럼 확인 요청
- **design-spec-author** — 사양 자체 보강 불필요. 사양 §17 체크리스트가 marshall plan 충분히 명세. 단 spec §10 E2 (notes.write 값) / E6 (BeginnerForm 재작성) / E13 (PriceCapture+Share) 결정 사항을 **리더 확정 필요** (사양 §17은 권장만, 리더 confirm 미반영).
- **infra-architect / design-tokens.ts** — 신규 typography 토큰 4개 (beginnerEyebrow / beginnerGreeting / stepHeaderBadge / summaryEyebrow / summaryText — 사양 §4-2). tailwind.config.ts mirror. `bg-bottle-shelf` 토큰 light 모드 분기 (D3) 검토. **P0 세션 (또는 rn-screen-builder 본인 처리)**.
- **supabase-engineer** — `tasting_notes.is_public boolean default false` 컬럼 마이그레이션 존재 여부 확인. 없으면 추가 마이그레이션 + RLS 정책 확장 (`select` 시 `auth.uid() = user_id OR is_public = true`).
- **qa-inspector** — design-review FAIL이므로 이번 cycle qa 단계 진입 보류. Day 6 retroactive 완료 + 재검증 PASS 후 qa-inspector 진입.

### 재검증 시점

rn-screen-builder가 sub-task A~G 구현 + sub-task H 토큰/i18n + sub-task I supabase 확인 완료 후 → 동일 6항목 체크리스트 재실행 + dark/light × ko/en 4 조합 시뮬레이터 캡처 첨부 요청.

### 추가 권장 (사양 §10 escalation 17건 중 SCOPE-IN 결정 사항)

| # | 사양 결정 | 판정 |
|---|---|---|
| E1 templateId query | 추가 | rn-screen-builder sub-task E에 포함 |
| E2 notes.write 값 | 변경 ("테이스팅 노트") | i18n 수정 — sub-task H |
| E3 Expert 7→5 section | keep 5-section | **PASS — 변경 불필요** |
| E4 VariantTabs | SCOPE-OUT v0.1.0 | **PASS** |
| E5 WSETSlider 5-stage | keep 1~5 | **PASS** |
| E6 BeginnerForm 6 Step 재작성 | **재작성** | sub-task A 핵심 |
| E7 submitting disabled | 추가 | sub-task A 부속 |
| E8 footer Save pill | header + footer 둘 다 | sub-task A 부속 (footer pill 신규 컴포넌트) |
| E9 Aroma 8 vs 12 | **8 카드 verbatim** | sub-task A 부속 (i18n aromaCard.* 신규) |
| E10 BeginnerFields jsonb shape 변경 | 변경 | sub-task F |
| E11 photoAttached | keep 현재 RN (photo_url query forward) | **PASS** |
| E12 XP 시스템 | SCOPE-OUT v0.2.0 | **PASS** |
| E13 PriceCapture + ShareToggle | 추가 | sub-task C |
| E14 AutoSummaryCard | 추가 + summarize() ko/en | sub-task B |
| E15 confirmDiscard Alert | keep | **PASS** |
| E16 is_public 컬럼 | supabase-engineer 확인 | sub-task I |
| E17 StepHeader variant | prop variant 통합 | sub-task D |

---

## 5. 미검증 항목 (다음 cycle에서 확인)

- 시뮬레이터 dark/light × ko/en 4 조합 캡처 (P2 세션 또는 rn-screen-builder 본인 캡처)
- `summarize()` 함수 ko/en 출력 정확도 (사양 미명세 — 키스크린 `auto-description.ts` 참조)
- Switch trackColor/thumbColor light 모드 가독성 (gold #C9A84C on #FAF5EC — 4.5:1 경계)
- iOS Italic 자동 vs Android Italic 별도 font load (PlayfairDisplay_400Regular_Italic)
- ScrollView 키보드 올라왔을 때 Save pill 가림 여부 (footer pill 추가 시)
- 키스크린 `XP_ACTIONS` toast 시스템 SCOPE-OUT 정합성 (note detail 화면에서 XP 표시 없어야 함)
- 한국어 long-text wrap (Greeting 2줄, AutoSummary 본문 wrapping)
- accessibilityState busy/disabled 동작 (TalkBack/VoiceOver 실측)

---

## 6. 파일 산출

- 본 보고서: `_workspace/design-review_notes-write_20260521_005332.md` (절대경로: `/Users/yejinkim/dev/winemine-app/_workspace/design-review_notes-write_20260521_005332.md`)
