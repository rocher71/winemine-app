# /onboarding/2-language 디자인 사양

> **버전:** v1 (retroactive hardening — Day 5 기존 구현 75 LOC 갭 보강)
> **작성:** design-spec-author / Day 6
> **소비자:** rn-screen-builder (다음 게이트), design-reviewer (시각 검증)

---

## 0. 원본 소스

| 우선순위 | 자료 | 경로 |
|---|---|---|
| 1 | JSX `StepLanguage` (재귀) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 171–218 |
| 1 | JSX `ChoiceCard` (재귀, language 전용 카드 변형) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 336–394 |
| 1 | JSX root `<main>` wrapper (페이지 PageRoot — verbatim) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 47–93 |
| 2 | 산문 | (없음 — `pages/onboarding.md` 부재) |
| 2 | keyscreen i18n | `../winemine-keyscreen/messages/{ko,en}.json` 의 `onboarding.language.{title,subtitle,ko,en}` + `common.next` |
| 3 | 디자인 시스템 | `../winemine-keyscreen/docs/design-system/{colors,typography}.md` |
| 4 | 스크린샷 | `_workspace/keyscreen-shots/onboarding.png` (welcome step만 캡쳐 — language step 별도 캡쳐 없음. 키스크린 데모 첫 화면만) |
| 5 | 현재 RN 구현 | `app/onboarding/2-language.tsx` (75 LOC) |
| 5 | 인접 화면 표준 | `_workspace/design-specs/{onboarding-1-welcome, settings-language}.md`, `src/lib/design-tokens.ts`, `src/components/onboarding/welcome-glass-glow.tsx`, `src/components/settings/settings-radio-row.tsx` |

**범위 외:**
- AppHeader, BottomNav (onboarding 전 단계 모두 미사용)
- step 1 (welcome) / step 3 (experience) / step 4 (mode) — 각자 별도 사양
- settings 3 sub 화면 (별도 cycle)

---

## 1. 레이아웃 트리 (verbatim, 시각 위계 1:1)

```
SafeAreaView (edges: ['top','bottom']) ─ flex:1, bg = dark.bg.deepest / light.bg.deepest
└─ View "PageRoot"          ─ flex:1, paddingTop:32, paddingBottom:40, paddingHorizontal:24, gap:24
   │                          (키스크린 main wrapper line 49~57 verbatim — step 공통)
   │
   └─ View "StepRoot"       ─ flex:1, flexDirection:column, gap:16
      │                       (키스크린 StepLanguage line 183 verbatim)
      │                       ※ flex:1 + 마지막 자식(CtaWrapper) marginTop:auto → 상단부터 stack, CTA 하단 push
      │
      ├─ Text "Title"       ─ Playfair 28 / lineHeight 33.6 (=1.2) / cream / margin:0
      │                       i18n `onboarding.language.title`
      │                       (키스크린 line 184~191 verbatim — fontSize 28)
      │
      ├─ Text "Subtitle"    ─ Inter 14 / regular / text-muted / margin:0
      │                       i18n `onboarding.language.subtitle`
      │                       (키스크린 line 194~196 verbatim)
      │
      ├─ View "ChoiceList"  ─ flexDirection:column, gap:12, marginTop:8
      │  │                    (키스크린 line 197 verbatim — gap=12, marginTop=8)
      │  │
      │  ├─ ChoiceCard "ko" ─ active = (picked === 'ko'), title=i18n `onboarding.language.ko`, icon="KR"
      │  │                    onPress → onPick('ko') + i18n.changeLanguage('ko')
      │  │
      │  └─ ChoiceCard "en" ─ active = (picked === 'en'), title=i18n `onboarding.language.en`, icon="EN"
      │                       onPress → onPick('en') + i18n.changeLanguage('en')
      │
      └─ View "CtaWrapper"  ─ marginTop:'auto'
         │                    (키스크린 line 211 verbatim)
         └─ PrimaryButton    ─ variant=primary, size=lg, block(=full width by w-full wrapper)
                              disabled = !picked, label = i18n `common.next`
                              onPress → (1) supabase profiles.update({language:picked}) (낙관적, 실패 시 토스트)
                                        (2) router.push('/onboarding/3-experience')
```

### 1-1. ChoiceCard (language 전용 카드 — keyscreen line 336~394 verbatim)

```
Pressable                                              ─ accessibilityRole="radio"
  ├ accessibilityState={ selected: active }              accessibilityLabel = title
  ├ height:96, paddingHorizontal:18                      hitSlop:6
  ├ borderRadius:16                                      onPress, Haptics.selectionAsync()
  ├ flexDirection:row, alignItems:center, gap:14
  ├ background: surface (token, dual)
  ├ border: 1px solid (active ? brand.gold : border.default)
  ├ boxShadow: active ? '0 0 0 1px rgba(139,26,42,0.4)' : 'none'   ← RN deviation §6
  └ opacity: active ? 1 : 0.85                            ← 키스크린 verbatim
│
├─ View "IconBadge"  ─ size 44×44, borderRadius:22 (=full round)
│  │                   background = rgba(201,168,76,0.08) = withAlpha(brand.gold, 0.08)  ← 양쪽 모드 동일 (gold tint은 dark/light 자연스러움)
│  │                   alignItems:center, justifyContent:center
│  │
│  └─ Text "icon"   ─ Playfair 16 / regular / color = brand.gold
│                     literal "KR" 또는 "EN" (대문자 코드 — i18n 키 아님, locale 식별자)
│
└─ Text "title"       ─ Inter 18 / weight 600 / color = text-primary (=cream dual)
                        title = i18n key (ko row="한국어" / en row="English")
```

### 1-2. 시각 비율 측정 (스크린샷 onboarding.png 기준 + 키스크린 CSS 검증)

