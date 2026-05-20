import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ReactNode } from 'react';

interface AppHeaderProps {
  title: string;
  right?: ReactNode;
}

export function AppHeader({ title, right }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="bg-bg-deepest dark:bg-bg-deepest flex-row items-center justify-between px-4"
      style={{ paddingTop: insets.top, height: insets.top + 56 }}
    >
      <Text className="font-playfair text-page-title text-text-primary dark:text-text-primary">
        {title}
      </Text>
      {right ?? null}
    </View>
  );
}
