/**
 * StatGrid — profile-me §3-9 사양 변환.
 *
 * 키스크린 원본: src/components/profile/stat-grid.tsx (60 LOC).
 *
 * §6 #11 CSS deviation:
 *   keyscreen `display: grid, gridTemplateColumns: 'repeat(4, 1fr)', gap: 8`
 *   → RN flex-row + gap 8 + 각 자식 flex:1.
 *   §4-10 CSS layout primitive 변환 (display:grid 미지원).
 *
 * §6 #12 cellarCount 미포함 — JSX verbatim 4 카드.
 *
 * §0-2 light-only.
 */
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { light } from '@/lib/design-tokens';

export interface StatGridProps {
  winesTasted: number;
  countriesExplored: number;
  regionsExplored: number;
  notesCount: number;
}

interface StatItem {
  key: string;
  value: number;
  labelKey: string;
}

export function StatGrid({
  winesTasted,
  countriesExplored,
  regionsExplored,
  notesCount,
}: StatGridProps) {
  const { t } = useTranslation();

  const items: StatItem[] = [
    { key: 'tasted', value: winesTasted, labelKey: 'profile.stats.tasted' },
    { key: 'countries', value: countriesExplored, labelKey: 'profile.stats.countries' },
    { key: 'regions', value: regionsExplored, labelKey: 'profile.stats.regions' },
    { key: 'notes', value: notesCount, labelKey: 'profile.stats.notes' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 12,
      }}
    >
      {items.map((item) => {
        const label = t(item.labelKey);
        return (
          <View
            key={item.key}
            accessibilityLabel={t('profile.a11y.stat', { value: item.value, label })}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 8,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: light.border.default,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 22,
                lineHeight: 22,
                color: light.text.primary,
              }}
            >
              {item.value}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                lineHeight: 12,
                color: light.text.muted,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
