# Next.js + Tailwind → RN + NativeWind v4 변환 치트시트

> winemine v0.1.0 — Phase 2 시안(`../winemine-keyscreen/`) 화면을 RN+Expo로 옮길 때 사용하는 변환 패턴 사전.
> 주 사용자: `design-spec-author` (사양 작성 시 매핑표 작성), `rn-screen-builder` (사양 보고 구현 시 deviation 사유 확인).
>
> 진실 순서: **JSX 원본 > 이 문서 > NW v4 docs**. 이 문서의 패턴이 원본 JSX와 충돌하면 JSX 우선.
> 마지막 갱신: 2026-05-20 (P0 토큰 확장과 동시 작성)

---

## 0. 절대 원칙

1. **verbatim 변환** — 키스크린 JSX에 있는 요소·spacing·typography·색은 그대로 옮김. "개선"·"단순화" 금지 (CLAUDE.md §4-3 frozen).
2. **deviation 사유 명시** — RN 자체 제약(backdrop-filter·CSS grid·hover 등)으로 1:1 변환 불가할 때만 다른 방식 허용. design spec의 deviation 섹션에 사유 기록.
3. **하드코딩 hex 금지** — `design-tokens.ts` / `tailwind.config.ts` / `lwin.ts` 외에는 hex 등장 금지. 키스크린 인라인 hex(`#7a2348` 등) 발견 시 토큰 추가 요청 (CLAUDE.md §4-9).
4. **ko/en + dark/light 양쪽 필수** — 한쪽만 명세하거나 구현 X (§4-4, §4-9).

---

## 1. 색·hex 토큰화

키스크린은 Tailwind v4 CSS-first 방식. `styles/tokens.css`와 `src/app/globals.css`의 `@theme` 블록에 CSS 변수로 정의됨. RN에서는 이를 우리 `design-tokens.ts` + `tailwind.config.ts`로 1:1 매핑.

| 키스크린 CSS var | NW className | design-tokens.ts |
|---|---|---|
| `var(--color-wine-red)` | `bg-wine-red` / `text-wine-red` | `brand.wineRed` |
| `var(--color-gold)` | `bg-gold` / `text-gold` | `brand.gold` |
| `var(--color-gold-soft)` | `bg-gold-soft` | `brand.goldSoft` |
| `var(--color-cream)` | `bg-cream` / `text-cream` | `brand.cream` (light에서는 dark brown) |
| `var(--color-bg-deepest)` | `bg-bg-deepest` (+ `dark:bg-bg-deepest`) | `dark.bg.deepest` / `light.bg.deepest` |
| `var(--color-bg-deep)` | `bg-bg-deep` | `dark.bg.deep` / `light.bg.deep` |
| `var(--color-surface)` | `bg-surface` | `dark.bg.surface` / `light.bg.surface` |
| `var(--color-bg-sunken)` | `bg-bg-sunken` | `dark.bg.sunken` / `light.bg.sunken` |
| `var(--color-bottle-shelf)` | `bg-bottle-shelf` | `dark.bg.bottleShelf` / `light.bg.bottleShelf` |
| `var(--color-text-primary)` | `text-text-primary` | `dark.text.primary` / `light.text.primary` |
| `var(--color-text-secondary)` | `text-text-secondary` | `dark.text.secondary` / `light.text.secondary` |
| `var(--color-text-muted)` | `text-text-muted` | `dark.text.muted` / `light.text.muted` |
| `var(--color-border-default)` | `border-border-default` | `dark.border.default` / `light.border.default` |
| `var(--color-border-active)` | `border-border-active` | `dark.border.active` / `light.border.active` |
| `var(--color-error)` | `bg-status-error` / `text-status-error` | `status.errorDark` / `status.errorLight` |
| `var(--color-success)` | `bg-status-success` | `status.success` |
| `var(--color-glass-bg)` | `bg-glass-bg` | `dark.glass.bg` / `light.glass.bg` |

**다크/라이트 분기 표기**: NW v4의 `darkMode:'class'` + 우리 `{ DEFAULT, light }` color shape 덕분에 `className="bg-bg-deepest"`만 써도 자동 분기. 명시적으로 두 모드 분리 표기하고 싶으면 `className="bg-bg-deepest-light dark:bg-bg-deepest"`처럼 적되, 한쪽 누락 시 §4-9 위반.

