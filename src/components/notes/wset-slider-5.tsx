/**
 * WSETSlider5 — 5-step radial dots WSET slider (keyscreen verbatim).
 *
 * 사양: ../winemine-keyscreen/src/components/tasting-note/wset-slider.tsx line 67~171.
 * - 5점 (1=low, 2=mediumMinus, 3=medium, 4=mediumPlus, 5=high)
 * - 활성 dot은 gold + glow (boxShadow inset → RN shadow)
 * - 활성 trailing track은 gold, 그 외 border-default
 * - 우측에 active label ("Low"/"M−"/"Med"/"M+"/"High")
 * - 좌측 라벨 (props.label) — Inter 600 13 uppercase text-primary
 *
 * RN deviation D1: CSS box-shadow → RN shadowColor/Radius (iOS) + elevation (Android).
 * Light 모드만 (라이트 토큰 직접 사용 — useColorScheme 미사용).
 */
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';

interface Props {
  label: string;
  value: number; // 1..5
  onChange: (v: number) => void;
}

const ORDER = [1, 2, 3, 4, 5] as const;

const LABELS_KO: Record<number, string> = {
  1: '낮음',
  2: '중−',
  3: '중',
  4: '중+',
  5: '높음',
};

const LABELS_EN: Record<number, string> = {
  1: 'Low',
  2: 'M−',
  3: 'Med',
  4: 'M+',
  5: 'High',
};

import { currentLocale } from '@/lib/i18n';

export function WSETSlider5({ label, value, onChange }: Props) {
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  const labels = locale === 'en' ? LABELS_EN : LABELS_KO;
  const activeLabel = labels[value] ?? labels[3];

  const handlePress = (v: number) => {
    if (v === value) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(v);
  };

  return (
    <View>
      {/* Header row: label + active-label */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_6SemiBold',
            fontSize: 13,
            lineHeight: 15.6,
            letterSpacing: 0.26,
            textTransform: 'uppercase',
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

      {/* 5-step radial track */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 1, max: 5, now: value, text: activeLabel }}
      >
        {ORDER.map((step, idx) => {
          const active = idx <= value - 1;
          const isCurrent = idx === value - 1;
          const size = isCurrent ? 18 : 12;
          return (
            <View key={step} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => handlePress(step)}
                accessibilityRole="button"
                accessibilityLabel={`${label} ${labels[step]}`}
                hitSlop={10}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: active ? brand.gold : light.border.default,
                    // glow on current
                    ...(isCurrent
                      ? {
                          shadowColor: brand.gold,
                          shadowOpacity: 0.5,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        }
                      : null),
                  }}
                />
              </Pressable>
              {idx < ORDER.length - 1 ? (
                <View
                  aria-hidden
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: idx < value - 1 ? brand.gold : light.border.default,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
