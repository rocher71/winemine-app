/**
 * PostTypeBadge — 포스트 종류 배지 (note / question / column / news / album).
 *
 * 사양: community-components.md §1-5 verbatim.
 *   - inline-flex row, gap 5, padding vertical 3 horizontal 9, radius 999 (pill)
 *   - bg = color + 10% alpha, border 1px color + 33% alpha
 *   - 좌측 lucide icon 10px strokeWidth 2 (type별 5종)
 *   - 우측 label Inter 10 600 letterSpacing 0.4 — i18n (community.postType.{type})
 *
 * **DEVIATION community-components.md §10 F**: light 모드에서 column = cream (#F5F0E8) 은
 * surface (#FFFFFF) 위 invisible. `postTypeBadgeColorLight` (`#8B7766` for column) 사용
 * — type identity (warm neutral) 보존.
 *
 * **light-only mode** (§0-2): dark variant 생략. light 색 단독.
 *
 * 키스크린 HelpCircle은 lucide-react-native에 미존재 → CircleQuestionMark 사용 (의미 동등, §6-15).
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PenLine, CircleQuestionMark, BookOpen, Sparkles, Image as ImageIcon } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { postTypeBadgeColorLight, withAlpha, type PostTypeKey } from '@/lib/design-tokens';

export type PostType = PostTypeKey;

const TYPE_ICON: Record<PostType, LucideIcon> = {
  note: PenLine,
  question: CircleQuestionMark,
  column: BookOpen,
  news: Sparkles,
  album: ImageIcon,
};

interface PostTypeBadgeProps {
  type: PostType;
}

export function PostTypeBadge({ type }: PostTypeBadgeProps) {
  const { t } = useTranslation();
  // §10 F: light fallback (cream → #8B7766 for column only). 나머지 4 type 색은 동일.
  const color = postTypeBadgeColorLight[type];
  const Icon = TYPE_ICON[type];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: withAlpha(color, 0.1),
        borderColor: withAlpha(color, 0.33),
        borderWidth: 1,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 999,
      }}
      accessibilityRole="text"
    >
      <Icon size={10} strokeWidth={2} color={color} />
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          color,
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.4,
        }}
        allowFontScaling={false}
      >
        {t(`community.postType.${type}`)}
      </Text>
    </View>
  );
}
