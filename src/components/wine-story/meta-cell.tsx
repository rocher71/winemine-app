/**
 * MetaCell — wine-story Meta grid 2×2 cell.
 *
 * 사양: _workspace/design-specs/wine-story.md §3-7.
 *
 * keyscreen src/app/wine/[id]/story/page.tsx line 270~312 verbatim 변환:
 *   - padding 12 / bg surface / border 1 border-default / radius 10
 *   - label: Inter 10 muted uppercase ls 0.05em
 *   - value: Playfair 16 700 primary, mt 4
 *
 * 4 cell 재사용 — props.label / value 또는 valueLocalized.
 */
import { View, Text } from 'react-native';
import { light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import type { LocalizedString } from '@/components/shared/locale-text';

interface MetaCellProps {
  label: LocalizedString;
  value?: string;
  valueLocalized?: LocalizedString;
}

export function MetaCell({ label, value, valueLocalized }: MetaCellProps) {
  const locale = currentLocale();
  const labelText = label[locale] ?? label.en;
  const valueText = valueLocalized
    ? valueLocalized[locale] ?? valueLocalized.en
    : value ?? '';

  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        padding: 12,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        borderRadius: 10,
      }}
      accessibilityLabel={`${labelText}: ${valueText}`}
    >
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 10,
          color: light.text.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {labelText}
      </Text>
      <Text
        style={{
          marginTop: 4,
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 16,
          fontWeight: '700',
          color: light.text.primary,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {valueText}
      </Text>
    </View>
  );
}
