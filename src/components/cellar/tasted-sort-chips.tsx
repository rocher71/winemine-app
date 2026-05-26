/**
 * TastedSortChips — tasted 탭 전용 정렬 칩.
 *
 * 5 options: recent(consumed_at) / count / vintage / region / price
 * (masigiJoheun/storage 제거 — ux-decisions/cellar-tasted-tab.md Decision 6)
 */
import { ScrollView, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { TastedSortKey } from '@/hooks/use-cellar';

const TASTED_SORT_KEYS: readonly TastedSortKey[] = [
  'recent',
  'count',
  'vintage',
  'region',
  'price',
] as const;

interface Props {
  value: TastedSortKey;
  onChange: (v: TastedSortKey) => void;
}

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
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
          fontFamily: 'Freesentation_4Regular',
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

export function TastedSortChips({ value, onChange }: Props) {
  const { t } = useTranslation();
  const handle = (k: TastedSortKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(k);
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}
    >
      {TASTED_SORT_KEYS.map((k) => (
        <Chip key={k} active={value === k} label={t(`cellar.sort.${k}`)} onPress={() => handle(k)} />
      ))}
    </ScrollView>
  );
}
