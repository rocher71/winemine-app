# QA — /notes/new retroactive hardening 통합 정합성 검증

- 일시: 2026-05-21 00:40 KST
- 대상: Day 6 retroactive — /notes/new 화면 + 신규 컴포넌트 + 신규 i18n 키 + 신규 typography 토큰
- 검증 모드: incremental (코드/SQL/i18n 정적 분석)
- SCOPE-OUT (이번 검증 비대상): settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav, tasting_notes.source_type / template_id 스키마 변경, write.tsx 의 templateId query 연동

---

## 대상 파일 (미커밋 변경)

| 파일 | 종류 | 비고 |
|---|---|---|
| app/notes/new.tsx | 전면 재작성 | Stage 1 Template → Stage 2 Source → Stage 3 BottomSheet 2-stage 라우터 |
| src/components/notes/template-card.tsx | 신규 | Stage 1 카드 |
| src/components/notes/source-picker.tsx | 신규 | Stage 2 CellarCard + NewWineCard |
| src/components/notes/cellar-bottom-sheet.tsx | 신규 | Stage 3 @gorhom/bottom-sheet |
| src/lib/notes/builtin-templates.ts | 신규 | BUILTIN_BEGINNER_ID / BUILTIN_EXPERT_ID / mapSourceUiToDb |
| src/lib/design-tokens.ts | typography 10 신규 | line 433~449 (templateCardTitle...backToTemplateLink) |
| tailwind.config.ts | fontSize 10 신규 | line 145~155 ('template-card-title' 외) |
| src/lib/i18n/ko.json | 21 신규 키 + 1 값 교체 | notesNew.* + notes.source.{title,question,cellarListTitle,fromCellarEmpty} |
| src/lib/i18n/en.json | 21 신규 키 + 1 값 교체 | 동일 |

---

## 체크리스트 결과

### 1. RLS ↔ 클라이언트 호출 교차 정합성 (PASS)

- CellarBottomSheet 는 자체 supabase 호출 없음. `props.items: CellarItemWithWine[]`을 부모(app/notes/new.tsx) 에서 받음.
- 부모는 `useCellarList('cellared')` 사용 (src/hooks/use-cellar.ts:101~138).
  - `supabase.from('cellar_items').select(... wine:wines_localized!inner(...)).eq('user_id', uid).eq('status', 'cellared')` — `user_id = auth.uid()` 필터를 명시.
- supabase/migrations/20260519000300_cellar_items.sql:24~27 의 `cellar_items_all_own` RLS USING 절과 호환.
  - 즉, 클라이언트 `eq('user_id', uid)` + RLS `using user_id = auth.uid()` 양쪽 다 보장 — 빈결과 버그 위험 0.
- BottomSheet 내 행은 read-only (선택 후 router.push 만 호출). insert/update/delete 없음 → RLS WITH CHECK 검증 대상 아님.

### 2. wines_localized VIEW ↔ CellarRow shape 일관성 (PASS)

- VIEW SELECT 컬럼 (supabase/migrations/20260519000400_wines_localized_view.sql):
  lwin, display_name, name_ko, producer_title, producer_name, wine, country, region,
  classification, type_raw, type_canonical, bottle_color,
  drink_window_{from,peak,to}_year, vintage, status.
- shared/types/database.types.ts wines_localized.Row 와 1:1 일치 (모두 nullable string/number).
- CellarItemWithWine (src/hooks/use-cellar.ts:21~37) pick: lwin, display_name, name_ko, producer_name, country, region, bottle_color, type_canonical, vintage, drink_window_{from,peak,to}_year — 전부 VIEW 컬럼 존재.
- cellar-bottom-sheet.tsx:158~170 의 한글명 우선 표시:
  `wineName = wine.name_ko ?? wine.display_name` — Plan D 와 wine-research 정책 한글명 우선 + 영문 fallback 패턴 일치.
- bottle_color null 처리: cellar-bottom-sheet.tsx:164 `wine.bottle_color ?? getDefaultBottleColor(typeCanon)` — fallback OK.
- vintage null 처리: line 165 `wine.vintage ?? parseLwinVintage(wine.lwin)` — fallback OK.
- 가드: line 159 `if (!wine?.lwin || !wine?.display_name) return null;` — VIEW Row 의 모든 컬럼이 nullable 이므로 필수 가드 적절.

### 3. 기존 wines / wine_korean_names count diff 0 (PASS)

- 변경 파일 중 supabase/migrations/ 아래 신규/수정 0개. wines / wine_korean_names 테이블 직접 또는 간접 변경 없음.
- 이번 hardening 은 client-only 변경.

### 4. ko/en 신규 21 키 양쪽 채움 + 영어 모드 한글 노출 0 (PASS)

