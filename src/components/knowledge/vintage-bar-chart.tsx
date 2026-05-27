import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import type { VintageYearScore } from '@/lib/mock/knowledge';

interface Props {
  years: VintageYearScore[];
}

const SCORE_MAX = 100;
const SCORE_MIN = 82;
const CHART_HEIGHT = 156;
const LEFT_GUTTER = 22;

function colorForScore(score: number): string {
  if (score >= 95) return '#7a1e2d';
  if (score >= 90) return '#B89438';
  if (score >= 85) return '#8B7560';
  return '#A89580';
}

const REFERENCE_LINES = [
  { score: 95, label: '95' },
  { score: 90, label: '90' },
  { score: 85, label: '85' },
];

export function VintageBarChart({ years }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const borderSoft = isDark ? '#38243A' : '#E0D2BC';

  return (
    <View
      style={{
        padding: 16,
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderRadius: 12,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: cardBorder,
        ...shadows.sm,
      }}
    >
      {/* Plot area */}
      <View style={{ position: 'relative', height: CHART_HEIGHT }}>
        {/* Reference lines */}
        {REFERENCE_LINES.map(({ score, label }) => {
          const topPct = ((SCORE_MAX - score) / (SCORE_MAX - SCORE_MIN)) * 100;
          return (
            <View
              key={score}
              style={{
                position: 'absolute',
                left: LEFT_GUTTER,
                right: 4,
                top: `${topPct}%` as unknown as number,
                borderTopWidth: 1,
                borderTopColor: borderSoft,
                borderStyle: 'dashed',
              }}
            >
              <Text
                style={{
                  position: 'absolute',
                  left: -LEFT_GUTTER,
                  top: -8,
                  fontFamily: 'PlayfairDisplay_400Regular',
                  fontStyle: 'italic',
                  fontSize: 9,
                  color: tokens.text.muted,
                  width: LEFT_GUTTER - 2,
                  textAlign: 'right',
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}

        {/* Bars row */}
        <View
          style={{
            position: 'absolute',
            left: LEFT_GUTTER,
            right: 4,
            top: 0,
            bottom: 0,
            flexDirection: 'row',
            gap: 4,
            alignItems: 'flex-end',
          }}
        >
          {years.map(({ year, score, highlight }) => {
            const heightPct = ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
            const barColor = colorForScore(score);
            return (
              <View
                key={year}
                style={{ flex: 1, position: 'relative', height: '100%', justifyContent: 'flex-end' }}
                accessibilityRole="none"
                accessibilityLabel={`${String(year).slice(2)} ${score}`}
              >
                {/* Score label above highlighted bar */}
                {highlight && (
                  <Text
                    style={{
                      position: 'absolute',
                      top: -20,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      fontFamily: 'PlayfairDisplay_700Bold',
                      fontSize: 11,
                      color: tokens.text.primary,
                    }}
                  >
                    {score}
                  </Text>
                )}
                <View
                  style={{
                    height: `${heightPct}%`,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    borderBottomLeftRadius: 2,
                    borderBottomRightRadius: 2,
                    backgroundColor: barColor,
                    ...(highlight
                      ? { borderWidth: 2, borderColor: tokens.text.primary }
                      : {}),
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* X-axis */}
      <View
        style={{
          flexDirection: 'row',
          marginTop: 6,
          paddingLeft: LEFT_GUTTER,
          gap: 4,
        }}
      >
        {years.map(({ year, highlight }) => (
          <View key={year} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: highlight ? 'Freesentation_7Bold' : 'Freesentation_5Medium',
                fontSize: 9.5,
                color: highlight ? tokens.text.primary : tokens.text.muted,
                letterSpacing: 0.2,
              }}
            >
              &apos;{String(year).slice(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