- 디바이스 viewport 가정: 390pt × 844pt (iPhone 13/14)
- `PageRoot` 안 컨텐츠 영역(`flex:1` 차감 후): 약 772pt
- StepRoot 내부 수직 그룹 누적: Title(33.6) + 16 + Subtitle(~20) + 16(gap) + 8(marginTop) + ChoiceList(96+12+96=204) ≈ 297pt
- 잔여 영역(~475pt)이 ChoiceList ↔ CtaWrapper 사이 빈 공간 — keyscreen `marginTop:auto`가 CTA를 paddingBottom 위로 push
- CTA wrapper는 하단에서 paddingBottom:40 + button 52pt 위로 떨어진 위치

---

## 2. NativeWind v4 className 매핑표

> 기존 토큰(`src/lib/design-tokens.ts` + `tailwind.config.ts`) 최우선 사용. 신규 토큰은 §3 참조.

### 2-1. PageRoot wrapper

| 키스크린 (CSS) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `padding: '32px 24px 40px'` | `px-6` (=24) | `paddingTop: 32, paddingBottom: 40` | A+B | NW px-6만 매칭. 수직은 SafeArea insets 합산 |
| `gap: 24` | `gap-6` | — | A | NW 표준 |
| `background: var(--color-bg-deepest)` | `bg-bg-deepest` | — | A | tailwind.config.ts dual 토큰 등록됨 |
| `display:flex; flexDirection:column` | (default) | — | A | RN View default 'column' |
| `flex:1` | `flex-1` | — | A | 표준 |

### 2-2. StepRoot

| 키스크린 | NW v4 className | 분류 | 사유 |
|---|---|---|---|
| `flex:1` | `flex-1` | A | 표준 |
| `display:flex; flexDirection:column` | (default) | A | RN View default |
| `gap:16` | `gap-4` | A | 표준 |

### 2-3. Title Text

| 키스크린 (inline) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `fontFamily: var(--font-playfair)` | `font-playfair` | — | A | tailwind.config.ts fontFamily.playfair 등록 |
| `fontSize: 28` | — | `fontSize: 28` | C | NW에 28 unit 없음 — 신규 typography 토큰 `onboardingStepTitle` 추가 권장 (§3) |
| (lineHeight 미지정) | — | `lineHeight: 33.6` | — | 1.2 ratio = 28 × 1.2 = 33.6 (keyscreen wm-page-title pattern 동일 — typography.md §2) |
| `color: var(--color-cream)` | `text-text-primary dark:text-text-primary` | — | B | dual 토큰. cream(`#F5F0E8`)은 다크 primary(`#F8F4ED`)와 사실상 동일, light에서 자동 분기 |
| `margin: 0` | — | — | — | RN Text default 0 |

### 2-4. Subtitle Text

| 키스크린 | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `fontFamily: var(--font-inter)` | `font-inter` | — | A | 등록됨 |
| `fontSize: 14` | `text-card-meta`?? | — | C | `cardMeta`는 12/14.4 — 다름. `modalDesc`(14/21)는 lineHeight 너무 큼. 신규 `onboardingStepSubtitle` 토큰 추가 권장 (§3) 또는 NW arbitrary `text-[14px] leading-[20px]` |
| `color: var(--color-text-muted)` | `text-text-muted dark:text-text-muted` | — | B | dual 토큰 |
| `margin: 0` | — | — | — | default |

### 2-5. ChoiceList wrapper

| 키스크린 | NW v4 className | 분류 | 사유 |
|---|---|---|---|
| `display:flex; flexDirection:column` | (default) | A | RN default |
| `gap:12` | `gap-3` | A | 표준 |
| `marginTop:8` | `mt-2` | A | 표준 (2 = 8) |

### 2-6. ChoiceCard root Pressable

| 키스크린 (inline) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `all: unset` (button reset) | (제거) | — | D | Pressable 기본 — RN 무의미 |
| `cursor: pointer` | (제거) | — | D | RN cursor 없음 |
| `display:flex; alignItems:center; gap:14` | `flex-row items-center gap-3.5` | — | C | spacing[3.5]=14 design-tokens.ts에 등록됨 |
| `height: 96` | `h-24` | — | A | NW v4 24 × 4 = 96 |
| `padding: '0 18px'` | — | `paddingHorizontal: 18` | C | NW spacing 18 없음 (4/5=16/20 사이). inline 또는 신규 spacing 토큰. **권장**: inline (단발성) |
| `borderRadius: 16` | `rounded-2xl` | — | A | NW v4 2xl = 16 |
| `background: var(--color-surface)` | `bg-surface dark:bg-surface` | — | B | dual 토큰 |
| `border: 1px solid (active ? gold : border-default)` | — | `borderWidth:1, borderColor: active ? brand.gold : tokens.border.default` | B+D | NW의 `border` width 명시 위해 inline 권장 (settings-radio-row 동일 패턴). useThemeTokens or useColorScheme 분기 |
| `boxShadow: active ? '0 0 0 1px rgba(139,26,42,0.4)' : 'none'` | — | (deviation §6) | D | RN box-shadow API 부재. iOS shadow*/Android elevation으로 변환 불가 (outset만 가능, 1px ring inset 형태 아님). **대체**: active 시 borderWidth 2px + borderColor brand.wineRedHover (=`#A02030`) 또는 별도 wrapper View(absolute, 1px inset border, opacity 0.4)로 ring 시뮬레이션. **권장**: borderWidth 1→2px 변경 (depth 손실 적음). 자세히 §6 |
| `opacity: active ? 1 : 0.85` | — | `opacity: active ? 1 : 0.85` | A | 표준 inline |

### 2-7. IconBadge View (44×44 round)

