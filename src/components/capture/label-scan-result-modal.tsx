import { Modal, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { PrimaryButton } from '@/components/shared/primary-button';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import { brand, dark, light, type TypeCanonical } from '@/lib/design-tokens';

interface Wine {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  producer_name: string | null;
  bottle_color: string | null;
  type_canonical: string | null;
  vintage: number | null;
}

interface Props {
  visible: boolean;
  wine: Wine | null;
  onWriteNote: () => void;
  onRetry: () => void;
  onClose: () => void;
}

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

export function LabelScanResultModal({ visible, wine, onWriteNote, onRetry, onClose }: Props) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const iconColor = scheme === 'light' ? light.text.primary : dark.text.primary;

  if (!wine) return null;

  const vintage = wine.vintage ?? parseLwinVintage(wine.lwin);
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(asTypeCanonical(wine.type_canonical));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 items-center justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      >
        <View className="w-full rounded-t-md bg-bg-deep dark:bg-bg-deep px-5 pb-8 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter text-card-meta text-gold uppercase">
              {t('capture.result.title')}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={12}
            >
              <X size={20} strokeWidth={2} color={iconColor} />
            </Pressable>
          </View>
          <Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary mt-1">
            {t('capture.result.subtitle')}
          </Text>

          <View className="mt-5 flex-row items-start gap-4 rounded-xl bg-surface p-4">
            <View
              style={{
                width: 64,
                height: 96,
                backgroundColor: bottleColor,
                borderRadius: 6,
              }}
            />
            <View className="flex-1">
              <WineNameDisplay
                lwin={wine.lwin}
                name_ko={wine.name_ko}
                display_name={wine.display_name}
                size="title"
              />
              {wine.producer_name ? (
                <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary mt-2">
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

          <View className="mt-5 gap-3">
            <PrimaryButton
              label={t('capture.result.writeNote')}
              size="lg"
              variant="primary"
              onPress={onWriteNote}
            />
            <PrimaryButton
              label={t('capture.result.retry')}
              size="md"
              variant="secondary"
              onPress={onRetry}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
