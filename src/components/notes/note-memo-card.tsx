/**
 * NoteMemoCard — bg-sunken 메모 카드 (mode 무관 공통).
 *
 * 사양: design-spec notes-detail.md §2-4 + §10 E3 (a) — Dimensions 위로 끌어올림.
 * 키스크린 원본: src/app/notes/[noteId]/page.tsx line 335~367.
 *
 * 구조:
 *   View (mx 16, mt 16, p 16, radius 14, bg-bg-sunken, border 1 border-default)
 *   ├── Eyebrow (Inter 10 600 gold uppercase ls 1.8 mb 8) — "메모"/"Memo"
 *   └── MemoText (Playfair 14 italic cream lh 23.1) — fallback "코멘트 없음"/"No comment"
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';

interface Props {
  memo: string;
}

export function NoteMemoCard({ memo }: Props) {
  const { t } = useTranslation();
  const trimmed = memo.trim();
  const display = trimmed.length > 0 ? memo : t('notes.detail.noComment');
  const isEmpty = trimmed.length === 0;

  return (
    <View
      className="bg-bg-sunken border-border-default"
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
      }}
    >
      <Text
        allowFontScaling={false}
        className="font-inter-semibold"
        style={{
          fontSize: 10,
          lineHeight: 12,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: brand.gold,
          marginBottom: 8,
        }}
        accessibilityRole="header"
      >
        {t('notes.detail.sectionMemo')}
      </Text>
      <Text
        allowFontScaling={false}
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{
          fontSize: 14,
          lineHeight: 23.1,
          fontStyle: 'italic',
          opacity: isEmpty ? 0.65 : 1,
        }}
      >
        {display}
      </Text>
    </View>
  );
}
