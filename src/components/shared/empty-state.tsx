import { View, Text } from 'react-native';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6" accessibilityRole="text">
      <Text className="font-playfair text-empty-title text-text-primary dark:text-text-primary text-center">
        {title}
      </Text>
      {description ? (
        <Text className="font-inter text-card-body text-text-muted mt-3 text-center">
          {description}
        </Text>
      ) : null}
      {action ? <View className="mt-6">{action}</View> : null}
    </View>
  );
}
