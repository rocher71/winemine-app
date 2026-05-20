# QA — Day 6 Cellar Detail Retroactive Hardening (Integration Coherence Gate)

- **Module**: `/cellar/[lwin]` retroactive (Day 6)
- **Date**: 2026-05-20 22:55:18 KST
- **Verdict**: **PASS** — 0 FAIL / 0 BLOCKER / 13 checks
- **Scope**: 미커밋 변경 11 신규/수정 파일 + 2 삭제
- **Scope-out** (사용자 명시): Day 6 settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav. tasting_notes.cellar_item_id FK 부재. Community Reviews 섹션 v0.1.0 deferred. cellar_items.memo 컬럼 부재. notes/[noteId].tsx pre-existing TS. DrinkWindowBadge a11y refactor.

---

## 검증 대상 인벤토리

| 분류 | 파일 | 상태 |
|---|---|---|
| 화면 | `app/(tabs)/cellar/[lwin].tsx` | full rewrite |
| 신규 컴포넌트 | `src/components/cellar/cellar-hero.tsx` | 새파일 |
| 신규 컴포넌트 | `src/components/cellar/wine-label-art.tsx` | 새파일 |
| 신규 컴포넌트 | `src/components/cellar/drink-window-card.tsx` | 새파일 |
| 신규 컴포넌트 | `src/components/cellar/drink-window-timeline.tsx` | 새파일 |
| 신규 컴포넌트 | `src/components/cellar/notify-toggle-card.tsx` | 새파일 |
| 신규 컴포넌트 | `src/components/cellar/meta-card.tsx` | 새파일 |
| 신규 컴포넌트 | `src/components/cellar/meta-grid.tsx` | 새파일 |
| 신규 컴포넌트 | `src/components/cellar/drink-this-cta.tsx` | 새파일 |
| 신규 공통 | `src/components/shared/confirm-dialog.tsx` | 새파일 |
| 토큰 | `src/lib/design-tokens.ts` | 8 신규 export |
| 토큰 동기화 | `tailwind.config.ts` | 2 신규 fontSize |
| i18n | `src/lib/i18n/{ko,en}.json` | +35 leaf (parity 100%) |
| 노트 화면 | `src/components/notes/note-body-expert.tsx` | 1줄 (price → priceUnit) |
| 삭제 | `src/components/wine/drinking-window-bar.tsx` | dangling import 0 |
| 삭제 | `src/components/cellar/cellar-fields.tsx` | dangling import 0 |

---

## 체크리스트 결과

### 1. RLS ↔ 클라이언트 호출 교차 — **PASS**

`useCellarItem` (use-cellar.ts:164-213) 의 호출 패턴:
```
supabase.from('cellar_items')
  .select('*, wine:wines_localized!inner(lwin, display_name, name_ko, producer_name, country, region, classification, bottle_color, type_canonical, vintage, drink_window_from_year, drink_window_peak_year, drink_window_to_year)')
  .eq('user_id', uid).eq('wine_lwin', lwin)
  [.eq('id', cellarItemId) | .order(...).limit(1)]
  .maybeSingle()
```

