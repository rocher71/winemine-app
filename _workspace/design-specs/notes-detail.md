# notes-detail (`/notes/[noteId]`) Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX (`page.tsx` + 자식들) > keyscreen `docs/design-system/{colors,typography,components}.md` > 우리 `src/lib/design-tokens.ts`.
> 작성일: 2026-05-21 (Day 6 retroactive hardening) · author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/app/notes/[noteId]/page.tsx` (882 LOC — `ViewNotePage` + `DimensionsExpert` + `DimensionsBeginner` + `Card` + `DimGrid` + `Row`)
- 자식 컴포넌트 (재귀 read):
  - `../winemine-keyscreen/src/components/nav/back-header.tsx` (56px header, ChevronLeft 24 + title + right slot children)
  - `../winemine-keyscreen/src/components/shared/locale-text.tsx` (ko/en 분기 — LocalizedString 노출용)
- 도메인 lib:
  - `../winemine-keyscreen/src/lib/mock/tasting-notes.ts` (`getTastingNoteById`, `TastingNote` shape — `beginnerFields`/`expertFields`/`mode`/`templateId`/`userId`/`wineId`/`rating`/`tastedAt`/`photoUrl`/`priceKrw`)
  - `../winemine-keyscreen/src/lib/mock/shared-notes.ts` (`getSharedNote`, `SharedNote` shape — author/level/rating100/tastedAt/memo/templateId — **v0.2.0 SCOPE-OUT for RN v0.1.0**, §10 escalation D1)
  - `../winemine-keyscreen/src/lib/mock/tasting-templates.ts` (`getTemplateById`, `BUILTIN_BEGINNER_ID`, `BUILTIN_EXPERT_ID` — pill 라벨)
  - `../winemine-keyscreen/src/lib/tasting-note-lexicon.ts` (`AROMA_CATEGORIES`, `AROMA_LEXICON`, `FAULTS`, `FINISH_LENGTH_LABELS`, `TANNIN_TEXTURE_LABELS`)
  - `../winemine-keyscreen/src/lib/profile-helpers.ts` (`resolveUser` — shared note author resolution, **shared note 전용 v0.2.0 SCOPE-OUT**)
- 디자인 시스템:
  - `../winemine-keyscreen/docs/design-system/colors.md` (line 17~71 — `--color-{cream,gold,text-secondary,text-muted,surface,border-default,bg-sunken,wine-red,wine-red-hover}` 매핑표)
  - `../winemine-keyscreen/docs/design-system/typography.md` (`var(--font-playfair)` + `var(--font-inter)` 위계)
- 산문 명세: 없음 (`pages/notes-detail.md` 부재 — JSX + 디자인 시스템만 진실)
- i18n (keyscreen): JSX 내부 `locale === 'ko'/'en'` 인라인 분기 (별도 messages 키 없음) — 우리 RN에서는 i18next 키로 표준화 (§7)
- 스크린샷 reference: `_workspace/keyscreen-shots/notes_noteId.png` (Expert — dark, ko — 와인 헤더 / 작성자 카드 gold border / 메모 카드 sunken / WSET 5 / 구조 / 여운·온도 / 아로마 / 오프닝 타임라인 / 음용 적기)
- 현재 RN 구현 (retroactive 대상): `app/notes/[noteId].tsx` (212 LOC) + `src/components/notes/{note-body-beginner,note-body-expert,star-rating-readonly,wset-readonly}.tsx` (Day 5 1차 + Day 6 hardening 일부 완료)

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/notes/[noteId].tsx` (그대로 유지 — `(tabs)` 그룹 외부) |
| 진입 경로 | `/notes/[noteId]` |
| 진입 트리거 | 홈 RecentNotes 카드 onPress / 와인 상세 MyTastingNoteCard onPress / (v0.2.0 공유 노트 카드) |
| 헤더 | `<BackHeader title={t('notes.detail.title')} right={<HeaderActions />} />` — keyscreen title verbatim "테이스팅 노트" / "Tasting note" |
| BottomNav | **숨김** — `(tabs)` 외부 (현재 RN 그대로) |
| 가드 | Suspense fallback → ActivityIndicator. `useNote()` loading 시 spinner / `note == null` 또는 `note.wine == null` 시 EmptyState |
| 다크/라이트 | 둘 다 지원 (§4-9) |
| 화면 분기 | (A) **mine + beginner** = BeginnerForm read-only / (B) **mine + expert** = ExpertForm read-only (10+ Card) / (C) **shared (sn- prefix)** = mine과 동일 레이아웃이되 Edit 버튼 숨김 — **v0.1.0 SCOPE-OUT**, RN은 mine만 지원 (§10 D1) / (D) **not found** = EmptyState |
| 권한 | RLS로 자동 필터 — `tasting_notes` select 정책: `user_id = auth.uid()` (v0.1.0 mine only) |

> **현재 RN 차이**: keyscreen은 `mine` (note_ prefix) + `shared` (sn- prefix) 양쪽 지원, RN은 mine만. shared 노트는 v0.2.0에서 `tasting_notes.is_public` + RLS select 정책 확장 (§9 escalation D1).

---

## 2. Layout Tree (verbatim 변환)

keyscreen `page.tsx` line 116~377 + `DimensionsExpert` line 394~714 + `DimensionsBeginner` line 800~871 그대로 RN 트리화.

### 2-1. Screen root (page.tsx line 116~159)

```
View (flex-1, bg-bg-deepest dark:bg-bg-deepest)
│
├── BackHeader                                                  ← keyscreen line 118~157
│     ├── BackButton (ChevronLeft 24 stroke 1.75)
│     ├── Title (Inter 600 16)
│     │     value: t('notes.detail.title') ("테이스팅 노트" / "Tasting note")
│     └── Right slot (flex-row gap 0)
│           ├── EditBtn (Pressable, padding 6, hitSlop 10)      ← keyscreen line 119~143, mine && mineEditable 일 때만
│           │     icon: Pencil 18 stroke 1.75 color text-secondary
│           │     onPress: router.push(`/notes/new/write?from=newEntry&wineId=${wineId}&edit=1&templateId=${tplId}`)
│           ├── DeleteBtn (Pressable, padding 6, hitSlop 10)    ← keyscreen 부재, 현재 RN enhancement (keep)
│           │     icon: Trash2 18~20 stroke 2 color wine-red
│           │     onPress: Alert.alert confirm → deleteNote()
│           └── ShareBtn (Pressable, padding 6, hitSlop 10)     ← keyscreen line 144~156, **v0.1.0 STUB**
│                 icon: Share2 18 stroke 1.75 color text-secondary
│                 onPress: noop (또는 v0.2.0 native Share API)
│
└── ScrollView (flex-1, contentContainerStyle paddingBottom 40, showsVerticalScrollIndicator=false)
      │
      ├── WineHeaderLink (§2-2)                                 ← keyscreen line 161~222
      ├── AuthorMetaCard (§2-3)                                 ← keyscreen line 225~332
      ├── MemoCard (§2-4)                                       ← keyscreen line 335~367
      └── Dimensions (§2-5)                                     ← keyscreen line 370~375
            mode === 'expert' ? <DimensionsExpert /> :
            mode === 'beginner' ? <DimensionsBeginner /> : null
```

### 2-2. WineHeaderLink (keyscreen line 161~222)

> **현재 RN 차이**: 현재 RN은 `<WineHero />` (88×290 큰 bottle hero) + 하단 별도 "이 와인 보기" CTA를 사용. **keyscreen은 컴팩트 44×64 bottle thumb + name + region 한 줄** — 노트 상세는 메인 콘텐츠가 노트 본문이므로 컴팩트 헤더가 verbatim. **retroactive 권장**: WineHero 제거 → 컴팩트 thumb 카드로 교체. (§10 E1).

```
Pressable (Link to `/wine/${wineId}`)                            ← keyscreen line 161~170
  style: flex-row, gap 12, paddingHorizontal 20 paddingVertical 14, items-center
  onPress: router.push(`/wine/${encodeURIComponent(wine.lwin)}`)
  pressed feedback: opacity 0.7
  │
  ├── BottleThumb (44 × 64, radius 6, flexShrink 0)             ← keyscreen line 171~199
  │     border: 1 withAlpha(brand.gold, 0.18) — 'rgba(201,168,76,0.18)' verbatim
  │     case A — note.photoUrl exists:
  │       <Image source={{ uri: note.photoUrl }} accessibilityIgnoresInvertColors
  │              style={{ width:44, height:64, borderRadius:6 }} resizeMode="cover" />
  │     case B — no photoUrl:
  │       <LinearGradient                                       ← 160deg, [bottleColor, '#1a0a1e'], locations [0, 0.7]
  │           colors={[bottleColor, dark.bg.bottleShelf]}
  │           start={{x:0, y:0}} end={{x:0.342, y:0.94}}
  │           locations={[0, 0.7]}
  │           style={{ width:44, height:64, borderRadius:6 }} />
  │
  └── MetaCol (flex 1, minWidth 0)
        ├── WineName (Playfair 16 lh 1.3 cream)                  ← keyscreen line 201~210
        │     value: WineNameDisplay (lwin/name_ko/display_name, size="card")
        └── Sub (Inter 12 text-muted mt 2)                       ← keyscreen line 211~220
              value: "{vintage} · {region} · {country}"
              null-safe: vintage null 시 "—"; region/country null 시 omit (· separator 보정)
```

