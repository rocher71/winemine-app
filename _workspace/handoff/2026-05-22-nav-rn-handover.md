# winemine — Navigation Bar React Native 전환 핸드오버

> **작성일:** 2026-05-22  
> **진실 소스:** `/Users/yejinkim/dev/winemine-keyscreen/src/components/nav/`  
> **대상:** React Native (Expo) 구현자  
> **범위:** BottomNav, AppHeader, BackHeader — 픽셀 단위 100% 재현

---

## 0. 개요

winemine 키스크린(Next.js)의 네비게이션 바 3개를 RN으로 전환한다.
아래 스펙은 `bottom-nav.tsx`, `app-header.tsx`, `back-header.tsx`와 `styles/tokens.css`에서
직접 추출한 수치다. 임의 변경 금지.

### 컴포넌트 목록

| 컴포넌트 | 위치 | 역할 |
|---------|------|------|
| `BottomNav` | 화면 하단 | 4탭 + 중앙 카메라 FAB |
| `AppHeader` | 화면 상단 | 로고 + 알림벨 + 레벨칩/아바타 |
| `BackHeader` | 화면 상단 | 뒤로가기 + 페이지 타이틀 + 액션 슬롯 |

---

## 1. 색상 토큰

모든 색상은 아래 hex 값을 그대로 사용. RN에서는 `StyleSheet`에 상수로 선언.

```ts
// tokens.ts (RN 전용 색상 상수)
export const Colors = {
  // Primary
  wineRed:         '#8B1A2A',
  wineRedHover:    '#A02030',
  gold:            '#C9A84C',
  cream:           '#F5F0E8',

  // Background (다크 기본값)
  bgDeepest:       '#251837',
  bgDeep:          '#2E1F3F',
  bgMap:           '#3A2440',
  surface:         '#3D2A4A',

  // Text
  textPrimary:     '#F8F4ED',
  textSecondary:   '#EBE0CB',
  textMuted:       '#CABDA8',
  textDisabled:    '#7E6E8E',

  // Border
  borderDefault:   '#5A3D6A',
  borderActive:    '#A02030',

  // Error
  error:           '#EF4444',
} as const;

// 레벨별 색상 (LevelChip에서 사용)
export const LevelColors: Record<number, string> = {
  1: '#a87341',   // Bronze
  2: '#b8b8c0',   // Silver
  3: '#C9A84C',   // Gold
  4: '#C9A84C',   // Gold+
  5: '#8B1A2A',   // Master
};
```

### 라이트 테마 오버라이드

| 토큰 | 다크 값 | 라이트 값 |
|------|---------|---------|
| `wineRed` | `#8B1A2A` | `#B89438` |
| `gold` | `#C9A84C` | `#B89438` |
| `cream` | `#F5F0E8` | `#2A1A14` |
| `bgDeepest` | `#251837` | `#FAF5EC` |
| `bgDeep` | `#2E1F3F` | `#F2EAD9` |
| `surface` | `#3D2A4A` | `#FFFFFF` |
| `textMuted` | `#CABDA8` | `#8B7766` |
| `borderDefault` | `#5A3D6A` | `#E0D2BC` |

---

## 2. 그라데이션

### BottomNav 배경 그라데이션

웹: `linear-gradient(to top, #251837 70%, rgba(37,24,55,0))`

**RN 구현:**
```tsx
import { LinearGradient } from 'expo-linear-gradient';

// BottomNav 배경으로 감싸는 그라데이션
<LinearGradient
  colors={['#251837', '#251837', 'rgba(37,24,55,0)']}
  locations={[0, 0.7, 1]}
  start={{ x: 0, y: 1 }}   // to top = start 아래
  end={{ x: 0, y: 0 }}
  style={styles.bottomNavGradient}
/>
```

- 방향: 아래에서 위로 (`y:1 → y:0`)
- 70% 지점까지 `#251837` 불투명, 이후 투명
- 라이트 테마: `colors={['#FAF5EC', '#FAF5EC', 'rgba(250,245,236,0)']}`

### 카메라 FAB 그라데이션

