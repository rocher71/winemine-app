/**
 * journey-primitives.tsx — Tasting Journey 뷰의 테마 인지 RN 프리미티브.
 *
 * 디자인 출처: wm-note-view-c-themed.jsx 의 NV* 헬퍼들을 RN으로 1:1 포팅.
 * 색은 전부 JourneyTheme(t) 토큰 (하드코딩 hex 0). 조회 전용이라 인터랙션 없음 —
 * 장식 버튼은 View로 (§4-11 Pressable layout 회피 / read-only).
 */
import { Fragment } from 'react';
import { View, Text } from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  G,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { brand, withAlpha, wineTypeDot } from '@/lib/design-tokens';
import {
  AROMA_CATEGORIES,
  type AromaCategoryId,
} from '@/lib/notes/tasting-note-lexicon';
import type { JourneyTheme } from './journey-theme';

// ── Meta key/value column ──
export function NVMeta({
  t,
  k,
  v,
  accent,
}: {
  t: JourneyTheme;
  k: string;
  v: string;
  accent?: string;
}) {
  return (
    <View style={{ gap: 3 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: t.bodyMed,
          fontSize: 9,
          color: t.textMuted,
          letterSpacing: 1.3,
          textTransform: 'uppercase',
        }}
      >
        {k}
      </Text>
      <Text allowFontScaling={false} style={{ fontFamily: t.bodyMed, fontSize: 12, color: accent || t.textPrimary }}>
        {v}
      </Text>
    </View>
  );
}