### 2-3. AuthorMetaCard (keyscreen line 225~332)

```
View                                                              ← keyscreen line 225~236
  style: marginHorizontal 16, padding 14, radius 14,
         backgroundColor surface, borderWidth 1,
         borderColor brand.gold,                                 ← 이 카드의 시그니처 — gold border (다른 카드와 구분)
         flexDirection 'column', gap 10
  │
  ├── Row1 (flex-row, items-center, gap 10)                       ← keyscreen line 237~289
  │     ├── AuthorAvatar (32 × 32, radius 999)                    ← keyscreen line 244~260
  │     │     background: levelGradient(L1~L5) — §3-1 §6 토큰
  │     │     border: 1 withAlpha(brand.gold, 0.30) — 'rgba(201,168,76,0.3)' verbatim
  │     │     content: <Text> 한 글자 (anonymous_display.charAt(0))
  │     │              Playfair 13 700 cream centered
  │     │     a11y: aria-hidden (이미지 의도 — 본문은 옆 이름)
  │     │
  │     ├── AuthorName (Pressable Link to `/profile/${authorUserId}`, flex 1)  ← keyscreen line 263~274
  │     │     v0.1.0 RN: mine only — Pressable 비활성 (navigation은 v0.2.0 profile 화면 도입 시)
  │     │     style: Playfair 14 cream
  │     │     value: anonymous_display (NEVER raw UUID — §4-5)
  │     │     fallback: "Me" / "나" (i18n) — mine 인 경우
  │     │
  │     └── TemplatePill (View, optional — template 있을 때만)     ← keyscreen line 275~288
  │           style: paddingVertical 4 paddingHorizontal 9, radius 999,
  │                  border 1 border-default, background transparent
  │           text: Inter 10 text-muted
  │           label: t('notes.detail.modeBeginnerBadge') / t('notes.detail.modeExpertBadge')
  │                  (현재 RN: "입문자" / "Beginner", "전문가" / "Expert" — keep)
  │
  └── Row2 (flex-row, gap 14, flexWrap 'wrap')                    ← keyscreen line 291~331
        │
        ├── DateChip (inline-flex, items-center, gap 4)            ← keyscreen line 292~303
        │     icon: Calendar 12 stroke 1.75 text-muted
        │     text: Inter 12 text-muted
        │     value: tastedAt.slice(0, 10)  ("2025-09-14" — YYYY-MM-DD)
        │
        ├── RatingChip (inline-flex, items-center, gap 4)          ← keyscreen line 304~316
        │     icon: Star 12 stroke 0 fill brand.gold
        │     text: Inter 12 600 gold
        │     value: "{Math.round(rating100)}/100"
        │     ← §5-2: 우리 RN tasting_notes.rating은 0~5 half-step (DECIMAL(3,1)),
        │       표시는 rating × 20 변환 후 `${rating100}/100`. or `${rating}/5` 둘 다 가능 — keyscreen verbatim은 "/100".
        │     ← §10 E2 결정 필요: /100 (keyscreen verbatim) vs /5 (현재 RN StarRatingReadOnly)
        │
        ├── PriceChip (inline-flex, items-center, gap 4 — priceKrw != null 시) ← keyscreen line 317~330
        │     text: Inter 12 text-secondary
        │     value: "₩{toLocaleString(locale)}" — ko-KR / en-US
        │     ← **v0.1.0 SCOPE-OUT**: 현재 RN tasting_notes 컬럼 부재. expertFields.conclusions.estimated_price_krw 있으면 거기서 fallback (§5).
        │
        └── BlindChip (inline-flex, items-center, gap 1 — mode === 'expert' && expertFields.blind === true 시) ← 현재 RN enhancement (keep)
              style: paddingHorizontal 12 paddingVertical 4, radius 999, bg-bg-deep
              icon: EyeOff 12 stroke 2 gold
              text: Inter 10 600 gold
              label: t('notes.detail.blindBadge') ("블라인드 시음" / "Blind tasted")
```

### 2-4. MemoCard (keyscreen line 335~367)

> **현재 RN 차이**: 현재 RN은 메모를 `NoteBodyBeginner` 내부 Section ("Comment")로 처리. **keyscreen은 mode 분기 이전에 공통 카드** — beginner/expert 모두 메모를 같은 위치에 노출. **retroactive 권장**: 메모를 §2-5 위로 끌어올려 공통화. (§10 E3).

```
View                                                              ← keyscreen line 335~343
  style: marginTop 16, marginHorizontal 16, padding 16, radius 14,
         backgroundColor bg-sunken, borderWidth 1, borderColor border-default
  │
  ├── Eyebrow (Inter 10 600 gold, uppercase, letter-spacing 0.18em → 1.8px) ← keyscreen line 344~355
  │     label: t('notes.detail.sectionMemo') 신규 ("메모" / "Memo")
  │     marginBottom: 8
  │
  └── MemoText (Playfair 14 italic cream, lineHeight 1.65)        ← keyscreen line 356~366
        value: data.memo (LocalizedString — beginner.memo / expert.memo / fallback "")
        fallback: t('notes.detail.noComment') ("코멘트 없음" / "No comment") — 비어있을 때
```

> beginner-form / expert-form 에서 memo 필드 shape 확인:
>   - BeginnerFields.memo: string (현재 RN, single locale — note 작성 시 현재 locale의 본문) — keyscreen LocalizedString과 다름 (§5)
>   - ExpertFields.appearance.notes / nose.aromas — 별도 텍스트 필드 (메모와 다름)
>   - Expert "memo" → `conclusions` 어딘가에 별도 입력 (현재 RN expert-form에는 명시적 memo 없음) — §10 E4 결정 필요

### 2-5. Dimensions (mode 분기, keyscreen line 369~375)

#### (A) DimensionsBeginner (keyscreen line 800~871)

```
View                                                              ← keyscreen line 815~823
  style: marginTop 16, marginHorizontal 16, padding 14, radius 14,
         backgroundColor surface, borderWidth 1, borderColor border-default
  │
  ├── Eyebrow (Inter 10 600 gold, uppercase, letter-spacing 0.18em → 1.8px) ← keyscreen line 824~834
  │     label: locale === 'en' ? 'Palate' : '맛 균형'
  │     i18n key: t('notes.detail.sectionPalateBeginner') 신규
  │     marginBottom: 10
  │
  └── DimGrid4 (display 'grid', gridTemplateColumns 'repeat(4, 1fr)', gap 6) ← keyscreen line 836~870
        ← RN 변환: flex-row + flex 1 each + gap 6 (또는 4-col percent), §8 deviation D2
        items: [
          { label: '단맛'/'Sweet', value: fields.sweetness },         // 1~5
          { label: '산미'/'Acid',  value: fields.acidity },
          { label: '바디'/'Body',  value: fields.body },
          { label: '타닌'/'Tannin', value: fields.tannin },
        ]
        each item (textAlign 'center'):
          ├── label (Inter 9 text-muted, uppercase, letter-spacing 0.04em → 0.36px, mb 4)
          └── value (Playfair 14 cream, lineHeight 1.1)
              format: `${v}/5`
```

> **현재 RN beginnerFields shape 차이**: 
> - keyscreen: `{ sweetness, acidity, tannin, body }` (1~5 number 각각) — flat
> - RN BeginnerFields (Day 6): `{ palate: { sweetness, acidity, body, tannin, bubble }, impression, aromas, finish, memo }` — nested + categorical strings
> - retroactive: **현재 RN shape 유지** (keep — Day 6 schema). palate.{dim} string → label 변환 (i18n `notes.beginner.palateLevel.${value}`). §5-1.

#### (B) DimensionsExpert (keyscreen line 394~714) — 10 Card 트리

