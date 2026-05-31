/**
 * FinishTriad — Step 4 여운 (short / medium / long 3-button).
 *
 * 사양: design-spec notes-write.md §2-2 Step 4.
 * 키스크린 원본: beginner-note.tsx FinishTriad (Palate triad 패턴 + font 13).
 *
 * 구조:
 *   View (flex-row gap 6)
 *   └── Pressable × 3 (flex-1, padding 10, radius 8, font 13,
 *                       idle: bg-surface border border-default text-secondary,
 *                       active: bg wineRed border wineRed text cream)
 */
import { View, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, dark, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export type FinishLevel = 'short' | 'medium' | 'long';

interface Props {
  value: FinishLevel;
  onChange: (v: FinishLevel) => void;
}

const LEVELS: ReadonlyArray<FinishLevel> = ['short', 'medium', 'long'];

export function FinishTriad({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const borderDefault = scheme === 'light' ? light.border.default : dark.border.default;
  const idleText = scheme === 'light' ? light.text.secondary : dark.text.secondary;

  const setLevel = (level: FinishLevel) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(level);
  };

  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {LEVELS.map((level) => {
        const active = value === level;
        const label = t(`notes.beginner.finishLevel.${level}`);
        return (
          // Round 10: flex:1 outer View + Pressable opacity only + inner View visual.
          <View key={level} style={{ flex: 1 }}>
            <Pressable
              onPress={() => setLevel(level)}
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
                  borderRadius: 8,
                  backgroundColor: active ? brand.gold : surfaceBg,
                  borderWidth: 1,
                  borderColor: active ? brand.gold : borderDefault,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 13,
                    lineHeight: 15.6,
                    color: active ? brand.deepestDark : idleText,
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
