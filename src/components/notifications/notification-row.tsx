/**
 * NotificationRow — notifications 리스트 각 행.
 *
 * 사양: _workspace/design-specs/notifications.md §1 / §3-5 / §3-6 / §3-7 / §3-8.
 * 진실 소스: keyscreen src/components/notifications/notification-row.tsx line 47~139 verbatim.
 *
 * 구조 (3.5-layer Pressable §4-11 / 사양 §3-5):
 *   row outer wrapper View (marginVertical 6, marginHorizontal 16)         ← flex 분포·margin
 *   ├── middle Pressable (hit only, opacity press feedback)                 ← hit target
 *         └── inner Row visual View (flexDirection row, alignItems stretch,
 *             gap 12, padding 14, borderRadius 14, bg conditional,
 *             borderWidth 1, minHeight 80)
 *               ├── Color bar 4×stretch (kind-specific tone)
 *               ├── Center text col (flex 1) — title Inter 13 600 + body Inter 12 muted
 *               └── Right meta col — relative time Inter 10 muted + unread dot (wine-red, 8×8)
 *
 * §0-2 light-only — dark className/useColorScheme 0.
 * §4-11 — Pressable className 0, layout/visual은 inner View, flex 분포는 outer View.
 *
 * §6 deviations:
 *   #1 (kind=drinkWindowReached / levelUp 의 brand.gold → light.border.active)
 *   #2 (unread row bg = withAlpha(brand.wineRed, 0.08))
 *   #3 (webkit -webkit-box / WebkitLineClamp 2 → numberOfLines=2)
 *   #4 (relativeTime 함수 src/lib/relative-time.ts 로 추출)
 *   #5 (screen-spec 좌측 골드 도트 vs JSX 우측 wine-red 도트 — JSX 우선)
 *   #6 (kind=badgeEarned `var(--color-cream)` invisible → light.text.secondary; §10 H)
 *   #7 (KIND_ICON screen-spec 의도 vs JSX 부재 — JSX 우선, v0.1.0 미렌더)
 *   #13 (CSS `all: 'unset'` → RN Pressable 기본 button 스타일 없음 — 불필요)
 *   #14 (cssInterop Pressable className 금지 — 모두 inline style)
 *   #15 (음수 margin / sticky / grid / backdrop / radius.full — 부재, 통과)
 *   #19 (row tap 시 자동 mark-read v0.2.0 — §10 K)
 */
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  brand,
  light,
  withAlpha,
} from '@/lib/design-tokens';
import { relativeTime } from '@/lib/relative-time';
import type { AppLocale } from '@/lib/i18n';
import type { NotificationKind } from '@/lib/mock/notifications';
import type { NotificationRow as NotificationRowData } from '@/hooks/use-notifications';

/**
 * KIND_BAR_COLOR — keyscreen line 8~14 verbatim 의 RN light 매핑.
 * 사양 §1-1 매핑표 / §6-1 (drinkWindowReached, levelUp) / §6-6 (badgeEarned).
 */
const KIND_BAR_COLOR: Record<NotificationKind, string> = {
  favoritePurchase: brand.wineRed, // var(--color-wine-red)
  drinkWindowReached: light.border.active, // var(--color-gold) → §6-1 deep gold (light bg 대비)
  badgeEarned: light.text.secondary, // var(--color-cream) → §6-6 cream invisible 회피 (§10 H)
  levelUp: light.border.active, // var(--color-gold) → §6-1 deep gold
  reviewLiked: light.text.secondary, // var(--color-text-secondary)
};

interface NotificationRowProps {
  notification: NotificationRowData;
  locale: AppLocale;
  /** kind별 router.push 라우트 — 부모 (NotificationsScreen) 에서 매핑·디스패치. */
  onPress: () => void;
  /** 접근성 라벨 — kind 별 자연어 (부모에서 i18n key 조합 후 주입). */
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** locale 별 unread a11y suffix (예: '읽지 않음' / 'Unread'). */
  unreadA11y: string;
}

export function NotificationRow({
  notification,
  locale,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  unreadA11y,
}: NotificationRowProps): ReactNode {
  const titleText = notification.title[locale] ?? notification.title.en;
  const bodyText = notification.body[locale] ?? notification.body.en;
  const time = relativeTime(notification.createdAt, locale);

  // unread row bg = withAlpha(brand.wineRed, 0.08) — §6-2 deviation
  const rowBg = notification.read
    ? 'transparent'
    : withAlpha(brand.wineRed, 0.08);

  // ── 3.5-layer Pressable (사양 §3-5 / CLAUDE.md §4-11)
  return (
    <View style={{ marginVertical: 6, marginHorizontal: 16 }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ selected: !notification.read }}
        accessibilityValue={
          !notification.read ? { text: unreadA11y } : undefined
        }
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 12,
            paddingVertical: 14,
            paddingHorizontal: 14,
            borderRadius: 14,
            backgroundColor: rowBg,
            borderWidth: 1,
            borderColor: light.border.default,
            minHeight: 80,
          }}
        >
          {/* Color bar (aria-hidden) — kind별 4×stretch (§3-6) */}
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: 4,
              borderRadius: 2,
              backgroundColor: KIND_BAR_COLOR[notification.kind],
              flexShrink: 0,
              alignSelf: 'stretch',
            }}
          />

          {/* Center text col (§3-7) — title + body */}
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 13,
                lineHeight: 16,
                color: light.text.primary,
                marginBottom: 2,
              }}
            >
              {titleText}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                lineHeight: 16.8,
                color: light.text.muted,
              }}
            >
              {bodyText}
            </Text>
          </View>

          {/* Right meta col (§3-8) — time + optional unread dot */}
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexShrink: 0,
              gap: 4,
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                lineHeight: 12,
                color: light.text.muted,
              }}
            >
              {time}
            </Text>
            {!notification.read ? (
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4, // size/2 (Yoga radius.full 우회 — 사양 §6-15)
                  backgroundColor: brand.wineRed,
                }}
              />
            ) : null}
          </View>
        </View>
      </Pressable>
    </View>
  );
}
