/**
 * /community/[postId] — 커뮤니티 포스트 상세 화면 (5 variants 통합 단일 파일).
 *
 * 사양: _workspace/design-specs/community-post.md (1324 LOC).
 *   - 5 variants 분기: note / column / question / album / news (§10 P 결정 = 단일 파일 유지).
 *   - light-only mode (§0-2): dark variant 생략, 모든 색 light.* 또는 brand.* 토큰.
 *   - Compose footer: post.type !== 'column' 인 경우만 (column 은 read-only 시안).
 *
 * §10 결정 (요약):
 *   A: Composer pill onPress → router.push(`/community/{postId}/comments?focus=true`)
 *   B: Send button → deferredToast (Alert.alert) — comments 화면이 실 입력
 *   C: Share/Bookmark → deferredToast (각각 shareDeferred / bookmarkDeferred)
 *   D: Name button → deferredToast 'community.profile.deferred' (profile route 미존재)
 *   E: Expert annotation = post.id 별 i18n 키 (p1 → expertNote.body.pommard / 기본 default)
 *   F: alsoTriedSub i18n 신규 (§7 보완)
 *   G: Also-tried Add → router.push('/(tabs)/capture')
 *   H: WineEmbedCard 인라인 stub (Wine icon + post.wineId or 'Wine')
 *   I, J: src/lib/mock/community-comments.ts 사용
 *   K: Column Cover hero LinearGradient end = light.bg.deep (warm cream — §6-15)
 *   L: Column WineEmbed wineId = post.wineId field (mock 보강 X — p3는 wineId 부재이므로
 *      stub generic placeholder)
 *   M: Question tags = hardcoded ko 5개 (§6-24 (a) — keyscreen verbatim)
 *   N: Compose footer paddingBottom = 20 + insets.bottom (§6-3 / §10 N)
 *   O: Rank pill text = brand.textInk on light.border.active (대비 4.85:1 — §6-27 권장)
 *   P: 5 variants 단일 파일 유지 (사용자 결정 — 시간 절약, 사양 (a) 채택)
 *
 * §4-11 Pressable 패턴: 2-layer (hit + visual) 또는 3-layer (flex 분포 시 outer flex View).
 * §4-10 CSS layout primitive 변환:
 *   - `position: 'sticky'` / `display: 'grid'` / `marginTop: -N` (poke-out) — 없음 확인.
 *   - `display: 'grid' repeat(4,1fr)` (Album Thumb grid) → flexbox row+wrap + width 계산 (§6-31).
 *   - `borderRadius: 999` 원형 (Send 38×38, Rank 22×22) → size/2 명시 (§6-7).
 *   - `borderTop: 0.5px` / `borderBottom: 0.5px` → StyleSheet.hairlineWidth (§6-5).
 *   - `inset: 12 / 0` → 4 sides expand 또는 absoluteFillObject (§6-33).
 *   - SVG `<defs><pattern>` (Column hero vine / Album bottles) → react-native-svg verbatim (§6-16).
 *   - LinearGradient 3 (Also-tried CTA / Column hero / Album main photo) + Composer fade.
 */
