# settings-appearance Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen prose `pages/settings-appearance.md` > 우리 token/cheatsheet.
> 작성일: 2026-05-20 (Day 6) · author: design-spec-author

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/settings/appearance.tsx` (non-tabs, BottomNav 숨김) |
| 진입 경로 | `/settings/appearance` (settings hub Appearance row → push) |
| 헤더 | `<BackHeader title={title} />` ※ keyscreen은 인라인 분기 (`locale==='en' ? 'Appearance' : '외관'`), 우리는 i18n 키로 일관화 |
| BottomNav | **표시하지 않음** (settings-language·experience와 동일) |
| 진입 가드 | 없음 |
| 시스템 백 제스처 | expo-router 자동 |

i18n key (우리 측에서 키화):
- `settings.appearancePage.title` — ko: `외관` / en: `Appearance`
- `settings.appearancePage.darkLabel` — ko: `다크` / en: `Dark`
- `settings.appearancePage.lightLabel` — ko: `라이트` / en: `Light`
- `settings.appearancePage.darkDesc` — ko: `와인 바 분위기의 짙은 보라 배경.` / en: `Original wine bar mood — deep purple background.`
- `settings.appearancePage.lightDesc` — ko: `크림 종이 배경에 와인 강조색.` / en: `Cream paper background with deep wine accents.`
- `settings.appearancePage.appliedToast` — ko: `테마가 적용됐어요` / en: `Theme applied`

> keyscreen JSX는 i18n hook 없이 inline 분기 — 우리 표준(§4-4)은 모든 텍스트를 i18n key로. **JSX 텍스트 verbatim + key namespace 우리 표준**.

---

## 2. Layout Tree (verbatim 변환)

키스크린 JSX (63 lines):
```jsx
<>
  <BackHeader title={title} />  // title = locale==='en' ? 'Appearance' : '외관'
  <main className="wm-scroll-area" style={{paddingTop:12}}>
    <RadioList
      options={[
        { value:'dark',  label: '다크'|'Dark',  description: '와인 바 분위기의 짙은 보라 배경.' | '...' },
        { value:'light', label: '라이트'|'Light', description: '크림 종이 배경에 와인 강조색.' | '...' },
      ]}
      value={theme}
      onChange={(next) => { setTheme(next); toast({...}); }}  // back 안 함
    />
  </main>
