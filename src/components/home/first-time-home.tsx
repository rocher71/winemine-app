/**
 * FirstTimeHome — first-time 모드 (사용자 요청 2026-05-21 재구성).
 *
 * 이전: FirstTimeGreeting + EmptyStatHero + SuggestedActions + WineFeed
 * 변경: StatHero(0/0/0) + MapCameo(empty) + HomeCommunityPeek + WineFeed
 *   - hero CTA "라벨 스캔하기" 제거 (대신 BottomNav 가운데 FAB로 진입)
 *   - SuggestedActions 3개 (둘러보기/추천 입문/와인 경험 모드) 제거
 *   - heavy mode와 일관된 stats 표시 (모두 0)
 */
import { ScrollView } from 'react-native';
import { StatHero } from './stat-hero';
import { MapCameo } from './map-cameo';
import { HomeCommunityPeek } from './home-community-peek';
import { WineFeed } from './wine-feed';

interface FirstTimeHomeProps {
  displayName: string;
  onScroll?: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
  paddingTop?: number;
}

export function FirstTimeHome({ onScroll, paddingTop }: FirstTimeHomeProps) {
  return (
    <ScrollView
      className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
      contentContainerStyle={{ paddingBottom: 32, paddingTop }}
      scrollEventThrottle={16}
      onScroll={onScroll}
    >
      <StatHero countries={0} wines={0} notes={0} />
      <MapCameo countries={0} regions={0} />
      <HomeCommunityPeek />
      <WineFeed />
    </ScrollView>
  );
}
