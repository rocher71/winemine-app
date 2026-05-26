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
  {
    id: 'w3',
    lwin: '1011230',
    name: '쟈코모 콘테르노 바롤로 카시나 프란치아 2017',
    producer: '쟈코모 콘테르노',
    vintage: 2017,
    region: '피에몬테',
    country: '이탈리아',
    grapes: '네비올로',
    score: 4.6,
    priceKrw: 360000,
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
  {
    id: 'w3',
    lwin: '1011230',
    name: 'Giacomo Conterno Barolo Cascina Francia 2017',
    producer: 'Giacomo Conterno',
    vintage: 2017,
    region: 'Piedmont',
    country: 'Italy',
    grapes: 'Nebbiolo',
    score: 4.6,
    priceKrw: 360000,
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
