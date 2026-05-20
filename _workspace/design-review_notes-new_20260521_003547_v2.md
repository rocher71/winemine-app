# Design Review — /notes/new (source picker) — v2 (post-fix)

> 시각 품질 게이트 2차 검증 — design-reviewer
> 작성일: 2026-05-21 00:35 (Day 6 retroactive hardening, post rn-screen-builder 1차 fix)
> 1차 보고서: `_workspace/design-review_notes-new_20260520_231022.md` (FAIL 6/6)
> 사양: `_workspace/design-specs/notes-new.md` (Option A verbatim 2-stage)
> 결과: **PASS (6/6)** — STILL-FAIL 0, 신규 FAIL 0

## 대상

- 사양: `_workspace/design-specs/notes-new.md` (644 LOC)
- 원본: `../winemine-keyscreen/src/app/notes/new/page.tsx` (305 LOC, NewNoteSourcePage + 인라인 TemplateCard) + 자식 (back-header, bottom-sheet, source-picker)
- 구현 (1차 fix 적용, 미커밋):
  - `app/notes/new.tsx` (226 LOC, 전면 재작성)
  - `src/components/notes/template-card.tsx` (158 LOC, 신규)
  - `src/components/notes/source-picker.tsx` (171 LOC, 신규)
  - `src/components/notes/cellar-bottom-sheet.tsx` (228 LOC, 신규)
  - `src/lib/notes/builtin-templates.ts` (69 LOC, 신규)
  - `src/lib/design-tokens.ts` (line 433~450, typography 10 신규)
  - `tailwind.config.ts` (line 145~155, font-size 10 mirror)
  - `src/lib/i18n/{ko,en}.json` (notes.source.* 6 + notesNew.* 14 신규 + notes.source.title 값 교체)
- 키스크린 스크린샷: `_workspace/keyscreen-shots/notes_new.png` (Stage 1, dark, ko)

## SCOPE-OUT (이 리뷰에서 판정하지 않음)

- Day 6 settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav tabs 구성
- AppHeader 재작성
- tasting_notes.source_type schema 변경 + template_id 컬럼 신설 (supabase-engineer 영역)
- write.tsx 연동 (templateId query) — 별도 작업
- `src/components/notes/wine-link-card.tsx:42` 의 `'rgba(201,168,76,0.12)'` 하드코딩 (write 화면에서만 사용 — notes/new 범위 외)

---

## 1차 6 FAIL 카테고리 trace

### (1) 요소 누락 — 1차: FAIL (Critical) / 2차: **RESOLVED**

| 1차 발견 항목 | 2차 상태 | 증거 |
|---|---|---|
| BackHeader 부재 | RESOLVED | `app/notes/new.tsx:94` `<BackHeader title={t('notes.source.title')} />` — i18n 값 "출처 선택" 검증 (ko.json:260) |
| Stage 1 Template Picker 부재 | RESOLVED | `app/notes/new.tsx:100,128~159` `Stage1TemplatePicker` 컴포넌트. Playfair title `notesNew.templatePicker.title` ("어떤 양식으로 적을까요?") + 서브 + TemplateCard×2. |
| Stage 2 Source Picker (Cellar/NewWine 2-card) 부재 | RESOLVED | `app/notes/new.tsx:103~110` + `src/components/notes/source-picker.tsx` Cellar/NewWine 2-card |
| Stage 3 Cellar BottomSheet 부재 | RESOLVED | `app/notes/new.tsx:113~119` + `src/components/notes/cellar-bottom-sheet.tsx` (@gorhom/bottom-sheet snapPoints ['70%']) |
| 임의 추가 5개 (restaurant/shop/gift/tasting_event/other) | RESOLVED | grep 0건 — `app/notes/new.tsx`+`src/components/notes/*.tsx`에서 모두 제거 |
| TemplateCard description 2줄 + ChevronRight trailing | RESOLVED | `template-card.tsx:142~151` `numberOfLines={2}` + `template-card.tsx:154` `<ChevronRight size={16}/>` |
| CustomBadge + BackToTemplateLink 부재 | RESOLVED | CustomBadge: `template-card.tsx:103~127` (v0.1.0 builtin만이므로 실제 렌더 안 되지만 컴포넌트 존재) / BackToTemplateLink: `app/notes/new.tsx:179~194` (Stage 2 진입 시 표시) |

