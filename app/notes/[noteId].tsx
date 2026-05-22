/**
 * Notes detail screen — `/notes/[noteId]` (mine only).
 *
 * 사양: design-spec notes-detail.md (Day 6 retroactive hardening).
 * 1차 review FAIL 6/6 해결:
 *   - WineHero 88×290 hero → NoteWineHeaderLink 컴팩트 44×64 (§10 E1 (a))
 *   - 메타 strip → NoteAuthorCard (gold border, avatar + name + chip row) (§2-3)
 *   - MemoCard mode 무관 공통 (§10 E3 (a)) — Body 컴포넌트의 Comment Section 제거
 *   - BackHeader right slot Edit + Delete (Share 보류 §10 E7)
 *   - 하단 "이 와인 보기" CTA 제거 (NoteWineHeaderLink가 대체)
 *   - 카드 vertical gap 통일 (mt-4 = 16) / ScrollView paddingBottom 40 / DateChip uppercase 제거 / radius 14
 */
import { useCallback, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Trash2, Pencil } from 'lucide-react-native';
import { BackHeader } from '@/components/nav/back-header';
import { PrimaryButton } from '@/components/shared/primary-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Toast } from '@/components/shared/toast';
import { NoteBodyBeginner } from '@/components/notes/note-body-beginner';
import { NoteBodyExpert } from '@/components/notes/note-body-expert';
import { NoteWineHeaderLink } from '@/components/notes/note-wine-header-link';
import { NoteAuthorCard } from '@/components/notes/note-author-card';
import { NoteMemoCard } from '@/components/notes/note-memo-card';
import { useNote, deleteNote } from '@/hooks/use-notes';
import { useProfile } from '@/hooks/use-profile';
import { brand } from '@/lib/design-tokens';
import {
  BUILTIN_BEGINNER_ID,
  BUILTIN_EXPERT_ID,
} from '@/lib/notes/builtin-templates';
import type { BeginnerFields } from '@/components/notes/beginner-form';
import type { ExpertFields } from '@/components/notes/expert-form';

function resolveMemo(
  mode: 'beginner' | 'expert',
  beginnerFields: BeginnerFields | null,
  expertFields: ExpertFields | null,
): string {
  if (mode === 'beginner') {
    // 신규 beginnerFields.memo (Day 6) — fallback legacy comments.
    const fromNew = (beginnerFields as { memo?: string } | null)?.memo;
    if (typeof fromNew === 'string') return fromNew;
    const fromLegacy = (beginnerFields as { comments?: string } | null)?.comments;
    return typeof fromLegacy === 'string' ? fromLegacy : '';
  }
  // Expert memo는 새 shape에서 fields.memo로 노출됨. legacy(appearance.notes/nose.aromas)는 별도 카드.
  const expertMemo = (expertFields as { memo?: string } | null)?.memo;
  return typeof expertMemo === 'string' ? expertMemo : '';
}

