# 핸드오버: NativeWind+Fabric Pressable 패턴 영속화

> 작성: 2026-05-21
> 범위: 24시간+ 디버깅 끝에 발견한 stack-level 버그와 안전 패턴. 다음 작업자 반드시 숙지.
> 트리거 commits: `b7c6f52` ~ `e187bec` (10 commits)

---

## 1. TL;DR — 절대 잊지 말 것

이 stack(`React 19 + RN 0.81 + Reanimated 4 + worklets 0.5 + NativeWind 4.1 + jsxImportSource:'nativewind' + newArchEnabled:true(Fabric)`)에서:

**`Pressable`에 `style={({pressed}) => ({ ...layout props })}` + nested 자식을 넣으면 layout props가 무시된다.**

해결: **3-layer 구조**.

```tsx
// ❌ 절대 금지
<Pressable
  className="bg-surface ..."
  style={({pressed}) => ({
    flex: 1,           // 무시됨
    flexDirection: 'row', // 무시됨
    padding: 16,       // 무시됨
    borderRadius: 14,  // 무시됨
    backgroundColor,   // 무시됨
    transform: [...],  // 무시됨
    opacity: pressed ? 0.9 : 1,
  })}
>
  <View>...</View>
  <View>...</View>
  <View>...</View>
</Pressable>
```

```tsx
// ✅ 표준 패턴 — 3-layer 구조
<View style={{ flex: 1 }}>                           {/* Layer 1: flex/positioning */}
  <Pressable
    onPress={...}
    accessibilityRole="..."
    accessibilityLabel="..."
    style={({pressed}) => ({ opacity: pressed ? 0.9 : 1 })}  {/* Layer 2: hit target + opacity */}
  >
    <View style={{                                   {/* Layer 3: layout + visual */}
      flexDirection: 'row',
      padding: 16,
      borderRadius: 14,
      backgroundColor: tokens.bg.surface,
      borderWidth: 1,
      borderColor: tokens.border.default,
    }}>
      {children}
    </View>
  </Pressable>
</View>
```

**규칙**:
- Pressable의 style은 `opacity` (그리고 disabled opacity) **만**
- layout/visual은 **inner View에 inline**
- flex 분포(`flex`/`flexBasis`/`flexGrow`)가 필요하면 **outer View로 분리**
- inner View는 className 가능하면 **사용 X** (cssInterop wrapping이 일부 prop 누락시키는 케이스 있음). 색은 `useThemeTokens()` 반환값을 inline으로

---

## 2. 24시간 동안 깨달은 라운드별 학습

### 진단 실패의 패턴

같은 본질의 버그를 10라운드에 걸쳐 다른 가설로 진단함:

| Round | 잘못된 가설 | 실제 원인 |
|---|---|---|
| 1 | iOS Sim 캐시 stale | (부분 맞음 — F4 cellar 평탄화 외에는 코드 버그) |
| 2-4 | iOS shadow + overflow:'hidden' 충돌 / radius 9999 무효 / tabBarStyle overflow visible | 부분 맞음, 하지만 marginTop -24 자체가 작동 안 함 |
| 5 | Yoga 음수 marginTop 의미 차이 | 맞지만 transform translateY도 안 됨 → 더 깊은 문제 |
| 6 | 부모 flex 의존 → position absolute 자식 | 맞지만 같은 부모 안에서 여전히 깨짐 |
| 7 | flex 안에 어떤 형태도 안 됨 → 컨테이너 absolute child로 분리 | 부분 맞음 |
| 8 | **NativeWind v4 cssInterop + Fabric에서 Pressable 함수형 style + nested 자식 무시** | 진짜 원인 발견 (wine-feed + BottomNav FAB 작동) |
| 9 | NavTab도 같은 버그라 inner View 분리 | 맞지만 `flex: 1`을 Pressable에 그대로 둠 → 여전히 cluster |
| 10 | **`flex` prop도 같은 카테고리. outer View로 분리** | **진짜 fix** (NavBar 균등 분포) |

