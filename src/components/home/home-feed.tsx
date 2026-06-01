/**
 * HomeFeed — Editorial Stack 단일 피드 홈 컨테이너 (신규, 사양 home.md §1 variantA).
 *
 * mode 분기 제거 (리더 Q3) — 모든 사용자에게 동일 피드. 각 모듈 0건 시 graceful EmptyState (리더 Q6).
 *
 * 순서(시안 A): Greeting → Stats(3) → Activity feed → Lesson card(full) →
 *   Curated lists(h-scroll) → Trending(kw chips + rank) → Wine browse(tabs + cards + loader).
 *
 * 섹션 간격: sp(n) → 모듈 marginTop (gap-N 글로벌 미사용). 섹션 px=22(헤더/모듈 inner).
 * RefreshControl gold tint. paddingBottom 32.
 *
 * 데이터(리더 Q2): 실 hook 연결 + empty fallback (fabricated mock 노출 금지).
 *   stats=useProfileStats, activity=useHomeActivity(cellar drink-window), lesson=useLessons,
 *   curated=useMyLists, trending=useCommunityFeed(모듈 내부), browse=mock first-page(useWine 단일 한계, Q7).
 * 섹션 헤더 action: 라우트 존재 시 navigate, 미구현 라우트는 "준비 중" Alert (리더 Q8).
 */
import { useCallback } from 'react';
import { ScrollView, RefreshControl, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { SectionHeader } from '@/components/shared/section-header';
import { HomeGreeting } from './home-greeting';
import { StatHero } from './stat-hero';
import { HomeActivityFeed } from './home-activity-feed';
import { TodayLessonCard } from '@/components/knowledge/today-lesson-card';
import { HomeCuratedLists } from './home-curated-lists';
import { HomeTrending } from './home-trending';
import { WineFeed } from './wine-feed';
import { useProfileStats } from '@/hooks/use-profile-stats';
import { useHomeActivity } from '@/hooks/use-home-activity';
import { useLessons, useLessonDetail } from '@/hooks/use-knowledge';
import { useMyLists } from '@/hooks/use-wine-lists';

interface HomeFeedProps {
  displayName: string;
  onScroll?: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
  paddingTop?: number;
}

export function HomeFeed({ displayName, onScroll, paddingTop }: HomeFeedProps) {
  const { t } = useTranslation();
  const { stats, loading: statsLoading, refresh: refreshStats } = useProfileStats();
  const { rows: activityRows, loading: activityLoading } = useHomeActivity();
  const { todayLesson, streak } = useLessons();
  const { markComplete } = useLessonDetail(todayLesson.id);
  const { lists, isLoading: listsLoading, refetch: refetchLists } = useMyLists('recent');

  const refreshing = statsLoading;
  const onRefresh = useCallback(async () => {
    await Promise.all([refreshStats(), refetchLists()]);
  }, [refreshStats, refetchLists]);

  const comingSoon = useCallback(() => {
    Alert.alert(t('app.name'), t('home.comingSoon'));
  }, [t]);

  return (
    <ScrollView
      className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
      contentContainerStyle={{ paddingBottom: 32, paddingTop }}
      scrollEventThrottle={16}
      onScroll={onScroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.gold} />}
    >
      {/* Greeting (sp 18) */}
      <View style={{ marginTop: 18 }}>
        <HomeGreeting name={displayName} />
      </View>

      {/* Stats (sp 22) */}
      <View style={{ marginTop: 22 }}>
        <StatHero
          countries={stats.countriesExplored}
          wines={stats.winesTasted}
          notes={stats.notesCount}
          loading={statsLoading}
        />
      </View>

      {/* Activity feed (sp 22) */}
      <View style={{ marginTop: 22 }}>
        <SectionHeader
          eyebrow={t('home.section.activityEyebrow')}
          title={t('home.section.activityTitle', { count: activityRows.length })}
        />
        <View style={{ marginTop: 12 }}>
          <HomeActivityFeed rows={activityRows} loading={activityLoading} />
        </View>
      </View>

      {/* Lesson card (sp 26) */}
      <View style={{ marginTop: 26 }}>
        <SectionHeader
          eyebrow={t('home.section.lessonEyebrow')}
          title={t('home.section.lessonTitle')}
          actionLabel={t('home.section.lessonMore')}
          onActionPress={() => router.push('/knowledge' as never)}
        />
        <View style={{ marginTop: 12 }}>
          <TodayLessonCard
            lesson={todayLesson}
            variant="home"
            streakDays={streak.currentStreak}
            onPress={() => {
              void markComplete();
            }}
          />
        </View>
      </View>

      {/* Curated lists (sp 26) */}
      <View style={{ marginTop: 26 }}>
        <SectionHeader
          eyebrow={t('home.section.curatedEyebrow')}
          title={t('home.section.curatedTitle')}
          actionLabel={t('home.section.curatedAll')}
          onActionPress={comingSoon}
        />
        <View style={{ marginTop: 12 }}>
          <HomeCuratedLists
            lists={lists}
            loading={listsLoading}
            onCreatePress={() => router.push('/cellar/lists/create' as never)}
          />
        </View>
      </View>

      {/* Trending (sp 26) */}
      <View style={{ marginTop: 26 }}>
        <SectionHeader
          eyebrow={t('home.section.trendingEyebrow')}
          title={t('home.section.trendingTitle')}
          actionLabel={t('home.section.trendingAll')}
          onActionPress={() => router.push('/community' as never)}
        />
        <View style={{ marginTop: 12 }}>
          <HomeTrending onKeywordPress={comingSoon} />
        </View>
      </View>

      {/* Wine browse (sp 26) */}
      <View style={{ marginTop: 26 }}>
        <SectionHeader
          eyebrow={t('home.section.browseEyebrow')}
          title={t('home.section.browseTitle')}
          actionLabel={t('home.section.browseHint')}
        />
        <View style={{ marginTop: 14 }}>
          <WineFeed />
        </View>
      </View>
    </ScrollView>
  );
}