import { useRef, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Info,
  Share2,
} from 'lucide-react-native';
import Svg, { Defs, Pattern, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { brand, light, postTypeBadgeColorLight, withAlpha, communityPost, type TypeCanonical } from '@/lib/design-tokens';
import { getCommunityPost, getCommunityPosts, getCommunityUser, type CommPost, type ReactionId } from '@/lib/mock/community-posts';
import { MOCK_WINES, getMockWineByLwin } from '@/lib/mock/wines';
import { getCommentsByPost, groupCommentThreads, localizedBody, type CommComment } from '@/lib/mock/community-comments';
import { MOCK_LIST_STATS, MOCK_WINE_LIST_ITEMS, MOCK_PUBLIC_LIST_ITEMS } from '@/lib/mock/wine-lists';
import { useImportList } from '@/hooks/use-wine-lists';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { PostTypeBadge } from '@/components/community/post-type-badge';
import { ReactionBar } from '@/components/community/reaction-bar';
import { CommentRow } from '@/components/community/comment-row';
import { CommentComposer } from '@/components/community/comment-composer';
import { WinePickerSheet } from '@/components/community/wine-picker-sheet';
import { CommFeedRow } from '@/components/community/comm-feed-card';
import { WineEmbedCard } from '@/components/community/wine-embed-card';
import { WMBottle } from '@/components/shared/wm-bottle';
import { SaveAsListCta } from '@/components/community/save-as-list-cta';
import { InlineListCard, type InlineListData } from '@/components/community/inline-list-card';
import { type LevelId } from '@/components/shared/level-pill';

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────

export default function CommunityPostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  // 요구1/3: 답글 대상 — 어떤 댓글에(commentId), 어느 thread 아래(parentId), 누구에게(userId).
  const [replyTarget, setReplyTarget] = useState<
    { commentId: string; parentId: string; userId: string } | null
  >(null);
  // 요구4: 작성 중 첨부된 와인 LWIN (top-level/답글 공유).
  const [pendingWine, setPendingWine] = useState<string | null>(null);
  const [winePickerOpen, setWinePickerOpen] = useState(false);
  const [localComments, setLocalComments] = useState<CommComment[]>(() =>
    postId ? getCommentsByPost(postId) : []
  );

  const post = postId ? getCommunityPost(postId) : undefined;

  if (!post) {
    return <NotFoundView />;
  }

  const user = getCommunityUser(post.userId);
  if (!user) return <NotFoundView />;

  const mine: ReactionId | null =
    post.id === 'p1' ? 'glass' : post.id === 'p3' ? 'bookmark' : null;

  const resetComposer = () => {
    setDraft('');
    setPendingWine(null);
    setReplyTarget(null);
  };

  const handleSubmit = () => {
    const body = draft.trim();
    // 요구4: 본문이 비어도 와인만 첨부한 댓글은 허용.
    if (!body && !pendingWine) return;
    const next: CommComment = {
      id: `local-${Date.now()}`,
      postId: post.id,
      userId: 'suyeon',
      ago: t('common.justNow'),
      body: { ko: body, en: body },
      reactions: 0,
      isReply: replyTarget !== null, // 요구3: 1 depth 유지
      parentId: replyTarget?.parentId,
      replyToUserId: replyTarget?.userId, // 요구2: 멘션 태그
      wineLwin: pendingWine ?? undefined, // 요구4
      isExpert: false,
    };
    setLocalComments((prev) => [...prev, next]);
    resetComposer();
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleScrollToCompose = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  // 요구1/3: 답글 — parentId 는 top-level 댓글 id (답글에 답글이면 그 부모 = depth 1 고정).
  const handleReply = (comment: CommComment) => {
    setReplyTarget({
      commentId: comment.id,
      parentId: comment.parentId ?? comment.id,
      userId: comment.userId,
    });
    setDraft('');
    setPendingWine(null);
  };

  const handleCancelReply = () => {
    resetComposer();
  };

  // 요구2: 멘션/이름 탭 → 해당 유저 프로필. (/profile/[userId] 라우트는 병행 작업물)
  const handleMentionPress = (userId: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/profile/${userId}`);
  };

  // 요구4: 와인 picker
  const handleSelectWine = (lwin: string) => {
    setPendingWine(lwin);
    setWinePickerOpen(false);
  };

  const replyMentionName = replyTarget
    ? getCommunityUser(replyTarget.userId)?.name ?? null
    : null;

  const showCompose = post.type !== 'column';
  const titleVariant: 'comments' | 'answers' = post.type === 'question' ? 'answers' : 'comments';

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader post={post} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {post.type === 'note' && <NoteVariant post={post} mine={mine} onComment={handleScrollToCompose} />}
          {post.type === 'column' && <ColumnVariant post={post} mine={mine} onComment={handleScrollToCompose} />}
          {post.type === 'question' && <QuestionVariant post={post} mine={mine} onComment={handleScrollToCompose} />}
          {post.type === 'album' && <AlbumVariant post={post} mine={mine} onComment={handleScrollToCompose} />}
          {post.type === 'news' && <NewsVariant post={post} mine={mine} onComment={handleScrollToCompose} />}
          {post.type === 'list' && <ListVariant post={post} mine={mine} onComment={handleScrollToCompose} />}
          {showCompose && (
            <CommentsSection
              comments={localComments}
              titleVariant={titleVariant}
              i18nLang={i18n.language}
              onReply={handleReply}
              onMentionPress={handleMentionPress}
              activeReplyParentId={replyTarget?.parentId ?? null}
              inlineComposer={
                replyTarget ? (
                  <View style={{ paddingTop: 8, paddingBottom: 4 }}>
                    <CommentComposer
                      value={draft}
                      onChangeText={setDraft}
                      onSubmit={handleSubmit}
                      mentionName={replyMentionName}
                      onCancelMention={handleCancelReply}
                      pendingWineLwin={pendingWine}
                      onTagWine={() => setWinePickerOpen(true)}
                      onRemoveWine={() => setPendingWine(null)}
                      placeholder={t('community.comments.replyPlaceholder')}
                      autoFocus
                    />
                  </View>
                ) : null
              }
            />
          )}
          {/* 요구1: 답글 중에는 하단 입력창 숨김 — 인라인 입력창이 대체. */}
          {showCompose && !replyTarget && (
            <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}>
              <CommentComposer
                value={draft}
                onChangeText={setDraft}
                onSubmit={handleSubmit}
                onFocus={handleScrollToCompose}
                pendingWineLwin={pendingWine}
                onTagWine={() => setWinePickerOpen(true)}
                onRemoveWine={() => setPendingWine(null)}
                placeholder={t('community.addComment')}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 요구4: 와인 태그 picker */}
      <WinePickerSheet
        visible={winePickerOpen}
        onClose={() => setWinePickerOpen(false)}
        onSelect={handleSelectWine}
      />
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LightBackHeader (inline — §6-1 favorites/wine-story 동일 패턴)
// ────────────────────────────────────────────────────────────────────────────

function LightBackHeader({ post }: { post: CommPost }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const showBookmark = post.type === 'column';

  const handleShare = () => {
    Haptics.selectionAsync().catch(() => undefined);
    // §10 C: deferredToast (Alert.alert) — Toast 컴포넌트는 home/suggested-actions 동일 패턴.
    Alert.alert(t('app.name'), t('community.post.shareDeferred'));
  };

  const handleBookmark = () => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.post.bookmarkDeferred'));
  };

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
      {/* §6-2: keyscreen BackHeader title="" 빈 string 유지 — invisible spacer 역할 */}
      <View style={{ flex: 1 }} />
      {/* Right action slot — variant별 1 또는 2 버튼 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {showBookmark && (
          <Pressable
            onPress={handleBookmark}
            accessibilityRole="button"
            accessibilityLabel={t('common.bookmark')}
            hitSlop={4}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bookmark size={18} strokeWidth={1.75} color={light.text.primary} />
            </View>
          </Pressable>
        )}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel={t('common.share')}
          hitSlop={4}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Share2 size={18} strokeWidth={1.75} color={light.text.secondary} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Not Found View (§1-G)
// ────────────────────────────────────────────────────────────────────────────

function NotFoundView() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
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
          onPress={() => router.back()}
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
          style={{
            flex: 1,
            fontFamily: 'Freesentation_4Regular',
            fontWeight: '600',
            fontSize: 16,
            lineHeight: 19.2,
            color: light.text.primary,
          }}
        >
          {t('community.post.notFoundHeader')}
        </Text>
      </View>
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
// Shared: User row (note/question/news variants 동일)
// ────────────────────────────────────────────────────────────────────────────

interface UserRowProps {
  userId: string;
  ago: string;
}

function UserRow({ userId, ago }: UserRowProps) {
  const user = getCommunityUser(userId);
  const { t } = useTranslation();
  if (!user) return null;
  const handleNamePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/profile/${userId}`);
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
      <CommUserAvatar levelId={user.level} initial={user.initial} size={36} userId={userId} asLink />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pressable
            onPress={handleNamePress}
            accessibilityRole="button"
            accessibilityLabel={t('community.comment.profileLabel', { name: user.name })}
            hitSlop={4}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
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
          </Pressable>
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
          {ago}
        </Text>
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Shared: Also-tried CTA (note variant — §1-B 본문 마지막 섹션)
// ────────────────────────────────────────────────────────────────────────────

function AlsoTriedCta() {
  const { t } = useTranslation();
  const handleAdd = () => {
    Haptics.selectionAsync().catch(() => undefined);
    // §10 G: Capture 화면 진입 (와인 prefill 은 v0.2.0)
    router.push('/(tabs)/capture');
  };
  return (
    <View style={{ marginTop: 20, marginHorizontal: 16 }}>
      <LinearGradient
        colors={[withAlpha(brand.wineRed, 0.33), light.bg.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: withAlpha(brand.gold, 0.4),
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 22,
            color: light.border.active,
          }}
        >
          {'|>'}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 12,
              color: light.text.primary,
            }}
          >
            {t('community.alsoTriedCta')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10,
              color: light.text.muted,
              marginTop: 2,
            }}
          >
            {t('community.alsoTriedSub')}
          </Text>
        </View>
        <Pressable
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={t('community.alsoTriedCta')}
          hitSlop={6}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: brand.wineRed,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 11,
                color: brand.cream,
              }}
            >
              {`+ ${t('common.add')}`}
            </Text>
          </View>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Shared: Comments section (all comments inline — no separate screen navigation)
