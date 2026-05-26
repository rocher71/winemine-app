/**
 * /knowledge/winery/[wineryId]/lineup — 와이너리 전체 라인업 화면
 *
 * 핸드오프 knowledge-c-light-details.jsx WineryLineupScreen 기반.
 * - SegmentedControl 필터 (전체/레드/화이트)
 * - LineupCard 리스트
 * - (존재 시) GrandCrus 섹션
 */
import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { light, ivory, brand, shadows } from '@/lib/design-tokens';
import { useWineryDetail } from '@/hooks/use-knowledge';
import { currentLocale, type AppLocale } from '@/lib/i18n';
import { SegmentedControl } from '@/components/knowledge';
import type { WineEntry, CruEntry } from '@/lib/mock/knowledge';

type FilterKey = 'all' | 'red' | 'white';

export default function WineryLineupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { wineryId } = useLocalSearchParams<{ wineryId: string }>();
  const locale = currentLocale();
  const { winery } = useWineryDetail(wineryId ?? '');

  const [filterIdx, setFilterIdx] = useState(0);
  const filters: FilterKey[] = ['all', 'red', 'white'];

  const filteredLineup = useMemo((): WineEntry[] => {
    if (!winery) return [];
    const key = filters[filterIdx] ?? 'all';
    if (key === 'all') return winery.lineup;
    return winery.lineup.filter((w: WineEntry) => w.type === key);
  }, [winery, filterIdx]);

  const pageBg = ivory.bg.page1;
  const cardBg = ivory.bg.surface;
  const cardBorder = ivory.border;
  const goldColor = brand.goldDeep;

  if (!winery) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 14, color: ivory.text.muted }}>
            {t('knowledge.history.empty')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: pageBg }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: pageBg,
        }}
      >
        <View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={22} strokeWidth={1.8} color={light.text.primary} />
            </View>
          </Pressable>
        </View>

        <View style={{ flex: 1, marginHorizontal: 4, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 17,
              color: light.text.primary,
              letterSpacing: -0.17,
            }}
            numberOfLines={1}
          >
            {winery.shortName}
          </Text>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              color: ivory.text.muted,
              letterSpacing: 0.44,
              marginTop: 1,
            }}
          >
            {t('knowledge.winery.lineupTitle')}
          </Text>
        </View>

        {/* Balance spacer */}
        <View style={{ width: 36 }} />
      </View>

      {/* Segmented filter */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
        <SegmentedControl
          options={[
            t('knowledge.winery.lineupFilterAll'),
            t('knowledge.winery.lineupFilterRed'),
            t('knowledge.winery.lineupFilterWhite'),
          ]}
          activeIndex={filterIdx}
          onChange={setFilterIdx}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Count label */}
        <Text
          style={{
            fontFamily: 'Freesentation_5Medium',
            fontSize: 11,
            color: ivory.text.muted,
            letterSpacing: 0.55,
            marginBottom: 12,
            paddingHorizontal: 2,
          }}
        >
          {locale === 'ko'
            ? `${filteredLineup.length}종`
            : `${filteredLineup.length} wine${filteredLineup.length !== 1 ? 's' : ''}`}
        </Text>

        {/* Lineup cards */}
        {filteredLineup.length === 0 ? (
          <View
            style={{
              padding: 24,
              alignItems: 'center',
              borderRadius: 14,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: cardBorder,
            }}
          >
            <Text style={{ fontFamily: 'Freesentation_4Regular', fontSize: 13, color: ivory.text.muted }}>
              {t('knowledge.winery.lineupEmpty')}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginBottom: winery.grandCrus.length > 0 ? 28 : 0 }}>
            {filteredLineup.map((wine: WineEntry) => (
              <LineupCard
                key={wine.id}
                wine={wine}
                accentColor={winery.accentColor}
                locale={locale}
                cardBg={cardBg}
                cardBorder={cardBorder}
                goldColor={goldColor}
                vintageLabel={t('knowledge.winery.lineupVintage')}
              />
            ))}
          </View>
        )}

        {/* Grand Crus section (if present) */}
        {winery.grandCrus.length > 0 && (
          <View>
            <Text
              style={{
                fontFamily: 'Freesentation_7Bold',
                fontSize: 10,
                color: goldColor,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 10,
                paddingHorizontal: 2,
              }}
            >
              {t('knowledge.winery.grandCrusSection')}
            </Text>
            <View style={{ gap: 10 }}>
              {winery.grandCrus.map((cru: CruEntry) => (
                <GrandCruCard
                  key={cru.name}
                  cru={cru}
                  locale={locale}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                  goldColor={goldColor}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Inline sub-components ──

interface LineupCardProps {
  wine: WineEntry;
  accentColor: string;
  locale: AppLocale;
  cardBg: string;
  cardBorder: string;
  goldColor: string;
  vintageLabel: string;
}

function LineupCard({ wine, accentColor, locale, cardBg, cardBorder, goldColor, vintageLabel }: LineupCardProps) {
  const isRed = wine.type === 'red';
  const typeLabel = locale === 'ko'
    ? (isRed ? '레드' : '화이트')
    : (isRed ? 'Red' : 'White');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: cardBorder,
        gap: 14,
        ...shadows.sm,
      }}
    >
      {/* Color dot */}
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: isRed ? accentColor : '#D4B87A',
          flexShrink: 0,
        }}
      />

      {/* Name */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 15,
            color: light.text.primary,
            letterSpacing: -0.15,
            fontWeight: '500',
          }}
        >
          {wine.name}
        </Text>
        {wine.vintage && (
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              color: ivory.text.muted,
              letterSpacing: 0.44,
              marginTop: 1,
            }}
          >
            {vintageLabel} {wine.vintage}
          </Text>
        )}
      </View>

      {/* Type badge */}
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
          backgroundColor: isRed ? `${accentColor}18` : `${goldColor}18`,
          borderWidth: 1,
          borderColor: isRed ? `${accentColor}44` : `${goldColor}44`,
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_5Medium',
            fontSize: 10,
            color: isRed ? accentColor : goldColor,
            letterSpacing: 0.5,
          }}
        >
          {typeLabel}
        </Text>
      </View>
    </View>
  );
}

interface GrandCruCardProps {
  cru: CruEntry;
  locale: AppLocale;
  cardBg: string;
  cardBorder: string;
  goldColor: string;
}

function GrandCruCard({ cru, locale, cardBg, cardBorder, goldColor }: GrandCruCardProps) {
  return (
    <View
      style={{
        padding: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: cardBg,
        borderWidth: cru.highlight ? 1.5 : 1,
        borderColor: cru.highlight ? `${goldColor}55` : cardBorder,
        ...shadows.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text
          style={{
            flex: 1,
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 15,
            color: light.text.primary,
            letterSpacing: -0.15,
            fontWeight: '500',
          }}
        >
          {cru.name}
        </Text>
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 11,
            color: ivory.text.muted,
            letterSpacing: 0.44,
          }}
        >
          {cru.ha} ha
        </Text>
      </View>
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 12,
          color: ivory.text.secondary,
          lineHeight: 18,
          letterSpacing: 0.12,
        }}
      >
        {locale === 'ko' ? cru.desc.ko : cru.desc.en}
      </Text>
    </View>
  );
}
