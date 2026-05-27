import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, ivory, shadows } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { RegionFlag } from './region-flag';
import type { Region } from '@/lib/mock/knowledge';

interface CountryCardProps {
  region: Region;
  onPress: (id: string) => void;
}

export function CountryCard({ region, onPress }: CountryCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const locale = currentLocale();

  return (
    <View>
      <Pressable
        onPress={() => onPress(region.id)}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        accessibilityRole="button"
        accessibilityLabel={locale === 'ko' ? region.name.ko : region.name.en}
      >
        <View
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            ...shadows.sm,
          }}
        >
          <RegionFlag accent={region.accent} code={region.nameLatin.slice(0, 3)} height={78} />
          <View style={{ padding: 10, paddingHorizontal: 12, paddingBottom: 12 }}>
            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: 15,
                color: tokens.text.primary,
                marginBottom: 2,
              }}
            >
              {locale === 'ko' ? region.name.ko : region.name.en}
            </Text>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10.5,
                color: tokens.text.muted,
                lineHeight: 14.7,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {region.grapes[0]}
            </Text>
            {region.stats.regions && (
              <Text
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 9.5,
                  color: tokens.text.disabled,
                  letterSpacing: 0.38,
                }}
              >
                {region.stats.regions} regions
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}
