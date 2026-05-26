/**
 * /knowledge/vintage/compare — 빈티지 비교 화면
 *
 * 핸드오프 knowledge-c-light-vintage.jsx VintageCompareScreen 기반 (line 553~636).
 * Query params: ?a=bdx19&b=bdx20
 * - YearHero × 2 / CompareRow 리스트 / Radar SVG / Verdict
 */
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { useVintageCompare } from '@/hooks/use-knowledge';
import { currentLocale } from '@/lib/i18n';
import { SectionLabel, ScoreArc, TagChip, RadarChart } from '@/components/knowledge';

export default function VintageCompareScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ a?: string; b?: string }>();
  const aId = params.a ?? 'bdx19';
  const bId = params.b ?? 'bdx20';
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const pageBg = isDark ? dark.bg.deepest : ivory.bg.page1;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const goldColor = isDark ? brand.gold : '#A07F2E';
  const goldWash = isDark ? '#2A1C20' : '#F2E5BD';
  const borderSoft = isDark ? '#38243A' : '#E0D2BC';
  const insetBg = isDark ? dark.bg.card : ivory.bg.inset;

  const { compare, aVintage, bVintage } = useVintageCompare(aId, bId);

  if (!compare || !aVintage || !bVintage) {
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

  const subheading = locale === 'ko' ? compare.subheading.ko : compare.subheading.en;

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
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ChevronLeft size={20} strokeWidth={1.5} color={tokens.text.secondary} />
              <View>
                <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 14, color: tokens.text.secondary }}>
                  {t('knowledge.tabs.vintage')}
                </Text>
                <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, color: tokens.text.muted, marginTop: 1 }}>
                  {subheading}
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
        {/* Heading */}
        <View style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 10 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 11,
              color: goldColor,
              letterSpacing: 1.76,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            HEAD-TO-HEAD
          </Text>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12.5,
              color: tokens.text.secondary,
              lineHeight: 20,
            }}
          >
            {t('knowledge.vintage.compareIntro')}
          </Text>
        </View>

        {/* Side-by-side hero */}
        <View
          style={{
            marginHorizontal: 22,
            marginBottom: 20,
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            flexDirection: 'row',
            ...shadows.sm,
          }}
        >
          {/* Vintage A */}
          <YearHero
            vintage={aVintage}
            tone={brand.wineRed}
            locale={locale}
            tokens={tokens}
          />

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: borderSoft }} />

          {/* Vintage B */}
          <YearHero
            vintage={bVintage}
            tone={'#B89438'}
            locale={locale}
            tokens={tokens}
          />
        </View>

        {/* Compare rows */}
        <SectionLabel
          label={t('knowledge.vintage.keyDiff')}
          paddingHorizontal={22}
          marginBottom={10}
        />
        <View style={{ paddingHorizontal: 22, gap: 6, marginBottom: 24 }}>
          {compare.rows.map((row, idx) => {
            const keyLabel = locale === 'ko' ? row.key.ko : row.key.en;
            return (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: 10,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: cardBg,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  ...shadows.sm,
                }}
              >
                {/* Left value */}
                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Freesentation_5Medium',
                    fontSize: 11.5,
                    color: tokens.text.primary,
                    textAlign: 'right',
                    lineHeight: 15.6,
                  }}
                >
                  {row.left}
                </Text>

                {/* Key label */}
                <View
                  style={{
                    width: 64,
                    paddingVertical: 3,
                    paddingHorizontal: 4,
                    borderRadius: 99,
                    backgroundColor: insetBg,
                    borderWidth: 1,
                    borderColor: borderSoft,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Freesentation_6SemiBold',
                      fontSize: 9,
                      color: tokens.text.muted,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                    numberOfLines={1}
                  >
                    {keyLabel}
                  </Text>
                </View>

                {/* Right value */}
                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Freesentation_5Medium',
                    fontSize: 11.5,
                    color: tokens.text.primary,
                    lineHeight: 15.6,
                  }}
                >
                  {row.right}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Radar section */}
        <View style={{ paddingHorizontal: 22, paddingBottom: 22 }}>
          <SectionLabel
            label={t('knowledge.vintage.styleOverlay')}
            paddingHorizontal={0}
            marginBottom={10}
          />

          {/* Radar card */}
          <View
            style={{
              padding: 14,
              paddingBottom: 10,
              borderRadius: 12,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: cardBorder,
              alignItems: 'center',
              ...shadows.sm,
            }}
          >
            <RadarChart axes={compare.radar} size={220} />
          </View>

          {/* Dot legend */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 10 }}>
            <DotLegend label={`${aVintage.year}`} color={brand.wineRed} />
            <DotLegend label={`${bVintage.year}`} color={'#B89438'} />
          </View>
        </View>

        {/* Verdict */}
        <View
          style={{
            marginHorizontal: 22,
            marginBottom: 28,
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
            {t('knowledge.vintage.verdict')}
          </Text>
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontStyle: 'italic',
              fontSize: 15,
              color: tokens.text.primary,
              lineHeight: 22.5,
            }}
          >
            {locale === 'ko' ? compare.verdict.ko : compare.verdict.en}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Inline sub-components ──

interface YearHeroProps {
  vintage: import('@/lib/mock/knowledge').VintageEntry;
  tone: string;
  locale: string;
  tokens: typeof dark | typeof light;
}

function YearHero({ vintage, tone, locale, tokens }: YearHeroProps) {
  const tagLabel = locale === 'ko' ? vintage.tag.ko : vintage.tag.en;
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        paddingBottom: 16,
      }}
    >
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: 44,
          color: tokens.text.primary,
          letterSpacing: -0.88,
          lineHeight: 44,
          marginBottom: 8,
        }}
      >
        {vintage.year}
      </Text>

      <View
        style={{
          paddingVertical: 3,
          paddingHorizontal: 10,
          borderRadius: 99,
          backgroundColor: `${tone}22`,
          borderWidth: 1,
          borderColor: `${tone}66`,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_7Bold',
            fontSize: 10,
            color: tone,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {tagLabel}
        </Text>
      </View>

      <ScoreArc value={vintage.score} size={64} strokeWidth={3} />
    </View>
  );
}

interface DotLegendProps {
  label: string;
  color: string;
}

function DotLegend({ label, color }: DotLegendProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: color,
        }}
      />
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontStyle: 'italic',
          fontSize: 13,
          color: '#3B2314',
          letterSpacing: 0.26,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
