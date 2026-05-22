/**
 * /notifications — 알림 리스트 화면.
 *
 * 사양: _workspace/design-specs/notifications.md (Day 6 신규 화면).
 *
 * §10 결정 사항:
 *   A: mock-only v0.1.0 (src/lib/mock/notifications.ts 정적 12 entries + use-notifications.ts).
 *      v0.2.0 에서 notifications 테이블 마이그레이션 + RLS + Edge Function 일괄 도입.
 *   B: home Bell 아이콘 진입은 follow-up (본 cycle X — N과 함께 후속 wire-up).
 *   C: "모두 읽음" / "Mark all read" 단축 (헤더 우측 슬롯 좁음).
 *   D: RefreshControl 추가 (RN UX 표준).
 *   E: row tap 시 kind별 직접 deep-link (router.push, 사양 §1-3 매핑).
 *   F: notifs.length > 0 시 Mark all read 버튼 항상 표시 (keyscreen verbatim).
 *   G: useRegisterFeatures 미포팅, testID="notif.list" 만.
 *   H: badgeEarned color bar = light.text.secondary (cream invisible 회피).
 *   I: kind별 lucide icon v0.2.0 (본 cycle 미렌더 — JSX verbatim).
 *   J: /badges 라우트 부재 → /profile 우회 (badgeEarned tap 시).
 *   K: row tap 자동 mark-read = v0.2.0 (본 cycle X — keyscreen verbatim).
 *   L: swipe to delete v0.2.0.
 *   M: LightBackHeader 공통 추출 follow-up (inline 유지 — favorites/profile-me 동일 패턴).
 *   N: home Bell unread dot 표시 follow-up.
 *
 * §0-2 light-only mode:
 *   - dark className 0.
 *   - useColorScheme 호출 0.
 *   - 모든 색은 light.* 또는 brand.* 토큰 직접 inline.
 *
 * §6 deviations 적용:
 *   - #1 (Mark all read text color → light.border.active)
 *   - #2 (unread row bg = withAlpha(brand.wineRed, 0.08))
 *   - #3 (webkit clamp → numberOfLines — NotificationRow 내부)
 *   - #4 (relativeTime → src/lib/relative-time.ts)
 *   - #5 (우측 wine-red 도트 — JSX 우선)
 *   - #6 (cream bar 회피 — light.text.secondary)
 *   - #10 (wm-empty-title 글로벌 CSS → inline Playfair 18 600)
 *   - #11 (RefreshControl 추가)
 *   - #14 (Pressable className 0 — 모두 inline style)
 *   - #15 (Yoga vs CSS 음수 margin/sticky/grid/backdrop/radius.full 점검 — 통과)
 *
 * 진입 트리거 (사양 §0-1):
 *   - home AppHeader Bell (§10 B 후속 wire-up)
 *   - push notification deep-link winemine://notifications (v0.2.0 §6-16)
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Bell, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { useNotifications, type NotificationRow as NotificationRowData } from '@/hooks/use-notifications';
import { NotificationRow } from '@/components/notifications/notification-row';
import { Toast } from '@/components/shared/toast';

interface ToastState {
  message: string;
  tone: 'success';
  /** 동일 메시지 연속 토글 시 useEffect 재 trigger 위해 키. */
  key: number;
}

/**
 * kind별 라우트 매핑 (사양 §1-3 / 본 작업 명세 "kind별 라우트 매핑").
 *   drinkWindowReached → /cellar/${cellarItemId}
 *   favoritePriceDrop (= favoritePurchase) → /wine/${lwin}/prices
 *   communityPeakUpdate → /wine/${lwin}/community-peak
 *   newReview → /wine/${lwin}
 *   badgeEarned → /profile (§10 J /badges 우회)
 *   levelUp → /profile
 *   reviewLiked → /notifications (self)
 *   default → /notifications (no-op)
 *
 * 본 v0.1.0 mock 데이터의 kind 분포는 keyscreen verbatim (favoritePurchase / drinkWindowReached /
 * badgeEarned / levelUp / reviewLiked). 본 명세의 추가 kind (favoritePriceDrop /
 * communityPeakUpdate / newReview) 는 v0.2.0 데이터 추가 대비 매핑만 정의.
 */
