/**
 * WineFeed — 와인 둘러보기 (heavy + first-time 공용).
 *
 * 사양 home.md §2-1 line 130-150, §3-8 + §3-8-PATCH (2026-05-21):
 * - section mt 24
 * - header padding 0_20_8 baseline justify-between
 *   - h2 "와인 둘러보기" Playfair 18 cream
 *   - subtitle Inter 11 text-muted "카드 탭하면 상세로"
 * - tab chips: Sparkles/Flame/Globe2 — TabChip 컴포넌트
 * - list column gap 8 padding 0_16 — WineFeedRow 컴포넌트
 *
 * v0.1.0: featured wines 데이터 소스 미정 (사양 §12 Q3). mock 사용.
 */
import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Sparkles, Flame, Globe2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { TabChip } from './tab-chip';
import { WineFeedRow, type MockWine } from './wine-feed-row';

type TabKey = 'featured' | 'trending' | 'explore';

const MOCK_WINES_KO: MockWine[] = [
  {
    id: 'w1',
    lwin: '1012345',
    name: '도멘 르플레브 퓌셀',
    producer: '도멘 르플레브',
    vintage: 2019,
    region: '뫼르소',
    country: '프랑스',
    grapes: '샤르도네',
    score: 4.4,
    priceKrw: 380000,
    type: 'white',
  },
  {
    id: 'w2',
    lwin: '1012346',
    name: '샤토 마고',
    producer: '샤토 마고',
    vintage: 2015,
    region: '메독',
    country: '프랑스',
    grapes: '카베르네 소비뇽 · 메를로',
    score: 4.7,
    priceKrw: 1200000,
    type: 'red',
  },
  {
    id: 'w3',
    lwin: '1012347',
    name: '안티노리 티냐넬로',
    producer: '안티노리',
    vintage: 2018,
    region: '토스카나',
    country: '이탈리아',
    grapes: '산지오베제 · 카베르네',
    score: 4.5,
    priceKrw: 240000,
    type: 'red',
  },
];

const MOCK_WINES_EN: MockWine[] = [
  {
    id: 'w1',
    lwin: '1012345',
    name: 'Domaine Leflaive Pucelles',
    producer: 'Domaine Leflaive',
    vintage: 2019,
    region: 'Meursault',
    country: 'France',
    grapes: 'Chardonnay',
    score: 4.4,
    priceKrw: 380000,
    type: 'white',
  },
  {
    id: 'w2',
    lwin: '1012346',
    name: 'Chateau Margaux',
    producer: 'Chateau Margaux',
    vintage: 2015,
    region: 'Medoc',
    country: 'France',
    grapes: 'Cabernet Sauvignon · Merlot',
    score: 4.7,
    priceKrw: 1200000,
    type: 'red',
  },
  {
    id: 'w3',
    lwin: '1012347',
    name: 'Antinori Tignanello',
    producer: 'Antinori',
    vintage: 2018,
    region: 'Tuscany',
    country: 'Italy',
    grapes: 'Sangiovese · Cabernet',
    score: 4.5,
    priceKrw: 240000,
    type: 'red',
  },
];

export function WineFeed() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<TabKey>('featured');
  const wines = i18n.language === 'en' ? MOCK_WINES_EN : MOCK_WINES_KO;

  // 탭 별 mock filter (실 데이터는 v0.2.0)
  const list = wines;

  const onTab = (next: TabKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    setTab(next);
  };

  return (
    <View style={{ marginTop: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingBottom: 8,
          paddingHorizontal: 20,
        }}
      >
        <Text
          className="font-playfair text-text-primary dark:text-text-primary"
          style={{ fontSize: 18 }}
        >
          {t('home.wineFeed.heading')}
        </Text>
        <Text
          className="font-inter text-text-muted dark:text-text-muted"
          style={{ fontSize: 11 }}
        >
          {t('home.wineFeed.subtitle')}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10, gap: 6 }}
      >
        <TabChip
          active={tab === 'featured'}
          Icon={Sparkles}
          label={t('home.wineFeed.tabs.featured')}
          onPress={() => onTab('featured')}
        />
        <TabChip
          active={tab === 'trending'}
          Icon={Flame}
          label={t('home.wineFeed.tabs.trending')}
          onPress={() => onTab('trending')}
        />
        <TabChip
          active={tab === 'explore'}
          Icon={Globe2}
          label={t('home.wineFeed.tabs.explore')}
          onPress={() => onTab('explore')}
        />
      </ScrollView>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {list.map((w) => (
          <WineFeedRow key={w.id} wine={w} />
        ))}
      </View>
    </View>
  );
}
