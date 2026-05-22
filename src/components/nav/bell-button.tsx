/**
 * BellButton — AppHeader right-slot 알림 진입 버튼.
 *
 * 사양: _workspace/design-specs/community.md §1, §6-1, §6-11, §10 K.
 *
 * - 36×36 hit target (Pressable, 2-layer §4-11 안전 패턴)
 * - inner View borderRadius 8, transparent, items/justify center
 * - lucide Bell size 18 strokeWidth 1.75 color={light.text.secondary}
 * - unreadCount > 0 시 absolute child View 8×8 borderRadius 4, bg brand.wineRed
 * - onPress → router.push('/notifications')
 *
 * **light-only mode** (§0-2): light 토큰 단독. dark variant 생략.
 *
 * Pressable 패턴 (CLAUDE.md §4-11):
 *   - outer Pressable: hit + opacity press feedback
 *   - inner View: size/border/layout (cssInterop wrapping 회피)
 *   - 자식: Bell icon + 조건부 dot
 */
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Bell } from 'lucide-react-native';
import { brand, light } from '@/lib/design-tokens';

interface BellButtonProps {
  unreadCount: number;
}

export function BellButton({ unreadCount }: BellButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const hasUnread = unreadCount > 0;

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        router.push('/notifications');
      }}
      accessibilityRole="button"
      accessibilityLabel={
        hasUnread
          ? t('community.bell.labelWithCount', { count: unreadCount })
          : t('community.bell.label')
      }
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      hitSlop={4}
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
        <Bell size={18} strokeWidth={1.75} color={light.text.secondary} />
        {hasUnread ? (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: brand.wineRed,
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
