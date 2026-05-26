/**
 * /wine/[lwin] — 와인 상세 화면.
 *
 * 사양: _workspace/design-specs/wine-detail.md (Day 6 retroactive hardening).
 * 1차 design-review FAIL 6/6 해결 — keyscreen verbatim 트리 (BackHeader+FavToggle / WineHero /
 * MyTastingNoteCard|WriteNoteCta / ExternalRatings / AvgPrice / PriceChart / CommunityDrinkWindow /
 * WineStory / ReviewList / AddToCellarCta).
 *
 * 결정 (사양 §12):
 *   - Q1: WineMeta 4셀 grid 제거 — verbatim 위반 (WineHero 안에 통합)
 *   - Q2: DrinkingWindowBar 제거 — keyscreen 등가물 없음 (CommunityDrinkWindowCard에 통합 예정 v0.2.0)
 *   - Q3~Q7: 데이터 부재 카드는 stub UI + empty fallback (verbatim 시각 유지)
 *   - Q8: AddToCellarCta press → sheet open (RN deviation)
 *   - ScrollView gap 16 (keyscreen verbatim, 사양 §3-2)
 */
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
import { FavoriteToggle } from '@/components/wine/favorite-toggle';
import { MyTastingNoteCard } from '@/components/wine/my-tasting-note-card';
import { WineRatingsAndPriceRow } from '@/components/wine/wine-ratings-price-row';
import { PriceChartStub } from '@/components/wine/price-chart-stub';
import { CommunityDrinkWindowCard } from '@/components/wine/community-drink-window-card';
import { ReviewList } from '@/components/wine/review-list';
import { AddToCellarCta } from '@/components/wine/add-to-cellar-cta';
import { AddToCellarSheet } from '@/components/wine/add-to-cellar-sheet';
import { useWine } from '@/hooks/use-wine';
import { useNotesForWine } from '@/hooks/use-cellar';
import { getLocalizedWineName } from '@/lib/lwin';
import { currentLocale } from '@/lib/i18n';
import { brand } from '@/lib/design-tokens';
import { MOCK_WINE_DETAIL } from '@/lib/mock/wine-detail-data';

export default function WineDetailScreen() {
  const { lwin: lwinParam } = useLocalSearchParams<{ lwin: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const { t } = useTranslation();
  const { wine, loading } = useWine(lwin);
  const { notes } = useNotesForWine(lwin);
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
      <BackHeader
        title={headerTitle}
        right={<FavoriteToggle wineLwin={wine.lwin} />}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={t('wineDetail.a11y.scroll')}
      >
        {/* 1. Hero */}
        <WineHero
          lwin={wine.lwin}
          display_name={wine.display_name}
          name_ko={wine.name_ko}
          bottle_color={wine.bottle_color}
          type_canonical={wine.type_canonical}
          vintage={wine.vintage}
          producer_name={wine.producer_name}
          region={wine.region}
          country={wine.country}
        />

        {/* 2. MyTastingNoteCard (노트 있을 때만, 없으면 섹션 전체 숨김) */}
        {notes.length > 0 && notes[0] ? (
          <MyTastingNoteCard
            note={notes[0]}
            wineLwin={wine.lwin ?? ''}
            noteCount={notes.length}
            onViewAll={() => router.push(`/cellar/${encodeURIComponent(wine.lwin ?? '')}/history`)}
          />
        ) : null}

        {/* 3+4. ExternalRatingsCard + AveragePricePill 가로 나란히 (50-50) */}
        <WineRatingsAndPriceRow
          ratings={MOCK_WINE_DETAIL.externalRatings}
          priceData={MOCK_WINE_DETAIL.avgPrice}
        />

        {/* 5. PriceChart */}
        <PriceChartStub
          priceHistory={MOCK_WINE_DETAIL.priceHistory}
          lwin={wine.lwin}
        />

        {/* 6. CommunityDrinkWindowCard */}
        <CommunityDrinkWindowCard
          expertCount={MOCK_WINE_DETAIL.communityPeak.expertCount}
          peakData={MOCK_WINE_DETAIL.communityPeak}
          lwin={wine.lwin}
        />

        {/* 8. ReviewList (stub — reviews 부재) */}
        <ReviewList />

        {/* 9. AddToCellarCta inline (verbatim wine-red 풀 너비) */}
        <AddToCellarCta onPress={() => setShowCellarSheet(true)} />
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
