/**
 * CommentComposer — 댓글/답글 입력 컴포넌트 (재사용).
 *
 * 사용처:
 *   - 화면 하단 top-level 댓글 입력 (mention 없음)
 *   - 답글 대상 thread 바로 하단 인라인 입력 (요구1) — mentionName 으로 `@닉네임` 파란 prefix 표시 (요구2)
 *
 * 요구2: "@OOO에게 답글 작성 중" 인디케이터 행을 제거하고, 입력창 pill 안에 파란 `@닉네임` 칩을 둔다.
 *   칩의 X 를 누르면 onCancelMention (답글 취소). 작성 완료 후 본문의 파란 태그는 CommentRow 가 렌더.
 * 요구4: 와인 태그 버튼(Wine 아이콘) → onTagWine (picker open). 선택된 와인은 입력 위 미리보기 칩으로 표시.
 *
 * **light-only mode** (§0-2).
 * §4-11: Pressable 들은 hit target + opacity 만, layout/visual 은 inner View. flex 분포는 outer View.
 * §4-10: 원형 Send 38 → size/2=19 명시. pill borderRadius 19.
 */
import { forwardRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Wine, X } from 'lucide-react-native';
import { brand, communityPost, light, withAlpha } from '@/lib/design-tokens';
import { CommUserAvatar } from './comm-user-avatar';
import { CommentWineCard } from './comment-wine-card';

interface CommentComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  /** 답글 멘션 대상 닉네임 — 있을 시 pill 안에 파란 `@name` 칩 노출 (요구2). */
  mentionName?: string | null;
  /** 멘션 칩 X 탭 → 답글 취소. */
  onCancelMention?: () => void;
  /** 첨부된 와인 LWIN — 있을 시 입력 위 미리보기 카드 + 제거 X (요구4). */
  pendingWineLwin?: string | null;
  /** 와인 태그 버튼 탭 → picker open. */
  onTagWine: () => void;
  /** 첨부 와인 제거. */
  onRemoveWine: () => void;
  placeholder: string;
  autoFocus?: boolean;
}

export const CommentComposer = forwardRef<TextInput, CommentComposerProps>(function CommentComposer(
  {
    value,
    onChangeText,
    onSubmit,
    onFocus,
    mentionName,
    onCancelMention,
    pendingWineLwin,
    onTagWine,
    onRemoveWine,
    placeholder,
    autoFocus,
  },
  ref
) {
  const { t } = useTranslation();
  const canSend = value.trim().length > 0 || !!pendingWineLwin;

  return (
    <View>
      {/* 첨부 와인 미리보기 (요구4) */}
      {pendingWineLwin && (
        <View style={{ position: 'relative', marginBottom: 4 }}>
          <CommentWineCard lwin={pendingWineLwin} linkToWine={false} />
          {/* §4-11: position 등 layout 은 outer View, Pressable 은 opacity-only */}
          <View style={{ position: 'absolute', top: 2, right: 2 }}>
            <Pressable
              onPress={onRemoveWine}
              accessibilityRole="button"
              accessibilityLabel={t('community.comments.removeWine')}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: withAlpha(brand.textInk, 0.55),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={13} strokeWidth={2.25} color={brand.cream} />
              </View>
            </Pressable>
          </View>
        </View>
      )}

      {/* 입력 행 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <CommUserAvatar levelId={4} initial={'이'} size={32} asLink={false} />

        {/* flex 분포는 outer View (§4-11 rule 3.5) */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              minHeight: 38,
              borderRadius: 19,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: mentionName ? withAlpha(communityPost.mentionBlue, 0.5) : light.border.default,
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: mentionName ? 6 : 14,
              paddingRight: 6,
              paddingVertical: 4,
              gap: 6,
            }}
          >
            {/* 멘션 파란 칩 (요구2) */}
            {mentionName && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  paddingVertical: 3,
                  paddingLeft: 8,
                  paddingRight: 5,
                  borderRadius: 13,
                  backgroundColor: withAlpha(communityPost.mentionBlue, 0.12),
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    fontSize: 12,
                    color: communityPost.mentionBlue,
                  }}
                >
                  {`@${mentionName}`}
                </Text>
                <Pressable
                  onPress={onCancelMention}
                  accessibilityRole="button"
                  accessibilityLabel={t('community.comments.cancelReply')}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <X size={12} strokeWidth={2.25} color={communityPost.mentionBlue} />
                </Pressable>
              </View>
            )}

            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChangeText}
              onFocus={onFocus}
              autoFocus={autoFocus}
              placeholder={placeholder}
              placeholderTextColor={light.text.muted}
              accessibilityLabel={t('community.comments.composeLabel')}
              returnKeyType="send"
              onSubmitEditing={onSubmit}
              multiline={false}
              style={{
                flex: 1,
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                color: light.text.primary,
                padding: 0,
                paddingLeft: mentionName ? 2 : 0,
              }}
            />

            {/* 와인 태그 버튼 (요구4) */}
            <Pressable
              onPress={onTagWine}
              accessibilityRole="button"
              accessibilityLabel={t('community.comments.tagWine')}
              hitSlop={6}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pendingWineLwin ? withAlpha(brand.wineRed, 0.12) : 'transparent',
                }}
              >
                <Wine
                  size={16}
                  strokeWidth={1.75}
                  color={pendingWineLwin ? brand.wineRed : light.text.muted}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Send (size/2 = 19) */}
        <Pressable
          onPress={onSubmit}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={t('common.send')}
          accessibilityState={{ disabled: !canSend }}
          hitSlop={4}
          style={({ pressed }) => ({ opacity: !canSend ? 0.4 : pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: canSend ? brand.wineRed : withAlpha(brand.wineRed, 0.4),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} strokeWidth={2} color={brand.cream} />
          </View>
        </Pressable>
      </View>
    </View>
  );
});
