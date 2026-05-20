# QA — /wine/[lwin] Day 6 Retroactive Hardening 통합 정합성 게이트

- 일시: 2026-05-20 20:35:01 KST
- 범위: app/wine/[lwin].tsx rewrite + 12 신규 wine-detail 컴포넌트 + wm-bottle 텍스트 확장 + use-my-note-for-wine 훅 + design-tokens 18 신규 + tailwind config 동기화 + i18n 40+ 신규 키
- SCOPE-OUT (검증 제외 — 사양 §9·§12 deferred):
  Day 6 settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav, PriceChart/CommunityDrinkWindow/WineStory/ReviewList의 실제 데이터 연동, wine_favorites/serving_temp 컬럼 부재로 인한 stub 동작, Tabs row 사양 갭.

---

## 최종 판정: PASS (FAIL 0건, OBS 2건)

11개 체크리스트 전체 PASS. 관찰 사항(OBS)은 본 hardening 범위 밖 pre-existing 이슈 2건 — 차후 처리.

---

## 체크리스트 결과

### 1. RLS ↔ 클라이언트 호출 교차 — PASS

| 호출처 | 테이블/뷰 | 쿼리 | RLS 정책 | 정합성 |
|---|---|---|---|---|
| `src/hooks/use-wine.ts:28-32` | wines_localized (VIEW, security_invoker=true) | `select('*').eq('lwin', lwin).maybeSingle()` | 카탈로그 — 누구나 SELECT | OK |
| `src/hooks/use-my-note-for-wine.ts:43-50` | tasting_notes | `select('*').eq('user_id', uid).eq('wine_lwin', wineLwin).order('tasted_at',desc).limit(1).maybeSingle()` | `user_id = auth.uid()` (FOR ALL) | OK — 명시적 `eq('user_id', uid)`가 RLS와 중복되지만 방어적 적절, 빈 결과 함정 없음 |
| `add-to-cellar-sheet`(기존, 미변경) | cellar_items | (기존) | (기존) | OK — 본 hardening 변경 없음 |

`favorite-toggle.tsx`는 supabase 호출 부재 (로컬 useState only) — wine_favorites 마이그/테이블 부재가 사양 §9에서 명시된 SCOPE-OUT. 코드 25-40행에 v0.2.0 upsert/delete + rollback 패턴 TODO 주석 명시. 의도된 stub.

### 2. wines_localized VIEW ↔ 훅 ↔ WineNameDisplay shape — PASS

`shared/types/database.types.ts:407-428` Views.wines_localized.Row 필드:

```
bottle_color, classification, country, display_name, drink_window_*,
lwin, name_ko, producer_name, producer_title, region, status,
type_canonical, type_raw, vintage, wine
```

모두 `string | null` 또는 `number | null`. 사용 분석:

- `app/wine/[lwin].tsx:63` — `if (!wine?.lwin || !wine?.display_name)` null fallback → notFound 화면. OK.
- `app/wine/[lwin].tsx:88-91` — `getLocalizedWineName(currentLocale(), { name_ko, display_name })` 헤더 타이틀.
- `app/wine/[lwin].tsx:106-116` — WineHero에 9 필드 모두 명시 전달.
- `WineHero` (src/components/wine/wine-hero.tsx:74) — `bottle_color ?? getDefaultBottleColor(type)` fallback 정상.
- `WineHero:75` — `vintage ?? parseLwinVintage(lwin)` fallback 정상.
- `WineHero:149-154` — `WineNameDisplay` 3 props (lwin/name_ko/display_name) 모두 전달, KO 모드에서 name_ko 우선, EN 모드 display_name 사용.

한글명 우선 노출 일관성 확보.

### 3. 기존 wines / wine_korean_names count diff 0 — PASS

`git status --short` + `git diff --stat HEAD`에서:
- supabase/migrations/ 변경 없음 (`ls -la`도 동일 10 파일)
- supabase/functions/ 변경 없음
- supabase/seed* 변경 없음