**임의 hex 발견 시 처리**: 키스크린에 `style={{background:'#7a2348'}}` 같은 임의 hex 사용처가 있다면 → design-tokens.ts에 토큰 추가 요청 (P0 세션 누적 보고). 사양에 `bg-[#7a2348]` 같이 NW arbitrary value로 옮기지 말 것.

---

## 2. Linear Gradient

CSS `linear-gradient` → RN `expo-linear-gradient`.

### 패턴 (분류 D — RN 자체 미지원)

키스크린:
```jsx
<div className="bg-gradient-to-br from-zinc-900 to-red-950" />
```

또는 인라인:
```jsx
<div style={{ background: 'linear-gradient(135deg, #251837 0%, #2E1F3F 100%)' }} />
```

RN:
```tsx
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#251837', '#2E1F3F']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={StyleSheet.absoluteFillObject}
/>
```

### 각도 → start/end 환산표

CSS `linear-gradient(Xdeg, ...)`의 X를 expo-linear-gradient의 `start` / `end` 좌표로 변환.

| CSS 각도 | start | end | 비고 |
|---|---|---|---|
| 0deg (위→아래) | `{x:0.5, y:0}` | `{x:0.5, y:1}` | `to bottom` |
| 90deg (왼→오른) | `{x:0, y:0.5}` | `{x:1, y:0.5}` | `to right` |
| 135deg (좌상→우하) | `{x:0, y:0}` | `{x:1, y:1}` | `to bottom right` |
| 160deg | `{x:0.18, y:0}` | `{x:0.82, y:1}` | 근사 |
| 180deg (아래→위) | `{x:0.5, y:1}` | `{x:0.5, y:0}` | `to top` |
| 270deg (오른→왼) | `{x:1, y:0.5}` | `{x:0, y:0.5}` | `to left` |

### 중간 stop / 다중 색

CSS `linear-gradient(to top, #251837 70%, rgba(37,24,55,0))` → `locations` prop.

```tsx
<LinearGradient
  colors={['rgba(37,24,55,0)', '#251837']}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  locations={[0, 0.7]}
/>
```

### winemine 전용 gradient 토큰 (design-tokens.ts)

이미 정의됨 — 사양에서는 토큰 이름만 참조:

| 사용처 | 토큰 |
|---|---|
| 페이지 배경 | `gradients.pageBg.dark` / `.light` |
| BottomNav 위 fade | `gradients.bottomNavFade.dark` / `.light` |
| FAB (카메라 버튼) | `gradients.fab.dark` / `.light` |
| Expert blind mode 배경 | `gradients.expertBlind` |
| 와인병 placeholder | type별 — `bottleColorDefault[type]` → `dark.bg.bottleShelf` (단색→어두운 끝점) |

---

## 3. Backdrop Blur

CSS `backdrop-filter: blur(...)` 또는 `backdrop-blur-*` 클래스 → RN `expo-blur`.

### 패턴 (분류 D)

키스크린:
```jsx
<div className="backdrop-blur-md bg-white/30" />
```

RN:
```tsx
import { BlurView } from 'expo-blur';

<BlurView intensity={40} tint="light" style={...}>
  {/* children */}
</BlurView>
```

**intensity 환산** (대략):

| Tailwind | intensity |
|---|---|
| `backdrop-blur-sm` | 20 |
| `backdrop-blur-md` | 40 |
| `backdrop-blur-lg` | 60 |
| `backdrop-blur-xl` | 80 |

**tint**: `'light'` / `'dark'` / `'default'`. 다크 모드 분기 시 `useColorScheme()` 으로 토글.

**Android 제약**: 일부 디바이스에서 BlurView 성능 저하 → fallback으로 반투명 단색(`<View className="bg-glass-bg" />`) 사용. design-spec에 deviation으로 명시.

---

## 4. Shadow / Elevation

CSS `box-shadow` → RN iOS shadow* props + Android `elevation`. 두 플랫폼 분기 필수.

### 패턴 (분류 C — design-tokens.ts shadows 사용)

키스크린:
```jsx
<div className="shadow-lg" />
```

RN:
```tsx
import { shadows } from '@/lib/design-tokens';
<View style={shadows.lg} />
```

또는 인라인:
```tsx
<View style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.28,
  shadowRadius: 16,
  elevation: 8,
}} />
```

### NW v4 shadow utility 미지원

NativeWind v4는 Tailwind `shadow-*` 클래스를 **className으로 RN shadow에 자동 변환하지 않음**. 모두 inline style로 옮겨야 함.

