/**
 * StoryImage — wine-story 화면 hero placeholder.
 *
 * 사양: _workspace/design-specs/wine-story.md §3-3.
 *
 * keyscreen src/components/wine-story/story-image.tsx verbatim 변환:
 *   - linear-gradient(160deg, ${bottleColor} 0%, ${endColor} 100%)
 *   - radial-gradient overlay (skip — §6 #3 deviation)
 *   - Grape 아이콘 (position absolute, right 24, bottom 24, opacity 0.18)
 *
 * Light-only 화면 — 모든 색은 light.* 또는 brand.* 토큰.
 *
 * Hero 끝점 색 (§10 결정 F): `light.bg.deepest` (#FAF5EC) verbatim 적용. 분위기는
 * 약하지만 라이트 모드 일관성 우선. (alt 결정은 v0.2.0 으로 미룸.)
 *
 * §6 #2 angle 160deg approximation: RN expo-linear-gradient 는 angle prop 없음.
 *   sin(160°)=0.342, cos(160°)=-0.940 → 시각 등가 좌표:
 *   start={x:0, y:0}, end={x:0.342, y:0.94}
 *   (다른 컴포넌트의 cellarDetailHeroGradient 와 동일한 좌표.)
 */
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Grape } from 'lucide-react-native';
import { brand, light } from '@/lib/design-tokens';

interface StoryImageProps {
  bottleColor?: string;
  height?: number;
}

export function StoryImage({
  bottleColor = brand.wineRedDeep,
  height = 220,
}: StoryImageProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: 'relative',
        height,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: light.border.default,
      }}
    >
      <LinearGradient
        colors={[bottleColor, light.bg.deepest]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.342, y: 0.94 }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 24,
          bottom: 24,
        }}
      >
        <Grape
          size={120}
          strokeWidth={1}
          color={brand.gold}
          style={{ opacity: 0.18 }}
        />
      </View>
    </View>
  );
}
