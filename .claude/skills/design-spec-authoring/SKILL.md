---
name: design-spec-authoring
description: "winemine 화면별 RN+Expo 디자인 사양 작성 가이드. ../winemine-keyscreen/src/ JSX 재귀 읽기, NativeWind v4 매핑표 작성, 상태 variants(default/loading/empty/error/dark/light) + 인터랙션·접근성 명세, deviation 사유 로깅. _workspace/design-specs/{route}.md 산출물 표준 템플릿. rn-screen-builder 이전 게이트로 동작. 12 화면 신규 + 기존 retroactive hardening 모두 적용. 디자인 사양 작성, 키스크린 → RN 변환, verbatim 사양, 사양 우선 변환 요청 시 사용."
---

# Design Spec Authoring — winemine Phase 2 시안 → RN+Expo 사양 변환 절차

이 스킬은 design-spec-author가 사양을 작성할 때 따르는 절차다. 핵심 원칙: **verbatim 변환 + JSX 재귀 + 매핑표**.

## 진실 소스 우선순위 (절대 순서)

1. `../winemine-keyscreen/src/**/*.tsx` JSX (1순위 — 자식 컴포넌트 모두 재귀)
2. `../winemine-keyscreen/pages/{route}.md` 산문 (보조 — JSX와 불일치 시 JSX 우선)
3. `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md` 토큰 정의
4. `_workspace/keyscreen-shots/{route}.png` 시각 reference (있을 때 — P2 세션이 채움)
5. `docs/NEXT_TO_RN_TRANSLATION.md` 변환 치트시트 (있을 때 — P0 세션이 채움)
6. `docs/spec/v0.1.0.md`의 `<aesthetic_guidelines>`, `<pages_and_interfaces>`

## 사양 작성 5단계 절차

### Step 1: 입력 수집

- 화면 라우트 확인 (예: `/wine/[lwin]`)
- JSX 파일 위치 찾기 (`../winemine-keyscreen/src/pages/wine.tsx` 등 — 구조에 맞게)
- 자식 컴포넌트 모두 식별 → import 추적하여 재귀 Read
- 산문(`pages/{route}.md`), 스크린샷, 토큰 정의 함께 로드

### Step 2: 레이아웃 트리 추출

JSX 구조 → RN 컴포넌트 트리 매핑.

| Next/HTML | RN | 비고 |
|---|---|---|
| `<div>` | `<View>` | 기본 |
| `<button>` | `<Pressable>` | onPress + press feedback |
| `<a>` | `<Link href=...>` from expo-router | 또는 `<Pressable onPress>` |
| `<input>` | `<TextInput>` | controlled |
| `<img>` | `<Image>` 또는 expo-image | width/height 명시 |
| `<ul><li>` | `<FlatList>` 또는 map + View | 큰 리스트는 FlatList |
| `<form>` | `<View>` (form 개념 없음) | 폼 상태는 useState/zod |
| 스크롤 영역 | `<ScrollView>` | 또는 FlatList |
| 상단 고정 | `headerLeft/Right` (expo-router) | sticky 없음 |
| Portal/Modal | `<Modal>` 또는 BottomSheet | |

### Step 3: NativeWind 매핑표 작성

각 JSX 노드의 className을 분석하고 다음 4가지 결과 중 하나로 분류:

| 결과 | 의미 | 예시 |
|---|---|---|
| **(A) 동등** | NW v4가 동일 토큰 지원 | `rounded-2xl` → `rounded-2xl` |
| **(B) 토큰 매핑** | design-tokens.ts에 정의된 이름으로 | `bg-zinc-900` → `bg-surface-elevated` |
| **(C) NW 부재 → 토큰 확장 요청** | NW v4 기본에 없음 → tailwind.config.ts 확장 | `gap-7` → spacing[7] = 28px 추가 후 사용 |
| **(D) RN 제약 → deviation** | RN 자체에 없는 CSS 기능 | `backdrop-blur-md` → expo-blur BlurView |

매핑표 형식:

