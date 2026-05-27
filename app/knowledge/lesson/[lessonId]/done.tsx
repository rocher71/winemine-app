/**
 * /knowledge/lesson/[lessonId]/done — 레슨 학습 완료 축하 화면
 *
 * 핸드오프 knowledge-c-light-details.jsx LessonDoneScreen (line 343~485) 기반.
 * - MedalSeal SVG(148×148) + StreakProgressCard + StatTile×3 + NextLessonPreview
 * - StickyDualCTA (Share 비활성 + 홈 이동)
 */
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import Svg, {
  Defs, RadialGradient, Stop, Circle, Line, Path, Text as SvgText,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import { light, dark, brand, ivory, shadows } from '@/lib/design-tokens';
import { useLessons, useLessonDetail } from '@/hooks/use-knowledge';
import { currentLocale } from '@/lib/i18n';

const MILESTONES = [7, 14, 21, 30, 60, 90, 100];

function nextMilestone(streak: number): number {
  return MILESTONES.find((m) => m > streak) ?? streak + 7;
}

export default function LessonDoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const locale = currentLocale();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const pageBg = isDark ? dark.bg.deepest : ivory.bg.page1;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const goldColor = isDark ? brand.gold : '#A07F2E';
  const goldWash = isDark ? '#2A1C20' : '#F2E5BD';

  const { lesson } = useLessonDetail(lessonId ?? '');
  const { streak, lessons } = useLessons();
  const nextLesson = lessons.find((l) => l.day === (lesson?.day ?? 0) + 1);

  const currentStreak = streak.currentStreak;
  const milestone = nextMilestone(currentStreak);

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

  const dayLabel = t('knowledge.lesson.dayLabel', { day: lesson.day });
  const eyebrow = t('knowledge.done.eyebrow', { day: lesson.day });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
      {/* Close header */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? dark.bg.deepest : ivory.bg.page1,
        }}
      >
        <View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={22} strokeWidth={1.8} color={tokens.text.primary} />
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Medal Seal SVG */}
        <View style={{ paddingTop: 28, marginBottom: 22 }}>
          <MedalSeal day={lesson.day} isDark={isDark} />
        </View>

        {/* Hero text */}
        <View style={{ paddingHorizontal: 28, marginBottom: 28, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 11,
              color: goldColor,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            {eyebrow}
          </Text>
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 30,
              color: tokens.text.primary,
              letterSpacing: -0.45,
              lineHeight: 36,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {t('knowledge.done.title')}
          </Text>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 13,
              color: tokens.text.secondary,
              lineHeight: 20.8,
              textAlign: 'center',
            }}
          >
            {t('knowledge.done.body')}
          </Text>
        </View>

        {/* Streak Progress Card */}
        <View
          style={{
            marginHorizontal: 22,
            marginBottom: 18,
            alignSelf: 'stretch',
            padding: 16,
            paddingHorizontal: 18,
            borderRadius: 14,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            ...shadows.sm,
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 10,
              color: goldColor,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            {t('knowledge.done.streakProgress')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            {/* Current streak (faded) */}
            <StreakNumber value={currentStreak} variant="faded" isDark={isDark} tokens={tokens} />

            {/* Arrow */}
            <Svg width={28} height={14}>
              <Path d="M3 7h22M19 3l6 4-6 4" stroke={goldColor} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>

            {/* Next streak (bright) */}
            <StreakNumber value={currentStreak + 1} variant="bright" isDark={isDark} tokens={tokens} />

            <View style={{ flex: 1 }} />

            {/* Next reward */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 10,
                  color: tokens.text.muted,
                  letterSpacing: 0.6,
                  marginBottom: 2,
                }}
              >
                {t('knowledge.done.nextReward')}
              </Text>
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_400Regular',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: tokens.text.primary,
                  fontWeight: '500',
                }}
              >
                {milestone}{locale === 'ko' ? '일 배지' : '-day badge'}
              </Text>
            </View>
          </View>
        </View>

        {/* Mini stat grid */}
        <View
          style={{
            marginHorizontal: 22,
            marginBottom: 22,
            alignSelf: 'stretch',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          {[
            { k: t('knowledge.lesson.doneStatWeek'), v: '5', unit: locale === 'ko' ? '일' : 'days' },
            { k: t('knowledge.lesson.doneStatAvg'), v: `${lesson.readMinutes}`, unit: locale === 'ko' ? '분' : 'min' },
            { k: t('knowledge.lesson.doneStatTotal'), v: `${streak.totalCompleted}`, unit: locale === 'ko' ? '일' : 'days' },
          ].map((stat) => (
            <View
              key={stat.k}
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
                  fontFamily: 'Freesentation_5Medium',
                  fontSize: 9.5,
                  color: tokens.text.muted,
                  letterSpacing: 0.76,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                  textAlign: 'center',
                }}
              >
                {stat.k}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                <Text
                  style={{
                    fontFamily: 'PlayfairDisplay_400Regular',
                    fontSize: 22,
                    color: tokens.text.primary,
                    letterSpacing: -0.22,
                    lineHeight: 26,
                    fontWeight: '500',
                  }}
                >
                  {stat.v}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 11,
                    color: tokens.text.muted,
                    letterSpacing: 0.44,
                  }}
                >
                  {stat.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Next lesson preview */}
        {nextLesson && (
          <View style={{ alignSelf: 'stretch', marginHorizontal: 22, marginBottom: 14 }}>
            <Text
              style={{
                fontFamily: 'Freesentation_7Bold',
                fontSize: 10,
                color: goldColor,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 10,
                paddingHorizontal: 4,
              }}
            >
              {t('knowledge.done.next')}
            </Text>
            <View
              style={{
                padding: 14,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: `${goldColor}99`,
                borderStyle: 'dashed',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                opacity: 0.95,
                ...shadows.sm,
              }}
            >
              {/* Day chip */}
              <LinearGradient
                colors={[brand.wineWash, '#F2E5BD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: `${goldColor}55`,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'PlayfairDisplay_700Bold',
                    fontSize: 13,
                    color: brand.wineRed,
                    fontWeight: '600',
                  }}
                >
                  {nextLesson.day}
                </Text>
              </LinearGradient>

              {/* Body */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 10,
                    color: tokens.text.muted,
                    letterSpacing: 0.6,
                    marginBottom: 2,
                  }}
                >
                  {locale === 'ko' ? nextLesson.category.ko : nextLesson.category.en}
                </Text>
                <Text
                  style={{
                    fontFamily: 'PlayfairDisplay_400Regular',
                    fontSize: 16,
                    color: tokens.text.primary,
                    letterSpacing: -0.16,
                    lineHeight: 20,
                    fontWeight: '500',
                  }}
                  numberOfLines={2}
                >
                  {locale === 'ko' ? nextLesson.title.ko : nextLesson.title.en}
                </Text>
              </View>

              <ChevronRight size={20} strokeWidth={1.5} color={tokens.text.muted} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky dual CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 12,
          paddingHorizontal: 20,
          paddingBottom: 30,
          flexDirection: 'row',
          gap: 8,
          backgroundColor: isDark ? `${dark.bg.deepest}E6` : `${ivory.bg.page1}E6`,
        }}
      >
        {/* Share (inactive) */}
        <View>
          <Pressable
            onPress={() => {}}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.75 : 1 })}
            accessibilityRole="button"
          >
            <View
              style={{
                paddingHorizontal: 18,
                height: 50,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: cardBorder,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Freesentation_6SemiBold',
                  fontSize: 14,
                  color: tokens.text.primary,
                }}
              >
                {t('knowledge.done.share')}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Home (primary) */}
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={() => router.push('/' as never)}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.85 : 1 })}
            accessibilityRole="button"
          >
            <View
              style={{
                height: 50,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark ? brand.gold : '#A07F2E',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Freesentation_6SemiBold',
                  fontSize: 15,
                  color: '#FAF3E3',
                }}
              >
                {t('knowledge.done.home')}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Inline sub-components ──