export default function NoteDetailScreen() {
  const { noteId: noteIdParam } = useLocalSearchParams<{ noteId: string }>();
  const noteId = typeof noteIdParam === 'string' && noteIdParam.length > 0 ? noteIdParam : null;
  const { t } = useTranslation();
  const { note, loading } = useNote(noteId);
  const { profile } = useProfile();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const flashToast = useCallback((tone: 'success' | 'error', message: string) => {
    setToast({ tone, message });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const mode: 'beginner' | 'expert' = note?.mode === 'expert' ? 'expert' : 'beginner';

  const onEdit = useCallback(() => {
    if (!note?.wine?.lwin) return;
    const templateId = mode === 'expert' ? BUILTIN_EXPERT_ID : BUILTIN_BEGINNER_ID;
    router.push(
      `/notes/new/write?from=newEntry&wineId=${encodeURIComponent(
        note.wine.lwin,
      )}&edit=1&templateId=${templateId}`,
    );
  }, [note?.wine?.lwin, mode]);

  const onDelete = useCallback(() => {
    if (!noteId) return;
    Alert.alert(
      t('notes.detail.deleteConfirmTitle'),
      t('notes.detail.deleteConfirmDesc'),
      [
        { text: t('notes.detail.deleteCancel'), style: 'cancel' },
        {
          text: t('notes.detail.deleteConfirm'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteNote(noteId);
              router.back();
            } catch (err) {
              console.warn('[note detail] delete failed:', err);
              flashToast('error', t('notes.detail.deleteFailed'));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [noteId, t, flashToast]);

  const headerRight = useMemo(() => {
    if (!note?.wine?.lwin) return undefined;
    return (
      <View className="flex-row items-center">
        <Pressable
          onPress={onEdit}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={t('notes.detail.editAria')}
          hitSlop={10}
          style={{ padding: 6 }}
        >
          <Pencil size={18} strokeWidth={1.75} color={brand.cream} />
        </Pressable>
        <Pressable
          onPress={onDelete}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={t('notes.detail.deleteAria')}
          hitSlop={10}
          style={{ padding: 6, marginLeft: 4 }}
        >
          <Trash2 size={18} strokeWidth={1.75} color={brand.wineRed} />
        </Pressable>
      </View>
    );
  }, [note?.wine?.lwin, onEdit, onDelete, busy, t]);

  if (loading) {
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <BackHeader title={t('notes.detail.title')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={brand.gold} />
        </View>
      </View>
    );
  }

  if (!note || !note.wine?.lwin || !note.wine?.display_name) {
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <BackHeader title={t('notes.detail.title')} />
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={48} strokeWidth={1.5} color={brand.gold} />
          <View className="mt-4">
            <EmptyState
              title={t('notes.detail.notFound.title')}
              description={t('notes.detail.notFound.description')}
              action={
                <PrimaryButton
                  label={t('notes.detail.notFound.back')}
                  size="md"
                  variant="secondary"
                  onPress={() => router.back()}
                />
              }
            />
          </View>
        </View>
      </View>
    );
  }

  const wine = note.wine;
  const lwin = wine.lwin as string;
  const displayName = wine.display_name as string;
  const beginnerFields = (note.beginner_fields ?? null) as BeginnerFields | null;
  const expertFields = (note.expert_fields ?? null) as ExpertFields | null;
  const isBlind =
    mode === 'expert' &&
    (expertFields?.blind === true || (expertFields as { variant?: string } | null)?.variant === 'blind');
  const memo = resolveMemo(mode, beginnerFields, expertFields);

  // Author label — anonymous_display (UUID 노출 금지 §4-5), v0.1.0 mine only.
  // fallback: t('notes.detail.you') — "나" / "Me".
  const meLabel = t('notes.detail.you');
  const anon = profile?.anonymous_display ?? '';
  const authorName = anon || meLabel;
  const authorLetter = (anon.charAt(0) || meLabel.charAt(0) || '?').toUpperCase();

  const templateLabel =
    mode === 'expert'
      ? t('notes.detail.modeExpertBadge')
      : t('notes.detail.modeBeginnerBadge');

  // Resolve priceKrw from new shape OR legacy shape.
  // New: expertFields.estimated_price_krw / expertFields.priceCapture.krw
  // Legacy: expertFields.conclusions.estimated_price_krw
  // Also support beginnerFields.priceCapture.krw.
  const priceKrw = (() => {
    const ef = expertFields as
      | (ExpertFields & {
          conclusions?: { estimated_price_krw?: number | null };
          priceCapture?: { krw?: number | null };
        })
      | null;
    if (typeof ef?.estimated_price_krw === 'number') return ef.estimated_price_krw;
    if (typeof ef?.priceCapture?.krw === 'number') return ef.priceCapture.krw;
    if (typeof ef?.conclusions?.estimated_price_krw === 'number') return ef.conclusions.estimated_price_krw;
    const bf = beginnerFields as
      | (BeginnerFields & { priceCapture?: { krw?: number | null } })
      | null;
    if (typeof bf?.priceCapture?.krw === 'number') return bf.priceCapture.krw;
    return null;
  })();

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={t('notes.detail.title')} right={headerRight} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <NoteWineHeaderLink
          lwin={lwin}
          display_name={displayName}
          name_ko={wine.name_ko ?? null}
          bottle_color={wine.bottle_color ?? null}
          type_canonical={wine.type_canonical ?? null}
          vintage={wine.vintage ?? null}
          region={wine.region ?? null}
          country={wine.country ?? null}
        />

        <NoteAuthorCard
          authorLetter={authorLetter}
          authorName={authorName}
          templateLabel={templateLabel}
          tastedAt={note.tasted_at ?? ''}
          rating={typeof note.rating === 'number' ? Number(note.rating) : null}
          priceKrw={priceKrw}
          blind={isBlind}
        />

        <NoteMemoCard memo={memo} />

        <View className="mt-4 mx-4">
          {mode === 'beginner' && beginnerFields ? (
            <NoteBodyBeginner fields={beginnerFields} />
          ) : null}
          {mode === 'expert' && expertFields ? <NoteBodyExpert fields={expertFields} /> : null}
        </View>
      </ScrollView>

      {toast ? (
        <View className="absolute bottom-6 left-4 right-4">
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </View>
  );
}
