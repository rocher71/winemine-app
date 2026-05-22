/**
 * WMLogoWordmark — 앱 브랜드 워드마크 ("WineMine" PlayfairDisplay).
 *
 * 사용처: HomeHeader 로고 영역. 온보딩 등 브랜드 노출 화면에서도 사용 가능.
 * - 항상 PlayfairDisplay_700Bold (locale 무관 — 영문 브랜드 폰트 고정)
 * - 전체 검정색(#000000) — 랜딩 hero와 동일 스타일
 * - allowFontScaling={false}
 */
import { Text } from 'react-native';

export function WMLogoWordmark() {
  return (
    <Text
      allowFontScaling={false}
      style={{
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 24,
        letterSpacing: -0.5,
        color: '#000000',
      }}
    >
      WineMine
    </Text>
  );
}
