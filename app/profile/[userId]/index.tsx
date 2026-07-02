/**
 * /profile/[userId] — 남의 프로필 화면.
 *
 * 사양: _workspace/design-specs/profile-other.md.
 *
 * 구조:
 *   LightBackHeader (title="" + trailing MoreHorizontal)
 *   ScrollView
 *     OtherUserHero (gold avatar + DisplayName + handle·가입일 + LevelPill + FollowButton + FollowCountRow)
 *     SlimStatRow (3-stat: 와인 / 국가 / 노트)
 *     TasteCompatibility (donut + desc) — §10 C DEMO_MODE mock / v0.1.0 RLS 차단
 *     SortTabs (최근 시음 / 높은 평점)
 *     WineList (WineRowCompact ≤3) — §2-3 빈 상태 fallback (RLS 차단)
 *
 * §10 I 본인 프로필 진입 → /profile redirect.
 * §2-4 notFound: profile null → UserX EmptyState.
 * §10 G moreH 메뉴 v0.2.0 → Toast.
 * §5-2/§5-3/§5-4 RLS 주의: 다른 유저 stats/notes/compatibility 는 v0.1.0 비정규화 컬럼 또는 빈 상태.
 *
 * §4-5 anonymization: userId param / profile.id 어디서도 Text 자식 출력 X.
 * §0-2 light-only.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ChevronLeft, MoreHorizontal, UserX } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';
import { DEMO_MODE } from '@/lib/demo-mode';
import { getCurrentUserId } from '@/lib/auth';
import { useOtherUserProfile } from '@/hooks/use-other-user-profile';
import { useFollowStatus } from '@/hooks/use-follow-status';
import { OtherUserHero } from '@/components/profile/other-user-hero';
import { SlimStatRow } from '@/components/profile/slim-stat-row';
import { TasteCompatibility } from '@/components/profile/taste-compatibility';
import { WineRowCompact } from '@/components/profile/wine-row-compact';
import { Toast } from '@/components/shared/toast';
import { useBlocks } from '@/hooks/use-blocks';
import {
  ContentActionMenu,
  type MenuAction,
} from '@/components/moderation/content-action-menu';
import { ReportSheet } from '@/components/moderation/report-sheet';
import { BlockConfirmSheet } from '@/components/moderation/block-confirm-sheet';

type Level = 1 | 2 | 3 | 4 | 5;
type SortBy = 'recent' | 'rating';

function clampLevel(value: number): Level {
  if (value <= 1) return 1;
  if (value >= 5) return 5;
  return value as Level;
}

interface MockWine {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  bottle_color: string | null;
  type_canonical: string | null;
  vintage: number | null;
  producer_name: string | null;
  rating: number;
  tastedAt: number;
}

// DEMO_MODE 다른 유저 와인 리스트 (디자인 리뷰 스크린샷용 — v0.1.0 RLS 차단 대체).
const MOCK_OTHER_WINES: MockWine[] = [
  { lwin: '1012345', display_name: 'Domaine Leflaive Puligny-Montrachet', name_ko: '도멘 르플레브 퓔리니몽라셰', bottle_color: '#d9c277', type_canonical: 'white', vintage: 2018, producer_name: 'Domaine Leflaive', rating: 5, tastedAt: 3 },
  { lwin: '1023456', display_name: 'Gaja Barbaresco', name_ko: '가야 바르바레스코', bottle_color: '#5b1424', type_canonical: 'red', vintage: 2016, producer_name: 'Gaja', rating: 4, tastedAt: 2 },
  { lwin: '1034567', display_name: 'Krug Grande Cuvee', name_ko: null, bottle_color: '#caa84e', type_canonical: 'sparkling', vintage: null, producer_name: 'Krug', rating: 5, tastedAt: 1 },
];

export default function OtherUserProfileScreen() {
  const { t } = useTranslation();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; key: number } | null>(
    null,
  );

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refresh: refreshProfile,
  } = useOtherUserProfile(userId);
  const {
    isFollowing,
    pending: followPending,
    toggle: toggleFollow,
    refresh: refreshFollow,
  } = useFollowStatus(userId);

  // moderation (M3) — 타인 프로필 신고 + 차단/해제.
  const { isBlocked, toggle: toggleBlock } = useBlocks();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const blocked = userId ? isBlocked(userId) : false;

  // §10 I 본인 프로필 redirect
  useEffect(() => {
    let cancelled = false;
    if (DEMO_MODE) return;
    void (async () => {
      const myUid = await getCurrentUserId();
      if (!cancelled && myUid && userId && myUid === userId) {
        router.replace('/profile');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const showToast = useCallback((message: string) => {
    const key = Date.now();
    setToast({ message, key });
    setTimeout(() => {
      setToast((prev) => (prev && prev.key === key ? null : prev));
    }, 2500);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refreshFollow()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile, refreshFollow]);

  const handleToggleFollow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    void toggleFollow();
  }, [toggleFollow]);

  const handleMore = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const menuActions: MenuAction[] = useMemo(
    () => [
      { kind: 'report', onPress: () => setReportOpen(true) },
      { kind: blocked ? 'unblock' : 'block', onPress: () => setBlockOpen(true) },
    ],
    [blocked],
  );

  const handleConfirmBlock = useCallback(async () => {
    if (!userId) return;
    setBlocking(true);
    const result = await toggleBlock(userId);
    setBlocking(false);
    setBlockOpen(false);
    if (result === 'blocked') {
      // 차단 직후 프로필 콘텐츠는 RLS 로 사라짐 → 피드/목록으로 복귀 (entry-points 사양 §1-5).
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      router.back();
    } else if (result === 'unblocked') {
      showToast(t('moderation.block.undoSuccess', { name: profile?.anonymous_display ?? '' }));
    } else {
      showToast(t('moderation.error'));
    }
  }, [userId, toggleBlock, showToast, t, profile?.anonymous_display]);

  const handleSortRecent = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    setSortBy('recent');
  }, []);
  const handleSortRating = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    setSortBy('rating');
  }, []);

  // 와인 리스트 — v0.1.0 RLS 차단 → DEMO_MODE mock 또는 빈 배열.
  const wines = useMemo(() => {
    const base = DEMO_MODE ? [...MOCK_OTHER_WINES] : [];
    if (sortBy === 'rating') {
      base.sort((a, b) => b.rating - a.rating);
    } else {
      base.sort((a, b) => b.tastedAt - a.tastedAt);
    }
    return base.slice(0, 3);
  }, [sortBy]);

  // §2-2 loading
  if (profileLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <Header onPressMore={handleMore} />
        <LoadingPlaceholder />
      </View>
    );
  }

  // §2-5 error
  if (profileError) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <Header onPressMore={handleMore} />
        <CenteredEmpty
          icon={<AlertCircle size={32} strokeWidth={1.5} color={light.text.muted} />}
          title={t('profile.other.error.title')}
          desc={profileError.message}
          ctaLabel={t('common.retry')}
          onCta={() => {
            void handleRefresh();
          }}
        />
      </View>
    );
  }

  // §2-4 notFound
  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <Header onPressMore={handleMore} />
        <CenteredEmpty
          icon={<UserX size={56} strokeWidth={1.25} color={light.text.muted} />}
          title={t('profile.other.notFoundScreen.title')}
          desc={t('profile.other.notFoundScreen.desc')}
          ctaLabel={t('common.back')}
          onCta={() => router.back()}
        />
      </View>
    );
  }

  // §2-1 default
  const compatibility = DEMO_MODE
    ? {
        score: 78,
        description: t('profile.other.compatibilitySummary', {
          topRegion: t('profile.other.stat.wines'),
        }),
        sharedWinesCount: 12,
        sharedRegionsCount: 5,
      }
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <Header onPressMore={handleMore} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={light.border.active}
          />
        }
      >
        <OtherUserHero
          anonymousDisplay={profile.anonymous_display ?? ''}
          handle={profile.handle}
          joinedAt={profile.created_at}
          levelId={clampLevel(profile.level ?? 1)}
          isFollowing={isFollowing}
          followerCount={profile.follower_count ?? 0}
          followingCount={profile.following_count ?? 0}
          onPressFollow={handleToggleFollow}
          onPressUnfollow={handleToggleFollow}
          followPending={followPending}
        />

        <SlimStatRow
          winesCount={profile.public_wines_count ?? 0}
          countriesCount={profile.public_countries_count ?? 0}
          notesCount={profile.public_notes_count ?? 0}
        />

        {compatibility ? (
          <TasteCompatibility
            score={compatibility.score}
            description={compatibility.description}
            sharedWinesCount={compatibility.sharedWinesCount}
            sharedRegionsCount={compatibility.sharedRegionsCount}
          />
        ) : null}

        {/* SortTabs */}
        <View
          style={{
            flexDirection: 'row',
            gap: 14,
            paddingHorizontal: 20,
            paddingTop: 18,
          }}
        >
          <SortTab
            label={t('profile.other.sortRecent')}
            active={sortBy === 'recent'}
            onPress={handleSortRecent}
          />
          <SortTab
            label={t('profile.other.sortRating')}
            active={sortBy === 'rating'}
            onPress={handleSortRating}
          />
        </View>

        {/* WineList */}
        {wines.length > 0 ? (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {wines.map((w) => (
              <WineRowCompact
                key={w.lwin}
                lwin={w.lwin}
                display_name={w.display_name}
                name_ko={w.name_ko}
                bottle_color={w.bottle_color}
                type_canonical={w.type_canonical}
                vintage={w.vintage}
                producer_name={w.producer_name}
                rating={w.rating}
                onPress={() => router.push(`/wine/${w.lwin}`)}
              />
            ))}
          </View>
        ) : (
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              lineHeight: 18,
              color: light.text.muted,
              textAlign: 'center',
              paddingVertical: 24,
              paddingHorizontal: 24,
            }}
          >
            {t('profile.other.empty.wines')}
          </Text>
        )}
      </ScrollView>

      {toast ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 16, right: 16, bottom: 32 }}
        >
          <Toast message={toast.message} tone="info" />
        </View>
      ) : null}

      {/* moderation (M3) — 프로필 신고 + 차단/해제 */}
      <ContentActionMenu
        open={menuOpen}
        actions={menuActions}
        onClose={() => setMenuOpen(false)}
      />
      <ReportSheet
        open={reportOpen}
        targetType="profile"
        targetId={userId ?? ''}
        onClose={() => setReportOpen(false)}
        onSubmitted={() => showToast(t('moderation.report.success'))}
      />
      <BlockConfirmSheet
        open={blockOpen}
        mode={blocked ? 'unblock' : 'block'}
        anonymousDisplay={profile.anonymous_display ?? ''}
        isLoading={blocking}
        onClose={() => {
          if (!blocking) setBlockOpen(false);
        }}
        onConfirm={() => void handleConfirmBlock()}
      />
    </View>
  );
}