// ────────────────────────────────────────────────────────────────────────────

interface CommentsSectionProps {
  comments: CommComment[];
  titleVariant?: 'comments' | 'answers';
  i18nLang: string;
  onReply?: (comment: CommComment) => void;
  onMentionPress?: (userId: string) => void;
  /** 인라인 답글 입력창을 띄울 thread 의 top-level 댓글 id (요구1). */
  activeReplyParentId?: string | null;
  /** activeReplyParentId thread 바로 아래에 렌더할 입력창 노드. */
  inlineComposer?: ReactNode;
}

function CommentsSection({
  comments,
  titleVariant = 'comments',
  i18nLang,
  onReply,
  onMentionPress,
  activeReplyParentId,
  inlineComposer,
}: CommentsSectionProps) {
  const { t } = useTranslation();
  // 요구3: 평탄 배열을 1 depth thread(부모 + 답글) 로 그룹핑.
  const threads = groupCommentThreads(comments);

  return (
    <View>
      {/* Comments header */}
      <View
        style={{
          paddingTop: 20,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 16,
            color: light.text.primary,
          }}
        >
          {t(`community.post.${titleVariant}`)}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 11,
            color: light.text.muted,
          }}
        >
          {comments.length}
        </Text>
        {titleVariant === 'answers' && (
          <>
            <View style={{ flex: 1 }} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 11,
                color: light.border.active,
              }}
            >
              {`${t('community.post.mostHelpful')} ↓`}
            </Text>
          </>
        )}
      </View>
      {/* Comments list — thread 단위 렌더, 답글은 1 depth 들여쓰기 (요구3) */}
      <View style={{ paddingTop: 8, paddingHorizontal: 20 }}>
        {threads.map((thread) => (
          <View key={thread.root.id}>
            <CommentRow
              comment={thread.root}
              text={localizedBody(thread.root, i18nLang)}
              onReply={onReply}
              onMentionPress={onMentionPress}
            />
            {thread.replies.map((reply) => (
              <CommentRow
                key={reply.id}
                comment={reply}
                text={localizedBody(reply, i18nLang)}
                onReply={onReply}
                onMentionPress={onMentionPress}
              />
            ))}
            {/* 요구1: 답글 대상 thread 바로 하단에 입력창 */}
            {activeReplyParentId === thread.root.id && inlineComposer}
          </View>
        ))}
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Variant 1-B: note
// ────────────────────────────────────────────────────────────────────────────

