/**
 * FirstTimeHome — first-time 모드 4섹션 (사양 home.md §2-2 verbatim).
 *
 * 순서: FirstTimeGreeting → EmptyStatHero → SuggestedActions → WineFeed
 * ScrollView로 변경 (이전 풀스크린 center → 카드형 상단 흐름).
 * 사양 §1 a13: first-time도 ScrollView로 감싸기 필수.
 */
import { ScrollView } from 'react-native';
import { FirstTimeGreeting } from './first-time-greeting';
import { EmptyStatHero } from './empty-stat-hero';
import { SuggestedActions } from './suggested-actions';
import { WineFeed } from './wine-feed';

interface FirstTimeHomeProps {
  displayName: string;
}

export function FirstTimeHome({ displayName }: FirstTimeHomeProps) {
  return (
    <ScrollView
      className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <FirstTimeGreeting name={displayName} />
      <EmptyStatHero />
      <SuggestedActions />
      <WineFeed />
    </ScrollView>
  );
}
