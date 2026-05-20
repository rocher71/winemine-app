/**
 * ExternalRatingsCard — Vivino / Wine Searcher / CellarTracker 3분할 평점 카드.
 *
 * 사양: wine-detail.md §3-6 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q3): external_ratings 테이블·API 부재 → v0.1.0은 stub.
 *   - 시각 형태 verbatim (header + 3 RatingPill placeholders + footer Info button)
 *   - 점수는 "—" dash, sub copy는 "외부 평점 없음" / "No external ratings"
 *   - Info button press → Toast "Mock data only — actual API not connected"
 * v0.2.0에서 external_ratings 테이블 + scheduled sync로 채움.
 */
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Info, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { Toast } from '@/components/shared/toast';

const SOURCES = ['Vivino', 'Wine Searcher', 'CellarTracker'] as const;

export function ExternalRatingsCard() {
  const { t } = useTranslation();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleInfoPress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    setToastMsg(t('wineDetail.externalRatings.mockNotice'));
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4">
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-3">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-card-section-title text-text-primary dark:text-text-primary"
        >
          {t('wineDetail.externalRatings.title')}
        </Text>
      </View>

      {/* 3-col grid (placeholder — v0.1.0 stub) */}
      <View className="flex-row" style={{ gap: 8 }}>
        {SOURCES.map((source) => (
          <View
            key={source}
            className="flex-1 bg-bg-map dark:bg-bg-map"
            style={{
              paddingHorizontal: 8,
              paddingVertical: 10,
              minHeight: 70,
              gap: 2,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'transparent',
            }}
            accessibilityRole="text"
            accessibilityLabel={`${source} — ${t('wineDetail.externalRatings.empty')}`}
          >
            <Text
              allowFontScaling={false}
              className="font-inter text-[10px] text-text-muted dark:text-text-muted uppercase"
              style={{ letterSpacing: 0.5 }}
              numberOfLines={1}
            >
              {source}
            </Text>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              {/* score placeholder dash + Star icon as visual placeholder */}
              {source === 'Vivino' ? (
                <Star size={14} color={brand.gold} strokeWidth={1.75} />
              ) : null}
              <Text
                className="font-playfair text-rating-pill-score text-text-muted dark:text-text-muted"
                style={{ fontWeight: '700' }}
              >
                —
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer row — Info button */}
      <View className="flex-row items-center justify-between mt-3">
        <Text
          allowFontScaling={false}
          className="font-inter text-[10px] text-text-muted dark:text-text-muted"
        >
          {t('wineDetail.externalRatings.comingSoon')}
        </Text>
        <Pressable
          onPress={handleInfoPress}
          accessibilityRole="button"
          accessibilityLabel={t('wineDetail.externalRatings.mockNotice')}
          hitSlop={8}
          style={({ pressed }) => ({ padding: 2, opacity: pressed ? 0.7 : 1 })}
        >
          <Info size={12} strokeWidth={1.75} color={brand.gold} />
        </Pressable>
      </View>

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
