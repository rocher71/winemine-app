import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';

interface StatTileProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

export function StatTile({ label, value, unit, highlight = false }: StatTileProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const goldColor = isDark ? brand.gold : light.border.active;
  const surfaceBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const surfaceBorder = isDark ? dark.border.default : ivory.border;

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: highlight ? brand.goldWash : surfaceBg,
        borderWidth: 1,
        borderColor: highlight ? `${goldColor}99` : surfaceBorder,
        ...shadows.sm,
      }}
    >
      <Text
        style={{
          fontFamily: 'Freesentation_6SemiBold',
          fontSize: 9.5,
          color: tokens.text.muted,
          letterSpacing: 0.95,
          textTransform: 'uppercase',
          marginBottom: 5,
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 20,
            color: highlight ? (isDark ? brand.gold : brand.goldDeep) : tokens.text.primary,
            lineHeight: 22,
            letterSpacing: -0.2,
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              color: tokens.text.muted,
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
