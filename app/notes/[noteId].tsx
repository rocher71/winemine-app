import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Trash2, ChevronRight, EyeOff } from 'lucide-react-native';
import { BackHeader } from '@/components/nav/back-header';
import { PrimaryButton } from '@/components/shared/primary-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Toast } from '@/components/shared/toast';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { WineHero } from '@/components/wine/wine-hero';
import { StarRatingReadOnly } from '@/components/notes/star-rating-readonly';
import { NoteBodyBeginner } from '@/components/notes/note-body-beginner';
import { NoteBodyExpert } from '@/components/notes/note-body-expert';
import { useNote, deleteNote } from '@/hooks/use-notes';
import { getLocalizedWineName } from '@/lib/lwin';
import { currentLocale } from '@/lib/i18n';
import { brand } from '@/lib/design-tokens';
import type { BeginnerFields } from '@/components/notes/beginner-form';
import type { ExpertFields } from '@/components/notes/expert-form';

export default function NoteDetailScreen() {
  const { noteId: noteIdParam } = useLocalSearchParams<{ noteId: string }>();
  const noteId = typeof noteIdParam === 'string' && noteIdParam.length > 0 ? noteIdParam : null;
  const { t } = useTranslation();
  const { note, loading } = useNote(noteId);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const flashToast = useCallback((tone: 'success' | 'error', message: string) => {
    setToast({ tone, message });
    setTimeout(() => setToast(null), 2500);
  }, []);

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
  const headerTitle = getLocalizedWineName(currentLocale(), {
    name_ko: wine.name_ko,
    display_name: wine.display_name,
  }).primary;
  const mode = (note.mode === 'expert' ? 'expert' : 'beginner') as 'beginner' | 'expert';
  const beginnerFields = (note.beginner_fields ?? null) as BeginnerFields | null;
  const expertFields = (note.expert_fields ?? null) as ExpertFields | null;
  const isBlind = mode === 'expert' && expertFields?.blind === true;

  const headerRight = (
    <Pressable
      onPress={onDelete}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={t('notes.detail.delete')}
      hitSlop={10}
      className="px-3 py-2"
    >
      <Trash2 size={20} strokeWidth={2} color={brand.wineRed} />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={headerTitle} right={headerRight} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <WineHero
          lwin={wine.lwin}
          display_name={wine.display_name}
          name_ko={wine.name_ko}
          bottle_color={wine.bottle_color}
          type_canonical={wine.type_canonical}
          vintage={wine.vintage}
        />

        <View className="mt-5 mx-4 rounded-xl bg-surface p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted uppercase">
              {note.tasted_at}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-bg-deep px-3 py-1">
                <Text className="font-inter text-card-meta text-gold">
                  {mode === 'expert'
                    ? t('notes.detail.modeExpertBadge')
                    : t('notes.detail.modeBeginnerBadge')}
                </Text>
              </View>
              {isBlind ? (
                <View className="flex-row items-center rounded-full bg-bg-deep px-3 py-1 gap-1">
                  <EyeOff size={12} strokeWidth={2} color={brand.gold} />
                  <Text className="font-inter text-card-meta text-gold">
                    {t('notes.detail.blindBadge')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          {typeof note.rating === 'number' ? (
            <View className="mt-3">
              <StarRatingReadOnly value={Number(note.rating)} />
            </View>
          ) : null}
        </View>

        <View className="mt-5 mx-4">
          {mode === 'beginner' && beginnerFields ? (
            <NoteBodyBeginner fields={beginnerFields} />
          ) : null}
          {mode === 'expert' && expertFields ? <NoteBodyExpert fields={expertFields} /> : null}
        </View>

        <Pressable
          onPress={() => router.push(`/wine/${encodeURIComponent(wine.lwin ?? '')}`)}
          accessibilityRole="button"
          accessibilityLabel={t('notes.detail.viewWine')}
          className="mt-5 mx-4 flex-row items-center justify-between rounded-xl bg-surface px-4 py-4"
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
        >
          <View className="flex-1 pr-3">
            <WineNameDisplay
              lwin={wine.lwin}
              name_ko={wine.name_ko}
              display_name={wine.display_name}
              size="card"
            />
            <Text className="font-inter text-card-meta text-gold mt-1">
              {t('notes.detail.viewWine')}
            </Text>
          </View>
          <ChevronRight size={20} strokeWidth={2} color={brand.gold} />
        </Pressable>
      </ScrollView>

      {toast ? (
        <View className="absolute bottom-6 left-4 right-4">
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </View>
  );
}
