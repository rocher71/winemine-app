# QA Follow-up — WineFeed horizontal 통합 정합성 게이트

- 시각: 2026-05-21 12:16:09
- 대상 (미커밋):
  - src/components/home/wine-feed.tsx (재작성)
  - src/lib/i18n/{ko,en}.json (home.wineFeed.openDetail 신규 키)
- SCOPE-OUT: BottomNav 구현 자체 · WineFeed 데이터 소스 (mock) · AppHeader · light gold score 대비
- 결과: **PASS — 0 FAIL · 0 WARN-blocking · 1 WARN-trivial(doc drift)**

---

## 체크리스트

| # | 항목 | 결과 | 근거 |
|---|---|---|---|
| 1 | WineFeed → /wine/[lwin] navigation 정상 (Stack route) | PASS | 1, 2 |
| 2 | wines_localized VIEW shape — WineFeedRow 한글명 우선 일관 | PASS (scope-limited) | 3 |
| 3 | ko/en 신규 1 키 양쪽 채움 + 영문 모드 한글 노출 X | PASS | 4 |
| 4 | dark/light dual — wine-feed.tsx tokens 양쪽 | PASS | 5 |
| 5 | emoji grep | PASS | 6 |
| 6 | 하드코딩 hex/rgba grep | PASS | 7 |
| 7 | SUPABASE_SERVICE_ROLE_KEY 격리 | PASS | 8 |
| 8 | LWIN 형식 (URL slug) | PASS | 9 |
| 9 | WMBottle size prop (90×150) — 다른 사용처 regression 없음 | PASS | 10 |
| 10 | accessibilityLabel ko/en 분기 동작 | PASS | 11 |

---

## 근거 (file:line + expected vs actual)

### 1. /wine/[lwin] 네비 경로 — PASS
- src/components/home/wine-feed.tsx:200 — `router.push('/wine/${wine.lwin}' as never)`
- app/wine/[lwin].tsx 존재 (43 default export WineDetailScreen)
- app/_layout.tsx:120 — `<Stack.Screen name="wine/[lwin]" />` 등록 → root Stack route. BottomNav 비표시 동작은 bottom-nav HIDE_BOTTOM_NAV_ROUTES와 무관하며 (tabs) 밖이라 자동 숨김 — 사양 일치.
- (tabs)/_layout.tsx에는 wine 등록 없음 → tab 오버플로 없음. F1 5탭(index/map/capture/cellar/community) 영향 0.

### 2. wines_localized VIEW ↔ WineFeedRow 한글 우선 — PASS (scope-limited)
- WineFeedRow는 **mock 데이터**(MOCK_WINES_KO / MOCK_WINES_EN)만 사용. 실 DB 호출 없음 (line 289 `i18n.language === 'en' ? MOCK_WINES_EN : MOCK_WINES_KO`).
- 사양 §12 Q3 deferred 명시 (wine-feed.tsx:15 주석). 한글 우선 정책(VIEW name_ko coalesce 등)은 mock 단계라 DB 경계면 미실행 — v0.2.0에서 useWine + wines_localized로 교체 시 재검증 필요.
- 참고: wines_localized VIEW(20260519000400)는 `display_name, name_ko, type_canonical, bottle_color` 모두 제공. 데이터 교체 시 mock의 `name`/`type` 필드를 `name_ko ?? display_name` / `type_canonical`로 매핑하면 됨.

### 3. i18n 신규 키 양쪽 + 영문 모드 한글 노출 X — PASS
- ko.json:149 `"openDetail": "상세 화면으로"`
- en.json:149 `"openDetail": "Open wine detail"`
- ko/en `home.wineFeed` 키 집합 동일: `{heading, openDetail, subtitle, tabs}` + `tabs = {explore, featured, trending}` 양쪽 동치.
- wine-feed.tsx의 Korean fragment 52건 = 코드 주석 + MOCK_WINES_KO 문자열만. **MOCK_WINES_KO는 `i18n.language === 'en'` 분기에서만 절대 노출되지 않음** (line 289). 영문 모드 한글 노출 0.
- accessibilityLabel(line 191-194)도 `i18n.language === 'en'` 분기로 분리 — 한글 leakage 없음.

### 4. dark/light dual tokens — PASS
- wine-feed.tsx는 다음 토큰만 사용:
  - `brand.gold` (active chip border/text, score), `brand.gold` alpha 0.12 (active chip bg) — 브랜드 고정 (양쪽 모드 공통, 사양 의도).
  - `tokens.border.default` / `tokens.text.muted` — useThemeTokens 분기. dark/light 자동 swap.
  - className: `bg-surface dark:bg-surface`, `border-border-default dark:border-border-default`, `text-text-primary dark:text-text-primary`, `text-text-secondary dark:text-text-secondary`, `text-text-muted dark:text-text-muted` — Tailwind dual class. (dark prefix가 동일 토큰을 재선언하는 패턴은 tailwind.config의 dual-mode toggle을 강제하는 winemine 표준.)
