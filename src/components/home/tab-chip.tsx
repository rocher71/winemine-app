/**
 * TabChip — 가로 스크롤 탭 전환 chip.
 *
 * 사용처: WineFeed 탭 바 (featured/trending/explore).
 * 재사용 후보: CommunityTab 등 아이콘 + 텍스트 탭 chip이 필요한 모든 곳.
 *
 * active 상태:
 *   - border: brand.gold / bg: gold 12% alpha
 *   - icon + text: brand.gold
 * inactive 상태:
 *   - border: tokens.border.default / bg: transparent
 *   - icon + text: tokens.text.muted
 *
 * §4-11 Pressable 패턴: style 함수에 layout prop 없음. 모든 layout은 inline style로.
 */
import { Text, Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { brand, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface TabChipProps {
  active: boolean;
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
}

export function TabChip({ active, Icon, label, onPress }: TabChipProps) {
  const tokens = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 9,
        paddingRight: 11,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: active ? brand.gold : tokens.border.default,
        backgroundColor: active ? withAlpha(brand.gold, 0.12) : 'transparent',
      }}
    >
      <Icon size={13} strokeWidth={1.75} color={active ? brand.gold : tokens.text.muted} />
      <Text
        className="font-inter-semibold"
        style={{ color: active ? brand.gold : tokens.text.muted, fontSize: 11 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
