import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';

import { light, dark, ivory } from '@/lib/design-tokens';

interface Props {
  options: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ options, activeIndex, onChange }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const bgColor = isDark ? dark.bg.surface : ivory.bg.inset;
  const goldColor = isDark ? '#B89438' : '#A07F2E';

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: bgColor,
        borderRadius: 10,
        padding: 3,
        borderWidth: 1,
        borderColor: isDark ? dark.border.default : ivory.border,
      }}
    >
      {options.map((option, idx) => {
        const isActive = idx === activeIndex;
        return (
          <View key={idx} style={{ flex: 1 }}>
            <Pressable
              onPress={() => onChange(idx)}
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <View
                style={{
                  paddingVertical: 7,
                  paddingHorizontal: 4,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: isActive
                    ? (isDark ? dark.bg.card : '#FFFFFF')
                    : 'transparent',
                  borderWidth: isActive ? 1 : 0,
                  borderColor: isActive ? (isDark ? dark.border.active : `${goldColor}55`) : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    fontSize: 11.5,
                    color: isActive ? goldColor : tokens.text.muted,
                    letterSpacing: 0.2,
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
                >
                  {option}
                </Text>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
