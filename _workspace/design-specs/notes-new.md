# notes-new (`/notes/new`) Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen `messages/{ko,en}.json` `notes.source.*` > design-system docs > 우리 design-tokens.
> 작성일: 2026-05-20 (Day 6 retroactive hardening) · author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/app/notes/new/page.tsx` (305 LOC — `NewNoteSourcePage` + 인라인 `TemplateCard`)
- 자식 컴포넌트 (재귀 read):
  - `../winemine-keyscreen/src/components/nav/back-header.tsx` (82 LOC — 56px header, ChevronLeft 24 + title)
  - `../winemine-keyscreen/src/components/shared/bottom-sheet.tsx` (102 LOC — drag handle 36×4 gold, translateY 100→0 350ms ease-out, backdrop 200ms 0.6, maxHeight 70% default)
  - `../winemine-keyscreen/src/components/shared/locale-text.tsx` (ko/en 분기)
  - `../winemine-keyscreen/src/components/tasting-note/source-picker.tsx` (123 LOC — 2-card grid: 셀러 / 새 와인)
- 도메인 lib:
  - `../winemine-keyscreen/src/lib/mock/tasting-templates.ts` (BUILTIN_BEGINNER + BUILTIN_EXPERT + COMMUNITY_TEMPLATES)
  - `../winemine-keyscreen/src/lib/mock/cellar.ts` (`getCellarByUser`)
  - `../winemine-keyscreen/src/lib/mock/wines.ts` (`getWine`)
  - `../winemine-keyscreen/src/context/tasting-template-context.tsx` (`useTastingTemplates` — builtin 2 + saved + custom)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- 산문 명세: `../winemine-keyscreen/screen-specs/notes-new-source.md` (150 LOC — 키스크린 본인 정리본)
- i18n (keyscreen): `../winemine-keyscreen/messages/{ko,en}.json` 네임스페이스 `notes.source.{title|question|fromCellar|fromCellarSub|fromCellarEmpty|newEntry|newEntrySub|pickFromCellar|cellarListTitle}`
- 스크린샷 reference: `_workspace/keyscreen-shots/notes_new.png` (Stage 1: Template Picker — dark, ko — "< 출처 선택" 헤더 / Playfair 22 "어떤 양식으로 적을까요?" / Inter 13 muted 서브 / 입문자용 노트 + winemine 제공 + "5분이면 끝나는 짧은 기록..." + ChevronRight / 전문가용 노트 + winemine 제공 + "WSET 기반 풀 옵션..." + ChevronRight / FAB N 좌하단)
- 현재 RN 구현 (retroactive 대상): `app/notes/new.tsx` (140 LOC — `BottomSheet` 단일 6-option picker; `cellar/restaurant/shop/gift/tasting_event/other`) — **keyscreen 2-stage 흐름과 본질적 차이**

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/notes/new.tsx` (그대로 유지 — `(tabs)` 그룹 외부) |
| 진입 경로 | `/notes/new` (optional query: `?wine_lwin=<lwin>&photo_url=<url>` — 캡처 → 작성 경로) |
| 진입 트리거 | 홈 QuickActions "노트 작성" / `/capture` "메뉴얼 입력"·라벨 인식 결과 / 셀러 인라인 / 와인 상세 WriteNoteCta / 노트 상세 빈 상태 |
| 헤더 | `<BackHeader title={t('notes.source.title')} />` — 56px, ChevronLeft 24 + Inter 600 16 cream |
| BottomNav | **숨김** — keyscreen `HIDDEN_PREFIXES`에 `/notes/new` 포함. expo-router 구조상 `(tabs)` 외부라 자동 숨김. |
| 가드 | 없음 — anonymous user OK. cellar 0 시 셀러 카드 disabled. availableTemplates는 builtin 2종 항상 포함 (empty 불가) |
| 다크/라이트 | 둘 다 지원 |
| 화면 분기 | `selectedTemplateId` (useState) 유무: null → Stage 1 (Template) / not-null → Stage 2 (Source) · 별도로 `pickOpen` (useState) → Stage 3 (Cellar BottomSheet) |

> **현재 RN 차이**: 우리 RN은 Stage 1+2 통합한 `BottomSheet` 단일 picker — 6 source options (cellar/restaurant/shop/gift/tasting_event/other). **keyscreen은 Template picker → Source picker → Cellar Sheet 3-stage**. **§8 deviation + §9 escalation** — 데이터 모델(template 개념) 도입 여부 결정 필요.

---

## 2. Layout Tree (verbatim 변환)

keyscreen `page.tsx` line 52~209 그대로 RN 트리화.

