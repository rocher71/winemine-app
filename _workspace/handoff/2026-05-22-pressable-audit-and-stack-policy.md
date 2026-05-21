# 핸드오버: Pressable 전수 감사 + 스택 정책 영속화

> 작성: 2026-05-22
> 전 세션 학습: 2026-05-21 24시간 디버깅 (상세: `_workspace/handoff/2026-05-21-css-rn-pressable-pattern.md`)
> 이 문서 목적: 이 문서의 지시를 **위에서 아래로 순서대로 실행**한다.

---

## 지시 사항

아래 4개 Task를 순서대로 완료한다. 각 Task 완료 기준이 명시되어 있다.

---

## Task 1 — audit 스크립트 생성

`scripts/audit-pressable.sh` 파일을 아래 내용으로 생성한다.

```bash
#!/bin/bash
# Pressable 위험 패턴 감지 스크립트
# 사용: bash scripts/audit-pressable.sh
# 출력: DANGEROUS(즉시 수정 필요) / SAFE(통과)

echo "=== DANGEROUS: layout prop이 Pressable style 함수 안에 있음 ==="
grep -rn -l "style={({ pressed" src/ app/ --include="*.tsx" | while read f; do
  if grep -A12 "style={({ pressed" "$f" | grep -qE "flexDirection|padding:|paddingHorizontal|paddingVertical|borderRadius|backgroundColor|borderColor|borderWidth|width:|height:|flex:"; then
    echo "  FIX: $f"
  fi
done

echo ""
echo "=== SAFE: opacity/transform only ==="
grep -rn -l "style={({ pressed" src/ app/ --include="*.tsx" | while read f; do
  if ! grep -A12 "style={({ pressed" "$f" | grep -qE "flexDirection|padding:|paddingHorizontal|paddingVertical|borderRadius|backgroundColor|borderColor|borderWidth|width:|height:|flex:"; then
    echo "  OK:  $f"
  fi
done
```

완료 기준: `bash scripts/audit-pressable.sh` 실행 시 에러 없이 출력됨.

---

## Task 2 — CLAUDE.md 스택 정책 섹션 추가

`CLAUDE.md`의 `§4-11` 바로 다음, `§4-10` 바로 앞에 `§4-12` 섹션을 추가한다.

추가할 내용:

```markdown
### 4-12. 스택 버전 정책 + Pressable 감사 명령

#### 스택 버전 정책 (Rule 1 — pre-1.0 패키지 직접 사용 금지)

| 패키지 | 현재 버전 | 정책 |
|---|---|---|
| `react-native-worklets` | 0.5.1 | pre-1.0 — 앱 코드에서 직접 worklets API 사용 금지. Reanimated 내부 의존성으로만 존재. 1.0 GA 전까지 신규 `useWorklet` / `runOnUI` 추가 금지 |
| `react-native-reanimated` | 4.1.1 | 직접 사용 시 §4-11 3-layer 패턴과 충돌 없는지 확인 필수 |
| `nativewind` | 4.1.0 | Pressable에 `className` 추가 시 §4-11 위반 여부 즉시 점검 |

#### 신규 UI primitive 추가 전 spike test (Rule 2)

신규 패키지 조합 또는 처음 사용하는 RN primitive 추가 시:
1. `src/components/__spike__/SpikeTest.tsx` 에 최소 재현 컴포넌트 작성
2. iOS Sim dark + light 양쪽 스크린샷 확인
3. 정상 작동 확인 후 실제 위치로 이동, `__spike__` 파일 삭제
4. 이상 발견 시 `docs/NEXT_TO_RN_TRANSLATION.md` §8a에 항목 추가 후 진행

#### Pressable 감사 명령 (코드 작성 후 / PR 전)

```bash
bash scripts/audit-pressable.sh
```

DANGEROUS 항목 0건이어야 PR 가능.
```

완료 기준: `CLAUDE.md`에 `§4-12` 섹션이 추가됨.

---

## Task 3 — HIGH 위험 파일 14개 3-layer 패턴으로 수정

아래 파일들을 순서대로 수정한다. 각 파일 수정 후 `npx tsc --noEmit` 통과 확인.

**수정 규칙 (§4-11 3-layer 패턴)**:
- Pressable의 `style` 함수 = `opacity` 단독 (또는 `opacity + disabled opacity`)
- `flex`/`flexBasis`/`flexGrow` 필요 시 → outer `<View style={{ flex: 1 }}>` 로 분리
- `flexDirection`, `padding`, `borderRadius`, `backgroundColor`, `borderColor`, `borderWidth` 등 모든 layout/visual → inner `<View style={{ ... }}>` 로 이동 (inline style, className 없이)
- `transform: [{ scale }]` 도 inner View로 이동

