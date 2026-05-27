import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { ScoreArc } from './score-arc';
import { TagChip } from './tag-chip';
import type { VintageEntry } from '@/lib/mock/knowledge';

interface VintageListCardProps {
  vintage: VintageEntry;
  onPress: (id: string) => void;
}

export function VintageListCard({ vintage, onPress }: VintageListCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const locale = currentLocale();

  return (
    <View>
      <Pressable
        onPress={() => onPress(vintage.id)}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        accessibilityRole="button"
        accessibilityLabel={`${vintage.year} ${locale === 'ko' ? vintage.region.ko : vintage.region.en}`}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 14,
            padding: 14,
            borderRadius: 12,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            ...shadows.sm,
          }}
        >
          <ScoreArc value={vintage.score} size={52} />

          <View style={{ flex: 1, minWidth: 0 }}>
            {/* Year + region */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_400Regular',
                  fontSize: 22,
                  color: tokens.text.primary,
                  letterSpacing: -0.22,
                }}
              >
                {vintage.year}
              </Text>
              <Text
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 12,
                  color: tokens.text.secondary,
                }}
              >
                {locale === 'ko' ? vintage.region.ko : vintage.region.en}
              </Text>
            </View>

            {/* Chips */}
            <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginBottom: 7 }}>
              <TagChip
                label={locale === 'ko' ? vintage.climate.ko : vintage.climate.en}
                variant="accent"
                accent={vintage.accentColor}
              />
              <TagChip
                label={locale === 'ko' ? vintage.tag.ko : vintage.tag.en}
                variant="gold"
              />
            </View>

            {/* Summary */}
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11.5,
                color: tokens.text.secondary,
                lineHeight: 17.25,
              }}
              numberOfLines={2}
            >
              {locale === 'ko' ? vintage.summary.ko : vintage.summary.en}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
