# Design Review — /notes/new (source picker)

> 시각 품질 게이트 1차 검증 — design-reviewer
> 작성일: 2026-05-20 23:10 (Day 6 retroactive hardening)
> 사양: `_workspace/design-specs/notes-new.md` (Option A 채택 가정 — verbatim 2-stage)
> 결과: **FAIL (6/6)** — 전면 재작성 필요

## 대상

- 사양: `_workspace/design-specs/notes-new.md` (644 LOC, design-spec-author Day 6 산출물)
- 원본: `../winemine-keyscreen/src/app/notes/new/page.tsx` (305 LOC, NewNoteSourcePage + 인라인 TemplateCard) + 자식 (back-header, bottom-sheet, source-picker, tasting-templates, cellar)
- 구현: `app/notes/new.tsx` (140 LOC, Day 5 작성)
- 스크린샷: `_workspace/keyscreen-shots/notes_new.png` (Stage 1, ko, dark)
- 토큰: `src/lib/design-tokens.ts`, i18n: `src/lib/i18n/{ko,en}.json`

## 사전 결정 (SCOPE-OUT 명시)

리더 입력에 따라 사양 §13 escalation E1/E2를 **Option A (verbatim)** 으로 채택했다. 키스크린의 2-stage Template/Source/Cellar 흐름이 진실 소스이며, 현재 RN의 6-option BottomSheet (cellar/restaurant/shop/gift/tasting_event/other)는 keyscreen에 존재하지 않는 임의 구조다. 따라서 (1)~(6) 전 항목에서 "임의 단순화 + 키스크린 동등 요소 누락"으로 평가한다.

SCOPE-OUT (이 리뷰에서 판정하지 않음): tasting_notes.source_type DB 스키마 변경, template_id 컬럼 신설, Day 6 settings 화면, AppHeader 재작성, BottomNav 구성.

---

## 6항목 체크리스트

### (1) 요소 누락 — **FAIL (Critical)**

키스크린에 있는 다수의 1급 요소가 현재 RN 구현에 전혀 존재하지 않는다.

- `app/notes/new.tsx:76-108` — **BackHeader 자체가 없음**.
  - 키스크린: `../winemine-keyscreen/src/components/nav/back-header.tsx` 56px header (ChevronLeft 24 + "출처 선택" title) — 스크린샷 상단 좌측 `< 출처 선택`. 현재 RN은 BottomSheet 본인이 화면을 점령하여 헤더 영역이 0px.
  - 수정: `<SafeAreaView><BackHeader title={t('notes.source.title')} /><ScrollView>...</ScrollView></SafeAreaView>` 구조로 재작성. BackHeader 컴포넌트는 이미 `src/components/nav/back-header.tsx`에 존재 (cellar-detail에서 사용 중) — 재사용.

- `app/notes/new.tsx:88-105` — **Stage 1 Template Picker 자체가 부재**.
  - 키스크린 스크린샷 본문: Playfair 22 "어떤 양식으로 적을까요?" + Inter 13 muted "테이스팅 노트 양식을 골라주세요. 설정에서 직접 만들 수도 있어요." + TemplateCard 2개 (입문자용 / 전문가용, "winemine 제공", description 2줄, 우측 ChevronRight).
  - 현재 RN: Playfair "어디에서 마셨나요?" (다른 문구) + 6개 source row (Utensils/Store/Gift/GlassWater/MoreHorizontal 등 — 키스크린에 일절 등장하지 않음).
  - 수정: `src/components/notes/template-card.tsx` 신규 + `src/lib/notes/builtin-templates.ts` 신규 (BUILTIN_BEGINNER + BUILTIN_EXPERT 상수). Stage 1 분기 (`selectedTemplateId == null`)에서 TemplateCard×2 렌더.

