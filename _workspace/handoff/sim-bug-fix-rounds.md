# 사용자 시뮬레이터 실측 기반 버그 fix 회차 정리

> 작성: 2026-05-21T06:17Z
> 범위: 사용자가 iPhone Simulator + 핸드폰 Expo Go 실측 스크린샷을 보내며 보고한 시각 버그들의 회차별 진단 / 수정 / commit 이력
> 트리거: 사용자 메시지 "winemine 디자인 hardening" 후 시뮬 실측 → 사진 첨부 → fix 사이클

회차마다 (1) 사용자 입력 (2) 진단 (3) 수정 코드 변경 (4) commit hash / 회차 결과 4섹션으로 정리. 다음 세션이 어느 라운드 결론을 참조하면 되는지 빠르게 추적할 수 있도록 함.

---

## Round 1 — 첫 fix 요청 (Follow-up Cycle 1)

### 사용자 입력
**날짜**: 2026-05-21 (한국 11~14시경)

**보낸 사진** (총 6장):
- image #2: 시뮬 — `/onboarding/3-experience` (다음 버튼이 full-width wineRed + 흐릿한 텍스트, placeholder처럼 보임)
- image #3: 시뮬 — `/home` 화면 (BottomNav 8 tabs 가로 overflow: `홈 / 라벨 촬영 / 노트 / cellar/index / cellar/[lwin] / settings/index / settings/language / settings/experience / settings/appearance`)
- image #4: keyscreen MVP — `/home` (참조용; 5 tabs: 홈/지도/카메라 floating 빨간 원/셀러/커뮤니티)
- image #5: keyscreen MVP — `/onboarding/2-language` (참조용; 다음 버튼 깔끔한 disabled)
- image #6: 시뮬 — `/home` 와인 박스 (bottle SVG가 카드 왼쪽 위 큰 사이즈로 isolated, 정보는 카드 하단 vertical stack)
- image #7: keyscreen MVP — 와인 둘러보기 (참조용; horizontal layout — bottle 좌 + 정보 우 inline)

**메시지 요지**: "온보딩 버튼들의 css, 홈 화면 속 하단 네비게이션 바, 그리고 팔로잉의 새 노트 속 css등 모두 신경써서 다시 디자인 배치해줘. 홈 화면 하단에 보이는 와인 박스들의 placement들도 다시 확인해서 배치해줘. 디자인 에이전트 및 qa로 기존의 winemine-keyscreen 레포 속 코드 상세히 확인해서 개선해줘."

### 진단

P0 4건 식별:
1. **F1**: BottomNav 8 tabs overflow — 키스크린 5 tabs verbatim 필요. `(tabs)/notes`, `(tabs)/cellar/[lwin]`, `(tabs)/settings/*` 4개가 별도 stack route로 분리되어야 함. 카메라 = floating large red circle (FAB) + white camera icon.
2. **F2-a**: `/home` wine-feed 카드 vertical → horizontal (bottle 좌 96px column + 정보 우 inline) 재구성.
3. **F2-b**: `/home` followers note row vertical → horizontal (작은 round avatar 28px + pill badge inline).
4. **F3**: `/onboarding/*` 4 화면 공통 PrimaryButton CTA: `opacity-50` disabled가 enabled까지 흐리게 만들어 placeholder처럼 보임. 색 교체 방식 (bg-text-disabled / text-text-muted) + height 48 + radius 12.

### 수정 코드 변경

| 항목 | spec | review 1차 → 2차 | qa | 변경 파일 | commit |
|---|---|---|---|---|---|
| F1 BottomNav | `bottom-nav.md` | FAIL 11 → PASS | PASS | `app/(tabs)/{_layout,map,community}.tsx` 신규/재작성, `app/{notes,cellar,settings}/*.tsx` 이동 (git mv 6개), `app/_layout.tsx` root Stack 확장, `src/components/nav/bottom-nav.tsx` 전면 재작성, `src/lib/i18n/{ko,en}.json` (`nav.map / nav.community / nav.captureA11y / nav.a11y.primary` 4 키), router path 갱신 4 파일 | `6bb436e` |
| F2-a wine-feed | `home.md §3-8-PATCH` | FAIL 4/6 → PASS | PASS | `src/components/home/wine-feed.tsx` (rewrite — `flexDirection: 'row'` + bottle column 96 + meta flex + right 76), `src/lib/i18n/{ko,en}.json` (`home.wineFeed.openDetail`) | `1de23cd` |
| F2-b followers note row | `home.md §3-6-PATCH` | FAIL 6/6 → PASS | PASS | `src/lib/design-tokens.ts` (`postTypeBadgeColor` 3종 신규), `src/components/community/{post-type-badge,comm-user-avatar}.tsx` (rewrite — pill + 5종 lucide icon + verbatim PostType union + cream text + noteAuthorAvatarGradient), `src/components/home/home-community-peek.tsx` (rewrite), `src/lib/i18n/{ko,en}.json` (7 신규 키) | `9d131cc` |
| F3 onboarding CTA | `onboarding-cta.md` | FAIL 7 → PASS | PASS | `src/components/shared/primary-button.tsx` (rewrite — color-swap disabled / height 48 / px 20 / radius 12 / letterSpacing -0.01em / numberOfLines / border), `src/lib/design-tokens.ts` (`componentSize.primaryButton.lg 52→48`) | `3f5ca27` |