interface MedalSealProps { day: number; isDark: boolean }
function MedalSeal({ day, isDark }: MedalSealProps) {
  const size = 148;
  const cx = size / 2;
  const cy = size / 2;
  const gold = '#B89438';
  const goldHover = '#A07F2E';
  const cream = '#FAF3E3';

  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 2 * Math.PI;
    const r1 = 60;
    const r2 = 72;
    return {
      x1: cx + r1 * Math.cos(angle),
      y1: cy + r1 * Math.sin(angle),
      x2: cx + r2 * Math.cos(angle),
      y2: cy + r2 * Math.sin(angle),
      sw: i % 2 ? 1 : 2,
      opacity: i % 2 ? 0.4 : 0.7,
    };
  });

  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="medalg" cx="40%" cy="35%" r="70%">
          <Stop offset="0%" stopColor="#F0D896" />
          <Stop offset="50%" stopColor={gold} />
          <Stop offset="100%" stopColor={goldHover} />
        </RadialGradient>
      </Defs>

      {/* 16 rays */}
      {rays.map((r, i) => (
        <Line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
          stroke={gold} strokeWidth={r.sw} opacity={r.opacity} />
      ))}

      {/* Outer ring */}
      <Circle cx={cx} cy={cy} r={56} fill="none" stroke={goldHover} strokeWidth={1} opacity={0.45} />

      {/* Medal body */}
      <Circle cx={cx} cy={cy} r={50} fill="url(#medalg)" stroke={goldHover} strokeWidth={1.5} />

      {/* Inner double ring */}
      <Circle cx={cx} cy={cy} r={42} fill="none" stroke={cream} strokeWidth={0.8} opacity={0.6} />
      <Circle cx={cx} cy={cy} r={38} fill="none" stroke={goldHover} strokeWidth={0.8} opacity={0.5} />

      {/* Wine glass icon */}
      <Path
        d="M74 52 Q62 62 66 72 L72 72 L72 82 L76 82 L76 72 L82 72 Q86 62 74 52Z"
        fill={cream}
        opacity={0.92}
      />

      {/* Day text */}
      <SvgText
        x={cx}
        y={cy + 36}
        textAnchor="middle"
        fontFamily="PlayfairDisplay_400Regular"
        fontSize={14}
        fontStyle="italic"
        fontWeight="600"
        fill={cream}
        letterSpacing={0.84}
      >
        {`DAY ${day}`}
      </SvgText>
    </Svg>
  );
}

interface StreakNumberProps {
  value: number;
  variant: 'bright' | 'faded';
  isDark: boolean;
  tokens: typeof dark | typeof light;
}

function StreakNumber({ value, variant, tokens }: StreakNumberProps) {
  const goldHover = '#A07F2E';
  const isBright = variant === 'bright';

  return (
    <View style={{ alignItems: 'center' }}>
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: 34,
          fontWeight: '500',
          lineHeight: 34,
          letterSpacing: -0.68,
          color: isBright ? goldHover : tokens.text.muted,
          textShadowColor: isBright ? 'rgba(184,148,56,0.33)' : 'transparent',
          textShadowRadius: isBright ? 16 : 0,
          textShadowOffset: { width: 0, height: 0 },
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 10,
          color: tokens.text.muted,
          letterSpacing: 0.6,
          marginTop: 2,
        }}
      >
        {`일`}
      </Text>
    </View>
  );
}