- `app/notes/new.tsx:88-105` — **Stage 2 Source Picker (Cellar/NewWine 2-card) 부재**.
  - 키스크린 line 94-113: BackToTemplateLink ("← 양식 다시 선택", Inter 11 600 gold) + Playfair 22 "어떤 와인을 기록할까요?" + Inter 13 muted subtitle + CellarCard (Wine 28 gold + "내 셀러에서" + "N병 보관 중") + NewWineCard (Camera 28 wine-red + "새 와인" + "라벨 사진을 찍거나 직접 입력해요").
  - 현재 RN: 해당 Stage 부재. 6 source row가 Stage 1 위치에 그냥 깔려 있음.
  - 수정: `src/components/notes/source-picker.tsx` 신규 — Wine 아이콘 28 strokeWidth 1.5 gold (CellarCard), Camera 아이콘 28 strokeWidth 1.5 wine-red (NewWineCard).

- `app/notes/new.tsx:78-87` — **Stage 3 Cellar BottomSheet 부재** (가장 큰 사양 vs 구현 mismatch).
  - 키스크린 line 116-206: pickOpen 분기 시 BottomSheet 오버레이 — Playfair 18 "셀러 와인" + CellarList scrollable + CellarRow (BottleThumb 32×44 + Playfair 13 wine name + Inter 11 vintage·region).
  - 현재 RN: BottomSheet를 Stage 1 source picker로 잘못 사용. Cellar 와인 선택 단계 자체가 없음.
  - 수정: `src/components/notes/cellar-bottom-sheet.tsx` 신규 — `pickOpen` state 분기. WMBottle 32×44 또는 LinearGradient 160deg [bottleColor, '#1a0a1e'].

- `app/notes/new.tsx:96-103` — **임의 추가 요소 5개**.
  - `restaurant/shop/gift/tasting_event/other` 5개 row는 키스크린 어디에도 등장하지 않음. CLAUDE.md §AI 협업 지침 "verbatim 변환 + 임의 단순화 금지" 위반의 반대 방향 — 임의 *추가*.
  - 수정: 5개 row 전부 제거. (DB의 tasting_notes.source_type enum은 별도 결정 — E2 escalation, scope-out.)

- `app/notes/new.tsx:104` — **TemplateCard description 2줄 표시 부재** + **ChevronRight trailing icon 부재**.
  - 키스크린 스크린샷: 각 카드 하단 description (입문자: "5분이면 끝나는 짧은 기록. 첫 인상·맛·향·여운·평점·메모." / 전문가: "WSET 기반 풀 옵션. 아로마 휠, 카우달리, 결함 체크, 오프닝 타임라인까지.") + 우측 ChevronRight 16.
  - 현재 RN: SourceRow에 label 한 줄만. trailing icon 없음.
  - 수정: TemplateCard 컴포넌트 안에 description (numberOfLines=2 ellipsizeMode=tail) + ChevronRight size=16 text-muted.

- `app/notes/new.tsx` — **CustomBadge·BackToTemplateLink 부재**.
  - 키스크린: kind='custom' template에 "커스텀" badge (gold/0.15 bg + gold/0.4 border, Inter 9 600 ls 0.05em uppercase). v0.1.0은 builtin 2종만이라 실제 렌더 안 되지만 컴포넌트는 정의 필요.
  - v0.1.0 SCOPE-OUT 가능 (community/custom templates 미포함). but BackToTemplateLink는 Stage 2 표시 필수.

요약: **상위 7개 1급 요소 누락 + 5개 임의 추가**. 현재 구현은 키스크린과 본질적으로 다른 화면이다.

### (2) Spacing 비율 — **FAIL**

현재 RN의 spacing은 키스크린의 2-stage 구조 자체가 부재하므로 비율을 평가할 base가 없다. 그래도 검증 가능한 항목:

- `app/notes/new.tsx:88` — BottomSheetView `paddingHorizontal:20, paddingTop:8, paddingBottom:24`.
  - 사양 §3: Stage 1 ScrollView `paddingTop:12, paddingHorizontal:16, paddingBottom:32`. 16/32가 표준 (cellar-list, cellar-detail와 동일).
  - 현재: 20/24 (px) — 키스크린 16/32와 비율 어긋남.
  - 수정: `contentContainerStyle={{paddingTop:12, paddingHorizontal:16, paddingBottom:32}}` (Stage 1 진입 후 ScrollView).

