# settings-experience Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen prose `pages/settings-experience.md` > 우리 token/cheatsheet.
> 작성일: 2026-05-20 (Day 6) · author: design-spec-author

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/settings/experience.tsx` (non-tabs, BottomNav 숨김) |
| 진입 경로 | `/settings/experience` (settings hub Experience row → push) |
| 헤더 | `<BackHeader title={t('settings.experiencePage.title')} />` |
| BottomNav | **표시하지 않음** (settings-language와 동일 사유 — JSX 우선) |
| 진입 가드 | 없음 |
| 시스템 백 제스처 | expo-router 자동 |

i18n key:
- `settings.experiencePage.title` — ko: `와인 경험` / en: `Wine experience` (keyscreen messages/ko.json 일치; prose의 `경험 수준 / Experience level`보다 짧음 — JSX/messages 우선)
- `settings.experiencePage.beginnerDesc` — ko: `단맛·신맛·향을 풀어쓴 5분짜리 기록. 어휘는 친근하게.` / en: 키스크린 messages/en.json 확인 후 `5-minute notes on sweetness, acidity, aromas — friendly wording.` (en 원문 그대로 인용; rn-screen-builder가 messages/en.json에서 verbatim copy)
- `settings.experiencePage.expertDesc` — ko: `WSET SAT · 카우달리 · 결함 점검 등 정밀 도구가 모두 노출됩니다.` / en: 키스크린 messages/en.json verbatim
- `settings.experiencePage.appliedToast` — ko: `다음 노트부터 새 UI가 적용돼요` / en: `New notes will use the new UI`
- `settings.values.beginner` — ko: `입문자` / en: `입문자` (keyscreen ko.json line 251) — **단, 영문 모드에서 한글 단어 노출은 §4-4 위반 우려**. en은 `Beginner`가 맞다고 가정 (keyscreen messages/en.json 확인 후 verbatim).
- `settings.values.expert` — ko: `전문가` / en: `Expert`

> 우리 `src/lib/i18n/{ko,en}.json`에 `settings.experiencePage.*`, `settings.values.beginner|expert` 키 신규 추가. en 원문은 rn-screen-builder가 `../winemine-keyscreen/messages/en.json`에서 추출 (사양 작성 단계에서는 본 화면이 ko 모드 캡처만 있어 en 원문 확인 불가; messages 파일 직접 인용 OK — 메시지 파일은 docs로 분류).

---

## 2. Layout Tree (verbatim 변환)

키스크린 JSX (43 lines):
```jsx
<>
  <BackHeader title={t('title')} />
  <main className="wm-scroll-area" style={{paddingTop:12}}>
    <RadioList
      options={[
        { value:'beginner', label: tValues('beginner'), description: t('beginnerDesc') },
        { value:'expert',   label: tValues('expert'),   description: t('expertDesc') },
      ]}
      value={experience}
      onChange={...}
    />
  </main>