```
Fragment
│
├── Card "WSET 차원"/"WSET dimensions"                            ← keyscreen line 428~430
│     DimGrid (cols 5)
│     items: [Sweet, Acid, Body, Alcohol, Tannin] × wsetShort(scale, locale)
│       wsetShort: { low→"낮음"/"Low", mediumMinus→"중−"/"M−", medium→"중"/"Med", mediumPlus→"중+"/"M+", high→"높음"/"High" }
│
├── Card "구조"/"Structure"                                       ← keyscreen line 433~449
│     ├── DimGrid (cols 2): [Aroma, Flavor] × wsetShort
│     ├── Row: Tannin texture → t('notes.expert.tanninTexture.${value}') (silky, velvety, grippy, harsh ...)
│     ├── Row: Tannin ripeness (옵션 — ripe/unripe/overripe) ko/en
│     └── Row: Finish length → "${FINISH_LENGTH_LABELS[fields.finishLength].label} · ${range}"
│          예: "매우 긴 · > 10 caudalies" / "Very long · > 10 caudalies"
│
├── Card "풍미 노트"/"Flavor notes" (flavorNotes 채워졌을 때만)     ← keyscreen line 452~466
│     Body (Playfair 13 italic cream, lineHeight 1.6) — LocalizedString
│
├── Card "버블"/"Bubbles" (fields.bubbles 있을 때만)                ← keyscreen line 469~494
│     ├── Row: Size → "${fields.bubbles.size}" (small/medium/large)
│     ├── Row: Persistence → fields.bubbles.persistence
│     ├── Row: Mousse → fields.bubbles.mousse (creamy/silky/aggressive)
│     ├── Row: Method → fields.bubbles.method (charmat/traditional/etc)
│     └── Row: Dosage → fields.dosage (옵션, brut nature ~ doux)
│
├── Card "여운·온도"/"Mouthfeel"                                   ← keyscreen line 497~515
│     DimGrid (cols 1 or 2)
│       - "카우달리"/"Caudalies": `${fields.caudalies}s`
│       - "시음 온도"/"Served at": `${fields.servingTempCelsius}°C` (옵션)
│
├── Card "아로마"/"Aroma" (fields.aromaWheel.length > 0)            ← keyscreen line 518~564
│     each category (column gap 10):
│       ├── catLabel (Inter 10 text-muted, uppercase, letter-spacing 0.06em → 0.6px, mb 6)
│       │     value: AROMA_CATEGORIES.find(c.id === categoryId) → c.ko/c.en
│       │     예: "과일" / "Fruit", "나무·오크" / "Wood·Oak", "흙" / "Earth"
│       └── ChipsRow (flex-wrap gap 5)
│             each term (paddingVertical 3 paddingHorizontal 9, radius 999,
│                        border 1 border-default, background bg-sunken):
│               text: Inter 11 cream
│               value: AROMA_LEXICON.find(e.id === termId) → e.ko/e.en
│                      예: "카시스", "검은체리", "시더", "연필심", "흑연", "담배잎"
│
├── Card "오프닝 타임라인"/"Opening timeline"                       ← keyscreen line 567~627
│     ├── Row: Opened at → fields.evolution.openedAt.slice(0,16).replace('T',' ')   ("2025-09-14 17:30")
│     ├── Row: Decanted → "함"/"안 함" or "Yes"/"No"
│     ├── Row: Peak at → "오픈 후 ${peakAt}분" / "${peakAt} min after opening"
│     └── Checkpoints (timepoints.length > 0):
│           ├── microLabel (Inter 10 text-muted uppercase ls 0.06em mb 6)
│           │     value: t('notes.detail.checkpoints') ("체크포인트" / "Checkpoints")
│           └── List (column gap 4):
│                 each tp (flex-row justify-between, Inter 12 text-secondary):
│                   ├── left: `+${tp.minutes} min` / `${tp.minutes}분`
│                   └── right (gold, Playfair): `${tp.score}/100`
│
├── Card "음용 적기 추정"/"Drinking window estimate" (peakEstimateYear != null) ← keyscreen line 630~662
│     ├── Row: Estimated peak → `${fields.peakEstimateYear}`
│     ├── Row: Confidence → low/medium/high → "낮음/보통/높음" / "Low/Medium/High"
│     └── PeakNote (Inter 12 italic text-secondary mt 8 lineHeight 1.5)
│           value: LocalizedString fields.peakEstimateNote
│
├── Card "감지된 결함"/"Faults detected" (fields.faults.length > 0) ← keyscreen line 665~690
│     ChipsRow (flex-wrap gap 6):
│       each fault (paddingVertical 3 paddingHorizontal 10, radius 999,
│                   border 1 brand.wineRed,
│                   background withAlpha(brand.wineRed, 0.18) — 'rgba(139,26,42,0.18)' verbatim,
│                   color wine-red-hover (brand.wineRedHover '#A02030'),
│                   font Inter 11):
│         label: FAULTS.find(f.id === id) → f.ko/f.en
│                예: "Cork (TCA)" / "코르크 (TCA)", "Brett" / "브렛", "Oxidation" / "산화"
│
└── Card "재구매 의향"/"Would buy again" (fields.wouldBuyAgain != null) ← keyscreen line 693~711
      Body (Playfair 14):
        if wouldBuyAgain === true: color gold, value "네, 다시 살 거예요" / "Yes — will reorder"
        if false:                  color text-secondary, value "이번엔 한 번이면 충분" / "Not this time"
```

> **현재 RN ExpertFields shape 차이**: 
> - keyscreen: 평탄 `{ sweetness, acidity, body, alcohol, tannin, intensity, flavorIntensity, finishLength, tanninTexture, tanninRipeness, flavorNotes, bubbles, dosage, caudalies, servingTempCelsius, aromaWheel, evolution, peakEstimateYear, peakEstimateConfidence, peakEstimateNote, faults, wouldBuyAgain }` (총 ~25 필드)
> - RN ExpertFields (Day 5): `{ appearance:{intensity,clarity,notes}, nose:{intensity,development,aromas}, palate:{sweetness,acidity,tannin,alcohol,body,flavor,finish}, conclusions:{quality,readiness,estimated_price_krw}, blind:boolean }` (4-section WSET 구조)
> - retroactive: **현재 RN shape 유지** (keep — supabase 마이그레이션 안정). keyscreen 표시는 RN shape에 매핑 (§5-2). 
>   - `appearance + nose + palate` → 별도 Card 3개 (현재 RN 패턴)
>   - `conclusions` → "결론" Card (quality/readiness/price)
>   - keyscreen verbatim Card 트리는 RN 미보유 필드 (bubbles, aromaWheel, evolution, faults, wouldBuyAgain) — **v0.2.0 schema 확장 시점에 도입**. (§10 D2)

---

## 3. NativeWind v4 className 매핑표

키스크린은 inline `style={{ ... }}` 위주 (CSS var). RN은 가능한 한 className으로 토큰화하고, RN 고유 속성 (LinearGradient 등)은 lib/design-tokens.ts 객체로.

### 3-1. 컨테이너 & 카드

| 키스크린 (inline) | 우리 RN (className / style) | 비고 |
|---|---|---|
| `wm-scroll-area` (`ScrollView` 대체) | `className="flex-1"` + `contentContainerStyle={{ paddingBottom: 40 }}` | keep |
| margin '0 16px' | `className="mx-4"` | NW v4 |
| padding 14 | `className="p-3.5"` (필요 시 spacing[3.5]=14 보존) | spacing[3.5] 이미 |
| padding 16 | `className="p-4"` | |
| padding 20 | `className="px-5"` 또는 inline | |
| paddingHorizontal 16 | `className="px-4"` | |
| paddingHorizontal 20 paddingVertical 14 | `className="px-5 py-3.5"` | |
| marginTop 16 | `className="mt-4"` | |
| gap 6 / 10 / 12 / 14 | `className="gap-1.5 / gap-2.5 / gap-3 / gap-3.5"` | NW v4 |
| borderRadius 6 | `className="rounded-md"` (NW v4 md=6) | radius.md |
| borderRadius 14 | `className="rounded-[14px]"` 또는 `style={{ borderRadius: 14 }}` | radius[14]=14 |
| borderRadius 999 | `className="rounded-full"` | |
| `background: var(--color-surface)` | `className="bg-surface"` | dual theme via NW theme |
| `background: var(--color-bg-sunken)` | `className="bg-bg-sunken"` 또는 `style={{ backgroundColor: scheme==='light' ? light.bg.sunken : dark.bg.sunken }}` | dual |
| `background: var(--color-bg-deep)` | `className="bg-bg-deep"` | chip background |
| `border: 1px solid var(--color-border-default)` | `className="border border-border-default"` | |
| `border: 1px solid var(--color-gold)` | `className="border border-gold"` | gold sig (AuthorMetaCard) |
| `border: 1px solid var(--color-wine-red)` | `className="border border-wine-red"` (또는 inline brand.wineRed) | Fault chip |
| `borderTop: 1px dashed rgba(201,168,76,0.12)` | inline `{ borderTopWidth: 1, borderTopColor: withAlpha(brand.gold, 0.12), borderStyle: 'dashed' }` | RN 'dashed' iOS unstable — §8 D3 |

### 3-2. 텍스트 & 색

