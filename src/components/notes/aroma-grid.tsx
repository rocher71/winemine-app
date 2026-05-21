/**
 * AromaGrid — Step 3 아로마 (4×2 = 8 카드 그리드).
 *
 * 사양: design-spec notes-write.md §2-2 Step 3 (verbatim 8 카드).
 * 키스크린 원본: beginner-note.tsx AromaGrid 8 카드 (Cherry/Citrus/Apple/Flower2/Flame/Candy/Sprout/Wheat).
 *
 * 구조:
 *   View (flex-row flex-wrap rowGap 6 columnGap 6)
 *   └── AromaCard × 8 (width '23.5%', padding 10v_4h, radius 10,
 *                       idle: bg-surface border 1 border-default,
 *                       active: bg withAlpha(gold,0.18) border gold,
 *                       items-center gap 2 col)
 *       ├── Icon (20 strokeWidth 1.5, active gold / idle text-primary)
 *       └── Label (Inter 10, active gold / idle text-primary)
 *
 * RN deviation D1: CSS grid 미지원 — flex-wrap + width 23.5% 4 cards-per-row.
 */
import { View, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  Cherry,
  Citrus,
  Apple,
  Flower2,
  Flame,
  Candy,
  Sprout,
  Wheat,
} from 'lucide-react-native';
import { brand, dark, light, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export type AromaTag =
  | 'berry'
  | 'citrus'
  | 'stoneFruit'
  | 'floral'
  | 'spice'
  | 'sweet'
  | 'earth'
  | 'yeast';

const CARDS: ReadonlyArray<{ id: AromaTag; Icon: typeof Cherry }> = [
  { id: 'berry', Icon: Cherry },
  { id: 'citrus', Icon: Citrus },
  { id: 'stoneFruit', Icon: Apple },
  { id: 'floral', Icon: Flower2 },
  { id: 'spice', Icon: Flame },
  { id: 'sweet', Icon: Candy },
  { id: 'earth', Icon: Sprout },
  { id: 'yeast', Icon: Wheat },
];

interface Props {
  selected: readonly AromaTag[];
  onChange: (next: readonly AromaTag[]) => void;
}

export function AromaGrid({ selected, onChange }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const borderDefault = scheme === 'light' ? light.border.default : dark.border.default;
  const idleText = scheme === 'light' ? light.text.primary : dark.text.primary;

  const toggle = (id: AromaTag) => {
    Haptics.selectionAsync().catch(() => undefined);
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 6,
        columnGap: 6,
      }}
    >
      {CARDS.map(({ id, Icon }) => {
        const active = selected.includes(id);
        const label = t(`notes.beginner.aromaCard.${id}`);
        return (
          // 4-cols: (100 - 3*6/X) / 4 ≈ 23.5% per card (gap 6 columnGap).
          <View key={id} style={{ width: '23.5%' }}>
            <Pressable
              onPress={() => toggle(id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={label}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderRadius: 10,
                  backgroundColor: active ? withAlpha(brand.gold, 0.18) : surfaceBg,
                  borderWidth: 1,
                  borderColor: active ? brand.gold : borderDefault,
                  rowGap: 2,
                }}
              >
                <Icon size={20} strokeWidth={1.5} color={active ? brand.gold : idleText} />
                <Text
                  allowFontScaling={false}
                  className="font-inter"
                  numberOfLines={1}
                  style={{ fontSize: 10, color: active ? brand.gold : idleText }}
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
