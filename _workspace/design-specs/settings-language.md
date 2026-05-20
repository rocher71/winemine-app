# settings-language Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen prose `pages/settings-language.md` > 우리 token/cheatsheet.
> 작성일: 2026-05-20 (Day 6) · author: design-spec-author

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/(tabs)/settings/language.tsx` |
| 진입 경로 | `/settings/language` (settings hub Language row → push) |
| 헤더 | `<BackHeader title={t('settings.languagePage.title')} />` |
| BottomNav | **표시하지 않음** — keyscreen JSX는 `<BottomNav>` 미포함, `<main className="wm-scroll-area">`만 둠. 우리도 `(tabs)/settings/` 그룹이지만 sub-route는 BottomNav 숨김 (`headerShown`/`tabBarStyle: {display: 'none'}` for this stack route, 또는 `app/settings/` non-tabs 그룹으로 분리). **추천**: `app/settings/language.tsx` 로 옮기고 `(tabs)/settings/index.tsx`에서 `router.push('/settings/language')`. 이 사양에서는 후자 경로로 고정. |
| 진입 가드 | 없음 |
| 시스템 백 제스처 | expo-router 자동 |

i18n key:
- `settings.languagePage.title` — ko: `언어` / en: `Language` (keyscreen messages 일치, prose의 `언어 설정` 보다 짧음 — **JSX/messages 우선**)
- `settings.languagePage.appliedToast` — ko: `언어가 변경되었어요` / en: `Language updated`
- `settings.values.ko` — ko: `한국어` / en: `한국어` (영문 모드에서도 자기 이름은 한국어 유지가 키스크린 patten; `language.ko` 키 기존 우리 i18n 동일)
- `settings.values.en` — ko: `English` / en: `English`

> 우리 `src/lib/i18n/{ko,en}.json`에 `settings.languagePage.*`, `settings.values.*` 키 신규 추가 필요. rn-screen-builder가 구현 PR에 함께 포함.

---

## 2. Layout Tree (verbatim 변환)

키스크린 JSX (43 lines):
```jsx
<>
  <BackHeader title={t('title')} />
  <main className="wm-scroll-area" style={{ paddingTop: 12 }}>
    <div data-feature-id="settings.language.radioList">
      <RadioList options={[ko, en]} value={locale} onChange={...} />
    </div>
  </main>