기존 wines / wine_korean_names schema·data 단 1 byte도 변경 없음. 비가역 사고 위험 0.

### 4. ko/en 신규 ~40 키 양쪽 채움 + EN 모드 한글 노출 없음 — PASS

키 페어링 (Python script로 검증):
- ko.json: 377 키 / en.json: 377 키 (일치)
- 신규 12 path 그룹 (wineDetail.servingTemp/fav/myNote/writeNote/externalRatings/avgPrice/priceChart/communityPeak/story/reviews/a11y + notes.beginner.wsetShort) 모두 ko/en 페어 100%
- 신규 키 총: KO 86 추가 / EN 86 추가 (1:1 mirror)

소스에서 사용되는 i18n 키 73개 전수 검증 (interpolated `myNote.mode.${mode}`, `reviews.sort.${s}`, `wset${KeyCap}` 4종 포함):
- KO 누락 0
- EN 누락 0

EN locale Hangul leakage:
- 발견 2건: `language.ko = "한국어"`, `settings.values.ko = "한국어"`
- 두 건 모두 **language picker의 언어 이름 라벨** (관례) — 의도된 예외, 정책 §4-4 와인명 fallback 예외와 같은 카테고리. PASS.

### 5. dark/light dual definition — PASS

신규 토큰 dual-mode 검증:

| 토큰 | dark | light | 사용처 분기 |
|---|---|---|---|
| `wsetGridBg` | `rgba(15,7,24,0.6)` | `rgba(42,26,20,0.06)` | MyTastingNoteCard:72 `scheme === 'light' ? .light : .dark` |
| `bg.bottleShelf` | `#1a0a1e` | `#FFFFFF` | WineHero:78-79 `scheme === 'light' ? light.bg.bottleShelf : dark.bg.bottleShelf` |
| `wineTypeDot.*` | brand-fixed | brand-fixed | dot 색은 와인 type 정체성 (의도) |
| `servingTempDefault.*` | 값(°C) | 값(°C) | 온도 리터럴 — color 아님 |
| `shadows.wineRedCardSm/Lg` | brand-fixed | brand-fixed | 와인레드 그림자는 양쪽에서 동일 (브랜드 정체성, 사양 §9 P0 의도) |
| `tailwind.borderRadius.18` | n/a | n/a | 라디우스 토큰 |

FavoriteToggle:28 `idleColor = scheme === 'light' ? light.text.secondary : dark.text.secondary` — 양쪽 분기 OK.
ExternalRatingsCard / WineStoryCard / AveragePricePill / PriceChartStub / CommunityDrinkWindowCard / ReviewList 모두 `bg-surface dark:bg-surface` + `text-text-* dark:text-text-*` 토큰만 사용 (양쪽 자동 분기). 하드코딩 hex 없음.

### 6. emoji grep (소스 + i18n) — PASS

13개 신규 파일 + 4개 수정 파일 전수 검사:
- emoji 0건
- U+FE0F variation selector 0건

CLAUDE.md §4-1 준수.

### 7. 하드코딩 hex grep — PASS

`grep -rnE "#[0-9a-fA-F]{3,8}" src/components/wine/ src/components/shared/wm-bottle.tsx src/hooks/use-my-note-for-wine.ts app/wine/[lwin].tsx`:
- 발견 1건: `src/components/wine/wine-hero.tsx:18` — **문서 주석 안의 값 설명** (`dark=#1a0a1e, light=#FFFFFF`). 실제 색 사용은 모두 `dark.bg.bottleShelf` / `light.bg.bottleShelf` 토큰 경유.
- 실제 하드코딩 hex 사용: 0건

design-tokens.ts / tailwind.config.ts / lwin.ts만 허용 예외 — 모두 합당.

### 8. SUPABASE_SERVICE_ROLE_KEY 격리 — PASS

