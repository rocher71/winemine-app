/**
 * CaudalieMeterRn — Peynaud caudalies(1s = 1 caudalie) live finish meter.
 *
 * 사양: 랜딩페이지 caudalie-meter.tsx 기반 RN 포팅.
 *   - SVG progress ring (RING_R=96, RING_CIRC = 2πR)
 *   - center 큰 숫자 (value), under "카우달리"/"caudalies" label, category label
 *   - 카테고리 4단계: short/medium/long/veryLong → 색 변화
 *   - tap "start" → 1초마다 +1 (RAF 대신 setInterval — RN simpler).
 *   - "stop" → onChange(elapsed)
 *   - "reset" → onChange(0)
 *
 * RN deviation:
 *   D1: requestAnimationFrame → setInterval(1000) — RN에서 RAF 사용 가능하지만 1초 단위
 *       정수 카운트만 필요. setInterval 더 단순·예측 가능.
 *   D2: Light 모드만.
 */
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react-native';
import { brand, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import {
  caudalieCategory,
  caudalieComparison,
  type FinishLength,
} from '@/lib/notes/tasting-note-lexicon';

const RING_SIZE = 200;
const RING_R = 88;
const RING_CIRC = 2 * Math.PI * RING_R;

interface Props {
  caudalies: number | null;
  onChange: (n: number) => void;
}

export function CaudalieMeterRn({ caudalies, onChange }: Props) {
  const { t } = useTranslation();
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(caudalies ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((n) => n + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  const value = running ? elapsed : caudalies ?? 0;
  const cat = caudalieCategory(value);
  const ringFill = Math.min(value / 30, 1);
  const offset = RING_CIRC * (1 - ringFill);

  const catColor: Record<FinishLength, string> = {
    short: light.text.disabled,
    medium: light.text.muted,
    long: brand.gold,
    veryLong: brand.wineRed,
  };
  const catLabel: Record<FinishLength, { ko: string; en: string }> = {
    short: { ko: '짧음', en: 'Short' },
    medium: { ko: '중간', en: 'Medium' },
    long: { ko: '긴', en: 'Long' },
    veryLong: { ko: '매우 긴', en: 'Very Long' },
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setElapsed(0);
    setRunning(true);
  };
  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    setRunning(false);
    onChange(elapsed);
  };
  const handleReset = () => {
    Haptics.selectionAsync().catch(() => undefined);
    setRunning(false);
    setElapsed(0);
    onChange(0);
  };

  return (
    <View style={{ alignItems: 'center', rowGap: 16 }}>
      {/* Ring */}
      <View style={{ width: RING_SIZE, height: RING_SIZE, position: 'relative' }}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke={light.border.default}
            strokeWidth={8}
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke={catColor[cat]}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRC}`}
            strokeDashoffset={offset}
            // start ring at 12 o'clock (rotate -90 degrees around center)
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>
        {/* Center value */}
        <View
          pointerEvents="none"
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
            allowFontScaling={false}
            style={{
              fontFamily: 'PlayfairDisplay_700Bold',
              fontSize: 56,
              lineHeight: 56,
              color: catColor[cat],
            }}
          >
            {value}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              lineHeight: 13.2,
              color: light.text.muted,
              marginTop: 4,
              letterSpacing: 0.44,
            }}
          >
            {t('notes.expert.caudalies')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 12,
              lineHeight: 14.4,
              color: catColor[cat],
              marginTop: 8,
            }}
          >
            {catLabel[cat][locale]}
          </Text>
        </View>
      </View>

      {/* Comparison */}
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
          lineHeight: 18,
          color: light.text.muted,
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        ≈ {caudalieComparison(value, locale)}
      </Text>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', columnGap: 12 }}>
        {!running ? (
          <Pressable
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel={t('notes.expert.caudalieStart')}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 9999,
                backgroundColor: brand.gold,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  lineHeight: 15.6,
                  color: brand.deepestDark,
                }}
              >
                {t('notes.expert.caudalieStart')}
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleStop}
            accessibilityRole="button"
            accessibilityLabel={t('notes.expert.caudalieStop')}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 9999,
                backgroundColor: brand.gold,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 13,
                  lineHeight: 15.6,
                  color: brand.deepestDark,
                }}
              >
                {t('notes.expert.caudalieStop')}
              </Text>
            </View>
          </Pressable>
        )}

        <Pressable
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel={t('notes.expert.caudalieReset')}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: 6,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: light.text.muted,
              backgroundColor: 'transparent',
            }}
          >
            <RefreshCw size={13} strokeWidth={2} color={light.text.muted} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                lineHeight: 15.6,
                color: light.text.muted,
              }}
            >
              {t('notes.expert.caudalieReset')}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
