/**
 * /knowledge/winery/[wineryId] — 와이너리 상세 화면
 *
 * 핸드오프 knowledge-c-light-winery.jsx WineryDetailScreen 기반.
 * - BottleMini hero + 철학 + 라인업 + 그랑크뤼
 */
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { useWineryDetail } from '@/hooks/use-knowledge';
import { currentLocale } from '@/lib/i18n';
import { BottleMini, SectionLabel, TagChip } from '@/components/knowledge';

export default function WineryDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { wineryId } = useLocalSearchParams<{ wineryId: string }>();
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const pageBg = isDark ? dark.bg.deepest : ivory.bg.page1;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const goldColor = isDark ? brand.gold : light.border.active;

  const { winery } = useWineryDetail(wineryId ?? '');

  if (!winery) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 14, color: tokens.text.muted }}>
            Winery not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          borderBottomColor: tokens.border.default,
          backgroundColor: pageBg,
        }}
      >
        <View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ChevronLeft size={20} strokeWidth={1.5} color={tokens.text.secondary} />
              <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 14, color: tokens.text.secondary }}>
                {t('knowledge.tabs.winery')}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 16,
            padding: 20,
            paddingBottom: 24,
          }}
        >
          <BottleMini color={winery.accentColor} width={36} height={108} />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'Freesentation_7Bold',
                fontSize: 11,
                color: goldColor,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {winery.country} · {locale === 'ko' ? winery.location.ko : winery.location.en}
            </Text>
            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: 24,
                color: tokens.text.primary,
                letterSpacing: -0.24,
                marginBottom: 4,
              }}
            >
              {winery.shortName}
            </Text>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 13,
                color: tokens.text.muted,
                marginBottom: 8,
              }}
            >
              {winery.fullName}
            </Text>
            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontStyle: 'italic',
                fontSize: 13,
                color: tokens.text.muted,
              }}
            >
              {winery.flagship}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Est. + acreage chips */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
            <TagChip label={`est. ${winery.established}`} variant="gold" />
            <TagChip label={winery.acreage} variant="accent" accent={winery.accentColor} />
          </View>

          {/* Philosophy */}
          <SectionLabel label={t('knowledge.winery.philosophy')} paddingHorizontal={0} marginBottom={10} />
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 14,
              color: tokens.text.secondary,
              lineHeight: 22.4,
              marginBottom: 24,
            }}
          >
            {locale === 'ko' ? winery.philosophy.ko : winery.philosophy.en}
          </Text>

          {/* Lineup */}
          {winery.lineup.length > 0 && (
            <>
              <SectionLabel label={t('knowledge.winery.lineupTitle')} paddingHorizontal={0} marginBottom={10} />
              <View
                style={{
                  borderRadius: 12,
                  backgroundColor: cardBg,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  overflow: 'hidden',
                  marginBottom: 24,
                  ...shadows.sm,
                }}
              >
                {winery.lineup.map((wine, idx) => (
                  <View
                    key={wine.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth: idx < winery.lineup.length - 1 ? 0.5 : 0,
                      borderBottomColor: tokens.border.default,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 14, color: tokens.text.primary }}>
                        {wine.name}
                      </Text>
                      <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, color: tokens.text.muted, marginTop: 2 }}>
                        {wine.type}{wine.vintage ? ` · ${wine.vintage}` : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Lineup CTA (D3) */}
              <View style={{ marginBottom: 24, marginTop: 6 }}>
                <Pressable
                  onPress={() => router.push(`/knowledge/winery/${winery.id}/lineup` as never)}
                  style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.75 : 1 })}
                  accessibilityRole="button"
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? dark.border.default : ivory.border,
                      backgroundColor: cardBg,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Freesentation_5Medium',
                        fontSize: 13,
                        color: isDark ? dark.text.secondary : ivory.text.secondary,
                        letterSpacing: 0.26,
                      }}
                    >
                      {t('knowledge.winery.lineupBtn', { count: winery.lineup.length })}
                    </Text>
                    <ChevronRight size={15} strokeWidth={1.6} color={isDark ? dark.text.muted : ivory.text.muted} />
                  </View>
                </Pressable>
              </View>
            </>
          )}

          {/* Grand Crus */}
          {winery.grandCrus.length > 0 && (
            <>
              <SectionLabel label={t('knowledge.winery.grandCrus')} paddingHorizontal={0} marginBottom={10} />
              <View style={{ gap: 8, marginBottom: 24 }}>
                {winery.grandCrus.map((cru, idx) => (
                  <View
                    key={idx}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: cardBg,
                      borderWidth: 1,
                      borderColor: cru.highlight ? (isDark ? brand.gold : light.border.active) : cardBorder,
                      ...shadows.sm,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 15, color: tokens.text.primary }}>
                        {cru.name}
                      </Text>
                      <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, color: tokens.text.muted }}>
                        {cru.ha} ha
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Freesentation_4Regular',
                        fontSize: 12,
                        color: tokens.text.secondary,
                        lineHeight: 18,
                      }}
                      numberOfLines={2}
                    >
                      {locale === 'ko' ? cru.desc.ko : cru.desc.en}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