- ko.json: 491 키, en.json: 491 키 — diff 0건. 신규 21 키 양쪽 모두 정의:
  - notesNew.templatePicker.{title,subtitle,byWinemine,customBadge,cardHint} (5)
  - notesNew.sourcePicker.{subtitle,changeTemplate,changeTemplateHint,cellarHint,newEntryHint,cellarRowHint} (6)
  - notesNew.builtinTemplate.{beginnerTitle,beginnerDesc,expertTitle,expertDesc} (4)
  - notes.source.{question,fromCellarSub,fromCellarEmpty,newEntry,newEntrySub,cellarListTitle} (6)
- 값 교체 검증: ko.json:260 `notes.source.title = "출처 선택"`, en.json:260 `notes.source.title = "Choose source"` — 양쪽 동기 교체.
- en.json 한글 노출: 영어 모드 키 값에 [가-힣] 0건 (`{ko:"한국어",en:"English"}`, `{ko:"한국어",en:"English"}` 의 language/settings.values 만 의도적 이중-locale 표기, 그 외 0).

### 5. dark/light dual definition — 신규 토큰 (PASS)

- 신규 typography 10건은 모드 무관 (font family + size + lineHeight + letterSpacing 만) — dual 분기 필요 없음.
- 색은 모두 기존 토큰 사용: brand.gold, brand.wineRed, dark/light.bg.surface, dark/light.border.default, dark/light.text.{primary,secondary,muted}, withAlpha(brand.gold, 0.15/0.4).
- 신규 컴포넌트는 useThemeTokens() 로 scheme 분기 후 light/dark 양쪽 surface/border 매핑 — light 모드 깨짐 없음.

### 6. emoji grep (PASS)

- 9개 변경 파일 모두 emoji + U+FE0F variation selector + U+200D ZWJ + 일반 emoji 블록 (U+1F300~U+1FAFF, U+2600~U+27BF) 0건.

### 7. 하드코딩 hex/rgba grep — 변경 파일 (PASS)

- app/notes/new.tsx, src/components/notes/{template-card,source-picker,cellar-bottom-sheet}.tsx, src/lib/notes/builtin-templates.ts — `#xxxxxx` / `rgba(...)` 0건. 모두 design-tokens.ts 경유 (`brand.gold`, `withAlpha(brand.gold, 0.4)`, `dark/light.bg.surface` 등).
- design-tokens.ts 자체는 104건 hex — CLAUDE.md §4-9 의 토큰 dual-source 허용 위치.

### 8. SUPABASE_SERVICE_ROLE_KEY 격리 (PASS)

- src/, app/ 전체에서 client 코드 호출 0건 (src/lib/supabase.ts:9 의 금지 주석만 존재).
- EXPO_PUBLIC_ 사용은 정의된 env (SUPABASE_URL/SUPABASE_ANON_KEY/ANONYMIZATION_SALT_DEV) 3종만.

### 9. LWIN 형식 검증 (PASS)

- CellarRow 의 LWIN 사용 (cellar-bottom-sheet.tsx:159,202): 가드 `if (!wine?.lwin) return null` + `parseLwinVintage(wine.lwin)` 호출 — src/lib/lwin.ts 의 length 11/13 만 vintage 파싱.
- app/notes/new.tsx:80,87 `wineLwin = item.wine?.lwin` 후 `if (!wineLwin) return` 가드, `q.set('wine_lwin', wineLwin)` → write 화면 진입.
- write 화면 (app/notes/new/write.tsx:113) 은 `LWIN_REGEX = /^\d{7}$|^\d{11}$|^\d{13}$/` 로 재검증 — DB CHECK 와 호환.

### 10. OAuth 골격 호환성 (PASS — 변경 없음)

- supabase/migrations/20260519000000_profiles.sql:63~64 `linked_providers text[]` + `is_upgraded boolean` 컬럼 유지.
- src/lib/auth/providers/{apple,google,kakao}.ts 존재. src/lib/auth/link-identity.ts 의 NotImplemented stub 존재.
- src/lib/supabase.ts:41 `flowType: 'pkce'` 유지.

### 11. profiles 트리거 변경 없음 (PASS)

- supabase/migrations/20260519000000_profiles.sql (handle_new_user + on_auth_user_created trigger) 변경 0 byte.

### 12. notes.source.title 값 교체 regression (PASS — 사용처 1곳만)

- `notes.source.title` 사용처: app/notes/new.tsx:94 (BackHeader title) — **유일.**
- write.tsx / 기타 화면에서 `notes.source.title` 직접 참조 0건. 값 교체("출처 선택"/"Choose source")가 다른 화면에 영향 없음.
- write.tsx 는 `t('notes.write')` (line 286) 사용 — 별도 키, regression risk 없음.

