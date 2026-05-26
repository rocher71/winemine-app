/**
 * ListSortChips — 리스트 탭 정렬 칩 (TastedSortChips 패턴 재활용).
 * 4 options: recent(updated_at) / created / name / count
 */
import { ScrollView, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { ListSortKey } from '@/hooks/use-wine-lists';

const LIST_SORT_KEYS: readonly ListSortKey[] = ['recent', 'created', 'name', 'count'] as const;

const SORT_I18N: Record<ListSortKey, string> = {
  recent:  'lists.sortRecent',
  created: 'lists.sortCreated',
  name:    'lists.sortName',
  count:   'lists.sortCount',
};

interface Props {
  value: ListSortKey;
  onChange: (v: ListSortKey) => void;
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

export function ListSortChips({ value, onChange }: Props) {
  const { t } = useTranslation();
  const handle = (k: ListSortKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(k);
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}
    >
      {LIST_SORT_KEYS.map((k) => (
        <Chip key={k} active={value === k} label={t(SORT_I18N[k])} onPress={() => handle(k)} />
      ))}
    </ScrollView>
  );
}
