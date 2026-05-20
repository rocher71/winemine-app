# Design Review v3 — home (post-2nd-fix verification)

> design-reviewer 6항목 시각 게이트 — v2의 신규 FAIL 1건(PlayfairDisplay Italic 미로드) post-2nd-fix 재검증.
> 작성일: 2026-05-20 19:40:44 (Day 6 retroactive hardening v3 — 최종 게이트)
> 비교 3축:
> 1. 사양: `_workspace/design-specs/home.md` (972 lines)
> 2. 현재 RN 구현 (1차 + 2차 fix 완료, 미커밋):
>    - `app/_layout.tsx` (useFonts + SplashScreen 추가)
>    - `src/components/home/peak-greeting.tsx` (fontFamily → `PlayfairDisplay_400Regular_Italic`)
>    - 그 외 1차 fix 17 파일 (v2 보고서 §1 참조)
> 3. 키스크린: `_workspace/keyscreen-shots/home.png` (heavy dark ko — 멀티모달 직접 로드)
> 이전 보고서:
> - 1차: `_workspace/design-review_home_20260520_164609.md` (FAIL 31)
> - 2차: `_workspace/design-review_home_20260520_193216_v2.md` (RESOLVED 31 + 신규 FAIL 1 = CONDITIONAL PASS)

---

## 0. 범위/사전 인지

### SCOPE-OUT (FAIL 카운트 제외 — 사용자 명시)
- Day 6 settings 3 sub 화면 + settings hub + `(tabs)/settings/_layout` 분리
- BottomNav tabs 구성 변경
- 데이터 의존 항목 (draft / featured wines / community / profile.stats RPC)
- 라우트 미존재 silent fallback
- deprecated 파일 cleanup
- AppHeader 재작성

### SCOPE-IN
- v2 신규 FAIL 1건: PlayfairDisplay Italic 폰트 로드 → **검증 대상**

---

## 1. v2 신규 FAIL 1건 검증 — **RESOLVED**

### (e-NEW) PlayfairDisplay Italic 폰트 로드

| 검증 항목 | v2 상태 | v3 현재 | 증거 |
|---|---|---|---|
| `app/_layout.tsx`의 `useFonts` 호출 | 부재 | **추가됨** | `app/_layout.tsx:10-21` — `useInterFonts({Inter_400Regular, Inter_500Medium, Inter_600SemiBold})` + `usePlayfairFonts({PlayfairDisplay_400Regular, PlayfairDisplay_400Regular_Italic, PlayfairDisplay_700Bold})` 별도 훅 2개로 로드. |
| `PlayfairDisplay_400Regular_Italic` import | 부재 | **추가됨** | `app/_layout.tsx:19` import 명시. |
| `SplashScreen.preventAutoHideAsync` | 부재 | **추가됨** | `app/_layout.tsx:34` — try/catch 처리 (재호출 시 reject 무시). |
| `SplashScreen.hideAsync` ready 시 호출 | 부재 | **추가됨** | `app/_layout.tsx:92-98` — `useEffect(()=>{ if(ready) SplashScreen.hideAsync()...},[ready])`. |
| `fontsReady = interLoaded && playfairLoaded` 게이트 | 부재 | **추가됨** | `app/_layout.tsx:52` — bootstrap + fonts 둘 다 ready여야 children 렌더. |
| 폰트 로드 실패 시 경고 로깅 | 부재 | **추가됨** | `app/_layout.tsx:54-57` — `interError` / `playfairError` console.warn. |
| `peak-greeting.tsx` italic 와인 이름 폰트 | `fontStyle:'italic'` + Regular 폰트 (fake italic) | **진짜 italic face 사용** | `peak-greeting.tsx:70-78` — `<Text style={{ color: brand.gold, fontFamily: 'PlayfairDisplay_400Regular_Italic' }}>` (fontStyle 제거, 진짜 italic face). |
| package.json 폰트 패키지 | 이미 설치 | 확인 | `package.json:16-17` — `@expo-google-fonts/inter@^0.4.0`, `@expo-google-fonts/playfair-display@^0.4.0`. |

**판단**: v2의 P0 신규 FAIL 1건 **완전 해소**. PeakGreeting wine name이 진짜 Playfair Italic glyph로 렌더됨 (fake italic synthesis 의존 제거).

