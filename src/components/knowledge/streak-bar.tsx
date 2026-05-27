import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, ivory, shadows, gradients } from '@/lib/design-tokens';
import { useTranslation } from 'react-i18next';
import type { LessonStreak } from '@/lib/mock/knowledge';

interface StreakBarProps {
  streak: LessonStreak;
  onHistoryPress?: () => void;
}

export function StreakBar({ streak, onHistoryPress }: StreakBarProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const goldColor = isDark ? brand.gold : light.border.active;
  const goldDeep = brand.goldDeep;
  const cardBg = isDark ? dark.bg.surface : ivory.bg.surface;
  const cardBorder = isDark ? dark.border.default : ivory.border;
  const progressTrack = isDark ? dark.bg.inset : light.bg.inset;

  const day = streak.currentStreak;
  const MILESTONES = [7, 14, 21, 30, 60, 90, 100];
  const target = MILESTONES.find((m) => m > day) ?? day + 7;
  const prevMilestone = MILESTONES.filter((m) => m <= day).pop() ?? 0;
  const remain = target - day;
  const progress = (day - prevMilestone) / (target - prevMilestone);

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 18,
        padding: 16,
        paddingTop: 14,
        borderRadius: 12,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: cardBorder,
        ...shadows.sm,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Flame badge */}
          <LinearGradient
            colors={gradients.knowledgeFlame.colors as string[]}
            start={gradients.knowledgeFlame.start}
            end={gradients.knowledgeFlame.end}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: brand.goldDeep,
            }}
          >
            <Flame size={20} strokeWidth={1.8} color={brand.cream} />
          </LinearGradient>

          <View>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                color: tokens.text.muted,
                letterSpacing: 0.88,
                marginBottom: 2,
              }}
            >
              {t('knowledge.lesson.streakLabel')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_400Regular',
                  fontSize: 18,
                  color: tokens.text.primary,
                  letterSpacing: -0.18,
                }}
              >
                {day}
              </Text>
              <Text
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 13,
                  color: tokens.text.muted,
                }}
              >
                {t('knowledge.lesson.streakUnit')}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 11,
              color: goldDeep,
              letterSpacing: 0.44,
            }}
          >
            +{remain} → {target}{t('knowledge.lesson.streakUnit')}
          </Text>
          {onHistoryPress && (
            <View>
              <Pressable
                onPress={onHistoryPress}
                style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityRole="button"
              >
                <View>
                  <Text
                    style={{
                      fontFamily: 'Freesentation_5Medium',
                      fontSize: 10,
                      color: goldDeep,
                      letterSpacing: 0.5,
                      textDecorationLine: 'underline',
                    }}
                  >
                    {t('knowledge.lesson.historyBtn')}
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Progress track */}
      <View
        style={{
          height: 6,
          borderRadius: 99,
          backgroundColor: progressTrack,
          borderWidth: 0.5,
          borderColor: cardBorder,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={gradients.knowledgeStreakFill.colors as string[]}
          start={gradients.knowledgeStreakFill.start}
          end={gradients.knowledgeStreakFill.end}
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            borderRadius: 99,
          }}
        />
      </View>
    </View>
  );
}
