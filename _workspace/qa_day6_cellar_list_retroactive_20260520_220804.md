# QA — Day 6 /cellar (list) retroactive hardening

- 일시: 2026-05-20 22:08:04 KST
- 검증자: qa-inspector
- 검증 대상: `app/(tabs)/cellar/index.tsx` 재작성 + 9개 컴포넌트 신규/수정 + drink-window.ts 신규 + design-tokens cellar 그룹 + tailwind extend + i18n ~30 키 추가
- 검증 의뢰: rn-screen-builder (Day 6 cellar list 2차 review FAIL 해소 후)
- 산출물: `_workspace/qa_day6_cellar_list_retroactive_20260520_220804.md`

## 0. 범위

### IN SCOPE (검증 대상)

| 파일 | 변경 종류 |
|---|---|
| `app/(tabs)/cellar/index.tsx` | 재작성 (TabSegment + TitleBar + 검색·필터·정렬·결과수 + 2-col grid + cellar empty/no-results 분기 + tasted placeholder) |
| `src/components/cellar/cellar-card.tsx` | 2-col grid 카드 (BottleZone LinearGradient + Meta TypeDot + name/producer/vintage + DrinkWindowBadge) — swipe 제거 |
| `src/components/cellar/cellar-tabs.tsx` | inline TabSegment (cellar / tasted + count badge) |
| `src/components/cellar/drink-window-badge.tsx` | 신규 5-status pill |
| `src/components/cellar/cellar-search-input.tsx` | 신규 (Search + ClearBtn) |
| `src/components/cellar/type-filter-chips.tsx` | 신규 (6 chip + TypeDot + all gradient) |
| `src/components/cellar/sort-chips.tsx` | 신규 (6 sort key chip) |
| `src/components/cellar/add-cta.tsx` | 신규 (+ 등록 버튼) |
| `src/components/cellar/no-results.tsx` | 신규 (dashed border 카드) |
| `src/components/cellar/result-count.tsx` | 신규 (총 N병 / N병 중 M개 + ClearFilters) |
| `src/components/cellar/search-sort-bar.tsx` | 제거 |
| `src/components/shared/empty-state.tsx` | `illustration` prop 추가 |
| `src/lib/drink-window.ts` | 신규 (DrinkWindow + getDrinkWindow + getDrinkWindowStatus) |
| `src/hooks/use-cellar.ts` | sort key 확장(recent/drinkSoon/vintage/region/storage/price) + select 필드 확장(region/drink_window_*) |
| `src/lib/design-tokens.ts` | cellar 그룹 + cellarCardBottleGradient factory + typeFilterDot/typeFilterAllGradient + typography 5 신규 |
| `tailwind.config.ts` | borderRadius `'7'` + fontSize `tab-segment-label`/`tab-count`/`chip-label`/`cellar-card-name`/`drink-window-badge` |
| `src/lib/i18n/{ko,en}.json` | cellar.* ~30 키 추가 |

### SCOPE-OUT (이번 검증 미포함)

- Day 6 settings 3 sub + settings hub
- `(tabs)/settings/_layout` + BottomNav
- tasted 탭 placeholder만 — 실 데이터 검증 X
- AddCta mock toast — BottomSheet add-cellar form은 v0.2.0
- swipe action 제거 (사양 §5, §12-3 — 2-col grid에 부자연)

---

## 1. 검증 결과 요약

