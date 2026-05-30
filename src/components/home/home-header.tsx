/**
 * HomeHeader — 홈 화면 전용 헤더 (사양 home.md §2-1 line 56-67, §3-1).
 *
 * AppHeader (다른 화면 공용)와 별개. 키스크린 verbatim:
 * - padding 12_20_14, gap 10, border-bottom hairline border-default, bg-bg-deep
 * - Left: WMLogoMark SVG 26 + WMLogoWordmark "WineMine" Playfair 18 cream/gold
 * - Right: BellButton 36×36 + LevelChip (heavy) / FirstTimeAvatar (first-time)
 *
 * `mode`:
 *  - 'heavy' → LevelChip (avatar gradient + L{n})
 *  - 'first-time' → FirstTimeAvatar (wine-red circle + cream initial)
 */
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { LevelChip } from '@/components/shared/level-chip';
import { WMLogoMark } from '@/components/shared/wm-logo-mark';
import { WMLogoWordmark } from '@/components/shared/wm-logo-wordmark';

type LevelId = 1 | 2 | 3 | 4 | 5;

interface HomeHeaderProps {
  mode: 'heavy' | 'first-time';
  levelId: LevelId;
  displayInitial: string;
  unreadNotifications?: boolean;
}

function BellButton({ unread }: { unread: boolean }) {
  const tokens = useThemeTokens();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        // v0.1.0: /notifications 미구현
      }}
      accessibilityRole="button"
      accessibilityLabel="notifications"
      style={{
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
      }}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 8 A6 6 0 0 1 18 8 V14 L20 17 H4 L6 14 Z"
          stroke={tokens.text.secondary}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <Path
          d="M10 20 A2 2 0 0 0 14 20"
          stroke={tokens.text.secondary}
          strokeWidth={1.5}
        />
        {unread && <Circle cx={18} cy={6} r={2.5} fill={brand.wineRed} />}
      </Svg>
    </Pressable>
  );
}

function FirstTimeAvatar({ initial }: { initial: string }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        router.push('/profile' as never);
      }}
      accessibilityRole="link"
      accessibilityLabel="profile"
      className="bg-wine-red"
      style={{
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
      }}
    >
      <Text
        className="font-inter-semibold"
        style={{ color: brand.cream, fontSize: 14 }}
      >
        {initial}
      </Text>
    </Pressable>
  );
}

export function HomeHeader({
  mode,
  levelId,
  displayInitial,
  unreadNotifications = false,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const tokens = useThemeTokens();
  return (
    <View
      className="bg-bg-deep dark:bg-bg-deep"
      style={{
        paddingTop: insets.top + 12,
        paddingBottom: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: tokens.border.default,
      }}
    >
      <Pressable
        onPress={() => {
          // 이미 홈에 있을 때 — no-op
        }}
        accessibilityRole="link"
        accessibilityLabel="Home"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        <WMLogoMark />
        <WMLogoWordmark />
      </Pressable>
      <View style={{ flex: 1 }} />
      <BellButton unread={unreadNotifications} />
      {mode === 'heavy' ? (
        <LevelChip levelId={levelId} initial={displayInitial} />
      ) : (
        <FirstTimeAvatar initial={displayInitial} />
      )}
    </View>
  );
}
