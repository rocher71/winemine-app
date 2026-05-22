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
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Moon, ChevronRight, PenLine } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { BellButton } from '@/components/nav/bell-button';
import { CommFeedCard, CommFeedRow } from '@/components/community/comm-feed-card';
import { getCommunityPosts, type CommPost, type PostType } from '@/lib/mock/community-posts';
import { useNotifications } from '@/hooks/use-notifications';

type TabId = 'following' | 'all';
type TypeFilterId = 'all' | PostType;

const TYPE_FILTERS: TypeFilterId[] = ['all', 'note', 'question', 'column', 'news', 'album'];

// §10 D: Tonight count v0.1.0 hardcoded (keyscreen mock). v0.2.0 supabase aggregator.
const TONIGHT_COUNT = 14;

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();

  const [tab, setTab] = useState<TabId>('following');
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

  // §10 B: Tonight banner → /community/tonight (Phase 5 생성).
  const handleTonightPress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push('/community/tonight' as never);
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
      {/* AppHeader inline — keyscreen 의 AppHeader 는 title 비어있고 Bell 우측만.
       *   기존 src/components/nav/app-header.tsx 의 title prop 은 비워두면 빈 Text 자리만 남으므로
       *   본 화면은 inline header 로 Bell 만 우측 배치 (§6-1).
       */}
      <View
        style={{
          paddingTop: insets.top,
          height: insets.top + 56,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          backgroundColor: light.bg.deepest,
        }}
      >
        <BellButton unreadCount={unreadCount} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 156 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Title row (§1, keyscreen line 79~134 verbatim — Search btn 제거 §10 C) ── */}
        <View
          style={{
            paddingTop: 14,
            paddingHorizontal: 20,
            paddingBottom: 8,
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <View>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 10,
                fontWeight: '600',
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
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: 22,
                lineHeight: 28.6,
                color: light.text.primary,
                marginTop: 2,
              }}
            >
              {tab === 'following' ? t('community.pageTitle') : t('community.allTitle')}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          {/* §10 C: Search button 제거 — v0.1.0 미바인딩 */}
        </View>

        {/* ── Tab bar (2탭, §6-9 plain View; §6-10 hairline overlap) ── */}
        <View
          accessibilityRole="tablist"
          style={{
            paddingTop: 6,
            paddingHorizontal: 20,
            flexDirection: 'row',
            gap: 22,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: light.border.default,
          }}
        >
          {(['following', 'all'] as TabId[]).map((id) => {
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
                    paddingBottom: 10,
                    marginBottom: -1, // hairline overlap (§6-10, 유형 B 허용)
                    borderBottomWidth: 2,
                    borderBottomColor: active ? light.border.active : 'transparent',
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={{
                      fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
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
        {tab === 'following' ? (
          <>
            {/* Tonight banner (3-layer §4-11) */}
            <Pressable
              onPress={handleTonightPress}
              accessibilityRole="link"
              accessibilityLabel={t('community.tonight.label', { count: TONIGHT_COUNT })}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <LinearGradient
                colors={[withAlpha(brand.wineRed, 0.33), light.bg.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  marginTop: 12,
                  marginHorizontal: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: withAlpha(brand.gold, 0.33),
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {/* Moon wrap (§6-5 size/2 = 18) */}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: light.bg.deep,
                    borderWidth: 1,
                    borderColor: light.border.active,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Moon size={18} strokeWidth={1.75} color={light.border.active} />
                </View>

                {/* Text block */}
                <View style={{ flex: 1 }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 12,
                      fontWeight: '600',
                      color: light.text.primary,
                    }}
                  >
                    {t('community.tonight.count', { count: TONIGHT_COUNT })}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 10,
                      color: light.text.muted,
                      marginTop: 2,
                    }}
                  >
                    {t('community.tonight.places')}
                  </Text>
                </View>

                <ChevronRight size={16} strokeWidth={1.75} color={light.border.active} />
              </LinearGradient>
            </Pressable>

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
                          fontFamily: 'Inter_600SemiBold',
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

      {/* ── FAB (absolute, 3-layer §4-11, §6-7) ── */}
      <Pressable
        onPress={handleFabPress}
        accessibilityRole="button"
        accessibilityLabel={t('community.new.label')}
        style={({ pressed }) => ({
          position: 'absolute',
          right: 18,
          bottom: 100,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <LinearGradient
          colors={[brand.gold, brand.goldDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28, // §6-5 size/2 명시
            borderWidth: 1,
            borderColor: light.border.active,
            alignItems: 'center',
            justifyContent: 'center',
            // §6-7 4속성 inline + elevation. §10 F: brand.gold shadow (gradient 일관).
            shadowColor: brand.gold,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* §10 G: PenLine cream verbatim (gradient 위 wine bar 분위기). */}
          <PenLine size={22} strokeWidth={1.75} color={brand.cream} />
        </LinearGradient>
      </Pressable>
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
          fontFamily: 'PlayfairDisplay_400Regular',
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
          fontFamily: 'Inter_400Regular',
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
