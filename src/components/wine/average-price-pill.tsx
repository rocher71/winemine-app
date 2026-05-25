/**
 * AveragePricePill — 평균 구매가 카드.
 *
 * 사양: wine-detail.md §3-7 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q4): purchases 테이블 부재 → v0.1.0은 stub.
 *   - label ("평균 가격") + price ("—") + trend row ("—") 수직 배치
 * v0.2.0에서 purchases supabase query + KRW/USD 계산.
 *
 * 라이트 모드 업데이트 (wine-detail-light-mode-tasks.md T3):
 *   - 외부 mx-4 + flex-row 제거 → WineRatingsAndPriceRow 가 담당
 *   - 레이아웃 세로 수직 (label → price → trend)
 *   - borderRadius: 12
 *   - padding: 14 (사방)
 *   - TrendingUp 아이콘 추가 (lucide-react-native)
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react-native';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export function AveragePricePill() {
  const { t } = useTranslation();
  const tokens = useThemeTokens();

  return (
    <View
      style={{
        padding: 14,
        borderRadius: 12,
        backgroundColor: tokens.bg.surface,
        borderWidth: 1,
        borderColor: tokens.border.default,
      }}
      accessibilityRole="text"
      accessibilityLabel={`${t('wineDetail.avgPrice.label')} ${t('wineDetail.avgPrice.empty')}`}
    >
      {/* Label */}
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 10,
          color: tokens.text.muted,
        }}
      >
        {t('wineDetail.avgPrice.label')}
      </Text>

      {/* Price stub */}
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 18,
          color: tokens.text.muted,
          marginTop: 4,
        }}
      >
        —
      </Text>

      {/* Trend row stub */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
        <TrendingUp size={11} strokeWidth={2} color={tokens.text.muted} />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 10,
            color: tokens.text.muted,
          }}
        >
          —
        </Text>
      </View>
    </View>
  );
}