- `app/notes/new.tsx:92,95` — `mt-1` (Stage 1 subtitle margin) `mt-4 gap-2` (row list).
  - 사양 §3: Stage 1 header → mb-3.5 (14px). 사양 row list gap-2.5 (10px). 현재 RN은 mt-4 gap-2.
  - 수정: Stage 1: subtitle `mt-1` (4px) OK. TemplateList `gap-2.5` (10px) — gap-2 (8px) 어긋남.

- `app/notes/new.tsx:124-127` — SourceRow `height: 80`.
  - 키스크린 SourceCard: padding 18 + icon 28 + 2-line text — 자연 높이 ~100pt. TemplateCard: padding 14_16 + title row + author + description 2줄 → ~110~120pt.
  - 수정: 고정 height 제거. padding으로 자연 높이.

- TemplateCard 내부 gap (사양 §3): TitleRow `gap-1.5` (6) + TextStack `mb-1` (4) + description `mt-6` (6). 현재 RN 없음.

요약: 키스크린 16/32 화면 padding과 mb-3.5/gap-2.5 카드 spacing이 누락. RN은 임의 20/24/gap-2.

### (3) Gradient 방향·깊이 — **FAIL**

키스크린은 Stage 3 CellarRow의 BottleThumb에 명시 gradient를 요구한다.

- 사양 §3 line 208: `LinearGradient(160deg, [wine.bottle_color, '#1a0a1e'], locations [0, 0.7])` — 와인 병 모양 32×44.
- 현재 RN: Stage 3 자체 부재 → gradient도 부재.
- 수정: `cellar-bottom-sheet.tsx` 안 CellarRow의 BottleThumb은 `<WMBottle width={32} height={44} bottleColor={wine.bottle_color}/>` (이미 SVG로 gradient 처리) 또는 verbatim LinearGradient. WMBottle은 cellar-list와 일관성 유지를 위해 권장.

추가:
- `app/notes/new.tsx:131` — SourceRow의 아이콘 배경 `backgroundColor: 'rgba(201,168,76,0.12)'`은 **하드코딩 alpha hex** (gold withAlpha 0.12). 사양에 명시되지 않은 임의 디자인 (icon halo).
  - 키스크린: 아이콘은 카드 좌상단에 단순 stroke icon — halo·circle bg 없음 (스크린샷 검증 — 입문자용 노트 카드의 텍스트가 좌측 padding부터 바로 시작, halo circle 보이지 않음. 단, 스크린샷이 Stage 1 Template Picker이므로 Source Picker의 CellarCard/NewWineCard와는 별개 — 둘 다 halo 없는 stroke icon).
  - 수정: halo 제거 + `withAlpha(brand.gold, 0.12)` 토큰 미사용 시 design-tokens.ts helper 호출로 변경 권장.

### (4) Corner radius — **FAIL**

- `app/notes/new.tsx:123` — SourceRow `rounded-xl` (NW v4 12px).
  - 사양 §3 line 187, 198: TemplateCard·CellarCard·NewWineCard 모두 `radius 14` (design-tokens.radius[14] 신규/기존 14).
  - 키스크린 line 233 (TemplateCard) + line 100 (SourceCard inferred): `borderRadius: 14`.
  - 현재 RN: 12 — 키스크린과 2px 차이.
  - 수정: `rounded-14` (radius 토큰 14) 또는 `style={{borderRadius:14}}`.

- `app/notes/new.tsx:130` — SourceRow 내부 icon halo `rounded-full` (9999) — 키스크린에 존재하지 않는 요소이므로 평가 불가. 항목 (1) 누락에 의해 halo 자체 제거.

- 사양 §3 line 207: Stage 3 CellarRow `radius 10` — `radius['10']` 토큰 신규 (design-tokens.ts에 이미 capture SecondaryButton용으로 정의됨, line 347 확인). 재사용 가능.

- 사양 §3 line 191: CustomBadge `radius full` (9999). v0.1.0 SCOPE-OUT 가능.

요약: 현재 12 (rounded-xl) → 키스크린 14 (radius[14]) 이동 필요. 키스크린 14 사용처: TemplateCard / CellarCard / NewWineCard 모두.