```tsx
// boilerplate
<View style={{ flex: 1 }}>                          {/* outer: flex 분포 필요 시 */}
  <Pressable
    onPress={...}
    accessibilityRole="..."
    accessibilityLabel={...}
    style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
  >
    <View style={{                                   {/* inner: layout + visual inline */}
      flexDirection: 'row',
      padding: 16,
      borderRadius: 14,
      backgroundColor: tokens.bg.surface,
    }}>
      {children}
    </View>
  </Pressable>
</View>
```

### 수정 대상 목록 (HIGH)

아래를 순서대로 처리한다:

- [ ] `src/components/notes/save-pill.tsx`
  - 현상: `borderRadius`, `backgroundColor`, `transform` 이 Pressable style 함수 안에 있음
- [ ] `src/components/notes/source-picker.tsx`
  - 현상: Pressable 2개 — 양쪽 모두 `backgroundColor`, `borderRadius`, `padding`, `transform` 포함
- [ ] `src/components/notes/template-card.tsx`
  - 현상: `gap`, `padding`, `borderRadius`, `transform` 포함
- [ ] `src/components/notes/aroma-grid.tsx`
  - 현상: `width`, `padding`, `borderRadius`, `backgroundColor` 포함
- [ ] `src/components/notes/cellar-bottom-sheet.tsx`
  - 현상: `flexDirection`, `padding`, `backgroundColor` 포함
- [ ] `src/components/notes/note-wine-header-link.tsx`
  - 현상: `flexDirection` 포함
- [ ] `src/components/capture/secondary-icon-button.tsx`
  - 현상: `padding`, `borderRadius`, `transform` 포함
- [ ] `src/components/cellar/add-cta.tsx`
  - 현상: `flexDirection` 포함
- [ ] `src/components/cellar/drink-this-cta.tsx`
  - 현상: `width`, `height`, `borderRadius`, `backgroundColor`, `flexDirection` 포함
- [ ] `src/components/cellar/no-results.tsx`
  - 현상: `padding`, `borderRadius`, `borderWidth`, `borderColor` 포함
- [ ] `src/components/cellar/cellar-card.tsx`
  - 현상: layout prop 포함 확인 후 패턴 적용
- [ ] `src/components/onboarding/mode-choice-card.tsx`
  - 현상: `padding` 포함
- [ ] `src/components/onboarding/experience-choice-card.tsx`
  - 현상: `padding`, `transform` 포함
- [ ] `src/components/onboarding/language-choice-card.tsx`
  - 현상: `borderColor`, `transform` 포함

완료 기준: 위 14개 파일 수정 후 `npx tsc --noEmit` 통과.

---

## Task 4 — 최종 검증

### 4-1. audit 스크립트 실행

```bash
bash scripts/audit-pressable.sh
```

`DANGEROUS` 항목이 0건이어야 한다. 남아있으면 Task 3으로 돌아가 처리.

### 4-2. MEDIUM 목록 시각 확인 (수정 불필요, 확인만)

아래 파일들은 transform + layout 혼재 패턴이지만 현재 시각 이상 없는 것으로 파악됨.
건드릴 일이 생기면 그때 3-layer 패턴으로 전환한다.

- `src/components/home/recent-notes-strip.tsx` (width/flexShrink in style fn — 현재 작동 중)
- `src/components/wine/community-drink-window-card.tsx`
- `src/components/wine/write-note-cta.tsx`
- `src/components/wine/price-chart-stub.tsx`
- `src/components/wine/review-list.tsx`

### 4-3. 커밋

```bash
git add scripts/audit-pressable.sh CLAUDE.md src/components/
git commit -m "fix(ui): Pressable 3-layer 패턴 전수 적용 + audit 스크립트 + 스택 정책 추가"
```

---

## 컨텍스트 (읽기용, 실행 불필요)

### 왜 이 작업이 필요한가

이 stack(`React 19 + RN 0.81 + Reanimated 4 + worklets 0.5 + NativeWind 4.1 + jsxImportSource:'nativewind' + newArchEnabled:true`)에서 Pressable의 style 함수 안에 layout prop을 넣으면 cssInterop + Fabric 충돌로 해당 prop들이 무시된다. 24시간 디버깅 끝에 발견한 스택 레벨 버그.

### 이미 처리된 파일 (건드릴 필요 없음)

`_workspace/handoff/2026-05-21-css-rn-pressable-pattern.md` §4 "작동 확인된 화면" 참조.
Round 8/10 패턴이 이미 적용된 14개 컴포넌트는 재작성 불필요.

### worklets에 대해

`react-native-worklets@0.5.1`은 앱 코드에서 직접 사용하는 곳이 **0건** (Reanimated 4 내부 의존성만). 1.0 GA 전까지 앱 코드에서 직접 worklets API를 추가하지 않는다.