</>
```

RN 변환:
```
Screen (View, flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── BackHeader (title=t('settings.languagePage.title'))
│     [기존 src/components/nav/back-header.tsx 그대로 — 56px + safe top inset, ChevronLeft 24/strokeWidth=2]
└── ScrollView (flex-1, contentContainerStyle={{paddingTop: 12, paddingBottom: insets.bottom + 24}})
      └── View (mx-4, gap-2)              ← RadioList outer (px=16 → mx-4, gap=8 → gap-2)
            ├── SettingsRadioRow          ← option 'ko'
            │     selected={profile.language === 'ko'}
            │     label={t('settings.values.ko')}
            │     onPress={() => apply('ko')}
            └── SettingsRadioRow          ← option 'en'
                  selected={profile.language === 'en'}
                  label={t('settings.values.en')}
                  onPress={() => apply('en')}
```

### SettingsRadioRow (신규 컴포넌트 — `src/components/settings/settings-radio-row.tsx`)

keyscreen `src/components/settings/radio-list.tsx` 의 `<button>` 항목을 1:1 변환한 row. 3개 settings sub 화면 모두 공유.

```
Pressable                                      ← 카드 컨테이너
  accessibilityRole="radio"
  accessibilityState={{ selected, disabled }}
  accessibilityLabel={label}
  hitSlop=6
  className="
    flex-row items-start gap-3
    px-4 py-3.5                                 ← keyscreen: padding 14px 16px → py-3.5 px-4
    rounded-xl                                  ← keyscreen: borderRadius 12
    bg-surface dark:bg-surface
    border
    {selected ? 'border-gold' : 'border-border-default'}
  "
  style={({ pressed }) => ({
    opacity: pressed ? 0.92 : 1,
    transform: [{ scale: pressed ? 0.99 : 1 }],
  })}
├── View (radio indicator)
│     size=20x20, rounded-full, borderWidth=2, marginTop=2 (label baseline 보정)
│     selected:   borderColor=brand.gold, backgroundColor=brand.gold
│     unselected: borderColor=border-default token, backgroundColor=transparent
│     selected시 자식: <Check size={12} strokeWidth={3} color={brand.deepestDark /*=#05020A*/} />
└── View (text column, flex-1)
      ├── Text (label)
      │     className="font-inter-medium text-[14px] leading-[20px] text-text-primary dark:text-text-primary"
      │     keyscreen: Inter 500 / 14px / color cream
      └── Text (description, optional)         ← language 화면에서는 없음, experience/appearance에서만 노출
            className="font-inter text-[12px] leading-[17px] text-text-muted dark:text-text-muted mt-1"
            keyscreen: Inter 400 / 12px / lineHeight 1.4 → 16.8≈17px / color text-muted / marginTop 4
```

근거(keyscreen radio-list.tsx):
- gap=8 (옵션간) / margin: 0 16px (좌우)
- padding: '14px 16px'
- border 1px solid: selected = `var(--color-gold)`, 아니면 `var(--color-border-default)`
- borderRadius=12
- indicator: 20×20, borderRadius=10, border 2px, marginTop=2
- selected시 indicator fill=gold + Check(12, strokeWidth=3, color=#05020A=brand.deepestDark)
- label: Inter / 14 / weight 500 / color cream
- description: Inter / 12 / color text-muted / marginTop=4 / lineHeight=1.4

---

## 3. NativeWind 매핑표

| keyscreen (Tailwind/inline) | RN+NW v4 | 비고 |
|---|---|---|
| `<main className="wm-scroll-area" style={{paddingTop:12}}>` | `<ScrollView contentContainerStyle={{paddingTop:12, paddingBottom: insets.bottom+24}}>` 또는 `pt-3 pb-12` | wm-scroll-area = 키스크린에서 flex-1 + overflowY:auto (RN ScrollView 동등) |
| `display:flex; flexDirection:column; gap:8` | `gap-2` (NW v4 `gap-*` 지원) | RN 0.71+ flex gap 지원 — NW v4도 통과 |
| `margin: '0 16px'` | `mx-4` | 16/4=4 → NW spacing scale 4 |
| `padding: '14px 16px'` | `px-4 py-3.5` | 14px → py-3.5 (spacing 3.5 = 14, design-tokens.ts:spacing[3.5] 정의됨) |
| `border: 1px solid var(--color-gold)` | `border border-gold` (selected) / `border border-border-default` (unselected) | NW의 `border` = 1px (NW v4 기본은 platform 의존; 명시적으로 `borderWidth:1` 보장 위해 RN style fallback 권장: `style={{borderWidth:1}} className="border-gold"`) |
| `borderRadius: 12` | `rounded-xl` | NW v4 기본 12px = `rounded-xl` |
| `background: var(--color-surface)` | `bg-surface dark:bg-surface` | dual token, `surface={DEFAULT:#3D2A4A, light:#FFFFFF}` |
| `width:20, height:20, borderRadius:10` | `style={{width:20, height:20, borderRadius:10}}` 또는 `w-5 h-5 rounded-full` | NW에서 명시 OK |
| `border: 2px solid var(--color-gold)` (indicator selected) | `style={{borderWidth:2, borderColor: brand.gold}}` | NW v4의 `border-2 border-gold`도 가능; iOS borderWidth subpixel 안전을 위해 inline 권장 |
| `background: var(--color-gold)` (indicator selected fill) | `style={{backgroundColor: brand.gold}}` | gold는 brand 토큰 (테마 무관) |
| `cursor: pointer` | (제거) | RN 무의미 |
| `all: unset` (button reset) | (제거) | Pressable은 기본 스타일 없음 |
| `aria-pressed={selected}` | `accessibilityState={{ selected }}` + `accessibilityRole="radio"` | RN 동등 |
| `fontFamily: var(--font-inter)` | `font-inter` / `font-inter-medium` | tailwind.config 매핑 일치 |
| `fontSize:14, fontWeight:500` (label) | `font-inter-medium` + `text-[14px] leading-[20px]` | `card-meta`(12/14.4)나 `back-title`(16/19.2)와 다른 커스텀 — 14/20 가까운 fontSize 토큰 없음, NW arbitrary 사용. **deviation 없음** — 토큰 추가 후보(`settings-row-label`)는 작게 잡고 NW arbitrary 단발 OK. |
| `fontSize:12, lineHeight:1.4` (description) | `text-card-meta` 가 12/14.4 — 너무 좁음. NW arbitrary `text-[12px] leading-[17px]` | 14.4(키스크린 비율 1.2) vs 17 차이 — **keyscreen radio-list.tsx는 `lineHeight:1.4` 명시(=16.8≈17px)** 이므로 17이 정답. |
| `color: var(--color-cream)` | `text-text-primary dark:text-text-primary` | dual 토큰. cream(=#F5F0E8)은 다크 모드 primary와 사실상 동일(#F8F4ED) — 차이 미미. light 모드에서는 `light.text.primary=#2A1A14`로 자동 분기. **deviation 없음**: keyscreen은 다크 기준 단일 hex지만 우리 dual 토큰 사용이 정답. |
| `color: var(--color-text-muted)` | `text-text-muted dark:text-text-muted` | dual 토큰 |

### CSS Grid / position 미사용
이 화면은 grid/fixed/sticky 없음. flex column만.

### Hover/Focus 미사용
keyscreen RadioList에 hover/focus 스타일 없음 (button `all:unset`). press feedback만 우리 측에서 미세 추가 (`pressed` ? opacity 0.92, scale 0.99).

---

## 4. 상태 Variants

### default
- 옵션 2개 카드 표시 (둘 다 `bg-surface` 배경, 1px `border-border-default`)
- profile.language === null (초기) 시 선택된 옵션 없음 — indicator 모두 빈 원
- 단, 우리 v0.1.0는 온보딩에서 language를 강제 저장하므로 settings 진입 시점에는 반드시 ko 또는 en 중 하나가 selected (keyscreen 동일 가정)

### selected (option = 현재 profile.language)
- 해당 row: `border-gold` 1px + indicator 채워진 gold 원 + Check(12px, strokeWidth=3, color=`brand.deepestDark` #05020A)
- 비선택 row: `border-border-default` + 빈 indicator (border 2px, transparent fill)

### pressed (Pressable active)
- 전체 row opacity → 0.92, scale → 0.99 (keyscreen에는 없는 RN 표준 deviation — 사유 §8 참조)

### dark mode
- bg: `bg-bg-deepest` = `#251837` (View root) — keyscreen `--color-bg-deepest`
- 옵션 row bg: `bg-surface` = `#3D2A4A`
- text-primary: `#F8F4ED`
- text-muted: `#CABDA8`
- border-default: `#5A3D6A`
- 선택 강조: gold `#C9A84C`

### light mode
- bg: `bg-bg-deepest` light variant = `#FAF5EC` (크림 종이)
- 옵션 row bg: `bg-surface` light = `#FFFFFF`
- text-primary: `#2A1A14`
- text-muted: `#8B7766`
- border-default: `#E0D2BC`
- 선택 강조: gold `#C9A84C` (brand 고정, light도 동일 — keyscreen 외관 토큰표에서 light는 wine-red→gold 통일이지만 gold 자체는 두 모드 모두 `#C9A84C` brand; 단 `--color-border-active`는 light에서 `#B89438` golddeep 계열. radio indicator 선택 색은 `--color-gold` 직접 참조이므로 두 모드 동일.)

### ko locale
- title: `언어`
- ko row label: `한국어`
- en row label: `English`
- toast: `언어가 변경되었어요`

### en locale
- title: `Language`
- ko row label: `한국어` (자기 언어명 유지)
- en row label: `English`
- toast: `Language updated`

> **검증 게이트**: design-reviewer는 dark+ko / dark+en / light+ko / light+en 4가지 조합 모두 멀티모달 비교 통과 필요 (THEME_VERIFICATION.md §4-9).

---

## 5. 인터랙션

| 위치 | 트리거 | 결과 |
|---|---|---|
| BackHeader < | onPress | `router.back()` (BackHeader 기본 동작) |
| SettingsRadioRow (ko/en) | onPress | (1) `Haptics.selectionAsync()` (await 없이 fire-and-forget) → (2) `i18n.changeLanguage(next)` (즉시 UI 텍스트 전환) → (3) `supabase.from('profiles').update({ language: next }).eq('id', uid)` 낙관적 + 백그라운드 → (4) `<Toast>` 표시 (tone='info', message=`t('settings.languagePage.appliedToast')`, 자동 dismiss 2500ms) → (5) **250ms 후 `router.back()`** |
| 동일 옵션 재선택 | onPress | no-op (현재 선택 == 다음 선택이면 onChange 호출 skip — 키스크린은 onChange 호출하나 setState가 같은 값이라 토스트는 뜸. 우리는 같은 값 select 시도도 토스트+back 동일하게 처리 — verbatim) |

### 낙관적 업데이트
- UI 먼저 변경 (`i18n.changeLanguage(next)`로 즉시 텍스트 전환 + selected 상태 갱신)
- profile UPDATE 실패 시: i18n 롤백 (`changeLanguage(prevLanguage)`) + Toast tone='error' (`t('errors.onboardingSaveFailed')` 또는 신규 `settings.errors.applyFailed` 키)
- 실패 시 `router.back()` 보류 — 사용자가 재시도 가능하게 머무름

### 250ms delay 사유 (keyscreen 동일)
- Toast가 시야에 잠깐 보인 뒤 back 이동 → "변경됐다"는 시각 피드백 + 자동 컨텍스트 이탈
- `setTimeout` cleanup: 컴포넌트 unmount 시 clear (useRef로 timer 보관)

### 햅틱
- `Haptics.selectionAsync()` (radio 선택은 selection 타입; impactAsync(Light)도 가능하지만 selection이 더 의미적)
- 실패 무시 (try/catch + ignore — 일부 Android 미지원)

---

## 6. 접근성

| 요소 | 속성 |
|---|---|
| Screen root | `accessible={false}` (자식이 개별 노드) |
| BackHeader 백 버튼 | `accessibilityRole="button"`, `accessibilityLabel={t('common.back')}`, hitSlop=12 (기존 BackHeader 그대로) |
| BackHeader 타이틀 | `accessibilityRole="header"` (default가 안 잡히면 명시) |
| SettingsRadioRow | `accessibilityRole="radio"`, `accessibilityState={{ selected, disabled: saving }}`, `accessibilityLabel={label}`, `accessibilityHint={t('settings.languagePage.a11yHint')}` (예: ko=`{언어}로 설정`) |
| 최소 타겟 크기 | 옵션 row 높이 ≥ 44pt 보장: `py-3.5` (14+14) + label 20 + indicator 20 = 약 48pt — 통과 |
| 색 대비 | 다크: text-primary on surface = #F8F4ED on #3D2A4A → WCAG AAA / muted on surface = #CABDA8 on #3D2A4A → ≥ 4.5:1 통과. 라이트: #2A1A14 on #FFFFFF → AAA / #8B7766 on #FFFFFF → 4.7:1 통과 |
| VoiceOver 그룹화 | View(text column)에 `accessible={false}` — Pressable이 흡수 |

---

## 7. 데이터 호출

### 읽기 (현재 선택 상태)
```tsx
const { profile } = useProfile();  // src/hooks/use-profile.ts
const current: AppLocale = (profile?.language as AppLocale) ?? currentLocale();
```

### 쓰기 (옵션 선택 시)
```tsx
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { changeLanguage } from '@/lib/i18n';
import * as Haptics from 'expo-haptics';

async function apply(next: 'ko' | 'en') {
  if (next === current) return;        // no-op (verbatim는 처리하지만 DB write 회피)
  Haptics.selectionAsync().catch(() => undefined);

  const prev = current;
  changeLanguage(next);                 // 1) UI 즉시 전환 (낙관적)
  setLocalSelected(next);               // 로컬 state (Pressable selected 반영)

  try {
    const uid = await getCurrentUserId();
    if (!uid) throw new Error('no session');
    const { error } = await supabase
      .from('profiles')
      .update({ language: next })
      .eq('id', uid);
    if (error) throw error;

    showToast({ message: t('settings.languagePage.appliedToast') });
    backTimerRef.current = setTimeout(() => router.back(), 250);
  } catch (err) {
    changeLanguage(prev);               // 롤백
    setLocalSelected(prev);
    showToast({ message: t('errors.onboardingSaveFailed'), tone: 'error' });
  }
}
```

### profiles 스키마 참조
- column: `language text` (CHECK `language IN ('ko','en')`)
- RLS: `select`/`update` own row only — 자동 적용 (`auth.uid() = id`)

### 훅 사용
- `useProfile()` — 진입 시 1회 fetch (현재 language 표시용). 변경 후에는 로컬 state로 충분 (useProfile invalidate 옵션 — 추후 refresh() 호출도 OK)
- 글로벌 store는 v0.1.0 미도입 — Zustand는 미사용. profile state는 hook 로컬.

### Toast 컴포넌트
- 기존 `src/components/shared/toast.tsx`(`message`, `tone='info'|'success'|'error'`) 사용
- **현재 Toast는 자동 dismiss 미지원** — keyscreen 패턴(2500ms 자동 dismiss) 매칭을 위해 호출부에서 `setTimeout(() => setToastMsg(null), 2500)` 추가. 또는 Toast 컴포넌트에 `durationMs` prop 추가 (rn-screen-builder가 결정).
- Toast 위치: 화면 하단 floating — 신규 wrapper 필요. v0.1.0에서는 본 화면이 250ms 뒤 back으로 빠지므로 Toast가 sub-screen에서 자체 렌더(예: ScrollView 외부, 화면 하단 absolute) OK. **권장 패턴**: BackHeader 아래 `<View className="absolute bottom-6 left-4 right-4 z-10">` 안에 조건부 `<Toast>`.

---

## 8. Deviation 로그

| 항목 | keyscreen | RN 변경 | 사유 |
|---|---|---|---|
| Pressable press feedback | 없음 (`all: unset`, hover/focus 스타일 없음) | `pressed && opacity:0.92, scale:0.99` | RN 표준 — 사용자가 탭 인식 못함 방지. 시각 차이 미미(<10% opacity). |
| Haptics | 키스크린(웹) 미지원 | `Haptics.selectionAsync()` 추가 | RN 모바일 표준 (NEXT_TO_RN_TRANSLATION §5) |
| BottomNav 표시 | prose는 "표시 (활성 탭 없음)" | **미표시** | JSX 우선 — 키스크린 JSX는 `<BottomNav>` 미포함. `app/settings/language.tsx` (non-tabs) 경로 권장. 만약 `(tabs)/settings/language.tsx` 유지 시 `<Tabs.Screen options={{tabBarStyle:{display:'none'}}}/>` 필요. **rn-screen-builder가 라우팅 정책 확정** — 본 사양은 BottomNav 없음을 기본으로 함. |
| feature flag | `useRegisterFeatures('/settings/language', [{id:'settings.language.radioList'}])` | **미적용** | v0.1.0 스코프 외. 키스크린의 internal demo controls. |
| 헤더 제목 | prose: `언어 설정 / Language` | **`언어` / `Language`** | JSX의 i18n key `settings.languagePage.title` 가 messages/ko.json에서 `언어`로 해석됨 — JSX/messages 우선 |
| Toast durationMs | 키스크린 toast hook 기본 2500ms | 우리 Toast 자동 dismiss 없음 → 호출부 setTimeout | 현재 Toast 컴포넌트 한계. Toast 컴포넌트 보강은 rn-screen-builder 재량. |

deviation 외의 시각 사양(spacing/padding/border/typography/색)은 verbatim.

---

## 9. 토큰/i18n 확장 요청

### 신규 i18n 키 (en/ko 모두)
```jsonc
"settings": {
  "languagePage": {
    "title": { "ko": "언어", "en": "Language" },
    "appliedToast": { "ko": "언어가 변경되었어요", "en": "Language updated" },
    "a11yHint": { "ko": "선택하면 즉시 적용됩니다", "en": "Selecting applies immediately" }
  },
  "values": {
    "ko": { "ko": "한국어", "en": "한국어" },
    "en": { "ko": "English", "en": "English" }
  }
}
```
(기존 `language.ko`/`language.en` 키와 중복; 우리는 `settings.values.*`를 신규로 두는 게 키스크린 namespace 일치. rn-screen-builder가 신규 추가, 기존 키는 그대로 유지.)

### 토큰 확장 — **없음**
- spacing 3.5(=14)는 design-tokens.ts에 이미 정의됨
- gold/border-default/surface/text-* 모두 dual token으로 등록됨
- 14/20, 12/17 fontSize는 NW arbitrary (`text-[14px] leading-[20px]`) 사용 — 토큰 추가 불필요 (단발성)

### 신규 컴포넌트
- `src/components/settings/settings-radio-row.tsx` (3개 settings sub 화면 공유)
  - props: `{ label: string; description?: string; selected: boolean; onPress: () => void; disabled?: boolean }`
  - 키스크린 `radio-list.tsx` 패턴 verbatim

---

## 10. 검증 체크리스트 (rn-screen-builder가 PR 전에 확인)

- [ ] 다크/라이트 양쪽에서 옵션 카드 border/bg/text 차이가 토큰을 통해 자동 분기 (하드코딩 hex 0건)
- [ ] ko/en 양쪽에서 title·옵션 라벨·toast 메시지 누락 0건
- [ ] selected indicator: gold 채움 원 + 검은 Check(12px) 시각 일치 — 키스크린 스크린샷 대비
- [ ] 옵션 row border가 selected시 gold, unselected시 border-default
- [ ] 옵션간 8px gap (mx-4 외부, gap-2 내부)
- [ ] 옵션 row 패딩 14/16 (py-3.5 px-4)
- [ ] 250ms 후 자동 back 동작
- [ ] Toast 표시 + 자동 dismiss
- [ ] 백그라운드 update 실패 시 i18n + selected 롤백
- [ ] Haptics.selectionAsync() 호출
- [ ] accessibilityRole="radio" + accessibilityState.selected 적용
