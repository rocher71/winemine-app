/**
 * /wine/[lwin]/prices — 가격 상세 화면.
 *
 * 사양: _workspace/design-specs/wine-prices.md (Day 6 신규 화면).
 *
 * §10 결정 사항 (작업 요청):
 *   A: mock data 사용 (src/lib/mock/{purchases,stores}.ts) — supabase 마이그레이션 v0.2.0.
 *   B: PurchaseRow ChevronRight 제거 (profile link 부재 — noise 줄이기).
 *   C: PriceChart react-native-svg 수동 minimal line chart (axes + line + dots + avg).
 *      복잡한 tooltip drag 인터랙션은 생략 (사양 §6 #16).
 *      range 토글 keyscreen verbatim 3종 유지 (3M / 1Y / ALL).
 *   D: i18n `winePrices.notFound` 신규 키 (별도 namespace).
 *   E: gold 강조 색은 `light.border.active` 그대로 (wine-story 일관 — light.gold alias 도입 follow-up).
 *   F: AddMyPriceSheet 제출은 mock submit + Toast.
 *   G: store 선택 native Picker 대신 BottomSheet 내 chip list (deps 추가 최소화).
 *   H: PriceChart range 토글 active 배경 = light.border.active (사양 §10 H — wine-red 채도
 *      light 카드 부조화 회피).
 *   I: PriceDetailTable 빈 상태 verbatim 단일 Text.
 *
 * §0-2 light-only mode:
 *   - dark: className 금지.
 *   - 모든 색은 light.* 또는 brand.* 토큰 직접 inline.
 *   - useColorScheme 호출 안 함.
 *
 * RN deviation (§6):
 *   - #2 Recharts → react-native-svg 수동.
 *   - #4 PurchaseRow Link → onPress no-op + ChevronRight 제거 (§10 B).
 *   - #7 absolute CTA bottom 80 → bottom 16 + insets.bottom.
 *   - #9 framer-motion BottomSheet → @gorhom/bottom-sheet.
 *   - #11 store select → inline chip list (§10 G).
 *   - #12 date input → TextInput (YYYY-MM-DD).
 *   - #13 submit mock — console.log + toast (v0.2.0 supabase insert).
 *   - #16 tooltip drag → 생략 (v0.2.0).
 */
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useWine } from '@/hooks/use-wine';
import { useWinePrices } from '@/hooks/use-wine-prices';
import { PriceChart } from '@/components/wine-prices/price-chart';
import { PriceDetailTable } from '@/components/wine-prices/price-detail-table';
import { AddMyPriceCta } from '@/components/wine-prices/add-my-price-cta';
import { AddMyPriceSheet } from '@/components/wine-prices/add-my-price-sheet';
import { Toast } from '@/components/shared/toast';
import { brand, light } from '@/lib/design-tokens';

export default function WinePricesScreen() {
  const { lwin: lwinParam } = useLocalSearchParams<{ lwin: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const { t } = useTranslation();
  const { wine, loading: wineLoading } = useWine(lwin);
  const { purchases, loading: purchasesLoading } = useWinePrices(lwin);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'info' | 'success' | 'error' } | null>(null);

  const showToast = (message: string, tone: 'info' | 'success' | 'error') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2500);
  };

  // Loading
  if (wineLoading || purchasesLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('winePrices.header.title')} />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color={brand.gold} />
        </View>
      </View>
    );
  }

  // Error — wine 없음
  if (!wine?.lwin) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('winePrices.header.title')} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          <AlertCircle size={32} strokeWidth={1.5} color={light.text.muted} />
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 14,
              color: light.text.muted,
              textAlign: 'center',
            }}
          >
            {t('winePrices.notFound')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={t('winePrices.header.title')} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 96, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section A — PriceChart */}
        <PriceChart purchases={purchases} />

        {/* Section B — PriceDetailTable */}
        <PriceDetailTable purchases={purchases} />
      </ScrollView>

      {/* Absolute bottom CTA */}
      <AddMyPriceCta onPress={() => setSheetOpen(true)} />

      {/* Bottom sheet 폼 */}
      <AddMyPriceSheet
        open={sheetOpen}
        lwin={lwin}
        onClose={() => setSheetOpen(false)}
        onSuccess={(key, params) => {
          setSheetOpen(false);
          showToast(t(key, params), 'success');
        }}
        onError={(key) => {
          showToast(t(key), 'error');
        }}
      />

      {/* Toast */}
      {toast ? (
        <View
          style={{ position: 'absolute', left: 16, right: 16, bottom: 88 }}
          pointerEvents="none"
        >
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </View>
  );
}

// ---- Inline light-only BackHeader (사양 §0-2, wine-story 와 동일 패턴) ----

interface LightBackHeaderProps {
  title: string;
}

function LightBackHeader({ title }: LightBackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top,
        height: insets.top + 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        hitSlop={12}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          marginRight: 12,
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <ChevronLeft size={24} strokeWidth={1.75} color={light.text.primary} />
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: 'Freesentation_4Regular',
          fontWeight: '600',
          fontSize: 16,
          lineHeight: 19.2,
          color: light.text.primary,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
