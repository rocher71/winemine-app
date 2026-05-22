/**
 * VariantTabs — Expert form 4-pill 와인 종류 선택 (white/red/sparkling/blind).
 *
 * 사양: ../winemine-keyscreen/src/components/tasting-note/note-write-expert.tsx VariantTabs (line 617~670).
 * - 4 grid 1fr, gap 4, padding 4, border 1 border-default, radius 999 (pill container)
 * - active pill: bg wineRed, text cream
 * - idle: bg transparent, text text-secondary
 *
 * RN: grid → flex-row equal flex:1 (D1 verbatim deviation).
 * Light 모드만.
 */
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, light } from '@/lib/design-tokens';

export type WineVariant = 'white' | 'red' | 'sparkling' | 'blind';

const VARIANTS: ReadonlyArray<{ id: WineVariant; labelKey: string }> = [
  { id: 'white', labelKey: 'notes.expert.variantWhite' },
  { id: 'red', labelKey: 'notes.expert.variantRed' },
  { id: 'sparkling', labelKey: 'notes.expert.variantSparkling' },
  { id: 'blind', labelKey: 'notes.expert.variantBlind' },
];

interface Props {
  value: WineVariant;
  onChange: (v: WineVariant) => void;
}

export function VariantTabs({ value, onChange }: Props) {
  const { t } = useTranslation();

  const handle = (id: WineVariant) => {
    if (id === value) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(id);
  };

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        padding: 4,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        borderRadius: 9999,
        columnGap: 4,
      }}
    >
      {VARIANTS.map(({ id, labelKey }) => {
        const active = value === id;
        const label = t(labelKey);
        return (
          <View key={id} style={{ flex: 1 }}>
            <Pressable
              onPress={() => handle(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 9999,
                  backgroundColor: active ? brand.wineRed : 'transparent',
                }}
              >
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    fontSize: 12,
                    lineHeight: 14.4,
                    color: active ? brand.cream : light.text.secondary,
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