웹: `linear-gradient(135deg, #8B1A2A, #5b1424)`

**RN 구현:**
```tsx
<LinearGradient
  colors={['#8B1A2A', '#5b1424']}
  start={{ x: 0, y: 0 }}   // 135deg ≈ 우상 → 좌하
  end={{ x: 1, y: 1 }}
  style={styles.fabGradient}
/>
```

- 라이트 테마: `colors={['#C9A84C', '#A07F2E']}`

### LevelChip 아바타 그라데이션

웹: `linear-gradient(135deg, {levelColor}, {levelColor}99)`

**RN 구현:**
```tsx
// 99 = 60% opacity hex
<LinearGradient
  colors={[levelColor, levelColor + '99']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.avatarGradient}
/>
```

---

## 3. BottomNav

### 3-1. 레이아웃 구조

```
┌─────────────────────────────────────────┐
│ [홈] [지도]  [카메라FAB]  [셀러] [커뮤니티] │
│                                          │
│   paddingBottom = safeArea.bottom + 8px  │
└─────────────────────────────────────────┘
```

- **위치:** `position: 'absolute'`, bottom: 0, left: 0, right: 0
- **z-index:** 25
- **borderTop:** 0.5px solid `#5A3D6A`
- **배경:** LinearGradient (섹션 2 참조)

### 3-2. 사이징

| 속성 | 값 |
|------|---|
| paddingTop | 8px |
| paddingHorizontal | 12px |
| paddingBottom | `safeAreaBottom + 8px` (Home Indicator 포함) |
| 탭 아이템 flex | 1 (각 탭 균등 분할) |
| 아이콘 크기 | 22×22px |
| 아이콘-라벨 간격 | 3px |
| 라벨 font-size | 10px |

**Safe Area 처리 (Expo):**
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
// paddingBottom = insets.bottom + 8
```

### 3-3. 탭 정의

```ts
const TABS = [
  { id: 'home',      icon: 'home',      labelKo: '홈',       labelEn: 'Home',      route: '/' },
  { id: 'map',       icon: 'globe',     labelKo: '지도',     labelEn: 'Map',       route: '/map' },
  // 중앙 = 카메라 FAB (탭 아님)
  { id: 'cellar',    icon: 'cellar',    labelKo: '셀러',     labelEn: 'Cellar',    route: '/cellar' },
  { id: 'community', icon: 'community', labelKo: '커뮤니티', labelEn: 'Community', route: '/community' },
];
```

### 3-4. 탭 아이템 색상

| 상태 | 색상 |
|------|------|
| 활성 (active) | `#C9A84C` (gold) |
| 비활성 | `#CABDA8` (textMuted) |
| 폰트 weight (활성) | 600 |
| 폰트 weight (비활성) | 400 |

### 3-5. 카메라 FAB

```tsx
// FAB 스펙
const FAB = {
  width: 52,
  height: 52,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '#C9A84C',
  // LinearGradient: #8B1A2A → #5b1424 (135deg)
  // shadow
  shadowColor: '#8B1A2A',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.45,
  shadowRadius: 20,
  elevation: 12,              // Android
  marginTop: -24,             // 위로 24px 솟아오름
};
```

**내부 inset highlight (웹: `inset 0 1px 0 rgba(255,255,255,0.12)`):**
```tsx
// RN은 inset box-shadow 미지원 → 상단에 반투명 흰선 Overlay로 대체
<View style={[styles.fab, styles.fabHighlight]}>
  {/* fabHighlight: borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' */}
</View>
```

### 3-6. BottomNav 숨김 규칙

아래 화면에서 BottomNav 렌더 안 함:

```ts
const HIDDEN_ROUTES = ['/onboarding', '/capture', '/notes/new'];
// 해당 route prefix이면 숨김
```

유틸리티 함수로 분리해서 export — 다른 레이아웃 컴포넌트에서도 재사용:

```ts
export function shouldShowBottomNav(pathname: string | null): boolean {
  if (!pathname) return true;
  return !HIDDEN_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
```