```markdown
| 키스크린 클래스 | RN+NW v4 변환 | 분류 | 비고 |
|---|---|---|---|
| `rounded-2xl` | `className="rounded-2xl"` | A | 동등 |
| `bg-zinc-900` | `className="bg-surface-elevated"` | B | 토큰 정의 |
| `gap-7` | `className="gap-7"` (+ tailwind.config 확장) | C | spacing[7]=28px |
| `backdrop-blur-md` | `<BlurView intensity={40} tint="dark"/>` | D | RN CSS backdrop-filter 없음 |
| `shadow-lg` | `style={shadow.lg}` (+ design-tokens 확장) | C | NW v4 shadow 부재 |
| `hover:scale-105` | `Pressable {pressed && {transform:[{scale:0.98}]}}` | D | RN hover 없음 |
| `transition-colors` | Reanimated `useAnimatedStyle` | D | RN CSS transition 없음 |
| `bg-[#7a2348]` | `className="bg-wine-burgundy"` (+ 토큰) | C | 하드코딩 hex → 토큰화 필수 |
```

### Step 4: 상태 variants 명세

각 화면이 가지는 상태별 표현 명시:

- **default**: 정상 데이터 로드된 상태
- **loading**: 데이터 fetch 중. 스켈레톤 / spinner / placeholder
- **empty**: 데이터 없음. EmptyState 컴포넌트 + i18n 메시지 + CTA
- **error**: 데이터 실패. Toast (variant=error) + 재시도 버튼
- **dark**: 다크 모드 색 적용 (NW dark: 또는 useColorScheme 분기)
- **light**: 라이트 모드 색 적용
- **권한 거부** (해당 시): 카메라 등 권한 거부 fallback UI

### Step 5: 인터랙션·접근성 + Deviation 로그

- 모든 Pressable: onPress 동작 + expo-haptics light + `accessibilityRole="button"` + `accessibilityLabel`
- 입력 필드: `accessibilityLabel`, autoFocus 정책
- 스크롤: pull-to-refresh 여부, momentum
- 모달/Drawer: dismiss 동작
- Deviation 항목: RN 제약으로 1:1 변환 못한 모든 항목 + 사유

## 산출물 파일 구조

`_workspace/design-specs/{route}.md` (route는 `/` → `_`로 치환, 예: `/wine/[lwin]` → `wine_lwin.md`)

진행 로그: `_workspace/06_design_specs_day{N}.md` (작성 완료 route 목록 + 토큰 확장 요청 집계)

## 자주 발생하는 변환 패턴 (치트시트)

### linear-gradient

키스크린:
```jsx
<div className="bg-gradient-to-br from-zinc-900 to-red-950" />
```

RN:
```tsx
import { LinearGradient } from 'expo-linear-gradient';
<LinearGradient
  colors={[colors.zinc[900], colors.red[950]]}
  start={{x:0, y:0}}
  end={{x:1, y:1}}
  style={StyleSheet.absoluteFillObject}
/>
```

매핑표: `bg-gradient-to-br from-X to-Y` → `<LinearGradient colors={[X,Y]} start={{0,0}} end={{1,1}}/>` (분류 D)

### backdrop-blur

키스크린:
```jsx
<div className="backdrop-blur-md bg-white/30" />
```

RN:
```tsx
import { BlurView } from 'expo-blur';
<BlurView intensity={40} tint="light" style={...} />
// 또는 fallback: <View className="bg-white/30" /> (Android 일부 디바이스)
```

분류 D — deviation 사유: "RN CSS backdrop-filter 없음, BlurView 사용 또는 반투명 단색 fallback"

### shadow

키스크린:
```jsx
<div className="shadow-lg" />
```

RN (iOS):
```tsx
style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 8,
}}
```

RN (Android):
```tsx
style={{ elevation: 4 }}
```

분류 C — design-tokens.ts에 `shadows.lg = { ...iOS, ...Android }` 정의 권장

### hover:*

키스크린:
```jsx
<button className="hover:opacity-80 hover:scale-105">
```

RN:
```tsx
<Pressable>
  {({ pressed }) => (
    <View
      style={{
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      }}
    >
      ...
    </View>
  )}
</Pressable>
```

분류 D — deviation 사유: "RN hover 개념 없음, press feedback으로 대체"

## 절대 금지

- `../winemine-keyscreen/` 어떤 파일도 수정 (CLAUDE.md §4-3)
- 키스크린 JSX에 없는 요소를 "개선"으로 사양에 추가 (verbatim 위반)
- 키스크린 JSX에 있는 요소를 "단순화"로 사양에서 누락 (verbatim 위반)
- 사양에 emoji (§4-1)
- 사양에 산문 한국어 텍스트 하드코딩 — i18n key로 (§4-4)
- 다크 모드 또는 라이트 모드만 명세 (양쪽 동시 명시 §4-9)
- 키스크린의 임의 hex (`#7a2348`)를 사양에 그대로 옮김 — 토큰화 요청으로 변환 (§4-9)

## 다크/라이트 양쪽 명세 표준

키스크린의 `dark:bg-X bg-Y` 패턴 → RN 사양:

```markdown
### 다크/라이트 명세

- 배경 (Container)
  - dark: `colors.surface.dark` (design-tokens.ts) — NW className `bg-surface-dark`
  - light: `colors.surface.light` — NW className `bg-surface-light`
  - 사용: `className="bg-surface-light dark:bg-surface-dark"`

- 텍스트 (제목)
  - dark: `colors.text.primary.dark`
  - light: `colors.text.primary.light`
  - 대비: WCAG AA 4.5:1 양쪽 통과 (design-reviewer가 검증)
```

## 자세한 reference

- 자세한 변환 패턴: `docs/NEXT_TO_RN_TRANSLATION.md` (P0 세션 산출물)
- 토큰 정의: `src/lib/design-tokens.ts`, `tailwind.config.ts`
- 키스크린 원본: `../winemine-keyscreen/src/` (read-only)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/*` (read-only)
