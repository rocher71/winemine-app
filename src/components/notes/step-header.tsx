/**
 * StepHeader — BeginnerForm 6 Step / ExpertForm Section 공통 헤더.
 *
 * 사양: design-spec notes-write.md §2-4 + §10 E17 (prop variant 통합).
 * 키스크린 원본: beginner-note.tsx StepHeader (number badge 22×22 wineRed circle + title Inter 14 600).
 *
 * 구조:
 *   View (flex-row items-center gap 8)
 *   ├── NumberBadge (22×22, radius 9999, bg wineRed (beginner) / gold (expert), center)
 *   │   └── Text (Inter 700 11 cream (beginner) / deepestDark (expert))
 *   └── Title (Inter 600 14 lh 16.8 text-primary)
 */
import { View, Text } from 'react-native';
import { brand } from '@/lib/design-tokens';

interface Props {
  step: number;
  title: string;
  variant?: 'beginner' | 'expert';
}

export function StepHeader({ step, title, variant = 'beginner' }: Props) {
  const badgeBg = variant === 'beginner' ? brand.wineRed : brand.gold;
  const badgeText = variant === 'beginner' ? brand.cream : brand.deepestDark;

  return (
    <View
      accessibilityRole="header"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 9999,
          backgroundColor: badgeBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          allowFontScaling={false}
          className="font-inter-semibold"
          style={{ fontSize: 11, lineHeight: 13.2, color: badgeText, fontWeight: '700' }}
        >
          {step}
        </Text>
      </View>
      <Text
        className="font-inter-semibold text-text-primary dark:text-text-primary"
        style={{ fontSize: 14, lineHeight: 16.8 }}
      >
        {title}
      </Text>
    </View>
  );
}