| 키스크린 | 우리 RN | 비고 |
|---|---|---|
| `fontFamily: 'var(--font-playfair)'` | `className="font-playfair"` | tailwind.config fontFamily |
| `fontFamily: 'var(--font-inter)'` | `className="font-inter"` | |
| 위 + `fontWeight: 600` | `className="font-inter-semibold"` | already mapped |
| 위 + `fontWeight: 700` | `className="font-inter-bold"` 또는 inline | |
| `fontStyle: 'italic'` | inline `{ fontStyle: 'italic' }` (NW v4는 `italic` 클래스 지원) → `className="italic"` | |
| `color: 'var(--color-cream)'` | `className="text-cream"` (다크) / `className="text-text-primary"` (텍스트 primary 의미 시) | keyscreen은 cream을 텍스트 primary로 사용. 라이트 모드에서는 textInk → text-primary로 자동 분기 |
| `color: 'var(--color-gold)'` | `className="text-gold"` | |
| `color: 'var(--color-text-secondary)'` | `className="text-text-secondary dark:text-text-secondary"` | |
| `color: 'var(--color-text-muted)'` | `className="text-text-muted dark:text-text-muted"` | |
| `color: 'var(--color-wine-red-hover)'` | inline `{ color: brand.wineRedHover }` | Fault chip text |
| `textTransform: 'uppercase'` | `className="uppercase"` | |
| `letterSpacing: '0.18em'` (size 10 → 1.8px) | inline `{ letterSpacing: 1.8 }` | NW v4 letterSpacing 일부 — typography 토큰 활용 권장 |
| `letterSpacing: '0.06em'` (size 10 → 0.6px) | inline `{ letterSpacing: 0.6 }` | |
| `letterSpacing: '0.04em'` (size 9 → 0.36px) | inline `{ letterSpacing: 0.36 }` | |
| `lineHeight: 1.3` (size 16 → 20.8) | inline `{ lineHeight: 20.8 }` 또는 typography 토큰 | |
| `lineHeight: 1.1` (size 13 → 14.3 / size 14 → 15.4) | inline | |
| `lineHeight: 1.5` (size 12 → 18) | inline `{ lineHeight: 18 }` | |
| `lineHeight: 1.65` (size 14 → 23.1) | inline `{ lineHeight: 23.1 }` | Memo italic |
| `lineHeight: 1.6` (size 13 → 20.8) | inline `{ lineHeight: 20.8 }` | Flavor notes |

### 3-3. 효과

| 키스크린 | 우리 RN | 비고 |
|---|---|---|
| `linear-gradient(160deg, ${bottleColor} 0%, #1a0a1e 70%)` | `<LinearGradient colors={[bottleColor, dark.bg.bottleShelf]} start={{x:0,y:0}} end={{x:0.342,y:0.94}} locations={[0,0.7]} />` | §6 신규 token: `notesDetailBottleThumbGradient(bottleColor)` |
| `linear-gradient(135deg, #C9A84C, #0F0718)` (L4 avatar) | `<LinearGradient colors={[brand.gold, '#0F0718']} start={{x:0,y:0}} end={{x:1,y:1}} />` | §6 신규 token: `noteAuthorAvatarGradient[L]` |
| `linear-gradient(135deg, #8B1A2A, #3a0810)` (L5) | 위 동일 패턴 | §6 신규 |
| `linear-gradient(135deg, #b8b8c0, #3a3a48)` (L3) | 위 동일 패턴 | §6 신규 |
| `linear-gradient(135deg, #4a6fa5, #1a2a45)` (L2) | 위 동일 패턴 | §6 신규 |
| `linear-gradient(135deg, #555560, #2a2a35)` (L1) | 위 동일 패턴 | §6 신규 |
| shadow 부재 | 카드는 평면 — shadows 적용 없음 (keyscreen verbatim) | OK |
| `padding 4px 9px` chip | `style={{ paddingVertical: 4, paddingHorizontal: 9 }}` | TemplatePill |
| `padding 3px 9px` chip | `style={{ paddingVertical: 3, paddingHorizontal: 9 }}` | Aroma chip |
| `padding 3px 10px` chip | `style={{ paddingVertical: 3, paddingHorizontal: 10 }}` | Fault chip |
| `padding 6px 0` row | `style={{ paddingVertical: 6 }}` | Row |

### 3-4. 레이아웃 패턴

| 키스크린 | 우리 RN | 비고 |
|---|---|---|
| `display: 'grid', gridTemplateColumns: 'repeat(N, 1fr)', gap: 6` | `<View className="flex-row gap-1.5">` + each child `flex 1` (`className="flex-1"`) | RN no grid — flex-row 대체 (§8 D2) |
| `display: 'flex', gap: X` | `<View className="flex-row gap-X">` 또는 column | |
| `display: 'flex', flexDirection: 'column', gap: 10` | `<View className="gap-2.5">` (default column) | |
| `flexWrap: 'wrap'` | `className="flex-wrap"` | |
| `display: 'inline-flex'` | RN 부재 — `flex-row` + container width hug | RN deviation (§8 D4) |
| `justifyContent: 'space-between'` | `className="justify-between"` | |
| `alignItems: 'baseline'` | `className="items-baseline"` — RN no `baseline` align in some versions → `items-center` fallback | (§8 D5) |
| `textAlign: 'center'` (block) | View `items-center` (또는 children Text `text-center`) | |
| `flexShrink: 0` | `className="shrink-0"` | |
| `minWidth: 0` (flex shrink 허용) | inline `{ minWidth: 0 }` | RN Text 자체 ellipsis용 |

---

## 4. 디자인 토큰 (lib/design-tokens.ts only)

> **원칙**: 키스크린 inline hex/raw rgba는 모두 `src/lib/design-tokens.ts`로 끌어옴. 신규 필요 토큰은 §6에 별도 명시.

### 4-1. 재사용 토큰 (이미 존재)

| 키스크린 표현 | 우리 토큰 |
|---|---|
| `var(--color-cream)` | `brand.cream` (다크) / `light.text.primary` (라이트) — NW: `text-cream` / `text-text-primary` |
| `var(--color-gold)` | `brand.gold` — NW: `text-gold`, `border-gold` |
| `var(--color-text-secondary)` | `dark.text.secondary` / `light.text.secondary` — NW: `text-text-secondary` (양쪽 명시) |
| `var(--color-text-muted)` | `dark.text.muted` / `light.text.muted` — NW: `text-text-muted` |
| `var(--color-surface)` | `dark.bg.surface` / `light.bg.surface` — NW: `bg-surface` |
| `var(--color-bg-sunken)` | `dark.bg.sunken` / `light.bg.sunken` — NW: `bg-bg-sunken` |
| `var(--color-bg-deepest)` | `dark.bg.deepest` / `light.bg.deepest` — NW: `bg-bg-deepest` |
| `var(--color-border-default)` | `dark.border.default` / `light.border.default` — NW: `border-border-default` |
| `var(--color-wine-red)` | `brand.wineRed` — NW: `border-wine-red` |
| `var(--color-wine-red-hover)` | `brand.wineRedHover` — inline 사용 |
| `#1a0a1e` (bottle thumb gradient end) | `dark.bg.bottleShelf` — 양쪽 모드 동일 (keyscreen verbatim, "와인병의 어두운 분위기" 의도 보존) |
| `rgba(201,168,76,0.18)` (bottle thumb border) | `withAlpha(brand.gold, 0.18)` — 헬퍼 활용 |
| `rgba(201,168,76,0.30)` (avatar border) | `withAlpha(brand.gold, 0.3)` |
| `rgba(201,168,76,0.12)` (Row dashed border) | `withAlpha(brand.gold, 0.12)` |
| `rgba(139,26,42,0.18)` (Fault chip bg) | `withAlpha(brand.wineRed, 0.18)` |
| Star fill gold | `brand.gold` — `<Star fill={brand.gold} strokeWidth={0} />` |

### 4-2. typography 매핑 (기존 토큰 우선)

| 키스크린 위치 | 우리 typography 토큰 |
|---|---|
| Memo eyebrow (Inter 10 600 gold uppercase ls 1.8) | `typography.beginnerEyebrow`와 거의 동일 (11/11 ls 1.76) — **별 차이 0.04 — 재사용 권장 (§6 신규 토큰 생략)** |
| Card title (Inter 10 600 gold uppercase ls 1.8 mb 10) | Memo eyebrow 동일 — `typography.beginnerEyebrow` 재사용 |
| Wine name (Playfair 16 cream lh 1.3) | `typography.cardTitle` (16/20.8) 재사용 |
| Wine sub (Inter 12 muted) | `typography.cardMeta` (12/14.4) 재사용 |
| Author name (Playfair 14 cream) | 신규 (§6) — `noteAuthorName: Playfair 14 / 16.8` |
| Avatar 한 글자 (Playfair 13 700 cream) | 신규 (§6) — `noteAvatarLetter: Playfair 13 / 15.6 / 700` |
| TemplatePill (Inter 10 muted) | 신규 (§6) — `noteTemplatePill: Inter 10 / 12` |
| DateChip / RatingChip / PriceChip (Inter 12) | `typography.cardMeta` (12/14.4) 재사용 |
| RatingChip text (Inter 12 600 gold) | 신규 (§6) — `noteRatingChip: Inter 12 / 14.4 / 600` |
| Memo body (Playfair 14 italic cream lh 1.65) | 신규 (§6) — `noteMemoBody: Playfair 14 / 23.1 / italic` |
| DimGrid label (Inter 9 muted uppercase ls 0.36) | `typography.microLabel` (9/-/ls 0.36) 재사용 (wine-detail에서 정의됨) |
| DimGrid value (Playfair 13 cream lh 1.1) | `typography.wsetMiniDim` (13/14.3) 재사용 (wine-detail) |
| DimGrid value (Playfair 14 lh 1.1 — Beginner 4-col) | 신규 (§6) — `noteBeginnerDimValue: Playfair 14 / 15.4` |
| Row label (Inter 12 muted) | `typography.cardMeta` (12/14.4) 재사용 |
| Row value (Playfair 12 cream) | 신규 (§6) — `noteRowValue: Playfair 12 / 14.4` (Inter cardMeta size이지만 Playfair → 별도) |
| Aroma cat label (Inter 10 muted uppercase ls 0.6) | 신규 (§6) — `noteAromaCatLabel: Inter 10 / 12 / ls 0.6 / uppercase` |
| Aroma chip (Inter 11 cream) | `typography.chipLabel` (Inter 11 600 / 13.2) — keyscreen은 weight 400, **§6 신규 chipLabelRegular** |
| Fault chip (Inter 11 wine-red-hover) | 위 동일 |
| Checkpoint (Inter 12 secondary) + (Playfair 12 gold) | Row와 동일 패턴 — 재사용 |
| Flavor notes (Playfair 13 italic cream lh 1.6) | `typography.summaryText` (Playfair 13 / 19.5 / italic) 재사용 (notes-write에서 정의됨) |
| Peak note (Inter 12 italic secondary lh 1.5) | 신규 (§6) — `notePeakNote: Inter 12 / 18 / italic` |
| Would buy again (Playfair 14) | `typography.noteAuthorName` 재사용 (위와 동일 14/16.8) |