| 키스크린 (inline) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `width: 44, height: 44` | `w-11 h-11` | — | A | spacing[11] = 44 |
| `borderRadius: 22` | `rounded-full` | — | A | 44/2 = full |
| `background: rgba(201,168,76,0.08)` | — | `backgroundColor: withAlpha(brand.gold, 0.08)` | C | 토큰화 — 신규 토큰 `goldTint08` 또는 inline helper 사용. **권장**: inline `withAlpha(brand.gold, 0.08)` (이미 capture에서 같은 alpha 사용 — `capture.aiBadgeBg.dark` 동일 hex이지만 의미 분리 위해 별도 표기) |
| `display:flex; alignItems:center; justifyContent:center` | `items-center justify-center` | — | A | 표준 |

### 2-8. IconBadge Text "KR"/"EN"

| 키스크린 (inline) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `fontFamily: var(--font-playfair)` | `font-playfair` | — | A | 등록됨 |
| `fontSize: 16` | `text-card-title` 16/20.8 또는 inline 16 | — | A | NW arbitrary 또는 cardTitle 토큰 (16) 재사용 가능 — lineHeight 차이만 미미 |
| `color: var(--color-gold)` | `text-gold` | — | A | tailwind.config.ts 등록됨 (brand 고정, dark/light 모두 `#C9A84C` — keyscreen tokens는 light에서 `#B89438`로 분기하나 우리 tailwind는 단일 `#C9A84C`. **사양 verbatim**: 단일 색 유지) |

### 2-9. title Text "한국어"/"English"

| 키스크린 (inline) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `fontFamily: var(--font-inter)` | `font-inter` | — | A | 등록됨 |
| `fontSize: 18` | — | `fontSize: 18, lineHeight: 21.6` | C | NW에 18 size 토큰 없음. 신규 `onboardingChoiceLabel` 토큰 추가 권장 (§3) — 1.2 ratio = 21.6 |
| `fontWeight: 600` | `font-inter-semibold` | — | A | 등록됨 |
| `color: var(--color-cream)` | `text-text-primary dark:text-text-primary` | — | B | dual 토큰 |

### 2-10. CtaWrapper

| 키스크린 | NW v4 className | 분류 | 사유 |
|---|---|---|---|
| `marginTop: 'auto'` | `mt-auto` | A | NW v4 지원 |

### 2-11. PrimaryButton (block, lg, primary)

기존 컴포넌트 `src/components/shared/primary-button.tsx` 그대로 사용. block 동작은 부모 wrapper의 `w-full` (또는 mt-auto만으로 기본 stretch). Pressable은 flex 자식이라 wrapper에 `w-full` 명시 권장.

- `variant="primary"` → bg `wine-red` active `wine-red-hover`, text cream, scale 0.97 + Haptics light
- `size="lg"` → h 52, text 15px Inter 600
- `disabled` → opacity 0.5 (`!picked` 시)
- label = `t('common.next')`

---

## 3. 디자인 토큰 (lib/design-tokens.ts + tailwind.config.ts)

### 3-1. 기존 토큰 재사용 (확장 없이 OK)

| 사용처 | 토큰 |
|---|---|
| 페이지 배경 | `bg.deepest` dual (`bg-bg-deepest`) |
| 카드 배경 | `bg.surface` dual (`bg-surface`) |
| 카드 보더 | `border.default` dual (inline 사용 — useColorScheme 분기) |
| Title/label 색 | `text.primary` dual (`text-text-primary dark:text-text-primary`) |
| Subtitle 색 | `text.muted` dual (`text-text-muted dark:text-text-muted`) |
| IconBadge bg | `withAlpha(brand.gold, 0.08)` (inline) |
| IconBadge text + 카드 active border | `brand.gold` (`text-gold` className 또는 inline brand.gold) |
| Active ring 대체 boder | `brand.wineRedHover` `#A02030` (inline — `dark.border.active` 동일값 다크 모드 / light에서는 `light.border.active=#B89438` gold 계열 — useColorScheme 분기) |
| spacing 3.5 (14) | design-tokens.ts spacing[3.5] 등록됨 |
| spacing 11 (44) | design-tokens.ts spacing[11] 등록됨 |
| rounded-2xl (16) | NW v4 기본 |
| rounded-full | NW v4 기본 |
| PrimaryButton | 기존 컴포넌트 (변경 없음) |

### 3-2. 신규 typography 토큰 — 권장 2건 (선택적, P0 세션 결정)

현재 `typography` 객체에 onboarding step의 title/subtitle 위계가 누락. 다른 step 화면(experience, mode)도 같은 위계를 사용하므로 **공유 토큰 정의 권장** — 동일 클러스터를 4개 step 모두 사용.

| 후보 토큰명 | 값 | 사용처 |
|---|---|---|
| `onboardingStepTitle` | family `PlayfairDisplay_400Regular`, size 28, lineHeight 33.6 (=1.2), letterSpacing 0 | step language/experience/mode title (welcome은 56px 워드마크 — 별도) |
| `onboardingStepSubtitle` | family `Inter_400Regular`, size 14, lineHeight 20 (=1.43) | step language/experience/mode subtitle |
| `onboardingChoiceLabel` | family `Inter_600SemiBold`, size 18, lineHeight 21.6 (=1.2) | ChoiceCard title — language ko/en row 양쪽 (experience step은 별도 ExperienceCard, 16px → 사양 분리) |

**권장:** 3개 토큰 신규 추가 (`onboardingStepTitle`, `onboardingStepSubtitle`, `onboardingChoiceLabel`). 같은 위계 다른 화면 재사용 (experience step 사양도 step title은 동일 토큰 사용 — keyscreen line 236 size 26 vs language line 187 size 28 차이 있으나 사양 분리; mode step 사양은 별도 cycle에서 확인).

**대안:** 단발 사용 가정 + NW arbitrary (`text-[28px] leading-[34px]`) — 토큰 추가 안 함. v0.1.0 시간 압박 시 이쪽 선택. **본 사양은 토큰 권장이되 inline fallback 허용** (rn-screen-builder 재량).