### (5) Typography 위계 — **FAIL (위계 자체가 부재)**

키스크린은 4-tier 위계를 명확히 요구하는데, 현재 RN은 2-tier만 사용한다.

- `app/notes/new.tsx:89` — Stage 1 title `font-playfair text-modal-title text-text-primary` (Playfair 22 lh 26.4). **이것만 OK** (사양 §4-1).
- `app/notes/new.tsx:92` — subtitle `font-inter text-card-body text-text-secondary` (Inter 13 lh 19.5).
  - 사양 §3 line 65: subtitle은 `text-text-muted` (Inter 13 muted, lh 1.5). 현재 `text-text-secondary`로 잘못된 색 토큰.
  - 수정: `text-text-muted`.

- `app/notes/new.tsx:135` — SourceRow label `font-inter-semibold text-card-title text-text-primary`.
  - `typography.cardTitle`은 Playfair 16 (design-tokens.ts §typography 기준). `font-inter-semibold`와 충돌 (Playfair 패밀리 토큰 + Inter font family).
  - 사양 §3 line 200: SourceCard title은 Inter 16 600 lh 19.2 — 신규 토큰 `sourceCardTitle` 필요 (§4-2 P0). 또는 기존 토큰 재사용 시 font family/size mismatch.
  - 수정: 신규 `typography.sourceCardTitle = Inter 16 600 lh 19.2` 추가.

- **누락된 위계 레이어**:
  - TemplateCard title (Inter 14 600 lh 16.8) — 신규 토큰 `templateCardTitle` 필요.
  - TemplateCard author "winemine 제공" (Inter 11 lh 13.2) — 신규 토큰 `templateCardAuthor` 필요.
  - TemplateCard description (Inter 12 lh 17.4) — 신규 토큰 `templateCardDesc` 필요.
  - SourceCard sub "N병 보관 중" (Inter 12 lh 16.8) — 신규 토큰 `sourceCardSub` 필요.
  - BottomSheet title "셀러 와인" (Playfair 18 lh 21.6) — 신규 토큰 `bottomSheetTitle` 필요.
  - CellarRow name (Playfair 13 lh 15.6) — 신규 토큰 `cellarRowName` 필요.
  - CellarRow meta (Inter 11 lh 13.2) — 신규 토큰 `cellarRowMeta` 필요.
  - BackToTemplateLink (Inter 11 600 lh 13.2) — 신규 토큰 `backToTemplateLink` 필요.

요약: 사양 §4-2 신규 typography 토큰 **9개** 모두 design-tokens.ts에 추가 필요. 현재 RN은 위계 레이어 자체를 한 단(card-title)만 사용하여 키스크린의 4-tier 위계를 평면화함.

### (6) Color 사용 — **FAIL**

- `app/notes/new.tsx:131` — **하드코딩 hex 검출** (CLAUDE.md §4-9 위반): `backgroundColor: 'rgba(201,168,76,0.12)'`.
  - design-tokens.ts에 `withAlpha(brand.gold, 0.12)` helper가 있음. 직접 rgba 문자열 사용은 토큰 우회.
  - 수정: 항목 (1)에서 halo 제거 권장. 유지하더라도 `withAlpha(brand.gold, 0.12)` helper 호출.
  - **추가 위반**: 현재 코드는 grep 시 design-tokens·tailwind·lwin 외 hex로 식별 (반드시 FAIL — 가이드라인의 "하드코딩 hex 검출 누락 시 반드시 FAIL").

