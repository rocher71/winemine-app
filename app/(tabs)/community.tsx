/**
 * /community — 커뮤니티 메인 피드 (v0.1.0).
 *
 * 사양: _workspace/design-specs/community.md (light-only).
 *
 * §0-2 light-only mode:
 *   - 라이트 모드 단일 구현. dark variant·className·useColorScheme 결과 무시.
 *   - 모든 색 토큰은 light.* 또는 brand.* 공통값만 참조.
 *
 * §0-3 v0.1.0 2탭 (5탭 → 2탭 축소):
 *   - following  / all  (구현)
 *   - trending / notes / templates  (v0.2.0)
 *
 * §10 사용자 결정:
 *   A: FAB onPress = router.push('/community/new') — Phase 4 화면 생성 시 활성. 현 cycle 미존재 라우트는 Phase 6 자동 인식.
 *   B: Tonight banner onPress = router.push('/community/tonight') — Phase 5 생성.
 *   C: Title row Search 버튼 제거 (v0.1.0).
 *   D: Tonight 텍스트 i18n (count 14 hardcoded, places i18n 고정 문자열).
 *   E: Following posts 순서 [posts[0], posts[2], posts[1]] keyscreen verbatim.
 *   F: FAB shadow = brand.gold.
 *   G: FAB PenLine icon = brand.cream (verbatim).
 *   H: EmptyState 방어 코드 (mock 발화 X, defensive).
 *   I: CommFeedCard/Row tap = router.push('/community/[postId]') — Phase 3 생성.
 *   J: Pull-to-refresh = v0.2.0 미적용.
 *   K: BellButton 분리 = src/components/nav/bell-button.tsx.
 *   L: ScrollView paddingHorizontal:0 — children별 padding (Title 20, Tonight 16, Feed 16).
 *
 * §4-10 Yoga vs CSS 사전 점검:
 *   - 음수 margin: Tab bar marginBottom: -1 (hairline overlap, 유형 B 허용)
 *   - position 'absolute' (FAB): Screen 안 → viewport fixed
 *   - borderRadius 999: Moon wrap 18, FAB 28, Bell dot 4 size/2 명시. pill chip 999 유지 (size 가변).
 *   - shadow: 4속성 inline + elevation 명시 (FAB).
 *
 * §4-11 Pressable 안전 패턴:
 *   - Bell button: 2-layer (Pressable + inner View 36×36 + Bell + dot)
 *   - Tab button: 2-layer (Pressable + inner View padding/border + Text)
 *   - Tonight banner: 3-layer (Pressable + LinearGradient + Moon wrap + Text block + ChevronRight)
 *   - TypeFilter chip: 2-layer (Pressable + inner View padding/border + Text)
 *   - FAB: 3-layer (Pressable + LinearGradient + PenLine)
 *
 * BottomNav 자동 표시 (tabs). ScrollView paddingBottom 156 = FAB 56 + BottomNav 56 + gap 44.
 */
import {useCallback, useMemo, useState} from 'react';
import {View, Text, ScrollView, Pressable, StyleSheet, Animated} from 'react-native';
import {useRef} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {LinearGradient} from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {PenLine, TrendingUp, Flame, ChevronUp, Wine as WineIcon, MessageSquare} from 'lucide-react-native';
import {brand, light, withAlpha} from '@/lib/design-tokens';
import {AppHeader} from '@/components/nav/app-header';
import {BellButton} from '@/components/nav/bell-button';
import {LevelChip} from '@/components/shared/level-chip';
import {CommFeedCard} from '@/components/community/comm-feed-card';
import {PostTypeBadge} from '@/components/community/post-type-badge';
import {
  getCommunityPosts,
  getCommunityUser,
  getTrendingKeywords,
  getTrendingRankedPosts,
  type CommPost,
  type PostType,
  type TrendingKeyword,
} from '@/lib/mock/community-posts';
import {useNotifications} from '@/hooks/use-notifications';
import {useProfile} from '@/hooks/use-profile';

type TabId = 'all' | 'following' | 'trending';
type TypeFilterId = 'all' | PostType;

const TYPE_FILTERS: TypeFilterId[] = ['all', 'note', 'question', 'column', 'news', 'album', 'list'];