### 3-6-1. 활성 탭 매핑 (`pickActiveTab`)

```ts
function pickActiveTab(pathname: string | null): NavTabId | null {
  if (!pathname) return null;
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/map')) return 'map';
  if (pathname.startsWith('/cellar')) return 'cellar';
  if (pathname.startsWith('/community')) return 'community';
  // 아래 라우트는 BottomNav는 표시하되 어떤 탭도 활성화하지 않음
  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/favorites') ||
    pathname.startsWith('/badges') ||
    pathname.startsWith('/photos') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/settings')
  ) return null;
  return null;
}
```

### 3-7. 아이콘 SVG 경로 (monoline, stroke-only)

**공통 속성:** `fill="none"`, `stroke={color}`, `strokeWidth={1.6}`, `strokeLinecap="round"`, `strokeLinejoin="round"`, viewBox `0 0 24 24`

#### home
```
M3 11.5 12 4l9 7.5
M5 10v10h14V10
```

#### globe (지도)
```
circle cx="12" cy="12" r="9"
M3 12h18
M12 3c2.5 3 2.5 15 0 18
M12 3c-2.5 3-2.5 15 0 18
```

#### camera (FAB 내부 아이콘)
```
M3 8h3l2-2h8l2 2h3v12H3z
circle cx="12" cy="14" r="3.5"
```
- 아이콘 색상: `#F5F0E8` (cream), 크기 24×24px

#### cellar
```
rect x="4" y="3" width="16" height="18" rx="1"
M9 3v18
M15 3v18
M4 9h16
M4 15h16
```

#### community
```
circle cx="9" cy="9" r="3.2"
circle cx="17" cy="10.5" r="2.4"
M3 20c0.8-3 3.4-4.6 6-4.6s5.2 1.6 6 4.6
M15 20c0.6-2.2 2.4-3.4 4-3.4s2.8 0.8 3 2.2
```

**RN SVG 사용:** `react-native-svg` 패키지

```tsx
import Svg, { Path, Circle, Rect } from 'react-native-svg';

function NavIcon({ name, size = 22, color }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* 아이콘별 Path/Circle/Rect */}
    </Svg>
  );
}
```

---

## 4. AppHeader

### 4-1. 레이아웃

```
┌──────────────────────────────────────────────┐
│ [WineGlassSVG] wine·mine   ...flex...  [Bell] [LevelChip or Avatar] │
└──────────────────────────────────────────────┘
```

- **height:** padding에 의존 (paddingTop 12, paddingBottom 14, 콘텐츠 ~26px = 총 약 52px)
- **paddingHorizontal:** 20px
- **paddingTop:** safeArea.top + 12px (상태바 포함 시) 또는 12px (Native StatusBar 사용 시)
- **paddingBottom:** 14px
- **borderBottom:** 0.5px, `#5A3D6A`
- **backgroundColor:** `#2E1F3F` (bgDeep)

### 4-2. 로고 마크 (WineGlassSVG)

크기: 26×26px, viewBox `0 0 32 32`

```tsx
// 와인잔 외곽선
<Path
  d="M9 5h14c0 7-3.5 11-7 11.5V25h4v2H12v-2h4v-8.5C12.5 16 9 12 9 5z"
  fill="none"
  stroke="#C9A84C"
  strokeWidth={1.5}
  strokeLinejoin="round"
/>
// 와인 fill
<Path
  d="M11 6h10c0 5-2.5 8-5 8.5C13.5 14 11 11 11 6z"
  fill="#8B1A2A"
  opacity={0.9}
/>
```

### 4-3. 워드마크

```tsx
// "wine·mine" — Playfair Display, 18px, weight 500
<Text style={styles.wordmark}>wine</Text>
<Text style={styles.dot}>·</Text>   {/* color: #C9A84C, margin 0.5px */}
<Text style={styles.wordmark}>mine</Text>
```

```ts
wordmark: {
  fontFamily: 'PlayfairDisplay_500Medium',
  fontSize: 18,
  color: '#F5F0E8',
  letterSpacing: -0.18,    // -0.01em × 18
  lineHeight: 18,
}
dot: {
  color: '#C9A84C',
  marginHorizontal: 0.5,
}
```

