import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'winemine.onboarded';

export async function isOnboarded(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY);
  return v === 'true';
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'true');
}

export async function resetOnboarded(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
