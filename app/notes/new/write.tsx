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
import { useWine } from '@/hooks/use-wine';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { brand } from '@/lib/design-tokens';
import type { Database } from '@shared/types/database.types';

type NoteInsert = Database['public']['Tables']['tasting_notes']['Insert'];
type Source = 'cellar' | 'restaurant' | 'shop' | 'gift' | 'tasting_event' | 'other';

const LWIN_REGEX = /^\d{7}$|^\d{11}$|^\d{13}$/;
const SOURCES: ReadonlySet<Source> = new Set([
  'cellar',
  'restaurant',
  'shop',
  'gift',
  'tasting_event',
  'other',
]);

const todayIso = () => new Date().toISOString().slice(0, 10);

const BeginnerInputSchema = z.object({
  wset: z.object({
    sweetness: z.number().int().min(1).max(5),
    acidity: z.number().int().min(1).max(5),
    tannin: z.number().int().min(1).max(5),
    body: z.number().int().min(1).max(5),
  }),
  aroma_tags: z.array(z.string()),
  comments: z.string().max(5000),
});

const ExpertInputSchema = z.object({
  appearance: z.object({
    intensity: z.number().int().min(1).max(5),
    clarity: z.number().int().min(1).max(3),
    notes: z.string().max(2000),
  }),
  nose: z.object({
    intensity: z.number().int().min(1).max(5),
    development: z.number().int().min(1).max(3),
    aromas: z.string().max(2000),
  }),
  palate: z.object({
    sweetness: z.number().int().min(1).max(5),
    acidity: z.number().int().min(1).max(5),
    tannin: z.number().int().min(1).max(5),
    alcohol: z.number().int().min(1).max(5),
    body: z.number().int().min(1).max(5),
    flavor: z.number().int().min(1).max(5),
    finish: z.number().int().min(1).max(5),
  }),
  conclusions: z.object({
    quality: z.number().int().min(1).max(5),
    readiness: z.enum(['tooYoung', 'drink', 'pastPeak']),
    estimated_price_krw: z.number().int().min(0).nullable(),
  }),
  blind: z.boolean(),
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
  }>();
  const wineLwin = typeof params.wine_lwin === 'string' && LWIN_REGEX.test(params.wine_lwin)
    ? params.wine_lwin
    : null;
  const sourceParam =
    typeof params.source === 'string' && SOURCES.has(params.source as Source)
      ? (params.source as Source)
      : null;
  const photoUrl = typeof params.photo_url === 'string' && params.photo_url.length > 0
    ? params.photo_url
    : null;

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

  // Sync default mode from profile when it loads.
  useEffect(() => {
    if (profileLoading) return;
    const exp = profile?.experience;
    if (exp === 'expert' || exp === 'beginner') setMode(exp);
  }, [profile?.experience, profileLoading]);

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
      source: sourceParam ?? undefined,
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
    sourceParam,
    beginnerFields,
    expertFields,
    photoUrl,
    flashToast,
    t,
  ]);

  const headerRight = useMemo(
    () => (
      <Pressable
        onPress={submit}
        disabled={saving || !wineLwin}
        accessibilityRole="button"
        accessibilityLabel={t('notes.writeForm.save')}
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

          <View className="mt-4">
            {mode === 'beginner' ? (
              <BeginnerForm
                rating={rating}
                onRatingChange={onRatingChange}
                tastedAt={tastedAt}
                onTastedAtChange={onTastedAtChange}
                fields={beginnerFields}
                onFieldsChange={onBeginnerChange}
              />
            ) : (
              <ExpertForm
                rating={rating}
                onRatingChange={onRatingChange}
                tastedAt={tastedAt}
                onTastedAtChange={onTastedAtChange}
                fields={expertFields}
                onFieldsChange={onExpertChange}
              />
            )}
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

