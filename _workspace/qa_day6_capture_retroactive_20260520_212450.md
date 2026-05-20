# QA 보고서 — Day 6 캡처 retroactive hardening (통합 정합성 게이트)

검증자: qa-inspector
요청자: rn-screen-builder (capture retroactive Day 6)
스코프: app/(tabs)/capture.tsx + src/components/capture/* (11) + src/components/shared/primary-button.tsx + src/components/nav/bottom-nav.tsx + src/lib/animations/wm-pulse.ts + src/lib/design-tokens.ts + tailwind.config.ts + src/lib/i18n/{ko,en}.json
참조 사양: _workspace/design-specs/capture.md, _workspace/10_rn_screens_day6_capture_retroactive.md
기준: .claude/skills/integration-coherence-check/SKILL.md §1-11

---

## 최종 판정: PASS (FAIL 수 0)

체크리스트 11항목 — 모두 통과. 미규모 lint 수준 관찰 사항 2건 (블로커 아님 — 본 hardening의 정합성 검증 범위 외 minor) 별도 명시.

---

## 1. RLS ↔ 클라이언트 호출 교차 — PASS

### Storage 업로드 (`label-photos` bucket)
- `app/(tabs)/capture.tsx:146-150`: `path = ${uid}/${shortId()}.jpg` + `upload(path, buffer, { contentType: 'image/jpeg', upsert: false })`
- 정책 `label_photos_own_insert` (supabase/migrations/20260519000500): `with check (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text)` → path 첫 segment가 uid 문자열인지 정확히 검증. 일치.
- `getCurrentUserId()` 결과 검증 `if (!uid) throw new Error('no session')` (line 145). RLS와 client 검증 양면 일치.
- 실패 시 `showError('capture.errors.uploadFailed')` Toast + setStage('choose') return. 정상 처리.

### `wines_localized` SELECT 조회
- `app/(tabs)/capture.tsx:171-177`: `.from('wines_localized').select(...).eq('lwin', scan.lwin).maybeSingle()`
- VIEW는 `security_invoker=true` (migrations/20260519000400_wines_localized_view.sql:7) + `grant select on public.wines_localized to anon, authenticated` (line 40). 호출자(authenticated)에 RLS 자동 상속.
- `where w.status = 'Live'` 자동 필터링 — Live 와인만 반환. scan.lwin이 Live가 아닐 경우 maybeSingle → null. F.1 narrow `if (!wine?.lwin || !wine?.display_name)` (line 184)로 빈 결과 vs 버그 명시 구분.

### `cellar_items` INSERT
- `app/(tabs)/capture.tsx:293-299`: `insert({ user_id: uid, wine_lwin: recognized.lwin, acquired_at: todayIso, status: 'cellared', quantity: 1 })`
- 정책 `cellar_items_all_own` (migrations/20260519000300:27-29): `using/with check user_id = auth.uid()` — `user_id: uid` 명시 일치 (N.1 표준 패턴).
- DB CHECK `consumed_needs_date check (status = 'cellared' or consumed_at is not null)` 우회 — status 'cellared'로 consumed_at NULL 허용. 일치.
- `wine_lwin text not null references public.wines(lwin) on delete restrict` — recognized.lwin은 wines_localized 조회 통과한 Live wine이므로 FK 항상 충족.

### label-scan Edge Function invoke
- `app/(tabs)/capture.tsx:163`: `await scanLabel({ photo_url: publicUrl })` via `@/lib/label-scan` adapter
- adapter는 `supabase.functions.invoke('label-scan', ...)` 내부 호출 (anonymous JWT 자동). 본 hardening은 adapter 자체 미수정.

→ 모든 데이터 접근 경계면 RLS 호환 + F.1/N.1 표준 패턴 일관.

---

## 2. `wines_localized` VIEW ↔ RecognizedView shape — PASS

### 컬럼 선택 vs VIEW 정의
| capture.tsx select 컬럼 (line 173-175) | VIEW 정의 (migrations/...000400) | RecognizedWineData 필드 | 사용 위치 |
|---|---|---|---|
| `lwin` | line 9 | `lwin: string` | navigation param, cellar FK |
| `display_name` | line 10 | `display_name: string` | getLocalizedWineName |
| `name_ko` | line 11 | `name_ko: string \| null` | ko mode primary / EN chip 분기 |
| `producer_name` | line 13 | `producer_name: string \| null` | RecognizedView line 142 conditional |
| `bottle_color` | line 20 (`wm.bottle_color`) | `bottle_color: string` (fallback applied) | PhotoFrame gradient start |
| `type_canonical` | line 19 | (capture.tsx line 191 사용) | `getDefaultBottleColor` fallback |
| `vintage` | line 24-27 (coalesce + lwin parse) | `vintage: number \| null` | MetaRow conditional |
| `region` | line 16 | `region: string \| null` | regionValue 조합 |
| `country` | line 15 | `country: string \| null` | regionValue 조합 |
| `classification` | line 17 | (selected but unused) | minor — TS strict 무해 |
| `drink_window_from_year` | line 21 | `drinkWindowFrom: number \| null` | drinkWindowValue 조합 |
| `drink_window_to_year` | line 23 | `drinkWindowTo: number \| null` | drinkWindowValue 조합 |

### appellation / grapes fallback (사양 §12-2 deferred)
- capture.tsx:203-204: `appellation: null, grapes: null` (주석: "wines_localized 미노출 — v0.2.0 deferred (사양 §12-2)")
- RecognizedView:162, 165: `{wine.appellation ? <MetaRow .../> : null}` 및 `{grapesValue ? <MetaRow .../> : null}` — row 자체 hide. UI에 빈 칸 노출 0.
- 일관 처리 확인.

### bottle_color NULL fallback
- capture.tsx:190-191: `wine.bottle_color ?? getDefaultBottleColor(asTypeCanonical(wine.type_canonical))` — VIEW가 NULL 반환 시 type_canonical 기반 default 색상으로 fallback.
- `getDefaultBottleColor` (src/lib/lwin.ts:18-21): type=null도 `bottleColorDefault.red` fallback. PhotoFrame이 항상 valid hex 받음.

### vintage NULL fallback
- capture.tsx:189: `wine.vintage ?? parseLwinVintage(wine.lwin)` — VIEW의 coalesce에서 이미 lwin parse 처리되었지만 추가 안전망. RecognizedView line 156에서 `wine.vintage ? <MetaRow/>` — null이면 row hide.

→ 12 컬럼 모두 VIEW에 존재. NULL 가능 필드 모두 RecognizedView에서 conditional rendering. shape 정합 완전.

---

## 3. 기존 wines / wine_korean_names 손상 0 — PASS

- `git diff HEAD -- supabase/` 결과: 변경 없음. 본 Day 6 capture retroactive는 클라이언트 전용 변경.
- migrations/00000000000000_local_stub_external_catalog.sql 및 wine_korean_names 관련 마이그레이션 미접근.
- 기존 wines.lwin → cellar_items.wine_lwin FK 그대로 보호.

→ schema 손상 0, 데이터 손상 0.

---

## 4. ko/en 신규 키 양쪽 채움 + 영문 모드 한글 노출 X — PASS

- 키 parity: 409 ko = 409 en, 0 mismatched (재귀 비교).
- capture.* 키: ko 53개 = en 53개. 새 키 모두 양쪽 채움.
- 코드에서 사용되는 `t('capture.*')` 키 총 44개 — ko.json/en.json 양쪽 모두 존재 (0 missing).
- en.json 한글 잔재 검사 결과: 2건 발견 — `language.ko = "한국어"`, `settings.values.ko = "한국어"`. CLAUDE.md §4-4 명시 예외 (언어 선택지 자체는 해당 언어로 표시). capture 관련 신규 키 중에는 0건.
- 와인명은 fallback `EN` chip 패턴으로 처리 (en.json line 60: `"enFallbackChip": "EN"`, ko.json line 60: 동일). RecognizedView line 126-139에서 ko mode + name_ko 부재 시 칩 노출.

→ locale 누락 0, 영문 모드 한글 잔재 0 (의도된 언어 라벨 예외만).

---

## 5. dark/light dual definition — PASS

신규/변경 토큰 모두 양쪽 정의 확인:

| 토큰 | dark 값 | light 값 |
|---|---|---|
| `capture.bottlePhotoEnd` | `#1a0a0e` | `rgba(42, 26, 20, 0.85)` |
| `capture.fileNotFoundBg` | `rgba(74, 61, 86, 0.2)` | `rgba(160, 140, 110, 0.12)` |
| `capture.aiBadgeBg` | `rgba(201, 168, 76, 0.08)` | `rgba(184, 148, 56, 0.10)` |
| `overlay.bgScrim` | `rgba(0, 0, 0, 0.55)` | `rgba(42, 26, 20, 0.40)` |
| `overlay.pillBg` | `rgba(0, 0, 0, 0.45)` | `rgba(42, 26, 20, 0.10)` |
| `captureBottlePhotoGradient(c, scheme)` | scheme='dark' end | scheme='light' end (factory) |

컴포넌트 분기 검증:
- ai-badge-banner.tsx: useColorScheme + isLight → bg/borderColor/goldColor/titleColor/subtitleColor 5개 분기 ✓
- capture-header.tsx: iconColor (`isLight ? light.text.primary : brand.cream`) ✓
- choose-option-card.tsx: useIconColor hook으로 4 variant × 2 mode 8 분기 ✓
- file-not-found-hint.tsx: bg/titleColor/mutedColor 3개 분기 ✓
- meta-row.tsx: labelColor/valueColor 2개 분기 ✓
- photo-frame.tsx: gradient/borderColor 2개 분기 ✓
- recognized-view.tsx: producerColor/nameColor 2개 분기 ✓
- secondary-icon-button.tsx: textColor 1개 분기 ✓
- simulating-view.tsx: goldColor/previewBg/borderColor/messageColor 4개 분기 ✓
- capture.tsx: pillBg / X icon color / shutter ring color / scrimBg 등 다수 분기 ✓
- primary-button.tsx (`cellar` variant): `border-gold dark:border-gold` 양쪽 명시 ✓

→ 21+ 신규 토큰 양쪽 정의 완전. 컴포넌트 분기 일관.

---

## 6. emoji grep — PASS

- src/components/capture/ + app/(tabs)/capture.tsx + src/lib/animations/ + 변경된 shared/nav 컴포넌트 + design-tokens.ts + tailwind.config.ts + i18n ko/en: U+1F000~U+1FFFF, U+2600~U+27BF, U+FE0F 검색 결과 0건.

---

## 7. 하드코딩 hex / rgba grep — PASS

- 변경 신규 capture 컴포넌트 11개 + capture.tsx + animations/wm-pulse.ts + primary-button.tsx + bottom-nav.tsx: 0 hex literal (단 1건 simulating-view.tsx line 6 docstring 안 `#000` 주석 — 코드 아님).
- rgba literal: 변경 컴포넌트 0건 (모두 토큰 경유).
- design-tokens.ts: 33 rgba — 예외 허용 (토큰 정의 위치).
- tailwind.config.ts: hex/rgba 다수 — 예외 허용 (NW v4 color extend).
- lwin.ts: bottleColorDefault 사용처 — 예외 허용 (도메인 default).
- i18n ko/en: 0 hex.

이전 design-review S4 채택 `light.bottlePhotoEnd = rgba(42,26,20,0.85)` 및 `overlay.bgScrim/pillBg`, `capture.aiBadgeBg/fileNotFoundBg`로 인해 하드코딩 4건 → 0건 정리 확인 (rn-screen-builder 보고와 일치).

---

## 8. SUPABASE_SERVICE_ROLE_KEY 격리 — PASS

- 전 src/ + app/ grep: 1 hit, 위치 `src/lib/supabase.ts:9` 주석으로 "절대 import 금지" 경고. 실제 사용 0건.
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`만 RN client에 노출 (supabase.ts line 26-27). env.example 일치 (이전 검증).
- `flowType: 'pkce'` 설정 유지 (line 41) — v0.2.0 OAuth 호환.

---

## 9. LWIN 형식 — PASS

- RecognizedView에 LWIN 형식 직접 input 없음. capture.tsx에서 `scan.lwin` (label-scan Edge Function 응답) → wines_localized 조회 → `wine.lwin`만 사용.
- wines.lwin = 7/11/13자리 (catalog) — 그대로 cellar_items.wine_lwin (FK) 및 URL param에 전달.
- zod regex `/^\d{7}$|^\d{11}$|^\d{13}$/` (src/lib/lwin.ts:36) — `isValidLwin` 함수 미사용이지만 wines_localized RLS + FK가 자체적으로 LWIN 정합 보장.
- `encodeURIComponent(lwin)` 적용 (line 282, 320) — 숫자 LWIN에 무해, 방어적.

---

## 10. OAuth 골격 호환 — PASS

- profiles 테이블 변경 없음 (supabase/ diff 0).
- src/lib/auth/{index.ts, link-identity.ts, providers/{kakao,google,apple}.ts} 변경 없음 — 골격 유지.
- supabase.ts `flowType: 'pkce'` 유지. v0.2.0 `linkIdentity` 호환.

---

## 11. profiles 트리거 동작 — PASS (변경 없음 확인)

- supabase/ migrations 변경 0. handle_new_user trigger 및 anonymize_use_vault 동작 영향 없음.

---

## 부수 관찰 (블로커 아님, 정합성 외 minor)

1. **capture.tsx line 45 `dark` import 미사용**: `import { brand, dark, light, overlay, type TypeCanonical } from '@/lib/design-tokens'` 중 `dark` 심볼은 본 파일에서 직접 사용 안 됨. `overlay.pillBg.dark`는 property access이지 import한 `dark` 토큰이 아님. lint 경고 수준 — TypeScript strict 컴파일/런타임 무해. 후속 정리 권장.
2. **capture.tsx wines_localized select에 `classification` 포함되어 있으나 미사용**: line 174 컬럼 목록에 `classification` 있지만 setRecognized 시 미매핑(RecognizedWineData에도 없음). 네트워크 페이로드 미세 증가 외 무해. 후속 정리 권장.

두 항목 모두 본 hardening의 통합 정합성 외 minor. rn-screen-builder 후속 cleanup 시 처리 가능 (즉시 차단 사유 X).

---

## 종합

- **PASS 항목**: 11/11 체크리스트 모두 통과
- **FAIL 항목**: 0
- **블로커**: 없음
- **rn-screen-builder 후속 cleanup 권장**: 2건 (unused import + unused selected column)

기존 11 화면 retroactive hardening 패턴(home / wine-detail) + 본 capture까지 3 화면 모두 정합성 게이트 PASS. Day 6 추가 작업(settings 3 sub) 진행 가능.

다음 단계: design-reviewer가 visual 게이트 통과시키면 (이미 v2 PASS 확인됨), capture retroactive 종료.