interface VariantProps {
  post: CommPost;
  mine: ReactionId | null;
  onComment?: () => void;
}

function NoteVariant({ post, mine, onComment }: VariantProps) {
  const { t } = useTranslation();
  const handleComment = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onComment?.();
  };
  // §10 E: post.id 별 expert annotation 본문 i18n 키 분기
  const expertBodyKey =
    post.id === 'p1' ? 'community.post.expertNote.body.pommard' : 'community.post.expertNote.body.default';

  return (
    <>
      {/* Article */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row' }}>
          <PostTypeBadge type={post.type} />
        </View>
        <UserRow userId={post.userId} ago={post.ago} />
        {/* Title */}
        <Text
          allowFontScaling={false}
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 22,
            lineHeight: 27.5,
            color: light.text.primary,
            marginTop: 14,
          }}
        >
          {post.title}
        </Text>
        {/* Rating row */}
        {post.rating != null && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
            }}
            accessibilityRole="text"
            accessibilityLabel={t('community.post.ratingLabel', { value: post.rating })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const filled = i < Math.round(post.rating ?? 0);
                return (
                  <Text
                    key={i}
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Freesentation_4Regular',
                      fontSize: 17,
                      color: light.border.active,
                      opacity: filled ? 1 : 0.25,
                    }}
                  >
                    {'◆'}
                  </Text>
                );
              })}
            </View>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 17,
                color: light.border.active,
              }}
            >
              {` ${post.rating}`}
            </Text>
          </View>
        )}
        {/* Body */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 13.5,
            lineHeight: 23.625,
            color: light.text.secondary,
            fontStyle: 'italic',
            marginTop: 14,
          }}
        >
          {post.body}
        </Text>
        {/* WineEmbedCard (Wave A — bottle + 이 와인 + nameKo + producer·vintage). 슬러그 미해결 시 null. */}
        {post.wineId && <WineEmbedCard wineId={post.wineId} linkToWine />}
        {/* Expert annotation */}
        <View
          style={{
            marginTop: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: withAlpha(brand.gold, 0.05),
            borderWidth: 1,
            borderColor: withAlpha(brand.gold, 0.33),
            borderLeftWidth: 3,
            borderLeftColor: light.border.active,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Info size={11} strokeWidth={2} color={light.border.active} />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontWeight: '600',
                  fontSize: 9,
                  color: light.border.active,
                  letterSpacing: 1.44,
                  textTransform: 'uppercase',
                }}
              >
                {t('community.post.expertNote.label', { author: '함소믈리에' })}
              </Text>
            </View>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11.5,
                lineHeight: 18.4,
                color: light.text.secondary,
              }}
            >
              {t(expertBodyKey)}
            </Text>
          </View>
        </View>
        {/* ReactionBar */}
        <View style={{ marginTop: 14 }}>
          <ReactionBar
            reactions={post.reactions}
            comments={post.comments}
            mine={mine}
            onComment={handleComment}
          />
        </View>
      </View>
      {/* Also-tried CTA */}
      <AlsoTriedCta />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Variant 1-C: column
