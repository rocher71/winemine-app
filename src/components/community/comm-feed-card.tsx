/**
 * CommFeedCard + CommFeedRow — 커뮤니티 피드 카드/행 (2 exports).
 *
 * 사양: community-components.md §1-1 verbatim.
 *   - CommFeedCard: 1열 풀 카드 (홈 또는 피드 화면)
 *       padding 14/16/12, radius 14, border 1px default
 *       structure: PostTypeBadge → User row (avatar + name+level pill + ago + more) → Title → Body(3) → [WineEmbedCard stub] → ReactionBar
 *   - CommFeedRow: 밀도 높은 list row (피드 화면 '전체' 탭)
 *       padding 12/16, mb 6, radius 12, border 1px default, gap 8 (column)
 *       structure: Top row (avatar26 + name + badge + spacer + ago) → Title → Body(2) → Footer counts
 *
 * **DEVIATION §6-2**: keyscreen cream Name/Title → light.text.primary (cream invisible on white).
 * **DEVIATION §6-3**: keyscreen webkit-line-clamp → numberOfLines (RN 표준).
 * **DEVIATION §6-4**: keyscreen `margin: '0 16px 6px'` → parent 분리. 본 컴포넌트는 marginBottom:6 만 (horizontal X).
 * **DEVIATION §6-5**: keyscreen `var(--color-gold)` glass icon → light.border.active (#B89438 AA pass).
 * **DEVIATION §10 I**: WineEmbedCard 사양 skip (v0.1.0 단독 사용처 없음) — note 타입 wineId 있어도 stub Text.
 * **light-only mode** (§0-2): dark variant 생략.
 *
 * §4-11 3-layer Pressable: outer Pressable (hit + opacity) + inner View (visual + layout) + 자식.
 * More button: 2-layer (nested Pressable RN 자식 우선 — §6-7).
 */
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MoreHorizontal, Wine, MessageSquare } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { CommUserAvatar } from './comm-user-avatar';
import { PostTypeBadge } from './post-type-badge';
import { ReactionBar } from './reaction-bar';
import { getCommunityUser, type CommPost, type ReactionId } from '@/lib/mock/community-posts';

interface CommFeedCardProps {
  post: CommPost;
  mine?: ReactionId | null;
  onPress?: (postId: string) => void;
  onMore?: (postId: string) => void;
  onReact?: (postId: string, id: ReactionId) => void;
  onComment?: (postId: string) => void;
}

export function CommFeedCard({
  post,
  mine = null,
  onPress,
  onMore,
  onReact,
  onComment,
}: CommFeedCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = getCommunityUser(post.userId);
  if (!user) return null;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    if (onPress) {
      onPress(post.id);
    } else {
      // v0.1.0 `/community/{id}` 미존재 — fallback: 호출처가 onPress 처리. 본 컴포넌트는 no-op.
      // (release 시 router.push 활성)
    }
  };

  const handleMore = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onMore?.(post.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('community.feed.cardLabel', {
        author: user.name,
        title: post.title,
      })}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View
        style={{
          paddingTop: 14,
          paddingRight: 16,
          paddingBottom: 12,
          paddingLeft: 16,
          borderRadius: 14,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: light.border.default,
        }}
      >
        {/* Type badge row */}
        <View style={{ marginBottom: 10, flexDirection: 'row' }}>
          <PostTypeBadge type={post.type} />
        </View>

        {/* User row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CommUserAvatar
            levelId={user.level}
            initial={user.initial}
            size={36}
            asLink={false}
          />

          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 13,
                  color: light.text.primary,
                }}
              >
                {user.name}
              </Text>

              <Text
                allowFontScaling={false}
                style={{
                  paddingVertical: 1,
                  paddingHorizontal: 5,
                  borderRadius: 999,
                  backgroundColor: withAlpha(user.color, 0.13),
                  borderWidth: 1,
                  borderColor: withAlpha(user.color, 0.4),
                  color: user.color,
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 9,
                  fontWeight: '600',
                }}
              >
                L{user.level}
              </Text>
            </View>

            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                color: light.text.muted,
                marginTop: 2,
              }}
            >
              {post.ago}
            </Text>
          </View>

          <Pressable
            onPress={handleMore}
            accessibilityRole="button"
            accessibilityLabel={t('community.feed.moreLabel')}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            hitSlop={4}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoreHorizontal size={14} strokeWidth={1.75} color={light.text.muted} />
            </View>
          </Pressable>
        </View>

        {/* Title */}
        <Text
          allowFontScaling={false}
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 16,
            lineHeight: 20.8,
            color: light.text.primary,
            marginTop: 10,
          }}
        >
          {post.title}
        </Text>

        {/* Body */}
        {post.body ? (
          <Text
            allowFontScaling={false}
            numberOfLines={3}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12.5,
              lineHeight: 20.625,
              color: light.text.secondary,
              marginTop: 6,
            }}
          >
            {post.body}
          </Text>
        ) : null}

        {/* WineEmbedCard stub — §10 I: v0.1.0 사양 skip, 단순 hint text fallback */}
        {post.type === 'note' && post.wineId ? (
          <View
            style={{
              marginTop: 10,
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: light.border.default,
              backgroundColor: withAlpha(brand.wineRed, 0.04),
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                color: light.text.muted,
              }}
            >
              {post.wineId}
            </Text>
          </View>
        ) : null}

        {/* ReactionBar */}
        <ReactionBar
          reactions={post.reactions}
          comments={post.comments}
          mine={mine}
          onReact={(id) => onReact?.(post.id, id)}
          onComment={() => onComment?.(post.id)}
        />
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// CommFeedRow — 전체 탭용 밀도 높은 리스트 행
// ────────────────────────────────────────────────────────────────────────────

interface CommFeedRowProps {
  post: CommPost;
  onPress?: (postId: string) => void;
}

export function CommFeedRow({ post, onPress }: CommFeedRowProps) {
  const { t } = useTranslation();
  const user = getCommunityUser(post.userId);
  if (!user) return null;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress?.(post.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('community.feed.cardLabel', {
        author: user.name,
        title: post.title,
      })}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View
        style={{
          padding: 12,
          marginBottom: 6,
          borderRadius: 12,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: light.border.default,
          gap: 8,
        }}
      >
        {/* Top row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CommUserAvatar
            levelId={user.level}
            initial={user.initial}
            size={26}
            asLink={false}
          />
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              fontWeight: '600',
              color: light.text.primary,
            }}
          >
            {user.name}
          </Text>
          <PostTypeBadge type={post.type} />
          <View style={{ flex: 1 }} />
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10,
              color: light.text.muted,
            }}
          >
            {post.ago}
          </Text>
        </View>

        {/* Title */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            lineHeight: 18.2,
            color: light.text.primary,
          }}
        >
          {post.title}
        </Text>

        {/* Body */}
        {post.body ? (
          <Text
            allowFontScaling={false}
            numberOfLines={2}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11.5,
              lineHeight: 17.825,
              color: light.text.secondary,
            }}
          >
            {post.body}
          </Text>
        ) : null}

        {/* Footer counts */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Wine size={11} strokeWidth={1.75} color={light.border.active} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                color: light.text.muted,
              }}
            >
              {post.reactions.glass}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MessageSquare size={11} strokeWidth={1.75} color={light.text.muted} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                color: light.text.muted,
              }}
            >
              {post.comments}
            </Text>
          </View>

          {post.reactions.drank > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Wine size={11} strokeWidth={1.75} color={brand.wineRed} />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 10,
                  color: brand.wineRed,
                }}
              >
                {t('community.feed.meCount', { count: post.reactions.drank })}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
