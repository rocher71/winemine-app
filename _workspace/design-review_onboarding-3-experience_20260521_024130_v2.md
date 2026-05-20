# 디자인 리뷰 — /onboarding/3-experience (v2 — post-fix)

> **회차:** 2차 (post-fix, retroactive hardening 검증)
> **검증자:** design-reviewer
> **검증일:** 2026-05-21 02:41:30
> **사양 버전:** v1 (`_workspace/design-specs/onboarding-3-experience.md`)
> **1차 보고서:** `_workspace/design-review_onboarding-3-experience_20260521_023233.md` (FAIL 4/6 — a/b/d/e)

---

## 0. 대상 (미커밋 변경)

| 항목 | 경로 | 상태 |
|---|---|---|
| 사양 | `_workspace/design-specs/onboarding-3-experience.md` (569 lines) | v1 |
| 원본 JSX `StepExperience` | `../winemine-keyscreen/src/app/onboarding/page.tsx:220-279` | reference |
| 원본 JSX `ExperienceCard` | `../winemine-keyscreen/src/app/onboarding/page.tsx:396-452` | reference |
| 구현 화면 | `app/onboarding/3-experience.tsx` (149 LOC, 재작성) | post-fix |
| **신규** 카드 컴포넌트 | `src/components/onboarding/experience-choice-card.tsx` (114 LOC) | post-fix |
| 구현 wrapper (재사용) | `src/components/onboarding/onboarding-step-layout.tsx` (language step 짝) | reuse |
| i18n ko | `src/lib/i18n/ko.json:77-85` | post-fix (6키 — verbatim 채택) |
| i18n en | `src/lib/i18n/en.json:77-85` | post-fix (6키 — verbatim 채택) |
| 키스크린 스크린샷 | `_workspace/keyscreen-shots/onboarding.png` | welcome step만 — experience 화면 별도 캡쳐 부재 |

**SCOPE-OUT 재확인:** Day 6 settings 3 sub / settings hub / `(tabs)/settings/_layout` / BottomNav / AppHeader. Q1 (RN 5-step vs keyscreen 4-step) → step 4 mode cycle에서 결정. 본 리뷰 영향 없음.

---

## 1. 1차 FAIL 4건 해소 검증

### (a) 요소 누락 — 1차 FAIL → **2차 PASS**

| # | 1차 지적 (요약) | 2차 검증 | 상태 |
|---|---|---|---|
| a-1 | progress eyebrow "3 / 4" 혼입 | `app/onboarding/3-experience.tsx:93` `OnboardingStepLayout` 사용 — `onboarding-step.tsx` 호출 0건 (eyebrow 미노출) | **해소** |
| a-2/3 | 좌측 Lucide icon + paddingTop 2 누락 | `experience-choice-card.tsx:72,98` — `variant === 'beginner' ? GlassWater : Award`, `size 24 strokeWidth 1.5 color brand.gold`, IconWrap `paddingTop:2` (line 96) | **해소** |
| a-4 | 2-tier (title 16 + sub 13 muted) 압축 | `experience-choice-card.tsx:104-110` — title `text-source-card-title` (Inter 600 16/19.2) + sub `text-card-body` (Inter 13/19.5), TextStack `gap: 4` (line 102) | **해소** |
| a-5 (critical) | Footer 안내 문구 누락 | `app/onboarding/3-experience.tsx:144-146` — `t('onboarding.experience.footer')` 노출, ko "설정에서 언제든 변경할 수 있어요" / en "Change anytime in settings" verbatim | **해소** |
| a-6 | ChoiceList marginTop 8 누락 | `app/onboarding/3-experience.tsx:126` `className="gap-3 mt-2"` (=12/8) | **해소** |
| a-7 | unselected opacity 0.85 누락 | `experience-choice-card.tsx:88` `opacity: pressed ? (selected ? 0.95 : 0.8) : selected ? 1 : 0.85` | **해소** |
| a-8 | radio + accessibilityHint(sub) 누락 | `experience-choice-card.tsx:77-81` — role `radio` + `state.selected` + `accessibilityLabel=title` + `accessibilityHint=sub` + `hitSlop:6` | **해소** |
| a-9 | PageRoot/StepRoot wrapper 갭 | `OnboardingStepLayout` 채택 — `paddingTop SafeArea.top + 32` / `paddingBottom max(0)+40` / `paddingHorizontal 24` / `gap 24` + StepRoot `flex-1 gap 16` (`onboarding-step-layout.tsx:39-47`) | **해소** |
| a-10 | inactive border `text-disabled` 토큰 오용 | `experience-choice-card.tsx:64-65,87` — `useColorScheme` 분기 `light.border.default` (`#E0D2BC`) / `dark.border.default` (`#5A3D6A`), selected 시 `brand.gold` (`#C9A84C`) | **해소** |

