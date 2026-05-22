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
import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PenLine } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { BellButton } from '@/components/nav/bell-button';
import { LevelChip } from '@/components/shared/level-chip';
import { CommFeedCard, CommFeedRow } from '@/components/community/comm-feed-card';
import { getCommunityPosts, type CommPost, type PostType } from '@/lib/mock/community-posts';
import { useNotifications } from '@/hooks/use-notifications';
import { useProfile } from '@/hooks/use-profile';

type TabId = 'all' | 'following';
type TypeFilterId = 'all' | PostType;

const TYPE_FILTERS: TypeFilterId[] = ['all', 'note', 'question', 'column', 'news', 'album'];


export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  const { profile } = useProfile();

  const displayInitial = (profile?.anonymous_display ?? '?')[0]?.toUpperCase() ?? '?';
  const levelId = Math.max(1, Math.min(5, profile?.level ?? 1)) as 1|2|3|4|5;

  // ── Scroll-aware header (Blind 앱 패턴) ───────────────────────────────────
  const HEADER_HEIGHT = insets.top + 56;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    const THRESHOLD = 8;

    if (currentY <= 0) {
      // 최상단 — 항상 표시
      if (!headerVisible.current) {
        headerVisible.current = true;
        Animated.timing(headerTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }
    } else if (diff > THRESHOLD && headerVisible.current) {
      // 아래로 스크롤 — 숨김
      headerVisible.current = false;
      Animated.timing(headerTranslateY, { toValue: -HEADER_HEIGHT, duration: 250, useNativeDriver: true }).start();
    } else if (diff < -THRESHOLD && !headerVisible.current) {
      // 위로 스크롤 — 표시
      headerVisible.current = true;
      Animated.timing(headerTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
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

  // §10 I: Card/Row → /community/[postId] (Phase 3 생성).
  const handlePostPress = (postId: string) => {
    router.push(`/community/${postId}` as never);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      {/* ── Scroll-aware 헤더 ── */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          transform: [{ translateY: headerTranslateY }],
          backgroundColor: light.bg.deepest,
          paddingTop: insets.top + 10,
          paddingBottom: 10,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: light.border.default,
        }}
      >
        {/* 좌측: eyebrow + title */}
        <View style={{ flex: 1 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 10,
              color: light.border.active,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
            }}
          >
            {t('community.title')}
          </Text>
          <Text
            allowFontScaling={false}
            accessibilityRole="header"
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 20,
              lineHeight: 26,
              color: light.text.primary,
              marginTop: 1,
            }}
          >
            {tab === 'following' ? t('community.pageTitle') : t('community.allTitle')}
          </Text>
        </View>
        {/* 우측: Bell + LevelChip */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BellButton unreadCount={unreadCount} />
          <LevelChip levelId={levelId} initial={displayInitial} />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 156 }}
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
          {(['all', 'following'] as TabId[]).map((id) => {
            const active = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => handleTabPress(id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(`community.tabs.${id}`)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
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
                      fontSize: 13,
                      fontWeight: active ? '600' : '400',
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
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={t(labelKey)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
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
                          fontFamily: 'Freesentation_6SemiBold',
                          fontSize: 11,
                          fontWeight: '600',
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

            {/* Feed Row list */}
            <View
              style={{
                paddingTop: 6,
                paddingHorizontal: 16,
                flexDirection: 'column',
              }}
            >
              {filteredPosts.length > 0 ? (
                filteredPosts.map((p) => (
                  <CommFeedRow key={p.id} post={p} onPress={handlePostPress} />
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

        {/* Bottom spacer (keyscreen line 666 verbatim) */}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── FAB (absolute outer View, 3-layer §4-11, §6-7) ── */}
      {/* §4-11 fix: position/right/bottom은 outer View에. Pressable은 opacity-only style fn. */}
      <View
        style={{ position: 'absolute', right: 18, bottom: 12 + insets.bottom + 57 + 8, zIndex: 10 }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleFabPress}
          accessibilityRole="button"
          accessibilityLabel={t('community.new.label')}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <LinearGradient
            colors={[brand.gold, brand.goldDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: light.border.active,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: brand.gold,
              shadowOffset: { width: 0, height: 4 },
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

function EmptyState({ title, hint }: EmptyStateProps) {
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
