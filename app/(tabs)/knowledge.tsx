/**
 * /knowledge — Knowledge 탭 메인 화면
 *
 * 4 서브탭: 레슨 / 지역 / 와이너리 / 빈티지
 * 라이트 모드 기준 디자인 (ivory.* 팔레트) + dark 대칭 매핑 (design-spec knowledge-main.md §6)
 *
 * §4-11 Pressable 3-layer 패턴 — 모든 카드 컴포넌트에서 준수.
 */
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { light, dark, brand, ivory, gradients } from '@/lib/design-tokens';
import { AppHeader } from '@/components/nav/app-header';
import { BellButton } from '@/components/nav/bell-button';
import { LevelChip } from '@/components/shared/level-chip';
import { useNotifications } from '@/hooks/use-notifications';
import { useProfile } from '@/hooks/use-profile';
import { useLessons } from '@/hooks/use-knowledge';
import { useRegions } from '@/hooks/use-knowledge';
import { useWineries } from '@/hooks/use-knowledge';
import { useVintages } from '@/hooks/use-knowledge';

import {
  KnowledgeTabBar,
  SectionLabel,
  StreakBar,
  TodayLessonCard,
  LessonListRow,
  CountryCard,
  WineryListCard,
  VintageListCard,
  type KnowledgeTab,
} from '@/components/knowledge';

export default function KnowledgeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;

  const pageBg = isDark ? dark.bg.deepest : ivory.bg.page1;
  // 165deg page gradient (KTL.pageBg verbatim — ivory page1→page2; dark reuses gradients.pageBg).
  // 165deg ≈ 위→아래 약간 우측: start={0,0} end={0.26,1}.
  const pageGradient = isDark
    ? { colors: gradients.pageBg.dark.colors as string[], start: { x: 0, y: 0 }, end: { x: 0.26, y: 1 } }
    : { colors: [ivory.bg.page1, ivory.bg.page2] as string[], start: { x: 0, y: 0 }, end: { x: 0.26, y: 1 } };

  const { unreadCount } = useNotifications();
  const { profile } = useProfile();
  const displayInitial = (profile?.anonymous_display ?? '?')[0]?.toUpperCase() ?? '?';
  const levelId = Math.max(1, Math.min(5, profile?.level ?? 1)) as 1|2|3|4|5;

  const HeaderRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <BellButton unreadCount={unreadCount} />
      <LevelChip levelId={levelId} initial={displayInitial} />
    </View>
  );

  const [activeTab, setActiveTab] = useState<KnowledgeTab>('lesson');

  const { todayLesson, previousLessons, streak } = useLessons();
  const { regions } = useRegions();
  const { wineries } = useWineries();
  const { vintages } = useVintages();

  function navToLesson(id: string) {
    router.push(`/knowledge/lesson/${id}` as never);
  }
  function navToRegion(id: string) {
    router.push(`/knowledge/region/${id}` as never);
  }
  function navToWinery(id: string) {
    router.push(`/knowledge/winery/${id}` as never);
  }
  function navToVintage(id: string) {
    router.push(`/knowledge/vintage/${id}` as never);
  }

  return (
    <LinearGradient
      colors={pageGradient.colors}
      start={pageGradient.start}
      end={pageGradient.end}
      style={{ flex: 1 }}
    >
    <View style={{ flex: 1 }}>
      {/* Header */}
      <AppHeader eyebrow={t('nav.knowledge')} title={t('knowledge.title')} right={HeaderRight} />

      {/* Tab bar */}
      <KnowledgeTabBar active={activeTab} onChange={setActiveTab} />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── LESSON TAB ── */}
        {activeTab === 'lesson' && (
          <>
            <StreakBar streak={streak} />
            <TodayLessonCard lesson={todayLesson} onPress={navToLesson} />

            {/* Previous lessons */}
            <SectionLabel label={t('knowledge.lesson.prevLabel')} paddingHorizontal={20} marginBottom={12} />
            <View
              style={{
                marginHorizontal: 20,
                borderRadius: 12,
                backgroundColor: isDark ? dark.bg.surface : ivory.bg.surface,
                borderWidth: 1,
                borderColor: isDark ? dark.border.default : ivory.border,
                overflow: 'hidden',
              }}
            >
              {previousLessons.map((lesson, idx) => (
                <LessonListRow
                  key={lesson.id}
                  lesson={lesson}
                  isRead={idx < 3}
                  isLast={idx === previousLessons.length - 1}
                  onPress={navToLesson}
                />
              ))}
            </View>
          </>
        )}

        {/* ── REGION TAB ── */}
        {activeTab === 'region' && (
          <View style={{ padding: 20, paddingTop: 20, gap: 10 }}>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                color: tokens.text.muted,
                lineHeight: 16.5,
                marginBottom: 4,
              }}
            >
              {t('knowledge.region.hint')}
            </Text>

            {/* 2-column grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {regions.map((region) => (
                <View key={region.id} style={{ width: '47.5%' }}>
                  <CountryCard region={region} onPress={navToRegion} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── WINERY TAB ── */}
        {activeTab === 'winery' && (
          <View style={{ padding: 20, paddingTop: 16, gap: 10 }}>
            {wineries.map((winery) => (
              <WineryListCard key={winery.id} winery={winery} onPress={navToWinery} />
            ))}
          </View>
        )}

        {/* ── VINTAGE TAB ── */}
        {activeTab === 'vintage' && (
          <View style={{ padding: 20, paddingTop: 16, gap: 10 }}>
            {vintages.map((vintage) => (
              <VintageListCard key={vintage.id} vintage={vintage} onPress={navToVintage} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
    </LinearGradient>
  );
}
