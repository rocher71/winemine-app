import { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Check, RotateCcw } from 'lucide-react-native';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import { brand, type TypeCanonical } from '@/lib/design-tokens';
import type { CellarItemWithWine, CellarStatus } from '@/hooks/use-cellar';

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
  item: CellarItemWithWine;
  onSwipeAction: (next: CellarStatus) => void;
}

export function CellarCard({ item, onSwipeAction }: Props) {
  const { t } = useTranslation();
  const wine = item.wine;
  const swipeRef = useRef<Swipeable>(null);

  if (!wine?.lwin || !wine?.display_name) return null;

  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(asTypeCanonical(wine.type_canonical));
  const vintage = wine.vintage ?? parseLwinVintage(wine.lwin);
  const isCellared = item.status === 'cellared';
  const nextStatus: CellarStatus = isCellared ? 'consumed' : 'cellared';
  const actionLabel = isCellared
    ? t('cellar.swipe.markConsumed')
    : t('cellar.swipe.undoConsumed');
  const ActionIcon = isCellared ? Check : RotateCcw;
  const actionBg = isCellared ? brand.wineRed : brand.gold;

  const renderRightActions = () => (
    <Pressable
      onPress={() => {
        swipeRef.current?.close();
        onSwipeAction(nextStatus);
      }}
      accessibilityRole="button"
      accessibilityLabel={actionLabel}
      className="items-center justify-center"
      style={{ width: 80, backgroundColor: actionBg }}
    >
      <ActionIcon size={20} strokeWidth={2} color={brand.cream} />
      <Text className="font-inter text-[10px] text-cream mt-1" numberOfLines={2}>
        {actionLabel}
      </Text>
    </Pressable>
  );

  const openDetail = () => {
    router.push(
      `/(tabs)/cellar/${encodeURIComponent(wine.lwin ?? '')}?id=${encodeURIComponent(item.id)}`,
    );
  };

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable
        onPress={openDetail}
        accessibilityRole="button"
        className="flex-row items-center bg-surface px-3 py-3"
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
      >
        <View
          style={{
            width: 64,
            height: 96,
            backgroundColor: bottleColor,
            borderRadius: 6,
          }}
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
          <View className="mt-1 flex-row flex-wrap gap-2">
            {vintage ? (
              <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted">
                {vintage}
              </Text>
            ) : null}
            {wine.country ? (
              <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted">
                {wine.country}
              </Text>
            ) : null}
          </View>
          <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-1">
            {isCellared
              ? `${t('cellar.meta.acquiredAt')} ${item.acquired_at}`
              : `${t('cellar.meta.consumedAt')} ${item.consumed_at ?? ''}`}
            {typeof item.purchase_price_krw === 'number'
              ? `  ·  ${item.purchase_price_krw.toLocaleString()} ${t('cellar.meta.price')}`
              : ''}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}