// ────────────────────────────────────────────────────────────────────────────

function ColumnVariant({ post, mine, onComment }: VariantProps) {
  const { t } = useTranslation();
  const user = getCommunityUser(post.userId);
  const handleNamePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/profile/${post.userId}`);
  };
  const handleComment = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onComment?.();
  };

  // §6-22 Related allPosts indexes 5, 3
  const allPosts = getCommunityPosts();
  const relatedPosts = [allPosts[5], allPosts[3]].filter(Boolean) as CommPost[];

  // §10 L: column WineEmbed = post.wineId field. p3 는 wineId 부재 → 칼럼 주제(부르고뉴 화이트)에
  // 부합하는 resolvable 슬러그 fallback (getWineEmbed 가 해결 가능한 키여야 카드가 렌더됨).
  const columnWineId = post.wineId ?? 'bgy-puligny-montrachet';

  if (!user) return null;

  return (
    <>
      {/* Cover hero */}
      <View style={{ height: 280, position: 'relative' }}>
        <LinearGradient
          colors={[communityPost.heroDeepStart, light.bg.deep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ ...StyleSheet.absoluteFillObject }}
        />
        {/* SVG vine pattern overlay (§6-16) */}
        <Svg
          width="100%"
          height={280}
          viewBox="0 0 390 280"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Defs>
            <Pattern
              id="vine"
              patternUnits="userSpaceOnUse"
              width={18}
              height={18}
              patternTransform="rotate(-8)"
            >
              <Rect width={18} height={18} fill={communityPost.vinePatternBg} />
              <Rect x={0} width={9} height={18} fill={communityPost.vinePatternStripe} />
            </Pattern>
            <SvgLinearGradient id="vgrad" x1={0} y1={0} x2={0} y2={1}>
              {/* §6-17 light 모드 fallback: light.bg.deep with alpha gradient */}
              <Stop offset="0%" stopColor={light.bg.deep} stopOpacity={0} />
              <Stop offset="100%" stopColor={light.bg.deep} stopOpacity={0.85} />
            </SvgLinearGradient>
          </Defs>
          <Rect width={390} height={280} fill="url(#vine)" opacity={0.5} />
          <Rect width={390} height={280} fill="url(#vgrad)" />
        </Svg>
        {/* Hero content */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 22,
            paddingBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <PostTypeBadge type={post.type} />
          </View>
          <Text
            allowFontScaling={false}
            accessibilityRole="header"
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 26,
              lineHeight: 29.9,
              fontStyle: 'italic',
              color: light.text.primary,
              marginTop: 12,
            }}
          >
            {post.title}
          </Text>
        </View>
      </View>

      {/* Author row */}
      <View
        style={{
          paddingTop: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <CommUserAvatar levelId={user.level} initial={user.initial} size={36} userId={post.userId} asLink />
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={handleNamePress}
            accessibilityRole="button"
            accessibilityLabel={t('community.comment.profileLabel', { name: user.name })}
            hitSlop={4}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
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
          </Pressable>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10,
              color: light.text.muted,
              marginTop: 2,
            }}
          >
            {`${post.ago} · ${t('community.post.readTime', { min: 8 })}`}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={{ paddingTop: 20, paddingHorizontal: 22 }}>
        {/* Lead paragraph */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontStyle: 'italic',
            fontSize: 18,
            lineHeight: 29.7,
            color: light.text.primary,
            marginBottom: 16,
          }}
        >
          {post.body}
        </Text>
        {/* 2nd paragraph */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            lineHeight: 25.9,
            color: light.text.secondary,
          }}
        >
          {t('community.post.column.p3.body')}
        </Text>
        {/* Pull quote */}
        <View
          style={{
            marginTop: 22,
            marginBottom: 22,
            paddingLeft: 18,
            borderLeftWidth: 2,
            borderLeftColor: light.border.active,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontStyle: 'italic',
              fontFamily: 'Freesentation_4Regular',
              fontSize: 20,
              lineHeight: 28,
              color: light.border.active,
            }}
          >
            {t('community.post.column.p3.quote')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10,
              color: light.text.muted,
              letterSpacing: 0.6,
              marginTop: 8,
            }}
          >
            {`— Anne-Claude Leflaive`}
          </Text>
        </View>
        {/* 3rd paragraph */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            lineHeight: 25.9,
            color: light.text.secondary,
          }}
        >
          {t('community.post.column.p3.body2')}
        </Text>
        {/* WineEmbedCard (Wave A — standard embed). 슬러그 미해결 시 null. */}
        <WineEmbedCard wineId={columnWineId} linkToWine />
        {/* ReactionBar */}
        <View style={{ marginTop: 14 }}>
          <ReactionBar
            reactions={post.reactions}
            comments={post.comments}
            mine={mine}
            onComment={handleComment}
          />
        </View>
      </View>

      {/* Related */}
      <View style={{ paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontWeight: '600',
            fontSize: 10,
            color: light.border.active,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          {t('community.post.related')}
        </Text>
        <View style={{ flexDirection: 'column', gap: 6 }}>
          {relatedPosts.map((rp) => (
            <CommFeedRow
              key={rp.id}
              post={rp}
              onPress={(rpId) => router.push(`/community/${rpId}`)}
            />
          ))}
        </View>
      </View>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Variant 1-D: question
// ────────────────────────────────────────────────────────────────────────────

function QuestionVariant({ post, mine, onComment }: VariantProps) {
  const { t } = useTranslation();
  const handleComment = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onComment?.();
  };

  // §10 M: hardcoded ko 5 tags (keyscreen verbatim §6-24 (a))
  const tags = ['#결혼식', '#예산_7-9만', '#화이트', '#미디엄레드', '#30명'];

  // §6-25 Top recommendations: MOCK_WINES.slice(2, 5)
  const recoWines = MOCK_WINES.slice(2, 5);
  const recoCounts = [8, 6, 4];

  return (
    <>
      {/* Article */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row' }}>
          <PostTypeBadge type={post.type} />
        </View>
        <UserRow userId={post.userId} ago={post.ago} />
        <Text
          allowFontScaling={false}
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 21,
            lineHeight: 27.3,
            color: light.text.primary,
            marginTop: 14,
          }}
        >
          {post.title}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            lineHeight: 24.5,
            color: light.text.secondary,
            marginTop: 12,
          }}
        >
          {post.body}
        </Text>
        {/* Tag chips */}
        <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {tags.map((tag) => (
            <Text
              key={tag}
              allowFontScaling={false}
              style={{
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 999,
                backgroundColor: light.bg.surface,
                borderWidth: 1,
                borderColor: light.border.default,
                color: light.text.muted,
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
              }}
            >
              {tag}
            </Text>
          ))}
        </View>
        <View style={{ marginTop: 14 }}>
          <ReactionBar
            reactions={post.reactions}
            comments={post.comments}
            mine={mine}
            onComment={handleComment}
          />
        </View>
      </View>

      {/* Top recommendations */}
      <View
        style={{
          marginTop: 18,
          marginHorizontal: 16,
          padding: 16,
          borderRadius: 14,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: withAlpha(brand.gold, 0.33),
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontWeight: '600',
            fontSize: 10,
            color: light.border.active,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          {t('community.post.mostRecommended')}
        </Text>
        <View style={{ flexDirection: 'column', gap: 8 }}>
          {recoWines.map((w, i) => {
            const recCount = recoCounts[i];
            const priceK = '50'; // average_price_krw 부재 — mock fallback (v0.2.0 supabase price column)
            const handleWinePress = () => {
              Haptics.selectionAsync().catch(() => undefined);
              if (w.lwin) router.push(`/wine/${w.lwin}`);
            };
            const displayName = w.name_ko ?? w.display_name ?? 'Wine';
            return (
              <Pressable
                key={w.lwin}
                onPress={handleWinePress}
                accessibilityRole="button"
                accessibilityLabel={t('community.post.wineRowLabel', {
                  name: displayName,
                  recs: recCount,
                })}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    backgroundColor: light.bg.deep,
                    borderWidth: 1,
                    borderColor: light.border.default,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  {/* Rank pill */}
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: i === 0 ? light.border.active : light.bg.surface,
                      borderWidth: 1,
                      borderColor: i === 0 ? light.border.active : light.border.default,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontFamily: 'Freesentation_4Regular',
                        fontWeight: '700',
                        fontSize: 11,
                        // §10 O: i=0 → brand.textInk on light.border.active (대비 4.85:1)
                        color: i === 0 ? brand.textInk : light.text.secondary,
                      }}
                    >
                      {`${i + 1}`}
                    </Text>
                  </View>
                  {/* Bottle silhouette — WMBottle (Wave A 매핑: width 18 → 실루엣 전용, 라벨 텍스트 없음) */}
                  <View style={{ flexShrink: 0 }}>
                    <WMBottle
                      width={18}
                      height={60}
                      bottleColor={w.bottle_color ?? brand.wineRed}
                      type={(w.type_canonical as TypeCanonical | null) ?? null}
                    />
                  </View>
                  {/* Wine info wrap */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      allowFontScaling={false}
                      numberOfLines={1}
                      style={{
                        fontFamily: 'Freesentation_4Regular',
                        fontSize: 11,
                        color: light.text.primary,
                        lineHeight: 14.3,
                      }}
                    >
                      {displayName}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontFamily: 'Freesentation_4Regular',
                        fontSize: 9,
                        color: light.text.muted,
                        marginTop: 2,
                      }}
                    >
                      {t('community.post.recCount', { count: recCount, price: priceK })}
                    </Text>
                  </View>
                  <ChevronRight size={12} strokeWidth={1.75} color={light.text.muted} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SaveAsListCta — Q&A 레더보드 결과를 리스트로 저장 */}
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        <SaveAsListCta
          topCount={recoWines.length}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
            router.push({
              pathname: '/cellar/lists/create',
              params: {
                prefillLwins: recoWines.map((w) => w.lwin).join(','),
                prefillTitle: post.title,
              },
            });
          }}
        />
      </View>

    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Variant 1-E: album
// ────────────────────────────────────────────────────────────────────────────

function AlbumVariant({ post, mine, onComment }: VariantProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const handleComment = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onComment?.();
  };

  // §6-31: Thumb 4열 — width = (screenWidth - paddingHorizontal*2 - gap*3) / 4
  const thumbGap = 6;
  const thumbPaddingH = 16;
  const thumbWidth = (screenWidth - thumbPaddingH * 2 - thumbGap * 3) / 4;

  // §6-32: 4개 어두운 색 hardcoded (album silhouette)
  const thumbColors = communityPost.albumPatternColors;

  // mock wines for thumb bottle silhouette (i=2~5 → MOCK_WINES index 2~5)
  const thumbWines = MOCK_WINES.slice(2, 6);

  return (
    <>
      {/* Article */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <View style={{ marginBottom: 12, flexDirection: 'row' }}>
          <PostTypeBadge type={post.type} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <UserRowInline userId={post.userId} ago={post.ago} />
        </View>
        <Text
          allowFontScaling={false}
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 20,
            lineHeight: 25,
            color: light.text.primary,
          }}
        >
          {post.title}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 13,
            lineHeight: 22.1,
            color: light.text.secondary,
            marginTop: 8,
          }}
        >
          {post.body}
        </Text>
      </View>

      {/* Photo grid */}
      <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
        {/* Main photo (aspectRatio 4/3) */}
        <View
          style={{
            aspectRatio: 4 / 3,
            borderRadius: 14,
            overflow: 'hidden',
            position: 'relative',
          }}
          accessibilityRole="image"
          accessibilityLabel={t('community.post.albumMainLabel', { n: 1, total: post.photoCount ?? 7 })}
        >
          <LinearGradient
            colors={[communityPost.heroDeepStart, light.bg.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ ...StyleSheet.absoluteFillObject }}
          />
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 358 268"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <Defs>
              <Pattern
                id="bottlesPat"
                patternUnits="userSpaceOnUse"
                width={60}
                height={200}
              >
                <Rect width={60} height={200} fill={communityPost.bottleSilhouetteOuter} />
                <Rect x={22} y={20} width={16} height={160} fill={communityPost.bottleSilhouetteBody} opacity={0.6} rx={6} />
                <Rect x={22} y={20} width={16} height={40} fill={communityPost.bottleSilhouetteNeck} rx={2} />
              </Pattern>
            </Defs>
            <Rect width={358} height={268} fill="url(#bottlesPat)" />
          </Svg>
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 999,
              backgroundColor: withAlpha(brand.textInk, 0.7),
              borderWidth: 1,
              borderColor: light.border.default,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 11,
                color: brand.cream,
              }}
            >
              {`1 / ${post.photoCount ?? 7}`}
            </Text>
          </View>
        </View>

        {/* Thumb grid (4열 flex wrap §6-31) */}
        <View
          style={{
            marginTop: 8,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: thumbGap,
          }}
        >
          {[2, 3, 4, 5].map((i, idx) => {
            const thumbWine = thumbWines[idx];
            const showOverlay = i === 5;
            return (
              <View
                key={i}
                style={{
                  width: thumbWidth,
                  aspectRatio: 1,
                  borderRadius: 8,
                  backgroundColor: thumbColors[idx],
                  borderWidth: 1,
                  borderColor: light.border.default,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                accessibilityRole="image"
              >
                {/* Bottle silhouette (inset 12) */}
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    right: 12,
                    bottom: 12,
                    backgroundColor: thumbWine?.bottle_color ?? communityPost.bottleColorFallback,
                    borderRadius: 4,
                  }}
                />
                {/* +3 overlay (i === 5) */}
                {showOverlay && (
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      backgroundColor: withAlpha(brand.textInk, 0.6),
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontFamily: 'Freesentation_4Regular',
                        fontSize: 12,
                        color: brand.cream,
                      }}
                    >
                      {'+3'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* ReactionBar */}
      <View style={{ paddingTop: 14, paddingHorizontal: 20 }}>
        <ReactionBar
          reactions={post.reactions}
          comments={post.comments}
          mine={mine}
          onComment={handleComment}
        />
      </View>

    </>
  );
}

// Album variant 의 UserRow — marginTop 없음 (parent gap 사용)
function UserRowInline({ userId, ago }: UserRowProps) {
  const user = getCommunityUser(userId);
  const { t } = useTranslation();
  if (!user) return null;
  const handleNamePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/profile/${userId}`);
  };
  return (
    <>
      <CommUserAvatar levelId={user.level} initial={user.initial} size={36} userId={userId} asLink />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Pressable
          onPress={handleNamePress}
          accessibilityRole="button"
          accessibilityLabel={t('community.comment.profileLabel', { name: user.name })}
          hitSlop={4}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
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
        </Pressable>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 10,
            color: light.text.muted,
            marginTop: 2,
          }}
        >
          {ago}
        </Text>
      </View>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Variant 1-F: news
