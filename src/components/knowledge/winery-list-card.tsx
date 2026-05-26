import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { BottleMini } from './bottle-mini';
import type { Winery } from '@/lib/mock/knowledge';

interface WineryListCardProps {
  winery: Winery;
  onPress: (id: string) => void;
}

export function WineryListCard({ winery, onPress }: WineryListCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const goldColor = isDark ? brand.gold : brand.goldDeep;
  const locale = currentLocale();

  return (
    <View>
      <Pressable
        onPress={() => onPress(winery.id)}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        accessibilityRole="button"
        accessibilityLabel={winery.shortName}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            padding: 14,
            borderRadius: 12,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            ...shadows.sm,
          }}
        >
          <BottleMini color={winery.accentColor} width={26} height={78} />

          <View style={{ flex: 1, minWidth: 0 }}>
            {/* Flag + location */}
            <Text
              style={{
                fontFamily: 'Freesentation_7Bold',
                fontSize: 10,
                color: goldColor,
                letterSpacing: 1,
                marginBottom: 3,
                textTransform: 'uppercase',
              }}
            >
              {winery.country} · {locale === 'ko' ? winery.location.ko : winery.location.en}
            </Text>

            {/* Short name */}
            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: 16,
                color: tokens.text.primary,
                letterSpacing: -0.08,
                marginBottom: 3,
              }}
            >
              {winery.shortName}
            </Text>

            {/* Flagship — italic */}
            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontStyle: 'italic',
                fontSize: 11.5,
                color: tokens.text.muted,
                marginBottom: 6,
              }}
            >
              {winery.flagship}
            </Text>

            {/* Description — 2-line clamp */}
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11.5,
                color: tokens.text.secondary,
                lineHeight: 17.25,
              }}
              numberOfLines={2}
            >
              {locale === 'ko' ? winery.description.ko : winery.description.en}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