| # | 항목 | 결과 | 비고 |
|---|---|---|---|
| 1 | RLS ↔ 클라이언트 호출 정합성 | PASS | use-cellar `eq('user_id', uid)` + `cellar_items_all_own` (user_id=auth.uid()) 호환 |
| 2 | `wines_localized` VIEW ↔ CellarCard shape | PASS | select 13 컬럼 모두 VIEW Row에 존재 (lwin/display_name/name_ko/producer_name/country/region/classification/bottle_color/type_canonical/vintage/drink_window_{from,peak,to}_year) |
| 3 | 기존 `wines`/`wine_korean_names` 손상 0 | PASS | 마이그레이션 diff 0줄. 클라이언트 mutation (insert/update/delete) 0건 |
| 4 | ko/en 양쪽 채움 + 영문 모드 한글 노출 0 | PASS | cellar.* 84/84 key parity. en.cellar.* Korean char 0건 |
| 5 | dark/light dual definition | PASS | tooYoungBg/pastPeakBg/clearBtnBg/itemSeparator/cellarCardBottleGradient 모두 dark+light dual. tabCountActive/typeFilterActiveBg/typeFilterDot은 brand alpha 단일 (의도된 설계) |
| 6 | emoji + variation selector 0 | PASS | 변경 파일 전체 0건 |
| 7 | 하드코딩 hex/rgba 0 (변경 파일) | PASS | 코드 line 0건 (result-count.tsx에 주석 2건만 존재 — WCAG 분석 근거) |
| 8 | SUPABASE_SERVICE_ROLE_KEY 격리 | PASS | src/lib/supabase.ts 금지 주석만, import 0건 |
| 9 | LWIN 형식 | PASS | parseLwinVintage 헬퍼 사용, /(tabs)/cellar/${lwin}?id=${item.id} 표준 (encodeURIComponent), lwin null guard |
| 10 | OAuth 골격 호환 | PASS | flowType:'pkce' + profiles.{linked_providers, is_upgraded, email} + 3 provider stub 변경 없음 |
| 11 | profiles 트리거 변경 없음 | PASS | supabase/migrations/ diff 0줄. handle_new_user 변경 없음 |

**FAIL 수: 0**

---

## 2. 항목별 상세

### 2-1. RLS ↔ 클라이언트 호출 — PASS

- 정책: `cellar_items_all_own` for all using (user_id = auth.uid()) with check (user_id = auth.uid()) — `supabase/migrations/20260519000300_cellar_items.sql:27-29`
- 호출:
  - `useCellarList` — `from('cellar_items').select('*, wine:wines_localized!inner(...)').eq('user_id', uid).eq('status', status)` (`src/hooks/use-cellar.ts:117-123`)
  - `useCellarSummary` — `from('cellar_items').select('id', {count:'exact', head:true}).eq('user_id', uid).eq('status', ...)` (`src/hooks/use-cellar.ts:65-74`)
- 명시적 `.eq('user_id', uid)`는 RLS의 자동 필터링과 idempotent — 빈 결과 위험 없음.
- `wines_localized` VIEW는 `security_invoker=true` (마이그 line 7) — caller의 RLS 상속. 익명 사용자도 wines 공개 카탈로그 SELECT 가능.

### 2-2. `wines_localized` VIEW ↔ CellarCard shape — PASS

`use-cellar.ts:118-120` select 컬럼 ↔ `database.types.ts:408-428` `wines_localized.Row`:

| select 컬럼 | VIEW Row 정의 | use 위치 |
|---|---|---|
| lwin | string \| null | CellarCard navigation slug + parseLwinVintage |
| display_name | string \| null | name_ko fallback |
| name_ko | string \| null | wine name 우선 표시 |
| producer_name | string \| null | producer line |
| country | string \| null | applySearch |
| region | string \| null | applySearch + sort.region |
| classification | string \| null | (useCellarItem만 select) |
| bottle_color | string \| null | WMBottle + bottleZoneGradient |
| type_canonical | string \| null | TypeDot + drinkWindow + applyTypeFilter |
| vintage | number \| null | parseLwinVintage fallback + applySort vintage |
| drink_window_from_year | number \| null | drinkSoon sort score |
| drink_window_peak_year | number \| null | DrinkWindowBadge |
| drink_window_to_year | number \| null | DrinkWindowBadge |

null 처리:
- CellarCard line 50: `if (!wine?.lwin || !wine?.display_name) return null` — 안전
- CellarCard line 53: `wine.bottle_color ?? getDefaultBottleColor(typeCanon)` — bottle_color null fallback
- CellarCard line 54: `wine.vintage ?? parseLwinVintage(wine.lwin)` — vintage null fallback
- DrinkWindowBadge: `status` null 시 미렌더 (line 161-165)
- drink-window.ts:48-57: DB `drink_window_*` 모두 채워졌을 때 우선, 아니면 vintage + type 기반 추정. vintage null → null 반환.

### 2-3. 기존 `wines` / `wine_korean_names` 손상 0 — PASS

- `git diff HEAD -- supabase/migrations/` → 0줄
- 클라이언트 mutation grep:
  ```
  grep -RnE "from\(['\"](wines|wine_korean_names)['\"]\)\.(insert|update|delete|upsert)" src/ app/ → 0건
  ```
