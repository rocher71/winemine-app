# QA — notes-detail retroactive hardening (Day 6)

**Timestamp:** 20260521_014807
**Scope:** /notes/[noteId] retroactive hardening — 7 files modified, 4 components newly added.
**Verdict:** PASS — 14/14 checks pass, 0 fail.

---

## Files under review

| Path | Status | Lines (diff) |
|---|---|---|
| app/notes/[noteId].tsx | M (rewrite) | +208 / -128 |
| src/components/notes/note-wine-header-link.tsx | A (new) | 132 |
| src/components/notes/note-author-avatar.tsx | A (new) | 67 |
| src/components/notes/note-author-card.tsx | A (new) | 179 |
| src/components/notes/note-memo-card.tsx | A (new) | 66 |
| src/components/notes/note-body-beginner.tsx | M | +120 / -∗ |
| src/components/notes/note-body-expert.tsx | M | +70 / -∗ |
| src/lib/design-tokens.ts | M | +50 |
| tailwind.config.ts | M | +14 |
| src/lib/i18n/ko.json | M | +16 |
| src/lib/i18n/en.json | M | +16 |

`git diff --stat` total: 7 files, +366 / -128.

---

## Check results

### 1. RLS ↔ 클라이언트 호출 교차 (PASS)

- `app/notes/[noteId].tsx` calls `useNote(noteId)` → `src/hooks/use-notes.ts:48` performs
  `supabase.from('tasting_notes').select('*, wine:wines_localized!inner(*)').eq('id', noteId).maybeSingle()`.
- `tasting_notes` RLS policy (`supabase/migrations/20260519000200_tasting_notes.sql`):
  `using (user_id = auth.uid()) with check (user_id = auth.uid())` — auto-filters to current user.
  The hook does NOT explicitly add `.eq('user_id', uid)` for SELECT, but RLS enforces it server-side. Acceptable
  (matches v0.1.0 "mine only" semantics).
- `deleteNote` (`src/hooks/use-notes.ts:69`) defensively double-locks: `.eq('id', noteId).eq('user_id', uid)` +
  RLS. Belt-and-suspenders, safe.
- `wines_localized` is a SECURITY INVOKER VIEW (`20260519000400_wines_localized_view.sql:6`) — inherits
  caller RLS. `wines` table is public-read (Live status filter in view), so `!inner` join always resolves for
  Live wines. Notes pointing to non-Live wines silently filter out — explicit guard at
  [noteId].tsx:154 handles this branch with EmptyState.

### 2. wines_localized VIEW ↔ WineHeaderLink shape (PASS)

VIEW columns (line 8~32 of `20260519000400_wines_localized_view.sql`):
`lwin, display_name, name_ko, producer_title, producer_name, wine, country, region, classification,
type_raw, type_canonical, bottle_color, drink_window_from_year, drink_window_peak_year,
drink_window_to_year, vintage, status`.

NoteWineHeaderLink Props (note-wine-header-link.tsx:32~42):
`lwin, display_name, name_ko, bottle_color, type_canonical, vintage, region, country, photoUrl?` —
ALL non-photoUrl fields are provided by the VIEW. `photoUrl` is intentionally undefined in v0.1.0 (no
wine_photos table) — graceful gradient fallback path.

[noteId].tsx:212~221 passes nullable fields explicitly with `?? null` (name_ko, bottle_color, type_canonical,
vintage, region, country). NoteWineHeaderLink:56~60 applies `getDefaultBottleColor(type_canonical)` when
bottle_color is null. `getLocalizedWineName` (WineNameDisplay) handles ko/en switching with display_name
fallback.

### 3. 기존 wines / wine_korean_names count diff 0 (PASS)

`git diff --stat supabase/` returns 0 — no migration / SQL touched in this cycle. wines, wine_korean_names,
wine_metadata, profiles, tasting_notes, cellar_items schemas unchanged.

### 4. ko/en 신규 키 양쪽 채움 + 영문 모드 한글 노출 X (PASS)

Diff counts:
- `git diff src/lib/i18n/ko.json | grep ^+ | wc -l` = 16 lines added
- `git diff src/lib/i18n/en.json | grep ^+ | wc -l` = 16 lines added (1:1 parity)

