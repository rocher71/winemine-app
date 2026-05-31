/**
 * OpeningTimelineRn — 8-timepoint × 5 input opening evolution timeline.
 *
 * 사양: 랜딩페이지 opening-timeline.tsx 기반 RN 포팅.
 *   - 컨트롤 행: opened-at (now/clear) + decant Y/N
 *   - 8-step timeline track (T0/15분/.../6시간+) — 활성 step shadow + filled gold/wineRed dot
 *   - 활성 timepoint patch panel: aroma delta / tannin (red) / body delta + reduction check
 *     + 1~5 점수 + peak toggle
 *   - 매칭된 OpeningGuide recommendation card (gold border)
 *   - 2+ timepoints 입력 시 evolution chart SVG (W=480 viewBox)
 *
 * RN deviation:
 *   D1: native checkbox 없음 → Pressable + Check icon
 *   D2: hover :title tooltip → 미사용 (모바일)
 *   D3: Light 모드만
 */
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle, Line, Polyline, Path, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Wine, Star } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import {
  TIMEPOINT_PRESETS,
  matchOpeningGuide,
  type EvolutionPoint,
  type FormVariant,
  type Delta,
} from '@/lib/notes/tasting-note-lexicon';

interface Props {
  variant: FormVariant;
  meta: {
    vintage: number | null;
    grapeVarieties: string[];
    region: string;
  };
  state: {
    openedAt: string | null;
    decanted: boolean;
    timepoints: EvolutionPoint[];
    peakIndex: number | null;
  };
  onOpenedAt: (iso: string | null) => void;
  onDecant: (b: boolean) => void;
  onUpsert: (tp: EvolutionPoint) => void;
  onPeak: (idx: number | null) => void;
}

