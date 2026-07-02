/**
 * CommentRow — 커뮤니티 포스트 상세 화면의 댓글 행.
 *
 * 사양: community-components.md §1-3 verbatim (+ 댓글 개선 요구 2/3/4).
 *   - flexDirection row, gap 10, paddingVertical 10
 *   - paddingLeft: isReply ? 36 : 0 (들여쓰기, 1 depth 유지 — 요구3)
 *   - borderBottom: StyleSheet.hairlineWidth (§6-11 0.5px 대체)
 *   - Avatar size: isReply ? 24 : 30 (asLink=false, nested 안전 §6-8)
 *   - Name + level pill + (optional) expert badge + body + footer (ago / reply / spacer / reaction)
 *
 * 요구2: body 앞에 파란 `@닉네임` 멘션 태그 (tappable → 프로필 이동).
 * 요구3: 답글에도 '답글' 버튼 노출 (onReply 를 모든 행에 전달).
 * 요구4: comment.wineLwin 있을 시 CommentWineCard 첨부.
 *
 * **light-only mode** (§0-2): dark variant 생략.
 * **DEVIATION §6-2**: keyscreen cream Name → light.text.primary (cream invisible on white).
 * **DEVIATION §6-5**: keyscreen gold Expert color → light.border.active (deep gold AA pass).
 */
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Wine, Flag, MoreVertical } from 'lucide-react-native';
import { brand, communityPost, light, withAlpha } from '@/lib/design-tokens';
import { CommUserAvatar } from './comm-user-avatar';
import { CommentWineCard } from './comment-wine-card';
import { getCommunityUser } from '@/lib/mock/community-posts';
import type { CommComment } from '@/lib/mock/community-comments';

/** moderation_status — 'removed' 면 본문 자리에 tombstone (원문 보존, 표시 계층만 교체). */
export type CommentModerationStatus = 'visible' | 'pending' | 'removed';

interface CommentRowProps {
  comment: CommComment;
  /** localized 본문 — caller 가 localizedBody(comment, lang) 로 계산. */
  text: string;
  onReply?: (comment: CommComment) => void;
  onReact?: (commentId: string) => void;
  /** 멘션(`@닉네임`) 태프 시 프로필 이동 (요구2). */
  onMentionPress?: (userId: string) => void;
  /** moderation 상태 (M3). 'removed' → tombstone + 메뉴/반응 비노출, 작성자명·시각·답글 유지. */
  status?: CommentModerationStatus;
  /** ... 메뉴 트리거 (M3). 호출처가 ActionMenuTrigger 주입. 'removed' 면 미렌더. */
  onMore?: (comment: CommComment) => void;
}

export function CommentRow({
  comment,
  text,
  onReply,
  onReact,
  onMentionPress,
  status = 'visible',
  onMore,
}: CommentRowProps) {
  const { t } = useTranslation();
  const user = getCommunityUser(comment.userId);
  if (!user) return null;

  const removed = status === 'removed';
  const isReply = comment.isReply || !!comment.parentId;
  const expert = comment.isExpert ?? false;
  const reactions = comment.reactions ?? 0;
  const mentionUser = comment.replyToUserId ? getCommunityUser(comment.replyToUserId) : undefined;
  const avatarSize = isReply ? 24 : 30;

  const handleNamePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onMentionPress?.(comment.userId);
  };

  const handleReply = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onReply?.(comment);
  };

  const handleReact = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onReact?.(comment.id);
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
        userId={comment.userId}
        asLink
      />

      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Name + level + expert badge row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
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
                fontFamily: 'Freesentation_4Regular',
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
              fontFamily: 'Freesentation_4Regular',
              fontSize: 9,
              fontWeight: '600',
              letterSpacing: 0.36,
            }}
          >
            {t(`level.L${user.level}`)}
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
                fontFamily: 'Freesentation_4Regular',
                fontSize: 9,
                fontWeight: '600',
                letterSpacing: 0.54,
              }}
            >
              {t('community.comment.expert')}
            </Text>
          ) : null}
        </View>

        {/* Body — removed 면 tombstone (원문 비노출, 표시 계층만 교체 — M3) */}
        {removed ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Flag size={12} strokeWidth={1.9} color={light.text.muted} />
            <Text
              allowFontScaling={false}
              style={{
                flex: 1,
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                fontStyle: 'italic',
                lineHeight: 18.6,
                color: light.text.muted,
              }}
            >
              {t('moderation.comment.removedTombstone')}
            </Text>
          </View>
        ) : (
          <>
            {/* Body (+ 멘션 파란 태그 prefix — 요구2) */}
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                lineHeight: 18.6,
                color: light.text.secondary,
              }}
            >
              {mentionUser && (
                <Text
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => undefined);
                    onMentionPress?.(mentionUser.id);
                  }}
                  accessibilityRole="link"
                  accessibilityLabel={t('community.comment.mentionLabel', { name: mentionUser.name })}
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    color: communityPost.mentionBlue,
                  }}
                >
                  {`@${mentionUser.name} `}
                </Text>
              )}
              {text}
            </Text>

            {/* 첨부 와인 카드 (요구4) */}
            {comment.wineLwin && <CommentWineCard lwin={comment.wineLwin} />}
          </>
        )}

        {/* Footer — removed 면 시각/답글만 유지(스레드 보존), 반응·메뉴 비노출 (M3) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10,
              color: light.text.muted,
            }}
          >
            {comment.ago}
          </Text>

          {onReply && (
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
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 10,
                  color: light.text.muted,
                }}
              >
                {t('community.comment.reply')}
              </Text>
            </Pressable>
          )}

          <View style={{ flex: 1 }} />

          {!removed && (
            <Pressable
              onPress={handleReact}
              accessibilityRole="button"
              accessibilityLabel={t('community.comment.reactLabel', { name: user.name, count: reactions })}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              hitSlop={4}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Wine size={11} strokeWidth={1.75} color={light.text.muted} />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 10,
                    color: light.text.muted,
                  }}
                >
                  {reactions}
                </Text>
              </View>
            </Pressable>
          )}

          {/* ... 메뉴 트리거 (M3) — removed 면 비노출 (이미 처리된 콘텐츠) */}
          {!removed && onMore && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => undefined);
                onMore(comment);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('moderation.menu.a11yTrigger')}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              hitSlop={6}
            >
              <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
                <CommentMoreDots />
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

/** 댓글 행 작은 ... 트리거 아이콘 (reaction 과 시각 균형 — 14px). */
function CommentMoreDots() {
  return <MoreVertical size={14} strokeWidth={1.9} color={light.text.muted} />;
}
