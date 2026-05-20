import { View, Text } from 'react-native';

type Tone = 'info' | 'success' | 'error';

interface ToastProps {
  message: string;
  tone?: Tone;
}

const TONE_BG: Record<Tone, string> = {
  info: 'bg-surface dark:bg-surface',
  success: 'bg-status-success',
  error: 'bg-status-error dark:bg-status-error',
};

export function Toast({ message, tone = 'info' }: ToastProps) {
  return (
    <View
      className={`${TONE_BG[tone]} h-12 items-center justify-center rounded-lg px-4`}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text className="font-inter text-[13px] text-cream">{message}</Text>
    </View>
  );
}
