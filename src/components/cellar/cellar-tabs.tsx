import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import type { CellarStatus } from '@/hooks/use-cellar';

interface Props {
  value: CellarStatus;
  onChange: (v: CellarStatus) => void;
}

function Tab({
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
      className="flex-1 items-center pb-3"
    >
      <Text
        className={`font-inter-semibold text-card-body ${
          active ? 'text-text-primary dark:text-text-primary' : 'text-text-muted dark:text-text-muted'
        }`}
      >
        {label}
      </Text>
      {active ? (
        <View
          className="mt-2"
          style={{ height: 2, width: 32, backgroundColor: brand.gold, borderRadius: 1 }}
        />
      ) : (
        <View className="mt-2" style={{ height: 2, width: 32 }} />
      )}
    </Pressable>
  );
}

export function CellarTabs({ value, onChange }: Props) {
  const { t } = useTranslation();
  const handle = (next: CellarStatus) => {
    if (next === value) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(next);
  };
  return (
    <View className="flex-row px-4 pt-2">
      <Tab
        active={value === 'cellared'}
        label={t('cellar.tabs.cellared')}
        onPress={() => handle('cellared')}
      />
      <Tab
        active={value === 'consumed'}
        label={t('cellar.tabs.consumed')}
        onPress={() => handle('consumed')}
      />
    </View>
  );
}
