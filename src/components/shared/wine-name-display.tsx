import { View, Text } from 'react-native';
import { getLocalizedWineName } from '@/lib/lwin';
import { currentLocale } from '@/lib/i18n';

type Size = 'card' | 'title' | 'meta';

interface WineNameDisplayProps {
  lwin: string;
  name_ko: string | null;
  display_name: string;
  size?: Size;
  className?: string;
}

const SIZE_CLASS: Record<Size, string> = {
  card: 'text-card-title font-playfair text-text-primary dark:text-text-primary',
  title: 'text-page-title font-playfair text-text-primary dark:text-text-primary',
  meta: 'text-card-meta font-inter text-text-secondary dark:text-text-secondary',
};

export function WineNameDisplay({
  name_ko,
  display_name,
  size = 'card',
  className,
}: WineNameDisplayProps) {
  const locale = currentLocale();
  const { primary, needsEnFallbackChip } = getLocalizedWineName(locale, { name_ko, display_name });
  return (
    <View className="flex-row items-center" accessible accessibilityRole="text">
      <Text className={`${SIZE_CLASS[size]} ${className ?? ''}`} numberOfLines={2}>
        {primary}
      </Text>
      {needsEnFallbackChip ? (
        <View className="ml-2 rounded-lg border border-text-muted px-1">
          <Text className="text-card-meta font-inter text-text-muted">EN</Text>
        </View>
      ) : null}
    </View>
  );
}