(Brief says "17 신규 키" — actual diff shows 16 new keys; viewWine was pre-existing. Net delta is identical 16
key pairs.)

New keys (both locales): `sectionMemo, sectionPalateBeginner, sectionWset, sectionStructure, sectionMouthfeel,
sectionFlavorNotes, sectionAromaWheel, sectionTimeline, sectionDrinkWindow, sectionFaults, sectionBuyAgain,
checkpoints, you, editAria, shareAria, deleteAria`.

All keys consumed by components verified present in BOTH ko + en:
`blindBadge, deleteAria, deleteCancel, deleteConfirm, deleteConfirmDesc, deleteConfirmTitle, deleteFailed,
editAria, modeBeginnerBadge, modeExpertBadge, noAroma, noComment, sectionAroma, sectionMemo,
sectionPalateBeginner, title, viewWine, you` (18 keys total used).

`grep -P "[가-힣]" en.json:410~425` → no Korean in en.json new block (§4-4 PASS).

### 5. dark/light dual definition — 신규 토큰 양쪽 (PASS with documented exception)

Typography (11 new): mode-invariant (font/size/leading) — no dual requirement.

Gradients (2 new):
- `notesDetailBottleThumbGradient` — explicit comment "양쪽 모드 모두 #1a0a1e 고정 (§10 E6 (a) — light에서도
  어두운 와인병 분위기 보존)". Intentional verbatim from keyscreen. Documented design decision.
- `noteAuthorAvatarGradient` — explicit comment "양쪽 모드 동일 (라이트에서도 어두운 음영 — keyscreen
  verbatim)". Same rationale; L1~L5 colors are intentionally darken-only (not a light-mode bug).

Per CLAUDE.md §4-9: dual-definition mandate is satisfied when rationale is documented. Both new gradients
have inline rationale citing keyscreen + design-spec section. PASS.

Brand tokens used in icons (Pencil cream, Trash2 wineRed, AlertCircle gold, Star/Calendar gold) — brand-fixed
group, explicitly theme-invariant per design-tokens.ts:9~23.

### 6. emoji grep (PASS)

`grep -P "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]"` across all 11 changed files → 0 matches.

### 7. 하드코딩 hex / rgba grep — 변경 파일 (PASS)

`grep -nE "#[0-9a-fA-F]{6}|rgba\("` across 7 component files (excl design-tokens.ts/tailwind.config.ts which
are the allowed token source) → 0 matches.

All colors flow through `brand.*`, `withAlpha()`, gradient factories. Inline-style `style={{ color: brand.gold }}`
+ `borderColor: brand.gold` etc are all token references.

### 8. SUPABASE_SERVICE_ROLE_KEY 격리 (PASS)

`grep -rnE "SUPABASE_SERVICE_ROLE_KEY" src/ app/` → only `src/lib/supabase.ts:9` (comment FORBIDDING import).
No actual usage. PASS.

### 9. LWIN 형식 — WineHeaderLink slug (PASS)

NoteWineHeaderLink:71 does `router.push(\`/wine/${encodeURIComponent(lwin)}\`)`. The `lwin` comes from
`note.wine.lwin` which is from `wines_localized!inner` — guaranteed to be a 7/11/13-digit valid lwin (FK to
wines.lwin). No client-side regex re-validation needed at this layer. `isValidLwin` regex
(`/^\d{7}$|^\d{11}$|^\d{13}$/`) lives in src/lib/lwin.ts and is the canonical guard.

[noteId].tsx:154 also guards: `if (!note || !note.wine?.lwin || ...)` — handles null lwin defensively.

### 10. OAuth 골격 호환 (PASS)

- `src/lib/auth/providers/{kakao,google,apple}.ts` all present (NotImplemented stubs).
- `src/lib/auth/link-identity.ts` present.
- `src/lib/supabase.ts` has `flowType: 'pkce'` and comment "v0.2.0 OAuth에 필요. anonymous에는 무해".
- `profiles` table contains `linked_providers, is_upgraded, email` columns (per `20260519000000_profiles.sql`
  — unchanged in this cycle).