RLS 정책 (`20260519000300_cellar_items.sql:26-29`):
```sql
create policy "cellar_items_all_own" on public.cellar_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

→ 호환. `eq('user_id', uid)` 명시 + RLS가 추가로 강제 → 다른 사용자의 cellar 노출 X. `wines_localized` VIEW는 `security_invoker=true`로 호출자(authenticated) 권한 상속 — `public.wines/wine_korean_names/wine_metadata`에 RLS가 없어도 VIEW 자체가 public SELECT 권한이 부여되어 있음 (line 40 `grant select ... to anon, authenticated`). 

`setCellarStatus` / `deleteCellarItem` (use-cellar.ts:140-155) — `update`/`delete` 호출에 `eq('id', id)`만 있으나 RLS의 `user_id = auth.uid()` 조건이 자동 적용되어 타인 row 변조 차단됨. (의도된 동작 — 빈 결과 = 권한 없음 = silent reject.)

### 2. wines_localized VIEW ↔ Hero/MetaCard shape — **PASS**

VIEW (`20260519000400_wines_localized_view.sql`) SELECT 컬럼 (15개): `lwin, display_name, name_ko, producer_title, producer_name, wine, country, region, classification, type_raw, type_canonical, bottle_color, drink_window_{from,peak,to}_year, vintage, status`.

`database.types.ts:408-429` Row 타입과 100% 일치 (모두 nullable).

`use-cellar.ts:22-37` `CellarItemWithWine.wine`이 Pick하는 12 필드 모두 VIEW가 제공.

CellarHero (cellar-hero.tsx:21-29) props vs 실제 수신값 매핑:
- `wineName` ← `getLocalizedWineName({name_ko, display_name}).primary` (cellar/[lwin].tsx:192-195) — 둘 다 null 가능하지만 가드 (l.163) 통과 후 `display_name` truthy 단언 (l.191)
- `bottleColor` ← `wine.bottle_color ?? getDefaultBottleColor(typeCanon)` (l.199) — null 안전 fallback ✓
- `producerName, vintage, region, country` — null 허용, CellarHero가 row 생략 처리 (cellar-hero.tsx:43-55) ✓
- `vintage` ← `wine.vintage ?? parseLwinVintage(wineLwin)` (l.202) — VIEW 값 없을 때 LWIN 8-11 substring 파싱 fallback ✓

MetaGrid (meta-grid.tsx:18-25) — wines_localized 미사용, cellar_items 컬럼만 직접 사용 (acquired_at/consumed_at/storage/purchase_price_krw/status). `memo`는 `null` 하드코딩 — cellar_items에 memo 컬럼 부재 (SCOPE-OUT 명시). MetaGrid가 `memoEmpty` fallback 처리 (l.69) ✓

### 3. 기존 wines / wine_korean_names 손상 0 — **PASS**

`git status supabase/migrations/` → empty. 이번 hardening pass에서 마이그레이션 신규/수정 0.

기존 마이그레이션 중 wines/wine_korean_names를 참조하는 모든 SQL은:
- `00000000000000_local_stub_external_catalog.sql` (로컬 dev stub만 — production 영향 X)
- `20260519000400_wines_localized_view.sql` — wines를 READ-only로 join. seed insert는 `wine_metadata`에만 (`on conflict do nothing`)
- `20260519000300_cellar_items.sql` / `20260519000200_tasting_notes.sql` — wines.lwin을 FK 참조만

→ wines/wine_korean_names 테이블 schema·data 변경 0. count diff 검증은 production migration push가 없으므로 N/A.

### 4. ko/en 신규 ~27 키 양쪽 채움 — **PASS**

i18n parity 스캔 결과: `total ko keys: 469, en keys: 469. ko_only: [], en_only: []`. 100% 대칭.

신규 leaf 추가 누적 35건 (cellar 서브트리에 신규 키 ≈ 27, 그 외 common.{yes,no} + 일부 갱신 라벨). 영어 모드 한글 노출 스캔:
- 의도적 self-id 라벨 2건만 hit (`language.ko`, `settings.values.ko` = "한국어") — 언어 스위처 표준 ✓
- 그 외 영문 모드에서 한글 노출 0건

### 5. dark/light dual definition — **PASS**

신규 9개 컴포넌트의 dual-mode 처리:

| 컴포넌트 | 처리 |
|---|---|
| CellarHero | TW `dark:` companion (text-primary/secondary/muted), border `useThemeTokens().border.default`, hero gradient `cellarDetailHeroGradient` (scheme-agnostic — design-tokens.ts:517-525 문서화: bottle scene atmosphere 양쪽 동일) |
| WineLabelArt | bottle_color 기반 inner gradient (scheme 무관 — 와인 라벨 시각 일관성); highlight overlay는 white-alpha (양쪽 자연스러움) |
| DrinkWindowCard | TW `dark:` companion 전 텍스트; inner `DrinkWindowBadge` 컴포넌트 (별도 hardening) |
| DrinkWindowTimeline | track 5-stop gradient (gold/wineRed/gray — 양쪽 시인성 OK, design-tokens.ts:545-558 문서화); current dot border `bg.deepest` scheme-resolved ✓ |
| NotifyToggleCard | track OFF색 `useThemeTokens().border.default` scheme-resolved ✓; ON색 brand.gold (양쪽 동일 의도) |
| MetaCard | TW `dark:` 전 텍스트/배경 |
| MetaGrid | (래퍼 — 토큰 사용 없음) |
| DrinkThisCta | bottom fade `cellarBottomFade[scheme]` — dark는 deepestDark alpha, light는 light.bg.deepest alpha (design-tokens.ts:563-577 양쪽 정의) ✓; CTA bg는 brand.wineRed (양쪽 동일 의도) |
| ConfirmDialog | scrim `overlay.bgScrim[scheme]` (design-tokens.ts:192-196 dual) ✓; 본체 TW `dark:` |

`cellarDetailHero` 양쪽 모드 동일 (bottle_color → dark.bg.bottleShelf) — 이는 design-spec §13-2 + design-tokens.ts:517-518 주석에 명시된 의도(라이트 모드에서도 와인 분위기 보존). 디자인 결정 — 점검 결과 위반 아님.

### 6. emoji grep — **PASS**

15 변경/신규 파일 전체 스캔: 0건. (U+1F300-1FAFF, U+2600-27BF, U+FE0F variation selector)

### 7. 하드코딩 hex / rgba grep (변경 파일) — **PASS**

9개 컴포넌트 + 2개 i18n 스캔:
- cellar-hero.tsx:9에서 `#1a0a1e` 1건 hit → **JSDoc 주석 안 설명문** (line 9의 `bottle_color→#1a0a1e 70%` 묘사). 코드 값 X, 위반 아님.
- 그 외 모든 hex/rgba는 design-tokens.ts (유일 허용 위치)에서 토큰 export → 컴포넌트는 토큰명만 import. ✓