function targetRoute(n: NotificationRowData): string {
  switch (n.kind) {
    case 'favoritePurchase':
      // 본 명세 매핑 (favoritePriceDrop) → /wine/${lwin}/prices
      return n.wineLwin ? `/wine/${n.wineLwin}/prices` : '/notifications';
    case 'drinkWindowReached':
      return n.cellarItemId ? `/cellar/${n.cellarItemId}` : '/notifications';
    case 'badgeEarned':
      // §10 J — /badges 라우트 부재로 /profile 로 우회
      return '/profile';
    case 'levelUp':
      return '/profile';
    case 'reviewLiked':
      // 본 명세 매핑 (newReview) → /wine/${lwin} ; v0.1.0 mock 에 reviewLiked 0건
      return n.wineLwin ? `/wine/${n.wineLwin}` : '/notifications';
    default:
      return '/notifications';
  }
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const locale = currentLocale();
  const { notifications, loading, error, refresh, markAllRead } =
    useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleMarkAllRead = useCallback(async () => {
    void Haptics.selectionAsync();
    await markAllRead();
    const key = Date.now();
    setToast({
      message: t('notifications.markedAllRead'),
      tone: 'success',
      key,
    });
  }, [markAllRead, t]);

  // toast auto-dismiss (favorites 동일 패턴)
  useEffect(() => {
    if (!toast) return;
    const currentKey = toast.key;
    const id = setTimeout(() => {
      setToast((prev) => (prev && prev.key === currentKey ? null : prev));
    }, 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const handleRowPress = useCallback((n: NotificationRowData) => {
    // §10 K: v0.1.0 mock 단계는 mark-read 자동 호출 X (keyscreen verbatim).
    const route = targetRoute(n);
    // expo-router router.push signature accepts string href
    router.push(route as never);
  }, []);

  // ── Loading
  if (loading && notifications.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('notifications.title')} rightSlot={null} />
        <LoadingPlaceholder />
      </View>
    );
  }

  // ── Error
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('notifications.title')} rightSlot={null} />
        <ErrorView onRetry={refresh} />
      </View>
    );
  }

  // ── Empty
  if (notifications.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('notifications.title')} rightSlot={null} />
        <EmptyView />
      </View>
    );
  }

  // ── Default (notifs.length > 0)
  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader
        title={t('notifications.title')}
        rightSlot={
          // §10 F: notifs.length > 0 시 항상 표시 (keyscreen verbatim)
          <MarkAllReadButton onPress={handleMarkAllRead} />
        }
      />
      <ScrollView
        // testID — §10 G feature flag 시스템 미포팅, testID 만
        testID="notif.list"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            // §6-11 / §10 D
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={brand.gold}
          />
        }
      >
        {notifications.map((n) => {
          const titleText = n.title[locale] ?? n.title.en;
          // accessibilityLabel — 사양 §4-3 (locale 별)
          const a11yLabel = t('notifications.row.openA11y', {
            title: titleText,
          });
          // accessibilityHint — kind별 차등 (사양 §4-3)
          const hintKey = hintKeyFor(n);
          const a11yHint = hintKey
            ? t(`notifications.row.openHint.${hintKey}`)
            : undefined;
          return (
            <NotificationRow
              key={n.id}
              notification={n}
              locale={locale}
              onPress={() => handleRowPress(n)}
              accessibilityLabel={a11yLabel}
              accessibilityHint={a11yHint}
              unreadA11y={t('notifications.row.unreadA11y')}
            />
          );
        })}
      </ScrollView>
      {toast ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 32,
          }}
        >
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </View>
  );
}

