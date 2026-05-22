/**
 * WSETSlider5 — 5-step radial dots WSET slider.
 *
 * 사양: 랜딩페이지 wset-slider.tsx 기반 RN 포팅.
 *   - 5 dots aligned along a thin track
 *   - Active dot (idx === value-1) gets gold + glow shadow
 *   - All dots non-current: light.bg.map (track bg) + light.border.default border
 *   - 우측 active label (props.labels[value][locale]) gold 12
 *   - 좌측 props.label Inter 600 13 text-primary
 *   - Optional hint Inter 11 italic muted, below the label row
 *
 * RN deviation:
 *   D1: CSS box-shadow → RN shadowColor/Radius (iOS) + elevation (Android)
 *   D2: track div(left:7, right:7) absolutely positioned underneath dots → RN
 *       absolute View
 *
 * 인터페이스:
 *   - 새 인터페이스 (value: WSETScale, labels prop) — 랜딩과 동일
 *   - Legacy adapter는 expert-form에서 wsetToNumber/numberToWset helpers로 처리.
 */
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import {
  WSET_ORDER,
  INTENSITY_LABELS,
  type WSETScale,
} from '@/lib/notes/tasting-note-lexicon';

interface Props {
  label: string;
  value: WSETScale;
  onChange: (v: WSETScale) => void;
  labels?: Record<WSETScale, { ko: string; en: string }>;
  hint?: string;
}

export function WSETSlider5({ label, value, onChange, labels = INTENSITY_LABELS, hint }: Props) {
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  const idx = WSET_ORDER.indexOf(value);
  const activeLabel = labels[value][locale];

  const handlePress = (v: WSETScale) => {
    if (v === value) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(v);
  };

  return (
    <View style={{ marginBottom: 4 }}>
      {/* Header row: label + active-label */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 13,
            lineHeight: 15.6,
            color: light.text.primary,
          }}
        >
          {label}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 12,
            lineHeight: 14.4,
            color: brand.gold,
          }}
        >
          {activeLabel}
        </Text>
      </View>

      {hint ? (
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            lineHeight: 13.2,
            color: light.text.muted,
            marginBottom: 8,
            fontStyle: 'italic',
          }}
        >
          {hint}
        </Text>
      ) : null}

      {/* 5-step track (track underneath + dots distributed evenly) */}
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 1, max: 5, now: idx + 1, text: activeLabel }}
        style={{
          position: 'relative',
          height: 24,
          justifyContent: 'center',
        }}
      >
        {/* Track */}
        <View
          style={{
            position: 'absolute',
            left: 7,
            right: 7,
            height: 2,
            top: 11,
            backgroundColor: light.border.default,
            borderRadius: 2,
          }}
        />
        {/* Dots row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {WSET_ORDER.map((s, i) => {
            const active = i === idx;
            return (
              <Pressable
                key={s}
                onPress={() => handlePress(s)}
                accessibilityRole="button"
                accessibilityLabel={`${label} ${labels[s][locale]}`}
                accessibilityState={{ selected: active }}
                hitSlop={12}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: active ? brand.gold : light.bg.map,
                    borderWidth: 1,
                    borderColor: active ? brand.gold : light.border.default,
                    ...(active
                      ? {
                          shadowColor: brand.gold,
                          shadowOpacity: 0.55,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        }
                      : null),
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
