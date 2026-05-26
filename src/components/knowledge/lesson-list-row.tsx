import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import type { Lesson } from '@/lib/mock/knowledge';

interface LessonListRowProps {
  lesson: Lesson;
  isRead?: boolean;
  isLast?: boolean;
  onPress: (id: string) => void;
}

export function LessonListRow({ lesson, isRead = false, isLast = false, onPress }: LessonListRowProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const goldColor = isDark ? brand.gold : light.border.active;
  const locale = currentLocale();

  return (
    <View style={{ opacity: isRead ? 0.8 : 1 }}>
      <Pressable
        onPress={() => onPress(lesson.id)}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        accessibilityRole="button"
        accessibilityLabel={`Day ${lesson.day} ${locale === 'ko' ? lesson.title.ko : lesson.title.en}`}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 13,
            paddingHorizontal: 14,
            borderBottomWidth: isLast ? 0 : 0.5,
            borderBottomColor: tokens.border.default,
          }}
        >
          {/* Day badge */}
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isRead ? `${goldColor}33` : (isDark ? dark.bg.inset : light.bg.inset),
              borderWidth: 1,
              borderColor: isRead ? goldColor : tokens.border.default,
            }}
          >
            {isRead ? (
              <Check size={14} strokeWidth={2.2} color={isDark ? brand.gold : brand.goldDeep} />
            ) : (
              <Text
                style={{
                  fontFamily: 'Freesentation_6SemiBold',
                  fontSize: 10,
                  color: tokens.text.muted,
                }}
              >
                {lesson.day}
              </Text>
            )}
          </View>

          {/* Body */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                color: tokens.text.muted,
                letterSpacing: 0.6,
                marginBottom: 2,
                textTransform: 'uppercase',
              }}
            >
              DAY {lesson.day} · {lesson.readMinutes} min
            </Text>
            <Text
              style={{
                fontFamily: 'Freesentation_5Medium',
                fontSize: 14,
                color: isRead ? tokens.text.secondary : tokens.text.primary,
                lineHeight: 18.2,
              }}
              numberOfLines={2}
            >
              {locale === 'ko' ? lesson.title.ko : lesson.title.en}
            </Text>
          </View>

          <ChevronRight size={16} strokeWidth={1.5} color={tokens.text.muted} />
        </View>
      </Pressable>
    </View>
  );
}
