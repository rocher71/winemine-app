import { View, Pressable } from 'react-native';
import { Star, StarHalf } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'react-native';
import { brand, dark, light } from '@/lib/design-tokens';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

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
          <View key={i} className="flex-row">
            <Pressable
              onPress={() => setRating(i - 0.5)}
              accessibilityRole="button"
              accessibilityLabel={`${i - 0.5}`}
              hitSlop={6}
            >
              {filled || half ? (
                <StarHalf size={28} strokeWidth={1.5} color={brand.gold} fill={brand.gold} />
              ) : (
                <StarHalf size={28} strokeWidth={1.5} color={idleColor} />
              )}
            </Pressable>
            <Pressable
              onPress={() => setRating(i)}
              accessibilityRole="button"
              accessibilityLabel={`${i}`}
              hitSlop={6}
              style={{ marginLeft: -16 }}
            >
              {filled ? (
                <Star size={28} strokeWidth={1.5} color={brand.gold} fill={brand.gold} />
              ) : (
                <Star size={28} strokeWidth={1.5} color={idleColor} />
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