### 3-3. 신규 색/shadow 토큰 — **0건**

- IconBadge bg `withAlpha(brand.gold, 0.08)` — 단발성 inline. 의미명 토큰 `goldTint08` 만들 가치 미미 (capture.aiBadgeBg와 알파 일치하지만 의미 분리 — 토큰화 시 도리어 혼란).
- active ring 대체는 `border.active` 기존 토큰 재활용 — 신규 0.

---

## 4. 상태 variants

### 4-1. default (picked === null)

- ChoiceCard 둘 다 unselected 상태:
  - border 1px solid `border.default` (dark `#5A3D6A` / light `#E0D2BC`)
  - opacity 0.85
  - boxShadow none (RN 대체: borderWidth 1)
- PrimaryButton: `disabled` (opacity 0.5)
- IconBadge text "KR" / "EN" 둘 다 gold 그대로 표시 (active 무관)

### 4-2. selected — picked === 'ko' (또는 'en')

- 선택 row:
  - border 1px → **2px** solid `brand.gold` (RN deviation §6 — boxShadow ring 대체로 border 굵기 증가)
  - opacity 1
  - 별도 outer ring (View absolute) **불필요** (border 2px로 시각적 강조 충분)
- 비선택 row: unselected 그대로 (border-default, opacity 0.85)
- PrimaryButton: `disabled` 해제, 활성

### 4-3. pressed (Pressable 활성, 키스크린엔 없는 RN deviation §6)

- 카드 row: scale 0.99, opacity (active ? 0.95 : 0.80) — settings-radio-row와 일관

### 4-4. dark 모드 (기본)

| 요소 | 색 |
|---|---|
| Background (PageRoot) | `dark.bg.deepest` `#251837` |
| 카드 bg | `dark.bg.surface` `#3D2A4A` |
| 카드 border (unselected) | `dark.border.default` `#5A3D6A` |
| 카드 border (selected) | `brand.gold` `#C9A84C` |
| Title | `dark.text.primary` `#F8F4ED` |
| Subtitle | `dark.text.muted` `#CABDA8` |
| IconBadge bg | `withAlpha(brand.gold, 0.08)` (`rgba(201,168,76,0.08)`) |
| IconBadge text | `brand.gold` `#C9A84C` |
| Choice title text | `dark.text.primary` `#F8F4ED` |
| CTA bg | `brand.wineRed` `#8B1A2A` |
| CTA text | `brand.cream` `#F5F0E8` |

### 4-5. light 모드

| 요소 | 색 |
|---|---|
| Background | `light.bg.deepest` `#FAF5EC` |
| 카드 bg | `light.bg.surface` `#FFFFFF` |
| 카드 border (unselected) | `light.border.default` `#E0D2BC` |
| 카드 border (selected) | `brand.gold` `#C9A84C` (NW `border-gold` brand-fixed) |
| Title | `light.text.primary` `#2A1A14` |
| Subtitle | `light.text.muted` `#8B7766` |
| IconBadge bg | `withAlpha(brand.gold, 0.08)` 동일 (양쪽 모드 자연스러움 — capture aiBadgeBg와 동일 패턴) |
| IconBadge text | `brand.gold` `#C9A84C` (단일 — `tailwind.config.ts` `text-gold` 색은 brand 고정) |
| Choice title text | `light.text.primary` `#2A1A14` |
| CTA bg | `brand.wineRed` `#8B1A2A` (NW `bg-wine-red` brand-fixed 단일 — keyscreen tokens.css는 light에서 `#B89438` gold로 분기하나 우리 tailwind는 wine-red dual 정의 미적용 시 단일. **현재 RN tailwind config 확인 결과 wine-red 단일** — 사양 verbatim 단일 유지) |

**light 모드 대비 점검 (WCAG AA 4.5:1):**
- Title `#2A1A14` on `#FAF5EC` → 대비 16:1 (AAA 통과)
- Subtitle `#8B7766` on `#FAF5EC` → 대비 4.7:1 (AA 통과)
- Choice label `#2A1A14` on `#FFFFFF` → 대비 18.7:1 (AAA 통과)
- IconBadge text `#C9A84C` on `withAlpha(#C9A84C, 0.08)` over `#FFFFFF` 합성 → text-on-card는 사실상 gold-on-white 약 2.5:1 (**AA 미달**) — 그러나 IconBadge text는 "KR"/"EN" 보조 식별자(아이콘 대체)로, choice title text가 본 라벨. design-reviewer 시각 검증 시 라이트 모드에서 "KR"/"EN" 가독성 부족하면 §10 Q3 처리.

### 4-6. ko / en locale

| key | ko | en |
|---|---|---|
| `onboarding.language.title` | "언어를 선택해주세요" *(현재 RN)* / **keyscreen verbatim:** "언어를 선택하세요" | "Choose your language" |
| `onboarding.language.subtitle` | "언제든 설정에서 바꿀 수 있습니다" *(현재 RN)* / **keyscreen:** "이 설정은 언제든 변경 가능해요" | "You can change this any time in Settings" |
| `onboarding.language.ko` (**신규 i18n 키 — keyscreen pattern**) | "한국어" | "한국어" (자기 언어명은 양쪽 모드에서 자기 표기 유지) |
| `onboarding.language.en` (**신규 i18n 키 — keyscreen pattern**) | "English" | "English" |
| `common.next` | "다음" | "Next" (현재 RN en `common.next` 확인 필요 — keyscreen은 "Next") |

