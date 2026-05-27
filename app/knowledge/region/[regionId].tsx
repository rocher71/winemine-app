/**
 * /knowledge/region/[regionId] — 지역 상세 화면
 *
 * 국가 → 지역 → 아펠라시옹 드릴다운 지원 (parentId 기반).
 */
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { useRegionDetail } from '@/hooks/use-knowledge';
import { currentLocale } from '@/lib/i18n';
import { RegionFlag, SectionLabel, TagChip } from '@/components/knowledge';

export default function RegionDetailScreen() {
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
  const goldColor = isDark ? brand.gold : light.border.active;

  const { region, children } = useRegionDetail(regionId ?? '');

  if (!region) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 14, color: tokens.text.muted }}>
            Region not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const name = locale === 'ko' ? region.name.ko : region.name.en;

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
                {t('knowledge.tabs.region')}
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
        {/* Hero flag */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 }}>
          <RegionFlag accent={region.accent} code={region.nameLatin.slice(0, 3)} height={120} />
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Title */}
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 26,
              color: tokens.text.primary,
              letterSpacing: -0.26,
              marginBottom: 4,
            }}
          >
            {name}
          </Text>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 13,
              color: tokens.text.muted,
              marginBottom: 16,
            }}
          >
            {region.nameLatin} · {region.climate}
          </Text>

          {/* Grapes */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {region.grapes.map((grape, i) => (
              <TagChip key={i} label={grape} variant="accent" accent={region.accent} />
            ))}
          </View>

          {/* Description */}
          <SectionLabel
            label={t('knowledge.region.styleProfile')}
            paddingHorizontal={0}
            marginBottom={10}
          />
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 14,
              color: tokens.text.secondary,
              lineHeight: 22.4,
              marginBottom: 24,
            }}
          >
            {locale === 'ko' ? region.description.ko : region.description.en}
          </Text>

          {/* Stats */}
          {Object.keys(region.stats).length > 0 && (
            <>
              <SectionLabel
                label={t('knowledge.region.tierSystem')}
                paddingHorizontal={0}
                marginBottom={10}
              />
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {Object.entries(region.stats).map(([key, val]) => (
                  <View
                    key={key}
                    style={{
                      flex: 1,
                      minWidth: 100,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: cardBg,
                      borderWidth: 1,
                      borderColor: cardBorder,
                      ...shadows.sm,
                    }}
                  >
                    <Text style={{ fontFamily: 'Freesentation_7Bold', fontSize: 9.5, color: goldColor, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
                      {key}
                    </Text>
                    <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: tokens.text.primary }}>
                      {val}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Sub-regions / appellations */}
          {children.length > 0 && (
            <>
              <SectionLabel
                label={region.type === 'country' ? t('knowledge.region.subRegions') : t('knowledge.region.subzones')}
                paddingHorizontal={0}
                marginBottom={10}
              />
              <View
                style={{
                  borderRadius: 12,
                  backgroundColor: cardBg,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  overflow: 'hidden',
                  marginBottom: 24,
                }}
              >
                {children.map((child, idx) => {
                  const childName = locale === 'ko' ? child.name.ko : child.name.en;
                  return (
                    <View key={child.id}>
                      <Pressable
                        onPress={() => router.push(`/knowledge/region/${child.id}` as never)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        accessibilityRole="button"
                        accessibilityLabel={childName}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 13,
                            paddingHorizontal: 14,
                            borderBottomWidth: idx < children.length - 1 ? 0.5 : 0,
                            borderBottomColor: tokens.border.default,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 14, color: tokens.text.primary }}>
                              {childName}
                            </Text>
                            <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, color: tokens.text.muted, marginTop: 2 }}>
                              {child.grapes.slice(0, 2).join(' · ')}
                            </Text>
                          </View>
                          <ChevronRight size={16} strokeWidth={1.5} color={tokens.text.muted} />
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
