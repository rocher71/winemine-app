/**
 * PalateTriad — Step 2 맛의 균형 (각 dim × low/mid/high triad).
 *
 * 사양: design-spec notes-write.md §2-2 Step 2.
 * 키스크린 원본: beginner-note.tsx Palate dim 5종.
 *
 * 구조:
 *   View (gap 10 col)
 *   └── PalateRow × N (gap 4 col)
 *       ├── DimLabel (Inter 12 text-primary)
 *       └── Triad (flex-row gap 6)
 *           └── Pressable × 3 (flex-1, padding 8, radius 8,
 *                              idle: bg-surface border 1 border-default text-secondary,
 *                              active: bg wineRed border wineRed text-cream)
 *
 * dim: sweetness, acidity, body, tannin?, bubble? (variant 분기).
 */
import { View, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, dark, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export type PalateLevel = 'low' | 'mid' | 'high';
export type PalateDim = 'sweetness' | 'acidity' | 'body' | 'tannin' | 'bubble';

export interface PalateState {
  sweetness: PalateLevel;
  acidity: PalateLevel;
  body: PalateLevel;
  tannin?: PalateLevel;
  bubble?: PalateLevel;
}

interface Props {
  value: PalateState;
  onChange: (next: PalateState) => void;
  /** 표시할 dim 목록 — 와인 타입에 따라 tannin/bubble 토글 */
  dims?: ReadonlyArray<PalateDim>;
}

const DEFAULT_DIMS: ReadonlyArray<PalateDim> = ['sweetness', 'acidity', 'body', 'tannin'];
const LEVELS: ReadonlyArray<PalateLevel> = ['low', 'mid', 'high'];

export function PalateTriad({ value, onChange, dims = DEFAULT_DIMS }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const borderDefault = scheme === 'light' ? light.border.default : dark.border.default;
  const idleText = scheme === 'light' ? light.text.secondary : dark.text.secondary;

  const setLevel = (dim: PalateDim, level: PalateLevel) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange({ ...value, [dim]: level });
  };

  return (
    <View style={{ rowGap: 10 }}>
      {dims.map((dim) => {
        const dimLabel = t(`notes.beginner.palateDim.${dim}`);
        const current = value[dim];
        return (
          <View key={dim} style={{ rowGap: 4 }}>
            <Text
              allowFontScaling={false}
              className="font-inter text-text-primary dark:text-text-primary"
              style={{ fontSize: 12, lineHeight: 14.4 }}
            >
              {dimLabel}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {LEVELS.map((level) => {
                const active = current === level;
                const levelLabel = t(`notes.beginner.palateLevel.${level}`);
                return (
                  <Pressable
                    key={level}
                    onPress={() => setLevel(dim, level)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${dimLabel} ${levelLabel}`}
                    hitSlop={6}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: active ? brand.wineRed : surfaceBg,
                      borderWidth: 1,
                      borderColor: active ? brand.wineRed : borderDefault,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <Text
                      allowFontScaling={false}
                      className="font-inter"
                      style={{
                        fontSize: 12,
                        lineHeight: 14.4,
                        color: active ? brand.cream : idleText,
                      }}
                    >
                      {levelLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function defaultPalateState(): PalateState {
  return {
    sweetness: 'mid',
    acidity: 'mid',
    body: 'mid',
    tannin: 'mid',
  };
}