---

## 5. 데이터 의존 (tasting_notes + jsonb tasting_data shape)

### 5-1. supabase select 형태

```ts
// src/hooks/use-notes.ts (현재 RN, keep)
const { data } = await supabase
  .from('tasting_notes')
  .select('*, wine:wines_localized!inner(*)')
  .eq('id', noteId)
  .maybeSingle();
```

→ shape:

```ts
type TastingNoteDetail = {
  id: string;                                                  // uuid
  user_id: string;                                             // uuid — UI 노출 금지 (§4-5)
  wine_lwin: string;                                           // FK wines_localized.lwin
  rating: number | null;                                       // DECIMAL(3,1) — 0~5 half-step
  tasted_at: string;                                           // YYYY-MM-DD
  mode: 'beginner' | 'expert';
  beginner_fields: BeginnerFields | null;                      // jsonb
  expert_fields: ExpertFields | null;                          // jsonb
  created_at: string;
  updated_at: string;
  wine: WineLocalizedRow | null;                               // join
};
```

### 5-2. jsonb shape — 현재 RN (Day 6 hardening 완료)

```ts
// src/components/notes/beginner-form.tsx
export interface BeginnerFields {
  impression: 'star' | 'smile' | 'thinking' | null;
  palate: {
    sweetness: 'sweet' | 'medium' | 'dry' | null;
    acidity: 'high' | 'medium' | 'low' | null;
    body: 'full' | 'medium' | 'light' | null;
    tannin: 'high' | 'medium' | 'low' | null;
    bubble: 'sparkling' | 'still' | null;
  };
  aromas: string[];                                            // 신규 (notes.beginner.aromaCard.${tag})
  finish: 'short' | 'medium' | 'long' | null;
  memo: string;                                                // single locale (current locale at write time)
}

// src/components/notes/expert-form.tsx
export interface ExpertFields {
  appearance: { intensity: number; clarity: number; notes: string };       // intensity 1~5, clarity 1~3
  nose:       { intensity: number; development: number; aromas: string };  // intensity 1~5, development 1~3
  palate: {
    sweetness: number; acidity: number; tannin: number; alcohol: number;
    body: number; flavor: number; finish: number;                          // 모두 1~5
  };
  conclusions: {
    quality: number;                                                       // 1~5
    readiness: 'tooYoung' | 'drink' | 'pastPeak';
    estimated_price_krw?: number;
  };
  blind?: boolean;                                                          // 블라인드 시음 여부
}
```

### 5-3. wine join shape (read)

```ts
type WineLocalizedRow = {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  bottle_color: string | null;
  type_canonical: 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert' | null;
  vintage: number | null;
  region_name: string | null;
  region_name_ko: string | null;
  country_name: string | null;
  country_name_ko: string | null;
  producer_name: string | null;
  producer_name_ko: string | null;
  // ... (전체 view fields)
};
```

→ §2-2 WineHeaderLink Sub line은 locale-aware:
```ts
const region = locale === 'ko' ? (wine.region_name_ko ?? wine.region_name) : wine.region_name;
const country = locale === 'ko' ? (wine.country_name_ko ?? wine.country_name) : wine.country_name;
const parts = [wine.vintage, region, country].filter(Boolean);
const sub = parts.join(' · ');
```

### 5-4. RLS 정책 (v0.1.0)

- select: `user_id = auth.uid()` — mine only (현재 RN 동작 일치)
- shared notes (`tasting_notes.is_public` 컬럼) — **v0.2.0 SCOPE-OUT** (§10 D1)
- delete: `user_id = auth.uid()` — 현재 RN onDelete 동작

---

## 6. 신규 디자인 토큰 (별도 P0 추가 필요)

> **모두 `src/lib/design-tokens.ts`에 추가**. 사용자 확인 후 infra-architect P0 세션에서 일괄 적용.

### 6-1. 신규 typography 토큰 (8개)

```ts
// src/lib/design-tokens.ts — typography 객체에 추가

// notes-detail retroactive (design-spec notes-detail.md §4-2)
//
// keyscreen page.tsx verbatim — author/avatar/chip/memo/dim/row 위계.
// 기존 토큰 재사용 우선이지만 8개는 새 위계라 별도.

noteAuthorName:        { family: 'PlayfairDisplay_400Regular', size: 14, lineHeight: 16.8 },
noteAvatarLetter:      { family: 'PlayfairDisplay_700Bold',    size: 13, lineHeight: 15.6 },
noteTemplatePill:      { family: 'Inter_400Regular',           size: 10, lineHeight: 12 },
noteRatingChip:        { family: 'Inter_600SemiBold',          size: 12, lineHeight: 14.4 },
noteMemoBody:          { family: 'PlayfairDisplay_400Regular', size: 14, lineHeight: 23.1, fontStyle: 'italic' as const },
noteBeginnerDimValue:  { family: 'PlayfairDisplay_400Regular', size: 14, lineHeight: 15.4 },
noteRowValue:          { family: 'PlayfairDisplay_400Regular', size: 12, lineHeight: 14.4 },
noteAromaCatLabel:     { family: 'Inter_400Regular',           size: 10, lineHeight: 12, letterSpacing: 0.6, textTransform: 'uppercase' as const },
notePeakNote:          { family: 'Inter_400Regular',           size: 12, lineHeight: 18, fontStyle: 'italic' as const },
chipLabelRegular:      { family: 'Inter_400Regular',           size: 11, lineHeight: 13.2 },  // Aroma chip / Fault chip
```

### 6-2. 신규 gradient factory (2개)

```ts
// src/lib/design-tokens.ts — 새 export

// (1) notes-detail bottle thumb gradient — 44×64 thumb 용 (160deg, bottleColor → #1a0a1e 70%)
//
// keyscreen page.tsx line 194 verbatim. cellarDetailHeroGradient와 동일한 angle/end (70%) 이지만,
// 호출처가 다르고 의미 명확성을 위해 별도 factory (또는 cellarDetail 재사용도 가능 — §10 결정).
//
// dark.bg.bottleShelf는 양쪽 모드 모두 #1a0a1e (라이트 모드 분기 없음 — keyscreen 의도 보존).
export function notesDetailBottleThumbGradient(bottleColor: string) {
  return {
    colors: [bottleColor, dark.bg.bottleShelf] as readonly string[],
    locations: [0, 0.7] as readonly number[],
    start: { x: 0, y: 0 },
    end:   { x: 0.342, y: 0.94 },
  };
}

// (2) note author avatar gradient — 32×32 avatar, level L1~L5별 135deg gradient
//
// keyscreen page.tsx line 381~389 levelGradient() verbatim 포팅.
// home AppHeader LevelChip avatar(gradients.levelChip)와 다른 색조 — 더 깊은 차색 (L4: gold→deep navy/black).
// 별도 토큰 그룹 — gradients.levelChip와 의도적으로 분리.
export const noteAuthorAvatarGradient = {
  L1: { colors: ['#555560', '#2a2a35'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  L2: { colors: ['#4a6fa5', '#1a2a45'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  L3: { colors: ['#b8b8c0', '#3a3a48'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  L4: { colors: [brand.gold,  '#0F0718'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  L5: { colors: [brand.wineRed, '#3a0810'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
} as const;
```

> v0.1.0 mine only인 동안 avatar 색은 `noteAuthorAvatarGradient.L${user.level_id}` — `profiles.level_id` 컬럼 부재 시 fallback **L1** (keyscreen 1번 = base). §10 D3.

### 6-3. radius (재사용 — 신규 없음)

- 6, 14, 999 모두 이미 `radius.md / radius[14] / radius.full`에 존재.

