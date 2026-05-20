---
name: design-review-gate
description: "winemine RN+Expo 화면 시각 품질 게이트 검증 절차. 키스크린 원본과 line-by-line 비교 + 멀티모달 스크린샷 비교. 6항목 체크리스트(요소 누락/spacing 비율/gradient 방향·깊이/corner radius/typography 위계/color 사용). PASS 시 qa-inspector로, FAIL 시 rn-screen-builder 반려(loop). 신규 화면 + 기존 retroactive hardening 모두 동일 체크리스트. 디자인 시각 검증, 디자인 리뷰, 키스크린 대비 시각 갭, 디자인 게이트 요청 시 사용."
---

# Design Review Gate — winemine 시각 품질 6항목 게이트

이 스킬은 design-reviewer가 rn-screen-builder 산출물을 검증할 때 따르는 절차다. qa-inspector 단계 이전의 시각 게이트.

## 6항목 체크리스트 (PASS/FAIL 명확히)

### (1) 요소 누락

**점검 방법**: 원본 JSX의 모든 시각 노드 목록 vs RN 구현의 컴포넌트 트리 1:1 매칭.

**자주 누락되는 요소**:
- LinearGradient (단색 fallback)
- shadow / elevation
- divider (border-t, hr)
- Badge / Pill (상단 우측 작은 라벨)
- Icon (좌측 leading icon)
- 보조 캡션 (subtitle 아래 부가 정보)
- skeleton (loading 상태)
- pull-to-refresh

**증거 형식**:
```
원본 ../winemine-keyscreen/src/pages/home.tsx:67 <DrinkWindowBar wine={...}/>
현재 app/(tabs)/index.tsx:42 DrinkWindowBar 미배치
→ FAIL
```

### (2) Spacing 비율

**점검 방법**: 키스크린 원본의 gap/padding/margin 값 → RN 구현의 동일 클래스 비교. 절대값보다 비율이 중요.

**핵심 비율**:
- hero padding / card padding
- section gap / card gap
- list item vertical / horizontal

**증거 형식**:
```
원본 hero `px-8 py-8` (32px)
현재 hero `px-4 py-4` (16px) — 50% 축소
→ FAIL (수정: px-8 py-8 또는 토큰 hero-padding)
```

### (3) Gradient 방향·깊이

**점검 방법**: 키스크린 `linear-gradient(160deg, #1a0a1e 0%, #4a0e1f 100%)` → RN `<LinearGradient colors={...} start={...} end={...}/>` 매개변수 일치 확인.

**확인 항목**:
- 각도 보존 (160deg → start/end 좌표 환산)
- 중간색 stop 위치
- alpha (반투명) 유지
- 단색 fallback 사용 여부 (deviation 명시 없으면 FAIL)

**각도 → start/end 환산표**:
| CSS 각도 | start | end |
|---|---|---|
| 0deg (위→아래) | {x:0.5, y:0} | {x:0.5, y:1} |
| 90deg (왼→오른) | {x:0, y:0.5} | {x:1, y:0.5} |
| 135deg | {x:0, y:0} | {x:1, y:1} |
| 160deg (대략) | {x:0.18, y:0} | {x:0.82, y:1} |
| 180deg (아래→위) | {x:0.5, y:1} | {x:0.5, y:0} |

### (4) Corner radius

**점검 방법**: rounded-* 값 1:1 비교.

**NW v4 토큰**:
- `rounded-sm` 2px / `rounded` 4px / `rounded-md` 6px
- `rounded-lg` 8px / `rounded-xl` 12px / `rounded-2xl` 16px
- `rounded-3xl` 24px / `rounded-full` 9999px

**증거 형식**:
```
원본 WineCard `rounded-2xl` (16px)
현재 WineCard `rounded-lg` (8px) → FAIL
```

### (5) Typography 위계

**점검 방법**: 텍스트 노드별 font-size/line-height/weight/tracking 비교. 위계는 절대값보다 순서·차이가 중요.

**기준 위계 (키스크린 docs/design-system/typography.md)**:
| 레벨 | size/line | weight | tracking |
|---|---|---|---|
| display.lg | 30/36 | 700 | -0.025em |
| display.md | 24/32 | 700 | -0.02em |
| title | 20/28 | 600 | -0.015em |
| body.lg | 18/26 | 400 | 0 |
| body | 15/22 | 400 | 0 |
| caption | 12/16 | 500 | 0.02em |

**증거 형식**:
```
원본 home title `text-3xl font-bold tracking-tight` (30/36, 700, -0.025em)
현재 home title `text-xl font-semibold` (20/28, 600, 0) → FAIL — 위계 2단계 축소
```

### (6) Color 사용

**점검 방법**:
- 모든 배경·텍스트·border 색이 design-tokens.ts·tailwind.config.ts 토큰 사용
- bottle_color (와인 30종), brand-fixed Gold, lwin.ts의 type-default 색은 예외 허용
- 그 외 하드코딩 hex 발견 시 FAIL

**자동 검출**:
```bash
rg -n '#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}' src/components/{compoent_dir} app/{route_file} \
  | rg -v 'lwin.ts|design-tokens.ts|bottle_color'
# 0건이어야 함
```

**증거 형식**:
```
app/(tabs)/index.tsx:55 `style={{backgroundColor: '#7a2348'}}` — 하드코딩 hex
→ FAIL (수정: design-tokens.ts.wine.burgundy 추가 후 className="bg-wine-burgundy")
```

## 멀티모달 스크린샷 비교

`_workspace/keyscreen-shots/{route}.png` 존재 시 (P2 세션이 채움):

