/**
 * HeavyHome — heavy 모드 8섹션 hero (사양 home.md §2-1 verbatim).
 *
 * 순서: PeakGreeting → DraftNoteResume → StatHero → MapCameo →
 *       HomeCommunityPeek → RecentNotesStrip (0건 시 미렌더) → WineFeed → QuickActions
 *
 * ScrollView contentContainerStyle.paddingHorizontal = 0 — 각 섹션이 자체 padding 관리 (사양 §1 b1).
 * 섹션 간 간격은 각 컴포넌트의 marginTop으로 표현 (gap-N 글로벌 제거).
 * RefreshControl tintColor gold. paddingBottom 32 (사양 §2-1 line 68).
 */
import { useCallback } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useRecentNotes } from '@/hooks/use-notes';
import { useCellarSummary } from '@/hooks/use-cellar';
import { brand } from '@/lib/design-tokens';
import { PeakGreeting } from './peak-greeting';
import { DraftNoteResume } from './draft-note-resume';
import { StatHero } from './stat-hero';
import { MapCameo } from './map-cameo';
import { HomeCommunityPeek } from './home-community-peek';
import { RecentNotesStrip } from './recent-notes-strip';
import { WineFeed } from './wine-feed';
import { QuickActions } from './quick-actions';

interface HeavyHomeProps {
  displayName: string;
}

export function HeavyHome({ displayName }: HeavyHomeProps) {
  const { notes, loading: notesLoading, refresh: refreshNotes } = useRecentNotes(8);
  const { cellaredCount, loading: cellarLoading, refresh: refreshCellar } = useCellarSummary();

  const refreshing = notesLoading || cellarLoading;
  const onRefresh = useCallback(async () => {
    await Promise.all([refreshNotes(), refreshCellar()]);
  }, [refreshNotes, refreshCellar]);

  // 통계 계산 (profile.stats RPC 미구현 — v0.1.0 mock):
  // 추후 supabase RPC `profile_stats(uid)`로 교체 (사양 §11 P1).
  const winesTasted = new Set(
    notes.map((n) => n.wine?.lwin).filter((x): x is string => Boolean(x)),
  ).size;
  const notesCount = notes.length;
  const countries = 0; // wines_localized JOIN country distinct count — v0.1.0 placeholder
  const regions = 0;

  // DraftNoteResume v0.1.0: draft 시스템 미구현 (사양 §12 Q5) — 현 시점 hide.
  const draftResume = null; // 추후 useDraftNote() 훅 도입 시 활성화

  return (
    <ScrollView
      className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={brand.gold}
        />
      }
    >
      <PeakGreeting name={displayName} />
      {draftResume}
      <StatHero countries={countries} wines={winesTasted} notes={notesCount} />
      <MapCameo countries={countries} regions={regions} />
      <HomeCommunityPeek />
      <RecentNotesStrip notes={notes} />
      <WineFeed />
      <View style={{ height: 12 }} />
      <QuickActions cellaredCount={cellaredCount} regionsCount={regions} />
    </ScrollView>
  );
}
