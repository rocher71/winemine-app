/**
 * ContributorsList — 추정자 목록 (sort toggle + contributor rows).
 *
 * 사양: wine-community-peak.md §3-5.
 *
 * §10 결정:
 *   - H: sort active 배경 = light.border.active (wine-prices §10 H 동일 — gold)
 *   - M: anonIdFor 해시 범위 = 1~999 (충돌률 감소)
 *
 * Light-only — wine-community-peak.md §0-2.
 * §4-11 3-layer Pressable 패턴 (SortBtn).
 * 닉네임 미노출 — keyscreen verbatim "LevelName #{1~999}" 패턴 (CLAUDE.md §4-5 준수).
 */
import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, light, level as levelColors } from '@/lib/design-tokens';
import { LEVELS_BY_ID } from '@/lib/mock/levels';
import type {
  CommunityPeakEstimate,
  ConfidenceLevel,
} from '@/lib/mock/community-peaks';

type SortKey = 'recent' | 'levelDesc';

interface ContributorsListProps {
  estimates: CommunityPeakEstimate[];
}

/**
 * 결정적 익명 정수 — userId 해시 기반.
 *
 * §10 M (b): 1~999 범위 (~360 entries 중 충돌 ~7%).
 * keyscreen 1~99 (충돌 ~64%) 대비 익명성 + 가독성 trade-off.
 *
 * userId 자체는 미노출 — CLAUDE.md §4-5 (UUID 공개 금지) 준수.
 */
function anonIdFor(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 999) + 1;
}

const CONFIDENCE_COLOR: Record<
  ConfidenceLevel,
  { bg: string; fg: string; key: string }
> = {
  low: {
    bg: 'rgba(155,139,122,0.18)',
    fg: light.text.muted,
    key: 'low',
  },
  medium: {
    // §6 #10: keyscreen brand.gold alpha → light.border.active alpha (light 모드 대비).
    bg: 'rgba(184,148,56,0.18)',
    fg: light.border.active,
    key: 'medium',
  },
  high: {
    bg: 'rgba(139,26,42,0.25)',
    fg: brand.wineRedHover,
    key: 'high',
  },
};

export function ContributorsList({ estimates }: ContributorsListProps) {
  const { t } = useTranslation();
  const [sort, setSort] = useState<SortKey>('recent');

  const sorted = useMemo(() => {
    const arr = [...estimates];
    if (sort === 'recent') {
      arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      arr.sort((a, b) => b.reviewerLevel - a.reviewerLevel);
    }
    return arr;
  }, [estimates, sort]);

  // keyscreen line 37 — estimates 0 → return null (Section C 자체 숨김).
  if (estimates.length === 0) return null;

  const handleSortPress = (k: SortKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    setSort(k);
  };

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_6SemiBold',
            fontWeight: '600',
            fontSize: 14,
            color: light.text.primary,
            lineHeight: 18,
          }}
        >
          {t('wineCommunityPeak.contributors.title')}
          <Text
            style={{
              color: light.text.muted,
              fontWeight: '400',
              marginLeft: 6,
            }}
          >
            {` ${estimates.length}`}
          </Text>
        </Text>

        {/* Sort toggle group */}
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <SortBtn
            label={t('wineCommunityPeak.contributors.sort.recent')}
            a11yLabel={t('wineCommunityPeak.contributors.sort.recentA11y')}
            active={sort === 'recent'}
            onPress={() => handleSortPress('recent')}
          />
          <SortBtn
            label={t('wineCommunityPeak.contributors.sort.levelDesc')}
            a11yLabel={t(
              'wineCommunityPeak.contributors.sort.levelDescA11y',
            )}
            active={sort === 'levelDesc'}
            onPress={() => handleSortPress('levelDesc')}
          />
        </View>
      </View>

      {/* List */}
      <View style={{ gap: 8 }}>
        {sorted.map((e) => (
          <ContributorRow key={e.id} estimate={e} />
        ))}
      </View>
    </View>
  );
}

// ---- SortBtn (3-layer Pressable §4-11) ----

interface SortBtnProps {
  label: string;
  a11yLabel: string;
  active: boolean;
  onPress: () => void;
}

function SortBtn({ label, a11yLabel, active, onPress }: SortBtnProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ selected: active }}
      hitSlop={4}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: light.border.default,
          borderRadius: 8,
          // §10 H: active bg = light.border.active (gold) — wine-red 채도 부조화 회피.
          backgroundColor: active ? light.border.active : light.bg.deep,
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_6SemiBold',
            fontWeight: '600',
            fontSize: 11,
            color: active ? brand.cream : light.text.muted,
            lineHeight: 13,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ---- ContributorRow ----

interface ContributorRowProps {
  estimate: CommunityPeakEstimate;
}

function ContributorRow({ estimate }: ContributorRowProps) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language as 'ko' | 'en') || 'ko';
  const lvl = estimate.reviewerLevel;
  const levelEntry = LEVELS_BY_ID[lvl] ?? LEVELS_BY_ID[3];
  const levelName = levelEntry.name[locale];
  const anon = anonIdFor(estimate.userId);
  const conf = CONFIDENCE_COLOR[estimate.confidence];
  const confLabel = t(`wineCommunityPeak.contributors.confidence.${conf.key}`);
  const noteText = estimate.note ? estimate.note[locale] : null;

  const a11yLabel = t('wineCommunityPeak.contributors.row.a11yLabel', {
    level: lvl,
    levelName,
    year: estimate.estimatedPeakYear,
    confidence: confLabel,
  });

  return (
    <View
      accessible
      accessibilityLabel={a11yLabel}
      style={{
        padding: 12,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Left wrap */}
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        {/* Identity row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {/* LevelPill (inline — design tokens 직접 사용) */}
          <View
            style={{
              height: 20,
              paddingHorizontal: 8,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: levelColors[`L${lvl}` as 'L3' | 'L4' | 'L5'],
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_6SemiBold',
                fontWeight: '600',
                fontSize: 11,
                color: brand.cream,
                lineHeight: 13,
              }}
            >
              {t(`level.L${lvl}`)}
            </Text>
          </View>

          {/* Level name + anonId */}
          <Text
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontWeight: '600',
              fontSize: 13,
              color: light.text.primary,
              lineHeight: 16,
            }}
          >
            {levelName}
            <Text
              style={{
                color: light.text.muted,
                fontWeight: '400',
              }}
            >
              {` #${anon}`}
            </Text>
          </Text>
        </View>

        {/* Note (optional) */}
        {noteText ? (
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              color: light.text.secondary,
              lineHeight: 18,
            }}
          >
            {noteText}
          </Text>
        ) : null}
      </View>

      {/* Right wrap */}
      <View
        style={{
          flexShrink: 0,
          alignItems: 'flex-end',
          gap: 4,
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_7Bold',
            fontWeight: '700',
            fontSize: 18,
            color: light.border.active,
            lineHeight: 21.6,
          }}
        >
          {estimate.estimatedPeakYear}
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: conf.bg,
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontWeight: '600',
              fontSize: 10,
              color: conf.fg,
              lineHeight: 12,
            }}
          >
            {confLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