### 진단 헛디딘 이유

1. **단순 케이스가 작동했음**: `suggested-actions ActionRow`(className + style 함수 + Text + ChevronRight 단순 자식)는 작동. 그래서 "Pressable + className + style 함수"가 일반적으로 깨진다고 의심하지 못함.
2. **시각 결과가 "비슷한 듯 다른" 형태**: 빨간 사각형 / 빨간 원 / 가운데 안 보임 / 양옆 cluster — 각 라운드 다른 모양으로 보여서 다른 가설을 세움.
3. **bundle stale 가설로 자꾸 도망**: 코드는 맞는데 화면 안 나오면 일단 캐시 의심. macOS의 `$TMPDIR` 경로조차 처음엔 잘못 가이드함.

### 진단 정공법

같은 시각 버그가 반복되면 **stack 차원 문제 의심**. 단순한 verbatim 변환이 깨지면 다음 순서로 확인:
1. `babel.config.js` — `jsxImportSource`, plugin 조합
2. `app.config.ts` — `newArchEnabled`, RN 새 기능 활성 여부
3. `package.json` — pre-1.0 또는 bleeding edge 패키지 (`react-native-worklets@0.5`, Reanimated v4 등)
4. **시각 결과 vs 코드 시각화 사이의 정확한 갭** 명확히 가르기 (어떤 prop이 적용되고 어떤 게 안 되는지 cross-check)

---

## 3. 이번 세션에서 확정된 표준 패턴

### 3-1. Pressable 패턴 (CLAUDE.md §4-11 + docs/NEXT_TO_RN_TRANSLATION.md §8c)

**언제 3-layer 패턴 적용?**
- Pressable에 layout prop (flex/flexDirection/padding/borderRadius/bg 등) 1개 이상
- AND nested 자식 (View/SVG/icon 여러 개) 있음

**모든 케이스 일관 적용 권장**. 단순 케이스(icon 1개)도 미래 자식 추가 시 silent regression 방지.

### 3-2. flex 분포 — outer View 필수

부모가 flex container(`flexDirection: 'row'` + flex 자식들)인 경우, **Pressable의 flex는 outer View로**.

```tsx
// ❌ Pressable이 collapse돼서 다른 형제(특히 flex:1 View spacer)에게 공간 빼앗김
<View style={{ flexDirection: 'row' }}>
  <Pressable style={({pressed}) => ({ flex: 1 })}>...</Pressable>
  <View style={{ flex: 1 }} />  ← 이게 모든 공간 다 먹음
  <Pressable style={({pressed}) => ({ flex: 1 })}>...</Pressable>
</View>

// ✅ outer View가 flex 분포 담당
<View style={{ flexDirection: 'row' }}>
  <View style={{ flex: 1 }}><Pressable>...</Pressable></View>
  <View style={{ flex: 1 }} />
  <View style={{ flex: 1 }}><Pressable>...</Pressable></View>
</View>
```

### 3-3. position absolute + poke-out (BottomNav FAB 같은 패턴)

웹 CSS `marginTop: -24`로 컨테이너 위로 튀어나오는 패턴은 Yoga에서 작동 안 함. **`position: 'absolute'` + bottom/left 좌표 + outer View wrapping**.

```tsx
// 컨테이너 안에 absolute child로 띄움
<View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingBottom: P }}>
  {/* 다른 flex 형제들 */}
  <View
    style={{
      position: 'absolute',
      bottom: P + offset,       // padding 보정 + 추가 오프셋
      left: '50%',
      marginLeft: -FAB_SIZE/2,  // centering trick (작동함)
      width: FAB_SIZE,
      height: FAB_SIZE,
      zIndex: 10,
    }}
  >
    <Pressable style={({pressed}) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View style={{
        width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE/2,
        backgroundColor, borderWidth, borderColor,
        alignItems: 'center', justifyContent: 'center',
        shadowColor, shadowOpacity, shadowOffset, shadowRadius, elevation,
      }}>
        {icon}
      </View>
    </Pressable>
  </View>
</View>
```

