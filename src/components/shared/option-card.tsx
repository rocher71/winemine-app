import { Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brand, dark, light } from '@/lib/design-tokens';

interface OptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function OptionCard({
  title,
  description,
  selected,
  onPress,
  accessibilityLabel,
}: OptionCardProps) {
  const scheme = useColorScheme();
  const mutedColor = scheme === 'light' ? light.text.muted : dark.text.muted;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? title}
      className={`flex-row items-center justify-between rounded-md bg-surface px-4 py-4 ${
        selected ? 'border-2 border-gold' : 'border border-text-disabled'
      }`}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
    >
      <View className="flex-1 pr-3">
        <Text className="font-inter-semibold text-card-title text-text-primary dark:text-text-primary">
          {title}
        </Text>
        {description ? (
          <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-1">
            {description}
          </Text>
        ) : null}
      </View>
      {selected ? <Check size={20} strokeWidth={2.5} color={brand.gold} /> : <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: mutedColor }} />}
    </Pressable>
  );
}