</>
```

RN 변환:
```
Screen (View, flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── BackHeader (title=t('settings.appearancePage.title'))
└── ScrollView (flex-1, contentContainerStyle={{paddingTop:12, paddingBottom: insets.bottom+24}})
      └── View (mx-4, gap-2)              ← RadioList outer
            ├── SettingsRadioRow          ← option 'dark'
            │     selected={currentTheme === 'dark'}
            │     label={t('settings.appearancePage.darkLabel')}
            │     description={t('settings.appearancePage.darkDesc')}
            │     onPress={() => apply('dark')}
            └── SettingsRadioRow          ← option 'light'
                  selected={currentTheme === 'light'}
                  label={t('settings.appearancePage.lightLabel')}
                  description={t('settings.appearancePage.lightDesc')}
                  onPress={() => apply('light')}
```

SettingsRadioRow 명세는 `settings-language.md §2` 참조. description 활성. settings-experience와 동일 구조.

> **단, 본 화면의 selected 변경은 전체 앱 다크/라이트 색 토큰을 즉시 토글** — SettingsRadioRow 자체도 토큰 기반이므로 색 전환 일관됨. **재진입 없이 같은 화면에서 색이 변함**이 keyscreen의 핵심 UX 의도. back 안 하는 이유도 이것.

---

## 3. NativeWind 매핑표

settings-language §3 + settings-experience §3 그대로. 추가 사항:

| 항목 | keyscreen | RN |
|---|---|---|
| theme 토글 메커니즘 | `data-theme="dark"|"light"` attribute → CSS 변수 재정의 | NW v4 `colorScheme.set('dark'|'light'|'system')` (nativewind import) |
| `setTheme` Context | `useTheme()` (Context + localStorage) | NW v4 colorScheme API + profile.theme write |
| `localStorage 'winemine.theme'` | 자동 persist | NW v4의 colorScheme는 AsyncStorage에 persist (RN 16.x 표준), 추가로 profile.theme(supabase) 영구화 |
| `html[data-theme]` 즉시 반영 | 모든 페이지 CSS 변수 자동 재정의 | NW v4 dark:* className이 즉시 분기 — `useColorScheme()` 훅으로 색 직접 가져오는 곳은 자동 re-render (React state) |

### colorScheme API 패턴 (NW v4)

```tsx
import { colorScheme } from 'nativewind';

function applyTheme(next: 'dark' | 'light') {
  colorScheme.set(next);  // NW v4 — 전역 dark: 토글
  // 부수적으로 AsyncStorage persist는 NW가 자동 처리
}
```

**system 옵션 미포함** — 키스크린 JSX는 dark/light 2개만 노출 (spec v0.1.0의 "시스템/다크/라이트 3개" prose와 충돌). **JSX 우선** — 본 화면은 2개 옵션. system 옵션 추가는 v0.2.0 검토. **deviation §8에 기록**.

---

## 4. 상태 Variants

### default
- 옵션 2개: dark / light
- `useProfile()` 또는 `colorScheme.get()` (NW)로 현재 테마 read
- profile.theme 또는 NW colorScheme 우선순위: **profile.theme** (DB가 진실), 없으면 `colorScheme.get()` fallback, 그것도 없으면 `'dark'`(앱 기본)

### selected
- 키스크린 스크린샷 (`settings_appearance.png`) — dark 선택 상태:
  - dark row: border gold + indicator gold 채움 + Check + label `다크` + desc `와인 바 분위기의 짙은 보라 배경.`
  - light row: border border-default + 빈 indicator + label `라이트` + desc `크림 종이 배경에 와인 강조색.`
- light 선택 상태:
  - 동일 패턴, light row가 강조

### pressed
- settings-language §4와 동일

### **dark mode (theme=dark)**
- bg-bg-deepest: `#251837` (다크 보라)
- surface: `#3D2A4A`
- text-primary: `#F8F4ED`
- border-default: `#5A3D6A`
- gold: `#C9A84C` (brand 고정)

### **light mode (theme=light)**
- bg-bg-deepest: `#FAF5EC` (크림 종이)
- surface: `#FFFFFF`
- text-primary: `#2A1A14` (다크 브라운)
- border-default: `#E0D2BC`
- gold: `#C9A84C` (brand 고정 — 키스크린의 light에서는 wine-red가 gold로 통일된다는 spec이 있지만, `--color-gold` 자체는 두 모드 같음. radio indicator/border는 gold token 직참조이므로 두 모드 동일하게 gold로 강조 — verbatim)

### 테마 전환 시 시각 동작 (verbatim — keyscreen의 핵심 UX)
- light 옵션 탭 → `colorScheme.set('light')` 즉시 호출 → 화면 전체 bg/border/text 색 전환 (NW v4 re-render)
- 동시에 본 화면 자신도 light 색으로 보임: 배경 `#251837` → `#FAF5EC`, surface `#3D2A4A` → `#FFFFFF`, indicator gold 채움 위치는 light row로 이동
- **back 없음** — 사용자가 색 변화 즉시 확인. Toast만 표시.

### ko / en
- title: `외관` / `Appearance`
- 옵션 라벨: `다크`·`라이트` / `Dark`·`Light`
- description: 위 §1 참조
- toast: `테마가 적용됐어요` / `Theme applied`

---

## 5. 인터랙션

| 위치 | 트리거 | 결과 |
|---|---|---|
| BackHeader < | onPress | `router.back()` |
| SettingsRadioRow (dark/light) | onPress | (1) `Haptics.selectionAsync()` → (2) **`colorScheme.set(next)` 즉시 (NW v4)** — 화면 색 전체 즉시 분기 → (3) `setLocalSelected(next)` (낙관적) → (4) `supabase.from('profiles').update({ appearance_mode: next })` 백그라운드 → (5) `<Toast>` 표시 (자동 dismiss 2500ms) → **(6) back 호출 안 함** |

### back 호출 안 함 (verbatim)
keyscreen JSX line 54-58:
```js
onChange={(next) => {
  setTheme(next);
  toast({ message: { ko: appliedMsg, en: appliedMsg } });
}}
```
language/experience와 다른 점: `setTimeout(()=>router.back(), N)` 없음. 사용자가 색 변화를 그 화면에서 확인. 사용자가 직접 back 버튼 누름.

### colorScheme persist
- NW v4 `colorScheme.set()` → AsyncStorage 자동 persist (NW 16.x 기본)
- profile.theme도 동시 update → 디바이스간 일관성 (다음 로그인에서 적용)
- 두 출처 충돌 시 priority: **앱 부팅 시 profile.theme 우선** (가장 최근 변경 source) — `_layout.tsx`에서 useProfile 로드 후 `colorScheme.set(profile.appearance_mode)` 적용

### 햅틱
- `Haptics.selectionAsync()` (settings-language·experience 동일)

### 낙관적 + 롤백
- NW colorScheme 즉시 set
- profile UPDATE 실패 시: colorScheme 롤백 (`colorScheme.set(prev)`) + Toast error
- **단, 사용자는 이미 색 변화를 봤음** — 1초 내 롤백되면 깜박임 UX 발생. 권장: profile UPDATE을 더 우선(awaited) 처리하거나 silent 실패 (네트워크 일시 단절 시 다음 부팅에서 동기화). v0.1.0 결정: **낙관적 + silent 실패** (Toast error만 띄우고 UI는 새 색 유지) — rn-screen-builder가 trade-off 재확인.

---

## 6. 접근성

settings-experience §6과 동일. 추가:

| 요소 | 속성 |
|---|---|
| SettingsRadioRow | `accessibilityRole="radio"`, `accessibilityState={{ selected }}`, `accessibilityLabel={label}`, `accessibilityHint={description}` |
| 색 대비 양쪽 모드 | 다크/라이트 모두 surface 위 text-primary·text-muted WCAG AA 통과 (settings-language §6 측정값 동일) |
| 테마 즉시 전환 a11y | VoiceOver focus 유지 — RN의 `colorScheme` 변경은 컴포넌트 unmount 없이 색만 변경이므로 focus 유실 없음 |

---

## 7. 데이터 호출

### 읽기
```tsx
const { profile } = useProfile();
const dbTheme = profile?.appearance_mode as 'dark' | 'light' | null;
const nwTheme = colorScheme.get();  // 'dark' | 'light' | 'system'
const current: 'dark' | 'light' = dbTheme ?? (nwTheme === 'light' ? 'light' : 'dark');
```

### 쓰기
```tsx
import { colorScheme } from 'nativewind';

async function apply(next: 'dark' | 'light') {
  if (next === current) return;
  Haptics.selectionAsync().catch(() => undefined);

  const prev = current;
  colorScheme.set(next);          // NW v4 — 화면 색 즉시 전환
  setLocalSelected(next);

  try {
    const uid = await getCurrentUserId();
    if (!uid) throw new Error('no session');
    const { error } = await supabase
      .from('profiles')
      .update({ appearance_mode: next })
      .eq('id', uid);
    if (error) throw error;

    showToast({ message: t('settings.appearancePage.appliedToast') });
    // back 호출 없음 — verbatim
  } catch (err) {
    // silent (NW colorScheme는 유지) + Toast error 표시
    showToast({ message: t('errors.onboardingSaveFailed'), tone: 'error' });
  }
}
```

### profiles 스키마
- column: `appearance_mode text` (CHECK `appearance_mode IN ('dark','light')` — system 옵션 없음, v0.2.0 검토)
- migration 필요 여부: rn-screen-builder가 `supabase/migrations/` 확인. 없으면 Day 6 작업에 마이그레이션 추가 요청 (supabase-engineer 트리거).

### NW v4 colorScheme 글로벌
- `_layout.tsx`(root)에서 mount 시점에 `useEffect`로 `colorScheme.set(profile.appearance_mode)` 1회 적용. 이후 본 settings 화면이 직접 `colorScheme.set` 호출.
- `tailwind.config.ts`의 `darkMode: 'class'`와 NW v4 `colorScheme` 연동 보장 (NW 16.x 표준).

---

## 8. Deviation 로그

| 항목 | keyscreen | RN 변경 | 사유 |
|---|---|---|---|
| (settings-language §8 항목 모두 그대로 상속) | — | — | — |
| 인라인 텍스트 → i18n 키 | JSX inline `locale==='en' ? 'Appearance' : '외관'` | i18n 키 `settings.appearancePage.*` | 우리 §4-4 표준 (한쪽 locale 누락 방지) — 텍스트 내용은 verbatim. **시각/UX 차이 없음**. |
| theme persistence 메커니즘 | localStorage `winemine.theme` + Context | NW v4 `colorScheme.set` + AsyncStorage(NW 자동) + profiles.appearance_mode | 플랫폼 차이 — 효과 동일 |
| 옵션 개수 | 2개 (dark/light) | 2개 (verbatim) | spec v0.1.0 line 877 "카드 3개 (시스템/다크/라이트)"는 prose 오류 — JSX 우선. system 옵션 v0.2.0 검토. |
| auto-back | 없음 | 없음 (verbatim) | 변경 없음 |
| toast 메시지 객체 형태 | inline `{ ko: appliedMsg, en: appliedMsg }` (사실상 단일 locale 메시지) | i18n key `settings.appearancePage.appliedToast` | 동일 효과, 우리는 key 기반 |

verbatim 시각 사양 위반 0건.

---

## 9. 토큰/i18n 확장 요청

### 신규 i18n 키
```jsonc
"settings": {
  "appearancePage": {
    "title":        { "ko": "외관", "en": "Appearance" },
    "darkLabel":    { "ko": "다크", "en": "Dark" },
    "lightLabel":   { "ko": "라이트", "en": "Light" },
    "darkDesc":     { "ko": "와인 바 분위기의 짙은 보라 배경.",
                       "en": "Original wine bar mood — deep purple background." },
    "lightDesc":    { "ko": "크림 종이 배경에 와인 강조색.",
                       "en": "Cream paper background with deep wine accents." },
    "appliedToast": { "ko": "테마가 적용됐어요", "en": "Theme applied" },
    "a11yHint":     { "ko": "선택하면 즉시 적용됩니다", "en": "Selecting applies immediately" }
  }
}
```

> 우리 기존 `theme.dark = "다크"`, `theme.light = "라이트"`, `theme.system = "시스템"` 키 존재 (ko.json line 41-45). 본 화면은 `settings.appearancePage.*`로 별도 namespace 사용 — keyscreen messages 일치. `theme.*` 키는 다른 화면이 사용 중일 수 있으므로 그대로 유지.

### 마이그레이션 확장 요청 (supabase-engineer 트리거)
- `profiles` 테이블에 `appearance_mode text NOT NULL DEFAULT 'dark' CHECK (appearance_mode IN ('dark','light'))` 컬럼 추가 (없을 시).
- rn-screen-builder가 `supabase/migrations/` grep → 없으면 Day 6 마이그레이션 1건 추가 요청.

### 토큰 확장 — 없음
SettingsRadioRow 공유. theme 토큰은 design-tokens.ts에 이미 dual 정의.

### NW v4 colorScheme 연동 검증
- `_layout.tsx`에 mount-time `useEffect(() => { if (profile?.appearance_mode) colorScheme.set(profile.appearance_mode); }, [profile?.appearance_mode])` 필요
- THEME_VERIFICATION.md §4-9 게이트 통과 필수: 양쪽 모드에서 settings 화면 자체뿐 아니라 home/cellar/notes 모든 화면이 정상 분기

---

## 10. 검증 체크리스트

- [ ] 옵션 탭 시 화면 자체 색 즉시 전환 (다크↔라이트)
- [ ] **다른 화면(home, cellar, notes)도 즉시 분기됨** — 본 화면을 떠나지 않고도 다른 화면 다녀와도 새 테마 유지
- [ ] back 자동 호출 없음
- [ ] Toast 표시 (자동 dismiss 2500ms)
- [ ] profile.appearance_mode DB persist 검증
- [ ] 앱 재시작 후 마지막 선택 테마 유지 (AsyncStorage + profile 어느 한쪽이라도)
- [ ] dark+ko / dark+en / light+ko / light+en 4조합 시각 캡처
- [ ] description 줄바꿈 정확 (예: 라이트 ko 모드 `크림 종이 배경에 와인 강조색.`은 1줄로 맞음)
- [ ] indicator gold + Check 색 두 모드 동일
- [ ] system 옵션 없음 (spec prose 오류 — JSX/keyscreen 기준 2개)
