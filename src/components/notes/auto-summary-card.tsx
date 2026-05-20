/**
 * AutoSummaryCard — Beginner 폼 자동 요약 카드 (Playfair italic).
 *
 * 사양: design-spec notes-write.md §2-2 AutoSummaryCard + §4-2 typography summaryEyebrow / summaryText.
 * 키스크린 원본: beginner-note.tsx 자동 요약 영역.
 *
 * 구조:
 *   View (padding 12, radius 12, bg withAlpha(gold,0.06), border 1 withAlpha(gold,0.30))
 *   ├── Eyebrow (Inter 11 gold uppercase ls 1.1 mb 4)
 *   └── SummaryText (Playfair italic 13 lh 19.5 text-primary)
 *
 * SummaryText는 props.text — 호출측에서 useMemo로 summarizeBeginner() 계산.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand, withAlpha } from '@/lib/design-tokens';

interface Props {
  text: string;
}

export function AutoSummaryCard({ text }: Props) {
  const { t } = useTranslation();

  return (
    <View
      style={{
        padding: 12,
        borderRadius: 12,
        backgroundColor: withAlpha(brand.gold, 0.06),
        borderWidth: 1,
        borderColor: withAlpha(brand.gold, 0.3),
      }}
    >
      <Text
        allowFontScaling={false}
        className="font-inter"
        style={{
          fontSize: 11,
          lineHeight: 11,
          letterSpacing: 1.1,
          textTransform: 'uppercase',
          color: brand.gold,
          marginBottom: 4,
        }}
      >
        {t('notes.writeForm.beginnerSummaryEyebrow')}
      </Text>
      <Text
        allowFontScaling={false}
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{ fontSize: 13, lineHeight: 19.5, fontStyle: 'italic' }}
      >
        {text}
      </Text>
    </View>
  );
}