### 4-4. 알림 벨 버튼

- **터치 영역:** 36×36px, borderRadius 999
- **아이콘:** 20×20px
- **색상:** `#EBE0CB` (textSecondary)

**Bell SVG 경로 (viewBox 0 0 24 24):**
```
M6 16V10a6 6 0 0 1 12 0v6l1.5 2H4.5z
M10 19a2 2 0 0 0 4 0
```

**미읽 뱃지 (hasUnread=true):**
- `cx="18" cy="6" r="2.5"`, fill `#8B1A2A`, no stroke
- SVG 내부 Circle로 렌더

### 4-5. LevelChip (heavy user)

```ts
// 컨테이너
{
  height: 32,
  paddingLeft: 4,
  paddingRight: 10,
  borderRadius: 999,
  backgroundColor: '#3D2A4A',  // surface
  borderWidth: 1,
  borderColor: '#5A3D6A',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
}

// 아바타 원형
{
  width: 24,
  height: 24,
  borderRadius: 999,
  // LinearGradient: levelColor → levelColor+'99'
  // 텍스트: Playfair Display 700 12px, color: bgDeepest
}

// 레벨 텍스트 "L4"
{
  fontFamily: 'Inter_600SemiBold',
  fontSize: 11,
  color: levelColor,
  letterSpacing: 0.44,   // 0.04em × 11
}
```

**레벨별 이름:**
| levelId | ko | en |
|---------|----|----|
| 1 | 브론즈 | Bronze |
| 2 | 실버 | Silver |
| 3 | 골드 | Gold |
| 4 | 골드 | Gold |
| 5 | 마스터 | Master |

### 4-6. 기본 아바타 (first-time user, levelId = null)

```ts
{
  width: 36,
  height: 36,
  borderRadius: 999,
  backgroundColor: '#8B1A2A',
  // 중앙에 avatarInitial 텍스트
  // fontFamily: Inter_600SemiBold, fontSize: 14, color: cream
}
```

---

## 5. BackHeader

### 5-1. 레이아웃

```
┌──────────────────────────────────────────────┐
│ [ChevronLeft]  페이지 타이틀       [우측 액션들] │
└──────────────────────────────────────────────┘
```

- **height:** 56px (고정)
- **paddingHorizontal:** 16px
- **flexDirection:** row
- **alignItems:** center
- **justifyContent:** space-between

### 5-2. 뒤로가기 버튼

```ts
{
  width: 32,
  height: 32,
  // 터치 영역 확보: hitSlop { top: 8, bottom: 8, left: 8, right: 8 }
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
}
```

**ChevronLeft 아이콘:**
- 크기: 24×24px
- strokeWidth: 1.75
- color: `#F5F0E8` (cream)
- lucide `chevron-left` 경로:
  ```
  M15 18l-6-6 6-6
  ```

### 5-3. 타이틀

```ts
{
  fontFamily: 'Inter_600SemiBold',
  fontSize: 16,
  lineHeight: 19.2,     // 1.2 × 16
  color: '#F5F0E8',
  // numberOfLines: 1 (ellipsis)
}
```

- 타이틀 + 뒤로가기 버튼을 `flex: 1`인 row container에 묶음 → 우측 액션 밀어냄
- 타이틀에 `flex: 1` + `numberOfLines={1}` → 긴 텍스트 ellipsis

### 5-4. 우측 액션 슬롯

- `flexDirection: 'row'`, `gap: 8`, `alignItems: 'center'`
- 각 액션 버튼은 터치 영역 36×36px 권장
- 공통 색상: `#EBE0CB` (textSecondary)
- 페이지별 아이콘: Share2, MoreHorizontal, Star (lucide 계열)

---

## 6. 폰트 설정

