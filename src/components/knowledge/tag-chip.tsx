import React from 'react';
import { View, Text } from 'react-native';
import { brand, light } from '@/lib/design-tokens';

interface TagChipProps {
  label: string;
  variant?: 'accent' | 'gold';
  accent?: string;
}

export function TagChip({ label, variant = 'accent', accent = brand.wineRed }: TagChipProps) {
  if (variant === 'gold') {
    return (
      <View
        style={{
          paddingVertical: 2,
          paddingHorizontal: 7,
          borderRadius: 99,
          backgroundColor: brand.goldWash,
          borderWidth: 1,
          borderColor: `${brand.gold}66`,
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_6SemiBold',
            fontSize: 9.5,
            color: light.border.active,
            letterSpacing: 0.38,
          }}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingVertical: 2,
        paddingHorizontal: 7,
        borderRadius: 99,
        backgroundColor: `${accent}22`,
        borderWidth: 1,
        borderColor: `${accent}55`,
      }}
    >
      <Text
        style={{
          fontFamily: 'Freesentation_6SemiBold',
          fontSize: 9.5,
          color: accent,
          letterSpacing: 0.38,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
