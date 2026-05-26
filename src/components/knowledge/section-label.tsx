import React from 'react';
import { View, Text } from 'react-native';
import { light, brand } from '@/lib/design-tokens';
import { useColorScheme } from 'nativewind';

interface SectionLabelProps {
  label: string;
  paddingHorizontal?: number;
  marginBottom?: number;
}

export function SectionLabel({ label, paddingHorizontal = 20, marginBottom = 12 }: SectionLabelProps) {
  const { colorScheme } = useColorScheme();
  const goldColor = colorScheme === 'light' ? light.border.active : brand.gold;

  return (
    <View style={{ paddingHorizontal, marginBottom }}>
      <Text
        style={{
          fontFamily: 'Freesentation_7Bold',
          fontSize: 11,
          color: goldColor,
          letterSpacing: 1.76,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
