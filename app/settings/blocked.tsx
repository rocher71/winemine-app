/**
 * /settings/blocked — 차단 목록 관리/해제 화면 (M3 moderation).
 *
 * 사양: _workspace/design-specs/moderation-blocked-screen.md.
 *   - 화면 셸 1차 레퍼런스: app/settings/index.tsx (BackHeader + ScrollView + 행 카드).
 *   - BlockedRow × N (anonymous_display + "차단 해제" 버튼). §4-5: id(UUID) Text 출력 금지.
 *   - 해제는 BlockConfirmSheet(mode=unblock) 재사용 → use-blocks.toggle.
 *   - light-only mode (§0-2): 모든 색 light.* / brand.* inline.
 *
 * 상태 variants: default(목록) / loading(skeleton ×4) / empty(EmptyState ShieldOff) / error(CenteredEmpty).
 * §4-11 Pressable 2-layer: 해제 버튼 = hit target + visual.
 */
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ShieldOff, AlertCircle } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { EmptyState } from '@/components/shared/empty-state';
import { Toast } from '@/components/shared/toast';
import { BlockConfirmSheet } from '@/components/moderation/block-confirm-sheet';
import { useBlocks, type BlockedUser } from '@/hooks/use-blocks';

export default function BlockedUsersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { blockedList, toggle, loading, error, refresh } = useBlocks();

  const [refreshing, setRefreshing] = useState(false);
  const [pendingUnblock, setPendingUnblock] = useState<BlockedUser | null>(null);
  const [unblocking, setUnblocking] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error'; key: number } | null>(null);

  const showToast = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    const key = Date.now();
    setToast({ message, tone, key });
    setTimeout(() => {
      setToast((prev) => (prev && prev.key === key ? null : prev));
    }, 2500);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleConfirmUnblock = useCallback(async () => {
    if (!pendingUnblock) return;
    setUnblocking(true);
    const target = pendingUnblock;
    const result = await toggle(target.id);
    setUnblocking(false);
    setPendingUnblock(null);
    if (result === 'unblocked') {
      showToast(t('moderation.block.undoSuccess', { name: target.anonymous_display }), 'success');
    } else if (result === 'error') {
      showToast(t('moderation.error'), 'error');
    }
  }, [pendingUnblock, toggle, showToast, t]);

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <Header title={t('moderation.blocked.title')} />

      {loading ? (
        <LoadingPlaceholder />
      ) : error ? (
        <CenteredError onRetry={handleRefresh} />
      ) : blockedList.length === 0 ? (
        <EmptyState
          illustration={<ShieldOff size={56} strokeWidth={1.25} color={light.text.muted} />}
          title={t('moderation.blocked.empty')}
          description={t('moderation.blocked.emptyDesc')}
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 24,
            gap: 8,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={light.border.active}
            />
          }
        >
          {blockedList.map((u) => (
            <BlockedRow
              key={u.id}
              user={u}
              disabled={unblocking && pendingUnblock?.id === u.id}
              onUnblock={() => {
                Haptics.selectionAsync().catch(() => undefined);
                setPendingUnblock(u);
              }}
            />
          ))}
        </ScrollView>
      )}

      {/* Unblock confirm */}
      <BlockConfirmSheet
        open={pendingUnblock !== null}
        mode="unblock"
        anonymousDisplay={pendingUnblock?.anonymous_display ?? ''}
        isLoading={unblocking}
        onClose={() => {
          if (!unblocking) setPendingUnblock(null);
        }}
        onConfirm={() => void handleConfirmUnblock()}
      />

      {/* Toast */}
      {!!toast && (
        <View
          style={{ position: 'absolute', bottom: insets.bottom + 24, left: 16, right: 16 }}
          pointerEvents="none"
        >
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      )}
    </View>
  );
}

// ---- BlockedRow (§4-11 2-layer 해제 버튼) ----

function BlockedRow({
  user,
  disabled,
  onUnblock,
}: {
  user: BlockedUser;
  disabled: boolean;
  onUnblock: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        {/* AvatarDot — 익명, 이니셜 없음 */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: withAlpha(brand.wineRed, 0.15),
            borderWidth: 1,
            borderColor: light.border.default,
          }}
        />
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            color: light.text.primary,
          }}
        >
          {user.anonymous_display}
        </Text>
      </View>

      <Pressable
        onPress={onUnblock}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${t('moderation.blocked.unblock')} ${user.anonymous_display}`}
        accessibilityState={{ disabled }}
        hitSlop={6}
        style={({ pressed }) => ({ opacity: disabled ? 0.5 : pressed ? 0.7 : 1 })}
      >
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: light.border.active,
            backgroundColor: brand.cream,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 13,
              color: light.border.active,
            }}
          >
            {t('moderation.blocked.unblock')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// ---- Header (light inline — settings/index BackHeader 대신 light-only 셸) ----

function Header({ title }: { title: string }) {
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
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <View
          style={{
            marginRight: 12,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={24} strokeWidth={1.75} color={light.text.primary} />
        </View>
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

// ---- LoadingPlaceholder (skeleton ×4, 정적) ----

function LoadingPlaceholder() {
  const { t } = useTranslation();
  return (
    <View
      style={{ paddingHorizontal: 16, paddingTop: 16, gap: 8 }}
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('common.loading')}
    >
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            height: 56,
            borderRadius: 12,
            backgroundColor: 'rgba(139, 119, 102, 0.18)',
          }}
        />
      ))}
    </View>
  );
}

// ---- CenteredError ----

function CenteredError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 12 }}>
      <AlertCircle size={32} strokeWidth={1.5} color={light.text.muted} />
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 14,
          color: light.text.muted,
          textAlign: 'center',
        }}
      >
        {t('moderation.blocked.error')}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('common.retry')}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: light.border.active,
            backgroundColor: brand.cream,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 13,
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