`className="shadow-lg"` 작성 시 일부 패턴에서는 작동할 수 있으나 일관성 위해 **항상 `style={shadows.lg}` 사용 권장**.

### 키스크린 box-shadow → 우리 토큰 매핑

| 키스크린 | 우리 토큰 |
|---|---|
| `0 24px 64px rgba(0,0,0,0.5)` (modal) | `shadows.xl` / `shadows.modal` |
| `0 6px 20px rgba(139,26,42,0.45)` (fab dark) | `shadows.fabDark` |
| `0 6px 20px rgba(184,148,56,0.32)` (fab light) | `shadows.fabLight` |
| 카드 일반 | `shadows.md` 또는 `shadows.card` |
| 미세 floating | `shadows.sm` |
| 크게 떠있는 카드 | `shadows.lg` |
| 골드 글로 (level 강조) | `shadows.goldGlow` |

### inset shadow

CSS `inset 0 1px 0 rgba(255,255,255,0.12)` 같은 inner shadow는 **RN에서 직접 표현 불가**. 분류 D:
- 옵션 A: 무시 (FAB은 외부 shadow만으로도 충분)
- 옵션 B: 별도 `<View>` 내부에 border-top: 1px solid rgba(...) 추가
- 옵션 C: `react-native-shadow-2` 라이브러리 (v0.1.0 스코프 외)

→ 기본값 **옵션 A**. deviation 사유 명시.

---

## 5. Hover / Press 상태

RN에는 hover 개념 없음 (web 환경 제외). press feedback으로 대체.

### 패턴 (분류 D)

키스크린:
```jsx
<button className="hover:opacity-80 hover:scale-105 active:scale-95">
```

RN:
```tsx
<Pressable
  onPress={...}
  accessibilityRole="button"
>
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

### 매핑 가이드

| 키스크린 | RN |
|---|---|
| `hover:opacity-X` | `pressed && {opacity: X/100}` |
| `hover:scale-Y` | `pressed && {transform:[{scale: Y/100 + 0.scaled}]}` (보수적으로 0.98 권장) |
| `active:bg-X` | `pressed && {backgroundColor: tokens.X}` |
| `hover:bg-X` (link) | press 상태 무시 (그냥 색상 유지) — link는 즉시 navigate |
| `disabled:opacity-50` | `disabled && {opacity: 0.5}` (disabled prop) |
| `focus-visible:ring-2 ring-gold` | `accessibilityRole="button"` + `accessible` + (필요 시 `react-native-focus-ring` v0.2.0+) |

### 햅틱 피드백

키스크린에는 없지만 winemine RN 표준: 모든 의미있는 onPress에 `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` 호출.

---

## 6. Transition / Animation

CSS `transition` / `@keyframes` → `react-native-reanimated` v4 + `react-native-worklets`.

### 단순 색·opacity transition (분류 D)

키스크린:
```jsx
<div className="transition-colors duration-200 hover:bg-gold" />
```

RN:
```tsx
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const opacity = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(opacity.value, { duration: 200 }),
}));
```

→ 비용 큼. **v0.1.0 단순 transition은 무시 권장**. press feedback만으로 충분. deviation 명시.

### Keyframe animation

키스크린 `@keyframes scanLine` 같은 무한 루프 애니메이션 → Reanimated `withRepeat`. v0.1.0 스코프 외 (Phase 2 시안의 캡처 화면 scan line 등).

### List entry animation

`FlatList` itemLayoutAnimation 또는 Reanimated `entering` prop. 사양에 명시 없으면 무시.

---

## 7. Selector 의사 클래스

| CSS | RN 대체 |
|---|---|
| `:hover` | press feedback (위) |
| `:focus` | `accessibilityState={{selected:true}}` + 시각 표현 |
| `:focus-visible` | 같음. RN web target 시만 의미. 모바일은 무시 |
| `:active` | press state |
| `:disabled` | `disabled` prop + opacity 0.5 |
| `:first-child` / `:last-child` | map index 비교 (`index === 0` / `index === arr.length - 1`) |
| `:nth-child(n)` | map index 산술 |
| `group-hover:X` | `<Pressable>` 부모에서 `pressed` 전달받아 자식에 prop으로 |
| `peer-checked:X` | useState로 명시 토글 |
| `[&>div]:X` arbitrary child selector | 자식 컴포넌트에 직접 className |

---

## 8. Layout: sticky / fixed / grid / sr-only

| CSS | RN |
|---|---|
| `position: sticky` | 없음. ScrollView `stickyHeaderIndices` 또는 expo-router headerLargeStyle |
| `position: fixed` | `<View style={{position:'absolute'}}>` + safe-area-context |
| `display: grid` | `flexbox`로 변환. 2D grid는 `<View>` rows + cols 중첩 |
| `grid-cols-N` | `<View style={{flexDirection:'row', flexWrap:'wrap'}}>` + 자식 `width: 100/N + '%'` |
| `sr-only` (visually hidden) | `accessibilityLabel` prop으로. 텍스트 자체는 제거 |
| `overflow: hidden` | `<View style={{overflow:'hidden'}}>` (동등) |
| `overflow: scroll` | `<ScrollView>` 또는 `<FlatList>` |
| `scroll-snap-*` | `<ScrollView pagingEnabled snapToInterval>` |

### Safe area

웹에는 없는 RN 필수 패턴. 모든 화면 root에 `useSafeAreaInsets()` 또는 `<SafeAreaView edges={['top','bottom']}>`.

---

## 8a. Yoga vs CSS box model — verbatim이 깨지는 primitive

> **CRITICAL**: 이 섹션은 4 라운드 BottomNav FAB 버그 fix 학습 누적. 키스크린 JSX를 그대로 옮겨도 **시각 의미가 다르게 작동하는** primitive들. **변환 전 이 표를 grep 의무**.
>
> rn-screen-builder는 코드 작성 전 `grep -rn "marginTop: -\|marginLeft: -\|marginRight: -\|marginBottom: -"` 후 사용처가 아래 사전의 "깨짐" 카테고리에 속하는지 판단.

### 8a-1. 음수 margin (negative margin)

**유형 A — Flex 자식의 음수 margin으로 부모 위로 튀어나오기 (BREAK)**

키스크린 패턴 (web CSS — 작동):
```jsx
// BottomNav: position:absolute 컨테이너 + FAB의 marginTop: -24로 위로 튀어나옴
<nav style={{ position: 'absolute', bottom: 0, ... }}>
  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
    <Link style={{ width: 52, height: 52, marginTop: -24, ... }} />  {/* poke up */}
  </div>
