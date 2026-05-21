/**
 * ProfileHero — profile-me §3-4 ~ §3-8 사양 변환.
 *
 * 키스크린 원본: src/components/profile/profile-hero.tsx (163 LOC).
 *
 * 카드 구조:
 *   Outer card (margin 16 padding 16 radius 18 surface border)
 *     Row 1 (Avatar 64 + Col [DisplayName / LevelPill + BadgeDots + Overflow / JoinedFor])
 *     LevelProgressBar (별도 컴포넌트)
 *     RankingDetailLink (Award + label + ChevronRight)
 *
 * §6 #4 avatarInitial: profile.anonymous_display 첫 글자 대문자 ('velvety-fox-37' → 'V').
 * §6 #5 BadgeDots v0.1.0 빈 배열 (§10 D).
 * §6 #13 brand.gold light 명도 verbatim (Award icon).
 * §4-5 anonymization: raw UUID 노출 X. anonymous_display 만 표시.
 * §4-11 3-layer Pressable (RankingDetailLink).
 *
 * §0-2 light-only.
 */
import { Pressable, Text, View } from 'react-native';
import { Award, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, level as levelColors, light } from '@/lib/design-tokens';
import { LevelProgressBar } from './level-progress-bar';
import { BadgeDots, type BadgeRef } from './badge-dots';

interface Props {
  anonymousDisplay: string;
  levelId: 1 | 2 | 3 | 4 | 5;
  xp: number;
  joinedAt: string | null;
  /** v0.1.0 기본 빈 배열 (§10 D). */
  badges?: readonly BadgeRef[];
  /** Ranking detail 진입. v0.1.0 §10 G 보류 → 부모가 Toast 등으로 처리. */
  onPressRankingDetail?: () => void;
}

/** months since ISO date string → keyscreen monthsSince() verbatim. */
function monthsSince(iso: string | null): number {
  if (!iso) return 0;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 0;
  const now = new Date();
  return (
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth())
  );
}

function avatarInitial(anonymous: string): string {
  const first = anonymous?.charAt(0) ?? '';
  return first ? first.toUpperCase() : '?';
}

/** LevelPill 색 — keyscreen level-pill.tsx levelStyle verbatim (light 모드 적용).
 *  하드코딩 hex 회피 — 모든 색은 brand.* / level.* 토큰 직접 참조 (§4-9). */
function levelPillStyle(level: 1 | 2 | 3 | 4 | 5): { bg: string; fg: string } {
  switch (level) {
    case 1:
      // keyscreen #F5F0E8 = brand.cream
      return { bg: brand.cream, fg: brand.deepestDark };
    case 2:
      // keyscreen #D4B85C = brand.goldSoft
      return { bg: brand.goldSoft, fg: brand.deepestDark };
    case 3:
      // keyscreen #C9A84C = brand.gold
      return { bg: brand.gold, fg: brand.deepestDark };
    case 4:
      // keyscreen #8B1A2A = brand.wineRed
      return { bg: brand.wineRed, fg: brand.cream };
    case 5:
      // L5는 LinearGradient를 사용해야 하나, 작은 inline pill 안은 단색 fallback이 자연.
      // level.L5 = #A02030 (brand.wineRedHover와 동일).
      return { bg: levelColors.L5, fg: brand.cream };
  }
}

export function ProfileHero({
  anonymousDisplay,
  levelId,
  xp,
  joinedAt,
  badges = [],
  onPressRankingDetail,
}: Props) {
  const { t } = useTranslation();

  const months = monthsSince(joinedAt);
  const initial = avatarInitial(anonymousDisplay);
  const pill = levelPillStyle(levelId);

  const handlePressRanking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    onPressRankingDetail?.();
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 18,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Row 1: Avatar + Col */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
      >
        {/* Avatar 64×64 wine-red circle — borderRadius: 32 (= 64/2) §4-10 명시값 */}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: brand.wineRed,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 28,
              lineHeight: 33,
              color: brand.cream,
            }}
          >
            {initial}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          {/* DisplayName — anonymous_display verbatim (§4-5 raw UUID 노출 X) */}
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 20,
              lineHeight: 24,
              color: light.text.primary,
              marginBottom: 6,
            }}
          >
            {anonymousDisplay}
          </Text>

          {/* LevelPill + BadgeDots + Overflow */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {/* LevelPill — keyscreen verbatim small size */}
            <View
              accessibilityLabel={t('profile.a11y.level', { level: levelId })}
              style={{
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: 12,
                backgroundColor: pill.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontWeight: '600',
                  fontSize: 10,
                  lineHeight: 10,
                  color: pill.fg,
                }}
              >
                L{levelId}
              </Text>
            </View>
            <BadgeDots badges={badges} />
          </View>

          {/* JoinedFor */}
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              lineHeight: 14,
              color: light.text.muted,
              marginTop: 6,
            }}
          >
            {t('profile.joinedFor', { months })}
          </Text>
        </View>
      </View>

      {/* LevelProgressBar — 별도 컴포넌트 */}
      <LevelProgressBar xp={xp} />

      {/* RankingDetailLink — §4-11 3-layer Pressable */}
      <Pressable
        onPress={handlePressRanking}
        accessibilityRole="button"
        accessibilityLabel={t('profile.rankingDetailCta')}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: 'rgba(201,168,76,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(201,168,76,0.25)',
            marginTop: 4,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Award size={16} color={brand.gold} />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontWeight: '500',
                fontSize: 13,
                lineHeight: 16,
                color: light.text.primary,
              }}
            >
              {t('profile.rankingDetailCta')}
            </Text>
          </View>
          <ChevronRight size={16} color={light.text.muted} />
        </View>
      </Pressable>
    </View>
  );
}