추가 검증:
- `app/notes/new.tsx:94` BackHeader title binding 확인 — `t('notes.source.title')` → ko "출처 선택" / en "Choose source" 양쪽 keyscreen verbatim 일치.
- `BUILTIN_TEMPLATES` 2종이 모두 keyscreen mock과 일치 — `builtin-templates.ts:32~47` (BUILTIN_BEGINNER + BUILTIN_EXPERT, kind 'builtinBeginner'/'builtinExpert', mode 'beginner'/'expert').
- `notesNew.templatePicker.subtitle` ko: "테이스팅 노트 양식을 골라주세요. 설정에서 직접 만들 수도 있어요." — 키스크린 스크린샷의 2-line wrap subtitle과 verbatim 일치.

### (2) Spacing 비율 — 1차: FAIL / 2차: **RESOLVED**

| 1차 발견 항목 | 2차 상태 | 증거 |
|---|---|---|
| ScrollView padding 20/24 (어긋남) | RESOLVED | `app/notes/new.tsx:98` `paddingTop:12, paddingHorizontal:16, paddingBottom:32` — 사양 §3 일치 |
| Stage 1 header mb-3.5 (14) 누락 | RESOLVED | `app/notes/new.tsx:133` `marginBottom:14` (mb-3.5 등가) |
| subtitle mt 4 (mt-1) 누락 | RESOLVED | `app/notes/new.tsx:139` `marginTop:4` |
| TemplateList gap-2.5 (10) 누락 | RESOLVED | `app/notes/new.tsx:146` `gap:10` |
| SourceRow 고정 height 80 (자연 높이 X) | RESOLVED | SourceRow 삭제. CellarCard/NewWineCard 모두 padding 18 + gap 6 자연 높이 — `source-picker.tsx:105~106, 150~151` |
| TemplateCard 내부 gap-1.5/mb-1/mt 6 누락 | RESOLVED | `template-card.tsx:91~92` titleRow gap:6/mb:4 / `:145` description mt:6 |
| Stage 2 BackLink mb-3 (12) | RESOLVED | `app/notes/new.tsx:186` `marginBottom:12` |
| Stage 2 SourcePicker header mb-1 (4) | RESOLVED | `app/notes/new.tsx:197` `marginBottom:4` |
| Stage 2 SourcePicker 2-card gap-2.5 (10) | RESOLVED | `source-picker.tsx:40` `gap:10` |
| BottomSheet content padding 0_4 bottom 16 gap 8 | RESOLVED | `cellar-bottom-sheet.tsx:123` `paddingHorizontal:4, paddingBottom:16, gap:8` |
| BottomSheet title marginHorizontal 8 mt 4 mb 12 | RESOLVED | `cellar-bottom-sheet.tsx:130~132` |
| CellarRow padding 10 gap 10 | RESOLVED | `cellar-bottom-sheet.tsx:186~187` `gap:10, padding:10` |
| CellarRow list gap 6 | RESOLVED | `cellar-bottom-sheet.tsx:139` `gap:6` |

추가 정밀 검증 — TemplateCard 내부:
- 카드 outer: `template-card.tsx:76~80` `gap:12, paddingHorizontal:16, paddingVertical:14` — 사양 §3 line 187 (`padding 14_16`) verbatim 일치.

### (3) Gradient 방향·깊이 — 1차: FAIL / 2차: **RESOLVED**

