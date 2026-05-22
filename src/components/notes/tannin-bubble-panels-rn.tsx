/**
 * TanninPanelRn (Red 전용) + BubblePanelRn (Sparkling 전용).
 *
 * 사양: 랜딩페이지 tannin-bubble-panels.tsx 기반 RN 포팅.
 *
 * TanninPanel:
 *   - WSETSlider5 intensity (TANNIN_INTENSITY_LABELS)
 *   - 4 texture groups (soft/fine/grippy/harsh) → 각 그룹 별 chips
 *   - 3 ripeness pills (unripe/ripe/overripe)
 *
 * BubblePanel:
 *   - size 3 chips (fine/medium/coarse)
 *   - persistence 4 chips
 *   - mousse 5 chips
 *   - pressure (1~6 step buttons — RN slider 대체)
 *   - method 5 chips
 *   - dosage 7 pills (DOSAGE_LABELS — name + range)
 *
 * RN deviation:
 *   D1: HTML <input type="range"> 미사용 → 6-step button row (1~6 bar)
 *   D2: Light 모드만
 */
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Wine, Sparkles } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { WSETSlider5 } from './wset-slider-5';
import {
  TANNIN_INTENSITY_LABELS,
  TANNIN_TEXTURE_LABELS,
  TANNIN_TEXTURE_GROUP_LABELS,
  DOSAGE_LABELS,
  SPARKLING_METHOD_LABELS,
  TEXTURE_SOFT,
  TEXTURE_FINE,
  TEXTURE_GRIPPY,
  TEXTURE_HARSH,
  type WSETScale,
  type TanninTexture,
  type TanninRipeness,
  type TanninTextureGroup,
  type BubbleSize,
  type BubblePersistence,
  type MousseTexture,
  type SparklingMethod,
  type SparklingDosage,
} from '@/lib/notes/tasting-note-lexicon';

// ── Tannin Panel ───────────────────────────────────────────────────────────

export interface TanninState {
  intensity: WSETScale;
  texture: TanninTexture;
  ripeness: TanninRipeness;
}