### 13. BUILTIN_BEGINNER / BUILTIN_EXPERT mapping — UI → DB source 일관성 (CONDITIONAL PASS / 1 known scope-out gap)

- src/lib/notes/builtin-templates.ts:62~68 `mapSourceUiToDb('cellar') = 'cellar'`, `mapSourceUiToDb('newEntry') = 'other'` — 기존 tasting_notes.source_type enum (cellar/restaurant/shop/gift/tasting_event/other) 6값과 호환. 'newEntry' → 'other' fallback 명시적 주석 처리.
- **GAP (의도적 scope-out)**: app/notes/new.tsx 가 write 화면으로 forward 하는 query 는 `from=newEntry|cellar` (line 72,84), `templateId=builtin-beginner|builtin-expert` (line 73,86) 인데, write.tsx (app/notes/new/write.tsx:108~119) 는 `source` 와 `wine_lwin`, `photo_url` 만 파싱 — `from`/`itemId`/`templateId` 무시.
  - 결과 (현재 v0.1.0): templateId 기반 mode 결정 X (profile.experience 로만 결정 — write.tsx:138~141). 사용자가 Stage 1 에서 'expert' 양식 골라도 profile 이 beginner 면 BeginnerForm 노출됨. UX 손실.
  - 사양 인지 여부: _workspace/design-specs/notes-new.md:560 "양식 결정 | Template picker가 결정 (templateId query) | 현재 write 화면이 자체 결정 | write 화면 진입 시 templateId로 결정 — write.tsx 수정 필요" — 명시적 known gap.
  - 사용자 요청에서도 "write.tsx 연동 (templateId query) 별도 작업" SCOPE-OUT 으로 명시 — 이번 게이트 차단 사유 아님.
- newEntry 경로의 `source` query 누락: app/notes/new.tsx:72~75 `buildQuery({ from: 'newEntry', templateId })` — write.tsx 가 `source` 미수신 → NoteInsert.source = null 로 저장됨. tasting_notes 테이블의 source 컬럼 nullable 인지 확인 필요 (이번 검증 외).
- 이 두 gap 은 모두 사용자가 SCOPE-OUT 으로 처리한 "write.tsx 연동 별도 작업"에 속함. 정합성 게이트는 PASS.

---

## 보조 발견 (informational, 비차단)

(a) cellar-bottom-sheet.tsx:115 의 `handleIndicatorStyle.backgroundColor = brand.gold` — 양쪽 모드 모두 gold (brand-fixed) — 의도된 디자인.

(b) source-picker.tsx:149 `borderColor: brand.wineRed` — NewWineCard 양쪽 모드 동일 wineRed (brand-fixed) — 의도된 디자인.

(c) write.tsx 의 source enum 6값 (cellar/restaurant/shop/gift/tasting_event/other) 과 builtin-templates.ts 의 NoteSourceUi 2값 (cellar/newEntry) 간 mapping 함수가 정의됐으나 (mapSourceUiToDb), 현재 어디서도 호출되지 않음 — write.tsx 연동 시 사용 예정. dead code 경고 수준.

(d) app/notes/new.tsx:39 `useCellarList('cellared')` — Stage 1 단계에서도 데이터 fetch 됨 (Stage 2 진입 전). 캐시 활용 측면에선 OK, 성능 측면에선 prefetch 라 정상.

(e) cellar-bottom-sheet.tsx:71 `snapPoints = ['70%']` 단일 snap — design-spec 70% 명세 일치.

---

## 종합

- **검증 13/13 PASS (의도적 SCOPE-OUT 1건 별도 후속 작업으로 인지).**
- 기존 wines/wine_korean_names 손상 0 (변경 SQL 없음).
- ko/en 키 완벽 양쪽 동기 (491 = 491, diff 0).
- 영어 모드 한글 노출 0건, emoji 0건, 하드코딩 hex/rgba 0건 (변경 파일), SERVICE_ROLE 0건.
- VIEW shape ↔ CellarRow ↔ Pick<WineLocalizedRow> 3단 일치.
- RLS USING `user_id = auth.uid()` ↔ 클라이언트 `eq('user_id', uid)` 양쪽 보장 — 빈 결과 버그 위험 0.
- profiles 트리거·OAuth 골격 변경 없음 (v0.2.0 호환 유지).

후속 작업 (이번 게이트 외):
- write.tsx 의 `templateId` query 수신 + mode 결정 로직 추가 (rn-screen-builder).
- write.tsx 의 `from` query 수신 + `source` mapping (mapSourceUiToDb 호출) 추가.
- tasting_notes 의 source_type enum 축소 또는 template_id 컬럼 추가 (supabase-engineer, v0.2.0 가능).
