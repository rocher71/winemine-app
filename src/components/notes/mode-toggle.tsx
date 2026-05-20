import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';

export type NoteMode = 'beginner' | 'expert';

interface Props {
  value: NoteMode;
  onChange: (v: NoteMode) => void;
}

export function ModeToggle({ value, onChange }: Props) {
  const { t } = useTranslation();
  const handle = (next: NoteMode) => {
    if (next === value) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(next);
  };
  return (
    <View
      className="flex-row rounded-full bg-surface p-1"
      style={{ borderWidth: 1, borderColor: brand.gold }}
    >
      <ToggleOption
        active={value === 'beginner'}
        label={t('notes.writeForm.modeBeginner')}
        onPress={() => handle('beginner')}
      />
      <ToggleOption
        active={value === 'expert'}
        label={t('notes.writeForm.modeExpert')}
        onPress={() => handle('expert')}
      />
    </View>
  );
}

function ToggleOption({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      className={`flex-1 items-center justify-center rounded-full py-2 ${active ? 'bg-gold' : 'bg-transparent'}`}
    >
      <Text
        className={`font-inter-semibold text-card-body ${active ? 'text-bg-deepest' : 'text-text-secondary dark:text-text-secondary'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
