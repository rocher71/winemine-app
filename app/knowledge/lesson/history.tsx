/**
 * /knowledge/lesson/history — 레슨 학습 기록 화면
 *
 * 핸드오프 knowledge-c-light-details.jsx LessonHistoryScreen 기반.
 * - TopStreakStats (BigStat×3) + CalendarSection + CategoryDist + BadgeGrid
 */
import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Info, Flame, Star, Award } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { light, ivory, brand, shadows } from '@/lib/design-tokens';
import { useLessons } from '@/hooks/use-knowledge';
import { MOCK_STREAK } from '@/lib/mock/knowledge';
import { currentLocale } from '@/lib/i18n';

// Day 1 = May 15, 2026 (MOCK_LESSONS[0].publishedAt)
const MOCK_START = new Date(2026, 4, 15);

function dayToDateStr(dayNum: number): string {
  const d = new Date(MOCK_START.getTime() + (dayNum - 1) * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const STREAK = MOCK_STREAK;

const BADGE_DEFS = [
  { id: '7s',  labelKo: '7일 연속',   labelEn: '7-Day Streak',   milestone: 7,   type: 'streak' as const },
  { id: '14s', labelKo: '14일 연속',  labelEn: '14-Day Streak',  milestone: 14,  type: 'streak' as const },
  { id: '21s', labelKo: '21일 연속',  labelEn: '21-Day Streak',  milestone: 21,  type: 'streak' as const },
  { id: '30s', labelKo: '30일 연속',  labelEn: '30-Day Streak',  milestone: 30,  type: 'streak' as const },
  { id: '50t', labelKo: '50일 완료',  labelEn: '50 Days Done',   milestone: 50,  type: 'total' as const },
  { id: '100t',labelKo: '100일 완료', labelEn: '100 Days Done',  milestone: 100, type: 'total' as const },
];

function isBadgeEarned(b: typeof BADGE_DEFS[number]): boolean {
  if (b.type === 'streak') return STREAK.longestStreak >= b.milestone;
  return STREAK.totalCompleted >= b.milestone;
}

export default function LessonHistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = currentLocale();
  const { lessons } = useLessons();

  const today = todayStr();
  const todayDate = new Date();

  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth()); // 0-indexed

  const completedDateSet = useMemo(() => {
    const set = new Set<string>();
    STREAK.completedDays.forEach((d) => set.add(dayToDateStr(d)));
    return set;
  }, []);

  type EmptyCell = { type: 'empty'; key: string };
  type DayCell = { type: 'day'; key: string; day: number; dateStr: string; isToday: boolean; isDone: boolean };
  type CalCell = EmptyCell | DayCell;

  // Calendar cells
  const { cells, daysInMonth } = useMemo((): { cells: CalCell[]; daysInMonth: number } => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const offset = firstDay.getDay(); // 0=Sun
    const dim = new Date(viewYear, viewMonth + 1, 0).getDate();
    const emptyCells: EmptyCell[] = Array.from({ length: offset }, (_: unknown, i: number) => ({ type: 'empty' as const, key: `e${i}` }));
    const dayCells: DayCell[] = Array.from({ length: dim }, (_: unknown, i: number) => {
      const d = i + 1;
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const ds = `${viewYear}-${mm}-${dd}`;
      return {
        type: 'day' as const,
        key: ds,
        day: d,
        dateStr: ds,
        isToday: ds === today,
        isDone: completedDateSet.has(ds),
      };
    });
    return { cells: [...emptyCells, ...dayCells], daysInMonth: dim };
  }, [viewYear, viewMonth, completedDateSet, today]);

  // Category distribution
  const catDist = useMemo(() => {
    const map = new Map<string, { ko: string; en: string; count: number }>();
    lessons.forEach((l) => {
      const key = l.category.ko;
      if (map.has(key)) {
        map.get(key)!.count += 1;
      } else {
        map.set(key, { ko: l.category.ko, en: l.category.en, count: 1 });
      }
    });
    const total = lessons.length || 1;
    type CatEntry = { ko: string; en: string; count: number };
    return Array.from(map.values())
      .sort((a: CatEntry, b: CatEntry) => b.count - a.count)
      .map((c: CatEntry) => ({ ...c, pct: Math.round((c.count / total) * 100) }));
  }, [lessons]);

  const calTitle = locale === 'ko'
    ? t('knowledge.lesson.calendarLabel', { year: viewYear, month: viewMonth + 1 })
    : `${new Date(viewYear, viewMonth).toLocaleString('en-US', { month: 'long' })} ${viewYear}`;

  const DAY_HEADERS = locale === 'ko'
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const goldColor = brand.goldDeep;
  const pageBg = ivory.bg.page1;
  const cardBg = ivory.bg.surface;
  const cardBorder = ivory.border;

  const isCurrentMonth = viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth();

  function navMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  function goToToday() {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: pageBg,
        }}
      >
        <View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={22} strokeWidth={1.8} color={light.text.primary} />
            </View>
          </Pressable>
        </View>

        <Text
          style={{
            flex: 1,
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 18,
            color: light.text.primary,
            letterSpacing: -0.18,
            textAlign: 'center',
            marginHorizontal: 4,
          }}
        >
          {t('knowledge.history.title')}
        </Text>

        <View>
          <Pressable
            onPress={() => {}}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <Info size={20} strokeWidth={1.5} color={ivory.text.muted} />
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Streak Stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 4, marginBottom: 20 }}>
          {[
            {
              label: t('knowledge.history.stat.current'),
              value: STREAK.currentStreak,
              unit: locale === 'ko' ? '일' : 'days',
              flex: 1.4,
            },
            {
              label: t('knowledge.history.stat.longest'),
              value: STREAK.longestStreak,
              unit: locale === 'ko' ? '일' : 'days',
              flex: 1,
            },
            {
              label: t('knowledge.history.stat.total'),
              value: STREAK.totalCompleted,
              unit: locale === 'ko' ? '일' : 'days',
              flex: 1,
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: stat.flex,
                padding: 14,
                borderRadius: 14,
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
                  fontSize: 9,
                  color: ivory.text.muted,
                  letterSpacing: 0.72,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                  textAlign: 'center',
                }}
              >
                {stat.label}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                <Text
                  style={{
                    fontFamily: 'PlayfairDisplay_400Regular',
                    fontSize: 28,
                    color: light.text.primary,
                    fontWeight: '500',
                    letterSpacing: -0.56,
                    lineHeight: 32,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 11,
                    color: ivory.text.muted,
                    letterSpacing: 0.44,
                  }}
                >
                  {stat.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Calendar Section */}
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 20,
            borderRadius: 16,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            padding: 16,
            ...shadows.sm,
          }}
        >
          {/* Month navigation */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View>
              <Pressable
                onPress={() => navMonth(-1)}
                style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityRole="button"
              >
                <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} strokeWidth={1.6} color={ivory.text.secondary} />
                </View>
              </Pressable>
            </View>

            <Text
              style={{
                flex: 1,
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: 15,
                color: light.text.primary,
                letterSpacing: -0.15,
                textAlign: 'center',
              }}
            >
              {calTitle}
            </Text>

            {/* 오늘 버튼 — 현재 달 보고 있으면 dimmed */}
            <View style={{ opacity: isCurrentMonth ? 0.3 : 1 }}>
              <Pressable
                onPress={goToToday}
                disabled={isCurrentMonth}
                style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityRole="button"
                accessibilityLabel={locale === 'ko' ? '오늘로 이동' : 'Go to today'}
              >
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: goldColor,
                    marginRight: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Freesentation_6SemiBold',
                      fontSize: 11,
                      color: goldColor,
                      letterSpacing: 0.3,
                    }}
                  >
                    {locale === 'ko' ? '오늘' : 'Today'}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View>
              <Pressable
                onPress={() => navMonth(1)}
                style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityRole="button"
              >
                <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={18} strokeWidth={1.6} color={ivory.text.secondary} />
                </View>
              </Pressable>
            </View>
          </View>

          {/* Day headers */}
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {DAY_HEADERS.map((h) => (
              <Text
                key={h}
                style={{
                  width: `${100 / 7}%` as `${number}%`,
                  textAlign: 'center',
                  fontFamily: 'Freesentation_5Medium',
                  fontSize: 10,
                  color: ivory.text.muted,
                  letterSpacing: 0.5,
                  paddingBottom: 6,
                }}
              >
                {h}
              </Text>
            ))}
          </View>

          {/* Day cells */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((cell: CalCell) => {
              if (cell.type === 'empty') {
                return <View key={cell.key} style={{ width: `${100 / 7}%` as `${number}%`, aspectRatio: 1 }} />;
              }
              const { day, isToday, isDone, key } = cell as DayCell;
              return (
                <View
                  key={key}
                  style={{ width: `${100 / 7}%` as `${number}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isDone ? brand.wineRed : 'transparent',
                      borderWidth: isToday && !isDone ? 1.5 : 0,
                      borderColor: isToday && !isDone ? goldColor : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Freesentation_5Medium',
                        fontSize: 11,
                        color: isDone ? '#FAF3E3' : isToday ? goldColor : ivory.text.dim,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
            {[
              { color: brand.wineRed, label: t('knowledge.lesson.historyLegendDone') },
              { color: goldColor, label: t('knowledge.lesson.historyLegendToday'), border: true },
              { color: ivory.border, label: t('knowledge.lesson.historyLegendNone') },
            ].map((leg) => (
              <View key={leg.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: leg.border ? 'transparent' : leg.color,
                    borderWidth: leg.border ? 1.5 : 0,
                    borderColor: leg.border ? leg.color : 'transparent',
                  }}
                />
                <Text
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 10,
                    color: ivory.text.muted,
                    letterSpacing: 0.4,
                  }}
                >
                  {leg.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Distribution */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 10,
              color: goldColor,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              marginBottom: 10,
              paddingHorizontal: 2,
            }}
          >
            {t('knowledge.history.categoryDist')}
          </Text>
          <View
            style={{
              borderRadius: 14,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: cardBorder,
              padding: 16,
              ...shadows.sm,
            }}
          >
            {catDist.map((cat: { ko: string; en: string; count: number; pct: number }, idx: number) => (
              <View
                key={cat.ko}
                style={{
                  marginBottom: idx < catDist.length - 1 ? 12 : 0,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: 'Freesentation_5Medium',
                      fontSize: 12,
                      color: light.text.primary,
                      letterSpacing: 0.12,
                    }}
                  >
                    {locale === 'ko' ? cat.ko : cat.en}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'PlayfairDisplay_400Regular',
                      fontSize: 13,
                      color: ivory.text.secondary,
                      fontWeight: '500',
                    }}
                  >
                    {cat.count}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Freesentation_4Regular',
                      fontSize: 10,
                      color: ivory.text.muted,
                      width: 34,
                      textAlign: 'right',
                      letterSpacing: 0.4,
                    }}
                  >
                    {cat.pct}%
                  </Text>
                </View>
                {/* Percent bar */}
                <View
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: light.bg.inset,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${cat.pct}%`,
                      borderRadius: 2,
                      backgroundColor: idx === 0 ? brand.wineRed : idx === 1 ? brand.gold : ivory.text.muted,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Badge Grid */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 10,
              color: goldColor,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              marginBottom: 10,
              paddingHorizontal: 2,
            }}
          >
            {t('knowledge.history.badges')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {BADGE_DEFS.map((b) => {
              const earned = isBadgeEarned(b);
              return (
                <View
                  key={b.id}
                  style={{
                    width: '30.5%',
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: earned ? `${brand.wineRed}18` : cardBg,
                    borderWidth: earned ? 1 : 1,
                    borderColor: earned ? `${brand.wineRed}55` : cardBorder,
                    borderStyle: earned ? 'solid' : 'dashed',
                    alignItems: 'center',
                    ...shadows.sm,
                  }}
                >
                  <View style={{ marginBottom: 6, opacity: earned ? 1 : 0.3 }}>
                    {b.type === 'streak'
                      ? (b.milestone <= 14
                        ? <Flame size={20} strokeWidth={1.5} color={earned ? brand.wineRed : ivory.text.muted} />
                        : <Star size={20} strokeWidth={1.5} color={earned ? brand.gold : ivory.text.muted} />)
                      : <Award size={20} strokeWidth={1.5} color={earned ? brand.gold : ivory.text.muted} />}
                  </View>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: earned ? brand.wineRed : light.bg.inset,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'PlayfairDisplay_400Regular',
                        fontSize: 13,
                        color: earned ? '#FAF3E3' : ivory.text.muted,
                        fontWeight: '700',
                      }}
                    >
                      {b.milestone}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Freesentation_5Medium',
                      fontSize: 10,
                      color: earned ? light.text.primary : ivory.text.dim,
                      letterSpacing: 0.4,
                      textAlign: 'center',
                      lineHeight: 14,
                    }}
                  >
                    {locale === 'ko' ? b.labelKo : b.labelEn}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
