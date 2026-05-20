/**
 * AveragePricePill — 평균 구매가 카드.
 *
 * 사양: wine-detail.md §3-7 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q4): purchases 테이블 부재 → v0.1.0은 empty state.
 *   - 외부: padding 14 + radius 12 + border + flex row justify-between
 *   - empty 형태: 좌측 label + "0건 등록" / "0 entries", 우측 KRW "—" placeholder
 * v0.2.0에서 purchases supabase query + KRW/USD 계산.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export function AveragePricePill() {
  const { t } = useTranslation();

  return (
    <View
      className="mx-4 rounded-xl bg-surface dark:bg-surface border border-border-default flex-row items-center justify-between"
      style={{ padding: 14 }}
      accessibilityRole="text"
      accessibilityLabel={`${t('wineDetail.avgPrice.label')} ${t('wineDetail.avgPrice.empty')}`}
    >
      <View>
        <Text className="font-inter text-[12px] text-text-muted dark:text-text-muted">
          {t('wineDetail.avgPrice.label')}
        </Text>
        <Text className="font-inter text-[11px] text-text-muted dark:text-text-muted mt-1">
          {t('wineDetail.avgPrice.count', { count: 0 })}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className="font-playfair text-card-big text-text-muted dark:text-text-muted"
          style={{ fontWeight: '700' }}
        >
          —
        </Text>
      </View>
    </View>
  );
}
