/**
 * CommentRow — 커뮤니티 포스트 상세 화면의 댓글 행.
 *
 * 사양: community-components.md §1-3 verbatim.
 *   - flexDirection row, gap 10, paddingVertical 10
 *   - paddingLeft: isReply ? 36 : 0 (들여쓰기)
 *   - borderBottom: StyleSheet.hairlineWidth (§6-11 0.5px 대체)
 *   - Avatar size: isReply ? 24 : 30 (asLink=false, nested 안전 §6-8)
 *   - Name + level pill + (optional) expert badge + body + footer (ago / reply / spacer / reaction)
 *
 * **light-only mode** (§0-2): dark variant 생략.
 * **DEVIATION §6-2**: keyscreen cream Name → light.text.primary (cream invisible on white).
 * **DEVIATION §6-5**: keyscreen gold Expert color → light.border.active (deep gold AA pass).
 */
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Wine } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { CommUserAvatar } from './comm-user-avatar';
import { getCommunityUser } from '@/lib/mock/community-posts';

interface CommentRowProps {
  userId: string;
  ago: string;
  text: string;
  reactions?: number;
  isReply?: boolean;
  expert?: boolean;
  onReply?: (userId: string) => void;
  onReact?: (userId: string) => void;
}

export function CommentRow({
  userId,
  ago,
  text,
  reactions = 0,
  isReply = false,
  expert = false,
  onReply,
  onReact,
}: CommentRowProps) {
  const { t } = useTranslation();
  const user = getCommunityUser(userId);
  if (!user) return null;

  const avatarSize = isReply ? 24 : 30;

  const handleNamePress = () => {
    // §10 B: profile route v0.1.0 미존재 — no-op (caller가 Toast로 처리 옵션)
  };

  const handleReply = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onReply?.(userId);
  };

  const handleReact = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onReact?.(userId);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 10,
        paddingLeft: isReply ? 36 : 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: light.border.default,
      }}
    >
      <CommUserAvatar
        levelId={user.level}
        initial={user.initial}
        size={avatarSize}
        asLink={false}
      />

      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Name + level + expert badge row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: 2,
          }}
        >
          <Pressable
            onPress={handleNamePress}
            accessibilityRole="button"
            accessibilityLabel={t('community.comment.profileLabel', { name: user.name })}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            hitSlop={4}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 11,
                fontWeight: '600',
                color: light.text.primary,
              }}
            >
              {user.name}
            </Text>
          </Pressable>

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
              fontFamily: 'Inter_600SemiBold',
              fontSize: 9,
              fontWeight: '600',
              letterSpacing: 0.36,
            }}
          >
            L{user.level}
          </Text>

          {expert ? (
            <Text
              allowFontScaling={false}
              style={{
                paddingVertical: 1,
                paddingHorizontal: 6,
                borderRadius: 999,
                backgroundColor: withAlpha(brand.gold, 0.2),
                borderWidth: 1,
                borderColor: withAlpha(brand.gold, 0.4),
                color: light.border.active,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 9,
                fontWeight: '600',
                letterSpacing: 0.54,
              }}
            >
              {t('community.comment.expert')}
            </Text>
          ) : null}
        </View>

        {/* Body */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            lineHeight: 18.6,
            color: light.text.secondary,
          }}
        >
          {text}
        </Text>

        {/* Footer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 6,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 10,
              color: light.text.muted,
            }}
          >
            {ago}
          </Text>

          <Pressable
            onPress={handleReply}
            accessibilityRole="button"
            accessibilityLabel={t('community.comment.replyLabel', { name: user.name })}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            hitSlop={4}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 10,
                color: light.text.muted,
              }}
            >
              {t('community.comment.reply')}
            </Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable
            onPress={handleReact}
            accessibilityRole="button"
            accessibilityLabel={t('community.comment.reactLabel', {
              name: user.name,
              count: reactions,
            })}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            hitSlop={4}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Wine size={11} strokeWidth={1.75} color={light.text.muted} />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 10,
                  color: light.text.muted,
                }}
              >
                {reactions}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