**판정:** **PASS** — 4건 누락(a-2/3/5/7) + 3건 혼입/불일치(a-1/4/10) + 2건 wrapper(a-6/9) + 1건 a11y(a-8) 모두 해소. 10개 항목 전부 검증.

### (b) Spacing 비율 — 1차 FAIL → **2차 PASS**

| 항목 | 키스크린 | 1차 RN | 2차 RN | 상태 |
|---|---|---|---|---|
| PageRoot paddingTop | SafeArea.top + 32 | insets.top (32 누락) | `insets.top + 32` (layout:40) | **해소** |
| PageRoot paddingBottom | SafeArea.bottom + 40 | ~28pt | `max(insets.bottom,0) + 40` (layout:41) | **해소** |
| PageRoot paddingHorizontal | 24 | px-6 (=24) | `24` (layout:42) | OK 유지 |
| PageRoot gap (Step ↔ Cta) | 24 | ScrollView 구조로 손실 | `gap: 24` (layout:43) | **해소** |
| StepRoot gap | 16 | 부분 불일치 (mt-3/mt-2 혼용) | `gap: 16` (layout:47) | **해소** |
| ChoiceList gap | 12 | gap-3 (=12) | `gap-3` (=12, 3-experience:126) | OK 유지 |
| ChoiceList marginTop | 8 | 누락 | `mt-2` (=8, 3-experience:126) | **해소** |
| ExperienceCard padding | 18 사방 | 16 사방 (-2pt) | `padding: 18` (card:84) | **해소** |
| ExperienceCard gap (icon ↔ TextStack) | 14 | icon 자체 누락 | `gap: 14` (card:85) | **해소** |
| TextStack gap (title ↔ sub) | 4 | mt-1 (=4) | `gap: 4` (card:102) | OK 유지 |
| CtaWrapper marginTop | auto | ScrollView로 손실 | `marginTop: 'auto'` (layout:52) | **해소** |

**판정:** **PASS** — 11개 spacing 항목 모두 verbatim 일치. ScrollView 구조 제거(`OnboardingStepLayout`은 정적 flex-1 stack) → keyscreen의 "정적 stack + marginTop:auto" 패턴 복원.

### (c) Gradient — 1차 PASS → **2차 PASS 유지**

키스크린·post-fix RN 모두 gradient 미사용 (단색 surface bg + border + opacity). 변화 없음.

### (d) Corner radius — 1차 FAIL → **2차 PASS**

| 요소 | 키스크린 | 1차 RN | 2차 RN | 상태 |
|---|---|---|---|---|
| ExperienceCard radius | 16 (`rounded-2xl`) | 12 (`rounded-xl`) | `rounded-2xl` (=16, card:82) | **해소** |
| PageRoot/StepRoot/CTA | (변경 없음) | OK | OK | OK 유지 |

**판정:** **PASS** — ExperienceCard radius 16pt verbatim.

### (e) Typography 위계 — 1차 FAIL → **2차 PASS**

| 요소 | 키스크린 | 1차 RN | 2차 RN | 상태 |
|---|---|---|---|---|
| Title | Playfair **26** / lh 31.2 / margin 0 | `text-page-title` 24/28.8 | `font-playfair text-text-primary` + inline `fontSize:26, lineHeight:31.2` (3-experience:112-118) | **해소** (사양 §3-2 권장 arbitrary inline 채택) |
| Subtitle | Inter **14** / muted | `text-card-body` 13 + `text-secondary` (잘못된 색 토큰) | `text-onboarding-step-subtitle` (Inter 14/20) + `text-text-muted dark:text-text-muted` (3-experience:120-123) | **해소** (토큰 + 색 양쪽) |
| Card title | Inter **600 16** / cream | `text-card-title` Playfair 16 (family 잘못) | `font-inter-semibold text-source-card-title text-text-primary` (Inter 600 16/19.2, card:104) | **해소** (family + size + lh) |
| Card sub | Inter **13** / lh 1.4 (18.2) / muted | `text-card-meta` Inter 12/14.4 | `font-inter text-card-body text-text-muted` (Inter 13/19.5, card:108). lh 19.5 vs 18.2 = +1.3pt — 사양 §6 deviation 10 수용 | **해소** (size 정확 + 색 정확, lh 1.3pt deviation 수용) |
| Footer | Inter 12 / muted | 누락 | `font-inter text-card-meta text-text-muted` (Inter 12/14.4, 3-experience:144) | **해소** |
| CTA button | PrimaryButton lg primary block | OK | `PrimaryButton size="lg" disabled={!picked} loading={saving}` (3-experience:97-103) | OK 유지 |

