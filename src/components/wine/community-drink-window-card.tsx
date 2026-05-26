/**
 * CommunityDrinkWindowCard — 커뮤니티 음용 적기 카드.
 *
 * 사양: wine-detail.md §3-9 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q5): community_peak_estimates 테이블 부재 → v0.1.0은 empty state로 표시.
 *   - header (Users 16 gold + title) + sub copy + empty fallback "아직 추정 데이터가 부족해요..."
 *   - details link → Toast v0.2.0
 *   - BarChart histogram은 v0.2.0 (사양 §8/§9)
 * 기존 community-peak-placeholder.tsx 대체.
 *
 * V2 업데이트 (wine-detail-v2-tasks.md T8):
 *   - peakData?: CommunityPeakData prop 추가 — 데이터 있으면 MiniBarChart 표시
 */
import { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { Toast } from '@/components/shared/toast';
import { MiniBarChart } from '@/components/shared/mini-bar-chart';
import type { CommunityPeakData } from '@/lib/types/wine-detail';

interface Props {
  expertCount?: number;
  peakData?: CommunityPeakData;
}

export function CommunityDrinkWindowCard({ expertCount = 0, peakData }: Props) {
  const { t } = useTranslation();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleDetails = () => {
    Haptics.selectionAsync().catch(() => undefined);
    setToastMsg(t('wineDetail.communityPeak.deferredToast'));
    setTimeout(() => setToastMsg(null), 2500);
  };

  const hasData = peakData != null && peakData.histogram.length > 0;
  const displayCount = peakData?.expertCount ?? expertCount;

  return (
    <View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4">
      {/* Header */}
      <View
        className="flex-row items-center mb-1.5"
        style={{ gap: 6 }}
      >
        <Users size={16} strokeWidth={1.75} color={brand.gold} />
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-card-section-title text-text-primary dark:text-text-primary"
        >
          {t('wineDetail.communityPeak.title')}
        </Text>
      </View>

      {/* Sub */}
      {hasData ? (
        <Text className="font-inter text-[12px] text-text-muted dark:text-text-muted mb-3">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }}>
            {t('wineDetail.communityPeak.sub', { count: displayCount })}
          </Text>
          {' · '}
          <Text style={{ fontFamily: 'Inter_600SemiBold' }}>
            {`중앙값 ${peakData!.median}년`}
          </Text>
        </Text>
      ) : (
        <Text className="font-inter text-[12px] text-text-muted dark:text-text-muted mb-3">
          {t('wineDetail.communityPeak.sub', { count: displayCount })}
        </Text>
      )}

      {/* Chart or empty */}
      {hasData ? (
        <View style={{ marginVertical: 4 }}>
          <MiniBarChart
            bars={peakData!.histogram}
            width={Dimensions.get('window').width - 64}
            height={70}
            peakIndex={7}
            color={brand.gold}
            compact
          />
        </View>
      ) : (
        <View
          className="items-center"
          style={{ paddingVertical: 32, paddingHorizontal: 16 }}
        >
          <Text className="font-inter text-[13px] text-text-muted dark:text-text-muted text-center">
            {t('wineDetail.communityPeak.empty')}
          </Text>
        </View>
      )}

      {/* Details link */}
      <Pressable
        onPress={handleDetails}
        accessibilityRole="link"
        accessibilityLabel={t('wineDetail.communityPeak.details')}
        className="self-end mt-3"
        style={({ pressed }) => ({
          paddingHorizontal: 10,
          paddingVertical: 6,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Text
            className="font-inter-semibold text-[12px]"
            style={{ color: brand.gold }}
          >
            {t('wineDetail.communityPeak.details')}
          </Text>
          <ArrowRight size={14} strokeWidth={2} color={brand.gold} />
        </View>
      </Pressable>

      {toastMsg ? (
        <View
          style={{ position: 'absolute', left: 16, right: 16, bottom: -56 }}
          pointerEvents="none"
        >
          <Toast message={toastMsg} tone="info" />
        </View>
      ) : null}
    </View>
  );
}
