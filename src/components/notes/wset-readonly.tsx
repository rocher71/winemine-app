import { View, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { brand, dark, light } from '@/lib/design-tokens';

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
}

export function WSETReadOnly({ label, value, min = 1, max = 5 }: Props) {
  const scheme = useColorScheme();
  const idleColor = scheme === 'light' ? light.text.disabled : dark.text.disabled;

  const dots: number[] = [];
  for (let i = min; i <= max; i += 1) dots.push(i);

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
          {label}
        </Text>
        <Text className="font-inter-semibold text-card-meta text-text-primary dark:text-text-primary">
          {value}/{max}
        </Text>
      </View>
      <View className="mt-2 flex-row items-center gap-1">
        {dots.map((d) => {
          const active = d <= value;
          return (
            <View
              key={d}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: active ? brand.gold : idleColor,
                opacity: active ? 1 : 0.4,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
