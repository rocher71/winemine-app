/**
 * SortChips — 6 chip horizontal scroll (recent / drinkSoon / vintage / region / storage / price).
 *
 * 사양: design-spec cellar-list.md §3-6.
 * 키스크린 원본: src/app/cellar/page.tsx line 354~386.
 *
 * active: wine-red bg + cream text
 * idle:   transparent + border-default + text-secondary
 */
import { ScrollView, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { CellarSortKey } from '@/hooks/use-cellar';

const SORT_KEYS: readonly CellarSortKey[] = [
  'recent',
  'drinkSoon',
  'vintage',
  'region',
  'storage',
  'price',
] as const;

interface Props {
  value: CellarSortKey;
  onChange: (v: CellarSortKey) => void;
}

function Chip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const { text, border } = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={{
        flexShrink: 0,
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: active ? brand.wineRed : border.default,
        backgroundColor: active ? brand.wineRed : 'transparent',
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_6SemiBold',
          fontSize: 11,
          lineHeight: 13.2,
          color: active ? brand.cream : text.secondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SortChips({ value, onChange }: Props) {
  const { t } = useTranslation();
  const handle = (k: CellarSortKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(k);
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}
    >
      {SORT_KEYS.map((k) => (
        <Chip key={k} active={value === k} label={t(`cellar.sort.${k}`)} onPress={() => handle(k)} />
      ))}
    </ScrollView>
  );
}