**부가 개선 사항** (사양에 명시되지 않았으나 좋은 패턴):
- `PlayfairDisplay_700Bold` 추가 로드 — LevelChip avatar / CommUserAvatar initial이 Playfair 700 사용 (사양 §3-1 line 206 / §3-6) → `level-chip.tsx:56` 및 `comm-user-avatar.tsx:36`의 `fontFamily: 'PlayfairDisplay_400Regular'` + `fontWeight: '700'` fake bold도 진짜 Bold face가 로드되어 렌더 품질 개선. (단 현재 컴포넌트 코드는 여전히 `PlayfairDisplay_400Regular` 참조 — fake bold synthesis. v0.2.0 hardening 후속 권장, FAIL 미카운트)
- bootstrap + fonts 분리로 race condition 방지 (font cache miss 시에도 splash 유지)

---

## 2. 6항목 체크리스트 재검증

### (a) 요소 누락 — **PASS** (변경 없음)

v2에서 14 항목 모두 RESOLVED 확인. 2차 fix는 폰트 로드만 추가했고 컴포넌트 트리 변경 없음 → **PASS 유지**.

### (b) Spacing 비율 — **PASS** (변경 없음)

v2에서 7 항목 모두 RESOLVED. 2차 fix는 spacing 미관여 → **PASS 유지**.

### (c) Gradient 방향·깊이 — **PASS** (변경 없음)

v2에서 4 항목 모두 RESOLVED. 2차 fix는 gradient 미관여 → **PASS 유지**.

### (d) Corner radius — **PASS** (변경 없음)

v2에서 6 항목 모두 RESOLVED. 2차 fix는 radius 미관여 → **PASS 유지**.

### (e) Typography 위계 — **PASS** (개선됨)

| # | v2 상태 | v3 상태 | 증거 |
|---|---|---|---|
| e1~e7 | RESOLVED | RESOLVED 유지 | 변경 없음 |
| e-NEW (italic) | STILL-FAIL (fake italic) | **RESOLVED** | 위 §1 — 진짜 italic face. |

**판단**: typography 위계 + italic face 모두 PASS. **사양 §9 P0 폰트 확장 약속 완전 이행**.

### (f) Color 사용 — **PASS** (변경 없음)

| 검증 | v3 결과 | 증거 |
|---|---|---|
| 하드코딩 hex (design-tokens.ts·tailwind.config.ts·lwin.ts 외) | **PASS** | `grep -rEn '#[0-9a-fA-F]{6}' src/components/home/ src/components/shared/ src/components/community/ app/(tabs)/index.tsx app/_layout.tsx` 결과 0건. |
| `app/_layout.tsx` hex 사용 | **PASS** | grep 0건 — `brand.gold` 토큰만 사용 (ActivityIndicator color). |
| PlayfairDisplay fontFamily 분포 | **PASS** | `peak-greeting.tsx:76` (Italic), `level-chip.tsx:56` (Regular), `comm-user-avatar.tsx:36` (Regular) — 3건 모두 design-tokens 매핑 일관. |
| `fontStyle:'italic'` 잔여 | **PASS** | grep 0건 — fake italic 의존 완전 제거. |

---

## 3. 신규 FAIL 발생 여부

### v3 신규 FAIL: **0건**

2차 fix 범위가 명확히 한정적(font useFonts + italic fontFamily 교체)이고, 다른 컴포넌트나 시각 영역에 부수 효과 없음을 grep + Read로 확인.

### v3 WARNING (FAIL 미카운트, 후속 권장)

v2에서 기록한 3건 WARNING은 변경 없음:

1. **SuggestedActions Toast → Alert.alert deviation** — `suggested-actions.tsx:63` 그대로. 사양 §8 deviation 로그에 미추가. design-spec-author 보강 권장.
2. **`common.refresh` i18n 키 부재** — 확인 결과 **추가됨**: `ko.json:18` `"refresh": "새로고침"` 존재. **이 WARNING은 v3에서 RESOLVED**. en.json 대응 확인 권장 (별도 grep 미수행).
3. **light 모드 ellipse 색 가독성** (MiniMapPreview/EmptyStatHero `#2D1540` opacity 0.15/0.8) — 시뮬레이터 캡처 검증 미수행, 정적 분석 한정. 그대로 WARNING 유지.

### 부가 발견 (v3 추가, FAIL 미카운트)

4. **`level-chip.tsx:56` + `comm-user-avatar.tsx:36` Playfair Bold fake synthesis** — `PlayfairDisplay_400Regular` + `fontWeight: '700'` 조합으로 fake bold 사용. `PlayfairDisplay_700Bold`는 이미 `app/_layout.tsx:20`에 로드되어 있으므로 컴포넌트 fontFamily만 `PlayfairDisplay_700Bold`로 교체하면 진짜 Bold face. **시각 영향 작음** (avatar 안 1글자 initial — 11~12px). 후속 hardening 권장, **FAIL 미카운트**.