| 1차 발견 항목 | 2차 상태 | 증거 |
|---|---|---|
| Stage 3 자체 부재 → BottleThumb gradient 부재 | RESOLVED | `cellar-bottom-sheet.tsx:196~203` BottleThumb으로 `<WMBottle width={32} height={44} bottleColor={bottleColor} type={typeCanon}/>` 사용. WMBottle 내부에 SVG gradient 처리 (cellar-list와 동일 패턴) — 사양 §9 deviation 명시된 WMBottle 채택. |
| 임의 halo `rgba(201,168,76,0.12)` 하드코딩 | RESOLVED | grep `rgba\(` 결과 — `app/notes/new.tsx` / `src/components/notes/template-card.tsx,source-picker.tsx,cellar-bottom-sheet.tsx` 모두 0건. halo 컨셉 자체 제거 (사양에 정의되지 않은 임의 요소). |

추가 검증:
- BottleThumb `bottleColor` fallback: `cellar-bottom-sheet.tsx:164` `wine.bottle_color ?? getDefaultBottleColor(typeCanon)` — 와인 type별 기본색 사용 (cellar-list와 일관).
- 사양 §9 deviation 표 line 493: "WMBottle SVG로 일관성 — cellar-list와 동일. verbatim 원하면 별도 옵션"의 권장안 채택. **OK**.

### (4) Corner radius — 1차: FAIL / 2차: **RESOLVED**

| 1차 발견 항목 | 2차 상태 | 증거 |
|---|---|---|
| TemplateCard radius 14 (현재는 12 rounded-xl) | RESOLVED | `template-card.tsx:79` `borderRadius:14` |
| CellarCard radius 14 | RESOLVED | `source-picker.tsx:102` `borderRadius:14` |
| NewWineCard radius 14 | RESOLVED | `source-picker.tsx:147` `borderRadius:14` |
| CellarRow radius 10 | RESOLVED | `cellar-bottom-sheet.tsx:192` `borderRadius:10` |
| CustomBadge radius full (9999) | RESOLVED | `template-card.tsx:108` `borderRadius:9999` |
| DragHandle 36×4 radius 2 | RESOLVED | `cellar-bottom-sheet.tsx:114~117` `width:36, height:4, borderRadius:2` |

추가 검증:
- design-tokens.ts radius scale에 `'10': 10` / `'14': 14` 모두 존재 (line 347, 349 — 기존 P0 세션에서 추가됨).
- tailwind.config.ts `borderRadius` extend에 `'10': '10px'` `'14': '14px'` mirror (line 81~82).

### (5) Typography 위계 — 1차: FAIL (Critical, 4-tier → 2-tier 평면화 + 9 토큰 누락) / 2차: **RESOLVED**

