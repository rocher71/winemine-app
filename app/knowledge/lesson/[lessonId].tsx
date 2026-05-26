/**
 * /knowledge/lesson/[lessonId] — 레슨 상세 화면
 *
 * 핸드오프 knowledge-c-light-details.jsx LessonDetailScreen 기반.
 * - 섹션별 ContentBlock 렌더 (paragraph / callout / compare / price-chart)
 * - CTA: 완료 / 공유
 * - StreakBar 상단 표시
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Share2, Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { useLessonDetail, useLessons } from '@/hooks/use-knowledge';
import { currentLocale } from '@/lib/i18n';
import { CompareCard, SectionLabel, StreakBar } from '@/components/knowledge';

function ContentBlockView({ block }: { block: NonNullable<ReturnType<typeof useLessonDetail>['lesson']>['body'][0]['content'][0] }) {
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;

  if (block.type === 'paragraph') {
    return (
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 15,
          color: tokens.text.secondary,
          lineHeight: 24,
          marginBottom: 16,
        }}
      >
        {locale === 'ko' ? block.text.ko : block.text.en}
      </Text>
    );
  }

  if (block.type === 'callout') {
    return (
      <View
        style={{
          padding: 14,
          borderRadius: 10,
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: cardBorder,
          borderLeftWidth: 3,
          borderLeftColor: isDark ? brand.gold : light.border.active,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_400Regular',
            fontStyle: 'italic',
            fontSize: 14,
            color: tokens.text.primary,
            lineHeight: 21,
          }}
        >
          {locale === 'ko' ? block.text.ko : block.text.en}
        </Text>
      </View>
    );
  }

  if (block.type === 'compare') {
    return (
      <View style={{ marginBottom: 16 }}>
        <CompareCard left={block.left} right={block.right} />
      </View>
    );
  }

  if (block.type === 'price-chart') {
    return (
      <View style={{ marginBottom: 16 }}>
        {block.rows.map((row, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: 0.5,
              borderBottomColor: tokens.border.default,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 13, color: tokens.text.primary }}>
                {row.name}
              </Text>
              <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, color: tokens.text.muted }}>
                {row.region}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'PlayfairDisplay_700Bold',
                fontSize: 14,
                color: isDark ? brand.gold : light.border.active,
              }}
            >
              {row.display}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

export default function LessonDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const pageBg = isDark ? dark.bg.deepest : ivory.bg.page1;
  const goldColor = isDark ? brand.gold : light.border.active;

  const [done, setDone] = useState(false);
  const { lesson } = useLessonDetail(lessonId ?? '');
  const { streak } = useLessons();

  if (!lesson) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 14, color: tokens.text.muted }}>
            Lesson not found
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
                {t('knowledge.lesson.todayLabel')}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        <View>
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ padding: 8 }}>
              <Share2 size={18} strokeWidth={1.5} color={tokens.text.secondary} />
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak bar — history link wired (D2) */}
        <StreakBar
          streak={streak}
          onHistoryPress={() => router.push('/knowledge/lesson/history' as never)}
        />

        {/* Lesson hero */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}>
          {/* Eyebrow */}
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 11,
              color: brand.wineRed,
              letterSpacing: 1.54,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Day {lesson.day} · {locale === 'ko' ? lesson.category.ko : lesson.category.en}
          </Text>

          {/* Title */}
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 26,
              color: tokens.text.primary,
              lineHeight: 32.5,
              letterSpacing: -0.26,
              marginBottom: 8,
            }}
          >
            {locale === 'ko' ? lesson.title.ko : lesson.title.en}
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 13,
              color: tokens.text.muted,
              marginBottom: 24,
            }}
          >
            {locale === 'ko' ? lesson.subtitle.ko : lesson.subtitle.en} · {lesson.readMinutes} min
          </Text>

          {/* Sections */}
          {lesson.body.map((section) => (
            <View key={section.idx} style={{ marginBottom: 24 }}>
              <SectionLabel label={locale === 'ko' ? section.title.ko : section.title.en} paddingHorizontal={0} marginBottom={12} />
              {section.content.map((block, bi) => (
                <ContentBlockView key={bi} block={block} />
              ))}
            </View>
          ))}

          {/* Summary */}
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: isDark ? dark.bg.surfaceUp : light.bg.surfaceUp,
              borderWidth: 1,
              borderColor: tokens.border.default,
              marginBottom: 24,
              ...shadows.sm,
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_7Bold',
                fontSize: 11,
                color: goldColor,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {locale === 'ko' ? '핵심 요약' : 'Summary'}
            </Text>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 14,
                color: tokens.text.secondary,
                lineHeight: 22.4,
              }}
            >
              {locale === 'ko' ? lesson.summary.ko : lesson.summary.en}
            </Text>
          </View>

          {/* CTA buttons */}
          <View style={{ gap: 10 }}>
            <View>
              <Pressable
                onPress={() => router.push(`/knowledge/lesson/${lessonId}/done` as never)}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                accessibilityRole="button"
              >
                <View
                  style={{
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: done ? `${goldColor}33` : goldColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Check size={16} strokeWidth={2.2} color={brand.cream} />
                  <Text style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 14, color: brand.cream }}>
                    {t('knowledge.lesson.completeBtn')}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                accessibilityRole="button"
              >
                <View
                  style={{
                    height: 44,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: tokens.border.default,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 14, color: tokens.text.secondary }}>
                    {t('knowledge.lesson.doneBackBtn')}
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
