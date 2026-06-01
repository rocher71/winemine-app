/**
 * WineFeed — 와인 둘러보기 (Editorial Stack 재설계, 사양 home.md §3-8).
 *
 * BrowseTabs h-scroll(TabChip × 3: 추천/트렌딩/탐험) → WineCard × N(gap 13) → InfiniteLoader.
 *  - 카드: WineFeedRow (bottle 58, name 21, radius 18, padding 18, shadows.homeCard).
 *  - 데이터: useWineBrowse (상위 home-feed가 보유, 본 모듈은 props로 받아 렌더).
 *    실 wines_localized 카탈로그 (DEMO_MODE → 15와인 mock). rating/price는 VIEW 미보유로 카드에서 숨김.
 *  - infinite scroll: home-feed ScrollView near-bottom → loadMore. loader는 hasMore/loadingMore일 때만.
 *  - 탭(추천/트렌딩/탐험): v0.1.0은 시각 전환만(쿼리 분기 미정) — 동일 카탈로그 표시.
 *
 * SectionHeader(타이틀)는 상위 home-feed 컨테이너가 제공. 본 모듈은 탭+카드+loader만.
 */
import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Sparkles, Flame, Globe2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { typography } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { TabChip } from './tab-chip';
import { WineFeedRow, type MockWine } from './wine-feed-row';
import { InfiniteLoader } from '@/components/shared/infinite-loader';

type TabKey = 'featured' | 'trending' | 'explore';

interface WineFeedProps {
  wines: MockWine[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
}

export function WineFeed({ wines, loading, loadingMore, hasMore }: WineFeedProps) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const [tab, setTab] = useState<TabKey>('featured');

  const onTab = (next: TabKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    setTab(next);
  };

  const isEmpty = !loading && wines.length === 0;

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 12, gap: 6 }}
      >
        <TabChip active={tab === 'featured'} Icon={Sparkles} label={t('home.wineFeed.tabs.featured')} onPress={() => onTab('featured')} />
        <TabChip active={tab === 'trending'} Icon={Flame} label={t('home.wineFeed.tabs.trending')} onPress={() => onTab('trending')} />
        <TabChip active={tab === 'explore'} Icon={Globe2} label={t('home.wineFeed.tabs.explore')} onPress={() => onTab('explore')} />
      </ScrollView>

      {isEmpty ? (
        <View style={{ paddingHorizontal: 22, paddingVertical: 28, alignItems: 'center' }}>
          <Text style={{ fontFamily: typography.cardBody.family, fontSize: 13, color: tokens.text.muted }}>
            {t('home.moduleEmpty.browse')}
          </Text>
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, gap: 13 }}>
            {wines.map((w) => (
              <WineFeedRow key={w.id} wine={w} />
            ))}
          </View>
          {loadingMore || hasMore ? <InfiniteLoader label={t('home.browseSection.loadingMore')} /> : null}
        </>
      )}
    </View>
  );
}