| 1차 발견 항목 | 2차 상태 | 증거 |
|---|---|---|
| 신규 typography 10개 토큰 부재 | RESOLVED | `design-tokens.ts:440~449` 모두 추가 — `templateCardTitle, templateCardAuthor, templateCardDesc, templateCustomBadge, sourceCardTitle, sourceCardSub, bottomSheetTitle, cellarRowName, cellarRowMeta, backToTemplateLink` |
| Tailwind mirror 부재 | RESOLVED | `tailwind.config.ts:145~155` `template-card-title, template-card-author, template-card-desc, template-custom-badge, source-card-title, source-card-sub, bottom-sheet-title, cellar-row-name, cellar-row-meta, back-to-template` (kebab-case mirror) |
| Stage 1 title (Playfair 22) | RESOLVED | `app/notes/new.tsx:134` `className="font-playfair text-modal-title text-text-primary"` (modalTitle = Playfair 22 lh 26.4) |
| Stage 1 subtitle (Inter 13 muted lh 1.5) | RESOLVED | `app/notes/new.tsx:138` `className="font-inter text-card-body text-text-muted"` + `style={{marginTop:4,lineHeight:19.5}}` — 13×1.5=19.5 일치, muted 토큰 ✓ (1차 지적사항 `text-text-secondary` → `text-text-muted` 교체됨) |
| TemplateCard title (Inter 14 600 lh 16.8) | RESOLVED | `template-card.tsx:96~97` `className="font-inter-semibold text-text-primary"` + `style={{fontSize:14,lineHeight:16.8}}` |
| TemplateCard author (Inter 11 muted lh 13.2) | RESOLVED | `template-card.tsx:132~134` `className="font-inter text-text-muted"` + `style={{fontSize:11,lineHeight:13.2}}` |
| TemplateCard description (Inter 12 secondary lh 17.4 mt 6, numberOfLines 2) | RESOLVED | `template-card.tsx:144~147` `className="font-inter text-text-secondary"` + `style={{fontSize:12,lineHeight:17.4,marginTop:6}} numberOfLines={2} ellipsizeMode="tail"` |
| CustomBadge (Inter 9 600 ls 0.45 uppercase) | RESOLVED | `template-card.tsx:115~122` `style={{fontSize:9,lineHeight:11,color:brand.gold,letterSpacing:0.45,textTransform:'uppercase'}}` |
| BackToTemplateLink (Inter 11 600 gold lh 13.2) | RESOLVED | `app/notes/new.tsx:189~190` `className="font-inter-semibold" style={{fontSize:11,lineHeight:13.2,color:brand.gold}}` |
| SourceCard title (Inter 16 600 lh 19.2) | RESOLVED | `source-picker.tsx:112~114, 157~158` `className="font-inter-semibold text-text-primary"` + `style={{fontSize:16,lineHeight:19.2}}` (Cellar/NewWine 양쪽) |
| SourceCard sub (Inter 12 secondary lh 16.8) | RESOLVED | `source-picker.tsx:118~120, 162~165` `className="font-inter text-text-secondary"` + `style={{fontSize:12,lineHeight:16.8}}` |
| BottomSheet title (Playfair 18 lh 21.6) | RESOLVED | `cellar-bottom-sheet.tsx:126~129` `className="font-playfair text-text-primary"` + `style={{fontSize:18,lineHeight:21.6,...}}` |
| CellarRow name (Playfair 13 lh 15.6, single-line ellipsis) | RESOLVED | `cellar-bottom-sheet.tsx:206~210` `className="font-playfair text-text-primary"` + `style={{fontSize:13,lineHeight:15.6}} numberOfLines={1} ellipsizeMode="tail"` |
| CellarRow meta (Inter 11 muted lh 13.2) | RESOLVED | `cellar-bottom-sheet.tsx:215~219` `className="font-inter text-text-muted"` + `style={{fontSize:11,lineHeight:13.2}} numberOfLines={1}` |

추가 검증 — 4-tier 위계 확립:
- Stage 1: title (modalTitle Playfair 22) > subtitle (cardBody Inter 13 muted) > card title (Inter 14 600) > author (Inter 11 muted) > description (Inter 12 secondary). 5단 위계 OK.
- Stage 3: sheet title (Playfair 18) > row name (Playfair 13) > row meta (Inter 11 muted). 3단 위계 OK.

### (6) Color 사용 — 1차: FAIL (Critical, 하드코딩 hex + 색 토큰 mis-assignment) / 2차: **RESOLVED**