// ── Pill chips ──
export function NVChips({ t, items, accent }: { t: JourneyTheme; items: string[]; accent?: string }) {
  const c = accent || t.gold;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
      {items.map((x, i) => (
        <View
          key={`${x}-${i}`}
          style={{
            paddingVertical: 4,
            paddingHorizontal: 9,
            borderRadius: 999,
            backgroundColor: withAlpha(c, 0.13),
            borderWidth: 0.5,
            borderColor: withAlpha(c, 0.66),
          }}
        >
          <Text allowFontScaling={false} style={{ fontFamily: t.bodyMed, fontSize: 10.5, color: c }}>
            {x}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── WSET dot-scale readout (read-only) ──
export function NVWSETReadout({
  t,
  label,
  value,
  range,
  unit,
}: {
  t: JourneyTheme;
  label: string;
  value: number;
  range: string[];
  unit?: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text allowFontScaling={false} style={{ fontFamily: t.bodyMed, fontSize: 12, color: t.textPrimary }}>
          {label}
        </Text>
        <View style={{ flex: 1 }} />
        <Text allowFontScaling={false} style={{ fontFamily: t.display, fontSize: 13, color: t.gold }}>
          {unit || range[value - 1]}
        </Text>
      </View>

      <View style={{ height: 14, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            position: 'absolute',
            left: 6,
            right: 6,
            top: 6.25,
            height: 1.5,
            backgroundColor: t.border,
          }}
        />
        {range.map((_, i) => {
          const v = i + 1;
          const on = v === value;
          const before = v <= value;
          const dot = on ? 14 : 6;
          return (
            <View key={v} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {on ? (
                <View
                  style={{
                    position: 'absolute',
                    width: dot + 6,
                    height: dot + 6,
                    borderRadius: 999,
                    backgroundColor: withAlpha(t.gold, 0.2),
                  }}
                />
              ) : null}
              <View
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: 999,
                  backgroundColor: before ? t.gold : t.textDisabled,
                }}
              />
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
        {range.map((l, i) => (
          <Text
            key={`${l}-${i}`}
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 8.5,
              fontFamily: i + 1 === value ? t.bodyMed : t.body,
              color: i + 1 === value ? t.textPrimary : t.textMuted,
            }}
          >
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ── Tannin texture pills (shows all, highlights selected) ──
export function NVTanninTexture({
  t,
  options,
  selected,
}: {
  t: JourneyTheme;
  options: { id: string; label: string }[];
  selected: string[];
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <View
            key={o.id}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 9,
              borderRadius: 999,
              backgroundColor: on ? withAlpha(t.gold, 0.13) : 'transparent',
              borderWidth: 0.5,
              borderColor: on ? t.gold : t.border,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{ fontFamily: on ? t.bold : t.body, fontSize: 10.5, color: on ? t.gold : t.textMuted }}
            >
              {o.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── 4-option wine type row (read-only) ──
export function NVTypeRow({
  t,
  value,
  labels,
}: {
  t: JourneyTheme;
  value: string;
  labels: { white: string; red: string; sparkling: string; blind: string };
}) {
  const opts = [
    { id: 'white', label: labels.white, c: wineTypeDot.white },
    { id: 'red', label: labels.red, c: t.wine },
    { id: 'sparkling', label: labels.sparkling, c: t.goldBright },
    { id: 'blind', label: labels.blind, c: t.textMuted },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {opts.map((o) => {
        const on = o.id === value;
        return (
          <View
            key={o.id}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 999,
              backgroundColor: on ? withAlpha(o.c, 0.15) : 'transparent',
              borderWidth: 1,
              borderColor: on ? o.c : t.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: o.c,
                opacity: on ? 1 : 0.5,
              }}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: on ? t.bold : t.bodyMed,
                fontSize: 11,
                color: on ? (t.scheme === 'light' ? t.ink : o.c) : t.textMuted,
              }}
            >
              {o.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Mode picker (read-only display of selected mode) ──
export function NVModeRow({
  t,
  mode,
  beginner,
  expert,
  selectedLabel,
}: {
  t: JourneyTheme;
  mode: 'beginner' | 'expert';
  beginner: { title: string; sub: string };
  expert: { title: string; sub: string };
  selectedLabel: string;
}) {
  const opts = [
    { id: 'beginner', ...beginner },
    { id: 'expert', ...expert },
  ] as const;
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {opts.map((o) => {
        const on = o.id === mode;
        return (
          <View
            key={o.id}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: on ? withAlpha(t.wine, 0.2) : t.surface,
              borderWidth: 1,
              borderColor: on ? t.gold : t.border,
              overflow: 'hidden',
            }}
          >
            {on ? (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  paddingVertical: 3,
                  paddingHorizontal: 6,
                  backgroundColor: t.gold,
                  borderBottomLeftRadius: 8,
                }}
              >
                <Text allowFontScaling={false} style={{ fontFamily: t.bold, fontSize: 9, color: t.onAccent, letterSpacing: 0.4 }}>
                  {selectedLabel}
                </Text>
              </View>
            ) : null}
            <Text
              allowFontScaling={false}
              style={{ fontFamily: t.display, fontSize: 13, color: on ? t.textPrimary : t.textSecondary }}
            >
              {o.title}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ fontSize: 9.5, color: on ? t.textSecondary : t.textMuted, marginTop: 3, lineHeight: 13 }}
            >
              {o.sub}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── 5-glass rating ──
export function NVRating({ t, value, size = 14 }: { t: JourneyTheme; value: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = i < Math.floor(value);
        const half = !fill && i < value;
        const op = fill ? 1 : half ? 0.6 : 0.3;
        return (
          <Svg key={i} width={size} height={size * 1.3} viewBox="0 0 12 16">
            <Path
              d="M3 2 Q3 7 6 8 Q9 7 9 2 Z"
              fill={fill ? t.gold : 'transparent'}
              stroke={t.gold}
              strokeWidth={0.7}
              opacity={op}
            />
            <Line x1="6" y1="8" x2="6" y2="13" stroke={t.gold} strokeWidth={0.6} opacity={fill || half ? 1 : 0.3} />
            <Line x1="3.5" y1="13.5" x2="8.5" y2="13.5" stroke={t.gold} strokeWidth={0.6} opacity={fill || half ? 1 : 0.3} />
          </Svg>
        );
      })}
    </View>
  );
}

const TO_RAD = (d: number) => ((d - 90) * Math.PI) / 180;

// ── 12-wedge UC Davis aroma wheel ──
export function NVAromaWheel({
  t,
  size = 220,
  active,
  selected,
  locale,
}: {
  t: JourneyTheme;
  size?: number;
  active: AromaCategoryId[];
  selected: AromaCategoryId;
  locale: 'ko' | 'en';
}) {
  const cx = size / 2;
  const cy = size / 2;
  const rOut = size * 0.45;
  const rIn = size * 0.18;
  const ang = 360 / AROMA_CATEGORIES.length;
  const gradId = `nv-wheel-${t.scheme}`;
  const wedgeText = t.scheme === 'light' ? t.ink : brand.white;
  const wedgeFaint = t.scheme === 'light' ? withAlpha(t.ink, 0.6) : withAlpha(brand.white, 0.6);
  const wedgeStroke = t.scheme === 'light' ? withAlpha(t.ink, 0.08) : withAlpha(t.cream, 0.08);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={t.wheelCenter[0]} />
          <Stop offset="100%" stopColor={t.wheelCenter[1]} />
        </RadialGradient>
      </Defs>
      {AROMA_CATEGORIES.map((c, i) => {
        const a0 = i * ang;
        const a1 = (i + 1) * ang;
        const x0 = cx + rIn * Math.cos(TO_RAD(a0));
        const y0 = cy + rIn * Math.sin(TO_RAD(a0));
        const x1 = cx + rOut * Math.cos(TO_RAD(a0));
        const y1 = cy + rOut * Math.sin(TO_RAD(a0));
        const x2 = cx + rOut * Math.cos(TO_RAD(a1));
        const y2 = cy + rOut * Math.sin(TO_RAD(a1));
        const x3 = cx + rIn * Math.cos(TO_RAD(a1));
        const y3 = cy + rIn * Math.sin(TO_RAD(a1));
        const isOn = active.includes(c.id);
        const isSel = selected === c.id;
        const opacity = isSel ? 1 : isOn ? 0.88 : t.scheme === 'light' ? 0.45 : 0.35;
        const path = `M ${x0} ${y0} L ${x1} ${y1} A ${rOut} ${rOut} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 0 ${x0} ${y0} Z`;
        const am = a0 + ang / 2;
        const tr = (rIn + rOut) / 2;
        const tx = cx + tr * Math.cos(TO_RAD(am));
        const ty = cy + tr * Math.sin(TO_RAD(am));
        const label = locale === 'ko' ? c.ko : c.en;
        return (
          <Fragment key={c.id}>
            <Path
              d={path}
              fill={c.color}
              opacity={opacity}
              stroke={isSel ? t.cream : wedgeStroke}
              strokeWidth={isSel ? 1.6 : 0.5}
            />
            <SvgText
              x={tx}
              y={ty + 3}
              textAnchor="middle"
              fontFamily={isOn ? t.bodyMed : t.body}
              fontSize={9}
              fill={isOn ? wedgeText : wedgeFaint}
            >
              {label}
            </SvgText>
            {isOn ? (
              <Circle
                cx={cx + (rOut - 6) * Math.cos(TO_RAD(am))}
                cy={cy + (rOut - 6) * Math.sin(TO_RAD(am))}
                r={4}
                fill={t.gold}
              />
            ) : null}
          </Fragment>
        );
      })}
      <Circle cx={cx} cy={cy} r={rIn - 2} fill={`url(#${gradId})`} stroke={t.border} strokeWidth={0.5} />
      {/* center glass glyph */}
      <G transform={`translate(${cx}, ${cy})`}>
        <Path d="M-7 -9 Q-7 0 0 2 Q7 0 7 -9 Z" fill="transparent" stroke={t.gold} strokeWidth={1.1} />
        <Line x1="0" y1="2" x2="0" y2="9" stroke={t.gold} strokeWidth={1} />
        <Line x1="-5" y1="9.5" x2="5" y2="9.5" stroke={t.gold} strokeWidth={1} />
      </G>
    </Svg>
  );
}

// ── Caudalie ring (finish length) ──
export function NVCaudalieRing({
  t,
  value,
  size = 140,
  label,
}: {
  t: JourneyTheme;
  value: number;
  size?: number;
  label: string;
}) {
  const r = size * 0.42;
  const C = 2 * Math.PI * r;
  const pct = Math.min(1, value / 45);
  const cx = size / 2;
  const cy = size / 2;
  const gradId = `nv-caud-${t.scheme}-${value}`;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={t.wheelCenter[0]} />
            <Stop offset="100%" stopColor={t.wheelCenter[1]} />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={r + 4} fill={`url(#${gradId})`} />
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={t.border} strokeWidth={4} />
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={t.gold}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={`${C * pct} ${C}`}
          />
        </G>
        <SvgText
          x={cx}
          y={cy + size * 0.04}
          textAnchor="middle"
          fontFamily={t.display}
          fontSize={size * 0.32}
          fill={t.textPrimary}
        >
          {String(value)}
        </SvgText>
        <SvgText
          x={cx}
          y={cy + size * 0.22}
          textAnchor="middle"
          fontFamily={t.body}
          fontSize={9.5}
          fill={t.textMuted}
        >
          CAUDALIES
        </SvgText>
      </Svg>
      <View
        style={{
          marginTop: -10,
          paddingVertical: 5,
          paddingHorizontal: 14,
          borderRadius: 999,
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.gold,
        }}
      >
        <Text allowFontScaling={false} style={{ fontFamily: t.display, fontSize: 13, color: t.gold, letterSpacing: 0.65 }}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// ── Chapter container — spine node + heading ──
export function NVChapter({
  t,
  no,
  kicker,
  ko,
  en,
  children,
}: {
  t: JourneyTheme;
  no: number;
  kicker: string;
  ko: string;
  en: string;
  children: React.ReactNode;
}) {
  const SPINE_X = 36;
  const NODE = 22;
  return (
    <View style={{ position: 'relative', paddingLeft: 64, paddingRight: 22, marginTop: 26 }}>
      <View
        style={{
          position: 'absolute',
          left: SPINE_X - NODE / 2,
          top: 2,
          width: NODE,
          height: NODE,
          borderRadius: NODE / 2,
          backgroundColor: t.bg,
          borderWidth: 1,
          borderColor: t.gold,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          // 0 0 0 4px bg ring → emulate with shadow-less ring via border can't; use shadow gold glow
          shadowColor: t.gold,
          shadowOpacity: 0.5,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        }}
      >
        <Text allowFontScaling={false} style={{ fontFamily: t.display, fontSize: 11, color: t.gold }}>
          {String(no).padStart(2, '0')}
        </Text>
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: t.bold, fontSize: 9, color: t.gold, letterSpacing: 2.16, textTransform: 'uppercase' }}
        >
          {kicker}
        </Text>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 22, color: t.textPrimary, marginTop: 4, lineHeight: 26 }}
        >
          {ko}
        </Text>
        <Text allowFontScaling={false} style={{ fontFamily: t.body, fontSize: 11, color: t.textMuted, marginTop: 2, letterSpacing: 0.66 }}>
          {en}
        </Text>
      </View>
      {children}
    </View>
  );
}

// ── Single opening-timeline stop ──
export function NVStop({
  t,
  label,
  time,
  body,
  peak,
  peakLabel,
}: {
  t: JourneyTheme;
  label: string;
  time: string;
  body: string;
  peak?: boolean;
  peakLabel?: string;
}) {
  const dot = peak ? 14 : 9;
  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      <View style={{ width: 56, paddingTop: 2 }}>
        <Text
          allowFontScaling={false}
          style={{ textAlign: 'right', fontFamily: peak ? t.bold : t.bodyMed, fontSize: 14, color: peak ? t.gold : t.textSecondary }}
        >
          {label}
        </Text>
        <Text allowFontScaling={false} style={{ textAlign: 'right', fontSize: 8.5, color: t.textMuted, marginTop: 2 }}>
          {time}
        </Text>
      </View>
      <View style={{ width: 14, alignItems: 'center' }}>
        <View
          style={{
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: peak ? t.gold : t.scheme === 'light' ? t.gold : t.cream,
            marginTop: 6,
            shadowColor: t.gold,
            shadowOpacity: peak ? 0.66 : 0,
            shadowRadius: peak ? 8 : 0,
            shadowOffset: { width: 0, height: 0 },
            elevation: peak ? 4 : 0,
          }}
        />
      </View>
      <View style={{ flex: 1, paddingBottom: 18 }}>
        {peak && peakLabel ? (
          <View style={{ alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999, backgroundColor: t.gold, marginBottom: 5 }}>
            <Text allowFontScaling={false} style={{ fontFamily: t.bold, fontSize: 9, color: t.onAccent, letterSpacing: 1.6 }}>
              {peakLabel}
            </Text>
          </View>
        ) : null}
        <Text
          allowFontScaling={false}
          style={{ fontFamily: peak ? t.bodyMed : t.body, fontSize: 12, color: peak ? t.textPrimary : t.textSecondary, lineHeight: 18.6 }}
        >
          {body}
        </Text>
      </View>
    </View>
  );
}