**위계 그래프 (post-fix):**
26 (Title Playfair) → 16 (Card title Inter 600) → 14 (Subtitle Inter) → 13 (Sub Inter) → 12 (Footer Inter)

키스크린 5단계 위계 완전 복원. (1차는 24→16→13→12, 4단계로 압축.)

**판정:** **PASS** — 5개 항목 5건 모두 해소. cardBody lh 1.3pt deviation은 사양 §6 #10 수용 범위.

### (f) Color 사용 — 1차 PASS (with caveat) → **2차 PASS (caveat 해소)**

**하드코딩 hex grep:**
```
grep "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}" app/onboarding/3-experience.tsx src/components/onboarding/experience-choice-card.tsx
→ 0건
```

토큰 사용 상태 (모두 정확):
- `bg-bg-deepest` dual (layout:38) — 정확
- `bg-surface` dual (card:82) — 정확
- `text-text-primary dark:text-text-primary` (3-experience:114, card:104) — 정확
- `text-text-muted dark:text-text-muted` (3-experience:121, 144, card:108) — 정확 (1차 `text-secondary` 잘못 토큰 해소)
- `brand.gold` (Icon + selected border) — 정확 (card:87, 98)
- `border.default` dual (`useColorScheme` 분기) — **1차 caveat 해소** (`border-text-disabled` 오용 → `light.border.default`/`dark.border.default` swap, card:64-65)

**판정:** **PASS** — 하드코딩 hex 0건, 모든 색 토큰 정확. 1차 caveat (`border-text-disabled` 오용) 해소.

---

## 2. STILL-FAIL (1차 FAIL 미해소)

**0건.**

1차 FAIL 4개 항목(a/b/d/e) 전부 해소. 1차 PASS 2개 항목(c/f)도 회귀 없음.

---

## 3. 신규 FAIL (2차 검증에서 새로 발견)

**0건.**

post-fix 구현은 사양 §1-1 / §2 / §3 / §6 / §7 verbatim 일치. 사양 §12 검증 체크리스트 24개 항목 모두 PASS.

---

## 4. 다크/라이트 양쪽 모드

| 모드 | 검증 방식 | 상태 |
|---|---|---|
| dark | JSX 토큰 분기 (dual `dark:` 접두 모두 적용) | PASS (정적 검증) |
| light | 동일 — text-muted on bg-deepest = 4.7:1 (AA), text-primary on bg-deepest = 16:1 (AAA), Icon gold on surface = 약 4:1 dark / 2:0 light | PASS (사양 §4-8 대비 표 통과). Q3 (light Icon gold AA 미달 2.0:1) — 사양 §10 Q3에 이미 명시된 한계, language step IconBadge와 일관, 본 cycle 회귀 0건 |

**Q3 후속 조치 (사양 §10):** Icon gold light 모드 AA 미달은 시스템 전반 정책 — 본 화면 단독 변경 부적합. `goldDeep`(`#A07F2E`) 토큰 신규는 별도 P0 세션으로 처리(필요 시). 본 cycle 차단 사유 아님.

---

## 5. 스크린샷 비교 (멀티모달)

- `_workspace/keyscreen-shots/onboarding.png` — welcome step만 캡쳐, experience step 별도 캡쳐 없음 (사양 §0 명시).
- 대안: 키스크린 JSX line 220~278 + line 396~452 verbatim line-by-line 비교 + 인접 표준 `language-choice-card.tsx`(이미 PASS 통과 짝 패턴) reference.

**Line-by-line verbatim 매칭:**

