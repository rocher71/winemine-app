import { useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react-native';
import { BackHeader } from '@/components/nav/back-header';
import { PrimaryButton } from '@/components/shared/primary-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Toast } from '@/components/shared/toast';
import { WineHero } from '@/components/wine/wine-hero';
import { WineMeta } from '@/components/wine/wine-meta';
import { DrinkingWindowBar } from '@/components/wine/drinking-window-bar';
import { CommunityPeakPlaceholder } from '@/components/wine/community-peak-placeholder';
import { AddToCellarSheet } from '@/components/wine/add-to-cellar-sheet';
import { useWine } from '@/hooks/use-wine';
import { getLocalizedWineName } from '@/lib/lwin';
import { currentLocale } from '@/lib/i18n';
import { brand } from '@/lib/design-tokens';

export default function WineDetailScreen() {
  const { lwin: lwinParam } = useLocalSearchParams<{ lwin: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const { t } = useTranslation();
  const { wine, loading } = useWine(lwin);
  const [showCellarSheet, setShowCellarSheet] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (loading) {
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <BackHeader title="" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={brand.gold} />
        </View>
      </View>
    );
  }

  if (!wine?.lwin || !wine?.display_name) {
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <BackHeader title="" />
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={48} strokeWidth={1.5} color={brand.gold} />
          <View className="mt-4">
            <EmptyState
              title={t('wineDetail.notFound.title')}
              description={t('wineDetail.notFound.description')}
              action={
                <PrimaryButton
                  label={t('wineDetail.notFound.back')}
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

  const headerTitle = getLocalizedWineName(currentLocale(), {
    name_ko: wine.name_ko,
    display_name: wine.display_name,
  }).primary;

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={headerTitle} />
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
        <View className="mt-5">
          <WineMeta
            lwin={wine.lwin}
            producer_name={wine.producer_name}
            region={wine.region}
            country={wine.country}
            classification={wine.classification}
            vintage={wine.vintage}
          />
        </View>
        <View className="mt-5">
          <DrinkingWindowBar
            fromYear={wine.drink_window_from_year}
            peakYear={wine.drink_window_peak_year}
            toYear={wine.drink_window_to_year}
          />
        </View>
        <View className="mt-5">
          <CommunityPeakPlaceholder />
        </View>
        <View className="mt-6 px-4 gap-3">
          <PrimaryButton
            label={t('wineDetail.actions.writeNote')}
            size="lg"
            onPress={() => router.push(`/notes/new/write?wine_lwin=${encodeURIComponent(wine.lwin ?? '')}`)}
          />
          <PrimaryButton
            label={t('wineDetail.actions.addToCellar')}
            size="md"
            variant="secondary"
            onPress={() => setShowCellarSheet(true)}
          />
        </View>
      </ScrollView>

      {toastMsg ? (
        <View className="absolute bottom-6 left-4 right-4">
          <Toast message={toastMsg} tone="success" />
        </View>
      ) : null}

      <AddToCellarSheet
        visible={showCellarSheet}
        wineLwin={wine.lwin}
        onClose={() => setShowCellarSheet(false)}
        onSuccess={() => {
          setShowCellarSheet(false);
          setToastMsg(t('cellar.add.success'));
          setTimeout(() => setToastMsg(null), 2500);
        }}
      />
    </View>
  );
}