- VIEW 자체는 read-only이며 마이그 변경 없음. wine_metadata `bottle_color`/`drink_window_*` 컬럼은 v0.1.0 이전부터 존재 (use-cellar는 그저 select만 추가).

### 2-4. ko/en 양쪽 채움 + 영문 한글 노출 0 — PASS

스크립트:
```js
flat(ko.cellar) = 84 keys
flat(en.cellar) = 84 keys
ko - en = []
en - ko = []
en.cellar.* with Korean chars = 0
```

사용된 모든 키 (코드 + 템플릿 리터럴 동적):
- 정적: `cellar.{title,addCta,addToast,clearSearch,clearFilters,searchPlaceholder,tabs.{cellar,tasted},resultCount.{total,filtered},noResults.{title,body},drinkWindow.{now,fromYear,peak,pastPeak,tooYoung,mature},empty.{title,sub,cta},tasted.comingSoon}`
- 동적: ``cellar.filterType.${tf}``, ``cellar.sort.${k}`` — 모두 정의됨

의도된 한글 노출:
- ko.json `cellar.filterType.rose` = "로제", en = "Rosé" — 영문 모드 한글 노출 X (Rosé는 라틴 확장)
- ko.json `cellar.drinkWindow.now` = "지금 마시기 좋아요" — 영문에서는 "Drink now"
- 영문 모드 한글 노출 검사 통과.

### 2-5. dark/light dual definition — PASS

`src/lib/design-tokens.ts` cellar 그룹 (208-231):