/** kind → openHint i18n suffix key. */
function hintKeyFor(n: NotificationRowData): string | null {
  switch (n.kind) {
    case 'favoritePurchase':
      return n.wineLwin ? 'wine' : 'self';
    case 'drinkWindowReached':
      return n.cellarItemId ? 'cellar' : 'self';
    case 'badgeEarned':
      // §10 J — /profile 우회 → profile hint 사용
      return 'profile';
    case 'levelUp':
      return 'profile';
    case 'reviewLiked':
      return n.wineLwin ? 'wine' : 'self';
    default:
      return 'self';
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Inline light-only BackHeader (사양 §0-2 / §3-1 / §10 M)
// favorites/profile-me/glossary-list/glossary-detail/wine-story 동일 패턴.
// rightSlot prop 으로 Mark all read 버튼 주입.
// ───────────────────────────────────────────────────────────────────────────

interface LightBackHeaderProps {
  title: string;
  rightSlot: React.ReactNode;
}

function LightBackHeader({ title, rightSlot }: LightBackHeaderProps) {
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
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      {/* Left cluster — BackButton + Title */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          flex: 1,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={12}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <ChevronLeft
            size={24}
            strokeWidth={1.75}
            color={light.text.primary}
          />
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
      {/* Right slot */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {rightSlot}
      </View>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// MarkAllReadButton (사양 §3-2 / §4-2)
// 3-layer Pressable §4-11 — outer hit + inner visual + Text.
// ───────────────────────────────────────────────────────────────────────────

interface MarkAllReadButtonProps {
  onPress: () => Promise<void> | void;
}

function MarkAllReadButton({ onPress }: MarkAllReadButtonProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => {
        void onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={t('notifications.markAllReadA11y')}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {/* inner visual — padding 6 10 (keyscreen verbatim) */}
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor: 'transparent',
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 14.4,
            // §6-1 — var(--color-gold) → light.border.active (deep gold for light bg)
            color: light.border.active,
          }}
        >
          {t('notifications.markAllRead')}
        </Text>
      </View>
    </Pressable>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Loading placeholder (사양 §2-2 — 정적 skeleton, shimmer X / §6-17)
// favorites 와 동일 패턴 — minor height 차이 (row minHeight 80)
// ───────────────────────────────────────────────────────────────────────────

function LoadingPlaceholder() {
  const { t } = useTranslation();
  const skeletonBg = 'rgba(139, 119, 102, 0.18)'; // withAlpha(light.text.muted, 0.18)
  const skeletonBgDeeper = 'rgba(139, 119, 102, 0.24)';
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('common.loading')}
      style={{ flex: 1, paddingTop: 8 }}
    >
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            marginVertical: 6,
            marginHorizontal: 16,
            minHeight: 80,
            borderRadius: 14,
            backgroundColor: skeletonBg,
            flexDirection: 'row',
            alignItems: 'stretch',
            padding: 14,
            gap: 12,
          }}
        >
          {/* color bar placeholder */}
          <View
            style={{
              width: 4,
              borderRadius: 2,
              backgroundColor: skeletonBgDeeper,
              alignSelf: 'stretch',
            }}
          />
          {/* center text col */}
          <View style={{ flex: 1, gap: 6 }}>
            <View
              style={{
                width: '60%',
                height: 13,
                borderRadius: 4,
                backgroundColor: skeletonBgDeeper,
              }}
            />
            <View
              style={{
                width: '90%',
                height: 11,
                borderRadius: 4,
                backgroundColor: skeletonBgDeeper,
              }}
            />
            <View
              style={{
                width: '70%',
                height: 11,
                borderRadius: 4,
                backgroundColor: skeletonBgDeeper,
              }}
            />
          </View>
          {/* right meta col */}
          <View style={{ width: 28, gap: 6, alignItems: 'flex-end' }}>
            <View
              style={{
                width: 20,
                height: 10,
                borderRadius: 4,
                backgroundColor: skeletonBgDeeper,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Empty view (사양 §2-3 / §3-9)
// keyscreen page.tsx line 52~57 verbatim — Bell 56 + title + description (action 없음)
// ───────────────────────────────────────────────────────────────────────────

function EmptyView() {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
          paddingHorizontal: 24,
          gap: 12,
        }}
      >
        {/* illustration — keyscreen verbatim Bell 56 strokeWidth 1.25, gold opacity 0.7 */}
        <View style={{ marginBottom: 4, opacity: 0.7 }}>
          <Bell size={56} strokeWidth={1.25} color={brand.gold} />
        </View>
        {/* title — §6-10 wm-empty-title 글로벌 CSS → inline Playfair 18 600 */}
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
          {t('notifications.empty.title')}
        </Text>
        {/* description — Inter 13 muted */}
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 13,
            lineHeight: 19.5,
            color: light.text.muted,
            textAlign: 'center',
          }}
        >
          {t('notifications.empty.description')}
        </Text>
      </View>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Error view (사양 §2-4)
// ───────────────────────────────────────────────────────────────────────────

interface ErrorViewProps {
  onRetry: () => Promise<void> | void;
}

function ErrorView({ onRetry }: ErrorViewProps) {
  const { t } = useTranslation();
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
      <AlertCircle size={32} strokeWidth={1.5} color={light.text.muted} />
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
        {t('notifications.error.title')}
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
        {t('notifications.error.body')}
      </Text>
      {/* Retry CTA — light.border.active outline + brand.cream bg (favorites 동일) */}
      <Pressable
        onPress={() => {
          void onRetry();
        }}
        accessibilityRole="button"
        accessibilityLabel={t('common.retry')}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          marginTop: 4,
        })}
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
              fontSize: 13,
              fontWeight: '600',
              color: light.border.active,
            }}
          >
            {t('common.retry')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
