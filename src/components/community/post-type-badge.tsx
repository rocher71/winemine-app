/**
 * PostTypeBadge — 포스트 종류 배지 (note / question / event / cellar / wine 등).
 *
 * 사양 home.md §3-6: inline-flex, Inter 10px 600, tracking 0.04em,
 *   bg = color + '1a' (10%), border = color + '55' (33%), p 2_6 radius 4.
 * v0.1.0 mock 단계 — 색 매핑은 brand 토큰 + alpha helper 사용.
 */
import { View, Text } from 'react-native';
import { brand, withAlpha } from '@/lib/design-tokens';

export type PostType = 'note' | 'question' | 'event' | 'cellar' | 'wine';

const TYPE_COLOR: Record<PostType, string> = {
  note: brand.gold,
  question: brand.wineRedHover,
  event: brand.goldSoft,
  cellar: brand.wineRed,
  wine: brand.goldDeep,
};

interface PostTypeBadgeProps {
  type: PostType;
  label: string;
}

export function PostTypeBadge({ type, label }: PostTypeBadgeProps) {
  const color = TYPE_COLOR[type];
  return (
    <View
      style={{
        backgroundColor: withAlpha(color, 0.1),
        borderColor: withAlpha(color, 0.33),
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
      }}
    >
      <Text
        className="font-inter-semibold"
        style={{ color, fontSize: 10, letterSpacing: 0.4 }}
      >
        {label}
      </Text>
    </View>
  );
}