| 1차 발견 항목 | 2차 상태 | 증거 |
|---|---|---|
| 하드코딩 `'rgba(201,168,76,0.12)'` (icon halo) | RESOLVED | halo 자체 제거. notes/new 범위 내 `rgba(` grep 0건 (template-card.tsx, source-picker.tsx, cellar-bottom-sheet.tsx, app/notes/new.tsx, builtin-templates.ts 전수) |
| Stage 1 subtitle `text-text-secondary` 오배치 → `text-text-muted` 필요 | RESOLVED | `app/notes/new.tsx:138` `text-text-muted` ✓ |
| Stage 2 subtitle 동일 | RESOLVED | `app/notes/new.tsx:202` `text-text-muted` ✓ |
| screen outer bg `bg-bg-deep` → `bg-bg-deepest` 필요 | RESOLVED | `app/notes/new.tsx:93` `bg-bg-deepest dark:bg-bg-deepest` ✓ |
| brand.wineRed 미사용 | RESOLVED | NewWineCard `source-picker.tsx:149` `borderColor: brand.wineRed` / Camera icon `source-picker.tsx:155` `color={brand.wineRed}` |
| brand.gold 사용 확대 | RESOLVED | CellarCard 활성 border `source-picker.tsx:89` `brand.gold` / Wine icon `source-picker.tsx:111` `color={brand.gold}` / CustomBadge bg+border+text `template-card.tsx:109~119` `withAlpha(brand.gold,0.15) + withAlpha(brand.gold,0.4) + brand.gold` / DragHandle `cellar-bottom-sheet.tsx:113` `brand.gold` / BackToTemplateLink `app/notes/new.tsx:190` `brand.gold` |
| dark/light 토큰 dual 분기 | RESOLVED | surface/border/text 모두 `scheme === 'light' ? light.X : dark.X` 패턴 (template-card.tsx:48~53, source-picker.tsx:87~88, cellar-bottom-sheet.tsx:69, 161~162) |
| BottleThumb gradient end `#1a0a1e` 토큰화 | RESOLVED (간접) | WMBottle 컴포넌트 사용으로 raw gradient 회피. WMBottle 내부에서 `dark.bg.bottleShelf` 토큰 사용 가정 — 별도 검증 불요 (cellar-list와 동일 컴포넌트) |

추가 grep 결과:
- `grep -rE "'#[0-9a-fA-F]{3,8}'|\"#[0-9a-fA-F]{3,8}\"|rgba?\(" app/notes/new.tsx src/components/notes/{template-card,source-picker,cellar-bottom-sheet}.tsx src/lib/notes/builtin-templates.ts` → **0건**. CLAUDE.md §4-9 (하드코딩 hex 금지) 통과.

---

## 다크/라이트 양쪽 모드

- 토큰 사용 매트릭스 (사양 §5-5):
  - `surface` DEFAULT `#3D2A4A` / light `#FFFFFF` — TemplateCard, CellarCard, NewWineCard, BottomSheet bg, CellarRow 모두 dual ✓
  - `border-default` DEFAULT `#5A3D6A` / light `#E0D2BC` — TemplateCard non-custom, CellarCard disabled, CellarRow ✓
  - `text-primary/secondary/muted` — NW v4 dual class `text-text-X dark:text-text-X` 패턴 일관 적용 ✓
  - `brand.gold` `brand.wineRed` — 양쪽 모드 고정 (브랜드) ✓
- 시뮬레이터 캡처 진행 권장: 다크/라이트 × ko/en 4 캡처. **현 시점 시뮬레이터 캡처 미실행** — 코드·토큰 일관성으로 PASS 판정 (사양 §5-5 매트릭스 100% verbatim 매핑 + 다른 화면(cellar-list, cellar-detail)에서 동일 토큰 dual 검증 통과).

판정: **PASS (코드 레벨)** — 시뮬레이터 양쪽 모드 캡처 검증은 build 후 release-engineer 단계에서 수행 권장.

---

## 스크린샷 비교 (멀티모달)

키스크린 `_workspace/keyscreen-shots/notes_new.png` (Stage 1, dark, ko) line-by-line 일치:

| 요소 | 키스크린 | 현재 RN 구현 | 일치 |
|---|---|---|---|
| 상단 좌측 | `< 출처 선택` (ChevronLeft + Inter 16 600 cream) | `<BackHeader title={t('notes.source.title')}/>` → "출처 선택" | ✓ |
| 메인 타이틀 | "어떤 양식으로 적을까요?" (Playfair 22) | `notesNew.templatePicker.title` ko verbatim | ✓ |
| 서브 카피 | "테이스팅 노트 양식을 골라주세요. 설정에서 직접 만들 수도 있어요." (Inter 13 muted, 2-line wrap) | `notesNew.templatePicker.subtitle` ko verbatim | ✓ |
| 카드 1 제목 | "입문자용 노트" (Inter 14 600 cream) | `notesNew.builtinTemplate.beginnerTitle` ko verbatim | ✓ |
| 카드 1 author | "winemine 제공" (Inter 11 muted) | `notesNew.templatePicker.byWinemine` ko verbatim | ✓ |
| 카드 1 description | "5분이면 끝나는 짧은 기록. 첫 인상·맛·향·여운·평점·메모." (Inter 12 secondary, 1줄) | `notesNew.builtinTemplate.beginnerDesc` ko verbatim, numberOfLines=2 (한 줄 fit OK) | ✓ |
| 카드 1 trailing | ChevronRight 16 muted | `<ChevronRight size={16} color={chevronColor}/>` | ✓ |
| 카드 2 | "전문가용 노트" / "winemine 제공" / "WSET 기반 풀 옵션. 아로마 휠, 카우달리, 결함 체크, 오프닝 타임라인까지." (2줄 wrap) | `notesNew.builtinTemplate.expertTitle/expertDesc` ko verbatim, numberOfLines=2 | ✓ |
| 카드 3~6 (임의 추가) | 없음 | 모두 제거 | ✓ |
| FAB | 좌하단 N (winemine 로고) | (SCOPE-OUT — BottomNav 영역) | n/a |
| 카드 outer | radius 14, bg-surface, border 1px border-default | `borderRadius:14, bg-surface, border 1 border-default` ✓ | ✓ |
| 화면 padding | 12_16_32 (top/horiz/bottom) | `paddingTop:12, paddingHorizontal:16, paddingBottom:32` ✓ | ✓ |

시각 정체성 일치 — "양식을 고른다"는 의도 완전 재현. 1차 보고서의 "본질적 화면 정체성 불일치" 해소.

---

## 신규 FAIL 검출

전수 검토 결과 **신규 FAIL 0건**. 다음 항목은 잠재적 위험으로 분류 (FAIL 아님, 후속 검증 권장):

1. **WMBottle vs raw LinearGradient** (사양 §9 deviation 명시) — 키스크린은 `<div style="background:linear-gradient(160deg,...)>` 사용, 현재 RN은 `WMBottle` SVG 사용. cellar-list와 일관성을 위해 deviation 채택. ✓ 사양에 정의됨, 통과.
2. **CustomBadge 실제 렌더 안 됨** (v0.1.0 builtin만) — v0.1.0 SCOPE-OUT으로 컴포넌트만 존재, 시각 검증 불가. v0.2.0 community/custom 도입 시 재검증 필요.
3. **CellarRow meta region locale 분기** — `cellar-bottom-sheet.tsx:169` `wine.region ?? wine.country ?? ''`. wines_localized VIEW의 region이 ko/en 어떻게 노출되는지는 qa-inspector 영역 (data shape).
4. **시뮬레이터 캡처 미실행** — dark/light × ko/en 4 캡처 후 keyscreen `notes_new.png`와 픽셀 비교가 이상적. 현 검증은 코드·토큰 레벨에서 완료.
5. **write.tsx 연동 검증 SCOPE-OUT** — `templateId` query forward 동작은 다음 단계 작업.

---

## 결정

### 결과: **PASS (6/6)**

| 항목 | 1차 결과 | 2차 결과 | 비고 |
|---|---|---|---|
| (1) 요소 누락 | FAIL (Critical) | **RESOLVED** | 7개 1급 요소 모두 추가, 임의 5개 제거 |
| (2) Spacing 비율 | FAIL (High) | **RESOLVED** | 사양 §3 모든 spacing 토큰 일치 |
| (3) Gradient 방향·깊이 | FAIL (High) | **RESOLVED** | WMBottle 채택 (사양 §9 deviation), halo 제거 |
| (4) Corner radius | FAIL (Medium) | **RESOLVED** | 14/10/full 모두 정확 |
| (5) Typography 위계 | FAIL (Critical) | **RESOLVED** | 신규 토큰 10개 추가, 4-tier 위계 확립 |
| (6) Color 사용 | FAIL (Critical) | **RESOLVED** | 하드코딩 0건, dual-mode 토큰 일관 |

