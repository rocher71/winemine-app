/**
 * SlimStatRow — profile-other §1a 신규 컴포넌트 (3-stat).
 *
 * handoff `OtherUserScreen` line 176~192.
 * StatGrid(4-stat 고정, padding 12/8, value 22, radius 12)와 다름:
 *   - 3 카드, padding 10/12, value 18, radius 10, marginTop 14.
 *
 * §6 #10: StatGrid count prop 분기 복잡 → 신규 SlimStatRow.
 *
 * §0-2 light-only.
 */
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { light } from '@/lib/design-tokens';

interface SlimStatRowProps {
  winesCount: number;
  countriesCount: number;
  notesCount: number;
}

interface StatItem {
  key: string;
  value: number;
  labelKey: string;
}

export function SlimStatRow({
  winesCount,
  countriesCount,
  notesCount,
}: SlimStatRowProps) {
  const { t } = useTranslation();

  const items: StatItem[] = [
    { key: 'wines', value: winesCount, labelKey: 'profile.other.stat.wines' },
    {
      key: 'countries',
      value: countriesCount,
      labelKey: 'profile.other.stat.countries',
    },
    { key: 'notes', value: notesCount, labelKey: 'profile.other.stat.notes' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 14,
      }}
    >
      {items.map((item) => {
        const label = t(item.labelKey);
        return (
          <View
            key={item.key}
            accessibilityLabel={t('profile.a11y.stat', {
              value: item.value,
              label,
            })}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: light.border.default,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                lineHeight: 12,
                color: light.text.muted,
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 18,
                lineHeight: 21.6,
                color: light.text.primary,
                marginTop: 2,
              }}
            >
              {item.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
