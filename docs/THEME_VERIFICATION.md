# 테마(다크/라이트) 변경 시 양쪽 모드 검증 규칙

[CLAUDE.md §4-9](../CLAUDE.md) 절대 금지 규칙의 상세 가이드.

색·간격·컴포넌트 스타일 변경 시 **한쪽 모드만 보고 끝내지 말 것**. 반드시 양쪽 모드 모두 검증.

---

## 5가지 핵심 규칙

1. **변경하려는 모드 토큰만 수정** — 다른 모드 토큰 실수로 건드리지 않기
2. **하드코딩 hex 금지** — 항상 토큰 변수 (`colors.wineRed.dark` / `colors.wineRed.light` 또는 테마 hook) 사용
3. **양쪽 모드 토글 후 시각 확인** — Expo dev에서 settings 토글로 둘 다 확인
4. **컴포넌트 추가 시 양쪽 모드 모두 의도대로 보이는가 확인** — 대비, 가독성, 강조
5. **각 토큰은 dual definition 필수** — `{ dark, light }` 양쪽 채움. 한쪽만 정의된 토큰 금지

---

## 점검 명령

### 하드코딩 hex 색 검출

토큰을 거치지 않은 직접 색 사용 검사:

```bash
grep -rnE "#[0-9a-fA-F]{3,6}" --include='*.tsx' --include='*.ts' src/ app/ \
  | grep -v "tokens\|theme\|// " | head
```

→ hex 결과가 나오면 거의 다 토큰화 대상. 예외(주석·design-tokens 정의)는 grep -v 추가.

### 한쪽 모드만 정의된 토큰 찾기

```bash
# tokens 정의 파일에서 dark/light 양쪽 정의되었는지 단순 grep
grep -A2 "wine" src/theme/tokens.ts | grep -E "dark|light"
```

자동 lint 룰 추가 가능 (eslint custom rule 또는 ts-prune).

---

## PR review 시 체크리스트

- [ ] 변경된 컴포넌트의 **양쪽 모드 스크린샷** 첨부
- [ ] hex 하드코딩 0건 (`grep` 통과)
- [ ] 새 토큰 정의 시 `{ dark, light }` 양쪽 채움
- [ ] 대비(contrast) WCAG AA 이상 (다크·라이트 모두)
- [ ] 컴포넌트가 토큰 hook 사용 (`useTheme()` 또는 `useColorScheme()`)

---

## 학습 배경

Phase 2 키스크린에서 **다크 기준으로만 작업하다 라이트모드 지도 색상 가독성 깨진 사고** 발생:
- commit `2fc3ac6 fix(i18n): 영어 모드 한글 누출 60+곳 수정 + 라이트모드 지도 색상 통일`
- 다크 기준 토큰만 설계 → 라이트 도입 시 지도 fill·stroke·텍스트 대비 깨짐
- 사후 수정 비용 큼 (UI 컴포넌트 다수 재검증)

**이 규칙의 동기**: 토큰 dual definition + 양쪽 검증 디스시플린으로 사고 재발 방지.

---

## 권장 코드 패턴

### Bad

```typescript
// 하드코딩 hex — 다크 기준만 짜고 라이트는 깨짐
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#3D2A4A',  // ✗ 다크 전용 색
    borderColor: '#5A3D6A',      // ✗ 다크 전용
  },
});
```

### Good

```typescript
import { useTheme } from '@/theme';

function Card() {
  const { colors } = useTheme();
  return (
    <View style={{
      backgroundColor: colors.surface,    // ✓ 토큰 — dark/light 자동 분기
      borderColor: colors.borderDefault,  // ✓ 토큰
    }} />
  );
}
```

토큰 정의:
```typescript
// src/theme/tokens.ts
export const tokens = {
  surface: { dark: '#3D2A4A', light: '#FFFFFF' },           // ✓ dual
  borderDefault: { dark: '#5A3D6A', light: '#E0D2BC' },     // ✓ dual
};
```

---

## 관련 참조

- `specs/domain/design-tokens/` — 토큰 정의 (md + tokens.json + tokens.css)
- `../winemine-keyscreen/docs/design-system/colors.md` — Phase 2 색 팔레트 (다크/라이트 dual 정의 reference)
- [CLAUDE.md §4-9](../CLAUDE.md) — 본 규칙의 상위 정의