export function TanninPanelRn({
  state,
  onChange,
}: {
  state: TanninState;
  onChange: (s: TanninState) => void;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        padding: 14,
        backgroundColor: withAlpha(brand.wineRed, 0.06),
        borderWidth: 1,
        borderColor: brand.wineRed,
        borderRadius: 12,
        rowGap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
        <Wine size={14} strokeWidth={2} color={brand.wineRed} />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 11,
            lineHeight: 13.2,
            color: brand.wineRed,
            letterSpacing: 1.32,
            textTransform: 'uppercase',
          }}
        >
          {t('notes.expert.palateTannin')}
        </Text>
      </View>

      <WSETSlider5
        label={t('notes.expert.tanninIntensity')}
        value={state.intensity}
        onChange={(v) => onChange({ ...state, intensity: v })}
        labels={TANNIN_INTENSITY_LABELS}
      />

      <View style={{ rowGap: 6 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            lineHeight: 14.4,
            color: light.text.muted,
            marginBottom: 4,
          }}
        >
          {t('notes.expert.tanninTexture')}
        </Text>
        <TextureGroupRow
          groupId="soft"
          textures={TEXTURE_SOFT}
          active={state.texture}
          onSelect={(tex) => onChange({ ...state, texture: tex })}
          accent={brand.gold}
        />
        <TextureGroupRow
          groupId="fine"
          textures={TEXTURE_FINE}
          active={state.texture}
          onSelect={(tex) => onChange({ ...state, texture: tex })}
          accent={light.text.secondary}
        />
        <TextureGroupRow
          groupId="grippy"
          textures={TEXTURE_GRIPPY}
          active={state.texture}
          onSelect={(tex) => onChange({ ...state, texture: tex })}
          accent="#A05A3D"
        />
        <TextureGroupRow
          groupId="harsh"
          textures={TEXTURE_HARSH}
          active={state.texture}
          onSelect={(tex) => onChange({ ...state, texture: tex })}
          accent={brand.wineRed}
        />
      </View>

      <View style={{ flexDirection: 'row', columnGap: 6 }}>
        {(['unripe', 'ripe', 'overripe'] as const).map((r) => {
          const active = state.ripeness === r;
          return (
            <View key={r} style={{ flex: 1 }}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => undefined);
                  onChange({ ...state, ripeness: r });
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(`notes.expert.tanninRipeness.${r}`)}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View
                  style={{
                    paddingVertical: 8,
                    alignItems: 'center',
                    borderRadius: 6,
                    borderWidth: 1,
                    backgroundColor: active ? brand.wineRed : 'transparent',
                    borderColor: active ? brand.wineRed : light.border.default,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 12,
                      lineHeight: 14.4,
                      color: active ? brand.cream : light.text.muted,
                    }}
                  >
                    {t(`notes.expert.tanninRipeness.${r}`)}
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

function TextureGroupRow({
  groupId,
  textures,
  active,
  onSelect,
  accent,
}: {
  groupId: TanninTextureGroup;
  textures: readonly TanninTexture[];
  active: TanninTexture;
  onSelect: (t: TanninTexture) => void;
  accent: string;
}) {
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  const groupLabel = TANNIN_TEXTURE_GROUP_LABELS[groupId][locale];
  return (
    <View style={{ marginBottom: 4 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 9,
          lineHeight: 11,
          color: accent,
          letterSpacing: 1.08,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {groupLabel}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 4, rowGap: 4 }}>
        {textures.map((tex) => {
          const isOn = active === tex;
          return (
            <Pressable
              key={tex}
              onPress={() => {
                Haptics.selectionAsync().catch(() => undefined);
                onSelect(tex);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isOn }}
              accessibilityLabel={TANNIN_TEXTURE_LABELS[tex][locale]}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: isOn ? accent : 'transparent',
                  borderWidth: 1,
                  borderColor: isOn ? accent : light.border.default,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: isOn ? 'Inter_700Bold' : 'Inter_400Regular',
                    fontSize: 11,
                    lineHeight: 13.2,
                    color: isOn ? light.bg.map : light.text.secondary,
                  }}
                >
                  {TANNIN_TEXTURE_LABELS[tex][locale]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Bubble Panel ──────────────────────────────────────────────────────────

export interface BubbleState {
  size: BubbleSize;
  persistence: BubblePersistence;
  mousse: MousseTexture;
  pressure: number;
  method: SparklingMethod;
}

export function BubblePanelRn({
  bubbles,
  dosage,
  onBubbles,
  onDosage,
}: {
  bubbles: BubbleState;
  dosage: SparklingDosage;
  onBubbles: (b: BubbleState) => void;
  onDosage: (d: SparklingDosage) => void;
}) {
  const { t } = useTranslation();
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  return (
    <View
      style={{
        padding: 14,
        backgroundColor: withAlpha(brand.gold, 0.06),
        borderWidth: 1,
        borderColor: brand.gold,
        borderRadius: 12,
        rowGap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
        <Sparkles size={14} strokeWidth={2} color={brand.gold} />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 11,
            lineHeight: 13.2,
            color: brand.gold,
            letterSpacing: 1.32,
            textTransform: 'uppercase',
          }}
        >
          {t('notes.expert.bubbleSectionTitle')}
        </Text>
      </View>

      <ChipGroup label={t('notes.expert.bubbleSize')}>
        {(['fine', 'medium', 'coarse'] as const).map((s) => (
          <Chip
            key={s}
            active={bubbles.size === s}
            label={t(`notes.expert.bubbleSizeValue.${s}`)}
            onPress={() => onBubbles({ ...bubbles, size: s })}
          />
        ))}
      </ChipGroup>

      <ChipGroup label={t('notes.expert.bubblePersistence')}>
        {(['fleeting', 'steady', 'persistent', 'continuous'] as const).map((p) => (
          <Chip
            key={p}
            active={bubbles.persistence === p}
            label={t(`notes.expert.bubblePersistenceValue.${p}`)}
            onPress={() => onBubbles({ ...bubbles, persistence: p })}
          />
        ))}
      </ChipGroup>

      <ChipGroup label={t('notes.expert.bubbleMousse')}>
        {(['creamy', 'silky', 'frothy', 'soft', 'aggressive'] as const).map((m) => (
          <Chip
            key={m}
            active={bubbles.mousse === m}
            label={t(`notes.expert.bubbleMousseValue.${m}`)}
            onPress={() => onBubbles({ ...bubbles, mousse: m })}
          />
        ))}
      </ChipGroup>

      {/* Pressure 1~6 bar buttons */}
      <View>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 10,
            lineHeight: 12,
            color: light.text.muted,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {t('notes.expert.bubblePressure')} ({bubbles.pressure} {t('notes.expert.bubbleBar')})
        </Text>
        <View style={{ flexDirection: 'row', columnGap: 4 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const active = bubbles.pressure >= n;
            return (
              <View key={n} style={{ flex: 1 }}>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => undefined);
                    onBubbles({ ...bubbles, pressure: n });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} ${t('notes.expert.bubbleBar')}`}
                  hitSlop={6}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <View
                    style={{
                      height: 18,
                      borderRadius: 4,
                      backgroundColor: active ? brand.gold : light.border.default,
                    }}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      <ChipGroup label={t('notes.expert.bubbleMethod')}>
        {(['traditional', 'charmat', 'asti', 'ancestral', 'unknown'] as const).map((m) => (
          <Chip
            key={m}
            active={bubbles.method === m}
            label={SPARKLING_METHOD_LABELS[m][locale]}
            onPress={() => onBubbles({ ...bubbles, method: m })}
          />
        ))}
      </ChipGroup>

      {/* Dosage 7-pill grid 2-row */}
      <View>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 10,
            lineHeight: 12,
            color: light.text.muted,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {t('notes.expert.bubbleDosage')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, rowGap: 6 }}>
          {(
            ['brutNature', 'extraBrut', 'brut', 'extraDry', 'sec', 'demiSec', 'doux'] as const
          ).map((d) => {
            const active = dosage === d;
            return (
              <Pressable
                key={d}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => undefined);
                  onDosage(d);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={DOSAGE_LABELS[d][locale]}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    minWidth: 76,
                    alignItems: 'center',
                    rowGap: 2,
                    borderRadius: 8,
                    backgroundColor: active ? brand.wineRed : 'transparent',
                    borderWidth: 1,
                    borderColor: active ? brand.wineRed : light.border.default,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: active ? 'Inter_700Bold' : 'Inter_400Regular',
                      fontSize: 11,
                      lineHeight: 13.2,
                      color: active ? brand.cream : light.text.secondary,
                    }}
                  >
                    {DOSAGE_LABELS[d][locale]}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 9,
                      lineHeight: 11,
                      color: active ? withAlpha(brand.cream, 0.7) : light.text.muted,
                    }}
                  >
                    {DOSAGE_LABELS[d].range}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 10,
          lineHeight: 12,
          color: light.text.muted,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, rowGap: 6 }}>
        {children}
      </View>
    </View>
  );
}

function Chip({
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
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          backgroundColor: active ? brand.gold : 'transparent',
          borderWidth: 1,
          borderColor: active ? brand.gold : light.border.default,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: active ? 'Inter_700Bold' : 'Inter_400Regular',
            fontSize: 11,
            lineHeight: 13.2,
            color: active ? light.bg.map : light.text.secondary,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
