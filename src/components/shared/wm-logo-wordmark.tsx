/**
 * WMLogoWordmark — 앱 브랜드 워드마크 ("Wine" + "Mine" PlayfairDisplay).
 *
 * 사용처: HomeHeader 로고 영역. 온보딩 등 브랜드 노출 화면에서도 사용 가능.
 * - 항상 PlayfairDisplay_400Regular (locale 무관 — 영문 브랜드 폰트 고정)
 * - "Wine" = light.text.primary(cream) / "Mine" = brand.gold
 * - allowFontScaling={false}
 */
import { Text } from 'react-native';
import { brand, light } from '@/lib/design-tokens';

export function WMLogoWordmark() {
  return (
    <Text
      allowFontScaling={false}
      style={{
        fontFamily: 'PlayfairDisplay_400Regular',
        fontSize: 18,
        letterSpacing: -0.18,
        color: light.text.primary,
      }}
    >
      Wine
      <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', color: brand.gold }}>
        Mine
      </Text>
    </Text>
  );
}