### 3-4. light/dark 분기 — `tokens.scheme` 활용

mode 의존 visual은 inline에서 `tokens.scheme === 'light'` 분기. className `dark:` prefix는 NativeWind v4 dual-mode token이 올바르게 invert된 상태일 때만 작동.

```tsx
const tokens = useThemeTokens();
<View style={{
  backgroundColor: tokens.scheme === 'light' ? '#C9A84C' : brand.wineRed,
  borderColor: tokens.scheme === 'light' ? '#A07F2E' : brand.gold,
}} />
```

### 3-5. Tailwind dual-mode token

`tailwind.config.ts`에 dual-mode 토큰 정의 시 **반드시** `{ DEFAULT: light, dark: dark }` 형식.

```ts
// ❌ light가 sub-shade로 처리됨. dark: prefix가 작동 안 함
'bg-deepest': { DEFAULT: '#251837' /* dark */, light: '#FAF5EC' }

// ✅ NativeWind v4 CSS 변수 자동 swap 작동
'bg-deepest': { DEFAULT: '#FAF5EC' /* light */, dark: '#251837' }
```

### 3-6. expo-router 디렉토리 라우트

`app/notes/` 같은 디렉토리는 단일 `<Stack.Screen name="notes" />`로 등록 못 함. **각 sub-route 명시**.

```tsx
// ❌ Layout children warning
<Stack.Screen name="notes" />

// ✅ 각 sub-route 등록
<Stack.Screen name="notes/index" />
<Stack.Screen name="notes/new" />
<Stack.Screen name="notes/new/write" />
<Stack.Screen name="notes/[noteId]" />
```

### 3-7. macOS Metro 캐시 (24시간 디버깅의 부분 원인)

macOS Metro 캐시는 `/tmp`가 아니라 `$TMPDIR` (`/var/folders/.../T/`)에 있음. zsh는 `no matches found` 글로브 실패 시 전체 명령 abort.

**정확한 캐시 클리어 시퀀스**:
```bash
# Ctrl+C로 Metro 중지 후
rm -rf "$TMPDIR"metro-cache              # 따로따로 (glob 실패 abort 회피)
rm -rf "$TMPDIR"metro-file-map-*
rm -rf node_modules/.cache .expo
xcrun simctl erase all                   # iOS Sim 통째로 리셋 (필요 시)
npx expo start --clear --reset-cache --ios
```

---

## 4. 현재 상태 (2026-05-21 종료 시점)

### 작동 확인된 화면
- ✅ 첫 진입 — light mode cream/white bg
- ✅ BottomNav — 5탭 균등 분포 (icon 위 + label 아래 stack), FAB 골드(light) / wineRed(dark)
- ✅ WineFeed — horizontal layout (bottle 좌 + 정보 우 + rating/price)
- ✅ Settings index — 환경설정 3 row + 계정 연결 disabled
- ✅ Map/Community — informative placeholder (icon + 설명 + "v0.2.0 출시 예정")
- ✅ FirstTime home — StatHero(0/0/0) + MapCameo + CommunityPeek("추천 글") + WineFeed

### 적용된 Round 8/10 패턴 (총 14개 컴포넌트)
**확실히 처리됨**:
- `src/components/nav/bottom-nav.tsx` (NavTab + FAB)
- `src/components/home/wine-feed.tsx` (WineFeedRow)
- `src/components/home/quick-actions.tsx` (ActionCard)
- `src/components/home/recent-notes-strip.tsx` (NoteCard)
- `src/components/home/cellar-summary-section.tsx`
- `src/components/home/recent-notes-section.tsx` (NoteCard)
- `src/components/home/home-community-peek.tsx` (PostRow)
- `src/components/settings/settings-radio-row.tsx`
- `src/components/capture/choose-option-card.tsx`
- `src/components/wine/my-tasting-note-card.tsx`
- `src/components/wine/add-to-cellar-cta.tsx`
- `src/components/notes/impression-triad.tsx`
- `src/components/notes/finish-triad.tsx`
- `src/components/notes/palate-triad.tsx`
- `app/settings/index.tsx` (SettingsRow 신규)

