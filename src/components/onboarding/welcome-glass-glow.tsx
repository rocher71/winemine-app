/**
 * WelcomeGlassGlow — 90×90 radial glow + GlassWater 아이콘 overlay.
 *
 * 사양 onboarding-1-welcome.md §1 (line 46~53) + §6 (deviation 표):
 *   - frame 90×90, borderRadius 45 (full)
 *   - radial-gradient(circle at 50% 35%,
 *       rgba(245,240,232,0.18) 0%,    ← brand.cream alpha 0.18
 *       rgba(139,26,42,0.18)   60%,   ← brand.wineRed alpha 0.18
 *       rgba(0,0,0,0)         100%)   ← transparent
 *   - GlassWater 아이콘 size 56, strokeWidth 1.25, color = brand.gold
 *
 * RN deviation: react-native-svg <Defs><RadialGradient> + <Circle fill="url(#glow)"/>
 * + absolute positioned GlassWater overlay (lucide-react-native).
 *
 * 토큰 사용: brand.cream / brand.wineRed / brand.gold + withAlpha helper.
 * 하드코딩 hex/rgba 0 — design-tokens.ts 통과만 사용.
 */
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { GlassWater } from 'lucide-react-native';
import { brand, withAlpha } from '@/lib/design-tokens';

const FRAME = 90;
const ICON = 56;

export function WelcomeGlassGlow() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: FRAME,
        height: FRAME,
        borderRadius: FRAME / 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
      }}
    >
      {/* radial-gradient 배경 — 키스크린 verbatim */}
      <Svg
        width={FRAME}
        height={FRAME}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Defs>
          {/* circle at 50% 35% → cx=50%, cy=35%; rx/ry 50% (큰 원) */}
          <RadialGradient
            id="welcomeGlassGlow"
            cx="50%"
            cy="35%"
            rx="50%"
            ry="50%"
            fx="50%"
            fy="35%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={withAlpha(brand.cream, 0.18)} />
            <Stop offset="60%" stopColor={withAlpha(brand.wineRed, 0.18)} />
            <Stop offset="100%" stopColor={withAlpha(brand.black, 0)} />
          </RadialGradient>
        </Defs>
        <Circle cx={FRAME / 2} cy={FRAME / 2} r={FRAME / 2} fill="url(#welcomeGlassGlow)" />
      </Svg>

      {/* GlassWater 아이콘 overlay (frame 정중앙) */}
      <GlassWater size={ICON} strokeWidth={1.25} color={brand.gold} />
    </View>
  );
}
