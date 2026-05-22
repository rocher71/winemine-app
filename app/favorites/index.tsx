/**
 * /favorites — 즐겨찾기 와인 리스트 화면.
 *
 * 사양: _workspace/design-specs/favorites.md (Day 6 신규 화면).
 *
 * §10 결정 사항:
 *   A: mock-only v0.1.0 (src/lib/mock/favorites.ts + src/hooks/use-favorites.ts).
 *      v0.2.0 에서 wine_favorites 테이블 마이그레이션 + supabase 교체 (인터페이스 호환).
 *   B: EmptyState action CTA 없음 (keyscreen verbatim).
 *   C: notify 라벨은 짧은 "알림" / "Notify".
 *   D: empty title은 Playfair 18 600 (typography 추정값, follow-up 토큰 alias 후 정렬).
 *   E: 푸시 deep-link 본 cycle 범위 X (v0.2.0 push notification 시점).
 *   F: light.border.active gold 그대로 (다른 light-only 사양과 일관, light.gold alias는 follow-up).
 *   G: Toast tone = success (positive feedback — wine-prices §4-7 동일 정책).
 *   H: RefreshControl 추가 (RN 표준 pull-to-refresh — keyscreen 부재이지만 RN list 화면 표준).
 *   I: 미인증 EmptyState 동일 메시지 (v0.1.0 mock 단계 가드 불필요).
 *   J: swipe to delete = v0.2.0 (본 cycle X).
 *
 * §0-2 light-only mode:
 *   - dark: className 0.
 *   - useColorScheme 호출 0.
 *   - 모든 색은 light.* 또는 brand.* 토큰 직접 inline.
 *   - BackHeader 공통 컴포넌트는 dark/light 자동 분기 → 본 화면은 wine-story 동일 inline light-only header.
 *
 * RN deviation (§6):
 *   - #1 (3.5-layer Pressable for flex 분포 — FavoriteRow)
 *   - #2 (CSS linear-gradient → expo-linear-gradient — FavoriteRow)
 *   - #7 (gold → light.border.active — NotifySwitch)
 *   - #8 (CSS transition → Animated.timing translateX — NotifySwitch)
 *   - #10 (wm-empty-title 글로벌 CSS class → inline style)
 *   - #11/#12 (음수 margin/sticky/grid/backdrop/radius.full 점검 — 통과)
 *   - #14 (loading skeleton 정적 — shimmer X)
 *   - #15 (swipe to delete 미구현 §10 J)
 *
 * 진입 트리거: 별도 — `app/(tabs)/` 또는 settings 등에서 router.push('/favorites').
 *   본 작업 범위는 화면 자체만; 진입 wire-up 은 follow-up.
 */
import { useState } from 'react';
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
import { AlertCircle, ChevronLeft, Star } from 'lucide-react-native';
import { brand, light } from '@/lib/design-tokens';
import { useFavorites } from '@/hooks/use-favorites';
import { FavoriteRow } from '@/components/favorites/favorite-row';
import { Toast } from '@/components/shared/toast';

interface ToastState {
  message: string;
  // §10 G: success tone 채택 (positive feedback).
  tone: 'success';
  /** 동일 메시지 연속 토글 시 useEffect 재 trigger 위해 키. */
  key: number;
}

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const { favorites, loading, error, refresh, toggleNotify } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleNotify = async (id: string, next: boolean) => {
    await toggleNotify(id, next);
    const key = Date.now();
    setToast({
      message: next ? t('favorites.notifyOn') : t('favorites.notifyOff'),
      tone: 'success',
      key,
    });
    // simple auto-dismiss — Toast 컴포넌트 자체는 dismiss 로직 없음. 2.5s 후 unmount.
    // 새 토스트가 그 사이 추가되었으면 (key 변경) 기존 timer 는 no-op.
    setTimeout(() => {
      setToast((prev) => (prev && prev.key === key ? null : prev));
    }, 2500);
  };

  // Loading
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('favorites.title')} />
        <LoadingPlaceholder />
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('favorites.title')} />
        <ErrorView onRetry={refresh} />
      </View>
    );
  }

  // Empty
  if (favorites.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('favorites.title')} />
        <EmptyView />
      </View>
    );
  }

  // Default
  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={t('favorites.title')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={light.border.active}
          />
        }
      >
        {favorites.map((fav) => (
          <FavoriteRow
            key={fav.id}
            favorite={fav}
            onPress={() => router.push(`/wine/${fav.wineLwin}`)}
            onToggleNotify={(next) => {
              void handleToggleNotify(fav.id, next);
            }}
          />
        ))}
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

// ---- Inline light-only BackHeader (사양 §0-2, wine-story.tsx 동일 패턴) ----

interface LightBackHeaderProps {
  title: string;
}

function LightBackHeader({ title }: LightBackHeaderProps) {
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

// ---- Loading placeholder (§2-2 — 정적 skeleton, shimmer X / §6-14) ----

function LoadingPlaceholder() {
  const { t } = useTranslation();
  // withAlpha(light.text.muted, 0.18) — design-tokens 헬퍼 사용 가능하지만 inline rgba 더 명시적
  const skeletonBg = 'rgba(139, 119, 102, 0.18)';
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('common.loading')}
      style={{ flex: 1, paddingTop: 8 }}
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            marginVertical: 8,
            marginHorizontal: 16,
            height: 84,
            borderRadius: 14,
            backgroundColor: skeletonBg,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 60,
              borderRadius: 6,
              backgroundColor: 'rgba(139, 119, 102, 0.24)',
            }}
          />
          <View style={{ flex: 1, gap: 6 }}>
            <View
              style={{
                width: '70%',
                height: 14,
                borderRadius: 4,
                backgroundColor: 'rgba(139, 119, 102, 0.24)',
              }}
            />
            <View
              style={{
                width: '45%',
                height: 11,
                borderRadius: 4,
                backgroundColor: 'rgba(139, 119, 102, 0.24)',
              }}
            />
            <View
              style={{
                width: '40%',
                height: 12,
                borderRadius: 4,
                backgroundColor: 'rgba(139, 119, 102, 0.24)',
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ---- Empty view (§2-3) ----

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
        {/* illustration — keyscreen verbatim Star 56 strokeWidth 1.25 gold opacity 0.7 */}
        <View style={{ marginBottom: 4, opacity: 0.7 }}>
          <Star size={56} strokeWidth={1.25} color={brand.gold} />
        </View>
        {/* title — §6-10 wm-empty-title 글로벌 CSS → inline (Playfair 18 600) */}
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
          {t('favorites.empty.title')}
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
          {t('favorites.empty.description')}
        </Text>
      </View>
    </View>
  );
}

// ---- Error view (§2-4) ----

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
        {t('favorites.error.title')}
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
        {t('favorites.error.body')}
      </Text>
      {/* Retry CTA — light.border.active outline (§2-4) */}
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
