/**
 * MapCameo — 당신의 와인 지도 카드 (heavy 모드).
 *
 * 사양 home.md §2-1 line 90-98, §3-5:
 * - outer Pressable m 14_16_0, radius 14, overflow hidden, bg-bg-map, border-default
 * - header padding 12_14_0, items-baseline justify-between
 *   - left: title Playfair 14 cream / meta Inter 10 text-muted mt 2 "{N}개국 · {M}개 지역"
 *   - action "전체 →" Inter 10 600 gold tracking 0.4
 * - MiniMapPreview 컴포넌트 별도
 *
 * v0.1.0: /map 라우트 미구현 — onPress 시 router.push 호출하되 화면 없음 (404 또는 fallback).
 * 향후 (tabs)/map.tsx 추가 시 자동 연결.
 */
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { MiniMapPreview } from './mini-map-preview';

interface MapCameoProps {
  countries: number;
  regions: number;
}

export function MapCameo({ countries, regions }: MapCameoProps) {
  const { t } = useTranslation();
  const onPress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    // v0.1.0: /map 미구현 — fallback으로 settings 또는 가만. 일단 호출.
    try {
      router.push('/(tabs)/map' as never);
    } catch {
      // ignore (route 미존재)
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${t('home.mapCameo.title')} ${t('home.countriesRegions', { countries, regions })}`}
      className="bg-bg-map dark:bg-bg-map border border-border-default dark:border-border-default"
      style={{
        marginTop: 14,
        marginHorizontal: 16,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          paddingTop: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text
            className="font-playfair text-text-primary dark:text-text-primary"
            style={{ fontSize: 14 }}
          >
            {t('home.mapCameo.title')}
          </Text>
          <Text
            className="font-inter text-text-muted dark:text-text-muted"
            style={{ fontSize: 10, marginTop: 2 }}
            allowFontScaling={false}
          >
            {t('home.countriesRegions', { countries, regions })}
          </Text>
        </View>
        <Text
          className="font-inter-semibold"
          style={{ color: brand.gold, fontSize: 10, letterSpacing: 0.4 }}
          allowFontScaling={false}
        >
          {t('home.mapCameo.viewAll')}
        </Text>
      </View>
      <MiniMapPreview />
    </Pressable>
  );
}