</nav>
```

**RN에서 깨지는 이유**: Yoga 레이아웃 엔진은 `flexDirection: 'row'` + `alignItems: 'flex-end'` 부모의 자식에 `marginTop: -N`을 줘도 자식의 visual position만 옮길 뿐 부모의 시각 영역 위로 안 튀어나옴. 부모 sibling(react-navigation의 screens container)이 `overflow: 'hidden'`이면 더더욱 깨짐.

**RN equivalent** — `transform: [{ translateY: -N }]` 또는 `position: 'absolute'`:
```tsx
// 옵션 A — transform translateY (layout 영향 X, 시각만 이동)
<Pressable style={{
  width: 56, height: 56, borderRadius: 28,
  transform: [{ translateY: -24 }],
  ...
}} />

// 옵션 B — 부모를 position:relative 역할 + 자식 absolute
<View style={{ flex: 1, height: 40 }}>
  <Pressable style={{
    position: 'absolute',
    bottom: 16,           // 부모 paddingBottom 정합
    left: '50%',
    marginLeft: -28,      // width/2 = 가운데 정렬 (이건 작동, 8a-2 참조)
    width: 56, height: 56, borderRadius: 28,
  }} />
</View>
```

**검증**: iOS Sim + 핸드폰 Expo Go 양쪽에서 FAB가 BottomNav 위로 24px 튀어나오는지.

---

**유형 B — `position: absolute` 자식의 음수 margin centering trick (OK)**

```tsx
// position:absolute + left:N% + marginLeft:-width/2 → 가운데 정렬
<View style={{
  position: 'absolute',
  left: `${peakPct}%`,
  width: 2, height: 16,
  marginLeft: -1,        // = -width/2, 작동함
}} />
```

이 패턴은 RN에서도 작동. CSS centering trick과 동일.

---

**유형 C — 형제 요소 겹치기 / 간격 미세 조정 (OK)**

```tsx
// 두 Pressable 형제, 두 번째가 -16px 겹침
<View style={{ flexDirection: 'row' }}>
  <Pressable>{/* StarHalf 28 */}</Pressable>
  <Pressable style={{ marginLeft: -16 }}>{/* Star 28 */}</Pressable>  // 작동