| 토큰 | dark | light | 비고 |
|---|---|---|---|
| `cellar.tooYoungBg` | rgba(155,139,122,.18) | rgba(139,119,102,.18) | dark = #9B8B7A alpha, light = text.muted alpha (사양 §12-8) |
| `cellar.pastPeakBg` | rgba(45,21,64,.60) | rgba(139,119,102,.22) | dark = dark.bg.deep alpha, light = text.muted alpha |
| `cellar.clearBtnBg` | rgba(245,240,232,.08) | rgba(42,26,20,.08) | dark = brand.cream alpha, light = text.primary alpha |
| `cellar.itemSeparator` | rgba(0,0,0,.08) | rgba(42,26,20,.06) | light = bg.sunken 동일 |
| `cellar.tabCountActive` | (단일) rgba(245,240,232,.70) | — | brand.cream alpha — 양쪽 active bg(wineRed)에 동일하게 적용. 의도된 단일. |
| `cellar.typeFilterActiveBg` | (단일) rgba(201,168,76,.12) | — | brand.gold alpha — 양쪽 동일. 의도된 단일. |
| `cellarCardBottleGradient(color, scheme)` | end = dark.bg.bottleShelf (#1a0a1e) | end = light.bg.bottleShelf (#FFFFFF) | factory 함수로 dual 분기 |
| `typeFilterDot` | (테마 무관 6색) | — | 사양 §3-5 verbatim. wine type 색은 테마 분기 없음 (active opacity로 dual 표현) |
| `typeFilterAllGradient` | (테마 무관 3-stop) | — | brand.wineRed + brand.gold + brand.cream — brand-fixed |

**중요**: 검증 요청서 "typeFilterDot 3색"은 사양 §3-5와 다름. 실제 정의는 6색 (TYPE_FILTERS 5종 + dessert)이며 컴포넌트 사용처와 일치 — 사양 verbatim 통과.

`result-count.tsx:27-29`에서 light 모드 gold contrast WCAG 미달 처리:
```
const goldText = scheme === 'light' ? brand.goldDeep : brand.gold;
```
사양 §12-7 (light gold/cream 2.8:1 → goldDeep/cream 5.0:1+) 준수.

`drink-window-badge.tsx:51,58`에서 `cellar.tooYoungBg[scheme]`/`cellar.pastPeakBg[scheme]` 사용 — dual 분기 정상.
`cellar-search-input.tsx:54` `cellar.clearBtnBg[scheme]` 사용 — dual 분기 정상.

### 2-6. emoji + variation selector 0 — PASS

```
grep -RnP "[\x{1F000}-\x{1FFFF}\x{2600}-\x{27BF}\x{FE0F}]" <files> → 0건
```

### 2-7. 하드코딩 hex/rgba 0 — PASS

변경 파일 grep 결과:
- 코드 라인 hex/rgba: 0건
- `src/components/cellar/result-count.tsx:27-28` — 주석에 `#C9A84C`/`#FAF5EC`/`#A07F2E` (WCAG 분석 근거) — 코드 아님, 통과

모든 색은 `brand.*` / `cellar.*` / `useThemeTokens()` / `wineTypeDot` / `typeFilterDot` 토큰 경유.

### 2-8. SUPABASE_SERVICE_ROLE_KEY 격리 — PASS

```
grep -RnE "SUPABASE_SERVICE_ROLE_KEY" src/ app/ → 1건 (주석 문자열, 금지 안내)
```

`src/lib/supabase.ts:9` — "SUPABASE_SERVICE_ROLE_KEY는 절대 import 금지" 주석. 실제 import/사용 0건. CLAUDE.md §4-7 준수.

### 2-9. LWIN 형식 — PASS

- `src/lib/lwin.ts:36-39` LWIN_REGEX `/^\d{7}$|^\d{11}$|^\d{13}$/` 정의됨
- `cellar-card.tsx:71` 라우팅: `/(tabs)/cellar/${encodeURIComponent(wine.lwin ?? '')}?id=${encodeURIComponent(item.id)}` (사양 §12-6 표준)
- null guard: `cellar-card.tsx:50` `if (!wine?.lwin || !wine?.display_name) return null`
- vintage 추출: `parseLwinVintage(lwin)` (lwin.length 11 or 13만 substring) — 안전

### 2-10. OAuth 골격 호환 — PASS

- `src/lib/supabase.ts:41` `flowType: 'pkce'` 유지
- `supabase/migrations/20260519000000_profiles.sql:62-64`:
  - `email text`
  - `linked_providers text[] not null default '{}'`
  - `is_upgraded boolean not null default false`
- `src/lib/auth/providers/{kakao,google,apple}.ts` 3 stub 존재
- `src/lib/auth/link-identity.ts` 존재
- 이번 변경에서 OAuth 관련 파일 수정 없음

### 2-11. profiles 트리거 변경 없음 — PASS

- `git diff HEAD -- supabase/migrations/` → 0줄
- `handle_new_user` 함수 변경 없음, profiles RLS 정책 변경 없음

---

## 3. 부차 관찰 (FAIL 아님 — 참고)

1. **검증 요청서의 "typeFilterDot 3색"은 부정확.** 실제 정의는 6색 (red/white/sparkling/rose/fortified/dessert) — 사양 §3-5 verbatim. TYPE_FILTERS UI에서는 'all' + 5종 표시 (dessert 제외, 사양 §12-5). 그러나 토큰 자체는 6색 모두 정의되어 향후 확장 가능.
2. **`cellar-card.tsx:43-46` Props가 `item`만** — 이전 swipe action props 제거됨. design-spec §5 §12-3 준수.
3. **검색 한글/영문 mixed**: `searchPlaceholder` ko = "와인·생산자·지역·품종·빈티지 검색", en = "Wine, producer, region, grape, vintage" — 양쪽 완비.
4. **`useCellarItem`은 이번 변경에 포함되지 않은 cellar 상세화면용** — `classification`까지 select하나 list에서는 미사용. SCOPE-OUT.
5. **`useCellarList` `!inner` join**: wine_lwin이 wines에 없으면 row 제외. cellar_items가 FK constraint `references public.wines(lwin)`이므로 데이터 일관성 보장됨.
6. **tasted 탭**: rawItems는 `cellared`만 fetch — tasted 탭은 EmptyState placeholder만. 사양 §12-1 (v0.2.0) 일치. tasted 탭에서 `consumedCount` 표시는 cellar 탭의 count badge용으로만 사용되며 placeholder 화면 자체는 데이터 없음.
7. **AddCta**: mock toast로 동작. 사양 §12-2 일치.

---

## 4. 최종 판정

**전체 PASS — 11/11 항목 통과. FAIL 0건.**

- 디자인 hardening의 통합 정합성 측면에서 회귀 없음.
- 기존 wines/wine_korean_names 손상 0.
- ko/en + dark/light 양쪽 모드 모두 정의 완비.
- OAuth 골격 v0.2.0 호환성 그대로 유지.
- 다음 단계 진행 가능 — `rn-screen-builder` Day 6 settings 작업 또는 design-reviewer 최종 게이트.
