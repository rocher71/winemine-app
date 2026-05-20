import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/shared/primary-button';

interface Props {
  acquiredAt: string;
  consumedAt: string | null;
  storage: string | null;
  purchasePriceKrw: number | null;
  quantity: number;
  status: 'cellared' | 'consumed';
  onEdit: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted uppercase">
        {label}
      </Text>
      <Text
        className="font-inter text-card-body text-text-primary dark:text-text-primary"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export function CellarFields({
  acquiredAt,
  consumedAt,
  storage,
  purchasePriceKrw,
  quantity,
  status,
  onEdit,
}: Props) {
  const { t } = useTranslation();
  const priceLabel =
    typeof purchasePriceKrw === 'number'
      ? `${purchasePriceKrw.toLocaleString()} ${t('cellar.meta.price')}`
      : t('cellar.detail.priceEmpty');

  return (
    <View className="rounded-xl bg-surface px-4 py-3 mx-4">
      <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
        {t('cellar.detail.section.info')}
      </Text>
      <View className="mt-1">
        <Row label={t('cellar.meta.acquiredAt')} value={acquiredAt} />
        {status === 'consumed' ? (
          <Row label={t('cellar.meta.consumedAt')} value={consumedAt ?? ''} />
        ) : null}
        <Row label={t('cellar.add.storage')} value={storage ?? t('cellar.detail.storageEmpty')} />
        <Row label={t('cellar.detail.quantity')} value={String(quantity)} />
        <Row label={t('cellar.add.purchasePrice')} value={priceLabel} />
      </View>
      <View className="mt-3">
        <PrimaryButton
          label={t('cellar.detail.edit')}
          size="md"
          variant="secondary"
          onPress={onEdit}
        />
      </View>
    </View>
  );
}
