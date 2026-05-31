import { View, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'react-native';
import { brand, dark, light } from '@/lib/design-tokens';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

const SIZE = 28;

export function StarRating({ value, onChange }: Props) {
  const scheme = useColorScheme();
  const idleColor = scheme === 'light' ? light.text.muted : dark.text.muted;

  const setRating = (v: number) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(v);
  };

  return (
    <View className="flex-row items-center gap-2">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i;
        const half = !filled && value >= i - 0.5;
        return (
          <View key={i} style={{ width: SIZE, height: SIZE }}>
            {/* Single star — empty outline base */}
            <Star size={SIZE} strokeWidth={1.5} color={idleColor} />
            {/* Gold fill clipped to half (0.5) or full (>=1) */}
            {(filled || half) && (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: SIZE,
                  width: filled ? SIZE : SIZE / 2,
                  overflow: 'hidden',
                }}
                pointerEvents="none"
              >
                <Star size={SIZE} strokeWidth={1.5} color={brand.gold} fill={brand.gold} />
              </View>
            )}
            {/* Two transparent hit targets: left half = i-0.5, right half = i */}
            <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, flexDirection: 'row' }}>
              <Pressable
                onPress={() => setRating(i - 0.5)}
                accessibilityRole="button"
                accessibilityLabel={`${i - 0.5}`}
                hitSlop={6}
                style={{ flex: 1 }}
              />
              <Pressable
                onPress={() => setRating(i)}
                accessibilityRole="button"
                accessibilityLabel={`${i}`}
                hitSlop={6}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
