import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { brand, dark, light } from '@/lib/design-tokens';
import { useColorScheme } from 'react-native';

interface Props {
  fromYear: number | null;
  peakYear: number | null;
  toYear: number | null;
}

function clampRatio(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function DrinkingWindowBar({ fromYear, peakYear, toYear }: Props) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const trackColor = scheme === 'light' ? light.bg.map : dark.bg.map;

  if (!fromYear || !toYear || toYear < fromYear) {
    return (
      <View className="rounded-xl bg-surface px-4 py-4 mx-4">
        <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
          {t('wineDetail.drinkWindow.title')}
        </Text>
        <Text className="font-inter text-card-body text-text-muted dark:text-text-muted mt-2">
          {t('wineDetail.drinkWindow.empty')}
        </Text>
      </View>
    );
  }

  const currentYear = new Date().getFullYear();
  const span = toYear - fromYear || 1;
  const currentRatio = clampRatio((currentYear - fromYear) / span);
  let phaseKey: 'before' | 'during' | 'after' = 'during';
  if (currentYear < fromYear) phaseKey = 'before';
  else if (currentYear > toYear) phaseKey = 'after';

  return (
    <View className="rounded-xl bg-surface px-4 py-4 mx-4">
      <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
        {t('wineDetail.drinkWindow.title')}
      </Text>
      <View className="mt-3" style={{ height: 12, borderRadius: 6, backgroundColor: trackColor, overflow: 'hidden' }}>
        <LinearGradient
          colors={[brand.wineRedDeep, brand.gold, brand.wineRed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
        <View
          accessibilityLabel={String(currentYear)}
          style={{
            position: 'absolute',
            top: -3,
            left: `${currentRatio * 100}%`,
            width: 4,
            height: 18,
            marginLeft: -2,
            backgroundColor: brand.cream,
            borderRadius: 2,
          }}
        />
      </View>
      <View className="flex-row items-center justify-between mt-3">
        <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary">
          {t('wineDetail.drinkWindow.rangeLabel', { from: fromYear, to: toYear })}
        </Text>
        {peakYear ? (
          <Text className="font-inter text-card-meta text-gold">
            {t('wineDetail.drinkWindow.peakLabel', { peak: peakYear })}
          </Text>
        ) : null}
      </View>
      <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-2">
        {t(`wineDetail.drinkWindow.${phaseKey}`)}
      </Text>
    </View>
  );
}
