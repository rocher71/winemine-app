/**
 * StatGrid — profile-me §3-9 사양 변환.
 *
 * handoff ProfileScreen 6-stat 3×2 그리드:
 *   마신 와인 / 방문 국가 / 탐험 지역
 *   작성 노트 / 셀러      / 즐겨찾기
 *
 * §6 #11 CSS deviation:
 *   keyscreen `display: grid, gridTemplateColumns: 'repeat(3, 1fr)', gap: 8`
 *   → RN 두 개의 flex-row View (각 3 flex:1 자식).
 *   §4-10 CSS layout primitive 변환 (display:grid 미지원).
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
  cellarCount: number;
  favoritesCount: number;
}

interface StatItem {
  key: string;
  value: number;
  labelKey: string;
}

function StatCard({ item }: { item: StatItem }) {
  const { t } = useTranslation();
  const label = t(item.labelKey);
  return (
    <View
      accessibilityLabel={t('profile.a11y.stat', { value: item.value, label })}
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        borderRadius: 10,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 20,
          lineHeight: 24,
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
}

export function StatGrid({
  winesTasted,
  countriesExplored,
  regionsExplored,
  notesCount,
  cellarCount,
  favoritesCount,
}: StatGridProps) {
  const row1: StatItem[] = [
    { key: 'tasted', value: winesTasted, labelKey: 'profile.stats.tasted' },
    { key: 'countries', value: countriesExplored, labelKey: 'profile.stats.countries' },
    { key: 'regions', value: regionsExplored, labelKey: 'profile.stats.regions' },
  ];
  const row2: StatItem[] = [
    { key: 'notes', value: notesCount, labelKey: 'profile.stats.notes' },
    { key: 'cellar', value: cellarCount, labelKey: 'profile.stats.cellar' },
    { key: 'favorites', value: favoritesCount, labelKey: 'profile.stats.favorites' },
  ];

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 12,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {row1.map((item) => <StatCard key={item.key} item={item} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {row2.map((item) => <StatCard key={item.key} item={item} />)}
      </View>
    </View>
  );
}
