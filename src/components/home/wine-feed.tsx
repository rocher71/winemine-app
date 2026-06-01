/**
 * WineFeed — 와인 둘러보기 (Editorial Stack 재설계, 사양 home.md §3-8).
 *
 * BrowseTabs h-scroll(TabChip × 3: 추천/트렌딩/탐험) → WineCard × N(gap 13) → InfiniteLoader.
 *  - 카드: WineFeedRow (bottle 58, name 21, radius 18, padding 18, shadows.homeCard).
 *  - infinite loader: 리더 Q7 — v0.1.0은 mock first-page + loader 시각 스텁 (가짜 무한 mock 금지).
 *    실 list/pagination hook 부재(useWine은 단일 lwin) → onEndReached 실 fetch 없음, loader는 표시만.
 *
 * SectionHeader(타이틀)는 상위 home-feed 컨테이너가 제공. 본 모듈은 탭+카드+loader만.
 * 데이터: v0.1.0 mock 2종(Château Margaux / Biondi-Santi) verbatim. 0건 → EmptyState.
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

const MOCK_WINES_KO: MockWine[] = [
  {
    id: 'w1',
    lwin: '1011196',
    name: '샤또 마고 2018',
    producer: '샤또 마고',
    vintage: 2018,
    region: '보르도',
    country: '프랑스',
    grapes: '카베르네 소비뇽 · 메를로',
    score: 4.7,
    priceKrw: 1200000,
    type: 'red',
  },
  {
    id: 'w2',
    lwin: '1011225',
    name: '비온디 산티 브루넬로 디 몬탈치노 2016',
    producer: '비온디 산티',
    vintage: 2016,
    region: '토스카나',
    country: '이탈리아',
    grapes: '산지오베제',
    score: 4.5,
    priceKrw: 480000,
    type: 'red',
  },
];

const MOCK_WINES_EN: MockWine[] = [
  {
    id: 'w1',
    lwin: '1011196',
    name: 'Château Margaux 2018',
    producer: 'Château Margaux',
    vintage: 2018,
    region: 'Bordeaux',
    country: 'France',
    grapes: 'Cabernet Sauvignon · Merlot',
    score: 4.7,
    priceKrw: 1200000,
    type: 'red',
  },
  {
    id: 'w2',
    lwin: '1011225',
    name: 'Biondi-Santi Brunello di Montalcino 2016',
    producer: 'Biondi-Santi',
    vintage: 2016,
    region: 'Tuscany',
    country: 'Italy',
    grapes: 'Sangiovese',
    score: 4.5,
    priceKrw: 480000,
    type: 'red',
  },
];

export function WineFeed() {
  const { t, i18n } = useTranslation();
  const tokens = useThemeTokens();
  const [tab, setTab] = useState<TabKey>('featured');
  const list = i18n.language === 'en' ? MOCK_WINES_EN : MOCK_WINES_KO;

  const onTab = (next: TabKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    setTab(next);
  };

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

      {list.length === 0 ? (
        <View style={{ paddingHorizontal: 22, paddingVertical: 28, alignItems: 'center' }}>
          <Text style={{ fontFamily: typography.cardBody.family, fontSize: 13, color: tokens.text.muted }}>
            {t('home.moduleEmpty.browse')}
          </Text>
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, gap: 13 }}>
            {list.map((w) => (
              <WineFeedRow key={w.id} wine={w} />
            ))}
          </View>
          <InfiniteLoader label={t('home.browseSection.loadingMore')} />
        </>
      )}
    </View>
  );
}