// ────────────────────────────────────────────────────────────────────────────

function NewsVariant({ post, mine, onComment }: VariantProps) {
  const { t } = useTranslation();
  const handleComment = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onComment?.();
  };
  return (
    <>
      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row' }}>
          <PostTypeBadge type={post.type} />
        </View>
        <UserRow userId={post.userId} ago={post.ago} />
        <Text
          allowFontScaling={false}
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 21,
            lineHeight: 27.3,
            color: light.text.primary,
            marginTop: 14,
          }}
        >
          {post.title}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            lineHeight: 24.5,
            color: light.text.secondary,
            marginTop: 12,
          }}
        >
          {post.body}
        </Text>
        <View style={{ marginTop: 14 }}>
          <ReactionBar
            reactions={post.reactions}
            comments={post.comments}
            mine={mine}
            onComment={handleComment}
          />
        </View>
      </View>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Variant 1-G: list
// ────────────────────────────────────────────────────────────────────────────

function buildInlineListData(listId: string): InlineListData | null {
  const stat = MOCK_LIST_STATS.find((l) => l.id === listId);
  if (!stat) return null;
  const allItems = [...MOCK_WINE_LIST_ITEMS, ...MOCK_PUBLIC_LIST_ITEMS];
  const preview = allItems
    .filter((i) => i.list_id === listId)
    .slice(0, 3)
    .map((item) => {
      const w = getMockWineByLwin(String(item.lwin));
      if (!w) return null;
      return {
        lwin: item.lwin,
        display_name: w.display_name ?? null,
        name_ko: w.name_ko ?? null,
        producer_name: w.producer_name ?? null,
        vintage: w.vintage ?? null,
      };
    })
    .filter((w): w is NonNullable<typeof w> => w !== null);
  return {
    id: stat.id,
    title: stat.title,
    wineCount: stat.wine_count,
    saveCount: stat.save_count,
    authorName: stat.creator_name ?? '—',
    authorInitial: stat.creator_name?.[0]?.toUpperCase() ?? '?',
    authorLevel: 5 as LevelId,
    previewWines: preview,
  };
}

