/**
 * ImpressionTriad — Step 1 첫 인상 (3-button: star / smile / thinking).
 *
 * 사양: design-spec notes-write.md §2-2 Step 1.
 * 키스크린 원본: beginner-note.tsx 첫 인상 3-button.
 *
 * 구조:
 *   View (flex-row gap 8)
 *   └── Pressable × 3 (flex-1, padding 14_8, radius 12, items-center gap 4 col,
 *                      idle: bg-surface border 1 border-default,
 *                      active: bg withAlpha(gold,0.18) border gold)
 *       ├── Icon (Sparkles / Smile / HelpCircle 26 strokeWidth 1.5, active gold / idle text-primary)
 *       └── Label (Inter 12 600, active gold / idle text-primary)
 */
import { View, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Sparkles, Smile, HelpCircle } from 'lucide-react-native';
import { brand, dark, light, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export type ImpressionValue = 'star' | 'smile' | 'thinking';

interface Props {
  value: ImpressionValue;
  onChange: (v: ImpressionValue) => void;
}

const OPTIONS: ReadonlyArray<{
  id: ImpressionValue;
  Icon: typeof Sparkles;
  labelKey: string;
}> = [
  { id: 'star', Icon: Sparkles, labelKey: 'notes.writeForm.beginnerStep.impressionStar' },
  { id: 'smile', Icon: Smile, labelKey: 'notes.writeForm.beginnerStep.impressionSmile' },
  { id: 'thinking', Icon: HelpCircle, labelKey: 'notes.writeForm.beginnerStep.impressionThinking' },
];

export function ImpressionTriad({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const borderDefault = scheme === 'light' ? light.border.default : dark.border.default;
  const idleText = scheme === 'light' ? light.text.primary : dark.text.primary;

  const handlePress = (id: ImpressionValue) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(id);
  };

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {OPTIONS.map(({ id, Icon, labelKey }) => {
        const active = value === id;
        const label = t(labelKey);
        return (
          <Pressable
            key={id}
            onPress={() => handlePress(id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            accessibilityHint={t('notes.writeForm.beginnerStep.impressionHint')}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 8,
              borderRadius: 12,
              backgroundColor: active ? withAlpha(brand.gold, 0.18) : surfaceBg,
              borderWidth: 1,
              borderColor: active ? brand.gold : borderDefault,
              rowGap: 4,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Icon size={26} strokeWidth={1.5} color={active ? brand.gold : idleText} />
            <Text
              allowFontScaling={false}
              className="font-inter-semibold"
              style={{ fontSize: 12, lineHeight: 14.4, color: active ? brand.gold : idleText }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