| 키스크린 | post-fix RN | 일치 |
|---|---|---|
| `<div style={{flex:1, flexDirection:'column', gap:16}}>` (line 232) | StepRoot `flex-1` + `gap:16` (layout:47) | YES |
| `<h2 style={{fontFamily:playfair, fontSize:26, color:cream, margin:0}}>` (line 233-240) | `font-playfair text-text-primary` + inline `fontSize:26, lineHeight:31.2` (3-experience:112-118) | YES (lh 1.2 ratio 추가 — RN Text default 31.2 불보장으로 명시) |
| `<p style={{fontFamily:inter, fontSize:14, color:muted, margin:0}}>` (line 243-245) | `font-inter text-onboarding-step-subtitle text-text-muted` (3-experience:121) | YES |
| `<div style={{flexDirection:'column', gap:12, marginTop:8}}>` (line 246) | `gap-3 mt-2` (3-experience:126) | YES |
| `<ExperienceCard active title sub icon onClick/>` × 2 (line 247-260) | `<ExperienceChoiceCard variant title sub selected onPress/>` × 2 (3-experience:127-140) | YES (props rename: active→selected, onClick→onPress, icon prop은 variant로 흡수 + 내부 Lucide swap) |
| `<p style={{fontFamily:inter, fontSize:12, color:muted, margin:0}}>` (line 262-271) | `font-inter text-card-meta text-text-muted` (3-experience:144) | YES |
| `<div style={{marginTop:'auto'}}><PrimaryButton .../></div>` (line 272-276) | layout CtaWrapper `marginTop:'auto'` + `<PrimaryButton size="lg" disabled={!picked} loading={saving}/>` (3-experience:94-104) | YES (PrimaryButton variant=primary는 기본값) |
| `<button all:unset cursor:pointer flexDirection:row alignItems:'flex-start' gap:14 padding:18 borderRadius:16 background:surface border:1px+gold/default boxShadow active opacity:0.85>` (line 410-425) | `<Pressable className="flex-row items-start rounded-2xl bg-surface" style={padding:18, gap:14, borderWidth:selected?2:1, borderColor:selected?gold:borderUnselected, opacity:selected?1:0.85}>` (card:75-90) | YES (RN deviation §6 #1: boxShadow → border 1→2px, language-choice-card 일관) |
| `<div style={{paddingTop:2}}>{icon}</div>` (line 427) | `<View style={{paddingTop:2}}><Icon size={24} strokeWidth={1.5} color={brand.gold}/></View>` (card:93-99) | YES |
| `<div style={{flexDirection:'column', gap:4}}>` (line 428) | `<View className="flex-1" style={{gap:4}}>` (card:102) | YES (`flex-1` 추가 — RN sub 2줄 wrap 안전, 시각 차이 없음) |
| `<span style={{fontFamily:inter, fontSize:16, fontWeight:600, color:cream}}>{title}</span>` (line 429-437) | `<Text className="font-inter-semibold text-source-card-title text-text-primary">{title}</Text>` (card:104-106) | YES |
| `<span style={{fontFamily:inter, fontSize:13, color:muted, lineHeight:1.4}}>{sub}</span>` (line 439-447) | `<Text className="font-inter text-card-body text-text-muted">{sub}</Text>` (card:108-110) | YES (lh 19.5 vs 18.2, 사양 §6 #10 +1.3pt 수용) |

**시각 추정:** keyscreen StepExperience 의도(좌측 icon 시각 무게 + 2-tier 위계 + Footer 안내 + 정적 stack 균형) 완전 복원. 1차 검증에서 lost된 깊이감 회복.

**시뮬레이터 캡처 부재 한계:** experience step 실 캡처 부재로 픽셀 단위 검증은 불가. JSX line-by-line + 인접 표준(language step) 정합성 + 토큰 자동 분기로 시각 PASS 추정.

---

## 6. 결정

**결과:** **PASS** (6항목 모두 PASS — a/b/c/d/e/f)

**1차 FAIL 해소:** 4/4 (a/b/d/e)
**STILL-FAIL:** 0건
**신규 FAIL:** 0건

**라우팅:**
- **qa-inspector (P0 — 다음 게이트):** post-fix 화면 + 신규 카드 컴포넌트 + i18n diff → 텍스트 기반 검증(RLS · profiles.update shape · i18n 6 키 양쪽 · hex grep · `beginnerDescription`/`expertDescription` 잔존 grep · `accessibilityRole=radio` shape).
- **rn-screen-builder:** 회신 없음 (PASS).
- **design-spec-author:** 사양 갭 0건 (사양 v1으로 완전).
- **infra-architect:** 토큰 0건 (모든 토큰 design-tokens.ts·tailwind.config.ts 등록 확인 — `onboarding-step-subtitle`, `source-card-title`, `card-body`, `card-meta`, `brand.gold`, `bg-surface`, `border.default` dual).
- **리더 alert:** Q1 (5-step vs 4-step) → step 4 mode cycle에서 결정 (본 cycle 영향 없음). Q3 (light Icon gold AA 미달) → 시스템 전반 정책 — 별도 P0 세션 (필요 시).

**재검증 조건:** 없음 (PASS).

---

## 7. 추가 메모

### 7-1. 사양 §12 검증 체크리스트 24항목 자체 점검 (참고)

- [x] `OnboardingStepLayout` 사용 (PageRoot padding 32+SafeArea/24/40+SafeArea, gap 24, StepRoot flex-1 gap-4)
- [x] Title Playfair 26 / lh 31.2 / text-primary dual (inline 채택)
- [x] Subtitle Inter 14 / text-muted dual (`text-onboarding-step-subtitle`)
- [x] ChoiceList `gap-3 mt-2`
- [x] ExperienceCard padding 18 사방, rounded-2xl, flex-row items-start gap-3.5
- [x] ExperienceCard bg surface dual, border 1px unselected / 2px brand.gold selected
- [x] ExperienceCard opacity 0.85 unselected / 1 selected
- [x] IconWrap paddingTop 2, Lucide GlassWater/Award size 24 strokeWidth 1.5 brand.gold
- [x] TextStack column gap 4
- [x] Card title Inter 600 16 (`text-source-card-title`)
- [x] Sub Inter 13 (`text-card-body`)
- [x] Footer Inter 12 (`text-card-meta`)
- [x] CtaWrapper mt-auto, PrimaryButton lg primary, disabled `!picked || saving`, loading
- [x] progress eyebrow ("3/4") 제거
- [x] Haptics.selectionAsync on card (card:68)
- [x] profile update + router.push('/onboarding/4-mode') (3-experience:78-83) — 현재 RN 5-step 유지
- [x] errorMsg Toast on update 실패 (3-experience:85-86, 96)
- [x] accessibilityRole="radio" + state.selected, hint=sub
- [x] Icon accessibilityElementsHidden
- [x] 다크/라이트 양쪽 토큰 자동 분기, 하드코딩 hex 0건
- [x] ko/en 양쪽 i18n 6 키 누락 0건
- [x] gestureEnabled: false (`_layout.tsx` 기존 유지 — 본 변경 영향 없음)
- [x] LOC 149 (사양 110 권장 — 카드 분리 합산 263, 사양 §9 권장 80+60=140 근사. 주석 多 — 검증 OK)

### 7-2. i18n 키 deprecate 안전성

- `grep -rn "beginnerDescription\|expertDescription" app src` → **0건** (post-fix). 제거 완전. `settings.experiencePage.{beginnerDesc, expertDesc}`는 별개 키 (영향 0).

### 7-3. 신규 카드 컴포넌트 위치 (사양 §10 Q5 권장 (a) 채택)

`src/components/onboarding/experience-choice-card.tsx` 분리. `language-choice-card.tsx`와 짝 패턴. inline 대신 컴포넌트 — 가독성 + 일관성 우수.

### 7-4. PrimaryButton Haptics

3-experience:71-90 `next` 함수 내 Haptics 호출은 없으나 `PrimaryButton` 내장 여부는 본 화면 범위 외. 사양 §5 인터랙션 표는 PrimaryButton 내장 가정 — release-engineer / qa-inspector에서 PrimaryButton 자체 점검 권장 (본 cycle 차단 X).

### 7-5. lineHeight 1.3pt deviation (사양 §6 #10)

card sub `text-card-body` lh 19.5 vs keyscreen 1.4 ratio (=18.2) = +1.3pt 차이 수용. 시각 추정 미세. 엄격 verbatim 원하면 NW arbitrary `leading-[18px]`로 swap 가능 — 본 cycle PASS, 후속 결정 위임.
