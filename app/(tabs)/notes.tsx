import { useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { brand } from '@/lib/design-tokens';

export default function NotesTab() {
  useFocusEffect(
    useCallback(() => {
      router.push('/notes/new');
    }, []),
  );
  return (
    <View className="flex-1 items-center justify-center bg-bg-deepest dark:bg-bg-deepest">
      <ActivityIndicator color={brand.gold} />
    </View>
  );
}
