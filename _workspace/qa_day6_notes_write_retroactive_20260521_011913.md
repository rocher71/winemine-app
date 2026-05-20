# QA Day 6 — /notes/new/write Retroactive Hardening 통합 정합성 게이트

- **작성**: 2026-05-21 01:19:13 KST
- **검증자**: qa-inspector
- **대상 변경**: app/notes/new/write.tsx (재작성) · src/components/notes/{step-header,beginner-header,impression-triad,palate-triad,aroma-grid,finish-triad,auto-summary-card,price-capture,share-to-community,save-pill,beginner-form,expert-form,note-body-beginner}.tsx · src/components/wine/my-tasting-note-card.tsx · src/lib/notes/summarize.ts · src/lib/design-tokens.ts · tailwind.config.ts · src/lib/i18n/{ko,en}.json
- **SCOPE-OUT** (사용자 지정): Day 6 settings 3 sub · settings hub · (tabs)/settings/_layout · BottomNav · tasting_notes.is_public 컬럼 (supabase-engineer) · XP / Expert 7-step / VariantTabs / DynamicTemplateForm (v0.2.0) · iOS vs Android italic 렌더 (Day 7 EAS)
- **사양**: `_workspace/design-specs/notes-write.md` (1006 LOC, design-spec-author Day 6 retroactive)

## 최종 결과

**PASS — FAIL 0건 / WARN 1건**

| # | 항목 | 결과 | 비고 |
|---|---|---|---|
| 1 | RLS ↔ 클라이언트 호출 교차 | PASS | `tasting_notes_all_own` USING/WITH CHECK = `user_id = auth.uid()`. payload.user_id = uid (write.tsx:282) |
| 2 | wines_localized VIEW ↔ Hero/MetaCard shape 영향 | PASS | 본 hardening은 노트 작성 UI만 변경 — wine VIEW 사용처는 WineLinkCard·BeginnerHeader (모두 wine?.name_ko ?? display_name fallback) |
| 3 | 기존 wines / wine_korean_names count diff 0 | PASS | migrations/ 변경 없음. wines / wine_korean_names를 touch하는 ALTER/DROP 0건 |
| 4 | ko/en 신규 키 양쪽 채움 + 영문 모드 한글 노출 X | PASS | ko/en 각 755 lines 동일. writeForm.* 신규 16개 + beginnerStep.* 9개 + palateDim/palateLevel/finishLevel/aromaCard.* 18개 모두 mirror. en.json 한글 노출은 language-picker 자기언어 표기 2건만 (의도) |
| 5 | dark/light dual definition — 신규 토큰 | PASS | typography 5개(beginnerEyebrow/beginnerGreeting/stepHeaderBadge/summaryEyebrow/summaryText) 모두 brand-fixed (테마 무관). 사용처 컴포넌트는 light/dark 양쪽 분기 (useThemeTokens) |
| 6 | emoji + variation selector grep | PASS | 13 신규/수정 파일 + design-tokens.ts + tailwind.config.ts + ko/en JSON 0건 |
| 7 | 하드코딩 hex/rgba grep — 변경 파일 | PASS | 컴포넌트 코드 0건. beginner-form.tsx:77의 `#1A0A1E`/`#F2EAD9`는 토큰값을 설명하는 주석 |
| 8 | SUPABASE_SERVICE_ROLE_KEY 격리 | PASS | src/, app/에서 0건 (src/lib/supabase.ts:9는 import 금지를 명시하는 주석) |
| 9 | LWIN 형식 — write 시 wine_lwin 처리 | PASS | write.tsx:64 `LWIN_REGEX = /^\d{7}$\|^\d{11}$\|^\d{13}$/` · params/payload 양쪽 검증 (line 155, 128) |
| 10 | OAuth 골격 호환 | PASS | src/lib/auth/ 미수정 · profiles/database.types.ts 미수정 |
| 11 | profiles 트리거 변경 없음 | PASS | supabase/migrations/20260519000000_profiles.sql 미수정 |
| 12 | BUILTIN_BEGINNER/EXPERT mapping ↔ tasting_notes.source enum | PASS | write.tsx:174~179 from→source 매핑은 'cellar'/'other' 둘 다 DB CHECK enum에 포함 (`'cellar','restaurant','shop','gift','tasting_event','other'`). templateId는 UI mode 초기화 전용 (DB column 부재) |
| 13 | tasting_notes.tasting_data jsonb shape — BeginnerForm 6-Step 입력 무결 | PASS | DB column명은 `beginner_fields`/`expert_fields` (jsonb 자유 schema). zod BeginnerInputSchema (write.tsx:78~97) ↔ BeginnerFields type (beginner-form.tsx:56~64) ↔ BeginnerForm component props 모두 일치 |
| 14 | zod schema ↔ 컴포넌트 일관 | PASS | PalateLevel `'low'\|'mid'\|'high'` · AromaTag 8개 · FinishLevel 3개 · ImpressionValue 3개 — zod enum과 component type literal 완전 일치 |
| 15 | my-tasting-note-card → wine-detail regression | PASS | readDim() 신규 palate shape + legacy wset shape + top-level fallback 3중. shortWsetValue() 신규 'low/mid/high' + legacy 'medium-/medium/medium+' + Expert 1~5 numeric 모두 처리 |

### WARN