export function OpeningTimelineRn({
  variant,
  meta,
  state,
  onOpenedAt,
  onDecant,
  onUpsert,
  onPeak,
}: Props) {
  const { t } = useTranslation();
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  const [activeMin, setActiveMin] = useState<number>(0);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live timer for opened-at elapsed display
  useEffect(() => {
    if (!state.openedAt) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => setTick((n) => n + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [state.openedAt]);

  const elapsedSec = state.openedAt
    ? Math.floor((Date.now() - new Date(state.openedAt).getTime()) / 1000)
    : 0;
  void tick;
  const elapsedFmt = formatElapsed(elapsedSec);

  const guide = matchOpeningGuide({
    variant,
    vintage: meta.vintage,
    grapeVarieties: meta.grapeVarieties,
    region: meta.region,
  });

  const activeTp = state.timepoints.find((tp) => tp.minutesAfterOpen === activeMin);

  function patchActive(patch: Partial<EvolutionPoint>) {
    Haptics.selectionAsync().catch(() => undefined);
    const preset = TIMEPOINT_PRESETS.find((p) => p.minutes === activeMin);
    const base: EvolutionPoint = activeTp ?? {
      minutesAfterOpen: activeMin,
      label: preset?.label ?? `${activeMin}m`,
      aromaIntensityDelta: 0,
      tanninSoftnessDelta: 0,
      bodyDelta: 0,
      reductionPresent: false,
      newAromasEmerged: [],
      overallScore: 3,
      note: '',
    };
    onUpsert({ ...base, ...patch });
  }

  return (
    <View style={{ rowGap: 16 }}>
      {/* Controls */}
      <View style={{ rowGap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6 }}>
            <Wine size={14} strokeWidth={2} color={light.text.muted} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                lineHeight: 14.4,
                color: light.text.muted,
                letterSpacing: 0.72,
                textTransform: 'uppercase',
              }}
            >
              Cork
            </Text>
          </View>
          {state.openedAt ? (
            <PillButton
              active
              label={elapsedFmt}
              onPress={() => onOpenedAt(null)}
            />
          ) : (
            <PillButton
              active={false}
              label={t('notes.expert.openedAtNow')}
              onPress={() => onOpenedAt(new Date().toISOString())}
            />
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              lineHeight: 14.4,
              color: light.text.muted,
            }}
          >
            {t('notes.expert.decantLabel')}
          </Text>
          <PillButton
            active={state.decanted}
            label={t('notes.expert.yes')}
            onPress={() => onDecant(true)}
          />
          <PillButton
            active={!state.decanted}
            label={t('notes.expert.no')}
            onPress={() => onDecant(false)}
          />
        </View>
      </View>

      {/* Timeline track */}
      <View style={{ paddingVertical: 12, paddingHorizontal: 4 }}>
        <View
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            top: 21,
            height: 1,
            backgroundColor: light.border.default,
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {TIMEPOINT_PRESETS.map((preset) => {
            const tp = state.timepoints.find(
              (p) => p.minutesAfterOpen === preset.minutes,
            );
            const filled = !!tp;
            const isActive = preset.minutes === activeMin;
            const isPeak =
              state.peakIndex != null &&
              state.timepoints[state.peakIndex]?.minutesAfterOpen === preset.minutes;
            return (
              <Pressable
                key={preset.minutes}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => undefined);
                  setActiveMin(preset.minutes);
                }}
                accessibilityRole="button"
                accessibilityLabel={preset.label}
                accessibilityState={{ selected: isActive }}
                hitSlop={6}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  alignItems: 'center',
                  rowGap: 4,
                })}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: isPeak
                      ? brand.wineRed
                      : filled
                      ? brand.gold
                      : light.bg.map,
                    borderWidth: 2,
                    borderColor: isActive
                      ? brand.gold
                      : isPeak
                      ? brand.wineRed
                      : filled
                      ? brand.gold
                      : light.text.disabled,
                    ...(isActive
                      ? {
                          shadowColor: brand.gold,
                          shadowOpacity: 0.35,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        }
                      : null),
                  }}
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: isActive ? 'Inter_700Bold' : 'Inter_400Regular',
                    fontSize: 10,
                    lineHeight: 12,
                    color: isActive ? brand.gold : light.text.muted,
                  }}
                >
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Active timepoint panel */}
      <View
        style={{
          padding: 16,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: light.border.default,
          borderRadius: 12,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 18,
            lineHeight: 21.6,
            color: light.text.primary,
            marginBottom: 12,
          }}
        >
          T+{TIMEPOINT_PRESETS.find((p) => p.minutes === activeMin)?.label}
        </Text>

        <DeltaSlider
          label={t('notes.expert.deltaAroma')}
          value={activeTp?.aromaIntensityDelta ?? 0}
          onChange={(d) => patchActive({ aromaIntensityDelta: d })}
        />
        {variant === 'red' ? (
          <DeltaSlider
            label={t('notes.expert.deltaTannin')}
            value={activeTp?.tanninSoftnessDelta ?? 0}
            onChange={(d) => patchActive({ tanninSoftnessDelta: d })}
          />
        ) : null}
        <DeltaSlider
          label={t('notes.expert.deltaBody')}
          value={activeTp?.bodyDelta ?? 0}
          onChange={(d) => patchActive({ bodyDelta: d })}
        />

        {/* Reduction toggle */}
        <Pressable
          onPress={() =>
            patchActive({ reductionPresent: !(activeTp?.reductionPresent ?? false) })
          }
          accessibilityRole="checkbox"
          accessibilityState={{ checked: activeTp?.reductionPresent ?? false }}
          accessibilityLabel={t('notes.expert.reductionLabel')}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: 8,
              marginTop: 12,
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                borderWidth: 1.5,
                borderColor: activeTp?.reductionPresent
                  ? brand.gold
                  : light.text.muted,
                backgroundColor: activeTp?.reductionPresent
                  ? brand.gold
                  : 'transparent',
              }}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                lineHeight: 15.6,
                color: light.text.primary,
              }}
            >
              {t('notes.expert.reductionLabel')}
            </Text>
          </View>
        </Pressable>

        {/* Score + Peak */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 8,
            marginTop: 16,
            flexWrap: 'wrap',
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              lineHeight: 14.4,
              color: light.text.muted,
            }}
          >
            {t('notes.expert.scoreLabel')}
          </Text>
          {([1, 2, 3, 4, 5] as const).map((n) => {
            const filled = (activeTp?.overallScore ?? 0) >= n;
            return (
              <Pressable
                key={n}
                onPress={() => patchActive({ overallScore: n })}
                accessibilityRole="button"
                accessibilityLabel={`${n}`}
                hitSlop={4}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: filled ? brand.gold : light.border.default,
                    backgroundColor: filled ? brand.gold : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 12,
                      lineHeight: 14.4,
                      color: filled ? light.bg.map : light.text.muted,
                    }}
                  >
                    {n}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => {
              const idx = state.timepoints.findIndex(
                (tp) => tp.minutesAfterOpen === activeMin,
              );
              onPeak(idx >= 0 ? idx : null);
            }}
            disabled={!activeTp}
            accessibilityRole="button"
            accessibilityLabel={t('notes.expert.peakLabel')}
            style={({ pressed }) => ({
              opacity: pressed || !activeTp ? 0.5 : 1,
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: 6,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: brand.wineRed,
                backgroundColor:
                  state.peakIndex != null &&
                  state.timepoints[state.peakIndex]?.minutesAfterOpen === activeMin
                    ? brand.wineRed
                    : 'transparent',
              }}
            >
              <Star
                size={11}
                strokeWidth={2}
                color={
                  state.peakIndex != null &&
                  state.timepoints[state.peakIndex]?.minutesAfterOpen === activeMin
                    ? brand.cream
                    : brand.wineRed
                }
                fill={
                  state.peakIndex != null &&
                  state.timepoints[state.peakIndex]?.minutesAfterOpen === activeMin
                    ? brand.cream
                    : 'transparent'
                }
              />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12,
                  lineHeight: 14.4,
                  color:
                    state.peakIndex != null &&
                    state.timepoints[state.peakIndex]?.minutesAfterOpen === activeMin
                      ? brand.cream
                      : brand.wineRed,
                }}
              >
                {t('notes.expert.peakLabel')}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Recommendation */}
      {guide ? (
        <View
          style={{
            padding: 14,
            backgroundColor: withAlpha(brand.gold, 0.06),
            borderWidth: 1,
            borderColor: brand.gold,
            borderRadius: 12,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 11,
              lineHeight: 13.2,
              color: brand.gold,
              letterSpacing: 0.88,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {t('notes.expert.recommendationTitle')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              lineHeight: 16.8,
              color: light.text.primary,
              marginBottom: 4,
            }}
          >
            {locale === 'ko' ? guide.ko : guide.en}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              lineHeight: 13.2,
              fontStyle: 'italic',
              color: light.text.muted,
              marginBottom: 8,
            }}
          >
            {t('notes.expert.recommendedRange', {
              min: guide.recommendedMinutes.min,
              peak: guide.recommendedMinutes.peak,
              max: guide.recommendedMinutes.max,
            })}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              lineHeight: 18,
              color: light.text.secondary,
            }}
          >
            {guide.rationale}
          </Text>
        </View>
      ) : null}

      {/* Evolution chart */}
      {state.timepoints.length >= 2 ? (
        <EvolutionChart
          timepoints={state.timepoints}
          peakIndex={state.peakIndex}
        />
      ) : null}
    </View>
  );
}

function PillButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 9999,
          backgroundColor: active ? brand.gold : 'transparent',
          borderWidth: 1,
          borderColor: active ? brand.gold : light.border.default,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 12,
            lineHeight: 14.4,
            color: active ? light.bg.map : light.text.secondary,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function DeltaSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Delta;
  onChange: (d: Delta) => void;
}) {
  const opts: readonly Delta[] = [-2, -1, 0, 1, 2];
  const handlePress = (d: Delta) => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(d);
  };
  return (
    <View style={{ marginBottom: 10 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
          lineHeight: 14.4,
          color: light.text.secondary,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', columnGap: 6 }}>
        {opts.map((d) => {
          const active = d === value;
          const color =
            d === -2
              ? '#5C4070'
              : d === -1
              ? '#7A5A8A'
              : d === 0
              ? light.text.muted
              : d === 1
              ? brand.gold
              : brand.wineRed;
          return (
            <View key={d} style={{ flex: 1 }}>
              <Pressable
                onPress={() => handlePress(d)}
                accessibilityRole="button"
                accessibilityLabel={`${d > 0 ? '+' : ''}${d}`}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View
                  style={{
                    paddingVertical: 6,
                    alignItems: 'center',
                    backgroundColor: active ? color : 'transparent',
                    borderWidth: 1,
                    borderColor: active ? color : light.border.default,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 11,
                      lineHeight: 13.2,
                      color: active ? brand.cream : light.text.muted,
                    }}
                  >
                    {d > 0 ? `+${d}` : `${d}`}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function EvolutionChart({
  timepoints,
  peakIndex,
}: {
  timepoints: EvolutionPoint[];
  peakIndex: number | null;
}) {
  const sorted = [...timepoints].sort(
    (a, b) => a.minutesAfterOpen - b.minutesAfterOpen,
  );
  const W = 480;
  const H = 120;
  const PAD = 24;
  const maxMin = Math.max(360, ...sorted.map((s) => s.minutesAfterOpen));
  const xOf = (m: number) => PAD + (m / maxMin) * (W - 2 * PAD);
  const yOf = (s: number) => H - PAD - ((s - 1) / 4) * (H - 2 * PAD);
  const points = sorted
    .map((s) => `${xOf(s.minutesAfterOpen)},${yOf(s.overallScore)}`)
    .join(' ');
  return (
    <View
      style={{
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        borderRadius: 8,
        padding: 4,
      }}
    >
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Line
            key={s}
            x1={PAD}
            y1={yOf(s)}
            x2={W - PAD}
            y2={yOf(s)}
            stroke={light.border.default}
            strokeWidth={0.5}
            strokeDasharray={s === 1 || s === 5 ? undefined : '2 4'}
          />
        ))}
        <Polyline
          points={points}
          fill="none"
          stroke={brand.gold}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {sorted.map((s) => {
          const peak =
            peakIndex != null &&
            timepoints[peakIndex]?.minutesAfterOpen === s.minutesAfterOpen;
          return (
            <G key={s.minutesAfterOpen}>
              <Circle
                cx={xOf(s.minutesAfterOpen)}
                cy={yOf(s.overallScore)}
                r={peak ? 6 : 4}
                fill={
                  s.reductionPresent
                    ? light.text.muted
                    : peak
                    ? brand.wineRed
                    : brand.gold
                }
              />
              {peak ? (
                <G
                  transform={`translate(${xOf(s.minutesAfterOpen) - 6}, ${
                    yOf(s.overallScore) - 18
                  })`}
                >
                  <Path
                    d="M6 1 L7.2 4.7 L11 4.8 L8 7.2 L9 11 L6 8.8 L3 11 L4 7.2 L1 4.8 L4.8 4.7 Z"
                    fill={brand.wineRed}
                  />
                </G>
              ) : null}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

function formatElapsed(sec: number): string {
  if (sec < 60) return `T+${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `T+${m}:${String(s).padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `T+${h}:${String(rm).padStart(2, '0')}`;
}