</View>
```

```tsx
// 행 간격 미세 조정 (-2 정도)
<Text style={{ marginBottom: -2 /* rowGap 12 보정 */ }}>...</Text>  // 작동
```

형제 간 음수 margin은 부모 box를 넘지 않으므로 RN에서 안전.

---

**판단 룰**:
- 음수 margin이 **부모 box 밖으로 튀어나오는 의도**라면 → `transform` 또는 `position: absolute`로 변환
- 음수 margin이 **형제 겹치기 / 간격 조정 / centering trick** 의도라면 → 그대로 두기 (작동)

### 8a-2. position: absolute + percent-based centering

CSS centering trick (`left: 50% + marginLeft: -width/2`)은 RN에서 작동. `left: '50%'`도 expo-router 환경에서 정상.

### 8a-3. borderRadius full 토큰 (`9999` 또는 `radius.full`)

일부 RN/expo-router 버전에서 9999 같은 매우 큰 값이 무시되어 사각형으로 렌더되는 케이스 발견됨. 안전한 우회:

```tsx
// 위험 (일부 환경에서 무시)
<View style={{ width: 56, height: 56, borderRadius: 9999 }} />

// 안전 (size/2 명시값)
<View style={{ width: 56, height: 56, borderRadius: 28 }} />
```

원형 버튼·아바타·FAB은 **항상 size/2 명시값** 사용. `radius.full` 토큰은 일반 카드용으로만.

### 8a-4. shadow 토큰 spread 무효화

`...fabShadow` 같은 토큰 spread가 일부 환경에서 무시. 안전 우회:

```tsx
// 위험 (spread 무시 케이스 존재)
<View style={{ ...shadows.fabDark }} />

// 안전 (4속성 inline + Android elevation)
<View style={{
  shadowColor: '#8B1A2A',
  shadowOpacity: 0.45,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 20,
  elevation: 12,
}} />
```

FAB·중요 floating 요소는 inline 명시. 일반 카드는 토큰 spread 허용 (시각 차이 적음).

### 8a-5. expo-router custom tabBar의 outer container

`tabBar={(p) => <CustomNav {...p}/>}` 사용 시 outer wrapper가 default `borderTopWidth` / `backgroundColor` / `overflow: 'hidden'` 적용. `tabBarStyle` 명시 필요:

```tsx
<Tabs
  screenOptions={{
    tabBarStyle: {
      borderTopWidth: 0,
      backgroundColor: 'transparent',
      elevation: 0,
      overflow: 'visible',     // FAB 튀어나오기 허용
      // height: 'auto'는 RN에서 무효 — 명시값 또는 미설정
    },
  }}
  tabBar={(p) => <CustomNav {...p} />}
/>
```

### 8a-6. iOS shadow + overflow:'hidden' + LinearGradient 단일 View 충돌

iOS native rendering은 세 가지가 한 Pressable/View에 동시 적용되면 깨짐. 셋 중 하나 분리:
- 외부 wrapper가 shadow 담당, 내부 child가 overflow + content 담당
- 또는 LinearGradient 제거 후 solid `backgroundColor`로 단순화 (FAB은 단색 wineRed로 충분)

### 8a-7. height: 'auto' (RN 무효)

RN에서 `height: 'auto'`는 정식 값이 아니고 무시될 수 있음. 가변 높이는 explicit 설정 없이 두거나 (`height` prop 자체를 안 쓰거나), `minHeight`로 대체.

---

## 8c. **CRITICAL — Pressable + className + 함수형 style + 복잡한 자식 (NativeWind 4 cssInterop + Fabric 충돌)**

> **2026-05-21 24시간 학습 누적**. 같은 실수 반복 금지 — CLAUDE.md §4-11 강제 규칙.

### 깨지는 패턴

```tsx
// [NO] 깨짐 (NativeWind cssInterop + Fabric에서 layout 무시)
<Pressable
  className="bg-surface dark:bg-surface border border-border-default"
  style={({ pressed }) => ({
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    opacity: pressed ? 0.9 : 1,
    transform: [{ scale: pressed ? 0.99 : 1 }],
  })}
>
  <View>{/* nested View 1 */}</View>
  <View>{/* nested View 2 */}</View>
  <View>{/* nested View 3 */}</View>