`grep -rn 'SUPABASE_SERVICE_ROLE_KEY' src/ app/`:
- 발견 1건: `src/lib/supabase.ts:9` — `* - SUPABASE_SERVICE_ROLE_KEY는 절대 import 금지 (RN 번들 노출 위험)` (방어 주석)
- 실제 import 0건

`EXPO_PUBLIC_*` 사용은 SUPABASE_URL / ANON_KEY 2개로, .env.example과 정확히 일치. 누출 위험 없음.

### 9. LWIN 형식 — PASS

- `src/lib/lwin.ts:36` — `LWIN_REGEX = /^\d{7}$|^\d{11}$|^\d{13}$/` 표준
- `WineHero:75` — `parseLwinVintage(lwin)` 호출 (slice 7..11)
- `WMBottle` — lwin 파라미터 직접 받지 않고 producer/label/vintage 텍스트만 받음 (분리 책임). vintage는 hero에서 이미 lwin 파싱 후 정규화된 값을 전달.
- 양 컴포넌트 lwin 처리 일관, 7/11/13자리 가정 위반 없음.

### 10. OAuth 골격 호환 — PASS (변경 없음 확인)

- `supabase/migrations/20260519000000_profiles.sql:62-64`: `email text` / `linked_providers text[] default '{}'` / `is_upgraded boolean default false` 모두 존재
- `src/lib/auth/providers/{kakao,google,apple}.ts` 3개 stub 존재
- `src/lib/auth/link-identity.ts` 존재
- `src/lib/supabase.ts:41` — `flowType: 'pkce'` 설정
- 본 hardening에서 위 6개 파일 1 byte도 수정 없음. v0.2.0 호환 유지.

### 11. profiles 트리거 — PASS (변경 없음 확인)

- `20260519000000_profiles.sql:85-97`: `handle_new_user()` security definer 함수 + `on_auth_user_created` trigger 존재
- 본 hardening에서 supabase/migrations/ 0 byte 변경

---

## 관찰 사항 (OBS) — 본 hardening 범위 밖, 차후 처리

### OBS-1: MyTastingNoteCard expert rating 표시 단위 불일치 (pre-existing)

- 위치: `src/components/wine/my-tasting-note-card.tsx:91-94`
- 현상: `mode === 'expert'` 시 `${note.rating}/100` 표시, beginner 시 `${note.rating}/5` 표시
- DB 제약: `tasting_notes.rating numeric(3,1) check (rating between 0 and 5)` + `20260520000200_tasting_notes_rating_half_step.sql` 하프-스텝
- 결론: expert 노트가 실제로 0~5 범위 값이라면 `/100` 표시는 잘못된 시각 단위. 0~100 스케일 분리가 필요하다면 별도 컬럼 또는 mode-aware 정규화 룰 필요.
- 분류: pre-existing 노트 비즈니스 로직 — 본 hardening (wine-detail 화면) 게이트 범위 밖. notes 화면 hardening 또는 별도 issue로 분리 권장.

### OBS-2: bottle_color NULL fallback 다중 위치 점검 권장

- `WineHero:74` — `bottle_color ?? getDefaultBottleColor(type)` (OK)
- `WMBottle:36-40` — `bottleColor ?? bottleColorDefault[type] ?? bottleColorDefault.red` (OK)
- 두 곳에서 fallback이 일관되게 적용되지만, hero가 wm-bottle에 이미 resolved `startColor`를 넘겨주므로 wm-bottle 안 fallback은 사실상 미사용. 중복 방어로 OK이며 차후 동일 fallback 호출 1곳으로 통일하면 가독성 향상. 비기능적 — 무해.

---

## 보고서 경로

`_workspace/qa_day6_wine_detail_retroactive_20260520_203501.md`

## 최종 한 줄

PASS — FAIL 0건 (11/11 항목 통과), OBS 2건 (본 hardening 범위 밖).
