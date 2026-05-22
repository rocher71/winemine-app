/**
 * FaultChecklistRn — 11-fault accordion checklist.
 *
 * 사양: 랜딩페이지 fault-checklist.tsx 기반 RN 포팅.
 *   - 접힘/펼침 헤더 (좌측 WarningTriangle wineRed + 제목 + 선택 count)
 *   - 펼침 시 11 카드 그리드 (1열 — RN narrower, mobile-first)
 *   - 카드: check box + ko 이름 + cause/threshold/aroma 3 사이즈 11/10 메타
 *
 * RN deviation:
 *   D1: grid auto-fill 220 → flex column (mobile-first, RN 모바일에서 1열이 적절)
 *   D2: light 모드만
 */
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ChevronUp, ChevronDown, Check } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { FAULTS, type Fault } from '@/lib/notes/tasting-note-lexicon';

interface Props {
  selected: readonly Fault[];
  onToggle: (id: Fault) => void;
}

export function FaultChecklistRn({ selected, onToggle }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleToggle = (id: Fault) => {
    Haptics.selectionAsync().catch(() => undefined);
    onToggle(id);
  };

  return (
    <View
      style={{
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: withAlpha(brand.gold, 0.16),
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={t('notes.expert.faultsTitle')}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View
          style={{
            paddingHorizontal: 18,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, flex: 1 }}>
            <AlertTriangle size={16} strokeWidth={2} color={brand.wineRed} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                lineHeight: 16.8,
                color: light.text.primary,
              }}
            >
              {t('notes.expert.faultsTitle')}
            </Text>
            {selected.length > 0 ? (
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  lineHeight: 15.6,
                  color: brand.wineRed,
                }}
              >
                ({selected.length})
              </Text>
            ) : null}
          </View>
          {open ? (
            <ChevronUp size={14} strokeWidth={2} color={light.text.muted} />
          ) : (
            <ChevronDown size={14} strokeWidth={2} color={light.text.muted} />
          )}
        </View>
      </Pressable>

      {open ? (
        <View style={{ paddingHorizontal: 18, paddingBottom: 18 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              lineHeight: 16.8,
              color: light.text.muted,
              fontStyle: 'italic',
              marginBottom: 12,
            }}
          >
            {t('notes.expert.faultsIntro')}
          </Text>
          <View style={{ rowGap: 8 }}>
            {FAULTS.map((f) => {
              const isOn = selected.includes(f.id);
              return (
                <Pressable
                  key={f.id}
                  onPress={() => handleToggle(f.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isOn }}
                  accessibilityLabel={f.ko}
                  style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                >
                  <View
                    style={{
                      padding: 12,
                      backgroundColor: isOn
                        ? withAlpha(brand.wineRed, 0.08)
                        : light.bg.deep,
                      borderWidth: 1,
                      borderColor: isOn ? brand.gold : light.border.default,
                      borderRadius: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          borderWidth: 1.5,
                          borderColor: isOn ? brand.gold : light.text.muted,
                          backgroundColor: isOn ? brand.gold : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isOn ? <Check size={10} strokeWidth={3} color={light.bg.map} /> : null}
                      </View>
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 13,
                          lineHeight: 15.6,
                          color: light.text.primary,
                        }}
                      >
                        {f.ko}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 24, rowGap: 2 }}>
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 10,
                          lineHeight: 14,
                          color: light.text.secondary,
                        }}
                      >
                        <Text style={{ fontFamily: 'Inter_600SemiBold' }}>
                          {t('notes.expert.faultCause')}:
                        </Text>{' '}
                        {f.cause}
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 10,
                          lineHeight: 14,
                          color: light.text.secondary,
                        }}
                      >
                        <Text style={{ fontFamily: 'Inter_600SemiBold' }}>
                          {t('notes.expert.faultThreshold')}:
                        </Text>{' '}
                        {f.threshold}
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 10,
                          lineHeight: 14,
                          color: light.text.muted,
                          marginTop: 2,
                        }}
                      >
                        {f.aroma}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text
            allowFontScaling={false}
            style={{
              marginTop: 12,
              fontFamily: 'Inter_400Regular',
              fontSize: 10,
              lineHeight: 14,
              color: light.text.muted,
              fontStyle: 'italic',
            }}
          >
            {t('notes.expert.faultsFootnote')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
