/**
 * WineFeed — 와인 둘러보기 (heavy + first-time 공용).
 *
 * 사양 home.md §2-1 line 130-150, §3-8 + §3-8-PATCH (2026-05-21):
 * - section mt 24
 * - header padding 0_20_8 baseline justify-between
 *   - h2 "와인 둘러보기" Playfair 18 cream
 *   - subtitle Inter 11 text-muted "카드 탭하면 상세로"
 * - tab chips: Sparkles/Flame/Globe2, active gold border + bg goldAlpha 0.12 + gold text
 * - list column gap 8 padding 0_16
 *   - WineFeedRow (PATCH §3-8-PATCH):
 *     bottle column width 96 + WMBottle 90×150 / meta column flex / right column rating+price (no chevron)
 *     padding 16 / gap 16 / radius 14 / items stretch
 *
 * v0.1.0: featured wines 데이터 소스 미정 (사양 §12 Q3). mock 사용.
 */
import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Sparkles, Flame, Globe2, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, withAlpha, bottleColorDefault, radius, type TypeCanonical } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { WMBottle } from '@/components/shared/wm-bottle';
import { WMGlassRating } from '@/components/shared/wm-glass-rating';

type TabKey = 'featured' | 'trending' | 'explore';

interface MockWine {
  id: string;
  lwin: string;
  name: string;
  producer: string;
  vintage: number;
  region: string;
  country: string;
  grapes: string;
  score: number;
  priceKrw: number;
  type: TypeCanonical;
}

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

function formatKrwShort(krw: number, locale: string): string {
  if (locale === 'en') {
    if (krw >= 1_000_000) return `${(krw / 1_000_000).toFixed(1)}M`;
    if (krw >= 1_000) return `${Math.round(krw / 1000)}K`;
    return `${krw}`;
  }
  if (krw >= 10000) return `${Math.round(krw / 10000)}만`;
  return `${krw}`;
}

function TabChip({
  active,
  Icon,
  label,
  onPress,
}: {
  active: boolean;
  Icon: typeof Sparkles;
  label: string;
  onPress: () => void;
}) {
  const tokens = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 9,
        paddingRight: 11,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: active ? brand.gold : tokens.border.default,
        backgroundColor: active ? withAlpha(brand.gold, 0.12) : 'transparent',
      }}
    >
      <Icon size={13} strokeWidth={1.75} color={active ? brand.gold : tokens.text.muted} />
      <Text
        className="font-inter-semibold"
        style={{ color: active ? brand.gold : tokens.text.muted, fontSize: 11 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function WineFeedRow({ wine }: { wine: MockWine }) {
  const tokens = useThemeTokens();
  const bottleColor = bottleColorDefault[wine.type];
  const { t, i18n } = useTranslation();

  // accessibilityLabel: name + producer + vintage + score + price (PATCH §접근성 line 1055)
  // ko: "이름 와이너리 빈티지 평점 4.7 가격 ₩120만"
  // en: "Name, Producer, Vintage, rated 4.7 out of 5, price ₩1.2M"
  const priceSpoken = `₩${formatKrwShort(wine.priceKrw, i18n.language)}`;
  const scoreSpoken = wine.score.toFixed(1);
  const a11yLabel =
    i18n.language === 'en'
      ? `${wine.name}, ${wine.producer}, ${wine.vintage}, rated ${scoreSpoken} out of 5, price ${priceSpoken}`
      : `${wine.name} ${wine.producer} ${wine.vintage} 평점 ${scoreSpoken} 가격 ${priceSpoken}`;

  // Round 8 fix: NativeWind cssInterop + Fabric 환경에서 Pressable에 className + 복잡한 style 함수
  // 동시 적용 시 layout 무시되는 케이스 회피. Pressable은 hit target + opacity만, 모든 layout/visual은
  // inner View로 분리. inner View는 className 없이 inline style만 (cssInterop wrapping 우회).
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        router.push(`/wine/${wine.lwin}` as never);
      }}
      accessibilityRole="link"
      accessibilityLabel={a11yLabel}
      accessibilityHint={t('home.wineFeed.openDetail')}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 16,
          padding: 16,
          borderRadius: radius['14'],
          backgroundColor: tokens.bg.surface,
          borderWidth: 1,
          borderColor: tokens.border.default,
        }}
      >
        {/* Bottle column — width 96 / center align */}
        <View style={{ width: 96, alignItems: 'center', justifyContent: 'center' }}>
          <WMBottle width={90} height={150} bottleColor={bottleColor} type={wine.type} />
        </View>
        {/* Meta column — flex */}
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text
            style={{ fontSize: 16, lineHeight: 19.2, fontFamily: 'Freesentation_4Regular', color: tokens.text.primary }}
            numberOfLines={2}
          >
            {wine.name}
          </Text>
          <Text
            style={{ fontSize: 12, lineHeight: 14.4, fontFamily: 'Freesentation_4Regular', color: tokens.text.secondary }}
            numberOfLines={1}
          >
            {wine.producer} · {wine.vintage}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} strokeWidth={1.75} color={tokens.text.muted} />
            <Text
              style={{ fontSize: 11, fontFamily: 'Freesentation_4Regular', color: tokens.text.muted }}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {wine.region}, {wine.country}
            </Text>
          </View>
          <Text
            style={{ fontSize: 11, marginTop: 1, opacity: 0.85, fontFamily: 'Freesentation_4Regular', color: tokens.text.muted }}
            numberOfLines={1}
          >
            {wine.grapes}
          </Text>
        </View>
        {/* Right column — rating + price (no chevron). center align */}
        <View
          style={{
            alignItems: 'flex-end',
            justifyContent: 'center',
            flexShrink: 0,
            minWidth: 76,
          }}
        >
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <WMGlassRating value={wine.score} size={10} />
              <Text style={{ color: brand.gold, fontSize: 12, fontFamily: 'Freesentation_4Regular' }}>
                {wine.score.toFixed(1)}
              </Text>
            </View>
            <Text style={{ fontSize: 14, lineHeight: 16.8, fontFamily: 'Freesentation_4Regular', color: tokens.text.primary }}>
              ₩{formatKrwShort(wine.priceKrw, i18n.language)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

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