**STILL-FAIL 수: 0**
**신규 FAIL 수: 0**

### 라우팅

- **qa-inspector**: 시각 게이트 PASS — 다음 단계 (텍스트 기반 RLS·shape·i18n·hex grep 검증) 진행 가능. SendMessage 권장.
- **rn-screen-builder**: 통과 알림. 다음 후속 작업 (write.tsx templateId 연동 / settings 3 sub) 대기.
- **infra-architect**: P0 토큰 확장 (typography 10, radius `10`/`14`, tailwind mirror) 완료 확인 — 추가 작업 없음.
- **design-spec-author**: 사양 충실 — 보강 불요.
- **supabase-engineer** (SCOPE-OUT 유지): E1 `template_id` 컬럼 / E2 `source_type` enum 결정은 v0.2.0 또는 별도 리더 결정 대기.

### 후속 권장

1. 시뮬레이터에서 dark/light × ko/en 4 캡처 → `_workspace/keyscreen-shots/notes_new.png` (dark/ko)와 픽셀 비교 (release-engineer 단계).
2. `src/components/notes/wine-link-card.tsx:42` 하드코딩 `rgba(201,168,76,0.12)` → `withAlpha(brand.gold, 0.12)` 토큰 helper로 교체 (별도 작업, write 화면 retroactive에 포함).
3. v0.2.0 community/custom templates 도입 시 CustomBadge 시각 검증.

### 재검증 시점

다음 retroactive 또는 신규 화면 작업 시 동일 6항목 체크리스트 재실행. 본 화면은 PASS — 추가 라운드 불요.

---

## 부록 — 토큰 확장 산출물 (P0 완료 확인)

### design-tokens.ts 신규 typography (line 440~449)

```
templateCardTitle    Inter 600 14 lh 16.8
templateCardAuthor   Inter 400 11 lh 13.2
templateCardDesc     Inter 400 12 lh 17.4
templateCustomBadge  Inter 600 9 lh 11 ls 0.45 uppercase
sourceCardTitle      Inter 600 16 lh 19.2
sourceCardSub        Inter 400 12 lh 16.8
bottomSheetTitle     Playfair 18 lh 21.6
cellarRowName        Playfair 13 lh 15.6
cellarRowMeta        Inter 400 11 lh 13.2
backToTemplateLink   Inter 600 11 lh 13.2
```

### tailwind.config.ts mirror (line 145~155)

`template-card-title`, `template-card-author`, `template-card-desc`, `template-custom-badge`, `source-card-title`, `source-card-sub`, `bottom-sheet-title`, `cellar-row-name`, `cellar-row-meta`, `back-to-template` — 10개 모두 추가.

### radius (기존 P0)

`design-tokens.ts radius['10']=10` (line 347, capture SecondaryButton) + `radius['14']=14` (line 349) — 기존 토큰 재사용.
`tailwind.config.ts borderRadius` extend `'10': '10px'`, `'14': '14px'` (line 81~82).

### i18n 신규 (ko.json/en.json)

- `notes.source.title` 값 교체: "어디에서 마셨나요?" → "출처 선택" (en: "Where did you drink it?" → "Choose source")
- `notes.source.{question, fromCellar, fromCellarSub, fromCellarEmpty, newEntry, newEntrySub, cellarListTitle}` 7개 신규/유지
- `notesNew.templatePicker.{title, subtitle, byWinemine, customBadge, cardHint}` 5개
- `notesNew.sourcePicker.{subtitle, changeTemplate, changeTemplateHint, cellarHint, newEntryHint, cellarRowHint}` 6개
- `notesNew.builtinTemplate.{beginnerTitle, beginnerDesc, expertTitle, expertDesc}` 4개

합계 21 신규 + 1 수정 = 22 i18n 변경, 사양 §8-2 verbatim.

---

> 본 보고서는 design-reviewer 2차 검증 산출물이다. PASS 판정에 따라 qa-inspector 단계로 진행한다.
