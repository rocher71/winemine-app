import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Flame } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, ivory, shadows, gradients, typography, withAlpha } from '@/lib/design-tokens';
import { useTranslation } from 'react-i18next';
import type { Lesson } from '@/lib/mock/knowledge';
import { currentLocale } from '@/lib/i18n';

interface TodayLessonCardProps {
  lesson: Lesson;
  onPress: (id: string) => void;
  /**
   * 'knowledge' (기본) — knowledge 탭 ivory 팔레트, 3px 3-stop accent.
   * 'home' — Editorial Stack 홈, 4px 2-stop gold→wine top-rule, streak chip, 전역 light/dark 토큰.
   */
  variant?: 'knowledge' | 'home';
  /** home variant streak chip 일수 (연속 N일). 미지정 시 chip 미표시 */
  streakDays?: number;
}

export function TodayLessonCard({ lesson, onPress, variant = 'knowledge', streakDays }: TodayLessonCardProps) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const isHome = variant === 'home';

  // knowledge 탭은 ivory(warm cream) 팔레트, home은 전역 light surface.
  const cardBg = isHome ? tokens.bg.surface : isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isHome
    ? withAlpha(brand.gold, isDark ? 0.2 : 0.24)
    : isDark
      ? dark.border.default
      : ivory.border;
  const insetBg = isDark ? dark.bg.inset : light.bg.inset;
  const goldColor = isDark ? brand.gold : light.border.active;

  const [done, setDone] = useState(false);

  return (
    <View
      style={{
        marginHorizontal: isHome ? 22 : 20,
        marginBottom: isHome ? 0 : 24,
        borderRadius: isHome ? 18 : 14,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: cardBorder,
        overflow: 'hidden',
        position: 'relative',
        ...(isHome ? shadows.homeCard : shadows.sm),
      }}
    >
      {/* Top accent — knowledge: 3px 3-stop / home: 4px 2-stop gold→wine */}
      {isHome ? (
        <LinearGradient
          colors={gradients.homeLessonRule.colors as unknown as readonly [string, string, ...string[]]}
          start={gradients.homeLessonRule.start}
          end={gradients.homeLessonRule.end}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
        />
      ) : (
        <LinearGradient
          colors={gradients.knowledgeTodayAccent.colors as string[]}
          locations={gradients.knowledgeTodayAccent.locations as number[]}
          start={gradients.knowledgeTodayAccent.start}
          end={gradients.knowledgeTodayAccent.end}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }}
        />
      )}

      <View style={{ padding: isHome ? 17 : 18, paddingTop: isHome ? 18 : 21 }}>
        {/* Meta row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: isHome ? 12 : 10 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 11,
              color: brand.wineRed,
              letterSpacing: isHome ? 1.32 : 1.54,
              textTransform: 'uppercase',
            }}
          >
            {isHome
              ? t('home.lessonCard.dayLabel', { day: lesson.day })
              : `${t('knowledge.lesson.todayLabel')} · Day ${lesson.day}`}
          </Text>
          {isHome && streakDays != null ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingVertical: 4,
                paddingHorizontal: 9,
                borderRadius: 999,
                backgroundColor: withAlpha(brand.gold, 0.12),
                borderWidth: 1,
                borderColor: withAlpha(brand.gold, 0.24),
              }}
            >
              <Flame size={11} strokeWidth={2} color={isDark ? brand.gold : brand.goldDeep} />
              <Text
                allowFontScaling={false}
                style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 11, color: isDark ? brand.gold : brand.goldDeep }}
              >
                {t('home.lessonCard.streakLabel', { days: streakDays })}
              </Text>
            </View>
          ) : (
            !isHome && (
              <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, color: tokens.text.muted }}>
                {locale === 'ko' ? lesson.category.ko : lesson.category.en}
              </Text>
            )
          )}
        </View>

        {/* Title */}
        <Text
          style={{
            fontFamily: isHome ? typography.homeLessonTitle.family : 'PlayfairDisplay_400Regular',
            fontSize: isHome ? typography.homeLessonTitle.size : 22,
            color: tokens.text.primary,
            lineHeight: isHome ? typography.homeLessonTitle.lineHeight : 27.5,
            letterSpacing: isHome ? typography.homeLessonTitle.letterSpacing : -0.22,
            marginBottom: 12,
          }}
        >
          {locale === 'ko' ? lesson.title.ko : lesson.title.en}
        </Text>

        {/* Body preview */}
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 13.5,
            color: tokens.text.secondary,
            lineHeight: isHome ? 20.9 : 22.95,
            marginBottom: 16,
          }}
          numberOfLines={3}
        >
          {locale === 'ko' ? lesson.summary.ko : lesson.summary.en}
        </Text>

        {/* Summary inset — 3-cell (읽기 / 주제 / 진행 or 날짜) */}
        <View
          style={{
            padding: 12,
            paddingHorizontal: 14,
            borderRadius: isHome ? 12 : 10,
            backgroundColor: insetBg,
            borderWidth: 0.5,
            borderColor: cardBorder,
            marginBottom: 16,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Freesentation_7Bold', fontSize: 9.5, color: goldColor, letterSpacing: 1.14, textTransform: 'uppercase', marginBottom: 5 }}>
              {isHome ? t('home.lessonCard.metaRead') : locale === 'ko' ? '읽기' : 'Time'}
            </Text>
            <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 12, color: tokens.text.primary }}>
              {lesson.readMinutes} min
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: tokens.border.default, alignSelf: 'stretch' }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Freesentation_7Bold', fontSize: 9.5, color: goldColor, letterSpacing: 1.14, textTransform: 'uppercase', marginBottom: 5 }}>
              {isHome ? t('home.lessonCard.metaTopic') : locale === 'ko' ? '주제' : 'Topic'}
            </Text>
            <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 12, color: tokens.text.primary }}>
              {locale === 'ko' ? lesson.category.ko : lesson.category.en}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: tokens.border.default, alignSelf: 'stretch' }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Freesentation_7Bold', fontSize: 9.5, color: goldColor, letterSpacing: 1.14, textTransform: 'uppercase', marginBottom: 5 }}>
              {isHome ? t('home.lessonCard.metaProgress') : locale === 'ko' ? '날짜' : 'Date'}
            </Text>
            <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 12, color: tokens.text.primary }}>
              Day {lesson.day}
            </Text>
          </View>
        </View>

        {/* CTA button — 3-layer Pressable. home은 gold gradient pill */}
        <View>
          <Pressable
            onPress={() => {
              setDone(true);
              onPress(lesson.id);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            accessibilityRole="button"
            accessibilityLabel={t('knowledge.lesson.completeBtn')}
          >
            {isHome ? (
              done ? (
                <View
                  style={{
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: withAlpha(brand.gold, 0.2),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Check size={16} strokeWidth={2.2} color={isDark ? brand.gold : brand.goldDeep} />
                  <Text style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 14, color: isDark ? brand.gold : brand.goldDeep }}>
                    {t('knowledge.lesson.completeBtn')}
                  </Text>
                </View>
              ) : (
                <LinearGradient
                  colors={gradients.homeGoldPill.colors as unknown as readonly [string, string, ...string[]]}
                  start={gradients.homeGoldPill.start}
                  end={gradients.homeGoldPill.end}
                  style={{
                    height: 44,
                    borderRadius: 12,
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
                </LinearGradient>
              )
            ) : (
              <View
                style={{
                  height: 44,
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
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
