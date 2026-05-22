/**
 * ReadinessTriad — Expert form 음용 적기 3-pill (tooYoung / drink / pastPeak).
 *
 * 사양: keyscreen 영감 — drink window readiness 선택 (3-step pill).
 * 키스크린 원본: peak-eta-input.tsx (peakConfidence) + drink-window.ts 영역.
 *
 * 구조: PalateTriad와 동일 (flex-row gap 6, flex-1 pill, padding 10, radius 8).
 * - active: bg gold, text bg-deepest (dark text on gold)
 * - idle: bg-surface, border 1 border-default, text-secondary
 *
 * Light 모드만.
 */
import { View, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, light } from '@/lib/design-tokens';

export type Readiness = 'tooYoung' | 'drink' | 'pastPeak';

const OPTIONS: ReadonlyArray<Readiness> = ['tooYoung', 'drink', 'pastPeak'];

interface Props {
  value: Readiness;
  onChange: (v: Readiness) => void;
}

export function ReadinessTriad({ value, onChange }: Props) {
  const { t } = useTranslation();

  const labelFor = (r: Readiness): string => {
    if (r === 'tooYoung') return t('notes.expert.readinessTooYoung');
    if (r === 'pastPeak') return t('notes.expert.readinessPastPeak');
    return t('notes.expert.readinessDrink');
  };

  const handle = (r: Readiness) => {
    if (r === value) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(r);
  };

  return (
    <View style={{ flexDirection: 'row', columnGap: 6 }}>
      {OPTIONS.map((opt) => {
        const active = value === opt;
        const label = labelFor(opt);
        return (
          <View key={opt} style={{ flex: 1 }}>
            <Pressable
              onPress={() => handle(opt)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
              hitSlop={6}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  backgroundColor: active ? brand.gold : light.bg.surface,
                  borderWidth: 1,
                  borderColor: active ? brand.gold : light.border.default,
                }}
              >
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    fontSize: 12,
                    lineHeight: 14.4,
                    color: active ? brand.deepestDark : light.text.secondary,
                  }}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