| CSS 변수 | RN 폰트명 (expo-google-fonts) |
|---------|------------------------------|
| `--font-playfair` | `PlayfairDisplay_400Regular`, `PlayfairDisplay_500Medium`, `PlayfairDisplay_700Bold` |
| `--font-inter` | `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold` |
| Korean fallback | `NotoSansKR_400Regular`, `NotoSansKR_500Medium` |

**expo-google-fonts 설치:**
```bash
npx expo install @expo-google-fonts/playfair-display @expo-google-fonts/inter @expo-google-fonts/noto-sans-kr
```

**useFonts 훅:**
```tsx
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
```

---

## 7. Safe Area & Home Indicator

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// BottomNav
const insets = useSafeAreaInsets();
paddingBottom: insets.bottom + 8   // iPhone 14+: insets.bottom = 34px → total 42px

// AppHeader (상태바를 RN StatusBar로 처리 시)
paddingTop: 12   // StatusBar는 RN native가 관리
```

**주의:** keyscreen에서 StatusBar는 54px 고정 (시뮬레이션용)이지만 RN 앱에서는 native StatusBar가 처리하므로 별도 구현 불필요.

---

## 8. 인터랙션 / 접근성

### 탭 Press 상태

웹에는 hover 효과 없음 (touch device). RN에서도 별도 press animation 불필요.
단, `Pressable`의 `android_ripple`으로 안드로이드 피드백 추가 권장:

```tsx
<Pressable
  onPress={...}
  android_ripple={{ color: 'rgba(201,168,76,0.15)', borderless: true }}
  accessibilityRole="button"
>
```

### 포커스 아웃라인

웹: `2px solid #C9A84C`, offset 2px  
RN: 별도 처리 불필요 (OS 기본 접근성 포커스 인디케이터 사용)

### aria-label 대응

| 요소 | ko | en |
|------|----|----|
| BottomNav `<nav>` | `'주요 내비게이션'` | `'Primary'` |
| 카메라 FAB | `'와인 라벨 촬영'` | `'Capture wine label'` |
| 알림 벨 | `'알림'` | `'Notifications'` |
| 뒤로가기 버튼 | `'Back'` | `'Back'` |

> 웹 코드 실측값 기준. 언어에 따라 accessibilityLabel을 분기해서 사용.

---

## 9. 전체 RN 컴포넌트 스켈레톤

### BottomNav.tsx

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '@/constants/tokens';

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isHidden = ['/onboarding', '/capture', '/notes/new'].some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  if (isHidden) return null;

  const activeId = pickActiveTab(pathname);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <LinearGradient
        colors={['#251837', '#251837', 'rgba(37,24,55,0)']}
        locations={[0, 0.7, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* 홈 */}
      <NavTab id="home" icon="home" labelKo="홈" labelEn="Home" active={activeId === 'home'} />
      {/* 지도 */}
      <NavTab id="map" icon="globe" labelKo="지도" labelEn="Map" active={activeId === 'map'} />
      {/* 카메라 FAB */}
      <CameraFAB />
      {/* 셀러 */}
      <NavTab id="cellar" icon="cellar" labelKo="셀러" labelEn="Cellar" active={activeId === 'cellar'} />
      {/* 커뮤니티 */}
      <NavTab id="community" icon="community" labelKo="커뮤니티" labelEn="Community" active={activeId === 'community'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: Colors.borderDefault,
    zIndex: 25,
  },
});
```

### AppHeader.tsx

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Colors, LevelColors } from '@/constants/tokens';

type Props = {
  hasUnreadNotification?: boolean;
  avatarInitial?: string;
  levelId?: number | null;
};

export function AppHeader({ hasUnreadNotification = false, avatarInitial = 'W', levelId = null }: Props) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {/* 로고 */}
      <Pressable onPress={() => router.push('/')} style={styles.logoRow} accessibilityRole="link">
        <WineGlassSVG />
        <Wordmark />
      </Pressable>

      <View style={{ flex: 1 }} />

      {/* 알림 벨 */}
      <BellButton hasUnread={hasUnreadNotification} />

      {/* 레벨칩 or 아바타 */}
      {levelId != null
        ? <LevelChip levelId={levelId} initial={avatarInitial} />
        : <DefaultAvatar initial={avatarInitial} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderDefault,
    backgroundColor: Colors.bgDeep,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
```