### 보류 — 단순 케이스 (사용자 확인 시 진행)
잠재 위험 있으나 단순 자식이라 작동 중일 수 있는 곳:
- `src/components/home/suggested-actions.tsx` — ActionRow (사용자가 first-time home에서 제거함, 더 이상 사용 X)
- `src/components/home/draft-note-resume.tsx`
- `src/components/shared/primary-button.tsx` — 사용자 "라벨 스캔하기" 정상 작동 확인됨
- `src/components/shared/option-card.tsx`
- `src/components/capture/secondary-icon-button.tsx`
- `src/components/wine/price-chart-stub.tsx` (range toggle, details link)
- `src/components/wine/community-drink-window-card.tsx`
- `src/components/wine/favorite-toggle.tsx` (icon only)
- `src/components/wine/external-ratings-card.tsx` (icon only)
- `src/components/wine/write-note-cta.tsx`
- `src/components/cellar/cellar-card.tsx`

→ **새 작업할 때 위 파일 건드리게 되면 Round 10 패턴으로 재작성**.

---

## 5. 향후 개발 — 절대 위반하지 말 정책

### 5-1. 새 Pressable 작성 시 자동 적용

**모든 신규 Pressable은 처음부터 3-layer 패턴**. 자식이 단순해도 일관성/regression 차단을 위해.

```tsx
// 신규 컴포넌트 boilerplate
function MyButton() {
  const tokens = useThemeTokens();
  return (
    <View style={{ flex: 1 }}>  {/* flex 분포 필요 시 */}
      <Pressable
        onPress={...}
        accessibilityRole="..."
        accessibilityLabel={...}
        style={({pressed}) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <View style={{ /* layout + visual inline */ }}>
          {children}
        </View>
      </Pressable>
    </View>
  );
}
```

### 5-2. 코드 변경 전 grep 점검

```bash
# Pressable + className + style 함수 동시 사용 발견 (위험)
grep -rn -B1 "style={({\s*pressed" app/ src/ --include="*.tsx" | grep -B1 "className"

# Pressable style 함수에 flex prop (cluster 위험)
grep -rn -B1 "style={({\s*pressed" app/ src/ --include="*.tsx" | grep -A8 "flex:\|flexBasis\|flexGrow"

# Pressable style 함수에 layout prop (cssInterop 무시 위험)
grep -rn -A10 "style={({\s*pressed" app/ src/ --include="*.tsx" | grep -E "flexDirection|padding|margin|borderRadius|backgroundColor|transform"

# 음수 margin (Yoga vs CSS — poke-out 의도면 transform/absolute로)
grep -rn "marginTop: -\|marginLeft: -\|marginRight: -\|marginBottom: -" app/ src/

# Tailwind dual-mode token 잘못된 shape
grep -B1 -A1 "DEFAULT.*light:" tailwind.config.ts  # 발견 시 invert 필요
```

### 5-3. design-spec-author / rn-screen-builder agent 사용 시

`.claude/agents/rn-screen-builder.md` + `.claude/agents/design-reviewer.md`가 이미 이 정책 알도록 갱신됨. 새 화면 변환 시 agent를 통해 작업하면 자동 적용. **agent 우회 직접 작성 시 5-1/5-2 수동 확인 의무**.

### 5-4. 시각 검증 — 의무

`docs/NEXT_TO_RN_TRANSLATION.md §8b` 누적 의무. 새 패턴 fix할 때마다 사전에 추가.

