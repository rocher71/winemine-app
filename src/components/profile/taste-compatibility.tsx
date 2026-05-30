/**
 * TasteCompatibility — profile-other §N-2 신규 컴포넌트.
 *
 * handoff `OtherUserScreen` line 196~218.
 * gold tint 카드 + conic gradient 도넛(56×56) + title/desc/shared counts.
 *
 * §6 #3 bg: gold tint LinearGradient (withAlpha(gold,0.1) → surface).
 * §6 #4 border: withAlpha(brand.gold, 0.33) (handoff `gold55`).
 * §6 #7 / §N-2a: conic gradient → react-native-svg Circle strokeDasharray (옵션 A).
 *   - 56×56, stroke 6, r = (56-6)/2 = 25, circumference = 2πr ≈ 157.08
 *   - gold arc length = circumference × score/100; 나머지 track light.bg.deep
 *   - rotate -90 (12시 방향 시작 — handoff conic 0% = 상단)
 *   - center 숫자는 SVG 위 absolute RN Text overlay (폰트 일관성)
 * §4-10: conic→SVG 변환, inner hole absolute inset 6 verbatim OK.
 *
 * §0-2 light-only.
 */
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { brand, light, withAlpha } from '@/lib/design-tokens';

interface TasteCompatibilityProps {
  /** 0~100 일치도 점수 */
  score: number;
  /** 설명 텍스트 (i18n 조립 문장) */
  description: string;
  sharedWinesCount: number;
  sharedRegionsCount: number;
}

const DONUT = 56;
const STROKE = 6;
const R = (DONUT - STROKE) / 2; // 25
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 157.08

export function TasteCompatibility({
  score,
  description,
  sharedWinesCount,
  sharedRegionsCount,
}: TasteCompatibilityProps) {
  const { t } = useTranslation();

  const clamped = Math.max(0, Math.min(100, score));
  const goldArc = (CIRCUMFERENCE * clamped) / 100;

  const sharedLine = `${t('profile.other.sharedWines', {
    count: sharedWinesCount,
  })} · ${t('profile.other.sharedRegions', { count: sharedRegionsCount })}`;

  return (
    <LinearGradient
      colors={[withAlpha(brand.gold, 0.1), light.bg.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        marginHorizontal: 16,
        marginTop: 6,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: withAlpha(brand.gold, 0.33),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {/* Donut 56×56 — SVG arc + center number overlay */}
        <View
          accessibilityLabel={t('profile.a11y.compatibility', { score: clamped })}
          style={{ width: DONUT, height: DONUT }}
        >
          <Svg width={DONUT} height={DONUT} viewBox={`0 0 ${DONUT} ${DONUT}`}>
            {/* track */}
            <Circle
              cx={DONUT / 2}
              cy={DONUT / 2}
              r={R}
              fill="none"
              stroke={light.bg.deep}
              strokeWidth={STROKE}
            />
            {/* gold arc */}
            <Circle
              cx={DONUT / 2}
              cy={DONUT / 2}
              r={R}
              fill="none"
              stroke={brand.gold}
              strokeWidth={STROKE}
              strokeDasharray={`${goldArc} ${CIRCUMFERENCE}`}
              strokeLinecap="butt"
              transform={`rotate(-90 ${DONUT / 2} ${DONUT / 2})`}
            />
          </Svg>
          {/* center score */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 18,
                lineHeight: 21.6,
                color: light.text.primary,
              }}
            >
              {clamped}
            </Text>
          </View>
        </View>

        {/* Text col */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 14,
              lineHeight: 16.8,
              color: light.text.primary,
            }}
          >
            {t('profile.other.tasteCompatibility')}
          </Text>
          {description ? (
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                lineHeight: 16.5,
                color: light.text.secondary,
                marginTop: 2,
              }}
            >
              {description}
            </Text>
          ) : null}
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              lineHeight: 16.5,
              color: light.text.muted,
              marginTop: description ? 2 : 0,
            }}
          >
            {sharedLine}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
