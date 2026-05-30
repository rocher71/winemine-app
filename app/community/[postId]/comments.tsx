/**
 * /community/[postId]/comments — 커뮤니티 포스트 댓글 목록 + 입력 화면.
 *
 * 사양: _workspace/design-specs/community-post-comments.md (715 LOC).
 *   - light-only mode (§0-2).
 *   - Compact post header → Sort/Filter row → CommentRow list → Compose footer (TextInput 활성).
 *   - focus=true query 시 Composer autoFocus.
 *
 * §10 결정 (요약):
 *   A: community-comments.ts 모듈 사용 (community-post.md §10 J 동일 신규 모듈)
 *   B: EmptyState defensive (comments.length === 0 fallback)
 *   C: Composer TextInput 활성화 — focus=true query 시 autoFocus
 *   D: Cancel reply UI = Composer 위 별도 row (1탭 cancel) (§10 D 권장 (c))
 *   E: KeyboardAvoidingView v0.1.0 (iOS padding, Android height)
 *   F: Compact header Post title numberOfLines=2 (모바일 UX)
 *   G: Sort/Filter active state = color 분기만 (keyscreen verbatim)
 *   H: draft trim().length > 0 검증
 *   I: submit 후 state push + draft reset + dismissKeyboard
 *   J: BackHeader title = comments.length 동적 (submit 후 +1 sync)
 *   K: expert flag = mock sommelier user 만 true (mock module verbatim)
 *
 * §4-11 Pressable 패턴: 2-layer (hit + visual). Send button 원형 size/2=19 명시 (§6-11).
 * §4-10 CSS layout primitive 변환:
 *   - `borderBottom: 0.5px` → StyleSheet.hairlineWidth (§6-2)
 *   - `borderRadius: 999` (Composer pill 38, Send 38) → 19 명시 (§6-11)
 *   - `position: 'absolute'` (Compose footer) → RN 동등
 *   - `paddingBottom: 20` → 20 + insets.bottom (§6-9)
 *   - `<input>` → TextInput (§6-12)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, MessageSquare, X } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { getCommunityPost, getCommunityUser } from '@/lib/mock/community-posts';
import { getCommentsByPost, localizedBody, type CommComment } from '@/lib/mock/community-comments';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { CommentRow } from '@/components/community/comment-row';

type SortMode = 'helpful' | 'recent';

export default function CommunityPostCommentsScreen() {
  const { postId, focus } = useLocalSearchParams<{ postId: string; focus?: string }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const post = postId ? getCommunityPost(postId) : undefined;
  const user = post ? getCommunityUser(post.userId) : undefined;

  // §6-7 / §10 A: comments mock module
  const initialComments = useMemo(
    () => (postId ? getCommentsByPost(postId) : []),
    [postId]
  );

  // §2-B states
  const [comments, setComments] = useState<CommComment[]>(initialComments);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('helpful');
  const [expertsOnly, setExpertsOnly] = useState(false);
  // mock reactions toggle — v0.1.0 영속 X
  const [, setReactions] = useState<Record<string, boolean>>({});

  const composerRef = useRef<TextInput>(null);

  // autoFocus when focus=true query (§4-2)
  useEffect(() => {
    if (focus === 'true') {
      const id = setTimeout(() => composerRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [focus]);

  // §2-C visibleComments
  const visibleComments = useMemo(() => {
    let result = [...comments];
    if (expertsOnly) result = result.filter((c) => c.isExpert === true);
    if (sortMode === 'recent') {
      // v0.1.0 mock: 단순 reverse (실 timestamp 없음)
      result = [...result].reverse();
    } else {
      result = [...result].sort((a, b) => b.reactions - a.reactions);
    }
    return result;
  }, [comments, expertsOnly, sortMode]);

  // §10 J: BackHeader title — comments.length 동적
  const headerTitle = t('community.comments.headerTitle', { count: comments.length });

  // ────────────────────────────────────────────────────────────────────────
  // Handlers (§5-A/B/C)
  // ────────────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    const body = draft.trim();
    if (body.length === 0) return; // §10 H
    const next: CommComment = {
      id: `local-${Date.now()}`,
      postId: post?.id ?? '',
      userId: 'suyeon', // mock current user
      ago: t('common.justNow'),
      body: { ko: body, en: body }, // mock locale unaware
      reactions: 0,
      isReply: replyTo !== null,
      isExpert: false,
    };
    setComments((prev) => [...prev, next]);
    setDraft('');
    setReplyTo(null);
    setSortMode('recent'); // §10 I: 자기 댓글 즉시 보이도록 recent 전환
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  const handleReply = (targetUserId: string) => {
    setReplyTo(targetUserId);
    Haptics.selectionAsync().catch(() => undefined);
    composerRef.current?.focus();
  };

  const handleReact = (commentId: string) => {
    setReactions((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    Haptics.selectionAsync().catch(() => undefined);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    Haptics.selectionAsync().catch(() => undefined);
  };

  // §4-3 reply mode placeholder
  const replyTargetUser = replyTo ? getCommunityUser(replyTo) : undefined;
  const composerPlaceholder = replyTargetUser
    ? t('community.comments.replyPlaceholder', { name: replyTargetUser.name })
    : t('community.comments.composePlaceholder');

  if (!post) {
    return <PostNotFound />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={headerTitle} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Compact post header */}
          {post && user && (
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: light.border.default,
                backgroundColor: light.bg.surface,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CommUserAvatar levelId={user.level} initial={user.initial} size={24} asLink={false} />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 11,
                    color: light.text.muted,
                  }}
                >
                  {`${user.name} · ${post.ago}`}
                </Text>
              </View>
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 13,
                  lineHeight: 16.9,
                  color: light.text.primary,
                  marginTop: 6,
                }}
              >
                {post.title}
              </Text>
            </View>
          )}

          {/* Sort/Filter row */}
          <View
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: light.border.default,
            }}
          >
            <SortFilterButton
              label={t('community.comments.sortHelpful')}
              hint={t('community.comments.sortHint')}
              active={sortMode === 'helpful'}
              onPress={() => {
                setSortMode('helpful');
                Haptics.selectionAsync().catch(() => undefined);
              }}
            />
            <SortFilterButton
              label={t('community.comments.sortRecent')}
              hint={t('community.comments.sortHint')}
              active={sortMode === 'recent'}
              onPress={() => {
                setSortMode('recent');
                Haptics.selectionAsync().catch(() => undefined);
              }}
            />
            <View style={{ flex: 1 }} />
            <SortFilterButton
              label={t('community.comments.expertsOnly')}
              hint={t('community.comments.expertsHint')}
              active={expertsOnly}
              onPress={() => {
                setExpertsOnly((prev) => !prev);
                Haptics.selectionAsync().catch(() => undefined);
              }}
            />
          </View>

          {/* Comments list */}
          {visibleComments.length > 0 ? (
            <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
              {visibleComments.map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  text={localizedBody(c, i18n.language)}
                  onReply={(cm) => handleReply(cm.userId)}
                  onReact={(id) => handleReact(id)}
                />
              ))}
            </View>
          ) : (
            <View style={{ paddingVertical: 64, alignItems: 'center' }}>
              <MessageSquare size={32} strokeWidth={1.5} color={light.text.muted} />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 13,
                  color: light.text.muted,
                  marginTop: 12,
                }}
              >
                {t('community.comments.empty')}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Compose footer (Composer + Send) — §10 D Cancel reply row above */}
        <View
          pointerEvents="box-none"
          style={{
            paddingTop: replyTargetUser ? 0 : 0,
          }}
        >
          {/* §10 D: Cancel reply row */}
          {replyTargetUser && (
            <View
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: light.bg.surface,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: light.border.default,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  flex: 1,
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 11,
                  color: light.text.muted,
                }}
              >
                {t('community.comments.replyingTo', { name: replyTargetUser.name })}
              </Text>
              <Pressable
                onPress={handleCancelReply}
                accessibilityRole="button"
                accessibilityLabel={t('community.comments.cancelReply')}
                hitSlop={6}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={14} strokeWidth={2} color={light.text.muted} />
                </View>
              </Pressable>
            </View>
          )}

          {/* Compose footer */}
          <View
            style={{
              paddingTop: 10,
              paddingHorizontal: 16,
              // §10 N / §6-9
              paddingBottom: 20 + insets.bottom,
              backgroundColor: light.bg.deepest,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: light.border.default,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <CommUserAvatar levelId={4} initial={'이'} size={32} asLink={false} />
            {/* Composer TextInput (§10 C — 실 입력) */}
            <View
              style={{
                flex: 1,
                height: 38,
                borderRadius: 19,
                backgroundColor: light.bg.surface,
                borderWidth: 1,
                borderColor: light.border.default,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
              }}
            >
              <TextInput
                ref={composerRef}
                value={draft}
                onChangeText={setDraft}
                placeholder={composerPlaceholder}
                placeholderTextColor={light.text.muted}
                accessibilityLabel={t('community.comments.composeLabel')}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                multiline={false}
                style={{
                  flex: 1,
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 12,
                  color: light.text.primary,
                  padding: 0,
                }}
              />
            </View>
            {/* Send button (size/2 = 19) */}
            <Pressable
              onPress={handleSubmit}
              accessibilityRole="button"
              accessibilityLabel={t('common.send')}
              accessibilityState={{ disabled: draft.trim().length === 0 }}
              disabled={draft.trim().length === 0}
              hitSlop={4}
              style={({ pressed }) => ({
                opacity:
                  draft.trim().length === 0 ? 0.4 : pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor:
                    draft.trim().length > 0
                      ? brand.wineRed
                      : withAlpha(brand.wineRed, 0.4),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={16} strokeWidth={2} color={brand.cream} />
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LightBackHeader (inline — §6-1)
// ────────────────────────────────────────────────────────────────────────────

function LightBackHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top,
        height: insets.top + 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => undefined);
          router.back();
        }}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        hitSlop={12}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          marginRight: 12,
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <ChevronLeft size={24} strokeWidth={1.75} color={light.text.primary} />
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: 'Freesentation_4Regular',
          fontWeight: '600',
          fontSize: 16,
          lineHeight: 19.2,
          color: light.text.primary,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Post Not Found
// ────────────────────────────────────────────────────────────────────────────

function PostNotFound() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={t('community.post.notFoundHeader')} />
      <View style={{ paddingVertical: 32, alignItems: 'center' }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            color: light.text.muted,
          }}
        >
          {t('community.post.notFound')}
        </Text>
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sort/Filter button (§10 G — color 분기만)
// ────────────────────────────────────────────────────────────────────────────

interface SortFilterButtonProps {
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}

function SortFilterButton({ label, hint, active, onPress }: SortFilterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ selected: active }}
      hitSlop={6}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: active ? 'Freesentation_4Regular' : 'Freesentation_4Regular',
          fontWeight: active ? '600' : '400',
          fontSize: 11,
          color: active ? light.border.active : light.text.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
