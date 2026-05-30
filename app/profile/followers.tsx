/**
 * /profile/followers — 내 팔로워/팔로잉 리스트 화면.
 *
 * 사양: _workspace/design-specs/follow-list.md.
 * **검색창 완전 제외** (사용자 요청 — handoff line 624~632 무시).
 *
 * 구조:
 *   LightBackHeader (title = 내 anonymous_display)
 *   SegmentedTabs (팔로워 {count} / 팔로잉 {count})
 *   FlatList (UserListItem, ItemSeparator height 8)
 *
 * §10 E 탭 전환 시 router.setParams 동기화 (딥링크·뒤로가기 일관성).
 * §10 F UserListItem 행 탭 → 본인이면 /profile redirect.
 * §10 H optimistic follow/unfollow.
 *
 * §4-5 anonymization: keyExtractor userId 는 내부 key — Text 출력 X.
 * §0-2 light-only.
 */
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  ChevronLeft,
  UserX,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, light, shadows } from '@/lib/design-tokens';
import { DEMO_MODE } from '@/lib/demo-mode';
import { getCurrentUserId } from '@/lib/auth';
import { useProfile } from '@/hooks/use-profile';
import { useFollowers, type FollowTab, type FollowUser } from '@/hooks/use-followers';
import { useFollowCounts } from '@/hooks/use-follow-counts';
import { UserListItem } from '@/components/profile/user-list-item';
import { supabase } from '@/lib/supabase';

