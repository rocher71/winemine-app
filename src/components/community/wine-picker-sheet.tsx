/**
 * WinePickerSheet — 댓글에 와인을 태그할 때 뜨는 와인 선택 모달 (요구4).
 *
 * MOCK_WINES(LWIN) 를 검색·선택. 선택 시 onSelect(lwin) 호출 후 닫힘.
 * v0.2.0: supabase wines_localized 검색 RPC / 최근 캡처 와인 우선 노출.
 *
 * **light-only mode** (§0-2): dark variant 생략.
 * §4-11 Pressable 2-layer: 각 행 outer Pressable(opacity-only) + inner visual View.
 * §4-10: 원형 borderRadius / poke-out margin 없음 — 변환 대상 아님.
 */
import { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';
import { brand, light, type TypeCanonical } from '@/lib/design-tokens';
import { WMBottle } from '@/components/shared/wm-bottle';
import { MOCK_WINES } from '@/lib/mock/wines';

interface WinePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (lwin: string) => void;
}

export function WinePickerSheet({ visible, onClose, onSelect }: WinePickerSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_WINES;
    return MOCK_WINES.filter((w) => {
      const hay = [w.name_ko, w.display_name, w.producer_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const handleSelect = (lwin: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    onSelect(lwin);
    setQuery('');
  };

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: light.bg.deepest, paddingTop: insets.top > 0 ? 8 : 16 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text
            accessibilityRole="header"
            allowFontScaling={false}
            style={{
              flex: 1,
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 16,
              color: light.text.primary,
            }}
          >
            {t('community.comments.winePickerTitle')}
          </Text>
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} strokeWidth={2} color={light.text.secondary} />
            </View>
          </Pressable>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <View
            style={{
              height: 40,
              borderRadius: 12,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: light.border.default,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              gap: 8,
            }}
          >
            <Search size={16} strokeWidth={1.75} color={light.text.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('community.comments.winePickerSearch')}
              placeholderTextColor={light.text.muted}
              autoCorrect={false}
              style={{
                flex: 1,
                fontFamily: 'Freesentation_4Regular',
                fontSize: 13,
                color: light.text.primary,
                padding: 0,
              }}
            />
          </View>
        </View>

        {/* List */}
        <FlatList
          data={results}
          keyExtractor={(w) => w.lwin ?? w.display_name ?? ''}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 13,
                  color: light.text.muted,
                }}
              >
                {t('community.comments.winePickerEmpty')}
              </Text>
            </View>
          }
          renderItem={({ item: w }) => {
            const name = w.name_ko ?? w.display_name ?? 'Wine';
            const sub = [w.producer_name, w.vintage].filter(Boolean).join(' · ');
            return (
              <Pressable
                onPress={() => w.lwin && handleSelect(w.lwin)}
                accessibilityRole="button"
                accessibilityLabel={name}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View
                  style={{
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: light.border.default,
                  }}
                >
                  <WMBottle
                    width={18}
                    height={60}
                    bottleColor={w.bottle_color ?? brand.wineRed}
                    type={(w.type_canonical as TypeCanonical | null) ?? null}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      allowFontScaling={false}
                      numberOfLines={1}
                      style={{
                        fontFamily: 'Freesentation_4Regular',
                        fontSize: 13,
                        color: light.text.primary,
                      }}
                    >
                      {name}
                    </Text>
                    {!!sub && (
                      <Text
                        allowFontScaling={false}
                        numberOfLines={1}
                        style={{
                          marginTop: 2,
                          fontFamily: 'Freesentation_4Regular',
                          fontSize: 10,
                          color: light.text.muted,
                        }}
                      >
                        {sub}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}
