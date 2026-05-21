/**
 * SettingsRadioRow
 *
 * 출처: _workspace/design-specs/settings-language.md §2 (verbatim 변환 from
 * keyscreen `src/components/settings/radio-list.tsx`).
 *
 * 3개 settings sub 화면(language / experience / appearance) 공유.
 *
 * 시각 사양:
 * - 카드: bg-surface / border 1px (selected=gold, unselected=border-default)
 *         rounded-xl / py-3.5 px-4 / flex-row items-start gap-3
 * - indicator: 20x20 / borderRadius 10 / borderWidth 2
 *              selected = gold fill + Check(12, strokeWidth=3, color=brand.deepestDark)
 *              unselected = transparent fill + border-default
 * - label: Inter 500 / 14 / lineHeight 20 / text-primary
 * - description (옵션): Inter 400 / 12 / lineHeight 17 / text-muted / mt-1
 *
 * Deviation (사양 §8): keyscreen에는 없는 RN 표준 press feedback (opacity 0.92 / scale 0.99).
 */
import { View, Text, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { Check } from 'lucide-react-native';
import { brand, dark, light } from '@/lib/design-tokens';

export interface SettingsRadioRowProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
}

export function SettingsRadioRow({
  label,
  description,
  selected,
  onPress,
  disabled = false,
  accessibilityHint,
}: SettingsRadioRowProps) {
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const borderDefault = isLight ? light.border.default : dark.border.default;
  const surfaceBg = isLight ? light.bg.surface : dark.bg.surface;
  const textPrimary = isLight ? light.text.primary : dark.text.primary;
  const textMuted = isLight ? light.text.muted : dark.text.muted;

  // Round 8 패턴 (§4-11): Pressable은 hit target만, layout/visual은 inner View.
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      hitSlop={6}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          borderRadius: 12,
          backgroundColor: surfaceBg,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderWidth: 1,
          borderColor: selected ? brand.gold : borderDefault,
        }}
      >
        {/* radio indicator */}
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: selected ? brand.gold : borderDefault,
            backgroundColor: selected ? brand.gold : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          {selected ? <Check size={12} strokeWidth={3} color={brand.deepestDark} /> : null}
        </View>

        {/* text column */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              lineHeight: 20,
              color: textPrimary,
            }}
          >
            {label}
          </Text>
          {description ? (
            <Text
              style={{
                marginTop: 4,
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                lineHeight: 17,
                color: textMuted,
              }}
            >
              {description}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