**i18n 변경 요청 (P0):**
- 현재 RN ko/en은 `language.ko`/`language.en` 키를 사용 (top-level). keyscreen은 `onboarding.language.ko`/`onboarding.language.en` (namespace 안). **본 사양은 keyscreen verbatim 채택** — 새 키 추가 (top-level `language` 키는 settings-language sub 화면에서도 사용하므로 보존).
- ko title/subtitle 문구가 현재 RN과 keyscreen 사이 미세 차이. **keyscreen verbatim 우선** — JSX의 i18n key는 동일하지만 문구가 다름. rn-screen-builder가 i18n JSON 업데이트 시 keyscreen 문구로 교체.
- en title은 양쪽 일치 ("Choose your language"). en subtitle은 keyscreen `"You can change this any time in Settings"` vs 현재 RN `"You can change this any time in Settings"` (동일). **변경 없음 — 그대로 유지.**

### 4-7. error / saving / empty

- **error**: profile update 실패 시 `<Toast tone="error" message={t('errors.onboardingSaveFailed')} />` — CTA 위에 표시. 현재 RN 패턴 그대로 유지.
- **saving** (CTA loading): PrimaryButton `loading` prop → ActivityIndicator 표시. 키스크린 미지원 — RN 추가 표준.
- **empty**: 해당 없음 (정적 화면).

---

## 5. 인터랙션

| 요소 | 트리거 | 동작 | 피드백 |
|---|---|---|---|
| ChoiceCard "ko" | onPress | `Haptics.selectionAsync()` → `onPick('ko')` (setState picked + `changeLanguage('ko')` 즉시 UI 한국어 전환) | scale 0.99, opacity dim (active/inactive별) |
| ChoiceCard "en" | onPress | `Haptics.selectionAsync()` → `onPick('en')` (setState picked + `changeLanguage('en')` 즉시 UI 영어 전환) | 동일 |
| 같은 옵션 재선택 | onPress | no-op (state 동일 — verbatim는 onChange 호출하나 RN은 React 같은 값 setState skip로 동등) | 햅틱만 |
| PrimaryButton "다음" | onPress (picked !== null) | `Haptics.impactAsync(Light)` → setSaving(true) → `supabase.from('profiles').update({ language: picked }).eq('id', uid)` → 성공 시 `router.push('/onboarding/3-experience')` / 실패 시 `setErrorMsg(t('errors.onboardingSaveFailed'))` | loading spinner, disabled 동안 인터랙션 차단 |
| swipe back gesture | (없음) | `_layout.tsx` `gestureEnabled: false` 적용됨 | step 간 뒤로 이동 차단 (welcome로 직접 가지 못함 — 의도) |
| 키보드 | (해당 없음) | TextInput 없음 | — |

### 5-1. changeLanguage 즉시 적용 사유

- 키스크린 verbatim — `onPick`이 `setLocale(v)` 직접 호출 (line 64). 사용자가 선택 즉시 title/subtitle/CTA 텍스트가 새 언어로 전환 → 직관성 + 시각 확인.
- RN: `src/lib/i18n.ts`의 `changeLanguage(next)` 호출. i18next listener가 react-i18next의 `useTranslation` 모든 컴포넌트 rerender.
- 실패 시 profile update 롤백은 백그라운드에서 setBackToPrev 호출 — 본 화면에선 단순 errorMsg 표시 후 사용자 재시도 가능 (settings-language의 250ms back과 다름 — onboarding은 next로 진행 필요).

### 5-2. PrimaryButton 활성 조건

- `disabled={!picked || saving}` (현재 RN 그대로). UX: 옵션 선택 전에는 회색 상태로 명확히 인지.

### 5-3. 애니메이션 (키스크린 framer-motion 부재)

- 키스크린 StepLanguage에는 framer-motion 없음 (StepWelcome / StepDone만 사용). RN도 추가 애니메이션 불필요.
- step 진입 시 expo-router `slide_from_right` 기본 전환 — `_layout.tsx`에 적용됨.

---

## 6. RN deviation 사유

| # | 키스크린 표기 | RN 대체 | 사유 |
|---|---|---|---|
| 1 | `boxShadow: '0 0 0 1px rgba(139,26,42,0.4)'` (selected ring) | **borderWidth 1 → 2px (active)**, borderColor = `brand.gold` | RN ShadowProps는 outset shadow만 지원 (iOS shadowOffset/Opacity/Radius + Android elevation). CSS `box-shadow 0 0 0 1px` = 1px ring inset/outset overlap은 직접 매핑 불가. **시각 효과 유지 옵션:**<br/>(a) border 2px (선택). **장점**: 단순, 토큰 호환. **단점**: ring 색이 wine-red(40%) → gold로 바뀜 (시각 차이 미미). 키스크린 의도는 "active 강조" — 색 손실은 작음.<br/>(b) wrapper View absolute -1 inset + borderWidth 1 + borderColor `withAlpha(brand.wineRed, 0.4)`. **장점**: 색 verbatim. **단점**: 1px 미세 차이로 안티앨리어싱 깨질 위험.<br/>**채택: (a) — border 2px 변경.** 정합성 우선. design-reviewer가 시각 부족 판단 시 (b) 재검토. |
| 2 | `cursor: pointer` | (제거) | RN은 cursor 없음 — Pressable이 hit-test 처리 |
| 3 | `all: unset` on `<button>` | (제거) | RN Pressable은 기본 스타일 없음 |
| 4 | hover 상태 | `pressed && opacity dim + scale 0.99` | RN hover 없음 — press feedback 표준 추가 (settings-radio-row와 일관) |
| 5 | `var(--color-bg-deepest)` CSS var (자동 dark/light 분기) | NW v4 `bg-bg-deepest` (dual 토큰 등록됨) | NW v4가 CSS var 자동 분기 안 함 — dual 토큰으로 등록되어 className 단일로 자동 분기 |
| 6 | `useTranslations('common')` 안쪽에 호출 (line 213) | 컴포넌트 최상위 `const { t } = useTranslation()` 1회 호출 후 `t('common.next')` | React rules-of-hooks: 키스크린은 sub-render 안 useTranslations 재호출 (web에서 OK이지만 RN react-i18next도 동일 패턴 권장하지 않음). 안전한 패턴 채택 |
| 7 | framer-motion (StepLanguage엔 없음) | — | deviation 없음 (애니메이션 추가 X) |