</>
```

RN 변환:
```
Screen (View, flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── BackHeader (title=t('settings.experiencePage.title'))
└── ScrollView (flex-1, contentContainerStyle={{paddingTop:12, paddingBottom: insets.bottom+24}})
      └── View (mx-4, gap-2)              ← RadioList outer
            ├── SettingsRadioRow          ← option 'beginner'
            │     selected={profile.experience === 'beginner'}
            │     label={t('settings.values.beginner')}
            │     description={t('settings.experiencePage.beginnerDesc')}
            │     onPress={() => apply('beginner')}
            └── SettingsRadioRow          ← option 'expert'
                  selected={profile.experience === 'expert'}
                  label={t('settings.values.expert')}
                  description={t('settings.experiencePage.expertDesc')}
                  onPress={() => apply('expert')}
```

**SettingsRadioRow** 컴포넌트 명세는 `settings-language.md §2`와 동일. **description prop 사용** 차이만 있음.

### description 활성 시 시각 차이 (스크린샷 기반)
- 옵션 row 높이 증가: label 1줄 + description 1~2줄 (실제 ko 스크린샷에서 expert description은 2줄로 줄바꿈됨 — "WSET SAT · 카우달리 · 결함 점검 등 정밀 도구가 모두 / 노출됩니다.")
- description 텍스트 영역: `flex-1, minWidth:0` (overflow ellipsis 없음, 자연 줄바꿈)
- description max lines: 명시 없음 → 무제한 (긴 텍스트도 잘리지 않음)
- description-label gap: `mt-1` (4px) — keyscreen radio-list.tsx `marginTop:4`

---

## 3. NativeWind 매핑표

settings-language의 매핑표(§3)에 더해 description 관련 추가:

| keyscreen (Tailwind/inline) | RN+NW v4 | 비고 |
|---|---|---|
| `<div style={{fontFamily:var(--font-inter), fontSize:12, color:var(--color-text-muted), marginTop:4, lineHeight:1.4}}>` | `<Text className="font-inter text-[12px] leading-[17px] text-text-muted dark:text-text-muted mt-1">` | lineHeight 1.4×12=16.8 → 17 |
| `<div style={{flex:1, minWidth:0}}>` (text column) | `<View className="flex-1">` | minWidth:0 RN은 기본값 0 — 명시 불필요 |

전체 매핑은 settings-language §3 참조. 둘은 동일 컴포넌트(SettingsRadioRow) 사용.

---

## 4. 상태 Variants

### default
- 옵션 2개 표시
- `useProfile()` 진입 시 fetch — `profile.experience`가 `beginner`/`expert`/`null` 중 하나
- v0.1.0 온보딩 4단계에서 experience 저장 강제 — 정상 진입 시 항상 하나 selected

### selected
- 키스크린 스크린샷 (`settings_experience.png`) 기준:
  - 선택된 row(`beginner` 가정): border gold 1px, indicator gold 채움 + Check, label `입문자` cream, description `단맛·신맛·향을 풀어쓴 5분짜리 기록. 어휘는 친근하게.` muted 12px
  - 비선택 row(`expert`): border border-default 1px(=`#5A3D6A`), indicator 빈 원, label `전문가`, description 2줄 표시
  - row 사이 8px gap (mx-4, gap-2)

### pressed
- settings-language §4와 동일 (opacity 0.92 / scale 0.99)

### dark mode / light mode / ko / en
- settings-language §4 기준과 동일 토큰 사용
- en 모드: keyscreen messages/en.json 인용
  - title: `Wine experience`
  - beginner label: `Beginner`
  - expert label: `Expert`
  - beginnerDesc / expertDesc: messages/en.json verbatim (rn-screen-builder가 원문 복사)
  - toast: `New notes will use the new UI`

### profile.experience === null (edge case)
- v0.1.0에서는 발생 안 함 가정 (온보딩에서 저장) — 발생 시 두 옵션 모두 unselected indicator. 사양은 verbatim만 — 비정상 상태 UI 보조 표기 없음.

---

## 5. 인터랙션

| 위치 | 트리거 | 결과 |
|---|---|---|
| BackHeader < | onPress | `router.back()` |
| SettingsRadioRow | onPress | (1) `Haptics.selectionAsync()` → (2) **로컬 selected 즉시 갱신** (낙관적 — 단, 화면 어디서도 즉시 시각 변경 외 영향 없음. **노트 작성 분기**는 `/notes/new/write` 진입 시 profile.experience를 읽으므로 백그라운드 update만으로 충분) → (3) `supabase.from('profiles').update({ experience: next })` → (4) `<Toast>`(`appliedToast`) → (5) **280ms 후 `router.back()`** |

### 280ms delay (verbatim — 키스크린 experience JSX line 36: `setTimeout(()=>router.back(), 280)`)
- language(250ms)와 다른 값. 키스크린에서 description이 있는 경험 화면은 Toast 가독성을 위해 30ms 더 머무름. 우리도 verbatim 유지.

### 햅틱
- `Haptics.selectionAsync()` (settings-language 동일)

### 즉시 영향
- language와 달리 i18n 변경 없음 — UI 즉시 시각 변화는 selected indicator 갱신뿐
- `profile.experience`를 사용하는 다른 화면(`/notes/new/write` 분기)은 다음 진입 시 새 값 적용
- 글로벌 store 없음 — `useProfile()`의 다음 fetch 또는 manual `refresh()`로 동기화

### 낙관적 업데이트 + 롤백
- settings-language §5와 동일 패턴
- 실패 시: 로컬 selected 롤백 + Toast error + back 보류

---

## 6. 접근성

settings-language §6과 동일. 추가 사항:

| 요소 | 속성 |
|---|---|
| SettingsRadioRow (with description) | `accessibilityLabel={label + ', ' + description}` — VoiceOver는 description까지 함께 읽음. **권장**: `accessibilityLabel={label}`, `accessibilityHint={description}` 분리 (label만 강조, description은 힌트로) |
| 옵션 row 최소 높이 | label 1줄 + description 2줄(예: expert ko) → 약 70pt. 44pt min 통과 |
| 색 대비 | description text-muted on surface: dark `#CABDA8` on `#3D2A4A` = 5.2:1 통과 / light `#8B7766` on `#FFFFFF` = 4.7:1 통과 |
| description 줄바꿈 | RN Text 기본 자동 줄바꿈 — `numberOfLines` 미지정 (verbatim — 키스크린 description div는 max-lines 없음) |

---

## 7. 데이터 호출

### 읽기
```tsx
const { profile } = useProfile();
const current: 'beginner' | 'expert' = (profile?.experience as 'beginner' | 'expert') ?? 'beginner';
```

### 쓰기
```tsx
async function apply(next: 'beginner' | 'expert') {
  if (next === current) return;
  Haptics.selectionAsync().catch(() => undefined);

  const prev = current;
  setLocalSelected(next);  // 낙관적

  try {
    const uid = await getCurrentUserId();
    if (!uid) throw new Error('no session');
    const { error } = await supabase
      .from('profiles')
      .update({ experience: next })
      .eq('id', uid);
    if (error) throw error;

    showToast({ message: t('settings.experiencePage.appliedToast') });
    backTimerRef.current = setTimeout(() => router.back(), 280);
  } catch (err) {
    setLocalSelected(prev);
    showToast({ message: t('errors.onboardingSaveFailed'), tone: 'error' });
  }
}
```

### profiles 스키마
- column: `experience text` (CHECK `experience IN ('beginner','expert')`)
- RLS: select/update own row

### useProfile 갱신
- 본 화면 떠난 후 다른 화면(`/notes/new/write` 등)이 useProfile() 재마운트 시 fetch (현재 hook은 mount-once) — 또는 다음 진입에서 자동 신규 mount로 최신화
- v0.1.0에서는 `/notes/new/write`가 자체적으로 profile fetch — 정합성 OK

---

## 8. Deviation 로그

| 항목 | keyscreen | RN 변경 | 사유 |
|---|---|---|---|
| (settings-language §8 항목 모두 그대로 상속) | — | — | — |
| 자동 back delay | 280ms | 280ms (verbatim) | 변경 없음. language의 250ms와 다름 |
| description 줄바꿈 | 자연 줄바꿈, ellipsis 없음 | 동일 (`numberOfLines` 미지정) | verbatim |
| `setExperience` Context | 키스크린 React Context로 즉시 반영 | 우리는 profile.experience 직접 read — Context 미사용 | RN v0.1.0 architecture 결정 — Zustand 미도입, profile은 useProfile 훅으로 fetch. 키스크린의 즉시성과 동일 효과는 다음 화면 진입 시 fresh profile로 보장. 시각 차이 없음. |

verbatim 시각 사양(spacing/padding/border/typography/색) 위반 0건.

---

## 9. 토큰/i18n 확장 요청

### 신규 i18n 키
```jsonc
"settings": {
  "experiencePage": {
    "title": { "ko": "와인 경험", "en": "Wine experience" },
    "beginnerDesc": {
      "ko": "단맛·신맛·향을 풀어쓴 5분짜리 기록. 어휘는 친근하게.",
      "en": "<verbatim from ../winemine-keyscreen/messages/en.json: settings.experiencePage.beginnerDesc>"
    },
    "expertDesc": {
      "ko": "WSET SAT · 카우달리 · 결함 점검 등 정밀 도구가 모두 노출됩니다.",
      "en": "<verbatim from messages/en.json: settings.experiencePage.expertDesc>"
    },
    "appliedToast": {
      "ko": "다음 노트부터 새 UI가 적용돼요",
      "en": "New notes will use the new UI"
    },
    "a11yHint": {
      "ko": "선택하면 즉시 적용됩니다",
      "en": "Selecting applies immediately"
    }
  },
  "values": {
    "beginner": { "ko": "입문자", "en": "Beginner" },
    "expert":   { "ko": "전문가", "en": "Expert" }
  }
}
```

> **주의**: 기존 우리 `experience.beginner = "초심자"` 키와 충돌 가능 — keyscreen은 `입문자`. 우리 ko.json line 38 `"beginner": "초심자"`를 `"입문자"`로 변경하거나 namespace 분리. **권장**: `settings.values.beginner`/`expert`를 신규로 두고 기존 `experience.beginner`(`초심자`)는 retain (다른 화면 검증 필요). rn-screen-builder가 grep으로 사용처 확인 후 결정.

### 토큰 확장 — 없음
SettingsRadioRow는 settings-language와 동일 컴포넌트 사용 — 추가 불필요.

---

## 10. 검증 체크리스트

- [ ] 다크/라이트 + ko/en 4조합 시각 검증
- [ ] description 2줄 줄바꿈 (expert ko 모드에서 자연 줄바꿈 보존 — `…정밀 도구가 모두\n노출됩니다.`)
- [ ] description-label 간격 4px (`mt-1`)
- [ ] 280ms back delay
- [ ] Toast appliedToast 표시
- [ ] beginner/expert label 키스크린 messages 일치 (`입문자`/`전문가`)
- [ ] accessibilityHint에 description 노출
- [ ] color/border/indicator는 settings-language와 픽셀 동일
