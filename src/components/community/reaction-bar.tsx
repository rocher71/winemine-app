/**
 * ReactionBar — 커뮤니티 포스트 reaction (4종) + comments 카운트.
 *
 * 사양: community-components.md §1-6 verbatim.
 *   - REACTION_ITEMS 4종: glass(잔 들기, gold) / sparkle(통찰, cream) / bookmark(저장, purple) / drank(나도, wine-red)
 *   - 각 button: padding 6/10/6/8, radius 999, border 1px (on: color / off: light.border.default),
 *     bg (on: color@0.13 / off: transparent), gap 5 (icon + count)
 *   - icon 13 strokeWidth 1.75, count Inter 11 600
 *   - comments button: padding 6/10, gap 5, MessageSquare 12 strokeWidth 1.75, Inter 11 500 muted
 *
 * **light-only mode** (§0-2): dark variant 생략.
 * **DEVIATION §10 G**: glass/sparkle on 색 keyscreen verbatim 유지 (mine=null default —
 *   on 상태 빈도 낮음, v0.2.0 재검토). 사양 §6-17 결정.
 *
 * §4-11 3-layer Pressable: outer Pressable (hit + opacity) + inner View (visual + layout) + icon/text.
 */
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Wine, Sparkles, Bookmark, Bot, MessageSquare } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { light, reactionColor, withAlpha } from '@/lib/design-tokens';
import type { CommReactions, ReactionId } from '@/lib/mock/community-posts';

interface ReactionItem {
  id: ReactionId;
  color: string;
  Icon: LucideIcon;
}

// keyscreen REACTION_ITEMS verbatim 포팅 (§1-6 A line 855~860).
// 색은 design-tokens.reactionColor 토큰으로 통합 — hex 하드코딩 차단.
const REACTION_ITEMS: ReactionItem[] = [
  { id: 'glass',    color: reactionColor.glass,    Icon: Wine },
  { id: 'sparkle',  color: reactionColor.sparkle,  Icon: Sparkles },
  { id: 'bookmark', color: reactionColor.bookmark, Icon: Bookmark },
  { id: 'drank',    color: reactionColor.drank,    Icon: Bot },
];

interface ReactionBarProps {
  reactions?: Partial<CommReactions>;
  comments?: number;
  mine?: ReactionId | null;
  onReact?: (id: ReactionId) => void;
  onComment?: () => void;
}

export function ReactionBar({
  reactions,
  comments = 0,
  mine = null,
  onReact,
  onComment,
}: ReactionBarProps) {
  const { t } = useTranslation();

  const handleReact = (id: ReactionId) => {
    Haptics.selectionAsync().catch(() => undefined);
    onReact?.(id);
  };

  const handleComment = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onComment?.();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingTop: 4,
      }}
    >
      {REACTION_ITEMS.map((item) => {
        const count = reactions?.[item.id] ?? 0;
        const on = mine === item.id;
        const fgColor = on ? item.color : light.text.secondary;
        const bgColor = on ? withAlpha(item.color, 0.13) : 'transparent';
        const borderColor = on ? item.color : light.border.default;
        const label = t(`community.reaction.${item.id}`);
        return (
          <Pressable
            key={item.id}
            onPress={() => handleReact(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t('community.reaction.label', { label, count })}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            hitSlop={4}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingTop: 6,
                paddingRight: 10,
                paddingBottom: 6,
                paddingLeft: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor,
                backgroundColor: bgColor,
              }}
            >
              <item.Icon size={13} strokeWidth={1.75} color={fgColor} />
              {count > 0 ? (
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 11,
                    fontWeight: '600',
                    color: fgColor,
                  }}
                >
                  {count}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}

      <View style={{ flex: 1 }} />

      <Pressable
        onPress={handleComment}
        accessibilityRole="button"
        accessibilityLabel={t('community.reaction.commentsLabel', { count: comments })}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        hitSlop={4}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingVertical: 6,
            paddingHorizontal: 10,
            backgroundColor: 'transparent',
          }}
        >
          <MessageSquare size={12} strokeWidth={1.75} color={light.text.muted} />
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              fontWeight: '500',
              color: light.text.muted,
            }}
          >
            {t('community.reaction.comments', { count: comments })}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
