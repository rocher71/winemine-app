/**
 * HomeHeader — 홈 화면 전용 헤더 (사양 home.md §3-1, Editorial Stack).
 *
 * mode 분기 제거 (리더 Q3) — 항상 LevelChip. FirstTimeAvatar 삭제.
 * - padding 12_20_14, gap 10, border-bottom hairline border-default, bg-bg-deep
 * - Left: WMLogoMark SVG 28 + WMLogoWordmark "WineMine"
 * - Right: BellButton 36×36 (unread dot wine) + LevelChip (avatar gradient + L{n})
 */
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { LevelChip } from '@/components/shared/level-chip';
import { WMLogoMark } from '@/components/shared/wm-logo-mark';
import { WMLogoWordmark } from '@/components/shared/wm-logo-wordmark';

type LevelId = 1 | 2 | 3 | 4 | 5;

interface HomeHeaderProps {
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
        <Path d="M10 20 A2 2 0 0 0 14 20" stroke={tokens.text.secondary} strokeWidth={1.5} />
        {unread && <Circle cx={18} cy={6} r={2.5} fill={brand.wineRed} />}
      </Svg>
    </Pressable>
  );
}

export function HomeHeader({ levelId, displayInitial, unreadNotifications = false }: HomeHeaderProps) {
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
        <WMLogoMark size={28} />
        <WMLogoWordmark />
      </Pressable>
      <View style={{ flex: 1 }} />
      <BellButton unread={unreadNotifications} />
      <LevelChip levelId={levelId} initial={displayInitial} />
    </View>
  );
}