- 하드코딩 hex/rgba: 0건 (grep 결과 7번 참조).

### 5. emoji — PASS
- wine-feed.tsx 정규식 `[\U0001F300-\U0001FAFF\U00002600-\U000027BF️]` 매칭 0건.

### 6. 하드코딩 hex/rgba — PASS
- wine-feed.tsx에서 `#[0-9a-fA-F]{6,8}` 또는 `rgba?\(` 매치 0건. 모든 색은 design-tokens import 경유.

### 7. SUPABASE_SERVICE_ROLE_KEY 격리 — PASS
- src/, app/ 전체 grep — 매치는 src/lib/supabase.ts:9 주석 1건뿐 (금지 명시). wine-feed.tsx import 표면 0. 노출 없음.

### 8. LWIN 형식 — PASS
- MOCK_WINES `lwin` 값: `'1012345'`, `'1012346'`, `'1012347'` — 7자리 숫자, 정규식 `^\d{7}$` 충족. URL slug `/wine/${wine.lwin}`에 그대로 사용해도 wineDetail의 useWine(lwin) zod/검증과 호환.
- WineDetailScreen이 `lwin`을 `string`으로 받아 `useWine(lwin)` 호출 — 형식 검증은 useWine 내부에서 처리. mock이 valid LWIN 패턴을 따르므로 안전.

### 9. WMBottle 90×150 regression — PASS (with trivial doc drift)
- 변경된 사용처: wine-feed.tsx:218 — `width={90} height={150} bottleColor={...} type={...}` (producer/label/vintage 미지정).
- WMBottle prop signature (wm-bottle.tsx:14-25): `width`, `height` 필수 number, 나머지 optional → 호환 OK.
- 다른 사용처 호출:
  - recent-notes-strip.tsx:78 — 26×86 (변경 없음)
  - wine-hero.tsx:111 — 88×290 (변경 없음, producer/label/vintage 지정 → showText=true)
  - cellar-bottom-sheet.tsx:202 — 32×44 (변경 없음)
  - cellar-card.tsx:107 — 40×130 (변경 없음, producer/label/vintage 지정)
- WMBottle 내부 `showText = width >= 60 && (producer || label || vintage)` — wine-feed는 width=90이지만 producer/label/vintage 미지정 → showText=false, 텍스트 미출력 (사양 §3-8-PATCH 의도 일치). wine-hero(88) cellar-card(40)는 영향 없음.
- WARN-trivial: wm-bottle.tsx:6 header doc은 "WineFeedRow: 40×130 (라벨 텍스트 없음)" 라고 적혀 있음. 실제 호출은 90×150 → 주석 stale. **런타임/디자인 영향 0**, 문서 동기화 권장(별도 chore PR로 처리 가능).

### 10. accessibilityLabel ko/en 분기 — PASS
- wine-feed.tsx:191-194 — `i18n.language === 'en' ? '${name}, ${producer}, ${vintage}, rated ${score} out of 5, price ${price}' : '${name} ${producer} ${vintage} 평점 ${score} 가격 ${price}'`
- ko/en 모드에 따라 wines 배열도 i18n.language 분기(line 289) → ko 모드: 한글 와인명, ko a11y / en 모드: 영문 와인명, en a11y. 일관.
- accessibilityHint `t('home.wineFeed.openDetail')` — 신규 key 양쪽 채워짐(체크 3) → ko/en 모두 정상.

---

## 누적 패턴 점검 (이전 _workspace/qa_*.md 대비)

- 이전 QA들에서 반복 적발: hex 하드코딩, ko/en 누락, RLS 우회. 본 WineFeed 변경은 mock 단계라 RLS 미실행, hex/i18n 모두 통과.
- 본 변경 신규 standard 자동 채택 없음 — 기존 표준(`bottleColorDefault[type]` lookup + brand.gold 직접 사용 + tokens border/text muted) 일관 유지.

## 권고 (Non-blocking)

1. (chore) wm-bottle.tsx:6 header doc — "WineFeedRow: 40×130" → "WineFeedRow: 90×150" 동기화. design-spec home.md §3-8-PATCH의 실제 사이즈와 일치시켜 다음 손볼 때 혼란 방지.
2. (v0.2.0 reminder) WineFeedRow를 wines_localized 실 데이터로 전환 시: `name`을 `name_ko ?? display_name`, `type`을 `type_canonical`, `bottleColor`를 `wm.bottle_color ?? bottleColorDefault[type_canonical]`로 매핑. mock의 `MockWine` shape를 `Pick<WineLocalized, 'lwin'|'display_name'|'name_ko'|'producer_name'|'region'|'country'|'type_canonical'|'vintage'>` + score/price(외부)로 교체.

---

**최종 게이트: PASS — 다음 단계 진행 가능.**
