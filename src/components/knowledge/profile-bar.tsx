import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand } from '@/lib/design-tokens';
import type { ProfileAxis } from '@/lib/mock/knowledge';

interface ProfileBarProps {
  axes: ProfileAxis[];
}

const SEGMENTS = [1, 2, 3, 4, 5];

export function ProfileBar({ axes }: ProfileBarProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const goldFill = isDark ? brand.gold : light.border.active;
  const goldBorder = brand.goldDeep;
  const emptyBg = isDark ? dark.bg.inset : light.bg.inset;

  return (
    <View style={{ gap: 9 }}>
      {axes.map((axis) => (
        <View key={axis.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Fixed-width label */}
          <Text
            style={{
              width: 56,
              fontFamily: 'Freesentation_5Medium',
              fontSize: 11,
              color: tokens.text.secondary,
            }}
            numberOfLines={1}
          >
            {axis.label}
          </Text>

          {/* 5 segments */}
          <View style={{ flex: 1, flexDirection: 'row', gap: 3 }}>
            {SEGMENTS.map((n) => {
              const filled = n <= axis.value;
              return (
                <View
                  key={n}
                  style={{
                    flex: 1,
                    height: 7,
                    borderRadius: 2,
                    backgroundColor: filled ? goldFill : emptyBg,
                    borderWidth: 1,
                    borderColor: filled ? goldBorder : tokens.border.default,
                  }}
                />
              );
            })}
          </View>

          {/* Value number */}
          <Text
            style={{
              width: 16,
              fontFamily: 'PlayfairDisplay_400Regular',
              fontStyle: 'italic',
              fontSize: 11,
              color: tokens.text.muted,
              textAlign: 'right',
            }}
          >
            {axis.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