```
SafeAreaView (edges=['top'], flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── BackHeader                                              ← 고정, scroll 외부 (cellar-detail 사양 §3-1 참조)
│     ├── BackButton (32×32, ChevronLeft 24 stroke 1.75 cream)
│     └── Title (Inter 600 16 cream)
│           label: t('notes.source.title') ("출처 선택" / "Choose source")
│
├── ScrollView (flex-1, contentContainerStyle: paddingTop 12 paddingHorizontal 16 paddingBottom 32)
│     │
│     ├── [Stage 1: selectedTemplateId == null]               ← keyscreen line 56~93
│     │     │
│     │     ├── Header (mb 14)
│     │     │     ├── Title (Playfair 22 600 cream, m=0)
│     │     │     │     label: t('notesNew.templatePicker.title') 신규 키
│     │     │     │       ko: "어떤 양식으로 적을까요?"
│     │     │     │       en: "Choose a note style"
│     │     │     └── Subtitle (Inter 13 muted, lineHeight 1.5, mt=4)
│     │     │           label: t('notesNew.templatePicker.subtitle') 신규 키
│     │     │             ko: "테이스팅 노트 양식을 골라주세요. 설정에서 직접 만들 수도 있어요."
│     │     │             en: "Pick a tasting note template. You can edit or create your own in Settings."
│     │     │
│     │     └── TemplateList (flex column, gap 10)
│     │           └── TemplateCard × N (availableTemplates.length)
│     │                 ├── builtin-beginner  (kind='builtinBeginner')
│     │                 ├── builtin-expert    (kind='builtinExpert')
│     │                 ├── [saved community] (kind='custom' + isPublic, savesCount 등)
│     │                 └── [my custom]       (kind='custom' + authorUserId == me)
│     │
│     └── [Stage 2: selectedTemplateId != null]              ← keyscreen line 94~113
│           │
│           ├── BackToTemplateLink (mb 12, Inter 11 600 gold, inline)
│           │     label: "← " + t('notesNew.sourcePicker.changeTemplate') 신규 키
│           │       ko: "양식 다시 선택"
│           │       en: "Change template"
│           │     onPress → setSelectedTemplateId(null)
│           │
│           └── SourcePicker                                  ← 인라인 (BottomSheet 아님)
│                 ├── Header (mb 4)
│                 │     ├── Title (Playfair 22 600 cream)
│                 │     │     label: t('notes.source.question') ("어떤 와인을 기록할까요?" / "Which wine are you recording?")
│                 │     └── Subtitle (Inter 13 muted, mt=4)
│                 │           label: t('notesNew.sourcePicker.subtitle') 신규 키
│                 │             ko: "셀러에 있는 와인을 따시거나, 새로운 와인을 만나셨나요?"
│                 │             en: "Opening a wine from your cellar, or trying something new?"
│                 │
│                 └── SourceCardGrid (display grid, gap 10)
│                       ├── CellarCard (Pressable)
│                       │     - bg-surface, border 1px (gold if !disabled, border-default if disabled)
│                       │     - radius 14, padding 18, display grid gap 6
│                       │     - opacity 1 (or 0.5 if cellarCount==0)
│                       │     - accessibilityState disabled
│                       │     ├── Wine icon (lucide-react-native, size 28 strokeWidth 1.5 gold)
│                       │     ├── Title (Inter 16 600 cream)
│                       │     │     label: t('notes.source.fromCellar') ("내 셀러에서" / "From my cellar")
│                       │     └── Sub (Inter 12 text-secondary)
│                       │           cellarCount==0:
│                       │             label: t('notes.source.fromCellarEmpty') ("셀러가 비어있어요" / "Cellar is empty")
│                       │           else:
│                       │             label: t('notes.source.fromCellarSub', {count}) ("{count}병 보관 중" / "{count} stored")
│                       │     onPress (cellarCount>0) → setPickOpen(true)
│                       │
│                       └── NewWineCard (Pressable)
│                             - bg-surface, border 1px wine-red
│                             - radius 14, padding 18, display grid gap 6
│                             ├── Camera icon (lucide-react-native, size 28 strokeWidth 1.5 wine-red)
│                             ├── Title (Inter 16 600 cream)
│                             │     label: t('notes.source.newEntry') ("새 와인" / "A new wine")
│                             └── Sub (Inter 12 text-secondary)
│                                   label: t('notes.source.newEntrySub') ("라벨 사진을 찍거나 직접 입력해요" / "Snap the label or enter manually")
│                             onPress → router.push('/notes/new/write?from=newEntry&templateId={tid}')
│
└── [Stage 3 overlay: pickOpen == true]                      ← keyscreen line 116~206
      BottomSheet (snapPoints ['70%'] or auto, backdrop opacity 0.6, enablePanDownToClose)
      ├── DragHandle (36×4, radius 2, gold, alignSelf center, mb 4)        ← @gorhom/bottom-sheet handleIndicator로 처리
      └── Content (padding 0_4 bottom 16, flex column gap 8)
            ├── Title (Playfair 18 cream, margin 4_8 bottom 12)
            │     label: t('notes.source.cellarListTitle') ("셀러 와인" / "Cellar wines")
            └── CellarList (ScrollView vertical, maxHeight 50vh의 RN 동등치 = screenHeight × 0.5)
                  └── CellarRow × cellar.length (gap 6)
                        Pressable (flex row items-center gap 10, padding 10, w-full, bg-surface,
                                   border 1px border-default, radius 10, boxSizing border-box)
                        ├── BottleThumb (32×44 aria-hidden, radius 4, flexShrink 0)
                        │     gradient: LinearGradient
                        │       160deg, [wine.bottleColor, '#1a0a1e'] locations [0, 0.7]
                        ├── TextStack (flex 1, minWidth 0)
                        │     ├── Name (Playfair 13 cream, single-line ellipsis)
                        │     │     value: <LocaleText> wine.name (또는 wines_localized name_ko ?? display_name)
                        │     └── Meta (Inter 11 muted)
                        │           value: `${vintage} · <region>` (vintage null이면 region만)
                        │           — region은 ko/en 분기, country fallback
                        └── (no trailing icon)
                        onPress → router.push('/notes/new/write?from=cellar&itemId={it.id}&templateId={tid}'+wineLwin if available)
```

> **TemplateCard 구조** (`page.tsx` line 211~305 verbatim):
> ```
> Pressable (flex row gap 12, padding 14_16, bg-surface,
>            border 1px (custom: rgba(201,168,76,0.4) / others: border-default),
>            radius 14, items-center)
> ├── TextStack (flex 1, minWidth 0)
> │     ├── TitleRow (flex row items-center gap 6, mb 4)
> │     │     ├── Title (Inter 14 600 cream) — <LocaleText value={template.title} />
> │     │     └── [if kind=='custom'] CustomBadge
> │     │           - padding 2_7, radius 999
> │     │           - bg rgba(201,168,76,0.15), border rgba(201,168,76,0.4)
> │     │           - Inter 9 600 gold, letter-spacing 0.05em, uppercase
> │     │           - label: t('notesNew.templatePicker.customBadge') 신규 키
> │     │               ko: "커스텀" / en: "Custom"
> │     ├── Author (Inter 11 muted)
> │     │     value: kind=='builtin*' → t('notesNew.templatePicker.byWinemine') 신규 키
> │     │              ko: "winemine 제공" / en: "by winemine"
> │     │            kind=='custom' && authorName → `${'by'} ${authorName.{locale}}`
> │     │              ko: "by 함소믈리에" / en: "by Som. Ham"
> │     │            else → '' (render null)
> │     └── [if template.description] Description (Inter 12 text-secondary, mt 6, lineHeight 1.45)
> │           value: <LocaleText value={template.description} />
> │           — line-clamp 2 (WebkitLineClamp:2 / RN equivalent: numberOfLines={2})
> └── ChevronRight icon (lucide-react-native, size 16, color text-muted)
> ```

**WMBottle vs raw LinearGradient (Stage 3 CellarRow)**: keyscreen은 32×44 raw `<div>` + linear-gradient 사용. 우리 RN은 **WMBottle (width=32, height=44)** 사용 (cellar-list의 CellarCard와 동일 패턴 — wm-bottle.tsx 이미 작은 size 지원). **§8 deviation** (keyscreen은 단순 div, 우리는 SVG 일관성 유지).

---

## 3. NativeWind v4 className 매핑표

> NW v4 기본 토큰 + `tailwind.config.ts` extended 토큰 (design-tokens.ts mirror) 우선. raw hex 금지.
> 사용 가능 토큰: `bg-{deepest|deep|map|surface|sunken|bottle-shelf}` · `text-{primary|secondary|muted|disabled}` · `border-{default|active}` · `text-text-primary` etc · `bg-wine-red bg-gold` · font scale (`text-modal-title text-card-body text-card-meta text-card-title text-back-title text-button-md` 등 design-tokens.ts §typography)