</Pressable>
```

**증상**:
- `flexDirection: 'row'` 무시 → vertical layout으로 렌더
- `backgroundColor` 등 일부 prop만 부분 적용
- BottomNav FAB 케이스: `position: 'absolute', top: -24, borderRadius: 28` 무시되어 square + baseline

**원인 가설**: NativeWind 4.1의 `jsxImportSource: 'nativewind'`가 모든 JSX를 cssInterop wrapper로 감싸는데, Fabric (New Arch) 에서 Pressable의 함수형 style + className 동시 사용 시 style 일부 prop drop 발생. 자식이 단순(Text + Icon)할 땐 안 깨지지만 nested View / SVG 자식 늘면 깨짐.

### 작동하는 패턴 — Pressable은 hit target, inner View가 visual/layout

```tsx
// [OK] 작동
<Pressable
  onPress={...}
  accessibilityRole="link"
  accessibilityLabel={a11yLabel}
  style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
>
  <View
    style={{
      flexDirection: 'row',
      gap: 16,
      padding: 16,
      borderRadius: 14,
      backgroundColor: tokens.bg.surface,
      borderWidth: 1,
      borderColor: tokens.border.default,
    }}
  >
    <View>{/* nested View 1 */}</View>
    <View>{/* nested View 2 */}</View>
    <View>{/* nested View 3 */}</View>
  </View>
</Pressable>
```

**변환 규칙**:
1. Pressable에서 **모든 layout prop 제거** (flexDirection/padding/margin/width/height/position/border*/backgroundColor/shadow*/transform)
2. Pressable의 style 함수는 **opacity press feedback만** (또는 완전 제거)
3. inner `<View>`에 모든 layout/visual style을 **inline 객체로** 옮김
4. inner View의 색은 `useThemeTokens()` 토큰으로 inline (className 색은 가능하면 X)
5. Text 폰트도 inline `style={{ fontFamily: 'Inter_400Regular', color: tokens.text.primary }}` 권장

### NavBar FAB 같은 absolute positioned 케이스

```tsx
// [NO] 깨짐
<Pressable style={({ pressed }) => ({
  position: 'absolute',
  bottom: 72,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: brand.wineRed,
  ...
})}>
  <Icon />
</Pressable>

// [OK] 작동 — outer View가 positioning, Pressable은 opacity, inner View가 visual
<View style={{ position: 'absolute', bottom: 72, left: '50%', marginLeft: -28, width: 56, height: 56 }}>
  <Pressable
    onPress={...}
    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
  >
    <View style={{
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: brand.wineRed,
      borderWidth: 1.5, borderColor: brand.gold,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#8B1A2A', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 20,
      elevation: 12,
    }}>
      <Icon />
    </View>
  </Pressable>
</View>
```

### 단순 케이스 예외

자식이 단순한 (Text 1개 + Icon 1개 등) Pressable은 className + style 함수 그대로 둬도 작동. 그러나 **미래에 자식 늘어날 가능성 있으면 처음부터 inner View 패턴** 권장 (regression 차단).

### Grep으로 발견 / 일괄 변환

```bash
# 위험 패턴 사이트 발견
grep -rn -B1 "style={({\s*pressed" app/ src/ --include="*.tsx" | grep -B1 "className"