| # | 항목 | 결과 | 비고 |
|---|---|---|---|
| W1 | ShareToCommunity insert payload omit | WARN | write.tsx:297 TODO 주석으로 명시. UI 토글만 동작 (DB는 무시) — design-spec §10 E16 + 사용자 지시 SCOPE-OUT과 일관. v0.2.0에서 is_public 컬럼 추가 + RLS 정책 확장 필요. **현재는 의도된 동작 — 사용자 SCOPE-OUT과 일치하므로 FAIL 아님** |

## 부가 검증

### A. ko/en mirror line count

```
755 src/lib/i18n/ko.json
755 src/lib/i18n/en.json
```

JSON.parse 양쪽 OK.

### B. Typography 토큰 5개 추가 — dual sync 확인

design-tokens.ts (459~463):
- `beginnerEyebrow` Inter_500Medium 11 lh11 ls1.76 uppercase
- `beginnerGreeting` Inter_400Regular 12 lh18
- `stepHeaderBadge` Inter_700Bold 11 lh13.2
- `summaryEyebrow` Inter_400Regular 11 lh11 ls1.1 uppercase
- `summaryText` PlayfairDisplay_400Regular 13 lh19.5 italic

tailwind.config.ts (159~163) — 같은 5개 NW v4 키로 mirror:
- `beginner-eyebrow` / `beginner-greeting` / `step-header-badge` / `summary-eyebrow` / `summary-text`

NW 키 사용은 모든 컴포넌트가 인라인 style 우선이라 mirror는 미사용 (장래 확장용). 양쪽 모두 추가되어 정합성 통과.

### C. zod ↔ TS ↔ jsonb 3-way 정합성

write.tsx BeginnerInputSchema:
```ts
{
  impression: 'star' | 'smile' | 'thinking',
  palate: { sweetness/acidity/body: 'low'|'mid'|'high', tannin?: ..., bubble?: ... },
  aromas: ('berry'|'citrus'|'stoneFruit'|'floral'|'spice'|'sweet'|'earth'|'yeast')[],
  finish: 'short'|'medium'|'long',
  memo: string (max 5000),
  priceCapture?: { enabled: boolean, krw: number\|null },
  shareToCommunity?: boolean
}
```

= beginner-form.tsx BeginnerFields type = ImpressionValue ∪ PalateState ∪ AromaTag[] ∪ FinishLevel ∪ string ∪ PriceCaptureState? ∪ boolean? — 완전 일치.

DB `beginner_fields jsonb` (tasting_notes.sql:10)에는 schema 제약 없음 — 위 shape가 그대로 직렬화되어 저장된다. 단, write.tsx:288~291 insert 시 `priceCapture` / `shareToCommunity`는 zod 통과 후 그대로 jsonb로 들어감. detail 화면 (note-body-beginner.tsx)은 legacy(wset/aroma_tags/comments) fallback도 처리 — 과거 Day 5 노트와도 호환.

### D. RLS 호환성

- `tasting_notes` 정책 `tasting_notes_all_own`: USING `user_id = auth.uid()` WITH CHECK 동일
- write.tsx submit: `payload.user_id = uid` (getCurrentUserId() 결과) → INSERT WITH CHECK 통과
- 다른 사용자의 노트 조회·수정 불가 — UI는 본인 노트 작성만 함

### E. my-tasting-note-card.tsx wine-detail regression check

- 기존 Day 5 노트 (`beginner_fields = { wset: {sweetness:n, acidity:n, ...}, aroma_tags: [], comments: '' }`) → `readDim()` line 58~63 legacy fallback 분기로 처리. `shortWsetValue()` line 76~81 'medium-/medium/medium+' 매핑 유지.
- 신규 Day 6 노트 (`beginner_fields = { palate: {sweetness:'low'|'mid'|'high', ...}, aromas: [...], memo: '' }`) → line 52~56 palate 우선 읽기. `shortWsetValue()` line 73~75 'low'/'mid'/'high' → palateLevel.* 매핑.
- Expert 노트 (`expert_fields.palate.{sweetness/acidity/tannin/body}: 1~5`) → palate 우선 분기 + line 83 numeric fall-through.

3가지 shape 모두 처리. wine-detail에서의 회귀 없음.

### F. SUPABASE_PATTERNS 준수

- `supabase.from('tasting_notes').insert(payload).select('id').single()` → CLAUDE.md §3, Plan D §4-8 (TS code 작게) 준수
- Edge Function 호출 없음
- Service role key 사용 없음

## 권장 후속 (SCOPE-OUT 항목)

1. **W1 해소** — supabase-engineer가 `alter table tasting_notes add column is_public boolean default false` 추가 + RLS select 정책 확장 (`auth.uid() = user_id OR is_public = true`). 그 후 write.tsx:297 TODO 제거하고 payload에 `is_public: shareToCommunity` 추가.
2. **iOS vs Android italic 렌더** (auto-summary-card Playfair italic) — Day 7 EAS preview 빌드에서 양쪽 확인.

## 변경 미발견 — 이 retroactive와 무관

- profiles 트리거, OAuth skeleton, wines_localized VIEW, Storage 정책, Edge Function, anonymize 함수 — 모두 미수정. 변경 0건 확인.

---

**최종 판정: PASS — FAIL 0 / WARN 1 (의도된 SCOPE-OUT)**
