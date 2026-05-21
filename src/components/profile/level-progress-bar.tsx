/**
 * LevelProgressBar — profile-me §3-7 사양 변환.
 *
 * 키스크린 원본: src/components/shared/level-progress-bar.tsx (104 LOC).
 *
 * §0-2 light-only: useColorScheme 호출 X.
 *
 * 3-layer Pressable (§4-11):
 *   <Pressable onPress style={({pressed}) => ({opacity})}>
 *     <View style={{ paddingVertical, width: '100%' }}>  visual outer
 *       header row (LeftGroup + ProgressText)
 *       Track (overflow hidden)
 *         BarFill (LinearGradient)
 *
 * §6 deviations:
 *   #7 LevelDot 안 글자 색 — keyscreen verbatim brand.deepestDark
 *   #8 transition width 400ms → 정적 (v0.1.0)
 *   #9 CSS linear-gradient → expo-linear-gradient horizontal
 *   #10 boxShadow → shadow 4속성 + elevation
 */
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { brand, level as levelColors, light } from '@/lib/design-tokens';
import { LEVELS } from '@/lib/levels';
import { xpToLevel } from '@/lib/xp';

interface Props {
  xp: number;
  onPress?: () => void;
}

export function LevelProgressBar({ xp, onPress }: Props) {
  const { t } = useTranslation();
  const { levelId, progressPct } = xpToLevel(xp);
  // LEVELS는 항상 5개 — idx clamp + non-null assertion.
  const levelMeta = (LEVELS[levelId - 1] ?? LEVELS[0])!;
  const nextLevel = levelId < 5 ? LEVELS[levelId] ?? null : null;
  const isMax = levelMeta.maxXp === null;
  const levelColor = levelColors[`L${levelId}` as keyof typeof levelColors];
  const levelName = t(`levels.${levelId}.name`);

  // a11y label 풀버전 — 화면 리더용
  const a11yLabel = isMax
    ? `${levelName}, ${t('levels.maxed')}`
    : t('profile.a11y.progress', {
        name: levelName,
        current: xp,
        next: nextLevel?.minXp ?? xp,
      });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      disabled={!onPress}
      style={({ pressed }) => ({ opacity: pressed && onPress ? 0.85 : 1 })}
    >
      <View style={{ width: '100%', paddingVertical: 4 }}>
        {/* Header row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            {/* LevelDot 24×24 — §6 #7 verbatim deepestDark text */}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: levelColor,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontWeight: '700',
                  fontSize: 11,
                  lineHeight: 13,
                  color: brand.deepestDark,
                }}
              >
                {levelId}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontWeight: '600',
                fontSize: 13,
                lineHeight: 15.6,
                color: light.text.primary,
              }}
            >
              {levelName}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              lineHeight: 14.4,
              color: light.text.muted,
            }}
          >
            {isMax
              ? t('levels.maxed')
              : t('levels.progress', {
                  current: xp,
                  next: nextLevel?.minXp ?? xp,
                })}
          </Text>
        </View>

        {/* Track 6px */}
        <View
          style={{
            width: '100%',
            height: 6,
            backgroundColor: light.border.default,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* BarFill — expo-linear-gradient 90deg gold→cream */}
          <LinearGradient
            colors={[brand.gold, brand.cream]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: `${progressPct}%`,
              height: '100%',
              borderRadius: 3,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
}
