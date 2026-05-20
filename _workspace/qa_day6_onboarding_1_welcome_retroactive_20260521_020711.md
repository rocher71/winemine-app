# QA — /onboarding/1-welcome retroactive hardening (Day 6)

- Timestamp: 2026-05-21 02:07:11
- Scope (uncommitted): `app/onboarding/1-welcome.tsx` (rewrite) + `src/components/onboarding/welcome-glass-glow.tsx` (new) + `src/lib/i18n/{ko,en}.json` (added `onboarding.tagline`)
- SCOPE-OUT: Day 6 settings / BottomNav / AppHeader
- Verdict: **PASS** (13/13)
- FAIL count: **0**

---

## Checklist

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | RLS ↔ client | PASS (N/A) | In-scope files have zero `supabase.from()` / DB refs (grep on welcome.tsx + welcome-glass-glow.tsx = NO_DOMAIN_REFS). |
| 2 | wines_localized VIEW shape ↔ hook | PASS (N/A) | No VIEW touch — purely presentational welcome screen. |
| 3 | wines / wine_korean_names count diff 0 | PASS (N/A) | `git status supabase/` clean — no migration changes in this slice. |
| 4 | ko/en tagline filled + no KO in EN render | PASS | ko.json L65 `"tagline": "한 잔의 와인, 한 점의 지도"`; en.json L65 `"tagline": "A glass of wine, a pin on the map"`. EN-mode korean grep on en.json only flags `language.ko` / `settings.values.ko` self-names (intentional, not rendered on welcome). welcome.tsx renders `onboarding.tagline` + `onboarding.welcome.cta` only — both have EN values. |
| 5 | dark/light dual definition (new component) | PASS | welcome-glass-glow uses only `brand.cream` / `brand.wineRed` / `brand.gold` / `brand.black` via `withAlpha()` from `src/lib/design-tokens.ts` (verified exports at lines 10 + 296). welcome.tsx uses semantic NativeWind classes `bg-bg-deepest` / `text-cream` / `text-gold` (auto dual via tailwind tokens). No hex literals at runtime. |
| 6 | emoji + U+FE0F grep | PASS | Python regex emoji scan = 0 matches in both files. |
| 7 | hardcoded hex / rgba grep | PASS | welcome.tsx: 0 hits. welcome-glass-glow.tsx: 3 `rgba(...)` hits but ALL inside JSDoc comment block (lines 7–9, documenting the keyscreen verbatim source). Runtime gradient stops use `withAlpha(brand.cream, 0.18)` etc. — token-mediated. i18n JSONs: 0 hits. |
| 8 | SUPABASE_SERVICE_ROLE_KEY isolation | PASS | grep on all 4 in-scope files = NO_SERVICE_ROLE_KEY. |
| 9 | LWIN format | PASS (N/A) | Unrelated to welcome screen. |
| 10 | OAuth skeleton | PASS (N/A) | Unchanged. |
| 11 | profiles trigger | PASS (N/A) | Unchanged. |
| 12 | `onboarding.welcome.title` / `onboarding.welcome.subtitle` key usage grep | PASS | Repo-wide grep across `app/` + `src/` (excluding i18n JSONs) = NO_USAGE_FOUND. Keys live only as orphan strings inside ko.json L67–68 + en.json L67–68. Safe to leave; safe to remove later. Welcome screen uses neither — it now renders only `onboarding.tagline` + `onboarding.welcome.cta`. |
| 13 | Reanimated FadeIn import sanity | PASS | welcome.tsx L24: `import Animated, { FadeIn } from 'react-native-reanimated';` — matches package.json L46 `"react-native-reanimated": "~4.1.1"`. Usages at L54/L62/L69/L76 are all `FadeIn.delay(n).duration(400)` (valid v4 entering API). |

---

## Notes

- The 3 `rgba()` strings in `welcome-glass-glow.tsx` are documentation only — they appear inside a JSDoc block describing the original keyscreen source-of-truth for the radial gradient. Runtime gradient stops are computed via `withAlpha(brand.cream, 0.18)` / `withAlpha(brand.wineRed, 0.18)` / `withAlpha(brand.black, 0)`, so the §4-9 dual-token rule is satisfied.
- Orphan keys `onboarding.welcome.title` + `onboarding.welcome.subtitle` are unused anywhere in `app/` or `src/` outside the JSON files themselves. Leaving them is non-blocking; a future cleanup commit could prune them.
- `language.ko` / `settings.values.ko` retain Korean literal `한국어` in en.json — this is the intentional self-name pattern for the language selector and is unrelated to the welcome screen render path.

---

## Report

- Path: `_workspace/qa_day6_onboarding_1_welcome_retroactive_20260521_020711.md`
- Status: **PASS** — proceed to commit.