---

## 7. 접근성

| 요소 | accessibilityRole | accessibilityLabel | accessibilityState | 추가 |
|---|---|---|---|---|
| PageRoot View | (default) | — | — | — |
| Title Text | `header` | (자동: 본문 텍스트) | — | screen reader 첫 노출 |
| Subtitle Text | `text` | — | — | — |
| ChoiceCard "ko" | `radio` | `t('onboarding.language.ko')` (="한국어") | `{ selected: picked === 'ko' }` | hitSlop 6 (settings-radio-row와 일관) |
| ChoiceCard "en" | `radio` | `t('onboarding.language.en')` (="English") | `{ selected: picked === 'en' }` | hitSlop 6 |
| IconBadge View + Text | — | `accessibilityElementsHidden={true}` + `importantForAccessibility="no-hide-descendants"` | — | "KR"/"EN" 식별자는 라벨에 흡수, screen reader 중복 노출 차단 |
| PrimaryButton | `button` (PrimaryButton 내장) | `t('common.next')` | `{ disabled, busy: loading }` | PrimaryButton 기본 |

**focus 순서:** Title → Subtitle → ChoiceCard ko → ChoiceCard en → PrimaryButton. RN 기본 DOM 순서.

**최소 타겟 크기:** ChoiceCard 96pt 높이 → AAA 통과. PrimaryButton 52pt → AA 통과.

**다이내믹 타입 (a11y font scaling):** Title 28pt가 XXXLarge 시 줄바꿈 가능 — 한국어 "언어를 선택해주세요"는 9자라 2줄 wrap OK. 영어 "Choose your language"도 OK. `allowFontScaling={true}` (default) 유지.

---

## 8. i18n 키 목록 (ko/en 완성형)

```json
// src/lib/i18n/ko.json (현재 + 신규 키 추가)
{
  "onboarding": {
    "language": {
      "title": "언어를 선택해주세요",         // (현재 유지 — 또는 keyscreen verbatim "언어를 선택하세요"로 교체)
      "subtitle": "언제든 설정에서 바꿀 수 있습니다",  // (현재 유지)
      "ko": "한국어",                          // [신규 추가]
      "en": "English"                          // [신규 추가]
    }
  }
}

// src/lib/i18n/en.json
{
  "onboarding": {
    "language": {
      "title": "Choose your language",         // (현재 유지 — keyscreen 일치)
      "subtitle": "You can change this any time in Settings",  // (현재 유지)
      "ko": "한국어",                          // [신규 추가 — 자기 언어명 한국어로 표기]
      "en": "English"                          // [신규 추가]
    }
  }
}
```

**i18n 변경 폭:**
- 신규 키 2건 (ko/en 각각 `onboarding.language.ko`, `onboarding.language.en`)
- 기존 top-level `language.ko`/`language.en`은 보존 (settings-language 화면에서도 참조)
- ko title/subtitle 문구는 현재 RN 유지 (keyscreen 미세 차이는 §10 Q1 — 리더 판단)

---

## 9. 현재 구현 차이 (retroactive — `app/onboarding/2-language.tsx` 75 LOC 분석)

| # | 항목 | 키스크린 원본 | 현재 RN 구현 | 수정 필요 |
|---|---|---|---|---|
| 1 | **레이아웃 wrapper** | `<main>` PageRoot (padding 32/24/40, gap 24) + StepLanguage 본문 (flex-1, gap-16) | `OnboardingStep` 컴포넌트 (progress label "2 / 4" eyebrow + title/subtitle in `px-6 pt-6` block + ScrollView 본문 + footer 별도) | **wrapper 교체** — `OnboardingStep` 사용 중단, PageRoot + StepRoot 직접 구성 (welcome step과 일관) |
| 2 | **progress eyebrow** ("2 / 4") | ✗ (키스크린 없음) | `<Text>{t('onboarding.progress', {current:2, total:4})}</Text>` 노출 | **제거** — keyscreen 패턴 verbatim, progress 표시 없음 |
| 3 | Title font size | Playfair 28 / lineHeight 33.6 / margin 0 | Playfair `text-page-title` (24/28.8 — typography.pageTitle) + `mt-3` | size 28로 변경 (P0 토큰 `onboardingStepTitle` 또는 inline) |
| 4 | Subtitle font | Inter 14 / muted / margin 0 | Inter `text-card-body` (13/19.5 — typography.cardBody) text-secondary `mt-2` | size 14 / muted color로 변경 |
| 5 | **ChoiceCard 모양** | height 96, paddingHorizontal 18, rounded-2xl(16), flex-row gap 14, IconBadge 44×44 round + "KR"/"EN" Playfair 16 gold + title Inter 18 600 | `OptionCard` 컴포넌트 (rounded-xl, px-4 py-4, no IconBadge, Check icon right-side, font-inter-semibold text-card-title=Playfair 16) | **컴포넌트 교체** — `OptionCard` 부적합. 신규 `OnboardingLanguageCard` (또는 inline 구현) 필요. ChoiceCard verbatim 패턴 |
| 6 | IconBadge bg | `rgba(201,168,76,0.08)` | ✗ 누락 | 추가 — `withAlpha(brand.gold, 0.08)` inline |
| 7 | IconBadge text "KR"/"EN" | Playfair 16 gold (literal, i18n 키 없음) | ✗ 누락 | 추가 — locale 식별자 |
| 8 | Selected state border | active 시 `border-gold` 1px + `boxShadow 0 0 0 1px rgba(139,26,42,0.4)` ring | active 시 `border-2 border-gold` / inactive `border border-text-disabled` | OK (방향 일치) — 단 unselected 보더 색 `text-disabled` → **`border.default`** 토큰으로 변경 (settings-radio-row와 일관) |
| 9 | Unselected opacity 0.85 | ✓ active ? 1 : 0.85 | ✗ (없음) | 추가 — `opacity: active ? 1 : 0.85` |
| 10 | ChoiceList gap | 12 + marginTop 8 | `gap-3` (=12) ✓ but `marginTop:8` 누락 | `mt-2` 추가 |
| 11 | StepRoot gap | 16 | `gap-3` (=12) within OnboardingStep title block | **gap-4** (=16) StepRoot에 적용 |
| 12 | 페이지 padding | `32px 24px 40px` (verbatim — welcome step과 동일) | OnboardingStep insets.top/bottom + px-6 pt-6 + footer paddingBottom Math.max(insets.bottom, 16) | top SafeArea + 32, bottom SafeArea + 40 (현재 16 min 약함) — welcome step 사양과 일치하게 |
| 13 | onPick 시 changeLanguage 즉시 적용 | ✓ `setLocale(v)` (line 64) | ✓ `changeLanguage(locale)` (line 21) | OK |
| 14 | "Next" CTA disabled | `!picked` | ✓ `disabled={!picked}` | OK |
| 15 | profile update on next | (키스크린 mock — 실제 호출 없음) | ✓ `supabase.from('profiles').update({language:picked}).eq('id',uid)` | OK (RN 표준 추가) |
| 16 | Toast on error | (없음) | ✓ `<Toast tone="error" />` errorMsg | OK (RN 표준 추가) |
| 17 | router.push 대상 | `/onboarding/3-experience` (welcome→language→experience→mode→done 순) | ✓ `router.push('/onboarding/3-experience')` | OK |
| 18 | Haptics on ChoiceCard | (web — 없음) | `Haptics.selectionAsync()` 추가 권장 (OptionCard에는 있으나 신규 카드에는 별도 추가 필요) | RN 표준 deviation |
| 19 | Pressable press feedback | (`all:unset`, hover 스타일 없음) | scale 0.97 (OptionCard) / 사양 0.99 (settings-radio-row 일관) | scale 0.99로 통일 권장 (settings-radio-row 패턴) |
| 20 | `_layout.tsx` gestureEnabled | (URL guard) | ✓ `gestureEnabled: false` | OK |

