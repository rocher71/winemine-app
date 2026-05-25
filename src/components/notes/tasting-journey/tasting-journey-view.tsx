/**
 * TastingJourneyView — 전문가 테이스팅 노트 조회 (Variant C · Tasting Journey Timeline).
 *
 * 디자인 출처: Claude Design 핸드오프 `winemine Tasting Note View.html`
 *   → wm-note-view-c-themed.jsx (NoteViewCThemed, dark+light).
 * 사용자 결정 2026-05-25: /notes/[noteId] 전문가 모드 뷰를 이 디자인으로 교체,
 *   실데이터 연동 + 모델 부재 항목은 디자인 기본값, 앱 다운로드 CTA는 인앱이라 제거.
 *
 * 좌측 골드 스파인을 따라 7개 챕터:
 *   01 라벨/색 · 02 향(휠) · 03 미각(WSET) · 04 탄닌 · 05 여운(카우달리)
 *   · 06 4시간 오프닝 타임라인 · 07 최종 평가
 *
 * 양쪽 모드(dark/light) · ko/en. 하드코딩 hex 0 (모든 색 JourneyTheme 토큰).
 */
import { useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Line,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { Calendar, Camera, Sparkles, Droplet, Info } from 'lucide-react-native';
import { WMBottle } from '@/components/shared/wm-bottle';
import { brand, withAlpha, type ColorScheme, type TypeCanonical } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { AROMA_CATEGORIES } from '@/lib/notes/tasting-note-lexicon';
import type { TastingNoteDetail } from '@/hooks/use-notes';
import type { ExpertFields } from '@/components/notes/expert-form';
import { buildJourneyTheme, type JourneyTheme } from './journey-theme';
import { resolveJourney, type JourneyVM } from './journey-data';
import {
  NVMeta,
  NVChips,
  NVWSETReadout,
  NVTanninTexture,
  NVTypeRow,
  NVModeRow,
  NVRating,
  NVAromaWheel,
  NVCaudalieRing,
  NVChapter,
  NVStop,
} from './journey-primitives';

interface Props {
  note: TastingNoteDetail;
  fields: ExpertFields;
}

// Sight 색·강도 라벨 (모델 부재 → 디자인 fallback, ko/en 양쪽 §4-4)
const SIGHT_COLOR_LABEL: Record<JourneyVM['sightColorKey'], { ko: string; en: string }> = {
  garnet: { ko: '가닛', en: 'Garnet' },
  ruby: { ko: '루비', en: 'Ruby' },
  gold: { ko: '골드', en: 'Gold' },
  straw: { ko: '스트로', en: 'Straw' },
  salmon: { ko: '새먼', en: 'Salmon' },
  amber: { ko: '앰버', en: 'Amber' },
};
const SIGHT_INTENSITY_LABEL: Record<JourneyVM['sightIntensityKey'], { ko: string; en: string }> = {
  pale: { ko: '옅음', en: 'Pale' },
  medium: { ko: '중간', en: 'Medium' },
  deep: { ko: '진함', en: 'Deep' },
};

// 시음 시각 + 오프셋(분) → "HH:MM"
function clockAt(iso: string | null, offsetMin: number): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  d.setMinutes(d.getMinutes() + offsetMin);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatTastedAt(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${mo}.${da} · ${hh}:${mi}`;
}

export function TastingJourneyView({ note, fields }: Props) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'light' ? 'light' : 'dark';
  const locale: 'ko' | 'en' = currentLocale() === 'en' ? 'en' : 'ko';
  const { width: W } = useWindowDimensions();

  const th = useMemo(() => buildJourneyTheme(scheme), [scheme]);
  const vm = useMemo(() => resolveJourney(note, fields, locale), [note, fields, locale]);

  const card = (extra?: object) => ({
    padding: 16,
    borderRadius: 14,
    backgroundColor: th.surface,
    borderWidth: 0.5,
    borderColor: th.border,
    shadowColor: brand.black,
    shadowOpacity: th.scheme === 'light' ? 0.06 : 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    ...extra,
  });

  const finishKor = t(`notes.journey.finishKor${capitalize(vm.finishBand)}`);
  const finishEn = t(`notes.journey.finishEn${capitalize(vm.finishBand)}`);
  const vintageAge =
    vm.vintage != null ? new Date().getFullYear() - vm.vintage : null;

  // closing note: 실제 memo 우선, 없으면 디자인 fallback
  const closing = vm.closing ?? t('notes.journey.closingFallback');

  const colorLabel = SIGHT_COLOR_LABEL[vm.sightColorKey];
  const intensityLabel = SIGHT_INTENSITY_LABEL[vm.sightIntensityKey];

  // opening timeline stops (디자인 fallback narrative — clock는 tasted_at 기반)
  const stops = t('notes.journey.openingStops', { returnObjects: true }) as Array<{
    label: string;
    offsetMin: number;
    body: string;
    peak?: boolean;
  }>;

  const deltaRows = [
    { label: t('notes.journey.t4DeltaAroma'), d: 1 },
    { label: t('notes.journey.t4DeltaTannin'), d: 1 },
    { label: t('notes.journey.t4DeltaAcid'), d: 0 },
  ];

  // aroma category meta (label + en + color) for the count list
  const catMeta = useMemo(() => {
    const map = new Map(AROMA_CATEGORIES.map((c) => [c.id, c]));
    return vm.aromaCats.map((ac) => {
      const m = map.get(ac.id);
      return {
        ...ac,
        ko: m?.ko ?? ac.id,
        en: m?.en ?? ac.id,
        items: ac.tags.map((tag) => t(`notes.beginner.aromaCard.${tag}`)),
      };
    });
  }, [vm.aromaCats, t]);

  return (
    <View style={{ width: '100%', backgroundColor: th.bg, paddingBottom: 12 }}>
      {/* ── atmospheric glow — soft radial centered on the hero, fades to transparent at 70%
            (design: radial-gradient(ellipse, heroGlow, transparent 70%)) ── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420 }} pointerEvents="none">
        <Svg width={W} height={420}>
          <Defs>
            <RadialGradient
              id="nv-hero-glow"
              cx={W / 2}
              cy={200}
              rx={W * 0.72}
              ry={200}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor={th.heroGlowColor} stopOpacity={th.heroGlowOpacity} />
              <Stop offset="70%" stopColor={th.heroGlowColor} stopOpacity={0} />
              <Stop offset="100%" stopColor={th.heroGlowColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={W} height={420} fill="url(#nv-hero-glow)" />
        </Svg>
      </View>

      {/* ── Hero — wine name ── */}
      <View style={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 22 }}>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: th.bold, fontSize: 10, color: th.gold, letterSpacing: 3.2, textTransform: 'uppercase' }}
        >
          {t('notes.journey.eyebrow')}
        </Text>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: th.display, fontSize: 28, color: th.textPrimary, lineHeight: 31, letterSpacing: -0.7, marginTop: 14 }}
        >
          {vm.wineName}
        </Text>
        {vm.producer || vm.vintage ? (
          <Text
            allowFontScaling={false}
            style={{ fontFamily: th.serif, fontStyle: 'italic', fontSize: 14, color: th.textSecondary, marginTop: 8 }}
          >
            {[vm.producer, vm.vintage].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <Calendar size={12} strokeWidth={1.75} color={th.textMuted} />
          <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 11, color: th.textMuted }}>
            {formatTastedAt(vm.tastedAt)}
          </Text>
        </View>
      </View>

      {/* ── Bottle band hero ── */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 18, paddingHorizontal: 22, paddingBottom: 14 }}>
        <View style={{ width: 90, height: 220, alignItems: 'center', justifyContent: 'flex-end' }}>
          <WMBottle
            width={84}
            height={210}
            bottleColor={vm.bottleColor}
            type={vm.type === 'blind' ? 'red' : (vm.type as TypeCanonical)}
            producer={vm.producer}
            label={vm.wineName}
            vintage={vm.vintage}
          />
        </View>
        <View style={{ flex: 1, paddingBottom: 16, gap: 10 }}>
          {vm.region ? <NVMeta t={th} k={t('notes.journey.metaRegion')} v={vm.region} /> : null}
          {vm.vintage != null ? (
            <NVMeta
              t={th}
              k={t('notes.journey.metaVintage')}
              v={
                vintageAge != null
                  ? t('notes.journey.vintageYears', { vintage: vm.vintage, age: vintageAge })
                  : String(vm.vintage)
              }
            />
          ) : null}
          {vm.appellation ? <NVMeta t={th} k={t('notes.journey.metaAppellation')} v={vm.appellation} /> : null}
        </View>
      </View>

      {/* ── Mode + type rows ── */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 4 }}>
        <NVModeRow
          t={th}
          mode="expert"
          beginner={{ title: t('notes.journey.modeBeginnerTitle'), sub: t('notes.journey.modeBeginnerSub') }}
          expert={{ title: t('notes.journey.modeExpertTitle'), sub: t('notes.journey.modeExpertSub') }}
          selectedLabel={t('notes.journey.selected')}
        />
      </View>
      <View style={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 8 }}>
        <NVTypeRow
          t={th}
          value={vm.type}
          labels={{
            white: t('notes.journey.typeWhite'),
            red: t('notes.journey.typeRed'),
            sparkling: t('notes.journey.typeSparkling'),
            blind: t('notes.journey.typeBlind'),
          }}
        />
      </View>

      {/* ── Spine container ── */}
      <View style={{ position: 'relative', marginTop: 8 }}>
        <LinearGradient
          colors={[withAlpha(th.gold, 0.85), withAlpha(th.gold, 0.18), withAlpha(th.gold, 0.85), withAlpha(th.gold, 0)]}
          locations={[0, 0.5, 0.9, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', left: 36, top: 8, bottom: 80, width: 1 }}
        />

        {/* ─ 01 Label / Sight ─ */}
        <NVChapter
          t={th}
          no={1}
          kicker={t('notes.journey.ch1Kicker')}
          ko={t('notes.journey.ch1Title')}
          en={[vm.appellation ?? vm.region, colorLabel.en].filter(Boolean).join(' · ')}
        >
          <View style={card({ marginBottom: 12 })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Camera size={12} strokeWidth={1.75} color={th.gold} />
              <Text allowFontScaling={false} style={{ fontFamily: th.bold, fontSize: 9, color: th.gold, letterSpacing: 1.4, textTransform: 'uppercase' }}>
                {t('notes.journey.recognition', { pct: vm.recognitionPct })}
              </Text>
            </View>
            <Text allowFontScaling={false} style={{ fontFamily: th.display, fontSize: 17, color: th.textPrimary, lineHeight: 21 }}>
              {vm.wineName}
            </Text>
            {vm.producer ? (
              <Text allowFontScaling={false} style={{ fontFamily: th.serif, fontStyle: 'italic', fontSize: 12, color: th.gold, marginTop: 2 }}>
                {vm.producer}
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, rowGap: 12 }}>
              {vm.vintage != null ? (
                <View style={{ width: '50%' }}>
                  <NVMeta t={th} k={t('notes.journey.metaVintage')} v={String(vm.vintage)} />
                </View>
              ) : null}
              {vm.region ? (
                <View style={{ width: '50%' }}>
                  <NVMeta t={th} k={t('notes.journey.metaRegion')} v={[vm.region, vm.country].filter(Boolean).join(' · ')} />
                </View>
              ) : null}
              {vm.appellation ? (
                <View style={{ width: '100%' }}>
                  <NVMeta t={th} k={t('notes.journey.metaAppellation')} v={vm.appellation} />
                </View>
              ) : null}
            </View>
          </View>

          {/* Sight — glass + color */}
          <View style={card({ flexDirection: 'row', alignItems: 'center', gap: 14 })}>
            <SightGlass th={th} />
            <View style={{ flex: 1, gap: 10 }}>
              <NVMeta
                t={th}
                k={t('notes.journey.metaColor')}
                v={`${colorLabel.en} · ${colorLabel.ko}`}
                accent={th.gold}
              />
              <NVMeta
                t={th}
                k={t('notes.journey.metaIntensity')}
                v={locale === 'ko' ? intensityLabel.ko : intensityLabel.en}
              />
            </View>
          </View>
        </NVChapter>

        {/* ─ 02 Nose ─ */}
        <NVChapter t={th} no={2} kicker={t('notes.journey.ch2Kicker')} ko={t('notes.journey.ch2Title')} en={t('notes.journey.ch2Sub')}>
          <View style={card({ alignItems: 'center', gap: 12 })}>
            <NVAromaWheel t={th} size={220} active={vm.aromaActive} selected={vm.aromaSelected} locale={locale} />

            {catMeta.length > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: th.bg,
                  borderWidth: 0.5,
                  borderColor: th.border,
                  flexWrap: 'wrap',
                }}
              >
                {catMeta.map((c, i) => (
                  <Text key={c.id} allowFontScaling={false} style={{ fontFamily: th.bodyMed, fontSize: 10.5, color: th.gold }}>
                    {(locale === 'ko' ? c.ko : c.en)} {c.tags.length}
                    {i < catMeta.length - 1 ? '   ·' : ''}
                  </Text>
                ))}
              </View>
            ) : null}

            <View style={{ width: '100%', gap: 8 }}>
              {catMeta.map((cat) => (
                <View
                  key={cat.id}
                  style={{
                    width: '100%',
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    backgroundColor: th.bg,
                    borderLeftWidth: 3,
                    borderLeftColor: cat.color,
                    borderWidth: 0.5,
                    borderColor: th.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 5 }}>
                    <Text allowFontScaling={false} style={{ fontFamily: th.bold, fontSize: 11, color: cat.color, letterSpacing: 0.55 }}>
                      {locale === 'ko' ? cat.ko : cat.en}
                    </Text>
                    <Text allowFontScaling={false} style={{ fontFamily: th.serif, fontStyle: 'italic', fontSize: 10, color: th.textMuted }}>
                      {locale === 'ko' ? cat.en : cat.ko}
                    </Text>
                    <View style={{ flex: 1 }} />
                    <Text allowFontScaling={false} style={{ fontFamily: th.display, fontSize: 12, color: cat.color }}>
                      {cat.tags.length}
                    </Text>
                  </View>
                  <NVChips t={th} items={cat.items} accent={cat.color} />
                </View>
              ))}
            </View>

            {vm.showRotundone ? (
              <View
                style={{
                  width: '100%',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: withAlpha(th.gold, 0.07),
                  borderWidth: 0.5,
                  borderColor: withAlpha(th.gold, 0.47),
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Sparkles size={11} strokeWidth={1.75} color={th.gold} />
                  <Text allowFontScaling={false} style={{ fontFamily: th.bold, fontSize: 10, color: th.gold, letterSpacing: 1.4, textTransform: 'uppercase' }}>
                    {t('notes.journey.rotundoneEyebrow')}
                  </Text>
                </View>
                <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 10.5, color: th.textSecondary, lineHeight: 15.75 }}>
                  {t('notes.journey.rotundoneBody')}
                </Text>
              </View>
            ) : null}
          </View>

          {/* intensity + development */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {[
              { l: t('notes.journey.aromaIntensityLabel'), v: t('notes.journey.aromaIntensityValue'), s: t('notes.journey.aromaIntensitySub') },
              { l: t('notes.journey.aromaDevLabel'), v: t('notes.journey.aromaDevValue'), s: t('notes.journey.aromaDevSub') },
            ].map((x, i) => (
              <View key={i} style={card({ flex: 1, padding: 12 })}>
                <Text allowFontScaling={false} style={{ fontFamily: th.bodyMed, fontSize: 9, color: th.textMuted, letterSpacing: 1.3, textTransform: 'uppercase' }}>
                  {x.l}
                </Text>
                <Text allowFontScaling={false} style={{ fontFamily: th.display, fontSize: 16, color: th.gold, marginTop: 4 }}>
                  {x.v}
                </Text>
                <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 10, color: th.textMuted, marginTop: 1 }}>
                  {x.s}
                </Text>
              </View>
            ))}
          </View>
        </NVChapter>

        {/* ─ 03 Palate ─ */}
        <NVChapter t={th} no={3} kicker={t('notes.journey.ch3Kicker')} ko={t('notes.journey.ch3Title')} en={t('notes.journey.ch3Sub')}>
          <View style={card({ paddingVertical: 18, paddingHorizontal: 16, gap: 20 })}>
            <NVWSETReadout t={th} label={t('notes.journey.palateSweet')} value={vm.sweet} range={t('notes.journey.sweetRange', { returnObjects: true }) as string[]} />
            <NVWSETReadout t={th} label={t('notes.journey.palateAcid')} value={vm.acid} range={t('notes.journey.acidRange', { returnObjects: true }) as string[]} />
            <NVWSETReadout t={th} label={t('notes.journey.palateBody')} value={vm.body} range={t('notes.journey.bodyRange', { returnObjects: true }) as string[]} />
            <NVWSETReadout t={th} label={t('notes.journey.palateAlcohol')} value={vm.alcohol} range={t('notes.journey.alcoholRange', { returnObjects: true }) as string[]} />
          </View>
        </NVChapter>

        {/* ─ 04 Tannin (red only) ─ */}
        {vm.isRed ? (
          <NVChapter t={th} no={4} kicker={t('notes.journey.ch4Kicker')} ko={t('notes.journey.ch4Title')} en={t('notes.journey.ch4Sub')}>
            <View
              style={card({
                backgroundColor: th.scheme === 'light' ? th.surface : th.surface,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Droplet size={12} strokeWidth={1.75} color={th.wine} />
                <Text allowFontScaling={false} style={{ fontFamily: th.bold, fontSize: 11, color: th.gold, letterSpacing: 1.1, textTransform: 'uppercase' }}>
                  {t('notes.journey.tanninTitle')}
                </Text>
                <View style={{ flex: 1 }} />
                <Text allowFontScaling={false} style={{ fontFamily: th.serif, fontStyle: 'italic', fontSize: 9.5, color: th.textMuted }}>
                  {t('notes.journey.tanninRedOnly')}
                </Text>
              </View>
              <NVWSETReadout
                t={th}
                label={t('notes.journey.tanninStrength')}
                value={vm.tanninStrength}
                range={t('notes.journey.tanninRange', { returnObjects: true }) as string[]}
                unit={t('notes.journey.tanninStrengthUnit')}
              />
              <View style={{ marginTop: 16 }}>
                <Text allowFontScaling={false} style={{ fontFamily: th.bodyMed, fontSize: 10.5, color: th.textSecondary, marginBottom: 8 }}>
                  {t('notes.journey.tanninTextureLabel')} —{' '}
                  <Text style={{ color: th.gold }}>{t('notes.journey.tanninSelectedCount', { n: vm.tanninTextures.length })}</Text>
                </Text>
                <NVTanninTexture
                  t={th}
                  options={(['silky', 'velvety', 'fine', 'polished', 'firm', 'chewy', 'chalky', 'drying', 'grippy', 'astringent'] as const).map((id) => ({
                    id,
                    label: t(`notes.journey.textures.${id}`),
                  }))}
                  selected={vm.tanninTextures}
                />
              </View>
            </View>
          </NVChapter>
        ) : null}

        {/* ─ 05 Finish ─ */}
        <NVChapter
          t={th}
          no={5}
          kicker={t('notes.journey.ch5Kicker')}
          ko={t('notes.journey.ch5Title')}
          en={`${vm.caudalies} Caudalies · ${finishEn}`}
        >
          <View
            style={card({
              paddingVertical: 20,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 18,
            })}
          >
            <NVCaudalieRing t={th} value={vm.caudalies} size={140} label={`${finishEn} · ${finishKor}`} />
            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={{ fontFamily: th.serif, fontStyle: 'italic', fontSize: 13, color: th.textPrimary, lineHeight: 20.8 }}>
                {t('notes.journey.finishSwallow', { sec: vm.caudalies })}
              </Text>
              <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 10.5, color: th.textSecondary, lineHeight: 15.75, marginTop: 10 }}>
                {t('notes.journey.finishBenchmark', { bench: t('notes.journey.finishBenchmarkValue') })}
              </Text>
            </View>
          </View>
        </NVChapter>

        {/* ─ 06 The Opening ─ */}
        <NVChapter t={th} no={6} kicker={t('notes.journey.ch6Kicker')} ko={t('notes.journey.ch6Title')} en={t('notes.journey.ch6Sub')}>
          <View
            style={card({
              paddingTop: 18,
              paddingHorizontal: 14,
              paddingBottom: 14,
              borderWidth: 1,
              borderColor: withAlpha(th.gold, 0.4),
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingBottom: 12,
                borderBottomWidth: 0.5,
                borderBottomColor: th.border,
                marginBottom: 14,
              }}
            >
              <NVMeta t={th} k={t('notes.journey.metaCork')} v={t('notes.journey.openingCork')} />
              <View style={{ width: 1, height: 26, backgroundColor: th.border }} />
              <NVMeta t={th} k={t('notes.journey.metaDecant')} v={t('notes.journey.openingDecant')} accent={th.gold} />
            </View>

            {/* Journey timeline */}
            <View style={{ position: 'relative', paddingLeft: 0 }}>
              {stops.map((s, i) => (
                <NVStop
                  key={`${s.label}-${i}`}
                  t={th}
                  label={s.label}
                  time={clockAt(vm.tastedAt, s.offsetMin)}
                  body={s.body}
                  peak={s.peak}
                  peakLabel={t('notes.journey.peakMoment')}
                />
              ))}
            </View>

            {/* T+4 delta */}
            <View style={{ marginTop: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: th.bg, borderWidth: 0.5, borderColor: withAlpha(th.gold, 0.53) }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <Text allowFontScaling={false} style={{ fontFamily: th.display, fontSize: 16, color: th.gold }}>
                  {t('notes.journey.t4Title')}
                </Text>
                <Text allowFontScaling={false} style={{ fontFamily: th.serif, fontStyle: 'italic', fontSize: 11, color: th.textMuted }}>
                  {t('notes.journey.t4Sub')}
                </Text>
                <View style={{ flex: 1 }} />
                <Text allowFontScaling={false} style={{ fontFamily: th.bold, fontSize: 9, color: th.gold, letterSpacing: 1.4 }}>
                  {t('notes.journey.t4Vs')}
                </Text>
              </View>
              {deltaRows.map((row, i) => (
                <View
                  key={i}
                  style={{
                    paddingVertical: 7,
                    borderBottomWidth: i < deltaRows.length - 1 ? 0.5 : 0,
                    borderBottomColor: th.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 11, color: th.textSecondary, flex: 1 }}>
                    {row.label}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {[-2, -1, 0, 1, 2].map((v) => {
                      const on = v === row.d;
                      return (
                        <View
                          key={v}
                          style={{
                            width: 22,
                            height: 20,
                            borderRadius: 4,
                            backgroundColor: on ? th.gold : 'transparent',
                            borderWidth: 0.5,
                            borderColor: on ? th.gold : th.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text allowFontScaling={false} style={{ fontFamily: th.bold, fontSize: 9.5, color: on ? th.onAccent : th.textMuted }}>
                            {v > 0 ? `+${v}` : String(v)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            {/* Verdict band — drink window */}
            <View style={{ marginTop: 14, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: th.surface, borderWidth: 0.5, borderColor: th.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Info size={11} strokeWidth={1.75} color={th.gold} />
                <Text allowFontScaling={false} style={{ fontFamily: th.bold, fontSize: 10, color: th.gold, letterSpacing: 1.4, textTransform: 'uppercase' }}>
                  {t('notes.journey.verdictBandEyebrow')}
                </Text>
              </View>
              <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 10.5, color: th.textSecondary, lineHeight: 16.3 }}>
                {t('notes.journey.verdictBandBody', {
                  vintage: vm.vintage ?? vm.dwFrom,
                  peak: t('notes.journey.peakLabel', { year: vm.dwPeak }),
                })}
              </Text>
              <DrinkWindowBar th={th} from={vm.dwFrom} peak={vm.dwPeak} to={vm.dwTo} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 9, color: th.textMuted }}>
                  {vm.dwFrom}
                </Text>
                <Text allowFontScaling={false} style={{ fontFamily: th.bodyMed, fontSize: 9, color: th.gold }}>
                  {t('notes.journey.peakLabel', { year: vm.dwPeak })}
                </Text>
                <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 9, color: th.textMuted }}>
                  {vm.dwTo}
                </Text>
              </View>
            </View>
          </View>
        </NVChapter>

        {/* ─ 07 Verdict ─ */}
        <NVChapter
          t={th}
          no={7}
          kicker={t('notes.journey.ch7Kicker')}
          ko={t('notes.journey.ch7Title')}
          en={t('notes.journey.ch7Sub', { rating: vm.rating })}
        >
          <View style={card({ paddingVertical: 20, paddingHorizontal: 18 })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <NVRating t={th} value={vm.rating} size={16} />
              <View style={{ flex: 1 }} />
              <Text allowFontScaling={false} style={{ fontFamily: th.display, fontSize: 30, color: th.gold, lineHeight: 30 }}>
                {vm.rating.toFixed(1)}
              </Text>
              <Text allowFontScaling={false} style={{ fontFamily: th.body, fontSize: 11, color: th.textMuted, alignSelf: 'flex-end', marginBottom: 4 }}>
                {t('notes.journey.outOf')}
              </Text>
            </View>

            <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: th.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Sparkles size={11} strokeWidth={1.75} color={th.gold} />
                <Text allowFontScaling={false} style={{ fontFamily: th.bold, fontSize: 9, color: th.gold, letterSpacing: 1.6, textTransform: 'uppercase' }}>
                  {t('notes.journey.closingEyebrow')}
                </Text>
              </View>
              <Text allowFontScaling={false} style={{ fontFamily: th.serif, fontStyle: 'italic', fontSize: 14, color: th.textPrimary, lineHeight: 24.5 }}>
                {closing}
              </Text>
            </View>
          </View>
        </NVChapter>

        {/* close diamond */}
        <View style={{ position: 'relative', paddingTop: 24, paddingLeft: 64, paddingRight: 22, height: 48 }}>
          <View
            style={{
              position: 'absolute',
              left: 32,
              top: 22,
              width: 8,
              height: 8,
              transform: [{ rotate: '45deg' }],
              backgroundColor: th.gold,
              opacity: 0.75,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// drink-window track (5-stop gold/wine gradient) + current marker
function DrinkWindowBar({ th, from, peak, to }: { th: JourneyTheme; from: number; peak: number; to: number }) {
  const now = new Date().getFullYear();
  const span = Math.max(1, to - from);
  const pos = Math.min(1, Math.max(0, (now - from) / span));
  return (
    <View style={{ marginTop: 10, height: 6, borderRadius: 999, position: 'relative', borderWidth: 0.5, borderColor: th.border, overflow: 'visible' }}>
      <LinearGradient
        colors={[withAlpha(th.textDisabled, 0.33), th.gold, th.wine, th.gold, withAlpha(th.textDisabled, 0.33)]}
        locations={[0, 0.45, 0.5, 0.55, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 999 }}
      />
      <View
        style={{
          position: 'absolute',
          left: `${pos * 100}%`,
          top: -4,
          width: 14,
          height: 14,
          marginLeft: -7,
          borderRadius: 999,
          backgroundColor: th.cream,
          borderWidth: 2,
          borderColor: th.wine,
        }}
      />
    </View>
  );
}

// Chapter-1 sight glass — wine in a glass (keyscreen wf path verbatim, themed)
function SightGlass({ th }: { th: JourneyTheme }) {
  const id = `nv-wf-${th.scheme}`;
  return (
    <Svg width={64} height={80} viewBox="0 0 64 80">
      <Defs>
        <SvgLinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={th.wine} stopOpacity={0.95} />
          <Stop offset="100%" stopColor={th.wineSoft} stopOpacity={1} />
        </SvgLinearGradient>
      </Defs>
      <Path d="M16 8 Q16 32 32 38 Q48 32 48 8 Z" fill={withAlpha(th.gold, 0.07)} stroke={th.gold} strokeWidth={0.8} />
      <Path d="M19 13 Q19 30 32 36 Q45 30 45 13 Z" fill={`url(#${id})`} />
      <Line x1="32" y1="38" x2="32" y2="64" stroke={th.gold} strokeWidth={0.8} />
      <Line x1="22" y1="65" x2="42" y2="65" stroke={th.gold} strokeWidth={0.8} />
    </Svg>
  );
}