1. Read 도구로 키스크린 이미지 로드 (multimodal)
2. 시뮬레이터에서 현재 구현 캡처 — 또는 사용자에게 expo dev에서 캡처 요청
3. 두 이미지를 시각적으로 비교:
   - 전체 레이아웃 흐름 일치
   - 색 분포 (영역별 주조색)
   - 정보 밀도 (텍스트 크기 비율)
   - 시각 무게 균형
4. 차이를 정성적으로 기록 — "hero 깊이 부족", "카드 평면적"

**스크린샷 부재 시**: JSX·CSS만으로 검증. 보고서에 "스크린샷 없음 — P2 세션 완료 후 재검증 권장" 명시.

## 다크/라이트 양쪽 모드 검증

(CLAUDE.md §4-9 강제)

1. 시뮬레이터 dark / light 모두 캡처 (사용자 요청 또는 settings/appearance 토글)
2. 각 모드별:
   - 텍스트 가독성 (WCAG AA 4.5:1 통과)
   - 배경 / 텍스트 / border 색 모두 토큰 사용
   - 깨진 컴포넌트 없음 (텍스트 잘림, 색 fallback 실패)
3. 한쪽만 보고 PASS 금지

## 검증 절차 (화면별)

1. 검증 요청 SendMessage 수신 ("화면 X 완성, 디자인 리뷰 요청")
2. 사양 읽기: `_workspace/design-specs/{route}.md`
3. 원본 JSX 읽기: `../winemine-keyscreen/src/{path}.tsx` (+ 자식 컴포넌트 재귀)
4. RN 구현 읽기: `app/{route}.tsx`, 관련 `src/components/**`
5. 스크린샷 비교 (있을 때)
6. 6항목 체크 — 각 항목 PASS/FAIL + 증거
7. 보고서 작성: `_workspace/design-review_{route}_{YYYYMMDD_HHMMSS}.md`
8. 결과 라우팅:
   - **PASS** → rn-screen-builder + qa-inspector + 리더에 통과 알림 → qa-inspector 진행
   - **FAIL** → rn-screen-builder에 구체적 지적 SendMessage + (사양 갭이면) design-spec-author에 별도 SendMessage
   - 토큰 확장 필요 → 리더에 P0 세션 알림 + 보고서에 누적

## 보고서 템플릿

```markdown
# 디자인 리뷰 — {route}

## 대상
- 사양: _workspace/design-specs/{route}.md
- 원본: ../winemine-keyscreen/src/{path}.tsx
- 자식 컴포넌트: ...
- 구현: app/{route}.tsx, src/components/{...}.tsx
- 스크린샷: _workspace/keyscreen-shots/{route}.png (있음/없음)

## 6항목 체크리스트

### (1) 요소 누락 — [PASS/FAIL]
- 발견: ...

### (2) Spacing 비율 — [PASS/FAIL]
- 발견: ...

### (3) Gradient 방향·깊이 — [PASS/FAIL]
- 발견: ...

### (4) Corner radius — [PASS/FAIL]
- 발견: ...

### (5) Typography 위계 — [PASS/FAIL]
- 발견: ...

### (6) Color 사용 — [PASS/FAIL]
- 발견: ...

## 다크/라이트 양쪽 모드
- [ ] dark 모드 PASS
- [ ] light 모드 PASS
- 발견: ...

## 멀티모달 스크린샷 비교
- (있을 때) 시각 차이: ...
- (없을 때) P2 완료 후 재검증 권장

## 결정
- 결과: PASS / FAIL ({n}/6 통과)
- 라우팅:
  - rn-screen-builder: 위 항목 수정
  - design-spec-author: (해당 시) 사양 보강
  - infra-architect: (해당 시) design-tokens.ts P0 항목 추가

## 토큰 확장 요청 (P0 세션 누적)
- spacing: ...
- shadow: ...
- color: ...
- gradient: ...
```

## retroactive 적용 (기존 11 화면)

현재 Day 5까지 구현된 화면에 대해 retroactive 리뷰 시:

1. 화면별 사양이 없으면 design-spec-author에 사양 작성 우선 요청
2. 사양 + 기존 구현 + 원본 키스크린 3-way 비교
3. FAIL 항목 누적 보고서: `_workspace/design-review-retroactive_{YYYYMMDD}.md`
4. 우선순위 매김 (시각 차이 큰 순) — 한 번에 1개 화면 수정 권장
5. P0 세션 (토큰 확장) 완료 대기 후 rn-screen-builder 작업 시작 — 토큰 없으면 또 하드코딩으로 도망

## 절대 금지

- `../winemine-keyscreen/` 어떤 파일도 수정 (§4-3)
- `specs/` 수정 (§4-2)
- 보고서에 emoji (§4-1)
- 디자인 코드 직접 수정 — rn-screen-builder 거치기
- 추상적 피드백 ("디자인 어색") — 항상 파일:라인 + 원본·현재 비교 + 수정안
- 한쪽 모드만 보고 PASS (§4-9)
- 하드코딩 hex 검출 누락 — design-tokens.ts·tailwind.config.ts·lwin.ts·bottle_color 외 발견 시 반드시 FAIL
- 사용자 UUID UI 노출 검증 누락 (§4-5)

## 통과 기준

- 6/6 PASS + 다크/라이트 양쪽 PASS + (있을 때) 스크린샷 비교 일치 → 전체 PASS
- 5/6 이하 → FAIL, rn-screen-builder 수정 후 재검증 (loop)
- 같은 화면 3회 FAIL → 리더에 escalate

## 자세한 reference

- 사양: `_workspace/design-specs/{route}.md`
- 원본: `../winemine-keyscreen/src/` (read-only)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/*` (read-only)
- 토큰 확장 가이드: `docs/NEXT_TO_RN_TRANSLATION.md` (P0 세션 산출물)
- 테마 검증 규칙: `docs/THEME_VERIFICATION.md`