**수정 폭 요약:**
- **wrapper 교체:** `OnboardingStep` → PageRoot + StepRoot 직접 구성 (welcome step과 일관 — `OnboardingStep`은 progress eyebrow 강제로 verbatim 불가). 단, `OnboardingStep` 컴포넌트는 다른 step(experience, mode)에서도 같은 문제 — **OnboardingStep 폐기 검토** (별도 리더 판단 §10 Q2) 또는 progress prop optional 추가 후 step language/experience/mode 모두 progress 없이 사용.
- **카드 교체:** `OptionCard` → 신규 `OnboardingLanguageCard` (또는 2-language.tsx inline). ChoiceCard verbatim.
- **typography:** title 24→28, subtitle text-card-body→text-[14px]/muted, choice label text-card-title(16)→18px Inter 600.
- **삭제:** progress eyebrow ("2 / 4") — keyscreen은 progress 표시 없음.
- **추가:** IconBadge 44×44 + KR/EN 식별자 + bg gold alpha 0.08.
- **예상 LOC 변화:** 75 → 약 110~120 LOC (또는 신규 `OnboardingLanguageCard` 분리 시 2-language.tsx 약 80 + card 컴포넌트 약 50)

### 9-1. OnboardingStep 컴포넌트 처분 (영향 범위)

현재 `OnboardingStep`은 4개 step 모두 사용 (1-welcome 제외하면 2/3/4). progress eyebrow가 keyscreen verbatim과 충돌 — 키스크린은 step 인디케이터 없음. 옵션:

| 옵션 | 장점 | 단점 |
|---|---|---|
| (a) `OnboardingStep` progress prop optional → `showProgress?: boolean = false`. 4개 step 모두 progress 끔 | 컴포넌트 재사용, 점진적 변경 | `OnboardingStep`의 다른 사양(px-6 pt-6 block + ScrollView 본문 + footer)이 keyscreen과 미세 차이 — title/subtitle wrapper가 별도 block in pt-6 vs keyscreen은 StepRoot 안 단순 stack |
| (b) `OnboardingStep` 폐기, 각 step이 PageRoot + StepRoot 직접 구성 (welcome step과 일관) | keyscreen verbatim 정확 | LOC 증가, 공통 패턴 반복 |
| (c) `OnboardingStep` 리팩토링 → keyscreen verbatim 패턴으로 (progress 제거 + ScrollView 제거 + StepRoot flex-1 gap-4 단순 wrap) | 재사용 + verbatim | 다른 step 사양과 동시 작업 필요 (3-experience, 4-mode 사양도 같이 갱신) |

**권장: (c)** — 같은 cycle에서 3-experience, 4-mode 사양도 같은 wrapper 패턴 (PageRoot + StepRoot)로 통일. 본 cycle 2-language 사양은 (b) 기준 사양 작성 (`OnboardingStep` 의존 제거), rn-screen-builder는 (c) 리팩토링과 함께 진행 권장 — §10 Q2 리더 판단.

---

## 10. 미해결 질문 (리더 판단 / escalation)

