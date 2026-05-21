/**
 * /wine/[lwin]/community-peak — 커뮤니티 음용 적기 상세.
 *
 * 사양: _workspace/design-specs/wine-community-peak.md (Day 6 신규 화면).
 *
 * §10 결정 사항 (작업 요청 + 사양):
 *   A: mock-only v0.1.0 (src/lib/mock/community-peaks.ts) — supabase 마이그레이션 v0.2.0.
 *   B: client-side aggregate (community-peak-aggregator.ts) — SQL function 은 v0.2.0.
 *   C: PeakDistribution 차트 = react-native-svg 수동 BarChart (~280 LOC).
 *   D: count===0 시 stats Text hide, count Text 만 표시 (사양 §10 D 권장값 b).
 *   E: 신규 i18n `wineCommunityPeak.notFound` 별도 키 (wineDetail 재사용 X — namespace 일관).
 *   F: AddMyEstimateCta 는 keyscreen verbatim mock toast (BottomSheet 폼은 v0.2.0).
 *   G: CTA locked label fontSize 13 + numberOfLines 1 (한국어 길이 대응).
 *   H: sort active bg = light.border.active (gold) + locked CTA text = light.text.primary (접근성).
 *   I: stats/year Playfair Text 만 allowFontScaling={false} (시각 비율 보존),
 *      본문/sub Text 는 default (접근성). — 현재 미적용, 시각 검수 후 결정 (사양 §10 I).
 *   J: light.gold alias 도입 follow-up (wine-prices §9 와 중복 요청).
 *   K: Tooltip on bar press = tap-driven manual callout (사양 §10 K (a)).
 *   L: weightHint Text 색 = light.border.active (gold) — 시각 강조 우선 (사양 §10 L (a)).
 *      AA Large 미달 trade-off 수용 (12px 400 → light.text.secondary 변경 검토 follow-up).
 *   M: anonIdFor 1~999 (충돌률 7% — keyscreen 1~99 대비 익명성 향상, contributors-list.tsx 내부).
 *
 * §0-2 light-only mode:
 *   - dark: className 금지.
 *   - 모든 색은 light.* 또는 brand.* 토큰 직접 inline.
 *   - useColorScheme 호출 안 함.
 *
 * RN deviation (§6):
 *   - #2 brand.gold → light.border.active (intro weightHint / year text / refLine system label).
 *   - #3 brand.cream → light.text.primary (stats / h2 title / level name / refLine median label).
 *   - #4 Recharts BarChart → react-native-svg 수동 (peak-distribution-chart.tsx).
 *   - #5 hover Tooltip → tap-driven manual callout.
 *   - #6 repeating-linear-gradient → svg <Line strokeDasharray/>.
 *   - #7 sort active bg wine-red → light.border.active.
 *   - #8 anonymized "{LevelName} #{1~999}" — keyscreen 패턴 verbatim 유지.
 *   - #11 CTA bottom 80 → bottom 16 + insets.bottom.
 *   - #15 count===0 stats hide.
 *   - #16 CTA mock toast (BottomSheet 폼 v0.2.0).
 *
 * Yoga vs CSS box model 사전 점검 (CLAUDE.md §4-10):
 *   - 음수 margin / sticky / grid / backdrop / radius 9999 원형 / vh-vw: 모두 없음. [OK]
 *   - repeating-linear-gradient: svg Line strokeDasharray 로 대체 (PeakDistributionChart). [OK]
 */
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useWine } from '@/hooks/use-wine';
import { useProfile } from '@/hooks/use-profile';
import { useCommunityPeak } from '@/hooks/use-community-peak';
import { PeakDistributionChart } from '@/components/wine-community-peak/peak-distribution-chart';
import { ContributorsList } from '@/components/wine-community-peak/contributors-list';
import { AddMyEstimateCta } from '@/components/wine-community-peak/add-my-estimate-cta';
import { brand, light } from '@/lib/design-tokens';