// ---- Header (title="" + trailing MoreHorizontal — §3-1) ----

function Header({ onPressMore }: { onPressMore: () => void }) {
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
      {/* empty title spacer */}
      <View style={{ flex: 1 }} />
      <Pressable
        onPress={onPressMore}
        accessibilityRole="button"
        accessibilityLabel={t('profile.a11y.more')}
        hitSlop={8}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <MoreHorizontal size={18} color={light.text.secondary} />
      </Pressable>
    </View>
  );
}

// ---- SortTab (§1b) ----

interface SortTabProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function SortTab({ label, active, onPress }: SortTabProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          paddingBottom: 6,
          borderBottomWidth: 1.5,
          borderBottomColor: active ? brand.gold : 'transparent',
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontWeight: active ? '600' : '400',
            fontSize: 12,
            lineHeight: 14.4,
            color: active ? light.text.primary : light.text.muted,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ---- LoadingPlaceholder (§2-2 정적 skeleton) ----

function LoadingPlaceholder() {
  const { t } = useTranslation();
  const skeletonBg = 'rgba(139, 119, 102, 0.18)';
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('common.loading')}
      style={{ flex: 1 }}
    >
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 8,
          height: 200,
          borderRadius: 18,
          backgroundColor: skeletonBg,
        }}
      />
      <View
        style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 14 }}
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{ flex: 1, height: 56, borderRadius: 10, backgroundColor: skeletonBg }}
          />
        ))}
      </View>
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 6,
          height: 88,
          borderRadius: 14,
          backgroundColor: skeletonBg,
        }}
      />
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 18,
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{ height: 94, borderRadius: 12, backgroundColor: skeletonBg }}
          />
        ))}
      </View>
    </View>
  );
}

// ---- CenteredEmpty (notFound / error 공통) ----

interface CenteredEmptyProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  ctaLabel: string;
  onCta: () => void;
}

function CenteredEmpty({ icon, title, desc, ctaLabel, onCta }: CenteredEmptyProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
      }}
    >
      <View style={{ opacity: 0.7 }}>{icon}</View>
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontWeight: '600',
          fontSize: 18,
          lineHeight: 23.4,
          color: light.text.primary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 13,
          lineHeight: 19.5,
          color: light.text.muted,
          textAlign: 'center',
        }}
      >
        {desc}
      </Text>
      <Pressable
        onPress={onCta}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginTop: 4 })}
      >
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: light.border.active,
            backgroundColor: brand.cream,
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 13,
              color: light.border.active,
            }}
          >
            {ctaLabel}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