| 키스크린 표기 | RN+NW v4 | 비고 |
|---|---|---|
| 화면 outer container (inferred from layout) | `<SafeAreaView edges=['top'] className="flex-1 bg-bg-deepest dark:bg-bg-deepest">` | keyscreen은 globals.css `:root` 배경 사용 |
| `<header style={{height:56, padding:'0 16px', ...}}>` (BackHeader) | 기존 RN `<BackHeader title={t('notes.source.title')} />` 컴포넌트 재사용 | cellar-detail에서 표준 정착 — 없으면 신규 컴포넌트 (§8) |
| `<main className="wm-scroll-area" style={{padding:'12px 16px 32px'}}>` | `<ScrollView className="flex-1" contentContainerStyle={{paddingTop:12,paddingHorizontal:16,paddingBottom:32}}>` | wm-scroll-area는 globals.css scrollbar styling — RN은 default |
| Stage 1 header `style={{marginBottom:14}}` | `<View className="mb-3.5">` | mb-3.5 = 14 (spacing[3.5]) |
| Stage 1 h2 `font-playfair size 22 weight 600 cream m=0` | `<Text className="font-playfair text-modal-title text-text-primary">` | `typography.modalTitle` = Playfair 22 lh 26.4. `m=0`은 RN default |
| Stage 1 p `font-inter size 13 muted mt=4 lineHeight 1.5` | `<Text className="font-inter text-card-body text-text-muted mt-1">` style={{lineHeight:19.5}} | `typography.cardBody` = Inter 13 lh 19.5 |
| TemplateList `flex column gap 10` | `<View className="gap-2.5">` | spacing[2.5] = 10 |
| TemplateCard outer `padding 14_16, bg-surface, border 1px (custom or default), radius 14` | `className="flex-row items-center gap-3 px-4 py-3.5 bg-surface dark:bg-surface rounded-14 border"` style={{borderColor: isCustom ? withAlpha(brand.gold, 0.4) : (scheme==='dark' ? dark.border.default : light.border.default)}} | radius 14 (design-tokens.radius[14]); py-3.5 = 14; gap-3 = 12 |
| TemplateCard TextStack `flex 1, minWidth 0` | `<View className="flex-1" style={{minWidth:0}}>` | minWidth:0은 React Native에서도 OK (Text ellipsis 위해) |
| TemplateCard TitleRow `flex row items-center gap 6 mb 4` | `<View className="flex-row items-center gap-1.5 mb-1">` | gap-1.5 = 6; mb-1 = 4 |
| TemplateCard title `Inter 14 600 cream` | `<Text className="font-inter-semibold text-card-title text-text-primary">` | `typography.cardTitle` = Playfair 16/Inter 14 — **사양: Inter 14 600** (keyscreen line 257~263). 신규 typography token `templateCardTitle: Inter 14 600 lh 16.8` 필요 (§9 P0) |
| CustomBadge `padding 2_7, radius 999, bg gold/0.15, border gold/0.4, Inter 9 600 gold uppercase letter-spacing 0.05em` | `<View className="rounded-full" style={{paddingHorizontal:7,paddingVertical:2,backgroundColor:withAlpha(brand.gold,0.15),borderWidth:1,borderColor:withAlpha(brand.gold,0.4)}}><Text className="font-inter-semibold" style={{fontSize:9,color:brand.gold,letterSpacing:0.45,textTransform:'uppercase'}}>{label}</Text></View> | NW v4 letter-spacing 0.05em ≈ 9×0.05=0.45px. 신규 typography `templateCustomBadge: Inter 9 600 ls 0.45 uppercase` 필요 (§9 P0) |
| TemplateCard author `Inter 11 muted` | `<Text className="font-inter text-text-muted" style={{fontSize:11,lineHeight:13.2}}>` | 신규 typography token `templateCardAuthor: Inter 11 lh 13.2` (§9 P0) |
| TemplateCard description `Inter 12 text-secondary mt 6 lineHeight 1.45 line-clamp 2` | `<Text className="font-inter text-text-secondary" style={{fontSize:12,lineHeight:17.4,marginTop:6}} numberOfLines={2} ellipsizeMode="tail">` | line-clamp 2 → numberOfLines=2. 신규 typography `templateCardDesc: Inter 12 lh 17.4` (§9 P0) |
| ChevronRight `size 16 color text-muted` | `<ChevronRight size={16} color={scheme==='dark' ? dark.text.muted : light.text.muted} />` | lucide-react-native |
| Stage 2 BackToTemplateLink `Inter 11 600 gold mb 12` | `<Pressable onPress={...}><Text className="font-inter-semibold mb-3" style={{fontSize:11,color:brand.gold}}>{'← ' + t(...)}</Text></Pressable>` | mb-3 = 12 |
| SourcePicker header `mb 4` | `<View className="mb-1">` | mb-1 = 4 |
| SourcePicker grid `display grid gap 10` | `<View className="gap-2.5">` | RN은 grid 미지원 — flex column으로 변환 |
| CellarCard `bg-surface, border 1px gold/border-default, radius 14, padding 18, gap 6, opacity 1/0.5` | `<Pressable disabled={cellarCount===0} className="rounded-14 p-[18px] gap-1.5" style={({pressed})=>({backgroundColor: scheme==='dark'?dark.bg.surface:light.bg.surface, borderWidth:1, borderColor: cellarCount===0 ? (scheme==='dark'?dark.border.default:light.border.default) : brand.gold, opacity: cellarCount===0 ? 0.5 : 1, transform:[{scale: pressed ? 0.98 : 1}]})}>` | radius 14; padding 18은 spacing 토큰 없어 raw 18 또는 `p-[18px]` |
| Wine icon `28 strokeWidth 1.5 gold` | `<Wine size={28} strokeWidth={1.5} color={brand.gold} />` | lucide-react-native |
| CellarCard title `Inter 16 600 cream` | `<Text className="font-inter-semibold text-text-primary" style={{fontSize:16,lineHeight:19.2}}>` | 신규 typography `sourceCardTitle: Inter 16 600 lh 19.2` (§9 P0) — 또는 `typography.cardBody` size 16 변형 |
| CellarCard sub `Inter 12 text-secondary` | `<Text className="font-inter text-text-secondary" style={{fontSize:12,lineHeight:16.8}}>` | 신규 typography `sourceCardSub: Inter 12 lh 16.8` (§9 P0) |
| NewWineCard `border 1px wine-red` | `borderColor: brand.wineRed` (style) | 다크/라이트 무관 (wine-red 고정 brand) |
| Camera icon `28 strokeWidth 1.5 wine-red` | `<Camera size={28} strokeWidth={1.5} color={brand.wineRed} />` | |
| BottomSheet content `padding '0 4px 16px', gap 8` | `<BottomSheetView style={{paddingHorizontal:4, paddingBottom:16, gap:8}}>` | @gorhom/bottom-sheet (이미 RN 사용중) |
| BottomSheet title `Playfair 18 cream margin 4_8_12` | `<Text className="font-playfair text-text-primary" style={{fontSize:18,lineHeight:21.6,marginHorizontal:8,marginTop:4,marginBottom:12}}>` | 신규 typography `bottomSheetTitle: Playfair 18 lh 21.6` (§9 P0) |
| CellarList `<ul>` maxHeight 50vh gap 6 | `<ScrollView style={{maxHeight: Dimensions.get('window').height * 0.5}} contentContainerStyle={{gap:6}}>` | maxHeight `50vh`는 viewport 50% — RN `Dimensions` 사용 |
| CellarRow `flex row gap 10 items-center padding 10 w-full bg-surface border-default radius 10` | `<Pressable className="flex-row items-center gap-2.5 p-2.5 rounded-lg border" style={{backgroundColor: scheme==='dark'?dark.bg.surface:light.bg.surface, borderColor: scheme==='dark'?dark.border.default:light.border.default}}>` | rounded-lg = 10 (design-tokens.radius.lg=8 / **사양: 10** — radius[10] 신규 필요 또는 raw `borderRadius:10`); gap-2.5 = 10 |
| BottleThumb `32×44 radius 4 linear-gradient(160deg, bottleColor 0%, #1a0a1e 70%) flexShrink 0` | `<WMBottle width={32} height={44} bottleColor={wine.bottle_color ?? bottleColorDefault[wine.type_canonical]} />` (preferred) **또는** `<LinearGradient colors={[wine.bottleColor, '#1a0a1e']} locations={[0, 0.7]} start={{x:0,y:0}} end={{x:0.342,y:0.94}} style={{width:32,height:44,borderRadius:4,flexShrink:0}} />` (verbatim) | §8 deviation — WMBottle 사용 권장 (RN에서 SVG 일관성) |
| CellarRow Name `Playfair 13 cream nowrap ellipsis` | `<Text className="font-playfair text-text-primary" style={{fontSize:13,lineHeight:15.6}} numberOfLines={1} ellipsizeMode="tail">` | `typography.cellarCardName` = Playfair 12 lh 15 — **사양: 13** 별도 필요. 신규 `cellarRowName: Playfair 13 lh 15.6` (§9 P0) |
| CellarRow Meta `Inter 11 muted` | `<Text className="font-inter text-text-muted" style={{fontSize:11,lineHeight:13.2}}>` | 기존 `typography.metaRowLabel` = Inter 11 lh 15.4 — 사양: lh 13.2 (1.2 ratio). **lh만 다름** — `cellarRowMeta: Inter 11 lh 13.2` 신규 또는 기존 metaRowLabel 재사용 (lh 다름 허용 시) |

---

## 4. 디자인 토큰 (lib/design-tokens.ts 기준)

### 4-1. 기존 토큰 (재사용)

| 토큰 | 값 | 사용처 |
|---|---|---|
| `dark.bg.deepest` `light.bg.deepest` | `#251837` / `#FAF5EC` | Screen outer |
| `dark.bg.surface` `light.bg.surface` | `#3D2A4A` / `#FFFFFF` | TemplateCard / CellarCard / NewWineCard / BottomSheet / CellarRow |
| `dark.border.default` `light.border.default` | `#5A3D6A` / `#E0D2BC` | TemplateCard (non-custom), CellarCard disabled, CellarRow |
| `dark.text.primary` `light.text.primary` | `#F8F4ED` / `#2A1A14` | 모든 title (Stage 1 h2, TemplateCard title, SourceCard title, BottomSheet title, CellarRow name) |
| `dark.text.secondary` `light.text.secondary` | `#EBE0CB` / `#5A463C` | TemplateCard description, SourceCard sub |
| `dark.text.muted` `light.text.muted` | `#CABDA8` / `#8B7766` | Stage 1 subtitle, SourcePicker subtitle, TemplateCard author, CellarRow meta, ChevronRight |
| `brand.gold` | `#C9A84C` | CellarCard border (active), Wine icon, CustomBadge bg/border/text, DragHandle, BackToTemplateLink |
| `brand.wineRed` | `#8B1A2A` | NewWineCard border, Camera icon |
| `brand.cream` | `#F5F0E8` | (지표만 — text-primary 토큰 사용) |
| `withAlpha(brand.gold, 0.4)` | `rgba(201,168,76,0.4)` | TemplateCard custom border |
| `withAlpha(brand.gold, 0.15)` | `rgba(201,168,76,0.15)` | CustomBadge bg |
| `bottleColorDefault[type_canonical]` | red/white/rose/sparkling/fortified/dessert 매핑 | CellarRow BottleThumb fallback |
| `dark.bg.bottleShelf` | `#1a0a1e` (양쪽 모드 동일) | CellarRow BottleThumb gradient end |
| `radius[14]` | 14 | TemplateCard, CellarCard, NewWineCard |
| `radius.lg` | 8 | (스크린샷: CellarRow는 10이라 별도 신규 필요) |
| `radius.full` | 9999 | CustomBadge |
| `spacing[1]` 4 / `[1.5]` 6 / `[2]` 8 / `[2.5]` 10 / `[3]` 12 / `[3.5]` 14 / `[4]` 16 | | gap·padding·margin |
| `typography.modalTitle` | Playfair 22 lh 26.4 | Stage 1 h2 + Stage 2 SourcePicker h2 |
| `typography.cardBody` | Inter 13 lh 19.5 | Stage 1/2 subtitle |
| `shadows.modal` | 0/25/80 0.8 | BottomSheet (기존 @gorhom 자체 shadow) |

### 4-2. 신규 토큰 (§9 P0 — design-tokens.ts 확장 요청)

| 토큰 | 값 | 사용처 | 사유 |
|---|---|---|---|
| `typography.templateCardTitle` | Inter_600SemiBold 14 lh 16.8 | TemplateCard title | 기존 `cardTitle`은 Playfair 16 — 사양은 Inter 14 600 (line 257~263 verbatim) |
| `typography.templateCardAuthor` | Inter_400Regular 11 lh 13.2 | TemplateCard author 라인 | 기존 `metaRowLabel`(Inter 11 lh 15.4)과 lh 다름 |
| `typography.templateCardDesc` | Inter_400Regular 12 lh 17.4 | TemplateCard description | 1.45 ratio (12×1.45=17.4) |
| `typography.templateCustomBadge` | Inter_600SemiBold 9 lh 11 letterSpacing 0.45 textTransform uppercase | CustomBadge | letter-spacing 0.05em → 9×0.05=0.45px |
| `typography.sourceCardTitle` | Inter_600SemiBold 16 lh 19.2 | SourceCard (CellarCard/NewWineCard) title | 1.2 ratio |
| `typography.sourceCardSub` | Inter_400Regular 12 lh 16.8 | SourceCard sub | 1.4 ratio (사양 미지정 — 기존 optionCardSub 동일) |
| `typography.bottomSheetTitle` | Playfair 18 lh 21.6 | BottomSheet 헤더 ("셀러 와인") | Stage 3 title 전용 — 기존 `wsetMiniDim`(13) 무관 |
| `typography.cellarRowName` | Playfair 13 lh 15.6 | CellarRow wine name | 기존 `cellarCardName`은 Playfair 12 lh 15 — 사양 13 / lh 15.6 |
| `typography.cellarRowMeta` | Inter_400Regular 11 lh 13.2 | CellarRow vintage·region | 기존 `metaRowLabel` Inter 11 lh 15.4와 lh 다름 (1.2 vs 1.4 ratio) |
| `typography.backToTemplateLink` | Inter_600SemiBold 11 lh 13.2 | "← 양식 다시 선택" | 11 600 lh 1.2 |
| `radius['10']` | 10 | CellarRow | 기존 radius.lg=8과 다름 — keyscreen line 161 verbatim 10 |
| (옵션) `notesNew.templateCustomBorder` | `withAlpha(brand.gold, 0.4)` | TemplateCard custom border 명시 토큰 | 이미 helper로 가능 — 신규 불필요 (helper 사용) |

> **합계: 신규 typography 토큰 9개 + radius 토큰 1개 = 10개**. 추가로 기존 토큰 `cellarCardName` 보존 (cellar-list에서 사용 중) — 새 토큰 별도 생성.

> **§10 deviation 후보**: 9 신규 typography 중 일부는 기존 토큰 재사용 가능 (예: `templateCardAuthor` ↔ `metaRowLabel` lh 차이 무시). rn-screen-builder가 빌드 시 판단 — **권장: 신규 추가하여 verbatim 보존**.

---

## 5. 상태 Variants

### 5-1. default — Stage 1 (Template Picker)

`selectedTemplateId == null && pickOpen == false`

위 §2 트리 Stage 1 그대로. availableTemplates = builtin 2종 (BUILTIN_BEGINNER + BUILTIN_EXPERT) + 사용자 저장한 커뮤니티 양식 + 내 커스텀.

**v0.1.0 범위**: builtin 2종만 표시 (community + custom은 v0.2.0 SCOPE-OUT). availableTemplates를 builtin 상수 배열로 하드코딩하고, "설정에서 직접 만들 수도 있어요" subtitle도 builtin 2종 가정으로 표기.

### 5-2. Stage 2 (Source Picker) — `selectedTemplateId != null && pickOpen == false`

BackToTemplateLink + SourcePicker 인라인 2-card. cellar는 cellarCount==0 시 disabled.

### 5-3. Stage 3 (Cellar BottomSheet) — `pickOpen == true`

Stage 2 위에 BottomSheet 오버레이. backdrop 0.6, snapPoints `['70%']` (또는 maxHeight 50% screen — keyscreen 50vh).

### 5-4. loading — 진입 시 (cellar fetch 중)

```
SafeAreaView
├── BackHeader (title only)
└── View flex-1 items-center justify-center
      └── ActivityIndicator color={brand.gold}
```

useCellar() / useTastingTemplates() loading 분기. **v0.1.0**: 둘 다 동기 mock이라 loading state 없음 — 단 Supabase 호출 시 (cellar fetch) 필요.

### 5-5. dark / light

| 토큰 | dark | light | 사용 |
|---|---|---|---|
| `bg-deepest` | `#251837` | `#FAF5EC` | Screen outer |
| `bg-surface` | `#3D2A4A` | `#FFFFFF` | 모든 카드 / BottomSheet / CellarRow |
| `border-default` | `#5A3D6A` | `#E0D2BC` | TemplateCard non-custom, CellarCard disabled, CellarRow |
| `text-primary` (cream) | `#F8F4ED` | `#2A1A14` | 모든 title |
| `text-secondary` | `#EBE0CB` | `#5A463C` | description, sub |
| `text-muted` | `#CABDA8` | `#8B7766` | subtitle, author, meta, ChevronRight, BottomSheet handle (idle) |
| `wine-red` (CTA border) | `#8B1A2A` (fixed) | `#8B1A2A` (fixed) | NewWineCard border, Camera icon — brand 고정 |
| `gold` | `#C9A84C` (fixed) | `#C9A84C` (fixed) | CellarCard active border, Wine icon, DragHandle, BackToTemplateLink, CustomBadge — brand 고정 |
| BottleThumb gradient end (#1a0a1e) | `#1a0a1e` (fixed) | `#1a0a1e` (fixed) | **light 모드에서도 같은 dark 끝점 사용** (와인병의 어두운 분위기 — cellar-list와 동일 패턴) |

### 5-6. cellar 0 (first-time / 신규 익명 유저)

- Stage 2 CellarCard: `opacity 0.5`, border `border-default` (gold 아님), sub label `notes.source.fromCellarEmpty` ("셀러가 비어있어요" / "Cellar is empty"), `accessibilityState={{disabled:true}}`, onPress 무효
- NewWineCard만 유효 — onPress 가능

### 5-7. wine_lwin or photo_url query 진입 (capture → notes/new)

현재 RN params 전파 패턴: `?wine_lwin=<lwin>&photo_url=<url>` 진입 시 onPick 시점에 query에 포함하여 `/notes/new/write`로 forward. **사양**: keyscreen에는 이 진입 경로 없음 (capture는 별도 flow). 우리 RN의 enhancement — **§8 deviation**. 유지.

이 경우 source 결정에는 영향 X (사용자가 여전히 cellar/newEntry 중 선택). Stage 3 CellarRow press 또는 NewWineCard press 시 query merge.

---

## 6. 인터랙션

| 위치 | 액션 | 결과 |
|---|---|---|
| BackHeader < button | press | `router.back()` (또는 fallback `router.replace('/(tabs)')`) + `Haptics.selectionAsync()` |
| TemplateCard | press | `setSelectedTemplateId(tpl.id)` + `Haptics.selectionAsync()` |
| BackToTemplateLink | press | `setSelectedTemplateId(null)` + `Haptics.selectionAsync()` |
| SourceCard (CellarCard, 활성) | press | `setPickOpen(true)` + `Haptics.selectionAsync()` |
| SourceCard (CellarCard, disabled) | press | 무효 (반응 없음) |
| SourceCard (NewWineCard) | press | `router.push(`/notes/new/write?from=newEntry&templateId=${tid}${wineLwinQuery}${photoUrlQuery}`)` + `Haptics.selectionAsync()` |
| BottomSheet backdrop | press | `setPickOpen(false)` (`@gorhom/bottom-sheet` pressBehavior="close") |
| BottomSheet pan down | drag | `setPickOpen(false)` (enablePanDownToClose) |
| BottomSheet 백그라운드 (system back / Esc) | press | `setPickOpen(false)` (`enableContentPanningGesture` + Android back handler) |
| CellarRow | press | `router.push(`/notes/new/write?from=cellar&itemId=${item.id}&templateId=${tid}&wine_lwin=${wine.lwin}${photoUrlQuery}`)` + `Haptics.selectionAsync()` + `setPickOpen(false)` |

**Press 시각 feedback** (모든 Pressable):
- `transform: [{ scale: pressed ? 0.98 : 1 }]` 인라인 style
- accessibilityRole="button", accessibilityState={{disabled:cellarDisabled}}

**Haptics**:
- 모든 카드 press: `Haptics.selectionAsync()` (가벼움)
- BackHeader press: `Haptics.selectionAsync()`

---

## 7. 접근성

| 요소 | accessibilityRole | accessibilityLabel | accessibilityHint | accessibilityState |
|---|---|---|---|---|
| BackHeader button | "button" | t('common.back') ("뒤로" / "Back") | t('common.backHint') ("이전 화면으로" / "Go back") | — |
| TemplateCard | "button" | `${LocaleText(template.title)} ${isCustom ? t('notesNew.templatePicker.customBadge') : t('notesNew.templatePicker.byWinemine')}` | t('notesNew.templatePicker.cardHint') ("양식 선택" / "Pick this template") | — |
| BackToTemplateLink | "button" | t('notesNew.sourcePicker.changeTemplate') | t('notesNew.sourcePicker.changeTemplateHint') ("양식 선택 화면으로 돌아가기" / "Return to template picker") | — |
| CellarCard (enabled) | "button" | `${t('notes.source.fromCellar')} ${t('notes.source.fromCellarSub', {count})}` | t('notesNew.sourcePicker.cellarHint') ("셀러 와인 선택 화면 열기" / "Open cellar wine picker") | — |
| CellarCard (disabled) | "button" | `${t('notes.source.fromCellar')} ${t('notes.source.fromCellarEmpty')}` | — | `{disabled: true}` |
| NewWineCard | "button" | t('notes.source.newEntry') | t('notesNew.sourcePicker.newEntryHint') ("새 와인 노트 작성 시작" / "Start writing a note for a new wine") | — |
| BottomSheet | "dialog" (자동, @gorhom) | t('notes.source.cellarListTitle') | — | `{expanded: pickOpen}` |
| CellarRow | "button" | `${LocaleText(wine.name)} ${wine.vintage ?? ''}` | t('notesNew.sourcePicker.cellarRowHint') ("이 와인으로 노트 작성" / "Write a note for this wine") | — |

**Focus 순서** (TalkBack/VoiceOver):
- Stage 1: BackButton → Title → Subtitle → TemplateCard 1 → TemplateCard 2 → ...
- Stage 2: BackButton → Title → BackToTemplateLink → SourcePicker Title → SourcePicker Subtitle → CellarCard → NewWineCard
- Stage 3 overlay: BottomSheet 자동 focus (handle → Title → CellarRow 1 → ...)

**Touch target**: 모든 Pressable 최소 44×44pt (iOS HIG). TemplateCard padding 14_16 → height ≈ 80~120pt (description 줄수에 따름) — OK. CellarRow padding 10 + 44 (BottleThumb) → height ≈ 64pt — OK. SourceCard padding 18 + 28 icon + text → height ≈ 100pt — OK.

**대비**: 모든 텍스트 WCAG AA 4.5:1 (text-primary on bg-surface 양쪽 모드). gold on surface 양쪽 모드도 검증 — design-reviewer 체크리스트 #5.

---

## 8. i18n 키 (ko/en)

### 8-1. 기존 키 (재사용)

```json
"notes.source.title": { "ko": "어디에서 마셨나요?", "en": "Where did you drink it?" }   // 현재 RN 사용중 — 사양: keyscreen은 "출처 선택" / "Choose source"
```

> **§9 escalation**: 현재 RN i18n과 keyscreen이 다름. 우리 RN `notes.source.title`은 "어디에서 마셨나요?" / "Where did you drink it?" (현재 의미). keyscreen `notes.source.title`은 "출처 선택" / "Choose source" (헤더 타이틀). **권장 변경**: `notes.source.title` 값을 keyscreen verbatim으로 교체 (헤더 타이틀로 사용). 이전 의미는 `notes.source.question`으로 이미 keyscreen에 존재.

### 8-2. 신규 키 (keyscreen verbatim 추가)

```json
"notes.source.question": {
  "ko": "어떤 와인을 기록할까요?",
  "en": "Which wine are you recording?"
}
"notes.source.fromCellar": {
  "ko": "내 셀러에서",
  "en": "From my cellar"
}
"notes.source.fromCellarSub": {
  "ko": "{{count}}병 보관 중",
  "en": "{{count}} stored"
}
"notes.source.fromCellarEmpty": {
  "ko": "셀러가 비어있어요",
  "en": "Cellar is empty"
}
"notes.source.newEntry": {
  "ko": "새 와인",
  "en": "A new wine"
}
"notes.source.newEntrySub": {
  "ko": "라벨 사진을 찍거나 직접 입력해요",
  "en": "Snap the label or enter manually"
}
"notes.source.cellarListTitle": {
  "ko": "셀러 와인",
  "en": "Cellar wines"
}
"notesNew.templatePicker.title": {
  "ko": "어떤 양식으로 적을까요?",
  "en": "Choose a note style"
}
"notesNew.templatePicker.subtitle": {
  "ko": "테이스팅 노트 양식을 골라주세요. 설정에서 직접 만들 수도 있어요.",
  "en": "Pick a tasting note template. You can edit or create your own in Settings."
}
"notesNew.templatePicker.byWinemine": {
  "ko": "winemine 제공",
  "en": "by winemine"
}
"notesNew.templatePicker.customBadge": {
  "ko": "커스텀",
  "en": "Custom"
}
"notesNew.templatePicker.cardHint": {
  "ko": "양식 선택",
  "en": "Pick this template"
}
"notesNew.sourcePicker.subtitle": {
  "ko": "셀러에 있는 와인을 따시거나, 새로운 와인을 만나셨나요?",
  "en": "Opening a wine from your cellar, or trying something new?"
}
"notesNew.sourcePicker.changeTemplate": {
  "ko": "양식 다시 선택",
  "en": "Change template"
}
"notesNew.sourcePicker.changeTemplateHint": {
  "ko": "양식 선택 화면으로 돌아가기",
  "en": "Return to template picker"
}
"notesNew.sourcePicker.cellarHint": {
  "ko": "셀러 와인 선택 화면 열기",
  "en": "Open cellar wine picker"
}
"notesNew.sourcePicker.newEntryHint": {
  "ko": "새 와인 노트 작성 시작",
  "en": "Start writing a note for a new wine"
}
"notesNew.sourcePicker.cellarRowHint": {
  "ko": "이 와인으로 노트 작성",
  "en": "Write a note for this wine"
}
"notesNew.builtinTemplate.beginnerTitle": {
  "ko": "입문자용 노트",
  "en": "Beginner note"
}
"notesNew.builtinTemplate.beginnerDesc": {
  "ko": "5분이면 끝나는 짧은 기록. 첫 인상·맛·향·여운·평점·메모.",
  "en": "A 5-minute log. First impression, palate, aroma, finish, rating, memo."
}
"notesNew.builtinTemplate.expertTitle": {
  "ko": "전문가용 노트",
  "en": "Expert note"
}
"notesNew.builtinTemplate.expertDesc": {
  "ko": "WSET 기반 풀 옵션. 아로마 휠, 카우달리, 결함 체크, 오프닝 타임라인까지.",
  "en": "Full WSET options. Aroma wheel, caudalies, fault check, opening timeline."
}
```

> **합계: 신규 키 21개** (`notes.source.*` 6개 추가 + `notesNew.*` 14개 신규 + `notes.source.title` 1개 수정).

### 8-3. 제거 후보 (사양 변경에 의한)

현재 RN i18n `notes.source.{restaurant|shop|gift|tasting_event|other}` 5개는 사양 변경 시 사용처 없음 — **§9 escalation**으로 제거 여부 결정 (DB `tasting_notes.source_type` enum이 5가지를 사용한다면 schema 변경도 필요).

---

## 9. RN deviation (사유 명시)

| 키스크린 표기 | RN 대체 | 사유 |
|---|---|---|
| Framer Motion BottomSheet (`y: '100%'→0`, 350ms ease-out, backdrop 200ms) | `@gorhom/bottom-sheet` (snapPoints + animationConfigs) | 이미 RN 표준; 현재 새 화면 RN 코드에서 사용중. 시각적으로 동등 |
| CSS `:focus-visible` outline | 별도 focus ring 없음 (Pressable scale 0.98) | RN 표준 |
| `cursor: pointer` / `cursor: not-allowed` | RN은 cursor 개념 없음 | Pressable disabled state로 대체 |
| `all: unset` (button reset) | `<Pressable>` 자체가 reset됨 | RN default |
| `maxHeight: '50vh'` (CellarList) | `Dimensions.get('window').height * 0.5` | RN vh 단위 없음 |
| `WebkitLineClamp: 2 + WebkitBoxOrient: vertical + overflow: hidden` (TemplateCard description) | `<Text numberOfLines={2} ellipsizeMode="tail">` | RN 표준 |
| `whiteSpace: nowrap + overflow: hidden + textOverflow: ellipsis` (CellarRow Name) | `<Text numberOfLines={1} ellipsizeMode="tail">` | RN 표준 |
| `letterSpacing: '0.05em'` (CustomBadge) | `letterSpacing: 0.45` (em → px: fontSize × ratio) | RN px 단위 사용 |
| `boxShadow` (BottomSheet `0 -10px 30px rgba(0,0,0,0.5)`) | `shadows.modal` 토큰 (`@gorhom/bottom-sheet`이 자체 처리) | RN ShadowProps 동등 |
| `linear-gradient(160deg, bottleColor, #1a0a1e)` (CellarRow BottleThumb) | `<WMBottle width=32 height=44>` (preferred) **또는** `<LinearGradient colors={[bottleColor, '#1a0a1e']} locations={[0, 0.7]} start={{x:0,y:0}} end={{x:0.342,y:0.94}}>` (verbatim) | 우리 RN은 WMBottle SVG로 일관성 — cellar-list와 동일. verbatim 원하면 별도 옵션 |
| `boxSizing: 'border-box'` | RN default (border 포함 width) | RN 표준 |
| `min-width: 0` (flex 1 children) | RN은 명시적 `minWidth: 0` style 필요 (Text ellipsis 위해) | 호환 가능 |
| `aria-modal`, `role="dialog"` | `accessibilityViewIsModal={true}`, `accessibilityRole="none"` (BottomSheet 자체) | RN 동등 |
| `aria-hidden` (BottleThumb) | `accessibilityElementsHidden={true}` (iOS) + `importantForAccessibility="no-hide-descendants"` (Android) | RN 표준 |
| globals.css `.wm-back-title` 클래스 | `<Text className="font-inter-semibold" style={{fontSize:16,lineHeight:19.2,color:scheme==='dark'?dark.text.primary:light.text.primary}}>` | RN은 CSS 클래스 없음 — typography 토큰 사용 |
| `availableTemplates` (community + custom 포함) | **v0.1.0**: builtin 2종만 (`[BUILTIN_BEGINNER, BUILTIN_EXPERT]` 하드코딩). community + custom은 v0.2.0 SCOPE-OUT | tasting_templates Supabase 테이블 부재 — Plan D §4-8 (TS code 작게) |
| `wm-scroll-area` (custom scrollbar) | `<ScrollView>` default | RN 모바일은 표준 scrollbar |

---

## 10. 데이터 의존 항목

### 10-1. 클라이언트 상태

| 상태 | 종류 | 초기값 | 사용처 |
|---|---|---|---|
| `selectedTemplateId` | `useState<string \| null>` | `null` | Stage 분기 |
| `pickOpen` | `useState<boolean>` | `false` | Stage 3 BottomSheet |
| `params.wine_lwin` | `useLocalSearchParams` | `undefined` | NewWineCard / CellarRow press 시 query forward |
| `params.photo_url` | `useLocalSearchParams` | `undefined` | NewWineCard / CellarRow press 시 query forward |

### 10-2. 외부 의존

| 모듈 | 데이터 | 출처 (v0.1.0) |
|---|---|---|
| `availableTemplates` | `TastingTemplate[]` | **v0.1.0**: `[BUILTIN_BEGINNER, BUILTIN_EXPERT]` 하드코딩 in `src/lib/notes/builtin-templates.ts` (신규). community/custom은 v0.2.0 |
| `cellar` | `cellar_items[]` join `wines_localized` | `supabase.from('cellar_items').select('*, wine:wines_localized(...)').eq('user_uuid', auth.uid()).is('consumed_at', null)` — RLS 자동 필터 |
| `cellar.length` | number | 위 query length, `cellarCount` prop |
| `getWine(lwin)` | `wines_localized` row | 이미 join된 cellar 결과에서 사용 |

### 10-3. v0.1.0 SCOPE-OUT

- ✕ community templates (`tasting_templates` 테이블)
- ✕ custom templates (사용자 작성 양식)
- ✕ Feature flag context (`useRegisterFeatures`)
- ✕ 양식별 fields[] dynamic form (DynamicTemplateForm) — builtin 2종만 별도 컴포넌트(BeginnerForm/ExpertForm)
- ✕ "직접 입력" 라우팅 분기 — keyscreen newEntry는 곧장 write 진입 (라벨 사진/검색 sub-options 없음)

---

## 11. 라우팅 (다음 화면)

| 진입 source | 라우팅 |
|---|---|
| TemplateCard press | (라우팅 없음 — 같은 화면 stage 전환) |
| BackToTemplateLink | (라우팅 없음 — stage 전환) |
| CellarCard press | `setPickOpen(true)` (모달 오픈, 라우팅 없음) |
| NewWineCard press | `router.push('/notes/new/write?from=newEntry&templateId={tid}' + wineLwinQ + photoUrlQ)` |
| BottomSheet CellarRow press | `router.push('/notes/new/write?from=cellar&itemId={cellar_item.id}&templateId={tid}&wine_lwin={wine.lwin}' + photoUrlQ)` |
| BackHeader < | `router.back()` (또는 fallback `router.replace('/(tabs)')` — 진입 경로에 따라) |

> `templateId` 값: `BUILTIN_BEGINNER_ID` ('builtin-beginner') or `BUILTIN_EXPERT_ID` ('builtin-expert'). v0.1.0은 두 값만 가능.

> `tid` fallback: `selectedTemplateId ?? BUILTIN_BEGINNER_ID`. 사용자가 Stage 2 도달 전에는 이 fallback 미사용 (Stage 2 진입 자체가 selectedTemplateId 설정 후).

---

## 12. 현재 구현 차이 (retroactive)

기존 코드: `app/notes/new.tsx` (140 LOC, Day 5 구현)

| 항목 | 키스크린 원본 | 현재 구현 | 수정 필요 |
|---|---|---|---|
| 화면 구조 | 2-stage 인라인 (Template → Source) + Stage 3 Cellar BottomSheet | 단일 BottomSheet 6-option (cellar/restaurant/shop/gift/tasting_event/other) | **재작성** (큰 폭) — Stage 분기 + TemplateCard + SourcePicker + Cellar BottomSheet |
| 헤더 | BackHeader 56px (ChevronLeft + Title) | BottomSheet 자체 (헤더 없음) | BackHeader 추가 — title `notes.source.title` ("출처 선택") |
| 데이터 모델 | template 개념 (builtin 2종) | source 개념 (6 enum) | DB schema `tasting_notes.source_type` 변경 또는 호환 유지 — **§13 escalation** |
| 양식 결정 | Template picker가 결정 (templateId query) | 현재 write 화면이 자체 결정 (`mode-toggle` 컴포넌트로 beginner/expert 토글) | write 화면 진입 시 templateId로 결정 — write.tsx 수정 필요 |
| Source 분기 | cellar (BottomSheet 와인 선택) / newEntry (즉시 write 진입) | 6 source enum → write 진입 시 source 전달 | cellar/newEntry 2가지로 축소 + cellar 시 wine_lwin 선택 단계 추가 |
| BottomSheet | Stage 3 셀러 와인 picker로 사용 | 메인 source picker로 사용 | 용도 변경 — Cellar 와인 picker로 재사용 |
| Wine 출처 enum (restaurant/shop/gift/tasting_event/other) | 키스크린 없음 (cellar/newEntry만) | tasting_notes.source enum 5종 | **§13 escalation**: 출처 enum 보존 여부 결정 — 보존 시 newEntry 진입 시 별도 source 선택 단계 필요 |
| 진입 query (`wine_lwin`, `photo_url`) | 키스크린 없음 (capture flow 별도) | 현재 RN 활용 (capture → notes/new) | 유지 (§9 deviation enhancement) |

**v0.1.0 권장 marshall plan** (escalation 결정 전 안전 옵션):
1. **Option A — keyscreen verbatim 적용**: Template picker + Source picker 2-stage 추가. tasting_notes.source_type 컬럼은 'cellar' / 'new_entry' 2값으로 축소 또는 보존 (writeForm에서 별도 선택). 신규 i18n 21개 + design tokens 10개 추가.
2. **Option B — 하이브리드**: 현재 RN의 6-option BottomSheet를 keep but BackHeader로 감싸기. Template picker는 SCOPE-OUT (mode-toggle로 대체 유지). 키스크린 시각 미일치 채택.

> **권장: Option A** (verbatim 원칙 + 키스크린 시각 충실도). Option B는 design-reviewer FAIL 위험.

---

## 13. 미해결 질문 / Escalation (리더 판단 필요)

| # | 질문 | 권장안 |
|---|---|---|
| E1 | tasting_notes 테이블에 `template_id` 컬럼 도입 여부 (현재는 `mode: 'beginner' | 'expert'`) — Option A 채택 시 필요 | **추가**: `template_id text not null default 'builtin-beginner'`. v0.1.0은 enum 2값만 (`'builtin-beginner' | 'builtin-expert'`). v0.2.0에서 community/custom 확장 |
| E2 | tasting_notes `source_type` enum 5종 (restaurant/shop/gift/tasting_event/other) 보존 여부 | **축소**: `'cellar' | 'new_entry'` 2값으로 변경 (keyscreen 동등). 또는 5종 보존 + Template picker 추가 (write 화면에서 source 별도 입력) — 데이터 의미 vs 사양 충실도 trade-off |
| E3 | 신규 typography 토큰 9개 모두 추가 vs 일부 기존 재사용 | **모두 추가** — verbatim 원칙 + design-reviewer 통과 위해. design-tokens.ts §typography 끝에 "notes-new retroactive" 그룹으로 추가 |
| E4 | community/custom templates v0.1.0 포함 여부 | **SCOPE-OUT** (Plan D §4-8). v0.1.0은 builtin 2종만. availableTemplates를 `src/lib/notes/builtin-templates.ts` 상수로 |
| E5 | i18n `notes.source.title` 값 변경 ("어디에서 마셨나요?" → "출처 선택") | **변경**: keyscreen verbatim. 기존 값은 사용처 없음 (BackHeader title로만 사용) |
| E6 | `app/notes/new.tsx` 단일 파일 유지 vs 컴포넌트 분리 | **분리 권장**: `src/components/notes/{template-picker, source-picker, cellar-row, template-card}.tsx`로 추출. `app/notes/new.tsx`는 stage 분기 + 컴포넌트 조립 |
| E7 | tid query param 인코딩 (`encodeURIComponent`) | **유지**: builtin-beginner / builtin-expert는 영문 dash라 인코딩 무관 but custom IDs (v0.2.0) 대비 표준화 |
| E8 | capture → /notes/new (wine_lwin + photo_url query) 진입 경로 보존 | **보존**: 현재 RN enhancement. NewWineCard press 또는 CellarRow press 시 query forward. cellar의 경우 wine_lwin이 자동 추출되므로 photo_url만 forward |
| E9 | TemplateCard `numberOfLines={2}` 시 한국어 긴 description (입문자: "5분이면 끝나는 짧은 기록. 첫 인상·맛·향·여운·평점·메모.") fit 검증 | **design-reviewer 시각 검증**: 화면 폭 360pt 기준 ~2줄. ko 길이 > en 길이. 양쪽 모드 + ko/en 양쪽 캡처 필수 |
| E10 | BottomSheet handle visibility 양쪽 모드 | **gold (#C9A84C) 양쪽 모드 동일** — keyscreen verbatim. design-reviewer 검증: light 모드 surface(#FFFFFF) 위 gold handle 대비 — OK |

---

## 14. 변환 체크리스트 (rn-screen-builder용)

- [ ] `app/notes/new.tsx` 재작성 — Stage 1/2/3 분기 구현
- [ ] `src/components/notes/template-card.tsx` 신규 — TemplateCard 컴포넌트
- [ ] `src/components/notes/source-picker.tsx` 신규 — Stage 2 인라인 picker (CellarCard + NewWineCard)
- [ ] `src/components/notes/cellar-bottom-sheet.tsx` 신규 — Stage 3 BottomSheet + CellarRow
- [ ] `src/lib/notes/builtin-templates.ts` 신규 — BUILTIN_BEGINNER + BUILTIN_EXPERT 상수 (id, title, description)
- [ ] `src/lib/design-tokens.ts` 토큰 추가 — typography 9개 + radius 1개 + (옵션) constant 1개 (§4-2)
- [ ] `tailwind.config.ts` mirror 추가 — typography·radius
- [ ] `src/lib/i18n/ko.json` + `en.json` 신규 키 21개 추가 (§8-2)
- [ ] `src/lib/i18n/ko.json` + `en.json` 기존 `notes.source.title` 값 수정 (§8-1)
- [ ] 라우팅 query 보존 확인 (`wine_lwin`, `photo_url` forward to write)
- [ ] 양쪽 모드 (dark/light) + 양쪽 언어 (ko/en) 검증
- [ ] Stage 1/2 화면 캡처 → keyscreen `notes_new.png` (Stage 1 ko dark) + ko light + en dark + en light → design-reviewer
- [ ] Stage 2 (Source picker) 캡처 (셀러 0 + 셀러 N 양쪽) → design-reviewer
- [ ] Stage 3 (BottomSheet) 캡처 (CellarRow 다수 + 적음) → design-reviewer
- [ ] accessibilityLabel/Role/Hint 모두 부여 (§7)
- [ ] Haptics.selectionAsync 모든 press hook (§6)
- [ ] schema 변경 (E1, E2) 결정 후 마이그레이션 작성 (선택)

---

## 15. 빈/오류 상태

| 상태 | 처리 |
|---|---|
| availableTemplates.length === 0 | 발생 불가 (builtin 2종 항상 포함). 만약 발생 시 EmptyState ("양식을 불러오지 못했어요") |
| cellar.length === 0 | CellarCard disabled (§5-6). NewWineCard만 활성 |
| wine.length === 0 in cellar BottomSheet (모든 wineId fallback) | BottomSheet 내부 EmptyState ("셀러에 와인 정보가 없어요") |
| network error (Supabase) | Toast (`common.fetchError`) + 재시도 버튼 (PrimaryButton variant=secondary) |
| 진입 가드 fail (auth lost) | onboarding으로 redirect (`router.replace('/onboarding/welcome')`) |

---

## 16. 참조 파일 (rn-screen-builder가 코드 작성 시 read)

- `app/notes/new.tsx` — 현재 RN (140 LOC, 재작성 대상)
- `app/(tabs)/cellar/index.tsx` — CellarCard 패턴 (BottleThumb 사용)
- `app/(tabs)/cellar/[lwin].tsx` — BackHeader + ScrollView 패턴
- `src/components/cellar/cellar-card.tsx` — Card 컴포넌트 패턴 (border + radius + bg-surface)
- `src/components/shared/wm-bottle.tsx` — Stage 3 BottleThumb 후보
- `src/components/shared/empty-state.tsx` — EmptyState 패턴
- `src/components/shared/wine-name-display.tsx` — CellarRow Name 패턴 (ko/en 분기)
- `src/lib/design-tokens.ts` — 토큰 진실 소스
- `src/lib/use-theme-tokens.ts` — useColorScheme + 토큰 hook
- `_workspace/design-specs/cellar-list.md` §2-4 — CellarCard·BottleZone 패턴 (cellar-card retroactive 완료)
- `_workspace/design-specs/cellar-detail.md` §2-3 — BackHeader 패턴 (cellar-detail retroactive 완료)
- `_workspace/design-specs/wine-detail.md` §3-5 — Pressable wineRed shadow 패턴 (NewWineCard 옵션)
- `_workspace/keyscreen-shots/notes_new.png` — 시각 reference (Stage 1, dark, ko)

---

> **다음 단계**: design-reviewer가 본 사양 검토 후 rn-screen-builder 진입. design-tokens.ts + tailwind.config.ts + i18n 확장은 별도 P0 세션 또는 rn-screen-builder 본인이 처리 가능. E1·E2 (schema 변경) 결정은 리더 판단 — 미결정 시 v0.1.0 SCOPE-OUT 으로 keyscreen verbatim Stage 분기만 적용하고 source enum 컬럼은 'cellar' / 'new_entry' 2값으로 축소.
