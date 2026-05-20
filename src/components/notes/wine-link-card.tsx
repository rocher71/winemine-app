import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Wine } from 'lucide-react-native';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import { brand, type TypeCanonical } from '@/lib/design-tokens';
import type { WineLocalized } from '@/hooks/use-wine';

const TYPE_CANONICAL: ReadonlySet<TypeCanonical> = new Set([
  'red',
  'white',
  'rose',
  'sparkling',
  'fortified',
  'dessert',
]);

function asTypeCanonical(value: string | null | undefined): TypeCanonical | null {
  if (value && TYPE_CANONICAL.has(value as TypeCanonical)) return value as TypeCanonical;
  return null;
}

interface Props {
  wine: WineLocalized | null;
}

export function WineLinkCard({ wine }: Props) {
  const { t } = useTranslation();

  if (!wine?.lwin || !wine?.display_name) {
    return (
      <Pressable
        onPress={() => router.replace('/(tabs)/capture')}
        accessibilityRole="button"
        accessibilityLabel={t('notes.writeForm.wineLinkCaptureCta')}
        className="flex-row items-center rounded-md bg-surface px-4 py-4"
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(201,168,76,0.12)' }}
        >
          <Wine size={20} strokeWidth={1.8} color={brand.gold} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-inter-semibold text-card-body text-text-primary dark:text-text-primary">
            {t('notes.writeForm.wineLinkEmpty')}
          </Text>
          <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-1">
            {t('notes.writeForm.wineLinkCaptureCta')}
          </Text>
        </View>
      </Pressable>
    );
  }

  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(asTypeCanonical(wine.type_canonical));
  const vintage = wine.vintage ?? parseLwinVintage(wine.lwin);

  return (
    <View className="flex-row items-center rounded-md bg-surface px-4 py-3">
      <View
        style={{ width: 56, height: 80, backgroundColor: bottleColor, borderRadius: 6 }}
      />
      <View className="ml-3 flex-1">
        <WineNameDisplay
          lwin={wine.lwin}
          name_ko={wine.name_ko}
          display_name={wine.display_name}
          size="card"
        />
        {wine.producer_name ? (
          <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary mt-1" numberOfLines={1}>
            {wine.producer_name}
          </Text>
        ) : null}
        {vintage ? (
          <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-1">
            {vintage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