- `app/notes/new.tsx:42` — `sheetBg = scheme === 'light' ? light.bg.deep : dark.bg.deep` (BottomSheet 배경).
  - 사양 §4-1: 모든 카드/Stage들의 outer 배경은 `bg.deepest` (스크린 outer), 카드 자체는 `bg.surface`. 현재 RN BottomSheet bg는 `bg.deep` — 사양과 다른 토큰.
  - 수정: Stage 1/2 ScrollView outer = `bg.deepest`. Stage 3 BottomSheet backgroundStyle = `bg.deep` 유지 가능 (BottomSheet는 sunken으로 layering 차이) — 단 keyscreen verbatim 시 `bg.surface` (#3D2A4A / #FFFFFF) 사용 권장.

- `app/notes/new.tsx:92` — subtitle `text-text-secondary` — 사양은 `text-text-muted` (위 (5) 참조). 색 토큰 mis-assignment.

- **누락된 brand color 사용**:
  - `brand.gold` — CellarCard active border (1px), Wine icon 28 fill, CustomBadge bg/border/text, BackToTemplateLink, DragHandle.
  - `brand.wineRed` — NewWineCard border (1px), Camera icon 28 fill.
  - 현재 RN: gold는 icon에만 (`color={brand.gold}` line 133). wineRed 사용처 0.
  - 수정: Source Picker 구현 시 두 brand 색을 verbatim 적용.

- **BottleThumb gradient end `#1a0a1e`** — `dark.bg.bottleShelf` 토큰화 가능. Stage 3 구현 시 토큰 사용.

요약: 1개 직접 하드코딩 (rgba(201,168,76,0.12)) + 색 토큰 잘못 사용 (text-text-secondary vs text-text-muted, bg.deep vs bg.deepest) + brand.wineRed 미사용. CLAUDE.md §4-9 위반.

---

## 다크/라이트 양쪽 모드

- 시뮬레이터 캡처 진행 불가 (현재 구현이 BottomSheet 단일 6-option이라 시각적으로 키스크린과 본질이 달라 비교 의미 없음. 재작성 후 검증).
- 키스크린 스크린샷은 dark/ko만 제공. light/en 캡처는 P2 세션에서 추가 필요.
- 사양 §5-5에 dark/light dual-mode 토큰 매트릭스가 완비되어 있어, 재작성 시 양쪽 모드 동시 검증 가능.

판정: **미검증 (BLOCKED)** — 재작성 후 dark/light × ko/en 4 캡처 → 재검증.

## 스크린샷 비교 (멀티모달)

키스크린 `_workspace/keyscreen-shots/notes_new.png` (Stage 1, dark, ko) 시각 확인 결과:

| 요소 | 키스크린 | 현재 RN |
|---|---|---|
| 상단 좌측 | `< 출처 선택` (Inter 16 600 cream) | 없음 |
| 메인 타이틀 | "어떤 양식으로 적을까요?" (Playfair 22 cream) | "어디에서 마셨나요?" (다른 문구) |
| 서브 카피 | "테이스팅 노트 양식을 골라주세요. 설정에서 직접 만들 수도 있어요." (Inter 13 muted, 2줄 wrap) | "출처를 선택해주세요" (한 줄, 다른 문구) |
| 카드 1 제목 | "입문자용 노트" (Inter 14 600 cream) | "셀러" (다른 의미) |
| 카드 1 author | "winemine 제공" (Inter 11 muted) | 없음 |
| 카드 1 description | "5분이면 끝나는 짧은 기록. 첫 인상·맛·향·여운·평점·메모." (Inter 12 secondary, 1줄) | 없음 |
| 카드 1 trailing | ChevronRight 16 muted | 없음 (대신 좌측 halo icon) |
| 카드 2 | "전문가용 노트" / "winemine 제공" / "WSET 기반 풀 옵션. 아로마 휠, 카우달리, 결함 체크, 오프닝 타임라인까지." (description 2줄) | "레스토랑" (다른 의미) |
| 카드 3~6 | 없음 | "상점/선물/시음회/기타" (임의 추가) |
| FAB | 좌하단 N (winemine 로고) | 없음 |
| 전체 윤곽 | 2-card 깔끔 + 빈 공간 풍부 | 6개 row가 빽빽 |

시각 차이는 절대적이다. 키스크린은 "양식을 고른다"는 의도, 현재 RN은 "출처를 고른다"는 의도. **본질적 화면 정체성 불일치**.

---

## 결정

### 결과: **FAIL (6/6)** — 전면 재작성

| 항목 | 결과 | 심각도 |
|---|---|---|
| (1) 요소 누락 | FAIL | Critical (7개 1급 누락 + 5개 임의 추가) |
| (2) Spacing 비율 | FAIL | High |
| (3) Gradient 방향·깊이 | FAIL | High (Stage 3 자체 부재) |
| (4) Corner radius | FAIL | Medium (12 → 14) |
| (5) Typography 위계 | FAIL | Critical (4-tier → 2-tier 평면화 + 9 토큰 누락) |
| (6) Color 사용 | FAIL | Critical (하드코딩 hex 1건 + 색 토큰 mis-assignment 2건) |

### 라우팅

- **rn-screen-builder**: 위 (1)~(6) 전 항목 수정. 사양 §14 변환 체크리스트 전부 진행. 단일 파일 재작성보다 컴포넌트 분리 권장 (사양 §13 E6).
  - 신규 파일: `src/components/notes/template-card.tsx`, `src/components/notes/source-picker.tsx`, `src/components/notes/cellar-bottom-sheet.tsx`, `src/lib/notes/builtin-templates.ts`.
  - 수정 파일: `app/notes/new.tsx` (Stage 분기 + 조립).
- **infra-architect** (P0 별도 세션): `src/lib/design-tokens.ts` typography 신규 9개 + (radius 10은 이미 존재 — 재사용) + `tailwind.config.ts` mirror.
  - typography 신규: `templateCardTitle, templateCardAuthor, templateCardDesc, templateCustomBadge, sourceCardTitle, sourceCardSub, bottomSheetTitle, cellarRowName, cellarRowMeta, backToTemplateLink` (10개 — 사양 §4-2).
- **i18n**: rn-screen-builder가 i18n ko/en에 21개 신규 키 추가 + `notes.source.title` 값 수정 (`"출처 선택"` / `"Choose source"`). 사양 §8-2 verbatim.
- **design-spec-author**: 사양 자체는 충실 — 추가 보강 불요. 단 §13 E1/E2 escalation에 대한 리더 결정 (Option A 채택 가정) 명문화 필요 시 §13 표 위에 결정 노트 추가 요청 가능.
- **supabase-engineer (SCOPE-OUT)**: tasting_notes.source_type enum 축소 또는 template_id 컬럼 추가는 본 리뷰 범위 밖. 리더 결정 대기.

### P0 차단

design-tokens.ts에 신규 typography 10개가 없으면 rn-screen-builder가 또 임의 토큰을 만들거나 raw style로 도망간다 (가이드라인의 "토큰 없으면 또 하드코딩으로 도망"). **P0 세션 (토큰 확장) 완료 후 rn-screen-builder 작업 시작 권장**.

### 재검증 시점

rn-screen-builder 수정 완료 → 동일 6항목 체크리스트 재실행. 추가로 dark/light × ko/en 4 캡처 시뮬레이터에서 진행 후 keyscreen `notes_new.png` (dark/ko)와 line-by-line 비교.

---

## 부록 — 현재 코드 grep 검출 hex

```
app/notes/new.tsx:131  backgroundColor: 'rgba(201,168,76,0.12)'
```

설계 토큰·tailwind·lwin 외 hex 1건. CLAUDE.md §4-9 (하드코딩 hex 금지) 위반.

## 부록 — 사양 §13 escalation 중 builder가 즉시 처리 가능한 항목

- E3: typography 신규 9개 모두 추가 → P0 세션
- E4: community/custom v0.1.0 SCOPE-OUT → builder 구현 시 builtin 2종만 하드코딩
- E5: i18n `notes.source.title` 값 변경 → builder가 처리
- E6: 컴포넌트 분리 → builder 결정 (권장: 분리)
- E7: tid query 인코딩 → builder가 표준화 (`encodeURIComponent`)
- E8: capture → /notes/new query 보존 → builder가 유지
- E9: ko description 2줄 fit → 재검증 시 design-reviewer 확인
- E10: BottomSheet handle gold 양쪽 모드 → 재검증 시 design-reviewer 확인

리더 판단 필요 (즉시 처리 불가): E1 (template_id 컬럼), E2 (source_type enum 축소).
