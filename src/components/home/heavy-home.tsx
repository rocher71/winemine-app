import { useCallback } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRecentNotes } from '@/hooks/use-notes';
import { useCellarSummary } from '@/hooks/use-cellar';
import { RecentNotesSection } from './recent-notes-section';
import { CellarSummarySection } from './cellar-summary-section';
import { RecommendedPlaceholder } from './recommended-placeholder';
import { brand } from '@/lib/design-tokens';

interface Props {
  displayName: string;
}

export function HeavyHome({ displayName }: Props) {
  const { t } = useTranslation();
  const { notes, loading: notesLoading, refresh: refreshNotes } = useRecentNotes(3);
  const { cellaredCount, loading: cellarLoading, refresh: refreshCellar } = useCellarSummary();

  const refreshing = notesLoading || cellarLoading;
  const onRefresh = useCallback(async () => {
    await Promise.all([refreshNotes(), refreshCellar()]);
  }, [refreshNotes, refreshCellar]);

  return (
    <ScrollView
      className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.gold} />
      }
    >
      <View className="px-2 py-3">
        <Text className="font-playfair text-page-title text-text-primary dark:text-text-primary">
          {t('home.heavy.greeting', { name: displayName })}
        </Text>
      </View>
      <View className="mt-6 gap-6">
        <RecentNotesSection notes={notes} />
        <CellarSummarySection cellaredCount={cellaredCount} />
        <RecommendedPlaceholder />
      </View>
    </ScrollView>
  );
}