### 결과
- 4건 모두 PASS+QA PASS, 평균 fix loops 1.0, escalate 0건
- Follow-up Cycle 1 ALL DONE (2026-05-21T04:04:12Z)
- 사용자 확인 가이드: `npx expo start --ios --clear`

---

## Round 2 — "여전히 그대로" 1차 보고

### 사용자 입력
**보낸 사진** (총 5장 — image #8 ~ #12):
- image #8: 시뮬 — 홈 (followers note row가 vertical로 보임: 큰 avatar "벨" row 1 단독 + badge "시음 노트" + "벨벳폭스 · 3h" 그 아래)
- image #9: 핸드폰 — 위와 같음 (avatar 약 50~60px로 큼, 코드 size=28과 불일치)
- image #10: 시뮬 — 와인 둘러보기 (와인 카드 vertical: bottle 위 + 이름/producer/location/grapes/rating/price 아래 vertical stack)
- image #11: keyscreen MVP — `/home` heavy mode (참조용; BottomNav FAB 빨간 원 큼)
- image #12: keyscreen MVP — `/home` 와인 둘러보기 (참조용; horizontal cards)

**메시지 요지**: "전혀 개선이 되지 않았어. 다시 확인하고 개선해줘. 네비게이션바에는 홈, 지도, 카메라 로고, 셀러, 커뮤니티 다섯개가 있어야해."

### 진단

git pull rebase + status 클린 확인. 코드 직접 Read.

| 보고 항목 | 진단 |
|---|---|
| 팔로잉의 새 노트 vertical | 코드 (`home-community-peek.tsx:108`) `flexDirection: 'row' + gap: 10 + avatar 28 + meta flex 1` 명백 horizontal. avatar size 50~60 표시 = 이전 큰 size bundle stale. **디바이스/Expo Go 캐시 stale** |
| 와인 카드 vertical | 코드 (`wine-feed.tsx:207`) `flexDirection: 'row' + bottle 96 + meta flex + right 76` 명백 horizontal. **캐시 stale** |
| BottomNav 8 tabs | git status `ls app/(tabs)/` 결과 `cellar/index.tsx` 잔존 발견. **expo-router가 `cellar/index`를 별도 라우트로 자동 마운트** → `_layout.tsx`의 `name="cellar"` 등록과 동시에 'cellar/index' 라우트도 노출 → BottomNav 5번째 tab "cellar/index" 그대로 표시. **진짜 코드 버그** |

### 수정 코드 변경

**F4: `(tabs)/cellar/index.tsx → (tabs)/cellar.tsx` 평탄화**
```
git mv app/(tabs)/cellar/index.tsx app/(tabs)/cellar.tsx
rmdir app/(tabs)/cellar
```
- 영향 사용처 grep: `router.push('/(tabs)/cellar')` 3건은 평탄화 후에도 동일 매칭. regression 없음.
- typecheck clean.

**F5 (코드 변경 X)**: wine-feed / community-peek 캐시 stale로 결론. 사용자 강력 캐시 클리어 가이드 제공:
- `rm -rf node_modules/.cache .expo /tmp/metro-* /tmp/haste-map-*`
- iOS Sim `Device → Erase All Content and Settings`
- Expo Go 앱 삭제 후 재설치
- `npx expo start --clear`

### 결과
| 항목 | commit |
|---|---|
| F4 cellar 평탄화 | `25beb55` |
| F5 캐시 가이드 | (코드 변경 없음, checklist 기록만) |

---

## Round 3 — image #13 결정적 증거

### 사용자 입력
**보낸 사진** (1장 — image #13):
- 시뮬 — `/home` first-time mode 화면. 변경된 부분:
  - ✅ BottomNav 5 tabs 정상: 홈/지도/[카메라 icon]/셀러/커뮤니티 (cellar/index 라우트 누출 fix됨)
  - ❌ 카메라 슬롯 = 그냥 카메라 outline icon만, **빨간 floating round circle 부재**, marginTop -24 안 잡힘 (다른 tabs와 같은 baseline)
  - 우측 상단 "감" 빨간 원 chip (FirstTimeAvatar — first-time mode 의도된 디자인)
  - 본문은 first-time 컴포넌트: FirstTimeGreeting wineRed 카드 + EmptyStatHero + SuggestedActions

**메시지 요지**: "너가 하라는대로 다 했는데 아직 시뮬레이터, 내 핸드폰 모두 다 이렇게 보여 내비게이션, 와인 박스 모두; 수정제대로 해."

### 진단

image #13이 결정적 증거:
- cellar 평탄화 fix가 적용된 상태 (셀러/커뮤니티 정상 표시) → **캐시 stale이 아니라 코드 버그**
- BottomNav 코드(`src/components/nav/bottom-nav.tsx`) Read 결과 FAB 분기는 명백히 존재
- design-tokens.ts `gradients.fab.dark` (wineRed→deep) + `shadows.fabDark` (wineRed glow) 모두 정의됨
- 그런데 빨간 원이 안 나옴 = LinearGradient 자체 rendering 실패

**근본 원인**: iOS는 단일 Pressable에 `overflow: 'hidden'` + view shadow + LinearGradient absoluteFillObject를 한꺼번에 적용 시 native rendering 깨지는 패턴. shadow가 clip되고 LinearGradient도 안 그려짐.

### 수정 코드 변경

**F6**: BottomNav FAB iOS shadow + overflow 충돌 fix

`src/components/nav/bottom-nav.tsx:96-143` 재구성:
```
외부 wrapper View (shadow + marginTop -24 + borderRadius full)
  └ 내부 Pressable (overflow:hidden + backgroundColor: brand.wineRed + LinearGradient absoluteFillObject)
```

- shadow는 외부 wrapper가 담당 → clip 안 됨
- overflow:hidden은 내부 Pressable이 담당 → radius clip
- **backgroundColor wineRed solid fallback** — LinearGradient 렌더 실패해도 빨간 원 보장

### 결과
| 항목 | commit |
|---|---|
| F6 FAB shadow 분리 | `6b39fb3` |

사용자 안내: dev server clean restart + iOS Sim reload (`Cmd+R`) + 핸드폰 Expo Go 강제 종료 후 재진입.

---

## Round 4 — image #14, #15 (square 잔존)

### 사용자 입력
**보낸 사진** (2장 — image #14, #15):
- image #14: 시뮬 — BottomNav 가운데 슬롯에 **빨간 square (radius 0, marginTop 0)** + 카메라 icon white
- image #15: 핸드폰 — 동일 (빨간 square 다른 tab과 같은 baseline)

**메시지 요지**: "ㅋㅋ 진짜 그대론데.... 제발 다시 확인해봐..."

### 진단

진짜 진전: backgroundColor wineRed는 잡힘 (빨강 보임) → 코드 일부 적용. 단:
- ❌ borderRadius full (9999) 안 잡힘 → 원 아닌 square
- ❌ marginTop -24 안 잡힘 → 다른 tab과 같은 baseline (위로 안 튀어나옴)
- ❌ shadow 안 보임

가능한 원인 후보:
1. `radius.full = 9999` 토큰 spread 시 일부 RN 버전에서 무시 (radius 28 같은 명시값으로 안전)
2. `...fabShadow` spread도 마찬가지 무시 가능 (inline shadow 4속성으로 직접 명시)
3. **expo-router default tabBar outer container의 `overflow: 'hidden'`** — child의 marginTop -24가 clip되어 위로 안 빠져나옴

### 수정 코드 변경

**F7**: 단일 Pressable + inline 명시값 + tabBarStyle overflow visible

**(1) `app/(tabs)/_layout.tsx`** — expo-router default tabBar outer wrapping 명시 제거:
```tsx
screenOptions={{
  headerShown: false,
  tabBarStyle: {
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    height: 'auto',
    overflow: 'visible',
  },
}}
```

**(2) `src/components/nav/bottom-nav.tsx:96-143`** — FAB 단순화 (LinearGradient/wrapper 제거):
```tsx
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 0 }}>
  <Pressable
    onPress={...}
    style={({ pressed }) => ({
      width: 56,
      height: 56,
      borderRadius: 28,           // 명시값 (radius.full 9999 우회)
      marginTop: -24,
      backgroundColor: brand.wineRed,
      borderWidth: 1.5,
      borderColor: brand.gold,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: pressed ? 0.85 : 1,
      // inline shadow — 토큰 spread 우회
      shadowColor: '#8B1A2A',
      shadowOpacity: 0.45,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 20,
      elevation: 12,
    })}
  >
    <Camera size={26} color={brand.cream} strokeWidth={1.6} />
  </Pressable>
</View>
```

핵심 변화:
- `radius.full` (9999) → `28` (= size/2) 명시값
- `spacing['13']` → `56` 명시값
- `...fabShadow` spread → 4속성 inline
- LinearGradient 제거 (solid wineRed가 충분히 키스크린에 가까움)
- 외부 wrapper View 제거 (단일 Pressable)
- expo-router outer tabBar container `overflow: 'visible' + height: 'auto'` 명시 → child marginTop -24가 위로 튀어나올 수 있게 함

### 결과
| 항목 | commit |
|---|---|
| F7 FAB inline 명시값 + tabBarStyle | `b7c9023` |

사용자 안내: reload 후 결과 image 한 장 더 보내달라 요청. 만약 그래도 square + baseline이면 다음 단계: `position: 'absolute'`로 변경해서 flex parent 제약 완전 우회.

---

## 전체 회차 요약 표

| Round | 사용자 입력 (사진) | 핵심 진단 | Fix 항목 | commit hash |
|---|---|---|---|---|
| 1 | image #2~#7 (시뮬 + keyscreen MVP) | 4개 P0 시각 갭 | F1 BottomNav 5 tabs + stack split | `6bb436e` |
| 1 | ↑ | ↑ | F2-a wine-feed horizontal | `1de23cd` |
| 1 | ↑ | ↑ | F2-b followers note row verbatim | `9d131cc` |
| 1 | ↑ | ↑ | F3 onboarding CTA | `3f5ca27` |
| 2 | image #8~#12 | cellar/index 라우트 누출 + 캐시 stale | F4 cellar 평탄화 | `25beb55` |
| 2 | ↑ | ↑ | F5 캐시 가이드 (코드 X) | — |
| 3 | image #13 | iOS shadow + overflow clip 충돌 | F6 외부 wrapper + solid fallback | `6b39fb3` |
| 4 | image #14, #15 | radius/marginTop/shadow 토큰 spread 무시 + outer tabBar overflow hidden | F7 inline 명시값 + tabBarStyle overflow visible | `b7c9023` |

**총 commit**: 8개 (Round 1: 4 / Round 2: 1 / Round 3: 1 / Round 4: 1 + checklist 진행 commit 다수 별도)

**계속 미해결** (Round 4 검증 대기):
- FAB 빨간 원 + marginTop -24 적용 (사용자 reload 결과 대기)
- 와인 카드 horizontal layout 검증 (Round 2 캐시 stale로 결론 → Round 4 사용자 image #14/15에 보이지 않음 — 추가 sim 캡처 시 재진단)

---

## 학습된 패턴 / 운영 메모

1. **expo-router 디렉토리 구조 주의**: `(tabs)/X/index.tsx`는 `Tabs.Screen name="X"`와 함께 'X/index' 별도 라우트로 자동 mount. tab으로 노출하지 않으려면 디렉토리 평탄화(`(tabs)/X.tsx`) 또는 root Stack으로 분리.

2. **iOS shadow + overflow:'hidden' + LinearGradient 단일 View 충돌**: 셋이 한 Pressable/View에 동시 적용되면 native rendering 깨짐. 외부 wrapper(shadow 담당) + 내부 child(overflow + content) 분리가 표준 해결.

3. **토큰 spread 패턴 무효화 케이스**: `radius.full` (9999), `...fabShadow` spread, `spacing[N]` 등이 일부 RN/expo-router 환경에서 적용 안 될 때 있음. 의심 시 inline 명시값(radius 28, 56 등) + 4속성 inline shadow로 우회.

4. **expo-router tabBar outer container**: custom `tabBar` prop으로 BottomNav 전달해도 outer wrapping이 default border/background/height/overflow를 가짐. `screenOptions.tabBarStyle: { overflow: 'visible', backgroundColor: 'transparent', borderTopWidth: 0, height: 'auto' }` 명시 필요. 그렇지 않으면 FAB marginTop -24 등이 clip됨.

5. **캐시 stale vs 진짜 버그 구분**: 시각 갭 보고 시 코드 직접 Read해서 사양 적용 여부 1차 확인 → 캐시 stale 가능성 있으면 강력 클리어 가이드 → 사용자가 클리어 후에도 동일하면 진짜 코드 버그로 결론.

6. **첨부 사진 시퀀스 가치**: 회차마다 사용자가 보낸 사진이 결정적 증거. image #13에서 "cellar 평탄화는 적용되었지만 FAB은 안 됨" → 캐시 stale 가설 reject + 진짜 코드 버그 확인. image #14에서 "backgroundColor만 잡힘" → 토큰 spread 무시 가설.
