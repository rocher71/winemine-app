import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { parseLwinVintage } from '@/lib/lwin';

interface Props {
  lwin: string;
  producer_name: string | null;
  region: string | null;
  country: string | null;
  classification: string | null;
  vintage: number | null;
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-xl bg-surface px-3 py-3">
      <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted uppercase">
        {label}
      </Text>
      <Text
        className="font-inter text-card-body text-text-primary dark:text-text-primary mt-1"
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export function WineMeta({
  lwin,
  producer_name,
  region,
  country,
  classification,
  vintage,
}: Props) {
  const { t } = useTranslation();
  const unknown = t('wineDetail.meta.unknown');
  const resolvedVintage = vintage ?? parseLwinVintage(lwin);

  return (
    <View className="gap-3 px-4">
      <View className="flex-row gap-3">
        <MetaCell label={t('wineDetail.meta.producer')} value={producer_name ?? unknown} />
        <MetaCell label={t('wineDetail.meta.vintage')} value={resolvedVintage ? String(resolvedVintage) : unknown} />
      </View>
      <View className="flex-row gap-3">
        <MetaCell label={t('wineDetail.meta.region')} value={region ?? unknown} />
        <MetaCell label={t('wineDetail.meta.country')} value={country ?? unknown} />
      </View>
      {classification ? (
        <View className="flex-row gap-3">
          <MetaCell label={t('wineDetail.meta.classification')} value={classification} />
          <View className="flex-1" />
        </View>
      ) : null}
    </View>
  );
}