design-tokens.ts 신규 8 token (shade helper, cellarDetailHeroGradient, wineLabelArtGradient, wineLabelArtHighlightGradient, drinkWindowTimelineGradient, cellarBottomFade) — 양쪽 모드 분기 또는 의도적 scheme-agnostic이 모두 인라인 주석으로 근거 설명됨.

### 8. SUPABASE_SERVICE_ROLE_KEY 격리 — **PASS**

src/, app/ 전체 grep — 1건 hit (`src/lib/supabase.ts:9` 주석에서 "절대 import 금지" 경고 문자열). 실제 코드 사용 0건. ✓

### 9. LWIN 형식 — **PASS**

- cellar/[lwin].tsx:62 LWIN을 string param으로 수신 (Expo Router file-based — `[lwin]` slug)
- l.111: `/notes/new/write?wine_lwin=${encodeURIComponent(item.wine.lwin)}` ✓
- l.309: `/wine/${encodeURIComponent(wineLwin)}` ✓
- `parseLwinVintage` (src/lib/lwin.ts:10) — substring(7,4) 11/13자리 LWIN에서 vintage 추출. DB CHECK는 `wines.lwin` 컬럼 (`text`로 7/11/13 자리 — wines_localized VIEW도 동일 위임)
- wine_lwin FK: `cellar_items.wine_lwin → wines.lwin` (`20260519000300_cellar_items.sql:7`) ✓

### 10. OAuth 골격 호환 — **PASS**

`src/lib/auth/{link-identity.ts, providers/{kakao,google,apple}.ts}` 모두 존재 + 이번 hardening pass에서 미수정. profiles 마이그레이션도 변동 없음. ✓ (스코프 외이지만 회귀 확인.)

### 11. profiles 트리거 변경 없음 — **PASS**

`git status supabase/migrations/20260519000000_profiles.sql supabase/migrations/20260520000000_anonymize_use_vault.sql` → empty. `handle_new_user` 트리거, anonymous_display, linked_providers, is_upgraded, email 컬럼 모두 무변동. ✓

### 12. note-body-expert.tsx `cellar.meta.price` → `priceUnit` regression — **PASS**

변경 의미 분석:
- **변경 전 i18n**: `cellar.meta.price` = "원" / "KRW" (단순 단위 suffix)
- **변경 후 i18n**: `cellar.meta.price` = "구매가" / "Price" (label로 의미 재할당), `cellar.meta.priceUnit` = "원" / "KRW" (새 단위 키)

note-body-expert.tsx:91 컨텍스트:
```tsx
{c.estimated_price_krw.toLocaleString()} {t('cellar.meta.priceUnit')}
```

→ 이 문맥은 숫자 뒤에 붙는 **단위** ("180,000 원"). i18n 의미 재할당 후 올바른 키는 `priceUnit`. 변경 ✓. UI 상 노트 expert 결론부 가격 표시는 그대로 "{숫자} 원" / "{number} KRW" — 시각 regression 0.

`cellar.meta.price` (이제 "구매가") 사용처는 meta-grid.tsx:85의 MetaCard label뿐 — 의미 일관 ✓.

### 13. drinking-window-bar.tsx 삭제 후 외부 import — **PASS**

`grep -rn "drinking-window-bar"` (src/, app/) → 0 hit. dangling import 없음. cellar-fields.tsx도 동일 검증 → 0 hit. ✓

---

## 부가 발견 (informational, FAIL 아님)

- **F-i1 (memo placeholder)**: cellar/[lwin].tsx:286이 `memo={null}` 하드코딩. cellar_items 스키마에 `memo` 컬럼은 없고 `notes_ko/notes_en`만 있음. SCOPE-OUT 명시이므로 PASS이나, v0.2.0 cellar memo 구현 시 두 컬럼 활용 가능성 검토.
- **F-i2 (cellarDetailHero scheme-agnostic)**: 라이트 모드에서도 hero가 어두운 wine atmosphere 유지. 사용자 명시 SCOPE-OUT가 아닌 design-tokens.ts 인라인 주석에 의도 기록된 사항. design-reviewer 라이트 모드 갤러리 검증에서 다시 확인 권장.
- **F-i3 (notify state는 로컬 only)**: NotifyToggleCard의 notify state는 cellar/[lwin].tsx:69 `useState`로만 관리 — DB persist X. cellar_items.notify_at_peak 컬럼(20260519000300_cellar_items.sql:16)에 wire하지 않음. v0.1.0 deferred 가능성 또는 추가 cycle 필요 — release-engineer/리더 판단.
- **F-i4 (Drink This 즉시 consumed 토글)**: l.107-108 주석에서 "비즈니스 로직 정합성 별도 cycle 검토" 자체 노트. 사용자가 확인 후 셀러 → consumed → 노트 라우팅. 즉시 consumed 마킹이 의도라면 PASS.

---

## 종합

**PASS — 0 FAIL**. 모든 13항목 통과. 정보성 4건은 SCOPE-OUT 또는 documented design decision으로 분류. 빌드 게이트 통과 가능.

다음 단계 권장: design-reviewer가 라이트/다크 스크린샷 라운드에서 F-i2 (hero scheme-agnostic) 시각 OK 확인 후 release-engineer로 진행.
