/**
 * MetaRow — recognized stage RecognizedCard 안의 1줄 메타 표시.
 *
 * design-spec capture.md §3-5.
 * flex row gap 8 / mb 3 (spacing.0.75). label minWidth 48 / Inter 11 text-muted.
 * value Inter 11 / cream / lh 15.4.
 */
import { View, Text, useColorScheme } from 'react-native';
import { brand, dark, light, typography } from '@/lib/design-tokens';

interface MetaRowProps {
  label: string;
  value: string;
}

export function MetaRow({ label, value }: MetaRowProps) {
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const labelColor = isLight ? light.text.muted : dark.text.muted;
  const valueColor = isLight ? light.text.primary : brand.cream;

  return (
    <View
      className="flex-row gap-2"
      style={{ marginBottom: 3 }}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text
        style={{
          fontFamily: typography.metaRowLabel.family,
          fontSize: typography.metaRowLabel.size,
          lineHeight: typography.metaRowLabel.lineHeight,
          color: labelColor,
          minWidth: 48,
          flexShrink: 0,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: typography.metaRowValue.family,
          fontSize: typography.metaRowValue.size,
          lineHeight: typography.metaRowValue.lineHeight,
          color: valueColor,
          flex: 1,
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
