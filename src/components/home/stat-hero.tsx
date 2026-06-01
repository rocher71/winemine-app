/**
 * StatHero — 방문 국가 / 마신 와인 / 작성 노트 3-col stat row.
 *
 * Editorial Stack 재설계 (사양 home.md §3-3):
 * - row: gap 11, paddingHorizontal 22
 * - card: bg-surface, border-gold 1px, radius 16, padding 15/14, shadows.homeCard
 * - value Playfair 30 lh 30, label 12 sub marginTop 9
 *
 * empty(0/0/0): "0" 그대로 표시 (핸드오프 자체가 0 노출). EmptyState 불필요.
 * loading: value skeleton(width 24, h 30) × 3.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand, typography, shadows, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface StatHeroProps {
  countries: number;
  wines: number;
  notes: number;
  loading?: boolean;
}

function StatCard({ value, label, loading }: { value: number; label: string; loading?: boolean }) {
  const tokens = useThemeTokens();
  const borderGold = withAlpha(brand.gold, 0.24);
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: tokens.bg.surface,
        borderWidth: 1,
        borderColor: borderGold,
        ...shadows.homeCard,
      }}
      accessibilityRole="text"
      accessibilityLabel={`${value} ${label}`}
    >
      {loading ? (
        <View style={{ width: 24, height: 30, borderRadius: 6, backgroundColor: tokens.bg.inset }} />
      ) : (
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: typography.homeStatValue30.family,
            fontSize: typography.homeStatValue30.size,
            lineHeight: typography.homeStatValue30.lineHeight,
            color: tokens.text.primary,
          }}
        >
          {value}
        </Text>
      )}
      <Text
        allowFontScaling={false}
        style={{ fontFamily: typography.cardMeta.family, fontSize: 12, color: tokens.text.secondary, marginTop: 9 }}
      >
        {label}
      </Text>
    </View>
  );
}

export function StatHero({ countries, wines, notes, loading }: StatHeroProps) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: 11, paddingHorizontal: 22 }}>
      <StatCard value={countries} label={t('home.statCountries')} loading={loading} />
      <StatCard value={wines} label={t('home.statWines')} loading={loading} />
      <StatCard value={notes} label={t('home.statNotes')} loading={loading} />
    </View>
  );
}