export default function FollowersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: FollowTab }>();
  const initialTab: FollowTab = params.tab === 'following' ? 'following' : 'followers';

  const [activeTab, setActiveTab] = useState<FollowTab>(initialTab);

  const { profile } = useProfile();
  const { followerCount, followingCount } = useFollowCounts();
  const {
    users,
    loading,
    error,
    refresh,
  } = useFollowers(undefined, activeTab);

  // optimistic follow 상태 — userId별 override (mock/local).
  const [followOverrides, setFollowOverrides] = useState<
    Record<string, boolean>
  >({});
  const [refreshing, setRefreshing] = useState(false);

  const handleTabChange = useCallback(
    (tab: FollowTab) => {
      Haptics.selectionAsync().catch(() => undefined);
      setActiveTab(tab);
      router.setParams({ tab });
    },
    [],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handlePressProfile = useCallback((userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    void (async () => {
      if (!DEMO_MODE) {
        const myUid = await getCurrentUserId();
        if (myUid && myUid === userId) {
          router.replace('/profile');
          return;
        }
      }
      router.push(`/profile/${userId}`);
    })();
  }, []);

  const handleToggleFollow = useCallback(
    (item: FollowUser, currentlyFollowing: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
        () => undefined,
      );
      const next = !currentlyFollowing;
      setFollowOverrides((prev) => ({ ...prev, [item.userId]: next }));
      if (DEMO_MODE) return;
      void (async () => {
        try {
          const myUid = await getCurrentUserId();
          if (!myUid) throw new Error('not authenticated');
          if (next) {
            const { error: err } = await supabase
              .from('follows')
              .insert({ follower_id: myUid, following_id: item.userId });
            if (err) throw err;
          } else {
            const { error: err } = await supabase
              .from('follows')
              .delete()
              .eq('follower_id', myUid)
              .eq('following_id', item.userId);
            if (err) throw err;
          }
        } catch {
          // 롤백
          setFollowOverrides((prev) => ({
            ...prev,
            [item.userId]: currentlyFollowing,
          }));
        }
      })();
    },
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: FollowUser }) => {
      const isFollowing = followOverrides[item.userId] ?? item.isFollowing;
      return (
        <UserListItem
          userId={item.userId}
          anonymousDisplay={item.anonymousDisplay}
          handle={item.handle}
          levelId={item.levelId}
          bio={item.bio}
          isMutual={item.isMutual}
          isFollowing={isFollowing}
          onPressProfile={() => handlePressProfile(item.userId)}
          onPressFollow={() => handleToggleFollow(item, isFollowing)}
          onPressUnfollow={() => handleToggleFollow(item, isFollowing)}
        />
      );
    },
    [followOverrides, handlePressProfile, handleToggleFollow],
  );

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      {/* LightBackHeader — title = 내 anonymous_display */}
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
          {profile?.anonymous_display ?? ''}
        </Text>
      </View>

      {/* SegmentedTabs */}
      <View
        style={{
          marginTop: 12,
          marginHorizontal: 16,
          padding: 4,
          borderRadius: 12,
          backgroundColor: light.bg.sunken,
          flexDirection: 'row',
          gap: 4,
        }}
      >
        <SegmentedTab
          label={t('followList.tabs.followers')}
          count={followerCount}
          active={activeTab === 'followers'}
          onPress={() => handleTabChange('followers')}
        />
        <SegmentedTab
          label={t('followList.tabs.following')}
          count={followingCount}
          active={activeTab === 'following'}
          onPress={() => handleTabChange('following')}
        />
      </View>

      {/* List / states */}
      {error ? (
        <CenteredEmpty
          icon={<AlertCircle size={32} strokeWidth={1.5} color={light.text.muted} />}
          title={t('followList.error.title')}
          desc={error.message}
          ctaLabel={t('common.retry')}
          onCta={() => {
            void handleRefresh();
          }}
        />
      ) : loading ? (
        <LoadingPlaceholder />
      ) : !profile && !DEMO_MODE ? (
        <CenteredEmpty
          icon={<UserX size={56} strokeWidth={1.25} color={light.text.muted} />}
          title={t('profile.unauth.title')}
          desc={t('profile.unauth.desc')}
          ctaLabel={t('profile.unauth.cta')}
          onCta={() => router.push('/onboarding/1-welcome')}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 30,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={light.border.active}
            />
          }
          ListEmptyComponent={
            <View style={{ paddingVertical: 48, alignItems: 'center', paddingHorizontal: 24 }}>
              <View style={{ opacity: 0.7, marginBottom: 12 }}>
                <Users size={48} strokeWidth={1.25} color={light.text.muted} />
              </View>
              <Text
                accessibilityRole="header"
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontWeight: '600',
                  fontSize: 16,
                  lineHeight: 20.8,
                  color: light.text.primary,
                  textAlign: 'center',
                }}
              >
                {activeTab === 'followers'
                  ? t('followList.empty.followers.title')
                  : t('followList.empty.following.title')}
              </Text>
              <Text
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 13,
                  lineHeight: 19.5,
                  color: light.text.muted,
                  textAlign: 'center',
                  marginTop: 6,
                }}
              >
                {t('followList.empty.desc')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ---- SegmentedTab (§1a — 3-layer flex outer) ----

interface SegmentedTabProps {
  label: string;
  count: number | undefined;
  active: boolean;
  onPress: () => void;
}

function SegmentedTab({ label, count, active, onPress }: SegmentedTabProps) {
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <View
          style={{
            paddingVertical: 8,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            backgroundColor: active ? light.bg.surface : 'transparent',
            ...(active ? shadows.sm : null),
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: active ? '600' : '500',
              fontSize: 12,
              lineHeight: 14.4,
              letterSpacing: 0.24,
              color: active ? light.text.primary : light.text.muted,
            }}
          >
            {label}
          </Text>
          {count != null ? (
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 14.4,
                color: active ? brand.gold : light.text.muted,
                marginLeft: 4,
              }}
            >
              {count}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

// ---- LoadingPlaceholder (§2-2) ----

function LoadingPlaceholder() {
  const { t } = useTranslation();
  const skeletonBg = 'rgba(139, 119, 102, 0.18)';
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('common.loading')}
      style={{ paddingHorizontal: 16, paddingTop: 12 }}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            height: 92,
            borderRadius: 12,
            backgroundColor: skeletonBg,
            marginBottom: 8,
          }}
        />
      ))}
    </View>
  );
}

// ---- CenteredEmpty (error / unauthenticated) ----

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
