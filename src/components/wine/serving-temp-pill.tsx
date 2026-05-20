/**
 * ServingTempPill — WineHero abs-positioned 권장 시음 온도 칩.
 *
 * 사양: wine-detail.md §3-3 — Hero 우하단 (right:12, bottom:12)에 정렬.
 * 데이터: wines.serving_temp_{min,max} 컬럼 부재 (사양 §12 Q11) → wine type별
 *         servingTempDefault fallback (design-tokens.ts) 사용.
 * 시각: bg gold 12% alpha, border 1 gold, color gold, Inter 11 500, radius full.
 * v0.1.0 GlossaryTooltip은 deferred (사양 §9) — 단순 텍스트만.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Thermometer } from 'lucide-react-native';
import { brand, servingTempDefault, withAlpha, type TypeCanonical } from '@/lib/design-tokens';

interface ServingTempPillProps {
  type: TypeCanonical | null;
  /** wines.serving_temp_min — v0.1.0 컬럼 부재 시 null. type fallback 사용 */
  servingTempMin?: number | null;
  /** wines.serving_temp_max — 동일 */
  servingTempMax?: number | null;
}

export function ServingTempPill({
  type,
  servingTempMin,
  servingTempMax,
}: ServingTempPillProps) {
  const { t } = useTranslation();

  // type fallback 우선순위: explicit > type default > red default
  const fallback = type ? servingTempDefault[type] : servingTempDefault.red;
  const min = servingTempMin ?? fallback.min;
  const max = servingTempMax ?? fallback.max;

  const labelText = t('wineDetail.servingTemp.label', { min, max });
  const a11yText = t('wineDetail.servingTemp.a11y', { min, max });

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={a11yText}
      className="flex-row items-center rounded-full"
      style={{
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: withAlpha(brand.gold, 0.12),
        borderWidth: 1,
        borderColor: brand.gold,
      }}
    >
      <Thermometer size={12} strokeWidth={1.75} color={brand.gold} />
      <Text
        allowFontScaling={false}
        className="font-inter-medium text-serving-temp-pill"
        style={{ color: brand.gold }}
      >
        {labelText}
      </Text>
    </View>
  );
}
