/**
 * AromaWheelRn — UC Davis Aroma Wheel SVG (12 wedge) + active category 어휘 chips panel.
 *
 * 사양: 랜딩페이지 aroma-wheel.tsx 기반 RN 포팅.
 *   - 12 wedge SVG (각 30°), center 원 "aroma" italic label
 *   - 각 wedge: variant-필터링 후 선택된 어휘 count > 0 → gold badge
 *   - active wedge tap → 어휘 chips panel 노출
 *   - chip 각각 ko/en 라벨, on/off 토글 (gold border + wineRed bg active)
 *
 * RN deviation:
 *   D1: lucide icon은 SVG <g transform=...>로 임포트 불가 — 12 카테고리 ko/en label만 표시,
 *       icon은 chip 위가 아닌 panel 위 카테고리 라벨 옆 lucide React Native으로 노출.
 *   D2: hover tooltip (impactCompound) 제외 — RN 모바일 hover 없음.
 *   D3: SVG primitive는 react-native-svg.
 *   D4: Light 모드만.
 */
import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import {
  AROMA_CATEGORIES,
  AROMA_LEXICON,
  type AromaCategoryId,
  type FormVariant,
  type LexEntry,
} from '@/lib/notes/tasting-note-lexicon';

interface Props {
  variant: FormVariant;
  selected: readonly string[];
  onToggle: (id: string) => void;
}

export function AromaWheelRn({ variant, selected, onToggle }: Props) {
  const { t } = useTranslation();
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  const [activeCat, setActiveCat] = useState<AromaCategoryId>('fruity');

  // category → entries (variant-filtered)
  const lexByCategory = useMemo(() => {
    const m: Record<string, LexEntry[]> = {};
    AROMA_LEXICON.forEach((l) => {
      if (!l.appliesTo.includes(variant)) return;
      if (!m[l.category]) m[l.category] = [] as LexEntry[];
      m[l.category]!.push(l);
    });
    return m;
  }, [variant]);

  const wheelSize = 300;
  const center = wheelSize / 2;
  const outerR = center - 8;
  const innerR = 56;

  const handleWedgePress = (cat: AromaCategoryId) => {
    if (cat === activeCat) return;
    Haptics.selectionAsync().catch(() => undefined);
    setActiveCat(cat);
  };

  const handleChipPress = (id: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    onToggle(id);
  };

  const activeCategoryEntry = AROMA_CATEGORIES.find((c) => c.id === activeCat);
  const entries = lexByCategory[activeCat] ?? [];

  return (
    <View style={{ alignItems: 'center', rowGap: 16 }}>
      {/* Wheel SVG */}
      <Svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
        {/* inner circle */}
        <Circle cx={center} cy={center} r={innerR - 2} fill={light.bg.map} stroke={brand.gold} strokeOpacity={0.3} />
        <SvgText
          x={center}
          y={center + 3}
          textAnchor="middle"
          fill={brand.gold}
          fontSize={11}
          fontFamily="PlayfairDisplay_400Regular"
          fontStyle="italic"
        >
          aroma
        </SvgText>
        {AROMA_CATEGORIES.map((cat, i) => {
          const a0 = (i * 30 - 90) * (Math.PI / 180);
          const a1 = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const x0 = center + outerR * Math.cos(a0);
          const y0 = center + outerR * Math.sin(a0);
          const x1 = center + outerR * Math.cos(a1);
          const y1 = center + outerR * Math.sin(a1);
          const xi0 = center + innerR * Math.cos(a0);
          const yi0 = center + innerR * Math.sin(a0);
          const xi1 = center + innerR * Math.cos(a1);
          const yi1 = center + innerR * Math.sin(a1);
          const isActive = activeCat === cat.id;
          const labelAngle = (i + 0.5) * 30 - 90;
          const labelR = (outerR + innerR) / 2;
          const lx = center + labelR * Math.cos((labelAngle * Math.PI) / 180);
          const ly = center + labelR * Math.sin((labelAngle * Math.PI) / 180);
          const count = (lexByCategory[cat.id] ?? []).filter((l) =>
            selected.includes(l.id),
          ).length;
          const labelText = locale === 'ko' ? cat.ko : cat.en;
          return (
            <G key={cat.id} onPress={() => handleWedgePress(cat.id)}>
              <Path
                d={`M ${x0} ${y0} A ${outerR} ${outerR} 0 0 1 ${x1} ${y1} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 0 0 ${xi0} ${yi0} Z`}
                fill={cat.color}
                fillOpacity={isActive ? 0.95 : 0.55}
                stroke={isActive ? brand.gold : withAlpha(brand.cream, 0.08)}
                strokeWidth={isActive ? 2 : 1}
              />
              <SvgText
                x={lx}
                y={ly + 3}
                textAnchor="middle"
                fill={brand.cream}
                fontSize={9}
                fontWeight="600"
                fontFamily="Inter_600SemiBold"
              >
                {labelText}
              </SvgText>
              {count > 0 ? (
                <G>
                  <Circle cx={lx + 18} cy={ly - 12} r={7} fill={brand.gold} />
                  <SvgText
                    x={lx + 18}
                    y={ly - 9}
                    textAnchor="middle"
                    fill={light.bg.map}
                    fontSize={9}
                    fontWeight="700"
                    fontFamily="Inter_700Bold"
                  >
                    {count}
                  </SvgText>
                </G>
              ) : null}
            </G>
          );
        })}
      </Svg>

      {/* Active category chips panel */}
      {activeCategoryEntry ? (
        <View style={{ width: '100%' }}>
          {/* Eyebrow */}
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 11,
              lineHeight: 13.2,
              letterSpacing: 1.76,
              textTransform: 'uppercase',
              color: brand.gold,
              marginBottom: 8,
            }}
          >
            {locale === 'ko' ? activeCategoryEntry.ko : activeCategoryEntry.en}
          </Text>
          {/* chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, rowGap: 6 }}>
            {entries.map((lex) => {
              const isOn = selected.includes(lex.id);
              const label = locale === 'ko' ? lex.ko : lex.en;
              return (
                <Pressable
                  key={lex.id}
                  onPress={() => handleChipPress(lex.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isOn }}
                  accessibilityLabel={label}
                  hitSlop={4}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      columnGap: 4,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 9999,
                      borderWidth: 1,
                      borderColor: isOn ? brand.gold : light.border.default,
                      backgroundColor: isOn
                        ? withAlpha(brand.gold, 0.12)
                        : 'transparent',
                    }}
                  >
                    {isOn ? (
                      <Check size={11} strokeWidth={2.5} color={brand.gold} />
                    ) : null}
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontFamily: isOn ? 'Inter_600SemiBold' : 'Inter_400Regular',
                        fontSize: 12,
                        lineHeight: 14.4,
                        letterSpacing: 0.24,
                        color: isOn ? light.text.primary : light.text.secondary,
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {/* hint */}
          <Text
            allowFontScaling={false}
            style={{
              marginTop: 12,
              fontSize: 11,
              lineHeight: 13.2,
              fontStyle: 'italic',
              color: light.text.muted,
            }}
          >
            {t('notes.expert.aromaHint')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