### 6-4. spacing (재사용 — 신규 없음)

- 4, 6, 8, 10, 12, 14, 16, 20, 40 모두 기존 scale.

### 6-5. 색 alpha (재사용 — 신규 없음)

- `withAlpha(brand.gold, 0.18)`, `withAlpha(brand.gold, 0.30)`, `withAlpha(brand.gold, 0.12)`, `withAlpha(brand.wineRed, 0.18)` 모두 헬퍼 호출.

**총 신규 토큰 수**: **typography 10개 + gradient 2개 (factory 1 + group 1) = 12개**.

---

## 7. i18n 키 (ko/en)

> **원칙**: 키스크린은 JSX 인라인 분기. 우리 RN은 i18next 키로 표준화. 신규 키는 `src/lib/i18n/{ko,en}.json` `notes.detail.*` 네임스페이스 확장.

### 7-1. 기존 키 (이미 정의됨 — keep)

| 키 | ko | en |
|---|---|---|
| `notes.detail.title` | "테이스팅 노트" | "Tasting note" |
| `notes.detail.notFound.title` | "노트를 찾을 수 없어요" | "Note not found" |
| `notes.detail.notFound.description` | "삭제되었거나 잘못된 주소일 수 있습니다." | "It may have been deleted or the link is invalid." |
| `notes.detail.notFound.back` | "뒤로 가기" | "Go back" |
| `notes.detail.sectionAroma` | "느낀 향" | "Aromas noted" |
| `notes.detail.sectionComment` | "코멘트" | "Comment" |
| `notes.detail.viewWine` | "이 와인 보기" | "View this wine" |
| `notes.detail.delete` | "삭제" | "Delete" |
| `notes.detail.deleteConfirmTitle` | "이 노트를 삭제할까요?" | "Delete this note?" |
| `notes.detail.deleteConfirmDesc` | "되돌릴 수 없습니다." | "This action cannot be undone." |
| `notes.detail.deleteCancel` | "취소" | "Cancel" |
| `notes.detail.deleteConfirm` | "삭제" | "Delete" |
| `notes.detail.deleteFailed` | "삭제하지 못했어요. 다시 시도해주세요." | "Could not delete. Please try again." |
| `notes.detail.blindBadge` | "블라인드 시음" | "Blind tasted" |
| `notes.detail.modeBeginnerBadge` | "입문자" | "Beginner" |
| `notes.detail.modeExpertBadge` | "전문가" | "Expert" |
| `notes.detail.noComment` | "코멘트 없음" | "No comment" |
| `notes.detail.noAroma` | "선택된 향 없음" | "No aromas selected" |

### 7-2. 신규 키 (P0 i18n 확장 필요 — 14개)

| 키 | ko | en | 위치 |
|---|---|---|---|
| `notes.detail.sectionMemo` | "메모" | "Memo" | §2-4 MemoCard eyebrow |
| `notes.detail.sectionPalateBeginner` | "맛 균형" | "Palate" | §2-5A DimensionsBeginner eyebrow |
| `notes.detail.sectionWset` | "WSET 차원" | "WSET dimensions" | §2-5B Card |
| `notes.detail.sectionStructure` | "구조" | "Structure" | §2-5B Card |
| `notes.detail.sectionMouthfeel` | "여운·온도" | "Mouthfeel" | §2-5B Card |
| `notes.detail.sectionFlavorNotes` | "풍미 노트" | "Flavor notes" | §2-5B Card |
| `notes.detail.sectionAromaWheel` | "아로마" | "Aroma" | §2-5B Card |
| `notes.detail.sectionTimeline` | "오프닝 타임라인" | "Opening timeline" | §2-5B Card |
| `notes.detail.sectionDrinkWindow` | "음용 적기 추정" | "Drinking window estimate" | §2-5B Card |
| `notes.detail.sectionFaults` | "감지된 결함" | "Faults detected" | §2-5B Card |
| `notes.detail.sectionBuyAgain` | "재구매 의향" | "Would buy again" | §2-5B Card |
| `notes.detail.checkpoints` | "체크포인트" | "Checkpoints" | Timeline list label |
| `notes.detail.you` | "나" | "Me" | mine note 작성자명 fallback |
| `notes.detail.editAria` | "수정" | "Edit" | EditBtn accessibilityLabel |
| `notes.detail.shareAria` | "공유" | "Share" | ShareBtn accessibilityLabel |
| `notes.detail.deleteAria` | "삭제" | "Delete" | DeleteBtn accessibilityLabel (alt: 기존 `notes.detail.delete` 재사용) |

> **wsetShort scale 라벨** — keyscreen 인라인. 현재 RN의 WSETReadOnly는 dot bar 시각화로 별도 라벨 없음 (number value/max만 표시). keyscreen verbatim 라벨화 retroactive는 §10 E5 — 1~5 scale을 low/mediumMinus/medium/mediumPlus/high 단어로 표시. 도입 시 신규 키 5개 (`notes.detail.wsetScale.low` 등).

> **AROMA_LEXICON / FAULTS / FINISH_LENGTH / TANNIN_TEXTURE 라벨** — keyscreen은 `tasting-note-lexicon.ts`에 ko/en 양쪽 정의. RN ExpertFields shape에 해당 필드 없음 (v0.1.0 SCOPE-OUT, §5-2). v0.2.0 도입 시 `notes.detail.aroma.{categoryId}` / `notes.detail.aroma.{termId}` / `notes.detail.fault.{id}` / `notes.detail.finishLength.{id}` 등 일괄 추가 (§10 D2).

---

## 8. RN deviation 사유

| ID | keyscreen 표기 | RN 대체 | 사유 |
|---|---|---|---|
| D1 | `<Link href={...}>` Author profile / WineHeader navigation | `<Pressable onPress={() => router.push(...)}>` + `pressed feedback opacity 0.7` | Next.js Link → expo-router. Pressable는 hover 부재 — pressed state 시각 피드백 권장 |
| D2 | `display: 'grid', gridTemplateColumns: 'repeat(N, 1fr)', gap: 6` | `<View className="flex-row gap-1.5">` + 각 자식 `flex: 1` | RN no CSS Grid. 단순 N-column equal-width는 flex-row + flex:1로 동등 |
| D3 | `borderTop: '1px dashed rgba(201,168,76,0.12)'` (Row 구분선) | `<View style={{ borderTopWidth: 1, borderTopColor: withAlpha(brand.gold, 0.12), borderStyle: 'dashed' }} />` | iOS `borderStyle: 'dashed'` 일부 케이스 렌더 불안정 (Pressable 내부 등). **fallback**: `borderStyle: 'solid'` + `opacity 0.6` 또는 dotted dash effect 미구현 시 solid 0.12 |
| D4 | `display: 'inline-flex'` (chip) | `<View className="flex-row items-center self-start" />` | RN no `inline-flex` — 부모 row 컨테이너에서 `flex-wrap` + 자식 `self-start` 으로 hug width |
| D5 | `alignItems: 'baseline'` (Row label↔value) | `<View className="flex-row items-end">` 또는 `items-center` | RN `items-baseline` 일부 버전 부재 — 시각 차이 미미하므로 `items-center` 권장 |
| D6 | `linear-gradient(160deg, ${bottleColor} 0%, #1a0a1e 70%)` | `<LinearGradient colors={[bottleColor, dark.bg.bottleShelf]} start={{x:0,y:0}} end={{x:0.342,y:0.94}} locations={[0,0.7]} />` | CSS gradient → `expo-linear-gradient`. 160deg = atan2 변환 |
| D7 | `objectFit: 'cover'` (`<img />`) | `<Image resizeMode="cover" />` | RN Image prop 매핑 |
| D8 | `text-decoration: none` (`<Link />`) | RN 기본값 — 명시 불필요 | OK |
| D9 | `cursor: 'pointer'` | RN 부재 — `<Pressable>` 자체로 의도 표현 | OK |
| D10 | `aria-hidden`, `aria-label` | `accessibilityElementsHidden={true}`, `accessibilityLabel="..."`, `accessibilityRole="button"` | RN a11y prop 매핑 |
| D11 | `LocaleText value={wine.region}` (자식 component, ko/en 자동) | RN 부재 — caller에서 `getLocalizedField(locale, { ko, en })` 호출 후 string 전달 | 우리는 already inline (`name_ko ?? display_name`) — 동일 패턴 region/country에도 적용 |

---

## 9. 인터랙션 & 접근성

### 9-1. 인터랙션