design-reviewer 8-checklist 통과 후에만 qa-inspector로. **스크린샷 없으면 자동 FAIL** (`.claude/agents/design-reviewer.md`).

### 5-5. stack 다운그레이드 고려 시점

다음 상황 모이면 stack을 conservative하게 다운그레이드 검토:
- 새로운 Pressable layout 버그 또 발견 (3-layer로도 안 잡힘)
- Reanimated v4 worklets 0.5.x bug 추가 발견
- NativeWind v4 cssInterop bug 새 카테고리 발견

다운그레이드 옵션:
- `newArchEnabled: false` (Fabric 끄기)
- Reanimated `4.1.1` → `3.x`
- NativeWind `4.1` → `3.x` (jsxImportSource 제거)

→ **Next.js + Capacitor 전환은 마지막 옵션**. 9/12 화면 + 인프라 + 마이그레이션 다 재작성 비용 너무 큼.

---

## 6. 다음 작업 시 시작 절차

### 단계 1 — 컨텍스트 로드
1. 이 파일 (`_workspace/handoff/2026-05-21-css-rn-pressable-pattern.md`) 읽기
2. `CLAUDE.md` §4-11 + §4-10 읽기
3. `docs/NEXT_TO_RN_TRANSLATION.md` §8a + §8b + §8c 읽기
4. 직전 핸드오프 (`_workspace/handoff/sim-bug-fix-rounds.md`) 참고 — Round 1~4 과거 학습

### 단계 2 — 작업 종류별 가드

**새 화면 구현**:
- design-spec-author agent로 사양 작성 → rn-screen-builder agent로 구현 → design-reviewer 게이트 → qa-inspector
- 모든 신규 Pressable은 5-1 boilerplate
- 스크린샷 캡처 (keyscreen + iOS Sim dark/light) 후 멀티모달 비교

**기존 화면 수정**:
- 수정 대상 파일이 §4 "보류 단순 케이스"에 있으면 Round 10 패턴 재작성
- §4 "Round 10 적용됨"이면 기존 패턴 유지하고 inner View에만 변경

**디자인 변경**:
- 새 layout primitive 발견 → `docs/NEXT_TO_RN_TRANSLATION.md` §8a/§8c에 항목 추가
- ko/en 양쪽 + dark/light 양쪽 검증

### 단계 3 — 검증

```bash
# typecheck
npx tsc --noEmit

# emoji / 하드코딩 hex 검출
npm run lint:emoji
npm run lint:hex

# 위험 패턴 grep (5-2)
# Metro 캐시 클리어 (5-3-7)
# iOS Sim reload 후 스크린샷
```

### 단계 4 — 커밋

의미 단위 커밋. 사용자 명시적 승인 후 push.

---

## 7. 관련 commits

```
e187bec feat(home): first-time 재구성 + 커뮤니티 피크 시각 개선
439b0f0 fix(nav): NavTab cluster — flex:1을 outer View로 (Round 10 진짜 fix)
07c8d51 fix(nav): NavTab 세로 stack 복구 + FAB light mode 골드 + routing warning 해결
a62913e feat(screens): settings 인덱스 구현 + map/community placeholder 개선
11a386a feat(theme): light mode 기본 + tailwind dual-mode token 표준화
258eaea fix(ui): Round 8 패턴 일괄 적용 — 9개 컴포넌트 Pressable inner View 분리
4754cb7 fix(home): WineFeedRow horizontal layout — Pressable inner View 분리
01ad98e fix(nav): BottomNav FAB poke-out — position absolute + inner View 분리
b7c6f52 docs(policy): NativeWind+Fabric Pressable + Yoga vs CSS 정책 영속화
```

---

## 8. 한 줄 요약

> **모든 Pressable은 3-layer 구조: outer `<View>` (flex) → `<Pressable>` (opacity만) → inner `<View>` (layout + visual inline). Pressable의 style 함수에 layout prop 절대 금지.**

이 한 줄을 어기면 **24시간 다시 시작**.
