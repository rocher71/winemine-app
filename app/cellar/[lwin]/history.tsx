/**
 * Cellar drink history — `/cellar/[lwin]/history`.
 *
 * UX 결정: ux-decisions/cellar-tasted-tab.md Decision 2 + 3.
 *
 * 구조:
 *   BackHeader (wine name)
 *   FlatList (consumed_at DESC):
 *     - 각 row: consumed_at 날짜 + 노트 유무 인디케이터
 *     - row tap → /cellar/${lwin}?id=${item.id} (기존 상세 페이지)
 *   하단 고정 CTA: "또 마셨어요" (wine-red PrimaryButton)
 *     → insertDrinkAgain(lwin) → DrinkAgainSheet 오픈
 */
import { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight, FileText, FilePlus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BackHeader } from '@/components/nav/back-header';
import { PrimaryButton } from '@/components/shared/primary-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Toast } from '@/components/shared/toast';
import { DrinkAgainSheet } from '@/components/cellar/drink-again-sheet';
import {
  useCellarHistory,
  insertDrinkAgain,
  type CellarItemWithWine,
} from '@/hooks/use-cellar';
import { getLocalizedWineName } from '@/lib/lwin';
import { currentLocale } from '@/lib/i18n';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export default function CellarHistoryScreen() {
  const { lwin: lwinParam } = useLocalSearchParams<{ lwin: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { bg, border, text } = useThemeTokens();

  const { items, loading, refresh } = useCellarHistory(lwin);
  const [busy, setBusy] = useState(false);
  const [sheetItemId, setSheetItemId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const flashToast = useCallback((tone: 'success' | 'error', message: string) => {
    setToast({ tone, message });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const wine = items[0]?.wine ?? null;
  const headerTitle = wine
    ? getLocalizedWineName(currentLocale(), {
        name_ko: wine.name_ko,
        display_name: wine.display_name ?? '',
      }).primary
    : t('cellar.history.title');

  const onRowPress = useCallback(
    (item: CellarItemWithWine) => {
      if (!lwin) return;
      Haptics.selectionAsync().catch(() => undefined);
      router.push(
        `/cellar/${encodeURIComponent(lwin)}?id=${encodeURIComponent(item.id)}` as never,
      );
    },
    [lwin],
  );

  const onDrinkAgain = useCallback(async () => {
    if (!lwin || busy) return;
    setBusy(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      const { id } = await insertDrinkAgain(lwin);
      await refresh();
      setSheetItemId(id);
      setSheetOpen(true);
    } catch (err) {
      console.warn('[cellar history] drink-again failed:', err);
      flashToast('error', t('cellar.swipe.updateFailed'));
    } finally {
      setBusy(false);
    }
  }, [lwin, busy, refresh, flashToast, t]);

  const onWriteNote = useCallback(
    (cellarItemId: string) => {
      if (!lwin) return;
      setSheetOpen(false);
      const qs = new URLSearchParams({
        from: 'cellar',
        source: 'cellar',
        itemId: cellarItemId,
        cellarItemId,
        wine_lwin: lwin,
      }).toString();
      router.push(`/notes/new/write?${qs}` as never);
    },
    [lwin],
  );

  const renderItem = useCallback(
    ({ item }: { item: CellarItemWithWine }) => {
      const dateStr = item.consumed_at ? item.consumed_at.slice(0, 10) : '—';
      // v0.1.0: 노트 유무는 notes_ko/notes_en 존재 여부로 추정 (cellar_item_id FK는 후속 migration).
      const hasNote = Boolean(item.notes_ko || item.notes_en);
      return (
        <Pressable
          onPress={() => onRowPress(item)}
          accessibilityRole="link"
          accessibilityLabel={t('cellar.history.consumedOn', { date: dateStr })}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 14,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: bg.surface,
              borderWidth: 1,
              borderColor: border.default,
            }}
          >
            <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  lineHeight: 18,
                  color: text.primary,
                }}
              >
                {t('cellar.history.consumedOn', { date: dateStr })}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                {hasNote ? (
                  <FileText size={12} strokeWidth={1.75} color={brand.gold} />
                ) : (
                  <FileText size={12} strokeWidth={1.75} color={text.muted} />
                )}
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    lineHeight: 15,
                    color: hasNote ? brand.gold : text.muted,
                  }}
                >
                  {hasNote ? t('cellar.history.noteExists') : t('cellar.history.noNote')}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} strokeWidth={2} color={text.muted} />
          </View>
        </Pressable>
      );
    },
    [bg.surface, border.default, text.primary, text.muted, onRowPress, t],
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64 }}>
          <ActivityIndicator color={brand.gold} />
        </View>
      );
    }
    return (
      <View style={{ paddingVertical: 32 }}>
        <EmptyState
          illustration={<FilePlus size={48} strokeWidth={1.25} color={brand.gold} />}
          title={t('cellar.history.empty')}
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={headerTitle} />

      <FlatList
        data={loading ? [] : items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 24 + 64 + insets.bottom,
          gap: 10,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* 하단 고정 CTA — 또 마셨어요 */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12 + insets.bottom,
          backgroundColor: bg.deepest,
          borderTopWidth: 1,
          borderTopColor: border.default,
        }}
      >
        <PrimaryButton
          label={t('cellar.history.drinkAgain')}
          size="lg"
          variant="primary"
          loading={busy}
          onPress={onDrinkAgain}
        />
      </View>

      <DrinkAgainSheet
        open={sheetOpen}
        cellarItemId={sheetItemId}
        onClose={() => setSheetOpen(false)}
        onWriteNote={onWriteNote}
      />

      {toast ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', bottom: 96 + insets.bottom, left: 16, right: 16, zIndex: 11 }}
        >
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </View>
  );
}
