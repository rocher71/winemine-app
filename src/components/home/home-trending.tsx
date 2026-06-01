/**
 * HomeTrending — 이번 주 트렌딩 카드 (신규, 사양 home.md §3-7).
 *
 * Card(bg-surface, border-gold, radius 18, shadows.homeCard).
 *  - "이번 주 키워드" header + KeywordChip wrap — 실 community feed post type 분포로 집계(fabrication 금지).
 *  - RankRow × 3: num Playfair 22 + PostTypeBadge tag pill + title 2-line + meta(author · glass · chat).
 *    num #1 = wine, #2·#3 = gold-soft.
 *
 * 데이터: useCommunityFeed (실 community 글 — comments/rating/type/author). 0건 → EmptyState.
 * 작성자명은 익명 community 페르소나(getCommunityUser) — 실 UUID 노출 아님(§4-5 준수).
 * §4-11: KeywordChip·RankRow Pressable hit+opacity만, layout/visual inner View.
 */
import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { brand, typography, shadows, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { WMGlassRating } from '@/components/shared/wm-glass-rating';
import { PostTypeBadge, type PostType } from '@/components/community/post-type-badge';
import { useCommunityFeed } from '@/hooks/use-community-posts';
import { getCommunityUser } from '@/lib/mock/community-posts';

interface KeywordChipProps {
  label: string;
  count: number;
  hot?: boolean;
  onPress: () => void;
}

function KeywordChip({ label, count, hot, onPress }: KeywordChipProps) {
  const tokens = useThemeTokens();
  const bg = hot ? withAlpha(brand.wineRed, 0.06) : tokens.bg.inset;
  const border = hot ? withAlpha(brand.wineRed, 0.18) : withAlpha(brand.gold, 0.24);
  const goldAccent = tokens.scheme === 'light' ? brand.goldDeep : brand.gold;
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
        }}
      >
        <Text
          style={{
            fontFamily: typography.homeKeywordChip.family,
            fontSize: typography.homeKeywordChip.size,
            color: tokens.text.primary,
          }}
        >
          {label}
        </Text>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: 'Freesentation_7Bold', fontSize: 11, color: goldAccent }}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

interface RankEntry {
  id: string;
  type: PostType;
  title: string;
  author: string;
  rating?: number;
  comments: number;
}

function RankRow({ rank, entry }: { rank: number; entry: RankEntry }) {
  const tokens = useThemeTokens();
  const numColor = rank === 1 ? brand.wineRed : tokens.scheme === 'light' ? brand.goldDeep : brand.goldSoft;
  const lineSoft = withAlpha(brand.textInk, 0.06);
  const { t } = useTranslation();

  const onPress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/community/${entry.id}` as never); // /community/[postId]
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${t(`community.postType.${entry.type}`)} ${entry.title}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: 13,
          paddingVertical: 13,
          borderTopWidth: 1,
          borderTopColor: lineSoft,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: typography.homeRankNum.family,
            fontSize: typography.homeRankNum.size,
            lineHeight: typography.homeRankNum.lineHeight,
            color: numColor,
            width: 24,
          }}
        >
          {rank}
        </Text>
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <View style={{ flexDirection: 'row' }}>
            <PostTypeBadge type={entry.type} />
          </View>
          <Text
            style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 14, lineHeight: 18.9, color: tokens.text.primary }}
            numberOfLines={2}
          >
            {entry.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text
              style={{ fontFamily: typography.cardMeta.family, fontSize: 11.5, color: tokens.text.muted }}
              numberOfLines={1}
            >
              {entry.author}
            </Text>
            {entry.rating != null ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <WMGlassRating value={entry.rating} size={9} max={1} />
                <Text style={{ fontFamily: typography.cardMeta.family, fontSize: 11.5, color: tokens.text.muted }}>
                  {entry.rating.toFixed(1)}
                </Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <MessageSquare size={11} strokeWidth={1.75} color={tokens.text.muted} />
              <Text style={{ fontFamily: typography.cardMeta.family, fontSize: 11.5, color: tokens.text.muted }}>
                {entry.comments}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface HomeTrendingProps {
  onKeywordPress: () => void;
}

export function HomeTrending({ onKeywordPress }: HomeTrendingProps) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const borderGold = withAlpha(brand.gold, 0.24);
  const { posts, loading } = useCommunityFeed();

  // 키워드: 실 feed post type 분포 집계 (fabrication 아님 — 실제 글 type count).
  const keywords = useMemo(() => {
    const counts = new Map<PostType, number>();
    for (const p of posts) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type, count]) => ({ type, count }));
  }, [posts]);

  // rank: comments 많은 순 top 3 (실 community 글).
  const ranks = useMemo<RankEntry[]>(() => {
    return [...posts]
      .sort((a, b) => b.comments - a.comments)
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        type: p.type,
        title: p.title,
        author: getCommunityUser(p.userId)?.name ?? '',
        rating: p.rating,
        comments: p.comments,
      }));
  }, [posts]);

  return (
    <View style={{ paddingHorizontal: 22 }}>
      <View
        style={{
          borderRadius: 18,
          backgroundColor: tokens.bg.surface,
          borderWidth: 1,
          borderColor: borderGold,
          paddingTop: 16,
          paddingHorizontal: 16,
          paddingBottom: 8,
          ...shadows.homeCard,
        }}
      >
        {loading || ranks.length === 0 ? (
          <View style={{ paddingVertical: 18, alignItems: 'center' }}>
            <Text style={{ fontFamily: typography.cardBody.family, fontSize: 13, color: tokens.text.muted }}>
              {t('home.moduleEmpty.trending')}
            </Text>
          </View>
        ) : (
          <>
            {keywords.length > 0 ? (
              <>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    fontSize: 11,
                    letterSpacing: 1.1,
                    textTransform: 'uppercase',
                    color: tokens.scheme === 'light' ? brand.goldDeep : brand.gold,
                    marginBottom: 11,
                  }}
                >
                  {t('home.trendingSection.keywordHeader')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  {keywords.map((kw, i) => (
                    <KeywordChip
                      key={kw.type}
                      label={t(`community.postType.${kw.type}`)}
                      count={kw.count}
                      hot={i === 0}
                      onPress={onKeywordPress}
                    />
                  ))}
                </View>
              </>
            ) : null}
            {ranks.map((entry, i) => (
              <RankRow key={entry.id} rank={i + 1} entry={entry} />
            ))}
          </>
        )}
      </View>
    </View>
  );
}
