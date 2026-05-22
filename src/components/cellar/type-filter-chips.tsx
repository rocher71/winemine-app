/**
 * TypeFilterChips — 6 chip (all + 5 type) horizontal scroll.
 *
 * 사양: design-spec cellar-list.md §3-5.
 * 키스크린 원본: src/app/cellar/page.tsx line 312~351 + TypeDot line 821~832.
 *
 * active: border 1px gold + bg gold/0.12 + text gold
 * idle:   border 1px border-default + bg transparent + text text-muted
 *
 * TypeDot: 8×8 radius 4 — type별 색 (all은 135deg 3-stop gradient).
 * active opacity 1 / idle opacity 0.55 (all idle 0.5).
 *
 * dessert chip은 keyscreen verbatim에서 제외 (사양 §12-5 — type_canonical='dessert'는 보관 비율 낮음).
 */
import { ScrollView, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, cellar, typeFilterDot, typeFilterAllGradient } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export type TypeFilter = 'all' | 'red' | 'white' | 'sparkling' | 'rose' | 'fortified';

const TYPE_FILTERS: readonly TypeFilter[] = ['all', 'red', 'white', 'sparkling', 'rose', 'fortified'] as const;

interface Props {
  value: TypeFilter;
  onChange: (v: TypeFilter) => void;
}

function TypeDot({ type, active }: { type: TypeFilter; active: boolean }) {
  if (type === 'all') {
    return (
      <LinearGradient
        colors={typeFilterAllGradient.colors as unknown as readonly [string, string, string]}
        locations={typeFilterAllGradient.locations as unknown as readonly [number, number, number]}
        start={typeFilterAllGradient.start}
        end={typeFilterAllGradient.end}
        style={{ width: 8, height: 8, borderRadius: 4, opacity: active ? 1 : 0.5 }}
      />
    );
  }
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: typeFilterDot[type as Exclude<TypeFilter, 'all'>],
        opacity: active ? 1 : 0.55,
      }}
    />
  );
}

function Chip({
  type,
  active,
  label,
  onPress,
}: {
  type: TypeFilter;
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 8,
        paddingRight: 10,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: active ? brand.gold : border.default,
        backgroundColor: active ? cellar.typeFilterActiveBg : 'transparent',
      }}
    >
      <TypeDot type={type} active={active} />
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_6SemiBold',
          fontSize: 11,
          lineHeight: 13.2,
          color: active ? brand.gold : text.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TypeFilterChips({ value, onChange }: Props) {
  const { t } = useTranslation();
  const handle = (tf: TypeFilter) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(tf);
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 6 }}
    >
      {TYPE_FILTERS.map((tf) => (
        <Chip
          key={tf}
          type={tf}
          active={value === tf}
          label={t(`cellar.filterType.${tf}`)}
          onPress={() => handle(tf)}
        />
      ))}
    </ScrollView>
  );
}