export default function WineCommunityPeakScreen() {
  const { lwin: lwinParam } = useLocalSearchParams<{ lwin: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const { t } = useTranslation();

  const { wine, loading: wineLoading, error: wineError, refresh } = useWine(lwin);
  const { profile } = useProfile();
  const { aggregate, estimates, loading: peakLoading } = useCommunityPeak(lwin);

  const userLevelId = profile?.level ?? 0;

  // Loading
  if (wineLoading || peakLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('wineCommunityPeak.header.title')} />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color={brand.gold} />
        </View>
      </View>
    );
  }

  // Error — wine 없음 또는 fetch 실패
  if (wineError || !wine?.lwin) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('wineCommunityPeak.header.title')} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          <AlertCircle size={32} strokeWidth={1.5} color={light.text.muted} />
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontWeight: '600',
              fontSize: 14,
              color: light.text.primary,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            {t('wineCommunityPeak.notFound')}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: light.text.muted,
              textAlign: 'center',
              lineHeight: 19.5,
            }}
          >
            {t('wineCommunityPeak.error.body')}
          </Text>
          <Pressable
            onPress={() => void refresh()}
            accessibilityRole="button"
            accessibilityLabel={t('wineCommunityPeak.error.retry')}
            hitSlop={8}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              marginTop: 4,
            })}
          >
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: brand.gold,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontWeight: '600',
                  fontSize: 13,
                  color: brand.gold,
                  lineHeight: 16,
                }}
              >
                {t('wineCommunityPeak.error.retry')}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  const count = aggregate?.count ?? 0;
  const mean = aggregate ? Math.round(aggregate.meanPeakYear) : 0;
  const median = aggregate ? aggregate.medianPeakYear : 0;

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={t('wineCommunityPeak.header.title')} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          // CTA 52 + spacing 16 + 안전영역 = 96 reserved.
          paddingBottom: 96,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section A — Intro card */}
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              padding: 14,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: light.border.default,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: light.text.secondary,
                lineHeight: 20.8,
                margin: 0,
              }}
            >
              {t('wineCommunityPeak.intro.body')}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                // §6 #2: gold → light.border.active (§10 L (a) — 시각 강조 우선).
                color: light.border.active,
                lineHeight: 16,
                marginTop: 6,
              }}
            >
              {t('wineCommunityPeak.intro.weightHint')}
            </Text>
          </View>
        </View>

        {/* Section B — Big Histogram card */}
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              padding: 16,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: light.border.default,
              borderRadius: 16,
            }}
          >
            {/* Header row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              {/* §10 D (b): count===0 시 stats hide. */}
              {count > 0 ? (
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'PlayfairDisplay_700Bold',
                    fontWeight: '700',
                    fontSize: 22,
                    // §6 #3: cream → light.text.primary.
                    color: light.text.primary,
                    lineHeight: 26.4,
                  }}
                >
                  {t('wineCommunityPeak.histogram.stats', { mean, median })}
                </Text>
              ) : (
                <View />
              )}
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 11,
                  color: light.text.muted,
                  lineHeight: 13,
                }}
              >
                {t('wineCommunityPeak.histogram.count', { count })}
              </Text>
            </View>

            {/* Chart or empty */}
            {count === 0 || !aggregate ? (
              <Text
                style={{
                  paddingVertical: 32,
                  paddingHorizontal: 16,
                  textAlign: 'center',
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: light.text.muted,
                  lineHeight: 20.8,
                }}
              >
                {t('wineCommunityPeak.histogram.empty')}
              </Text>
            ) : (
              <PeakDistributionChart
                aggregate={aggregate}
                height={240}
                showLegend
              />
            )}
          </View>
        </View>

        {/* Section C — ContributorsList */}
        <ContributorsList estimates={estimates} />
      </ScrollView>

      {/* Absolute bottom CTA */}
      <AddMyEstimateCta userLevelId={userLevelId} />
    </View>
  );
}

// ---- Inline light-only BackHeader (사양 §0-2, wine-story / wine-prices 와 동일 패턴) ----

interface LightBackHeaderProps {
  title: string;
}

function LightBackHeader({ title }: LightBackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top,
        height: insets.top + 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        hitSlop={12}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          marginRight: 12,
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <ChevronLeft size={24} strokeWidth={1.75} color={light.text.primary} />
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: 'Inter_600SemiBold',
          fontWeight: '600',
          fontSize: 16,
          lineHeight: 19.2,
          color: light.text.primary,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
