import { View } from 'react-native';
import { Star, StarHalf } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { brand, dark, light } from '@/lib/design-tokens';

interface Props {
  value: number;
  size?: number;
}

export function StarRatingReadOnly({ value, size = 20 }: Props) {
  const scheme = useColorScheme();
  const idleColor = scheme === 'light' ? light.text.disabled : dark.text.disabled;

  return (
    <View className="flex-row items-center gap-1" accessibilityRole="text" accessibilityLabel={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (value >= i) {
          return <Star key={i} size={size} strokeWidth={1.5} color={brand.gold} fill={brand.gold} />;
        }
        if (value >= i - 0.5) {
          return <StarHalf key={i} size={size} strokeWidth={1.5} color={brand.gold} fill={brand.gold} />;
        }
        return <Star key={i} size={size} strokeWidth={1.5} color={idleColor} />;
      })}
    </View>
  );
}
