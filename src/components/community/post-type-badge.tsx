/**
 * PostTypeBadge — 포스트 종류 배지 (note / question / column / news / album).
 *
 * 사양 home.md §3-6-PATCH (line 1126~1235): keyscreen verbatim 복원
 *   - inline-flex row, gap 5, padding vertical 3 horizontal 9, radius 999 (pill)
 *   - bg = color + 10% alpha, border 1px color + 33% alpha
 *   - 좌측 lucide icon 10px strokeWidth 2 (type별 5종)
 *   - 우측 label Inter 10 600 letterSpacing 0.4 — locale 분기 (ko: t('community.postType.{type}'))
 *
 * PostType union은 keyscreen verbatim (`note|question|column|news|album`).
 * 색 토큰은 design-tokens.ts `postTypeBadgeColor` 5종 — 양쪽 모드 동일 (type identity).
 *
 * 키스크린 HelpCircle은 lucide-react-native에 미존재 → CircleQuestionMark 사용 (의미 동등).
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PenLine, CircleQuestionMark, BookOpen, Sparkles, Image as ImageIcon } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { postTypeBadgeColor, withAlpha, type PostTypeKey } from '@/lib/design-tokens';

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
  const color = postTypeBadgeColor[type];
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
    >
      <Icon size={10} strokeWidth={2} color={color} />
      <Text
        className="font-inter-semibold"
        style={{ color, fontSize: 10, letterSpacing: 0.4 }}
        allowFontScaling={false}
      >
        {t(`community.postType.${type}`)}
      </Text>
    </View>
  );
}
