import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, withAlpha } from '@/lib/design-tokens';

interface CalloutProps {
  children: React.ReactNode;
}

export function Callout({ children }: CalloutProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const goldBorder = isDark ? brand.gold : light.border.active;

  return (
    <View
      style={{
        marginTop: 4,
        marginBottom: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderLeftWidth: 3,
        borderLeftColor: goldBorder,
        backgroundColor: withAlpha(brand.goldWash, 0.4),
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
    >
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontStyle: 'italic',
          fontSize: 14.5,
          color: tokens.text.primary,
          lineHeight: 22.5,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