| 요소 | gesture | 결과 |
|---|---|---|
| BackBtn | tap | `router.back()` (BackHeader 표준) |
| EditBtn (mine only) | tap | `router.push('/notes/new/write?from=newEntry&wineId=${wine.lwin}&edit=1&templateId=${mode === 'expert' ? 'builtin-expert' : 'builtin-beginner'}')` |
| DeleteBtn (mine only) | tap | `Alert.alert(t('notes.detail.deleteConfirmTitle'), t('notes.detail.deleteConfirmDesc'), [cancel, destructive→deleteNote(id) → router.back()])` |
| ShareBtn | tap | **v0.1.0 STUB** — noop 또는 ToastHint "곧 추가됩니다 / Coming soon"; v0.2.0 native Share API |
| WineHeaderLink | tap | `router.push('/wine/${encodeURIComponent(wine.lwin)}')` — pressed opacity 0.7 |
| AuthorName | tap | **v0.1.0 STUB** — noop (mine only, profile 화면 v0.2.0). 기존 RN에서는 비활성 권장. |
| TemplatePill | tap | 비활성 (display only) |
| BlindChip | tap | 비활성 (display only) |
| Memo / DimGrid cells | tap | 비활성 (display only) |
| Aroma chip | tap | 비활성 (display only) |
| Fault chip | tap | 비활성 (display only) |
| ScrollView | scroll | 표준 — `keyboardShouldPersistTaps="handled"` 불필요 (입력 없음) |

### 9-2. 접근성

| 요소 | accessibilityRole | accessibilityLabel | 비고 |
|---|---|---|---|
| BackBtn | `button` | `t('common.back')` ("뒤로" / "Back") | BackHeader 표준 |
| EditBtn | `button` | `t('notes.detail.editAria')` ("수정" / "Edit") | hitSlop 10 |
| DeleteBtn | `button` | `t('notes.detail.delete')` ("삭제" / "Delete") | hitSlop 10 — destructive 의미는 Alert에서 |
| ShareBtn | `button` | `t('notes.detail.shareAria')` ("공유" / "Share") | hitSlop 10 |
| WineHeaderLink | `button` (or `link`) | `${wineName}` + "이 와인 보기 / View this wine" 결합 또는 두 라벨 | clear tap target |
| BottleThumb (image) | none | `accessibilityElementsHidden={true}` | aria-hidden — alt 비어있음 |
| AuthorAvatar | none | `accessibilityElementsHidden={true}` | letter is decorative — 옆 이름이 본문 |
| AuthorName | `text` | `${name}` | (link 비활성 시) |
| DateChip / RatingChip | `text` | `${date}` / `${rating}/100` | 의미 자체가 본문 |
| RatingChip + StarIcon | `text` | rating value 자체로 충분 — icon은 deco | |
| TemplatePill | `text` | label | |
| BlindChip | `text` | label | |
| Memo body | `text` | text content | |
| DimGrid item | `text` (group) | `${label}: ${value}` 결합 권장 | label + value 한 번에 읽히도록 |
| Aroma chip / Fault chip | `text` | chip label | |
| Card eyebrow | `header` (level 2) | label | TalkBack/VoiceOver 위계 도움 |
| Card body | `text` (default) | | |
| ScrollView | none | — | 표준 |
| ColorContrast | — | text-cream on bg-deepest (다크) ≥ 7:1; gold on bg-deepest ≥ 4.5:1 — WCAG AA / **light 모드**: text-primary on bg-deepest 8.9:1 | design-reviewer S3 게이트 |

---

## 10. Escalation / 미해결 결정

### 10-1. v0.2.0 SCOPE-OUT (Note as-is)

| ID | 항목 | 사유 |
|---|---|---|
| D1 | 공유 노트 (shared notes) — `sn-` prefix / `tasting_notes.is_public` 컬럼 / 외부 작성자 표시 / RLS select 정책 확장 | v0.1.0은 mine only. supabase 마이그레이션 + RLS + UI feed 별도 epic |
| D2 | Expert Card 풀 트리 (bubbles / aromaWheel / faults / wouldBuyAgain / evolution timeline / peakEstimate) | 현재 RN ExpertFields는 WSET 4-section 구조 — 키스크린 풀 트리 도입은 jsonb schema 확장 + 작성 폼 확장 (Expert 6 step → 12+ step) |
| D3 | `profiles.level_id` 컬럼 부재 — `noteAuthorAvatarGradient.L${level}` fallback L1 | XP/level 시스템 v0.2.0 도입 |

### 10-2. v0.1.0 retroactive 결정 필요 (escalation)

| ID | 항목 | 옵션 | 권장 |
|---|---|---|---|
| E1 | WineHero 88×290 → 컴팩트 44×64 thumb 교체 | (a) 교체 (keyscreen verbatim) / (b) 유지 (현재 RN) | **(a) 교체** — 노트 상세는 노트 본문이 주제이며 와인은 보조. 헤더 컴팩트가 정보 위계 정합. retroactive 변경 권장 |
| E2 | rating 표시 단위 | (a) `${rating100}/100` (keyscreen verbatim) / (b) `<StarRatingReadOnly value={0~5}/>` (현재 RN) | **(b) 유지** — 별 5개 visual은 직관적이고 작성 UI(StarRating)와 일관. AuthorMetaCard Row2의 RatingChip에는 `${value}/5` 텍스트도 함께 (혼합) |
| E3 | MemoCard 위치 | (a) Dimensions 위 (keyscreen verbatim) / (b) NoteBodyBeginner 내부 Comment Section (현재 RN) | **(a) 위로 끌어올림** — 메모가 mode 무관 공통 콘텐츠. Body 컴포넌트에서 memo 제거, Detail 화면 직접 렌더 |
| E4 | expert memo 필드 — 현재 RN ExpertFields 미보유 | (a) ExpertFields에 `memo: string` 추가 / (b) Memo 카드는 beginner만 / (c) `appearance.notes` 등을 memo로 재활용 | **(a) 추가** — 마이그레이션 부재 (jsonb이라 가능). expert-form에 memo textarea 추가 + Detail은 mode 무관 표시. notes-write 사양 재확인 후 결정 |
| E5 | WSET scale 라벨 (1~5 number → low/medium/high 단어) | (a) keyscreen verbatim (단어 라벨 + `${dim}/5` 병기) / (b) 현재 RN dot bar 유지 (`${value}/${max}` only) | **(b) 유지** — dot bar는 시각적으로 강력. 라벨 추가는 i18n 키 5개 + 시각 노이즈. 단, DimGrid 5-col에서는 wsetShort 단어 그대로 (keyscreen verbatim) — §2-5B  |
| E6 | bottle thumb gradient end 색 — light 모드 분기 여부 | (a) `dark.bg.bottleShelf` 양쪽 고정 (keyscreen verbatim) / (b) `light.bg.bottleShelf` (= `#FFFFFF`) light 분기 | **(a) 양쪽 고정** — 작은 44×64 썸네일에서 라이트 화이트 끝색은 와인 분위기 깨짐. keyscreen 의도 보존 (어두운 와인병) |
| E7 | Share 버튼 v0.1.0 동작 | (a) 노출 + stub (Toast hint) / (b) 미노출 (v0.2.0에 도입) | **(b) 미노출** — 현재 RN 그대로. UI affordance 부재가 명료. v0.2.0에 native Share API 도입 |
| E8 | DimensionsExpert 4-section (WSET-style) vs 10-card (keyscreen) | (a) 4-section (현재 RN) / (b) 10-card (keyscreen, 단 RN shape 미보유 5장 SCOPE-OUT) | **(a) 4-section 유지** — 작성 폼이 4-section. Detail에서 다른 구조 노출은 일관성 깨짐. keyscreen-style 10-card는 v0.2.0 schema 확장 후 |

---

## 11. State variants

### 11-1. default (mine + expert, dark)

`useNote(id)` 정상 응답, `note.mode === 'expert'`, `expertFields` 모든 필드 채워짐.

```
WineHeaderLink (BottleThumb gradient + name + meta)
AuthorMetaCard (gold border, avatar L? + Me + ExpertPill / Date · 92/100 ·  Blind)
MemoCard (Memo eyebrow + Playfair italic 본문)
DimensionsExpert 4-card (Appearance / Nose / Palate / Conclusions)
```

### 11-2. default (mine + beginner, dark)

```
WineHeaderLink
AuthorMetaCard (gold border, avatar L? + Me + BeginnerPill / Date · 4.5/5)
MemoCard
DimensionsBeginner (Palate 4-col + Aroma chips + Comment Section은 §10 E3 (a) 채택 시 제거)
```

### 11-3. loading

```
View (flex-1, bg-bg-deepest)
  BackHeader (title placeholder = t('notes.detail.title'))
  Skeleton blocks:
    - WineHeaderLink skeleton (BottleThumb 44×64 grey + 2 lines)
    - AuthorMetaCard skeleton (avatar 32 + 1 line + chip row)
    - MemoCard skeleton (3 lines)
    - DimGrid skeleton (4~5 cells)
  또는 단순 <ActivityIndicator color={brand.gold} /> centered (현재 RN — keep, 빠른 응답이라 OK)
```

→ **권장**: 현재 RN 패턴 (ActivityIndicator) 유지 — Skeleton은 visual cost 대비 이득 적음.

### 11-4. not found

```
View (flex-1, bg-bg-deepest)
  BackHeader (title)
  View (flex-1 items-center justify-center px-6)
    AlertCircle 48 stroke 1.5 gold (mb 4)
    EmptyState
      title: t('notes.detail.notFound.title')
      description: t('notes.detail.notFound.description')
      action: PrimaryButton size="md" variant="secondary"
        label: t('notes.detail.notFound.back')
        onPress: router.back()
```

