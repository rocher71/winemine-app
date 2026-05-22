/**
 * /notes/new/write — 테이스팅 노트 작성 (Beginner 6-step / Expert 5-section).
 *
 * 사양: design-spec notes-write.md.
 * Day 6 retroactive hardening:
 *   - BeginnerForm 6 Step verbatim (재작성됨)
 *   - templateId / from / itemId query 처리 (§12-3)
 *   - submitting 시 disabled (§10 E7)
 *   - header SaveBtn + footer SavePill 둘 다 (§10 E8)
 *   - BeginnerFields shape 변경 (impression/palate/aromas/finish/memo/priceCapture?/shareToCommunity?)
 *
 * Query (현재 RN keep + 신규 추가):
 *   wine_lwin?  — LWIN 7|11|13
 *   source?     — cellar/restaurant/shop/gift/tasting_event/other (DB enum)
 *   photo_url?  — Storage path
 *   templateId? — builtin-beginner / builtin-expert (UI mode 초기화)
 *   from?       — cellar/newEntry/draft (keyscreen 호환, → source mapping)
 *   itemId?     — cellar_items.id (from=cellar 시)
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { BackHeader } from '@/components/nav/back-header';
import { Toast } from '@/components/shared/toast';
import { WineLinkCard } from '@/components/notes/wine-link-card';
import { ModeToggle, type NoteMode } from '@/components/notes/mode-toggle';
import {
  BeginnerForm,
  defaultBeginnerFields,
  type BeginnerFields,
} from '@/components/notes/beginner-form';
import {
  ExpertForm,
  defaultExpertFields,
  type ExpertFields,
} from '@/components/notes/expert-form';
import { SavePill } from '@/components/notes/save-pill';
import { useWine } from '@/hooks/use-wine';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { brand } from '@/lib/design-tokens';
import {
  BUILTIN_BEGINNER_ID,
  BUILTIN_EXPERT_ID,
} from '@/lib/notes/builtin-templates';
import type { Database } from '@shared/types/database.types';

type NoteInsert = Database['public']['Tables']['tasting_notes']['Insert'];
type Source = 'cellar' | 'restaurant' | 'shop' | 'gift' | 'tasting_event' | 'other';
type FromQuery = 'cellar' | 'newEntry' | 'draft';

const LWIN_REGEX = /^\d{7}$|^\d{11}$|^\d{13}$/;
const SOURCES: ReadonlySet<Source> = new Set([
  'cellar',
  'restaurant',
  'shop',
  'gift',
  'tasting_event',
  'other',
]);
const FROM_VALUES: ReadonlySet<FromQuery> = new Set(['cellar', 'newEntry', 'draft']);

const todayIso = () => new Date().toISOString().slice(0, 10);

// ---- BeginnerFields zod (E10 신규 shape — palate {level} + aromas[] + impression + finish + memo + price + share) ----
const PalateLevelSchema = z.enum(['low', 'mid', 'high']);
const BeginnerInputSchema = z.object({
  impression: z.enum(['star', 'smile', 'thinking']),
  palate: z.object({
    sweetness: PalateLevelSchema,
    acidity: PalateLevelSchema,
    body: PalateLevelSchema,
    tannin: PalateLevelSchema.optional(),
    bubble: PalateLevelSchema.optional(),
  }),
  aromas: z.array(
    z.enum(['berry', 'citrus', 'stoneFruit', 'floral', 'spice', 'sweet', 'earth', 'yeast']),
  ),
  finish: z.enum(['short', 'medium', 'long']),
  memo: z.string().max(5000),
  priceCapture: z
    .object({ enabled: z.boolean(), krw: z.number().int().min(0).nullable() })
    .optional(),
  shareToCommunity: z.boolean().optional(),
});

// ---- New canonical Expert shape (keyscreen-aligned 7-step) ----
const ExpertVariantSchema = z.enum(['white', 'red', 'sparkling', 'blind']);
const ReadinessSchema = z.enum(['tooYoung', 'drink', 'pastPeak']);
const FinishSchema = z.enum(['short', 'medium', 'long']);
const AromaTagSchema = z.enum([
  'berry',
  'citrus',
  'stoneFruit',
  'floral',
  'spice',
  'sweet',
  'earth',
  'yeast',
]);
const WSETNumSchema = z.number().int().min(1).max(5);

const ExpertPalateSchema = z.object({
  sweetness: WSETNumSchema,
  acidity: WSETNumSchema,
  body: WSETNumSchema,
  alcohol: WSETNumSchema,
  flavor_intensity: WSETNumSchema,
  tannin: WSETNumSchema.optional(),
  bubble: WSETNumSchema.optional(),
});

const ExpertInputSchema = z.object({
  variant: ExpertVariantSchema,
  blind: z.boolean(),
  aroma_intensity: WSETNumSchema,
  aromas: z.array(AromaTagSchema),
  palate: ExpertPalateSchema,
  finish: FinishSchema,
  quality: WSETNumSchema,
  readiness: ReadinessSchema,
  estimated_price_krw: z.number().int().min(0).nullable(),
  would_buy_again: z.boolean(),
  memo: z.string().max(5000),
  priceCapture: z
    .object({ enabled: z.boolean(), krw: z.number().int().min(0).nullable() })
    .optional(),
  shareToCommunity: z.boolean().optional(),
});

const NoteInputSchema = z.object({
  wine_lwin: z.string().regex(LWIN_REGEX),
  mode: z.enum(['beginner', 'expert']),
  rating: z.number().min(0).max(5).multipleOf(0.5).optional(),
  tasted_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((d) => new Date(d) <= new Date(), 'not future'),
  source: z
    .enum(['cellar', 'restaurant', 'shop', 'gift', 'tasting_event', 'other'])
    .optional(),
  beginner_fields: BeginnerInputSchema.optional(),
  expert_fields: ExpertInputSchema.optional(),
  photo_url: z.string().optional(),
});

export default function NoteWriteScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    wine_lwin?: string;
    source?: string;
    photo_url?: string;
    // 신규 (§12-3 — keyscreen 호환 v0.1.0)
    templateId?: string;
    from?: string;
    itemId?: string;
  }>();
  const wineLwin =
    typeof params.wine_lwin === 'string' && LWIN_REGEX.test(params.wine_lwin)
      ? params.wine_lwin
      : null;
  const sourceParamRaw =
    typeof params.source === 'string' && SOURCES.has(params.source as Source)
      ? (params.source as Source)
      : null;
  const photoUrl =
    typeof params.photo_url === 'string' && params.photo_url.length > 0
      ? params.photo_url
      : null;
  const templateIdParam =
    typeof params.templateId === 'string' ? decodeURIComponent(params.templateId) : null;
  const fromParam =
    typeof params.from === 'string' && FROM_VALUES.has(params.from as FromQuery)
      ? (params.from as FromQuery)
      : null;

  // from → source fallback mapping (§12-3)
  const effectiveSource = useMemo<Source | null>(() => {
    if (sourceParamRaw) return sourceParamRaw;
    if (fromParam === 'cellar') return 'cellar';
    if (fromParam === 'newEntry') return 'other';
    return null;
  }, [sourceParamRaw, fromParam]);

  const { wine, loading: wineLoading } = useWine(wineLwin);
  const { profile, loading: profileLoading } = useProfile();

  const [mode, setMode] = useState<NoteMode>('beginner');
  const [rating, setRating] = useState(0);
  const [tastedAt, setTastedAt] = useState(todayIso());
  const [beginnerFields, setBeginnerFields] = useState<BeginnerFields>(defaultBeginnerFields());
  const [expertFields, setExpertFields] = useState<ExpertFields>(defaultExpertFields());
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  // mode 초기화 — templateId 우선, 다음 profile.experience.
  useEffect(() => {
    if (profileLoading) return;
    if (templateIdParam === BUILTIN_EXPERT_ID) {
      setMode('expert');
      return;
    }
    if (templateIdParam === BUILTIN_BEGINNER_ID) {
      setMode('beginner');
      return;
    }
    const exp = profile?.experience;
    if (exp === 'expert' || exp === 'beginner') setMode(exp);
    // mount + templateIdParam/profile.experience 변경 시만 — touched flag와 무관.
  }, [templateIdParam, profile?.experience, profileLoading]);

  const flashToast = useCallback((tone: 'success' | 'error', message: string) => {
    setToast({ tone, message });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const markTouched = useCallback(() => setTouched(true), []);

  const onRatingChange = (v: number) => {
    setRating(v);
    markTouched();
  };
  const onTastedAtChange = (v: string) => {
    setTastedAt(v);
    markTouched();
  };
  const onBeginnerChange = (f: BeginnerFields) => {
    setBeginnerFields(f);
    markTouched();
  };
  const onExpertChange = (f: ExpertFields) => {
    setExpertFields(f);
    markTouched();
  };
  const onModeChange = (m: NoteMode) => {
    setMode(m);
    markTouched();
  };

  const confirmDiscard = useCallback(() => {
    if (!touched) {
      router.back();
      return;
    }
    Alert.alert(
      t('notes.writeForm.unsavedTitle'),
      t('notes.writeForm.unsavedDesc'),
      [
        { text: t('notes.writeForm.unsavedCancel'), style: 'cancel' },
        {
          text: t('notes.writeForm.unsavedDiscard'),
          style: 'destructive',
          onPress: () => router.back(),
        },
      ],
      { cancelable: true },
    );
  }, [touched, t]);

  const submit = useCallback(async () => {
    if (!wineLwin) {
      flashToast('error', t('notes.writeForm.wineLinkEmpty'));
      return;
    }
    const input = {
      wine_lwin: wineLwin,
      mode,
      rating: rating > 0 ? rating : undefined,
      tasted_at: tastedAt,
      source: effectiveSource ?? undefined,
      beginner_fields: mode === 'beginner' ? beginnerFields : undefined,
      expert_fields: mode === 'expert' ? expertFields : undefined,
      photo_url: photoUrl ?? undefined,
    };
    const parsed = NoteInputSchema.safeParse(input);
    if (!parsed.success) {
      flashToast('error', t('notes.writeForm.validationFailed'));
      return;
    }
    setSaving(true);
    try {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('no session');
      const payload: NoteInsert = {
        user_id: uid,
        wine_lwin: parsed.data.wine_lwin,
        mode: parsed.data.mode,
        tasted_at: parsed.data.tasted_at,
        rating: parsed.data.rating ?? null,
        source: parsed.data.source ?? null,
        beginner_fields:
          parsed.data.beginner_fields !== undefined
            ? (parsed.data.beginner_fields as unknown as NoteInsert['beginner_fields'])
            : null,
        expert_fields:
          parsed.data.expert_fields !== undefined
            ? (parsed.data.expert_fields as unknown as NoteInsert['expert_fields'])
            : null,
        photo_url: parsed.data.photo_url ?? null,
        // TODO(v0.2.0 supabase-engineer): is_public 컬럼 도입 시 payload.is_public = beginnerFields.shareToCommunity.
      };
      const { data, error } = await supabase
        .from('tasting_notes')
        .insert(payload)
        .select('id')
        .single();
      if (error) throw error;
      if (!data?.id) throw new Error('no id returned');
      setTouched(false);
      router.replace(`/notes/${encodeURIComponent(data.id)}`);
    } catch (err) {
      console.warn('[note write] insert failed:', err);
      flashToast('error', t('notes.writeForm.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [
    wineLwin,
    mode,
    rating,
    tastedAt,
    effectiveSource,
    beginnerFields,
    expertFields,
    photoUrl,
    flashToast,
    t,
  ]);

  // header right Save text — keep (footer SavePill과 동일 onPress).
  const headerRight = useMemo(
    () => (
      <Pressable
        onPress={submit}
        disabled={saving || !wineLwin}
        accessibilityRole="button"
        accessibilityLabel={t('notes.writeForm.save')}
        accessibilityHint={t('notes.writeForm.saveHint')}
        accessibilityState={{ disabled: !wineLwin, busy: saving }}
        hitSlop={10}
        className="px-3 py-2"
      >
        {saving ? (
          <ActivityIndicator color={brand.gold} />
        ) : (
          <Text
            className={`font-inter-semibold text-card-body ${!wineLwin ? 'text-text-disabled dark:text-text-disabled' : 'text-gold'}`}
          >
            {t('notes.writeForm.save')}
          </Text>
        )}
      </Pressable>
    ),
    [submit, saving, wineLwin, t],
  );

  // submitting 시 입력 차단 (§10 E7). 더블 submit 방지.
  const inputBlock = saving;

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={t('notes.write')} onBack={confirmDiscard} right={headerRight} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {wineLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator color={brand.gold} />
            </View>
          ) : (
            <WineLinkCard wine={wine} />
          )}

          <View className="mt-4">
            <ModeToggle value={mode} onChange={onModeChange} />
          </View>

          <View
            className="mt-4"
            pointerEvents={inputBlock ? 'none' : 'auto'}
            style={{ opacity: inputBlock ? 0.7 : 1 }}
          >
            {mode === 'beginner' ? (
              <BeginnerForm
                wine={wine}
                rating={rating}
                onRatingChange={onRatingChange}
                fields={beginnerFields}
                onFieldsChange={onBeginnerChange}
              />
            ) : (
              <ExpertForm
                wine={wine}
                rating={rating}
                onRatingChange={onRatingChange}
                tastedAt={tastedAt}
                onTastedAtChange={onTastedAtChange}
                fields={expertFields}
                onFieldsChange={onExpertChange}
              />
            )}
          </View>

          {/* Footer Save pill (§10 E8 — header SaveBtn과 동일 onPress) */}
          <View className="mt-5">
            <SavePill onPress={submit} disabled={!wineLwin} saving={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {toast ? (
        <View className="absolute bottom-6 left-4 right-4">
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </View>
  );
}
