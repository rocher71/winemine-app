/**
 * BadgeDots — profile-me §1 ProfileHero BadgeDot ×5 + Overflow.
 *
 * v0.1.0 §10 D 결정: user_badges 테이블 부재 — 빈 배열 hardcoded.
 * v0.2.0 supabase user_badges 마이그레이션 후 props.badges로 데이터 흘려보내기.
 *
 * §0-2 light-only.
 *
 * §6 #5 platinum LinearGradient: 본 v0.1.0은 어차피 빈 배열이라 미사용.
 *   v0.2.0에서 platinum tier dot은 expo-linear-gradient (135deg, gold→cream).
 *
 * tier 색 — keyscreen profile-hero.tsx line 152~163 verbatim:
 *   - bronze   #A77044
 *   - silver   #C8C8D0
 *   - gold     #C9A84C  (= brand.gold)
 *   - platinum gradient (v0.1.0 단색 #D4B85C fallback — §6 #5)
 */
import { Text, View } from 'react-native';
import { brand, light, badge } from '@/lib/design-tokens';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export interface BadgeRef {
  id: string;
  tier: BadgeTier;
  /** a11y label (영문 권장 — v0.2.0 i18n 처리) */
  nameEn?: string;
}

interface Props {
  /** v0.1.0 기본 빈 배열. v0.2.0 user_badges 흘려보내기. */
  badges?: readonly BadgeRef[];
}

function tierColor(tier: BadgeTier): string {
  switch (tier) {
    case 'bronze':
      return badge.bronze;
    case 'silver':
      return badge.silver;
    case 'gold':
      return brand.gold;
    case 'platinum':
      // §6 #5 fallback 단색 (v0.1.0). v0.2.0에서 LinearGradient.
      return brand.goldSoft;
  }
}

export function BadgeDots({ badges = [] }: Props) {
  const visible = badges.slice(0, 5);
  const overflow = Math.max(0, badges.length - 5);

  if (visible.length === 0 && overflow === 0) {
    // v0.1.0 keyscreen verbatim — 빈 배열은 단순히 nothing 렌더.
    return null;
  }

  return (
    <>
      {visible.map((b) => (
        <View
          key={b.id}
          accessibilityRole="image"
          accessibilityLabel={b.nameEn ?? `${b.tier} badge`}
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: tierColor(b.tier),
            borderWidth: 1,
            borderColor: 'rgba(245,240,232,0.2)',
          }}
        />
      ))}
      {overflow > 0 ? (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            lineHeight: 14,
            color: light.text.muted,
          }}
        >
          +{overflow}
        </Text>
      ) : null}
    </>
  );
}
