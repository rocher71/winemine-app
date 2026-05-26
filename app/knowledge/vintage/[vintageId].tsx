/**
 * /knowledge/vintage/[vintageId] — 빈티지 상세 화면
 *
 * 핸드오프 knowledge-c-light-details.jsx VintageDetailScreen 기반.
 * - ScoreArc hero + 기후 이벤트 타임라인 + 페어링 + 관련 빈티지
 */
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { useVintageDetail } from '@/hooks/use-knowledge';
import { currentLocale } from '@/lib/i18n';
import { ScoreArc, SectionLabel, TagChip } from '@/components/knowledge';

export default function VintageDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { vintageId } = useLocalSearchParams<{ vintageId: string }>();
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const pageBg = isDark ? dark.bg.deepest : ivory.bg.page1;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const goldColor = isDark ? brand.gold : light.border.active;

  const { vintage } = useVintageDetail(vintageId ?? '');

  if (!vintage) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 14, color: tokens.text.muted }}>
            Vintage not found
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
                {t('knowledge.tabs.vintage')}
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
        {/* Hero */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
            padding: 20,
            paddingBottom: 24,
          }}
        >
          <ScoreArc value={vintage.score} size={84} strokeWidth={3} />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: 36,
                color: tokens.text.primary,
                letterSpacing: -0.36,
                lineHeight: 40,
              }}
            >
              {vintage.year}
            </Text>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 14,
                color: tokens.text.secondary,
                marginBottom: 10,
              }}
            >
              {locale === 'ko' ? vintage.region.ko : vintage.region.en}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
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
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Summary */}
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 14,
              color: tokens.text.secondary,
              lineHeight: 22.4,
              marginBottom: 24,
            }}
          >
            {locale === 'ko' ? vintage.summary.ko : vintage.summary.en}
          </Text>

          {/* Climate timeline */}
          {vintage.climateEvents.length > 0 && (
            <>
              <SectionLabel label={t('knowledge.vintage.climateTimeline')} paddingHorizontal={0} marginBottom={10} />
              <View style={{ gap: 8, marginBottom: 24 }}>
                {vintage.climateEvents.map((event, idx) => {
                  const toneColor = event.tone === 'gold'
                    ? (isDark ? brand.gold : light.border.active)
                    : event.tone === 'wine'
                    ? brand.wineRed
                    : tokens.text.muted;

                  return (
                    <View
                      key={idx}
                      style={{
                        flexDirection: 'row',
                        gap: 12,
                        padding: 12,
                        borderRadius: 10,
                        backgroundColor: cardBg,
                        borderWidth: 1,
                        borderColor: cardBorder,
                        ...shadows.sm,
                      }}
                    >
                      <View style={{ width: 3, borderRadius: 2, backgroundColor: toneColor, alignSelf: 'stretch' }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 11, color: toneColor, letterSpacing: 0.44, marginBottom: 2 }}>
                          {event.when.toUpperCase()}
                        </Text>
                        <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 13, color: tokens.text.primary, marginBottom: 2 }}>
                          {event.headline}
                        </Text>
                        <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 12, color: tokens.text.muted }}>
                          {event.body}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Style features */}
          <SectionLabel label={t('knowledge.vintage.styleFeatures')} paddingHorizontal={0} marginBottom={10} />
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginBottom: 24,
              padding: 14,
              borderRadius: 12,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: cardBorder,
              ...shadows.sm,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Freesentation_7Bold', fontSize: 9.5, color: goldColor, letterSpacing: 1.14, textTransform: 'uppercase', marginBottom: 5 }}>
                {locale === 'ko' ? '기후' : 'Climate'}
              </Text>
              <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 13, color: tokens.text.primary }}>
                {locale === 'ko' ? vintage.climate.ko : vintage.climate.en}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: tokens.border.default }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Freesentation_7Bold', fontSize: 9.5, color: goldColor, letterSpacing: 1.14, textTransform: 'uppercase', marginBottom: 5 }}>
                {locale === 'ko' ? '특징' : 'Character'}
              </Text>
              <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 13, color: tokens.text.primary }}>
                {locale === 'ko' ? vintage.tag.ko : vintage.tag.en}
              </Text>
            </View>
          </View>

          {/* Food Pairing section (E2) */}
          {vintage.pairing && vintage.pairing.length > 0 && (
            <View style={{ marginTop: 26 }}>
              <SectionLabel label={t('knowledge.vintage.pairing')} paddingHorizontal={0} marginBottom={10} />
              <View
                style={{
                  borderRadius: 12,
                  backgroundColor: cardBg,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  overflow: 'hidden',
                  ...shadows.sm,
                }}
              >
                {vintage.pairing.map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth: idx < vintage.pairing!.length - 1 ? 0.5 : 0,
                      borderBottomColor: cardBorder,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Freesentation_6SemiBold',
                        fontSize: 13,
                        color: tokens.text.primary,
                        letterSpacing: 0.13,
                        marginBottom: 3,
                      }}
                    >
                      {locale === 'ko' ? item.food.ko : item.food.en}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Freesentation_4Regular',
                        fontSize: 11,
                        color: isDark ? dark.text.muted : ivory.text.muted,
                        lineHeight: 16.5,
                        letterSpacing: 0.22,
                      }}
                    >
                      {locale === 'ko' ? item.note.ko : item.note.en}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Related Vintages section (E2) */}
          {vintage.relatedVintages && vintage.relatedVintages.length > 0 && (
            <View style={{ marginTop: 26 }}>
              <SectionLabel label={t('knowledge.vintage.related')} paddingHorizontal={0} marginBottom={10} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {vintage.relatedVintages.map((rel) => (
                  <View
                    key={rel.id}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: cardBg,
                      borderWidth: 1,
                      borderColor: cardBorder,
                      alignItems: 'center',
                      ...shadows.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'PlayfairDisplay_400Regular',
                        fontSize: 20,
                        color: tokens.text.primary,
                        letterSpacing: -0.4,
                        fontWeight: '500',
                        lineHeight: 24,
                        marginBottom: 4,
                      }}
                    >
                      {rel.year}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 5,
                        backgroundColor: `${vintage.accentColor}18`,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Freesentation_7Bold',
                          fontSize: 11,
                          color: vintage.accentColor,
                          letterSpacing: 0.44,
                        }}
                      >
                        {rel.score}pt
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Freesentation_4Regular',
                        fontSize: 10,
                        color: isDark ? dark.text.muted : ivory.text.muted,
                        letterSpacing: 0.4,
                        textAlign: 'center',
                      }}
                      numberOfLines={1}
                    >
                      {locale === 'ko' ? rel.tag.ko : rel.tag.en}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* CTA row — Chart / Compare */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => router.push(`/knowledge/vintage/${vintage.region.en.toLowerCase()}/chart` as never)}
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                accessibilityRole="button"
                accessibilityLabel={locale === 'ko' ? '빈티지 차트 보기' : 'View vintage chart'}
              >
                <View
                  style={{
                    paddingVertical: 11,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: isDark ? dark.bg.surface : ivory.bg.surface,
                    borderWidth: 1,
                    borderColor: cardBorder,
                  }}
                >
                  <Text style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 13, color: goldColor }}>
                    {locale === 'ko' ? '차트 보기' : 'View Chart'}
                  </Text>
                </View>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => router.push(`/knowledge/vintage/compare?a=bdx19&b=bdx20` as never)}
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                accessibilityRole="button"
                accessibilityLabel={locale === 'ko' ? '빈티지 비교' : 'Compare vintages'}
              >
                <View
                  style={{
                    paddingVertical: 11,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: goldColor,
                  }}
                >
                  <Text style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 13, color: '#FFFFFF' }}>
                    {locale === 'ko' ? '비교하기' : 'Compare'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
