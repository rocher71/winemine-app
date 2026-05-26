import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, ivory, shadows, gradients } from '@/lib/design-tokens';
import { useTranslation } from 'react-i18next';
import type { Lesson } from '@/lib/mock/knowledge';
import { currentLocale } from '@/lib/i18n';

interface TodayLessonCardProps {
  lesson: Lesson;
  onPress: (id: string) => void;
}

export function TodayLessonCard({ lesson, onPress }: TodayLessonCardProps) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const insetBg = isDark ? dark.bg.inset : light.bg.inset;
  const goldColor = isDark ? brand.gold : light.border.active;

  const [done, setDone] = useState(false);

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 24,
        borderRadius: 14,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: cardBorder,
        overflow: 'hidden',
        position: 'relative',
        ...shadows.sm,
      }}
    >
      {/* Top accent gradient — 3px */}
      <LinearGradient
        colors={gradients.knowledgeTodayAccent.colors as string[]}
        locations={gradients.knowledgeTodayAccent.locations as number[]}
        start={gradients.knowledgeTodayAccent.start}
        end={gradients.knowledgeTodayAccent.end}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }}
      />

      <View style={{ padding: 18, paddingTop: 21 }}>
        {/* Meta row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 11,
              color: brand.wineRed,
              letterSpacing: 1.54,
              textTransform: 'uppercase',
            }}
          >
            {t('knowledge.lesson.todayLabel')} · Day {lesson.day}
          </Text>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              color: tokens.text.muted,
            }}
          >
            {locale === 'ko' ? lesson.category.ko : lesson.category.en}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 22,
            color: tokens.text.primary,
            lineHeight: 27.5,
            letterSpacing: -0.22,
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
            lineHeight: 22.95,
            marginBottom: 16,
          }}
          numberOfLines={3}
        >
          {locale === 'ko' ? lesson.summary.ko : lesson.summary.en}
        </Text>

        {/* Summary inset */}
        <View
          style={{
            padding: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
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
              {locale === 'ko' ? '읽기' : 'Time'}
            </Text>
            <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 12, color: tokens.text.primary }}>
              {lesson.readMinutes} min
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: tokens.border.default, alignSelf: 'stretch' }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Freesentation_7Bold', fontSize: 9.5, color: goldColor, letterSpacing: 1.14, textTransform: 'uppercase', marginBottom: 5 }}>
              {locale === 'ko' ? '주제' : 'Topic'}
            </Text>
            <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 12, color: tokens.text.primary }}>
              {locale === 'ko' ? lesson.category.ko : lesson.category.en}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: tokens.border.default, alignSelf: 'stretch' }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Freesentation_7Bold', fontSize: 9.5, color: goldColor, letterSpacing: 1.14, textTransform: 'uppercase', marginBottom: 5 }}>
              {locale === 'ko' ? '날짜' : 'Date'}
            </Text>
            <Text style={{ fontFamily: 'Freesentation_5Medium', fontSize: 12, color: tokens.text.primary }}>
              Day {lesson.day}
            </Text>
          </View>
        </View>

        {/* CTA button — 3-layer Pressable */}
        <View>
          <Pressable
            onPress={() => {
              setDone(true);
              onPress(lesson.id);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            accessibilityRole="button"
          >
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
              <Text
                style={{
                  fontFamily: 'Freesentation_6SemiBold',
                  fontSize: 14,
                  color: brand.cream,
                }}
              >
                {t('knowledge.lesson.completeBtn')}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
