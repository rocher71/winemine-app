import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, shadows } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import type { CompareCol as CompareColData } from '@/lib/mock/knowledge';

interface CompareCardProps {
  left: CompareColData;
  right: CompareColData;
}

interface CompareColProps {
  data: CompareColData;
  side: 'left' | 'right';
}

function CompareColView({ data, side }: CompareColProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const locale = currentLocale();
  const accentColor = side === 'left' ? brand.wineRed : (isDark ? brand.gold : light.border.active);

  return (
    <View style={{ flex: 1, padding: 14 }}>
      {/* Column header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accentColor }} />
        <Text
          style={{
            fontFamily: 'Freesentation_7Bold',
            fontSize: 10,
            color: accentColor,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {locale === 'ko' ? data.name.ko : data.name.en}
        </Text>
      </View>

      {/* Items */}
      {data.items.map((item, i) => (
        <Text
          key={i}
          style={{
            fontFamily: i < 2 ? 'PlayfairDisplay_400Regular' : 'Freesentation_6SemiBold',
            fontStyle: i < 2 ? 'italic' : 'normal',
            fontSize: i < 2 ? 14 : 11,
            color: i < 2 ? tokens.text.primary : tokens.text.muted,
            marginBottom: 4,
          }}
        >
          {item}
        </Text>
      ))}
    </View>
  );
}

export function CompareCard({ left, right }: CompareCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const cardBg = isDark ? dark.bg.surfaceUp : light.bg.surfaceUp;

  return (
    <View
      style={{
        borderRadius: 12,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: tokens.border.default,
        overflow: 'hidden',
        flexDirection: 'row',
        ...shadows.sm,
      }}
    >
      <CompareColView data={left} side="left" />
      <View style={{ width: 1, backgroundColor: tokens.border.default }} />
      <CompareColView data={right} side="right" />
    </View>
  );
}