export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {t} = useTranslation();
  const {unreadCount} = useNotifications();
  const {profile} = useProfile();

  const displayInitial = (profile?.anonymous_display ?? '?')[0]?.toUpperCase() ?? '?';
  const levelId = Math.max(1, Math.min(5, profile?.level ?? 1)) as 1 | 2 | 3 | 4 | 5;

  // ── Scroll-aware header (Blind 앱 패턴) ───────────────────────────────────
  // onLayout으로 실제 높이 측정 — hardcode 불일치 방지. app-header.tsx spacer 변경 시 자동 반영.
  const headerHRef = useRef(insets.top + 80);
  const [headerH, setHeaderH] = useState(insets.top + 80);
  const handleHeaderLayout = useCallback((e: {nativeEvent: {layout: {height: number}}}) => {
    const h = e.nativeEvent.layout.height;
    if (h !== headerHRef.current) {
      headerHRef.current = h;
      setHeaderH(h);
    }
  }, []);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);

  const handleScroll = (event: {nativeEvent: {contentOffset: {y: number}}}) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    const THRESHOLD = 8;

    if (currentY <= 0) {
      if (!headerVisible.current) {
        headerVisible.current = true;
        Animated.timing(headerTranslateY, {toValue: 0, duration: 200, useNativeDriver: true}).start();
      }
    } else if (diff > THRESHOLD && headerVisible.current) {
      headerVisible.current = false;
      Animated.timing(headerTranslateY, {toValue: -headerHRef.current, duration: 250, useNativeDriver: true}).start();
    } else if (diff < -THRESHOLD && !headerVisible.current) {
      headerVisible.current = true;
      Animated.timing(headerTranslateY, {toValue: 0, duration: 200, useNativeDriver: true}).start();
    }

    lastScrollY.current = currentY;
  };
  // ──────────────────────────────────────────────────────────────────────────

  const [tab, setTab] = useState<TabId>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilterId>('all');

  // Posts mock — community-posts.ts verbatim.
  const posts: CommPost[] = useMemo(() => getCommunityPosts(), []);

  // §10 E: following 탭 keyscreen verbatim 순서 [posts[0], posts[2], posts[1]].
  const followingPosts: CommPost[] = useMemo(
    () => [posts[0], posts[2], posts[1]].filter((p): p is CommPost => Boolean(p)),
    [posts],
  );

  // all 탭 filtered list.
  const filteredPosts: CommPost[] = useMemo(
    () => (typeFilter === 'all' ? posts : posts.filter((p) => p.type === typeFilter)),
    [posts, typeFilter],
  );

  // trending 탭 — Wave A mock (이번 주 키워드 + 순위 리스트).
  const trendingKeywords: TrendingKeyword[] = useMemo(() => getTrendingKeywords(), []);
  const rankedPosts: CommPost[] = useMemo(
    () => getTrendingRankedPosts().filter((p): p is CommPost => Boolean(p)),
    [],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleTabPress = (id: TabId) => {
    Haptics.selectionAsync().catch(() => undefined);
    setTab(id);
  };

  const handleTypeFilterPress = (f: TypeFilterId) => {
    Haptics.selectionAsync().catch(() => undefined);
    setTypeFilter(f);
  };

  // §10 A: FAB → /community/new (Phase 4 생성).
  const handleFabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    router.push('/community/new' as never);
  };

  const handlePostPress = (postId: string) => {
    router.push(`/community/${postId}` as never);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={{flex: 1, backgroundColor: light.bg.deepest}}>
      {/* ── Scroll-aware 헤더 ── */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          transform: [{translateY: headerTranslateY}],
        }}
        onLayout={handleHeaderLayout}
      >
        <AppHeader
          eyebrow={t('community.title')}
          title={
            tab === 'following'
              ? t('community.pageTitle')
              : tab === 'trending'
                ? t('community.trending.title')
                : t('community.allTitle')
          }
          right={
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <BellButton unreadCount={unreadCount} />
              <LevelChip levelId={levelId} initial={displayInitial} />
            </View>
          }
        />
      </Animated.View>

      <ScrollView
        contentContainerStyle={{paddingTop: headerH, paddingBottom: 156}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* ── Tab bar (2탭, §6-9 plain View; §6-10 hairline overlap) ── */}
        <View
          accessibilityRole="tablist"
          style={{
            paddingTop: 14,
            paddingHorizontal: 20,
            flexDirection: 'row',
            gap: 24,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: light.border.default,
          }}
        >
          {(['all', 'following', 'trending'] as TabId[]).map((id) => {
            const active = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => handleTabPress(id)}
                accessibilityRole="tab"
                accessibilityState={{selected: active}}
                accessibilityLabel={t(`community.tabs.${id}`)}
                style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}
              >
                <View
                  style={{
                    paddingBottom: 14,
                    marginBottom: -1, // hairline overlap (§6-10, 유형 B 허용)
                    borderBottomWidth: 2,
                    borderBottomColor: active ? light.border.active : 'transparent',
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={{
                      fontFamily: active ? 'Freesentation_6SemiBold' : 'Freesentation_4Regular',
                      fontSize: 15,
                      color: active ? light.text.primary : light.text.muted,
                    }}
                  >
                    {t(`community.tabs.${id}`)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── tab === 'following' ── */}
        {/* v1.0 스코프 제외: Tonight 배너 제거 (사용자 요청). /community/tonight 화면은 존재하지만 진입 경로 없음. */}
        {tab === 'following' ? (
          <>
            {/* Feed list — 3 CommFeedCard keyscreen verbatim 순서 */}
            <View
              style={{
                paddingTop: 12,
                paddingHorizontal: 16,
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {followingPosts.length > 0 ? (
                followingPosts.map((p) => (
                  <CommFeedCard
                    key={p.id}
                    post={p}
                    mine={p.id === 'p1' ? 'glass' : null}
                    onPress={handlePostPress}
                  />
                ))
              ) : (
                // §10 H: EmptyState defensive (mock 6 posts 고정 — 발화 X).
                <EmptyState
                  title={t('community.empty.followingTitle')}
                  hint={t('community.empty.followingHint')}
                />
              )}
            </View>
          </>
        ) : null}

        {/* ── tab === 'all' ── */}
        {tab === 'all' ? (
          <>
            {/* TypeFilter chips ScrollView */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 10,
                paddingHorizontal: 16,
                paddingBottom: 6,
                gap: 6,
              }}
            >
              {TYPE_FILTERS.map((f) => {
                const active = typeFilter === f;
                const labelKey =
                  f === 'all'
                    ? 'community.typeFilter.all'
                    : (`community.postType.${f}` as const);
                return (
                  <Pressable
                    key={f}
                    onPress={() => handleTypeFilterPress(f)}
                    accessibilityRole="button"
                    accessibilityState={{selected: active}}
                    accessibilityLabel={t(labelKey)}
                    style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}
                  >
                    <View
                      style={{
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        borderRadius: 999, // pill — size 가변 허용 (§6-5 예외)
                        backgroundColor: active
                          ? withAlpha(brand.gold, 0.13)
                          : 'transparent',
                        borderWidth: 1,
                        borderColor: active ? light.border.active : light.border.default,
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        numberOfLines={1}
                        style={{
                          fontFamily: active ? 'Freesentation_6SemiBold' : 'Freesentation_5Medium',
                          fontSize: 13,
                          color: active ? light.border.active : light.text.secondary,
                        }}
                      >
                        {t(labelKey)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Feed Card list — '팔로잉' 탭과 동일한 CommFeedCard 디자인 사용 */}
            <View
              style={{
                paddingTop: 6,
                paddingHorizontal: 16,
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {filteredPosts.length > 0 ? (
                filteredPosts.map((p) => (
                  <CommFeedCard
                    key={p.id}
                    post={p}
                    mine={p.id === 'p1' ? 'glass' : null}
                    onPress={handlePostPress}
                  />
                ))
              ) : (
                // §10 H: EmptyState defensive (typeFilter mock 모두 ≥1 row — 발화 X).
                <EmptyState
                  title={t('community.empty.filterTitle')}
                  hint={t('community.empty.filterHint')}
                />
              )}
            </View>
          </>
        ) : null}

        {/* ── tab === 'trending' ── (GAP-REPORT §C — 이번 주 키워드 + 순위 리스트) */}
        {tab === 'trending' ? (
          <>
            {/* 이번 주 키워드 card */}
            <View
              style={{
                marginTop: 12,
                marginHorizontal: 16,
                marginBottom: 0,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 14,
                backgroundColor: light.bg.surface,
                borderWidth: 1,
                borderColor: light.border.default,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_6SemiBold',
                  fontSize: 10,
                  color: light.border.active,
                  letterSpacing: 1.4, // 0.14em @ 10px
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                {t('community.trending.keywordsLabel')}
              </Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6}}>
                {trendingKeywords.map((kw) => {
                  const tint = trendingTintTokens(kw.tint);
                  return (
                    <View
                      key={kw.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingVertical: 6,
                        paddingHorizontal: 11,
                        borderRadius: 999, // pill — size 가변 허용
                        backgroundColor: tint.bg,
                        borderWidth: 1,
                        borderColor: tint.border,
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontFamily: 'Freesentation_6SemiBold',
                          fontSize: 11,
                          color: tint.text,
                        }}
                      >
                        {`#${t(`community.trending.keywords.${kw.id}`)}`}
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontFamily: 'Freesentation_4Regular',
                          fontSize: 10,
                          color: tint.text,
                          opacity: 0.7,
                        }}
                      >
                        {kw.count}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 순위 eyebrow */}
            <Text
              allowFontScaling={false}
              style={{
                paddingTop: 14,
                paddingHorizontal: 20,
                paddingBottom: 4,
                fontFamily: 'Freesentation_6SemiBold',
                fontSize: 10,
                color: light.border.active,
                letterSpacing: 1.8, // 0.18em @ 10px
                textTransform: 'uppercase',
              }}
            >
              {t('community.trending.rankLabel')}
            </Text>

            {/* Ranked list */}
            <View style={{paddingHorizontal: 16, flexDirection: 'column', gap: 8}}>
              {rankedPosts.map((p, i) => (
                <TrendingRankRow key={p.id} post={p} index={i} onPress={handlePostPress} />
              ))}
            </View>
          </>
        ) : null}

        {/* Bottom spacer (keyscreen line 666 verbatim) */}
        <View style={{height: 32}} />
      </ScrollView>

      {/* ── FAB (absolute outer View, 3-layer §4-11, §6-7) ── */}
      {/* §4-11 fix: position/right/bottom은 outer View에. Pressable은 opacity-only style fn. */}
      <View
        style={{position: 'absolute', right: 18, bottom: insets.bottom, zIndex: 10}}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleFabPress}
          accessibilityRole="button"
          accessibilityLabel={t('community.new.label')}
          style={({pressed}) => ({opacity: pressed ? 0.85 : 1})}
        >
          <LinearGradient
            colors={[brand.gold, brand.goldDeep]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: light.border.active,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: brand.gold,
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <PenLine size={22} strokeWidth={1.75} color={brand.cream} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// EmptyState — §10 H defensive (v0.1.0 mock 발화 X, v0.2.0 supabase 활성).
// ────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  hint: string;
}

function EmptyState({title, hint}: EmptyStateProps) {
  return (
    <View
      style={{
        paddingVertical: 48,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 18,
          lineHeight: 23.4,
          color: light.text.primary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 13,
          lineHeight: 19.5,
          color: light.text.muted,
          marginTop: 6,
          textAlign: 'center',
        }}
      >
        {hint}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Trending — tint → 토큰 매핑 (Wave A 핸드오프 규칙, 하드코딩 hex 금지).
//   gold/wine → light.border.active (라이트 point color 규칙: red→gold)
//   primary   → light.text.primary
//   neutral   → bg light.bg.deep / border light.border.default / text light.text.secondary
//   colored chip: bg withAlpha(tint, 0.1), border withAlpha(tint, 0.4), text tint
// ────────────────────────────────────────────────────────────────────────────

function trendingTintTokens(tint: TrendingKeyword['tint']): {
  bg: string;
  border: string;
  text: string;
} {
  if (tint === 'neutral') {
    return {
      bg: light.bg.deep,
      border: light.border.default,
      text: light.text.secondary,
    };
  }
  const tintColor = tint === 'primary' ? light.text.primary : light.border.active;
  return {
    bg: withAlpha(tintColor, 0.1),
    border: withAlpha(tintColor, 0.4),
    text: tintColor,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// TrendingRankRow — 순위 리스트 한 줄 (GAP-REPORT §C).
//   §4-11: outer Pressable opacity-only + inner visual View (3-layer 안전 패턴).
// ────────────────────────────────────────────────────────────────────────────

interface TrendingRankRowProps {
  post: CommPost;
  index: number;
  onPress: (postId: string) => void;
}

function TrendingRankRow({post, index, onPress}: TrendingRankRowProps) {
  const author = getCommunityUser(post.userId);
  const top = index < 3;
  const rankColor = top ? light.border.active : light.text.muted;

  const TrendIcon = index === 0 ? TrendingUp : index === 1 ? Flame : ChevronUp;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress(post.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={post.title}
      style={({pressed}) => ({opacity: pressed ? 0.85 : 1})}
    >
      <View
        style={{
          padding: 14,
          borderRadius: 12,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: light.border.default,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        {/* Rank column */}
        <View style={{width: 28, alignItems: 'center'}}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontSize: 22,
              lineHeight: 22, // 1.0
              color: rankColor,
              textAlign: 'center',
            }}
          >
            {index + 1}
          </Text>
          <View style={{marginTop: 4}}>
            <TrendIcon size={11} strokeWidth={2} color={rankColor} />
          </View>
        </View>

        {/* Body column */}
        <View style={{flex: 1, minWidth: 0}}>
          <View style={{flexDirection: 'row'}}>
            <PostTypeBadge type={post.type} />
          </View>
          <Text
            allowFontScaling={false}
            numberOfLines={2}
            style={{
              marginTop: 6,
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 13,
              lineHeight: 17,
              color: light.text.primary,
            }}
          >
            {post.title}
          </Text>
          {/* Meta row */}
          <View
            style={{
              marginTop: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {author ? (
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 10,
                  color: light.text.muted,
                }}
              >
                {author.name}
              </Text>
            ) : null}
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
              <WineIcon size={10} strokeWidth={1.75} color={light.border.active} />
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
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
              <MessageSquare size={10} strokeWidth={1.75} color={light.text.muted} />
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
          </View>
        </View>
      </View>
    </Pressable>
  );
}
