import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ChevronRight, Wine } from 'lucide-react-native';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  cellaredCount: number;
}

export function CellarSummarySection({ cellaredCount }: Props) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  // Round 8 패턴 (§4-11): Pressable은 hit target만, layout/visual은 inner View.
  return (
    <View>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          color: tokens.text.secondary,
          textTransform: 'uppercase',
          fontSize: 11,
        }}
      >
        {t('home.heavy.cellarSummary')}
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/cellar')}
        accessibilityRole="button"
        accessibilityLabel={t('home.heavy.viewAll')}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 12,
            backgroundColor: tokens.bg.surface,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Wine size={22} strokeWidth={1.5} color={brand.gold} />
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: tokens.text.primary,
                marginLeft: 12,
              }}
            >
              {t('home.heavy.cellaredCount', { count: cellaredCount })}
            </Text>
          </View>
          <ChevronRight size={20} strokeWidth={2} color={brand.gold} />
        </View>
      </Pressable>
    </View>
  );
}