| # | 질문 | 영향 | 권장 |
|---|---|---|---|
| Q1 | ko title/subtitle 문구를 keyscreen verbatim ("언어를 선택하세요" / "이 설정은 언제든 변경 가능해요")으로 교체할지, 현재 RN 문구("언어를 선택해주세요" / "언제든 설정에서 바꿀 수 있습니다") 유지할지 | i18n 일관성 — 다른 step도 keyscreen 문구와 차이 가능성 | **현재 RN 유지** (의미 동일, "~해주세요"가 더 정중). 통일성은 다른 step 사양 작성 시 일괄 점검. design-reviewer가 시각 게이트에서 문구 차이로 시각 차이 없음 확인. |
| Q2 | `OnboardingStep` 컴포넌트 처분 — (a) progress prop optional / (b) 폐기 / (c) verbatim 리팩토링 | step 4개 화면 모두 영향 | **(c) verbatim 리팩토링** — 4 step 모두 같은 wrapper 패턴으로 통일. 본 cycle은 2-language만, 3-experience/4-mode는 후속 cycle. |
| Q3 | `boxShadow ring` deviation — border 2px 채택 vs absolute wrapper View 1px ring | 시각 정합 (active 강조 톤) | **border 2px 채택**. design-reviewer 시각 부족 판단 시 wrapper View로 재검토. |
| Q4 | typography 신규 토큰 3건(`onboardingStepTitle/Subtitle/ChoiceLabel`) 추가 vs NW arbitrary | 향후 step 화면 일관성 | **신규 토큰 추가** — step 3/4도 같은 위계 사용. P0 세션 처리. |
| Q5 | 라이트 모드 IconBadge text 가독성 (gold-on-gold-alpha-0.08 over white = ~2.5:1 대비) | a11y AA 미달 가능성 | design-reviewer 시각 검증 시 라이트 모드 onboarding 캡쳐 확인. 미달 판단 시 alpha 0.08 → 0.18로 상향 (capture aiBadgeBg light 패턴 동일 — `withAlpha(brand.goldDeep, 0.18)` 권장) |
| Q6 | `OnboardingLanguageCard`를 별도 컴포넌트로 분리 vs 2-language.tsx inline | 재사용성 — language step에서만 사용, experience/mode는 다른 카드 모양 | **inline 권장** (단일 사용처). 단, 별도 분리 시 `src/components/onboarding/choice-card.tsx` 이름 충돌 회피 위해 `language-choice-card.tsx`로. |

**리더 escalation:** Q1, Q2, Q4 (i18n 정책 + 컴포넌트 처분 + 토큰 정책). Q3은 design-reviewer, Q5는 rn-screen-builder 구현 후 design-reviewer 시각 검증, Q6은 rn-screen-builder 재량.

---

## 11. 변경 요청 집계 (rn-screen-builder 게이트로 전달)

**rn-screen-builder 작업 요청:**
1. `app/onboarding/2-language.tsx` 보강 (위 §9 1~12 + §5 인터랙션 정리)
2. (선택) `src/components/onboarding/language-choice-card.tsx` 신규 — ChoiceCard verbatim 패턴
   - props: `{ locale: 'ko' | 'en'; title: string; selected: boolean; onPress: () => void; }`
   - 또는 2-language.tsx inline 구현 (§10 Q6)
3. `src/lib/i18n/{ko,en}.json` `onboarding.language.{ko,en}` 키 신규 추가
4. (선택, Q2 후속) `src/components/onboarding/onboarding-step.tsx` 리팩토링 또는 폐기 — **본 cycle은 2-language만, 별도 작업 단위로**
5. (선택, Q4 후속) `src/lib/design-tokens.ts` typography 신규 3건(`onboardingStepTitle/Subtitle/ChoiceLabel`) — **P0 세션 처리, 본 cycle은 inline fallback 허용**

**i18n 키 추가 commit 분리 권장:** 키 추가 commit → 화면 코드 commit (2단계).

**신규 design token 수:** **0건 필수, 3건 권장** (typography 토큰; inline fallback 가능)
**신규 i18n 키 수:** 4건 (ko/en 각각 `onboarding.language.ko`, `onboarding.language.en`)
**escalation 항목:** Q1(ko 문구 유지), Q2(OnboardingStep 처분 — 4 step 영향), Q4(토큰 추가 정책)

---

## 12. 검증 체크리스트 (rn-screen-builder PR 전 셀프 점검)

- [ ] PageRoot padding `32px 24px 40px` (SafeArea + 32 top / SafeArea + 40 bottom / 24 horizontal)
- [ ] StepRoot `flex-1 gap-4` (=16)
- [ ] Title Playfair 28 / lineHeight 33.6 / text-primary dual
- [ ] Subtitle Inter 14 / text-muted dual
- [ ] ChoiceList `gap-3 mt-2` (=12/8)
- [ ] ChoiceCard height 96, paddingHorizontal 18, rounded-2xl, flex-row gap-3.5
- [ ] ChoiceCard bg surface dual, border 1px(unselected) / 2px brand.gold(selected)
- [ ] ChoiceCard opacity active ? 1 : 0.85
- [ ] IconBadge 44×44 rounded-full, bg `withAlpha(brand.gold, 0.08)`, items/justify center
- [ ] IconBadge text "KR"/"EN" Playfair 16 brand.gold
- [ ] Choice title Inter 18 600 text-primary dual
- [ ] CtaWrapper `mt-auto`, PrimaryButton w-full, lg, primary, disabled=!picked
- [ ] progress eyebrow ("2 / 4") **제거**
- [ ] Haptics.selectionAsync on ChoiceCard, Haptics impact Light on CTA (PrimaryButton 내장)
- [ ] changeLanguage(locale) 즉시 호출 (onPick)
- [ ] profile update + router.push('/onboarding/3-experience')
- [ ] errorMsg Toast on update 실패
- [ ] accessibilityRole="radio" + accessibilityState.selected
- [ ] IconBadge accessibilityElementsHidden
- [ ] 다크/라이트 양쪽 토큰 자동 분기 — 하드코딩 hex 0건 (brand.* / dark.* / light.* / withAlpha만)
- [ ] ko/en 양쪽 i18n 키 누락 0건
- [ ] gestureEnabled: false (_layout.tsx 기존 유지)
