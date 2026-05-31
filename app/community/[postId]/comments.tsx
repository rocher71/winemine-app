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
import {
  getCommentsByPost,
  localizedBody,
  type CommComment,
} from '@/lib/mock/community-comments';
import {
  fetchCommentsByPost,
  insertComment,
  deleteComment,
  type CommentEntry,
} from '@/lib/community/comments';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { CommentRow, type CommentModerationStatus } from '@/components/community/comment-row';
import { DEMO_MODE } from '@/lib/demo-mode';
import { getCurrentUserId } from '@/lib/auth';
import {
  ContentActionMenu,
  type MenuAction,
} from '@/components/moderation/content-action-menu';
import { ReportSheet } from '@/components/moderation/report-sheet';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Toast } from '@/components/shared/toast';

type SortMode = 'helpful' | 'recent';

/** 화면 내부 댓글 상태 — mock CommComment + moderation status + 작성자 UUID. */
interface ScreenComment {
  comment: CommComment;
  status: CommentModerationStatus;
  authorId: string;
}

export default function CommunityPostCommentsScreen() {
  const { postId, focus } = useLocalSearchParams<{ postId: string; focus?: string }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const post = postId ? getCommunityPost(postId) : undefined;
  const user = post ? getCommunityUser(post.userId) : undefined;

  // §2-B states — 실 comments 테이블 연동 (M3). DEMO_MODE 면 mock fallback(디자인 리뷰용).
  const [comments, setComments] = useState<ScreenComment[]>([]);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('helpful');
  const [expertsOnly, setExpertsOnly] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // mock reactions toggle — v0.1.0 영속 X
  const [, setReactions] = useState<Record<string, boolean>>({});

  // moderation state (M3)
  const [menuComment, setMenuComment] = useState<ScreenComment | null>(null);
  const [reportComment, setReportComment] = useState<ScreenComment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScreenComment | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error'; key: number } | null>(null);

  const composerRef = useRef<TextInput>(null);

  const showToast = (message: string, tone: 'success' | 'error' = 'success') => {
    const key = Date.now();
    setToast({ message, tone, key });
    setTimeout(() => setToast((prev) => (prev && prev.key === key ? null : prev)), 2500);
  };

  // 실 comments 로드 (+ 현재 유저 id 로 owner 분기).
  const reload = async () => {
    if (!postId) return;
    if (DEMO_MODE) {
      const mock = getCommentsByPost(postId);
      setComments(
        mock.map((c) => ({ comment: c, status: 'visible' as CommentModerationStatus, authorId: c.userId })),
      );
      return;
    }
    try {
      const entries: CommentEntry[] = await fetchCommentsByPost(postId);
      setComments(entries.map((e) => ({ comment: e.comment, status: e.status, authorId: e.authorId })));
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    void reload();
    void (async () => setCurrentUserId(await getCurrentUserId()))();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

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
    if (expertsOnly) result = result.filter((c) => c.comment.isExpert === true);
    if (sortMode === 'recent') {
      result = [...result].reverse();
    } else {
      result = [...result].sort((a, b) => b.comment.reactions - a.comment.reactions);
    }
    return result;
  }, [comments, expertsOnly, sortMode]);

  // §10 J: BackHeader title — comments.length 동적
  const headerTitle = t('community.comments.headerTitle', { count: comments.length });

  // ────────────────────────────────────────────────────────────────────────
  // Handlers (§5-A/B/C)
  // ────────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const body = draft.trim();
    if (body.length === 0 || submitting) return; // §10 H
    if (DEMO_MODE) {
      const next: CommComment = {
        id: `local-${Date.now()}`,
        postId: post?.id ?? '',
        userId: 'suyeon',
        ago: t('common.justNow'),
        body: { ko: body, en: body },
        reactions: 0,
        isReply: replyTo !== null,
        isExpert: false,
      };
      setComments((prev) => [...prev, { comment: next, status: 'visible', authorId: next.userId }]);
      setDraft('');
      setReplyTo(null);
      setReplyToCommentId(null);
      setSortMode('recent');
      Keyboard.dismiss();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      return;
    }

    const uid = currentUserId ?? (await getCurrentUserId());
    if (!uid || !postId) return;
    setSubmitting(true);
    const created = await insertComment({
      postId,
      authorId: uid,
      body,
      parentId: replyToCommentId,
    });
    setSubmitting(false);
    if (!created) {
      showToast(t('moderation.error'), 'error');
      return;
    }
    setDraft('');
    setReplyTo(null);
    setReplyToCommentId(null);
    setSortMode('recent'); // §10 I
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    await reload();
  };

  const handleReply = (target: CommComment) => {
    setReplyTo(target.userId);
    setReplyToCommentId(target.parentId ?? target.id); // 답글은 1 depth — root 에 묶음
    Haptics.selectionAsync().catch(() => undefined);
    composerRef.current?.focus();
  };

  const handleReact = (commentId: string) => {
    setReactions((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    Haptics.selectionAsync().catch(() => undefined);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyToCommentId(null);
    Haptics.selectionAsync().catch(() => undefined);
  };

  // moderation (M3) — owner=본인 댓글이면 삭제, 타인이면 신고.
  const handleMore = (sc: ScreenComment) => {
    setMenuComment(sc);
  };

  const menuActions: MenuAction[] = useMemo(() => {
    if (!menuComment) return [];
    const isOwner = !!currentUserId && menuComment.authorId === currentUserId;
    if (isOwner) {
      return [{ kind: 'delete', onPress: () => setDeleteTarget(menuComment) }];
    }
    return [{ kind: 'report', onPress: () => setReportComment(menuComment) }];
  }, [menuComment, currentUserId]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    if (DEMO_MODE) {
      setComments((prev) => prev.filter((c) => c.comment.id !== target.comment.id));
      return;
    }
    const ok = await deleteComment(target.comment.id);
    if (ok) {
      await reload();
    } else {
      showToast(t('moderation.error'), 'error');
    }
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
              {visibleComments.map((sc) => (
                <CommentRow
                  key={sc.comment.id}
                  comment={sc.comment}
                  text={localizedBody(sc.comment, i18n.language)}
                  status={sc.status}
                  onReply={(cm) => handleReply(cm)}
                  onReact={(id) => handleReact(id)}
                  onMore={() => handleMore(sc)}
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
                onSubmitEditing={() => void handleSubmit()}
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
              onPress={() => void handleSubmit()}
              accessibilityRole="button"
              accessibilityLabel={t('common.send')}
              accessibilityState={{ disabled: draft.trim().length === 0 || submitting }}
              disabled={draft.trim().length === 0 || submitting}
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

      {/* moderation (M3) — 메뉴 → 신고/삭제 흐름 */}
      <ContentActionMenu
        open={menuComment !== null}
        actions={menuActions}
        onClose={() => setMenuComment(null)}
      />
      <ReportSheet
        open={reportComment !== null}
        targetType="comment"
        targetId={reportComment?.comment.id ?? ''}
        onClose={() => setReportComment(null)}
        onSubmitted={() => showToast(t('moderation.report.success'), 'success')}
      />
      <ConfirmDialog
        visible={deleteTarget !== null}
        title={t('moderation.menu.deleteConfirmTitle')}
        description={t('moderation.menu.deleteConfirmBody')}
        confirmLabel={t('moderation.menu.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {!!toast && (
        <View
          style={{ position: 'absolute', bottom: 120, left: 16, right: 16 }}
          pointerEvents="none"
        >
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      )}
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
