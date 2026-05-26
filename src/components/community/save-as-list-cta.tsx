/**
 * SaveAsListCta — Q&A 추천 섹션 하단 "이 결과를 리스트로 저장" CTA.
 * wine-red 그라디언트 배경 + Layers 아이콘 + 제목/서브텍스트 + chevron.
 * §4-11: 3-layer Pressable.
 * 디자인 원본: wm-lists-screens.jsx ScreenQAtoList CTA 버튼.
 */
import { View, Text, Pressable } from 'react-native';
import { Layers, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';

interface Props {
  topCount: number;
  onPress: () => void;
}

export function SaveAsListCta({ topCount, onPress }: Props) {
  const { t } = useTranslation();
  return (
    <View style={{ marginTop: 12 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
        accessibilityRole="button"
        accessibilityLabel={t('lists.qa.saveAsList')}
      >
        <View
          style={{
            padding: 14,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: brand.wineRed,
            shadowColor: brand.wineRed,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          {/* Left: icon + text */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.16)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={15} strokeWidth={2.2} color={brand.cream} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 14,
                  color: brand.cream,
                  letterSpacing: -0.1,
                }}
              >
                {t('lists.qa.saveAsList')}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  color: brand.goldSoft,
                  marginTop: 2,
                }}
              >
                {t('lists.qa.saveAsListSub', { count: topCount })}
              </Text>
            </View>
          </View>

          <ChevronRight size={16} strokeWidth={2.2} color={brand.cream} />
        </View>
      </Pressable>
    </View>
  );
}