# 각 사이트 자식 구조 확인 → 복잡(nested View / SVG) 이면 변환 의무
```

### 새 코드 작성 시

- 새로운 Pressable 추가 시 **처음부터 inner View 패턴** 사용. 단순 케이스(icon만, Text만)에서도 일관성 위해 권장.
- design-spec-author가 NativeWind 매핑표 작성 시 layout/visual은 inner View로 매핑하도록 명시.
- design-reviewer 8-checklist 의 (7) Layout primitive 항목에 이 패턴 점검 포함.

---

## 8b. 사전에 추가하는 절차

새로운 web-only primitive를 fix할 때마다:

1. 사용처 grep으로 blast radius 확인
2. 이 §8a에 새 subsection 추가 — 패턴 / 깨지는 이유 / RN equivalent / 검증
3. 같은 카테고리 사용처 일괄 fix
4. design-reviewer는 새 항목을 (7) Layout primitive 체크에 추가

---

## 9. Form elements

| HTML | RN |
|---|---|
| `<input type="text">` | `<TextInput>` |
| `<input type="number">` | `<TextInput keyboardType="numeric">` |
| `<input type="email">` | `<TextInput keyboardType="email-address" autoCapitalize="none">` |
| `<input type="password">` | `<TextInput secureTextEntry>` |
| `<input type="checkbox">` | `<Pressable>` + state + 시각 표현 ([OK] 아이콘) |
| `<input type="radio">` | 같음 — group state |
| `<select>` | `<Pressable>` + BottomSheet picker (없으면 ActionSheet) |
| `<textarea>` | `<TextInput multiline numberOfLines={N}>` |
| `<form>` | 없음. 폼 상태는 `useState` + zod 검증. submit은 button onPress |
| `<button type="submit">` | `<Pressable onPress={handleSubmit}>` |
| `<label for="X">` | `<Text>` 또는 `accessibilityLabel` prop |

**zod**: 우리 v0.1.0 표준. `zodResolver` 같은 RHF 통합은 v0.1.0 스코프 외 — 직접 `schema.safeParse(state)` 호출.

---

## 10. Modal / Portal / Overlay

| 키스크린 | RN |
|---|---|
| 일반 modal | `<Modal>` (RN core) — backdrop·focus trap 직접 |
| BottomSheet | `@gorhom/bottom-sheet` (이미 deps) + `BottomSheetBackdrop` 표준 |
| Drawer | `react-native-drawer-layout` (v0.1.0 스코프 외) |
| Toast | 우리 표준 `src/components/shared/toast.tsx` (자체 구현) |
| Tooltip / Popover | 없음 — v0.1.0 스코프 외 |
| Portal | `<Modal>`이나 RN root 위 absolute 자식. React Portal 같은 일반 솔루션 없음 |

**BottomSheet 표준** (B-12 후속):

```tsx
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

const renderBackdrop = useCallback(
  (props) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.6}
    />
  ),
  [],
);

<BottomSheet
  ref={sheetRef}
  index={0}
  snapPoints={['60%']}
  backdropComponent={renderBackdrop}
  onClose={handleClose}
>
  <BottomSheetView>...</BottomSheetView>
</BottomSheet>
```

수동 `<Pressable>` 백드롭 깔지 말 것 — zIndex 충돌 + dismiss loop 위험.

---

## 11. Icon

| 키스크린 | RN |
|---|---|
| `lucide-react` | `lucide-react-native` (^0.523.0, react 19 호환) |
| SVG inline | `react-native-svg` 사용 또는 lucide |

### 사용 예

```tsx
import { Wine, Camera, ChevronRight } from 'lucide-react-native';

<Wine size={24} color={colors.gold} strokeWidth={1.5} />
```

**color prop**: hex 직접 또는 design-tokens 참조. 토큰 우선.

**strokeWidth**: 키스크린은 1.5가 기본. UI 일관성 위해 강제.

---

## 12. Image

| 키스크린 | RN |
|---|---|
| `next/image` | `expo-image` (Image 컴포넌트, 캐시 자동) |
| `<img src={...}>` | `<Image source={{uri: '...'}}>` 또는 `expo-image` |
| 정적 import | `require('@/assets/...')` |

### 사용 예

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: photoUrl }}
  style={{ width: 80, height: 120 }}
  contentFit="cover"
  transition={200}
  placeholder={blurhash}
/>
```

**aspect ratio**: 키스크린이 `aspect-w-3 aspect-h-4` 같은 클래스 사용 시 → `style={{aspectRatio: 3/4}}`로 변환.

---

## 13. Link / Router

| 키스크린 | RN |
|---|---|
| `<Link href="/wine/123">` (next/link) | `<Link href="/wine/123">` (expo-router) — 동일 API |
| `useRouter()` (next/navigation) | `useRouter()` (expo-router) — push/back/replace 동일 |
| `usePathname()` | `usePathname()` (expo-router) |
| `useSearchParams()` | `useLocalSearchParams()` |

**dynamic route**: `app/wine/[lwin].tsx` ↔ `useLocalSearchParams<{lwin: string}>()`.

**deep link**: `app.config.ts`의 `scheme` 설정. URL `winemine://wine/123`로 진입 가능.

---

## 14. Locale + Dark Mode

### Locale

| 키스크린 (next-intl) | RN (i18next + react-i18next) |
|---|---|
| `useTranslations('ns')` → `t('key')` | `useTranslation('ns')` → `t('key')` |
| messages 폴더 ko.json / en.json | 같음 |
| `next-intl/server` middleware | 없음 — `_layout.tsx`에서 `initI18n(locale)` 호출 |

**locale 토글**: profiles.locale 변경 → `i18n.changeLanguage(newLocale)`.

