/**
 * HomeCuratedLists — 큐레이션 리스트 가로 스크롤 (신규, 사양 home.md §3-6).
 *
 * h-scroll(ScrollView horizontal, paddingHorizontal 22, gap 13).
 * CuratedListCard: width 250, bg-surface, border-gold 1px + border-left 4px wine(단일, 리더 Q5),
 *   radius 16, padding 15, shadows.homeCard.
 *  - 우상단 vis chip 26 circle: globe(public) / lock(private).
 *  - title 16/700, desc 12 numberOfLines 2, footer "{n}병 · {age} · {author}" + save count.
 *
 * 데이터: useMyLists('recent'). 0건 → EmptyState 카드.
 * §4-11: 카드 Pressable hit+opacity만, layout/visual inner View inline style.
 */
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Globe, Lock, Bookmark } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, typography, shadows, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { WineListStats } from '@/hooks/use-wine-lists';

const CARD_WIDTH = 250;

function relativeAge(iso: string | null, locale: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.max(0, Math.floor((Date.now() - then) / 86400000));
  if (locale === 'en') {
    if (days < 1) return 'today';
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.floor(days / 7)}w`;
    if (days < 365) return `${Math.floor(days / 30)}mo`;
    return `${Math.floor(days / 365)}y`;
  }
  if (days < 1) return '오늘';
  if (days < 7) return `${days}일`;
  if (days < 30) return `${Math.floor(days / 7)}주`;
  if (days < 365) return `${Math.floor(days / 30)}개월`;
  return `${Math.floor(days / 365)}년`;
}

function CuratedListCard({ list }: { list: WineListStats }) {
  const { t, i18n } = useTranslation();
  const tokens = useThemeTokens();
  const borderGold = withAlpha(brand.gold, 0.24);
  const isPublic = list.visibility === 'public';
  const VisIcon = isPublic ? Globe : Lock;
  const goldAccent = tokens.scheme === 'light' ? brand.goldDeep : brand.gold;

  const age = relativeAge(list.updated_at, i18n.language);
  const footerParts = [
    t('home.list.bottles', { count: list.wine_count }),
    age,
    list.creator_name ?? '',
  ].filter(Boolean);

  const onPress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/cellar/lists/${list.id}` as never);
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${list.title}, ${t('home.list.bottles', { count: list.wine_count })}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          width: CARD_WIDTH,
          borderRadius: 16,
          backgroundColor: tokens.bg.surface,
          borderWidth: 1,
          borderColor: borderGold,
          borderLeftWidth: 4,
          borderLeftColor: brand.wineRed,
          padding: 15,
          ...shadows.homeCard,
        }}
      >
        {/* vis chip 우상단 */}
        <View
          style={{
            position: 'absolute',
            top: 13,
            right: 13,
            width: 26,
            height: 26,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tokens.bg.inset,
          }}
        >
          <VisIcon size={13} strokeWidth={1.75} color={goldAccent} />
        </View>

        <Text
          style={{
            fontFamily: typography.homeListTitle.family,
            fontSize: typography.homeListTitle.size,
            lineHeight: typography.homeListTitle.lineHeight,
            color: tokens.text.primary,
            paddingRight: 30,
          }}
          numberOfLines={2}
        >
          {list.title}
        </Text>

        {list.description ? (
          <Text
            style={{
              fontFamily: typography.cardMeta.family,
              fontSize: 12,
              lineHeight: 17.4,
              color: tokens.text.secondary,
              marginTop: 8,
            }}
            numberOfLines={2}
          >
            {list.description}
          </Text>
        ) : null}

        {/* footer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: withAlpha(brand.textInk, 0.06),
          }}
        >
          <Text
            style={{ fontFamily: typography.cardMeta.family, fontSize: 11.5, color: tokens.text.muted, flex: 1 }}
            numberOfLines={1}
          >
            {footerParts.join(' · ')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 }}>
            <Bookmark size={12} strokeWidth={1.75} color={brand.wineRed} />
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'Freesentation_7Bold', fontSize: 11.5, color: brand.wineRed }}
            >
              {list.save_count}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface HomeCuratedListsProps {
  lists: WineListStats[];
  loading?: boolean;
  onCreatePress: () => void;
}

export function HomeCuratedLists({ lists, loading, onCreatePress }: HomeCuratedListsProps) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const borderGold = withAlpha(brand.gold, 0.24);

  if (loading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, gap: 13 }}
      >
        {[0, 1].map((i) => (
          <View
            key={i}
            style={{ width: CARD_WIDTH, height: 130, borderRadius: 16, backgroundColor: tokens.bg.inset }}
          />
        ))}
      </ScrollView>
    );
  }

  if (lists.length === 0) {
    return (
      <View style={{ paddingHorizontal: 22 }}>
        <View
          style={{
            width: CARD_WIDTH,
            borderRadius: 16,
            backgroundColor: tokens.bg.surface,
            borderWidth: 1,
            borderColor: borderGold,
            padding: 18,
            ...shadows.homeCard,
          }}
        >
          <Text
            style={{ fontFamily: typography.cardBody.family, fontSize: 13, color: tokens.text.muted, marginBottom: 12 }}
          >
            {t('home.moduleEmpty.curated')}
          </Text>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => undefined);
              onCreatePress();
            }}
            accessibilityRole="button"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View
              style={{
                alignSelf: 'flex-start',
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: borderGold,
              }}
            >
              <Text
                style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 12.5, color: tokens.scheme === 'light' ? brand.goldDeep : brand.gold }}
              >
                {t('home.section.curatedAll')}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 22, gap: 13 }}
    >
      {lists.map((list) => (
        <CuratedListCard key={list.id} list={list} />
      ))}
    </ScrollView>
  );
}
