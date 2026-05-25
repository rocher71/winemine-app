/**
 * PriceChartStub — 가격 추이 카드 (compact variant).
 *
 * 사양: wine-detail.md §3-8 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q4, §9 P2): purchases 테이블 부재 → 차트 자체는 placeholder.
 *   - header + range toggle (3M/1Y/ALL) UI 시각 verbatim
 *   - chart container: empty state "아직 등록된 가격이 없어요" / "No purchases yet"
 *   - details link → Toast "v0.2.0에 출시 예정" (사양 §12 Q9)
 * v0.2.0에서 victory-native LineChart + purchases supabase query 채움.
 */
import { useState } from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { Toast } from '@/components/shared/toast';

type Range = '3M' | '1Y' | 'ALL';
const RANGES: Range[] = ['3M', '1Y', 'ALL'];

export function PriceChartStub() {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const [range, setRange] = useState<Range>('1Y');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleRangePress = (r: Range) => {
    Haptics.selectionAsync().catch(() => undefined);
    setRange(r);
  };

  const handleDetails = () => {
    Haptics.selectionAsync().catch(() => undefined);
    setToastMsg(t('wineDetail.priceChart.deferredToast'));
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
          {t('wineDetail.priceChart.title')}
        </Text>

        {/* Range toggle */}
        <View className="flex-row" style={{ gap: 4 }}>
          {RANGES.map((r) => {
            const active = r === range;
            return (
              <Pressable
                key={r}
                onPress={() => handleRangePress(r)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={r}
                className="rounded-lg border border-border-default"
                style={({ pressed }) => ({
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: active ? (scheme === 'light' ? brand.gold : brand.wineRed) : 'transparent',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  allowFontScaling={false}
                  className="font-inter-semibold text-[11px]"
                  style={{ color: active ? brand.cream : brand.cream }}
                >
                  {r}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Chart container — empty placeholder */}
      <View
        className="items-center justify-center"
        style={{ height: 200 }}
        accessibilityRole="text"
      >
        <Text className="font-inter text-[12px] text-text-muted dark:text-text-muted">
          {t('wineDetail.priceChart.empty')}
        </Text>
      </View>

      {/* Details link */}
      <Pressable
        onPress={handleDetails}
        accessibilityRole="link"
        accessibilityLabel={t('wineDetail.priceChart.details')}
        className="self-end mt-2"
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
            {t('wineDetail.priceChart.details')}
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
