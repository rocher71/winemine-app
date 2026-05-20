import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brand, dark, light } from '@/lib/design-tokens';
import { useColorScheme } from 'react-native';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function WSETSlider({ label, value, onChange, min = 1, max = 5 }: Props) {
  const scheme = useColorScheme();
  const idleColor = scheme === 'light' ? light.text.disabled : dark.text.disabled;

  const handlePress = (v: number) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(v);
  };

  const dots: number[] = [];
  for (let i = min; i <= max; i += 1) dots.push(i);

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
          {label}
        </Text>
        <Text className="font-inter-semibold text-card-body text-text-primary dark:text-text-primary">
          {value}/{max}
        </Text>
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        {dots.map((d) => {
          const active = d <= value;
          return (
            <Pressable
              key={d}
              onPress={() => handlePress(d)}
              accessibilityRole="adjustable"
              accessibilityLabel={`${label} ${d}`}
              accessibilityValue={{ min, max, now: value }}
              hitSlop={8}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: active ? brand.gold : 'transparent',
                  borderWidth: 1.5,
                  borderColor: active ? brand.gold : idleColor,
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
