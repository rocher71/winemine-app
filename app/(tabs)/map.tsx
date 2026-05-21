/**
 * /map — World Map placeholder (v0.2.0 구현 예정)
 *
 * 출처: _workspace/design-specs/bottom-nav.md §11.
 * v0.1.0은 라우트만 등록 + EmptyState 1줄.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

// TODO(v0.2.0): World Map 구현 (대륙 SVG + 와인 dot + cluster)
export default function MapPlaceholder() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-bg-deepest dark:bg-bg-deepest">
      <Text className="font-inter text-card-body text-text-muted dark:text-text-muted">
        {t('common.empty')}
      </Text>
    </View>
  );
}