### Dark mode

| 키스크린 (data-theme) | RN (NW v4 darkMode:'class') |
|---|---|
| `:root[data-theme='light']` CSS 변수 | `dark:` 접두사 (`bg-bg-deepest dark:bg-bg-deepest` 처럼) |
| context로 토글 | `useColorScheme()` from react-native |
| `localStorage` 저장 | profiles.theme 컬럼 또는 AsyncStorage |

**프로그래밍적 토글**: NW v4의 `colorScheme.set('dark' | 'light' | 'system')` API (nativewind import).

---

## 15. winemine 특화 패턴

### LWIN

와인 ID는 **LWIN 7~13자리 숫자 string**. 절대 `parseInt(lwin)` 금지 — 0-prefix 손실. `src/lib/lwin.ts` 헬퍼 사용.

```tsx
import { parseLwinVintage, isValidLwin } from '@/lib/lwin';

const vintage = parseLwinVintage(lwin); // 11/13자리에서 vintage 추출
```

### 익명화된 사용자 ID

UI에 표시되는 사용자 식별자는 항상 `velvety-fox-37` 패턴. UUID 노출 금지 (§4-5).

```tsx
import { anonymizeUserId } from '@/lib/anonymize';

const displayName = anonymizeUserId(profile.id); // velvety-fox-37
```

### 와인명 표시

`wines_localized` VIEW에서 가져온 데이터 사용. `wine_korean_names`가 있으면 ko 모드에서 한글, 없으면 영문 fallback.

```tsx
import { WineNameDisplay } from '@/components/shared/wine-name-display';

<WineNameDisplay wine={wineLocalized} variant="card" />
// 또는 variant="title" / "meta"
```

variant는 우리 typography 위계와 매핑 (page-title / card-title / card-meta).

### 와인병 placeholder gradient

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { bottleColorDefault, bottleGradientEnd } from '@/lib/design-tokens';

const startColor = wineMeta?.bottle_color ?? bottleColorDefault[wine.type_canonical];

<LinearGradient
  colors={[startColor, bottleGradientEnd]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={...}
/>
```

라이트 모드에서는 `bottleGradientEnd` 대신 `light.bg.bottleShelf`(#FFFFFF) 사용.

---

## 16. 자주 발생하는 사양 작성 실수

design-spec-author가 흔히 놓치는 항목 (design-reviewer가 FAIL 처리):

1. **shadow 누락**: 키스크린 카드에 `shadow-md` 있는데 사양에 미포함 → RN 평면 카드로 구현됨
2. **gradient direction**: 135deg를 90deg로 잘못 변환 → 시각 차이 큼
3. **letterSpacing 부호**: em 음수 (`-0.025em`)을 px 양수로 변환 → 글자 간격 반대
4. **lineHeight 누락**: 키스크린 `1.5` ratio가 빠지면 RN 기본 lineHeight 사용 → 위계 무너짐
5. **dark/light 한쪽만 명세**: 양쪽 모드 분리 표기 누락
6. **arbitrary value 남발**: `bg-[#7a2348]`로 사양 작성 → 토큰 추가 요청으로 변환해야 함
7. **자식 컴포넌트 재귀 안 함**: 부모 JSX만 보고 사양 작성 → 자식의 spacing/색 누락
8. **state variants 누락**: loading/empty/error 상태 미명세 → 빌더가 default만 구현
9. **인터랙션 미명세**: onPress / haptics / accessibilityLabel 빠뜨림
10. **CSS Grid 직역**: `grid-cols-3`를 sub-flex로만 변환하면 정렬 깨짐 → 명시적 row/col 트리 작성

---

## 17. 참고

- 키스크린 원본: `../winemine-keyscreen/` (read-only, §4-3)
- 키스크린 토큰 정의: `../winemine-keyscreen/styles/tokens.css`, `src/app/globals.css`
- 키스크린 디자인 시스템 docs: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- 우리 토큰: `src/lib/design-tokens.ts`, `tailwind.config.ts`
- 디자인 사양 SKILL: `.claude/skills/design-spec-authoring/SKILL.md`
- 디자인 게이트 SKILL: `.claude/skills/design-review-gate/SKILL.md`
- 시각 reference 스크린샷: `_workspace/keyscreen-shots/{route}.png` (P2 산출물)
- 테마 검증 규칙: `docs/THEME_VERIFICATION.md`
