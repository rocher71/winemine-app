/**
 * MetaCard — Section 4 item: label + value.
 *
 * 사양: design-spec cellar-detail.md §3-7.
 * 키스크린 원본: src/app/cellar/[id]/page.tsx line 325~365 인라인 verbatim.
 *
 * 구조:
 *   outer (bg-surface border radius 12 padding 12 14 minHeight 64)
 *     label (Inter 11 muted mb 4)
 *     value (Inter 13 500 cream, numberOfLines 2)
 */
import { View, Text } from 'react-native';

interface Props {
  label: string;
  value: string;
  /** flex-basis 48% (gap 10 2-col grid 보정) — RN DimensionValue 호환 percent string */
  widthPercent?: `${number}%`;
}

export function MetaCard({ label, value, widthPercent = '48%' }: Props) {
  return (
    <View
      className="bg-surface dark:bg-surface border border-border-default"
      style={{
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        minHeight: 64,
        width: widthPercent,
      }}
    >
      <Text
        allowFontScaling={false}
        className="font-inter text-text-muted dark:text-text-muted"
        style={{ fontSize: 11, lineHeight: 13.2, marginBottom: 4 }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="font-inter-medium text-text-primary dark:text-text-primary"
        style={{ fontSize: 13, lineHeight: 15.6 }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
