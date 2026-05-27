/**
 * /knowledge/vintage/[regionId]/chart — 빈티지 10년 차트 화면
 *
 * 핸드오프 knowledge-c-light-vintage.jsx VintageChartScreen 기반 (line 338~403).
 * - SegmentedControl 필터 + BarChart + LegendItem + YearNote + TipCard
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { useVintageChart } from '@/hooks/use-knowledge';
import { currentLocale } from '@/lib/i18n';
import { SectionLabel, SegmentedControl, VintageBarChart } from '@/components/knowledge';

function colorForScore(score: number): string {
  if (score >= 95) return '#7a1e2d';
  if (score >= 90) return '#B89438';
  if (score >= 85) return '#8B7560';
  return '#A89580';
}

export default function VintageChartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { regionId } = useLocalSearchParams<{ regionId: string }>();
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const pageBg = isDark ? dark.bg.deepest : ivory.bg.page1;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const goldColor = isDark ? brand.gold : '#A07F2E';
  const goldWash = isDark ? '#2A1C20' : '#F2E5BD';

  const [activeFilter, setActiveFilter] = useState(0);

  const { chart } = useVintageChart(regionId ?? '');

  const filterOptions = [
    t('knowledge.vintage.filterLeft'),
    t('knowledge.vintage.filterRight'),
    t('knowledge.vintage.filterWhite'),
  ];

  if (!chart) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 14, color: tokens.text.muted }}>
            {t('knowledge.vintage.empty')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const regionName = locale === 'ko' ? chart.regionName.ko : chart.regionName.en;
  const firstYear = chart.years.length > 0 ? chart.years[0]!.year : '';
  const lastYear = chart.years.length > 0 ? chart.years[chart.years.length - 1]!.year : '';
  const yearRange = `${firstYear} — ${lastYear}`;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
      {/* Back header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? tokens.border.default : ivory.border,
          backgroundColor: pageBg,
        }}
      >
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ChevronLeft size={20} strokeWidth={1.5} color={tokens.text.secondary} />
              <View>
                <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 14, color: tokens.text.secondary }}>
                  {regionName} {t('knowledge.tabs.vintage')}
                </Text>
                <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, color: tokens.text.muted, marginTop: 1 }}>
                  {yearRange}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter bar */}
        <View style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 16 }}>
          <SegmentedControl
            options={filterOptions}
            activeIndex={activeFilter}
            onChange={setActiveFilter}
          />
        </View>

        {/* Bar chart */}
        <View style={{ paddingHorizontal: 22, paddingBottom: 18 }}>
          <VintageBarChart years={chart.years} />
        </View>

        {/* Legend */}
        <View
          style={{
            marginHorizontal: 22,
            marginBottom: 22,
            padding: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            flexDirection: 'row',
            justifyContent: 'space-around',
            ...shadows.sm,
          }}
        >
          {[
            { color: '#7a1e2d', range: '95+', label: 'Outstanding' },
            { color: '#B89438', range: '90–94', label: 'Excellent' },
            { color: '#8B7560', range: '85–89', label: 'Good' },
            { color: '#A89580', range: '80–84', label: 'Average' },
          ].map((item) => (
            <View key={item.range} style={{ alignItems: 'center', gap: 3 }}>
              <View style={{ width: 14, height: 6, borderRadius: 2, backgroundColor: item.color }} />
              <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 11, color: tokens.text.primary, fontWeight: '600' }}>
                {item.range}
              </Text>
              <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 8.5, color: tokens.text.muted, letterSpacing: 0.34 }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Year notes */}
        <SectionLabel
          label={t('knowledge.vintage.oneLiners')}
          paddingHorizontal={22}
          marginBottom={10}
        />
        <View style={{ paddingHorizontal: 22, gap: 6, marginBottom: 22 }}>
          {chart.years.map(({ year, score, highlight, note }) => {
            const noteText = locale === 'ko' ? note.ko : note.en;
            const scoreColor = colorForScore(score);
            return (
              <View
                key={year}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  backgroundColor: highlight ? goldWash : cardBg,
                  borderWidth: 1,
                  borderColor: highlight ? `${goldColor}88` : cardBorder,
                  ...shadows.sm,
                }}
              >
                {/* Year */}
                <Text
                  style={{
                    fontFamily: 'PlayfairDisplay_400Regular',
                    fontSize: 16,
                    color: tokens.text.primary,
                    letterSpacing: -0.16,
                    minWidth: 36,
                  }}
                >
                  {year}
                </Text>

                {/* Score badge */}
                <View
                  style={{
                    paddingVertical: 2,
                    paddingHorizontal: 8,
                    borderRadius: 99,
                    backgroundColor: `${scoreColor}22`,
                    borderWidth: 1,
                    borderColor: `${scoreColor}66`,
                    minWidth: 32,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'PlayfairDisplay_400Regular',
                      fontStyle: 'italic',
                      fontSize: 10,
                      fontWeight: '700',
                      color: scoreColor,
                    }}
                  >
                    {score}
                  </Text>
                </View>

                {/* Note */}
                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 11.5,
                    color: tokens.text.secondary,
                    lineHeight: 16.1,
                  }}
                >
                  {noteText}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Tip card */}
        <View
          style={{
            marginHorizontal: 22,
            marginBottom: 24,
            padding: 14,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: goldWash,
            borderWidth: 1,
            borderColor: `${goldColor}66`,
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 9.5,
              color: goldColor,
              letterSpacing: 1.33,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {t('knowledge.vintage.tipLabel')}
          </Text>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12.5,
              color: tokens.text.primary,
              lineHeight: 20,
            }}
          >
            {locale === 'ko' ? chart.tip.ko : chart.tip.en}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