→ 현재 RN 동작 일치 — keep.

### 11-5. error (deleteNote 실패)

```
ScrollView 영역 유지 + Toast overlay (bottom 6, left/right 4)
  message: t('notes.detail.deleteFailed')
  tone: 'error'
  duration: 2500ms
```

→ 현재 RN 동작 일치 — keep.

### 11-6. dark / light

§3-2 색 토큰표 모두 dual 정의. 라이트 모드 검증 (§4-9):
- `bg-bg-deepest`: dark #251837 / light #FAF5EC
- `bg-surface`: dark #3D2A4A / light #FFFFFF
- `bg-bg-sunken`: dark rgba(0,0,0,0.28) / light rgba(42,26,20,0.06)
- `text-cream` → text-primary: dark #F8F4ED / light #2A1A14 (라이트는 다크 와인 브라운)
- `border-border-default`: dark #5A3D6A / light #E0D2BC
- `border-gold` (AuthorMetaCard): #C9A84C 양쪽 동일 (브랜드 고정)
- AuthorAvatar gradient L1~L5: **양쪽 모드 동일** — 라이트에서도 어두운 그라데이션 (keyscreen verbatim)
- BottleThumb gradient: **양쪽 모드 동일** (#1a0a1e 끝색 — §10 E6)
- Star fill / RatingChip text: brand.gold #C9A84C 양쪽 동일

검증 절차: Expo dev에서 시스템 테마 토글 → 화면 stress test (긴 메모 / 메모 비어있음 / mode beginner-expert 전환 / 빈티지 null / 라이트 모드에서 카드 가독성).

### 11-7. mine vs shared (v0.1.0 mine only)

v0.1.0은 **mine 전용** — `note.user_id === auth.uid()` 만 select 가능 (RLS). Shared 노트 분기 (`sn-` prefix) 및 EditBtn 숨김 분기는 v0.2.0 (§10 D1).

---

## 12. 현재 구현 차이 (retroactive)

기존 코드: `app/notes/[noteId].tsx` (212 LOC) + `src/components/notes/note-body-{beginner,expert}.tsx` (Day 5 1차 + Day 6 일부)

| 항목 | 키스크린 원본 | 현재 RN 구현 | 수정 필요 |
|---|---|---|---|
| Wine header | 44×64 thumb + name + region 한 줄 (`<Link>`) | `<WineHero />` 88×290 큰 hero | **§10 E1 (a) 채택 시 교체** — WineHero 제거, 컴팩트 BottleThumb 카드 추가 |
| Wine header link | 단일 Pressable 헤더 → /wine/${lwin} | 별도 하단 "이 와인 보기" CTA (ChevronRight) | 통합 권장 — 헤더 자체가 link |
| AuthorMetaCard | gold border 카드 + avatar + name + chip row + meta row | 없음 (date+pill만 표시) | **신규 컴포넌트 추가** — `<NoteAuthorCard />` (avatar + name "Me" / display name + TemplatePill + DateChip + RatingChip + BlindChip) |
| AuthorAvatar | 32×32 gradient L1~L5 + 한 글자 letter | 없음 | **신규** — `noteAuthorAvatarGradient` 토큰 + Playfair 13 700 cream letter |
| MemoCard 위치 | mode 무관 공통 (Dimensions 위) | NoteBodyBeginner 내부 Comment Section | **§10 E3 (a) 채택 시 위로 끌어올림** — Detail 화면 직접 렌더, Body 컴포넌트에서 memo 제거 |
| MemoCard 스타일 | bg-sunken, border default, Playfair italic 14 lh 1.65 cream | bg-surface (현재 RN), Inter 13 text-primary | **수정**: bg-sunken + Playfair italic + lh 1.65 |
| Memo eyebrow | "메모" / "Memo" — Inter 10 600 gold uppercase ls 1.8 | "Comment" — Inter 14 600 secondary uppercase (section-title) | **수정**: 폰트 크기 10 + ls 1.8 + i18n key 변경 (sectionMemo) |
| DimensionsBeginner | Playfair 14 cream `${v}/5` cell 4-col | WSETReadOnly dot bar (gold 1~5 채움) | **§10 E5 (b) 권장 유지** — dot bar visual 더 강력. **단** Beginner palate는 categorical (sweet/medium/dry) — DimGrid 표시 어려움. 현재 패턴 (Inter row "Sweetness · 단맛") 유지. **수정 0** |
| DimensionsExpert | 10 Card (WSET / Structure / Mouthfeel / Aroma / Timeline / DrinkWindow / Faults / Bubbles / FlavorNotes / BuyAgain) | 4 Section (Appearance / Nose / Palate / Conclusions) | **§10 E8 (a) 4-section 유지** — Detail 구조가 작성 폼과 정합. **수정 0** (v0.2.0 schema 확장 시 keyscreen verbatim 도입 검토) |
| Card eyebrow | Inter 10 600 gold uppercase ls 1.8 | "GOLD" Inter 14 600 (section-title) | **수정**: 10 + ls 1.8 |
| Section bg | bg-surface | bg-surface | OK |
| Edit Btn | Pencil 18 text-secondary | 없음 | **신규** — Pencil 18 + onPress router.push edit query |
| Delete Btn | 없음 (keyscreen) | Trash2 20 wine-red + Alert confirm | **keep** — 데이터 안전성 (RN 표준) |
| Share Btn | Share2 18 text-secondary (stub) | 없음 | **§10 E7 (b) 권장 유지** — v0.2.0 도입 |
| Right slot order | Edit + Share | Delete only | **수정 (E1+E7 채택)**: Edit + Delete (Share 제외) |
| WineNameDisplay | <LocaleText /> ko/en 분기 | `<WineNameDisplay size="card" />` 기존 utility | **keep** — size="card"는 Playfair 16 lh 1.3 cream 정합 (§4-2) |
| Color: cream | `--color-cream` (다크 #F8F4ED) | `text-cream` 또는 `text-text-primary` | dual 명시 — light에서 자동 #2A1A14 |
| BottleThumb gradient | linear-gradient 160deg → #1a0a1e | 부재 (현재 WineHero) | **신규** — `notesDetailBottleThumbGradient(bottleColor)` 토큰 + LinearGradient |
| 메모 비어있을 때 | LocaleText "" (텍스트 없음) | `t('notes.detail.noComment')` ("코멘트 없음") | **유지** — fallback 명시가 더 친절 |

---

## 13. 출력 산출물 체크리스트 (rn-screen-builder 수신용)

- [ ] `app/notes/[noteId].tsx` 다음 항목 수정:
  - [ ] `<WineHero />` 제거 → `<NoteWineHeaderLink />` 신규 컴포넌트 추가 (BottleThumb 44×64 + name + meta)
  - [ ] `<NoteAuthorCard />` 신규 컴포넌트 추가 (avatar + name + TemplatePill + DateChip + RatingChip + BlindChip)
  - [ ] `<NoteMemoCard />` 신규 컴포넌트 추가 (eyebrow + Playfair italic body) — mode 무관 공통, Body 위
  - [ ] BackHeader right slot: Edit + Delete (Share 보류, §10 E7)
  - [ ] 하단 "이 와인 보기" CTA 제거 (WineHeaderLink가 대체)
- [ ] `src/components/notes/note-body-beginner.tsx` 수정:
  - [ ] Comment Section 제거 (Memo는 §2-4가 책임)
  - [ ] Palate Section eyebrow 폰트 크기 10 + ls 1.8 (typography.beginnerEyebrow 사용)
- [ ] `src/components/notes/note-body-expert.tsx` 수정:
  - [ ] Section eyebrow 폰트 크기 10 + ls 1.8 (typography.beginnerEyebrow 사용 또는 신규 토큰)
- [ ] `src/lib/design-tokens.ts` 신규 토큰 12개 추가 (§6-1 + §6-2)
- [ ] `src/lib/i18n/{ko,en}.json` `notes.detail.*` 신규 키 14개 추가 (§7-2)
- [ ] `tailwind.config.ts` 신규 없음 (radius/spacing/color 모두 기존 토큰 재사용)
- [ ] design-reviewer 게이트 통과 후 qa-inspector로 — emoji X / 하드코딩 hex X / ko·en 양쪽 / dark·light 양쪽 검증

---

## 14. 진실 소스 참조

- 키스크린 JSX: `../winemine-keyscreen/src/app/notes/[noteId]/page.tsx` (882 LOC)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/colors.md` (line 17~71 색 매핑) + `typography.md`
- 현재 RN: `app/notes/[noteId].tsx` (212 LOC) + `src/components/notes/{note-body-beginner,note-body-expert,star-rating-readonly,wset-readonly}.tsx`
- 토큰: `src/lib/design-tokens.ts` (646 LOC)
- 훅: `src/hooks/use-notes.ts` (`useNote`, `deleteNote`)
- 스크린샷: `_workspace/keyscreen-shots/notes_noteId.png` (Expert, dark, ko)

— 끝.