function ListVariant({ post, mine, onComment }: VariantProps) {
  const { t } = useTranslation();
  const { importList, isLoading: importLoading } = useImportList();

  const handleComment = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onComment?.();
  };

  const handleImport = async () => {
    if (!post.listId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    await importList(post.listId, t('lists.detail.importedTitle', { title: post.title }));
    Alert.alert(t('app.name'), t('lists.detail.importSuccess'));
  };

  const inlineList = post.listId ? buildInlineListData(post.listId) : null;

  return (
    <>
      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row' }}>
          <PostTypeBadge type={post.type} />
        </View>
        <UserRow userId={post.userId} ago={post.ago} />

        {/* Description body */}
        {!!post.body && (
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 13.5,
              lineHeight: 23.625,
              color: light.text.secondary,
              fontStyle: 'italic',
              marginTop: 14,
            }}
          >
            {post.body}
          </Text>
        )}

        {/* Embedded list card — tappable, goes to cellar list detail */}
        {inlineList && (
          <InlineListCard
            list={inlineList}
            onPress={() => {
              Haptics.selectionAsync().catch(() => undefined);
              router.push(`/cellar/lists/${post.listId}`);
            }}
          />
        )}

        {/* 내 리스트로 가져오기 */}
        {!!post.listId && (
          <View style={{ marginTop: 10 }}>
            <Pressable
              onPress={handleImport}
              disabled={importLoading}
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
              accessibilityRole="button"
            >
              <View
                style={{
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: brand.wineRed,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: brand.wineRed,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontWeight: '700',
                    fontSize: 14,
                    color: brand.cream,
                  }}
                >
                  {t('lists.detail.import')}
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* ReactionBar */}
        <View style={{ marginTop: 14 }}>
          <ReactionBar
            reactions={post.reactions}
            comments={post.comments}
            mine={mine}
            onComment={handleComment}
          />
        </View>
      </View>

    </>
  );
}
