import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { level as levelColors } from '@/lib/design-tokens';

type Size = 'sm' | 'md';
export type LevelId = 1 | 2 | 3 | 4 | 5;

interface LevelPillProps {
  level: LevelId;
  size?: Size;
}

const HEIGHT: Record<Size, string> = { sm: 'h-5', md: 'h-6' };
const PADDING: Record<Size, string> = { sm: 'px-2', md: 'px-3' };

export function LevelPill({ level, size = 'md' }: LevelPillProps) {
  const { t } = useTranslation();
  const color = levelColors[`L${level}` as keyof typeof levelColors];
  return (
    <View
      className={`${HEIGHT[size]} ${PADDING[size]} flex-row items-center rounded-full`}
      style={{ backgroundColor: color }}
      accessibilityRole="text"
      accessibilityLabel={t(`level.L${level}`)}
    >
      <Text className="font-inter-semibold text-[11px] text-cream">
        {t(`level.L${level}`)}
      </Text>
    </View>
  );
}