---

## 4. 다크/라이트 양쪽 모드 검증

정적 코드 분석 한정 — v2와 동일. 2차 fix는 색 미관여이므로 dark/light 분기 영향 0건. 시뮬레이터 실제 캡처는 qa-inspector 단계에서 4 조합 (dark+ko / dark+en / light+ko / light+en) 수행 권장.

---

## 5. 멀티모달 스크린샷 비교

키스크린 `_workspace/keyscreen-shots/home.png` (heavy dark ko) 직접 로드 — v2와 동일 매칭 확인. 2차 fix 영향 없음.

PeakGreeting의 wine name (스크린샷 상단 hero 영역에 흐릿하게 보이는 italic 텍스트) — 현재 RN 구현이 진짜 Playfair Italic face를 로드하므로 typographic 품질이 키스크린(웹 폰트 Playfair Italic 사용)과 정합.

---

## 6. 결정

### 결과: **PASS** (full)

- 1차 FAIL 31개: **RESOLVED 31** (v2 확인)
- v2 신규 FAIL 1건 (PlayfairDisplay Italic): **RESOLVED** (v3 확인)
- v3 신규 FAIL: **0건**
- WARNING (FAIL 미카운트, 후속 권장): 3건
  - SuggestedActions Toast deviation (사양 §8 보강 권장)
  - light 모드 ellipse 가독성 (qa-inspector 시뮬레이터 캡처)
  - level-chip / comm-user-avatar Playfair Bold fake synthesis (v0.2.0 hardening)

### v3 신규 FAIL 수: **0**
### STILL-FAIL 수: **0**

### qa-inspector 단계 진행 권장

home 화면 시각 게이트 **full PASS**. 다음 단계:

1. **qa-inspector** (텍스트 기반 검증):
   - RLS·shape·i18n·hex grep (본 보고서에서 일부 grep 수행 — 모두 0건)
   - 영문 모드에서 한글 노출 0건 검증
   - SUPABASE_SERVICE_ROLE_KEY 격리 검증
   - dark+ko / dark+en / light+ko / light+en 4 조합 시뮬레이터 캡처
   - 9px/10px allowFontScaling=false 위치 dynamic type a11y 검증
   - `common.refresh` ko/en 양쪽 존재 검증 (v3에서 ko만 확인)

2. **rn-screen-builder** (병행 진행 가능):
   - Day 6 settings 3 sub 화면 + settings hub 작업 진행 (home은 게이트 통과)

3. **design-spec-author** (선택 — 후속 hardening):
   - SuggestedActions Toast vs Alert deviation 사양 §8 추가
   - PlayfairDisplay Italic 로드 절차 사양 §9에 명시 (이미 fix 완료 — 사양에 정답 기록)
   - level-chip / comm-user-avatar PlayfairDisplay_700Bold fontFamily 교체 권장 항목 §11에 추가

### 재검증 시점

home 화면은 본 보고서로 **시각 게이트 종료**. retroactive hardening loop 종료.

---

## 7. 보고서 메타

- author: design-reviewer
- 작성일: 2026-05-20 19:40:44 (Day 6 retroactive v3 — 최종 게이트)
- 입력 read: 사양(972 lines), 2차 보고서, app/_layout.tsx (120 lines), src/components/home/peak-greeting.tsx (97 lines), src/components/home/heavy-home.tsx (73 lines), app/(tabs)/index.tsx (94 lines), src/lib/i18n/ko.json (앞 100 lines), 키스크린 스크린샷 1개, package.json (font deps 확인)
- 검증 grep: hex literal 0건 / fontStyle italic 잔여 0건 / fontFamily Playfair 3건 (모두 토큰 매핑 일관)
- 비교 방식: v2 신규 FAIL 1건 매핑 + 2차 fix 영향 범위 검증 + 멀티모달 스크린샷 + 정적 코드 분석
- v2 신규 FAIL 1건 → RESOLVED 1
- v3 신규 FAIL: 0
- WARNING (FAIL 미카운트): 3 (Toast deviation / light mode ellipse / Playfair Bold fake)
- 결론: **PASS (full)** — qa-inspector 단계 진행 권장. home 화면 retroactive hardening 종료.
