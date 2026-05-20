/**
 * Builtin tasting note templates (v0.1.0).
 *
 * 사양: design-spec notes-new.md §10-2, §13 (Option A 채택). v0.1.0 SCOPE-OUT:
 * community/custom templates는 v0.2.0 (Plan D §4-8, TS code 작게).
 *
 * 진실 소스: keyscreen src/lib/mock/tasting-templates.ts의 BUILTIN_BEGINNER + BUILTIN_EXPERT.
 *
 * Mapping to tasting_notes.template_id (UI state only v0.1.0):
 *   - 'builtin-beginner' → write 화면에서 mode='beginner' + BeginnerForm
 *   - 'builtin-expert'   → write 화면에서 mode='expert' + ExpertForm
 *
 * TODO(v0.2.0 supabase): tasting_notes.template_id 컬럼 추가 + community/custom 지원.
 */

export const BUILTIN_BEGINNER_ID = 'builtin-beginner' as const;
export const BUILTIN_EXPERT_ID = 'builtin-expert' as const;

export type BuiltinTemplateId = typeof BUILTIN_BEGINNER_ID | typeof BUILTIN_EXPERT_ID;

export type TemplateKind = 'builtinBeginner' | 'builtinExpert' | 'custom';

export interface BuiltinTemplate {
  id: BuiltinTemplateId;
  kind: TemplateKind;
  titleKey: string;   // i18n key — notesNew.builtinTemplate.{beginnerTitle|expertTitle}
  descKey: string;    // i18n key — notesNew.builtinTemplate.{beginnerDesc|expertDesc}
  /** mapped to write 화면 mode toggle */
  mode: 'beginner' | 'expert';
}

export const BUILTIN_TEMPLATES: readonly BuiltinTemplate[] = [
  {
    id: BUILTIN_BEGINNER_ID,
    kind: 'builtinBeginner',
    titleKey: 'notesNew.builtinTemplate.beginnerTitle',
    descKey: 'notesNew.builtinTemplate.beginnerDesc',
    mode: 'beginner',
  },
  {
    id: BUILTIN_EXPERT_ID,
    kind: 'builtinExpert',
    titleKey: 'notesNew.builtinTemplate.expertTitle',
    descKey: 'notesNew.builtinTemplate.expertDesc',
    mode: 'expert',
  },
] as const;

/**
 * 진입 source (Option A keyscreen verbatim): 'cellar' | 'newEntry'.
 *
 * v0.1.0 tasting_notes.source_type enum 기존 6값 (cellar/restaurant/shop/gift/tasting_event/other).
 * Option A에서는 newEntry를 어떻게 매핑할지 결정 필요.
 *
 * Mapping (UI source → DB source_type):
 *   - 'cellar'   → 'cellar'  (기존 enum 그대로)
 *   - 'newEntry' → 'other'   (가장 중립적 fallback — supabase-engineer가 결정 X scope-out)
 *
 * TODO(v0.2.0 supabase): source_type enum을 ('cellar' | 'new_entry') 2값으로 축소 또는
 *   newEntry sub-source 선택 (restaurant/shop/gift/tasting_event/other) 분기 추가.
 */
export type NoteSourceUi = 'cellar' | 'newEntry';

export type NoteSourceDb = 'cellar' | 'restaurant' | 'shop' | 'gift' | 'tasting_event' | 'other';

export function mapSourceUiToDb(ui: NoteSourceUi): NoteSourceDb {
  return ui === 'cellar' ? 'cellar' : 'other';
}