Out-of-scope for this hardening (no auth-touching code changed), but baseline preserved.

### 11. profiles 트리거 변경 없음 (PASS)

`git diff --stat supabase/` → 0. profiles/handle_new_user trigger untouched. Anonymize SQL function untouched.

### 12. note-body-beginner/expert 변경 — 다른 화면 regression (PASS)

`grep -rnE "NoteBodyBeginner|NoteBodyExpert" app/ src/` shows imports ONLY in `app/notes/[noteId].tsx:28,29`
and exports from `src/components/notes/note-body-*.tsx`. Zero other callers.

write.tsx (`app/notes/new/write.tsx`) does NOT import these components — preview path is independent.
No cross-screen regression.

### 13. resolveMemo() expertFields.memo 안전 fallback — TS 컴파일 정상 (PASS)

resolveMemo (notes/[noteId].tsx:43~59):
- beginner branch: `(beginnerFields as { memo?: string } | null)?.memo` — typeof string check; falls back to
  legacy `comments` field via similar defensive cast. Safe.
- expert branch: `(expertFields as { memo?: string } | null)?.memo` — ExpertFields has NO `memo` field, so cast
  to `{ memo?: string }` always yields undefined for current shape. Returns empty string. Documented in code
  comment as "Expert memo는 v0.1.0 SCOPE-OUT". Safe — TS narrowing via `typeof === 'string'` guard.

`npx tsc --noEmit` shows zero errors in any of the changed files (pre-existing Deno + nativewind module errors
are unrelated infra issues).

### 14. 기존 pre-existing [noteId].tsx TS narrowing 에러 해결 (PASS)

The rewrite introduces an explicit guard at [noteId].tsx:154:
`if (!note || !note.wine?.lwin || !note.wine?.display_name) { return <EmptyState/> }`
followed by `const lwin = wine.lwin as string; const displayName = wine.display_name as string;`. This narrows
both fields to non-null before consumption by NoteWineHeaderLink (which requires `lwin: string` and
`display_name: string` non-optional). TS satisfied.

---

## Notes / Observations (non-blocking)

- **resolveMemo expert branch returns "" forever** in v0.1.0 — UI shows fallback "코멘트 없음" / "No comment".
  This is intentional per code comment + brief SCOPE-OUT, but acceptance criterion for v0.2.0 will need
  ExpertFields.memo schema addition + write.tsx UI + this resolver branch update.
- **NoteAuthorAvatar level prop** defaults to 'L1' since profiles.level_id is not yet in v0.1.0 (also
  SCOPE-OUT). All current notes will display L1 gradient — by design (§10 D3).
- **subParts join in NoteWineHeaderLink** uses non-localized region/country strings (English from wines
  table). v0.1.0 single-locale — wine table localization deferred. Acceptable per the inline comment at
  note-wine-header-link.tsx:17.
- Brief mentioned "17 신규 키" but diff shows 16 keys. Counted both files explicitly: 16 in each. Either the
  brief mis-counted or one key was duplicated/dropped. Cross-checked all keys consumed by components against
  both i18n files — all resolve. No functional impact.

---

## Summary

| # | Check | Result |
|---|---|---|
| 1 | RLS ↔ client call coherence | PASS |
| 2 | wines_localized ↔ WineHeaderLink shape | PASS |
| 3 | wines / wine_korean_names count diff 0 | PASS |
| 4 | ko/en parity + EN no-Korean | PASS |
| 5 | dark/light dual definition | PASS |
| 6 | emoji grep | PASS |
| 7 | hardcoded hex/rgba grep | PASS |
| 8 | SUPABASE_SERVICE_ROLE_KEY isolation | PASS |
| 9 | LWIN format | PASS |
| 10 | OAuth skeleton compatibility | PASS |
| 11 | profiles trigger unchanged | PASS |
| 12 | NoteBody* cross-screen regression | PASS |
| 13 | resolveMemo TS safety | PASS |
| 14 | [noteId].tsx narrowing resolution | PASS |

**Verdict: PASS — 14/14, 0 FAIL.** rn-screen-builder may proceed; release-engineer can include this
hardening in Day 7 EAS Build.