### BackHeader.tsx

```tsx
import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/tokens';

// 앱 전반의 이중언어 문자열 타입
type LocalizedString = { ko: string; en: string };

type Props = {
  // string 또는 LocalizedString 모두 허용 — 로케일에 맞게 렌더
  title?: LocalizedString | string;
  children?: ReactNode;
  onBack?: () => void;
};

export function BackHeader({ title, children, onBack }: Props) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={Colors.cream}
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>

        {title != null && (
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        )}
      </View>

      {children && (
        <View style={styles.actions}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 19.2,
    color: '#F5F0E8',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
});
```

---

## 10. 주요 수치 요약 (빠른 참조)

| 요소 | 수치 |
|------|------|
| BottomNav 상단 패딩 | 8px |
| BottomNav 하단 패딩 | safeArea.bottom + 8px |
| BottomNav 좌우 패딩 | 12px |
| BottomNav borderTop | 0.5px `#5A3D6A` |
| 탭 아이콘 크기 | 22px |
| 탭 아이콘-라벨 gap | 3px |
| 탭 라벨 font-size | 10px |
| 탭 라벨 active weight | 600 |
| 탭 라벨 inactive weight | 400 |
| FAB 크기 | 52×52px |
| FAB borderRadius | 999 |
| FAB border | 1px `#C9A84C` |
| FAB marginTop | -24px |
| FAB shadow opacity | 0.45 |
| FAB shadow radius | 20 |
| AppHeader paddingH | 20px |
| AppHeader paddingTop | 12px |
| AppHeader paddingBottom | 14px |
| AppHeader borderBottom | 0.5px `#5A3D6A` |
| AppHeader bg | `#2E1F3F` |
| WineGlass SVG 크기 | 26px |
| Wordmark font-size | 18px |
| Bell 터치 영역 | 36×36px |
| Bell 아이콘 크기 | 20px |
| LevelChip height | 32px |
| LevelChip paddingL | 4px |
| LevelChip paddingR | 10px |
| LevelChip avatar | 24×24px |
| LevelChip "L4" font | 11px, weight 600, letterSpacing 0.04em |
| DefaultAvatar 크기 | 36×36px |
| BackHeader height | 56px (고정) |
| BackHeader paddingH | 16px |
| BackButton 크기 | 32×32px |
| BackButton chevron | 24px, strokeWidth 1.75 |
| BackHeader title font | 16px, weight 600 |
| z-index BottomNav | 25 |

---

## 11. 구현 우선순위

1. **tokens.ts** — 색상 상수 먼저
2. **NavIcon** — SVG 경로 컴포넌트 (react-native-svg)
3. **BottomNav** — LinearGradient + 탭 + FAB
4. **AppHeader** — 로고 + 벨 + 칩
5. **BackHeader** — 뒤로가기 + 타이틀
6. **safe area 통합 테스트** — iPhone 14 Pro (Dynamic Island) + iPhone SE 양단

---

## 12. 국제화 (ko/en) 보충

### LocalizedString 타입

앱 전체에서 사용자 노출 문자열은 `LocalizedString = { ko: string; en: string }` 패턴으로 관리.
RN에서도 동일 타입을 `constants/types.ts`에 선언하고 재사용:

```ts
export type LocalizedString = { ko: string; en: string };

// 로케일에 따라 꺼내 쓰는 헬퍼
export function l(str: LocalizedString | string, locale: 'ko' | 'en'): string {
  if (typeof str === 'string') return str;
  return str[locale];
}
```

`BackHeader.title`, 탭 라벨, 알림 제목 등 모두 이 패턴을 따름.

### AppHeader — LevelChip / DefaultAvatar 탭 동작

웹에서 두 컴포넌트 모두 `/profile` 라우트로 이동:
- `LevelChip` → `router.push('/profile')`
- `DefaultAvatar` → `router.push('/profile')`

RN에서도 동일하게 `Pressable` + `router.push('/profile')` 처리.
