/**
 * Cellar detail — `/cellar/[lwin]`.
 *
 * 사양: cellar-cellared-tab.md Decisions 2–6.
 *
 * Decision 2: 1병 = MetaGrid 2×2, 2+병 = "내 보관 현황 N병" + 병별 카드 [편집][삭제]
 * Decision 3: "이 와인 마시기" — 1병: ConfirmDialog, 2+병: BottleCountSheet
 * Decision 4: cellar_item_id — 1병: item.id, N병: null (occasion-level)
 * Decision 5: 내 노트 — cellared 아이템도 이전 노트 목록 표시 (write 버튼 없음)
 * Decision 6: 구매가 vs 시세 compact card (purchase_price_krw null 시 숨김)
 *
 * 구조 (ScrollView):
 *   BackHeader (wine name + Delete icon)
 *   Section 1: CellarHero
 *   Section 2: DrinkWindowCard
 *   Section 3: NotifyToggleCard (cellared only)
 *   Section 4: 보관 현황 (1병: MetaGrid, N병: BottleStorageSection)
 *   Section 5: 내 노트 (notes exist: list; empty: empty text only)
 *   Section 6: PriceCompareCard (purchase_price_krw 있을 때만)
 *   DrinkThisCta (cellared only, absolute bottom)
 *   BottleCountSheet (N병 시)
 */
import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Trash2, Star, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BackHeader } from '@/components/nav/back-header';
import { PrimaryButton } from '@/components/shared/primary-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Toast } from '@/components/shared/toast';
import { WineNotifyBanner } from '@/components/shared/wine-notify-banner';
import { CellarHero } from '@/components/cellar/cellar-hero';
import { DrinkWindowCard } from '@/components/cellar/drink-window-card';
import { NotifyToggleCard } from '@/components/cellar/notify-toggle-card';
import { MetaGrid } from '@/components/cellar/meta-grid';
import { DrinkThisCta } from '@/components/cellar/drink-this-cta';
import { BottleCountSheet } from '@/components/cellar/bottle-count-sheet';
import { PriceCompareCard } from '@/components/cellar/price-compare-card';
import { AddToCellarSheet } from '@/components/wine/add-to-cellar-sheet';
import { MetaCard } from '@/components/cellar/meta-card';
import {
  useCellarItem,
  useCellarItemsByLwin,
  useNotesForWine,
  setCellarStatus,
  setCellarStatusBulk,
  deleteCellarItem,
  type CellarStatus,
  type CellarItemWithWine,
} from '@/hooks/use-cellar';
import { getDefaultBottleColor, getLocalizedWineName, parseLwinVintage } from '@/lib/lwin';
import { getDrinkWindow, getDrinkWindowStatus } from '@/lib/drink-window';
import { currentLocale } from '@/lib/i18n';
import { brand, type TypeCanonical } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

const TYPE_CANONICAL: ReadonlySet<TypeCanonical> = new Set([
  'red',
  'white',
  'rose',
  'sparkling',
  'fortified',
  'dessert',
]);

function asTypeCanonical(value: string | null | undefined): TypeCanonical | null {
  if (value && TYPE_CANONICAL.has(value as TypeCanonical)) return value as TypeCanonical;
  return null;
}

// ─── BottleStorageSection ─────────────────────────────────────────────────────
// Decision 2: 2+ bottles — "내 보관 현황 N병" + per-bottle cards with [편집][삭제]

function storageLabel(t: (k: string) => string, storage: string | null): string {
  if (!storage) return t('cellar.meta.storageCellar');
  switch (storage.toLowerCase()) {
    case 'cellar': return t('cellar.meta.storageCellar');
    case 'fridge': return t('cellar.meta.storageFridge');
    case 'room': return t('cellar.meta.storageRoom');
    case 'offsite': return t('cellar.meta.storageOffsite');
    default: return storage;
  }
}

interface BottleStorageSectionProps {
  items: CellarItemWithWine[];
  onEdit: (item: CellarItemWithWine) => void;
  onDelete: (item: CellarItemWithWine) => void;
}

const STORAGE_COLLAPSE_THRESHOLD = 5;
const STORAGE_INITIAL_VISIBLE = 3;

function BottleStorageSection({ items, onEdit, onDelete }: BottleStorageSectionProps) {
  const { t } = useTranslation();
  const { text, bg, border } = useThemeTokens();
  const isKo = currentLocale() === 'ko';
  // Decision 2: 5병 이상 시 처음 3병만 노출 → "N병 더 보기" 버튼으로 전체 펼침
  const [expanded, setExpanded] = useState(false);

  const shouldCollapse = items.length >= STORAGE_COLLAPSE_THRESHOLD;
  const visibleItems = shouldCollapse && !expanded ? items.slice(0, STORAGE_INITIAL_VISIBLE) : items;
  const hiddenCount = items.length - STORAGE_INITIAL_VISIBLE;

  return (
    <View style={{ marginHorizontal: 16, gap: 10 }}>
      {/* Section header */}
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
          lineHeight: 13.2,
          color: text.muted,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {`${t('cellar.detail.storageSection')} ${t('cellar.detail.storageBottleCount', { count: items.length })}`}
      </Text>

      {visibleItems.map((item, idx) => {
        const acquiredDate = item.acquired_at ? item.acquired_at.slice(0, 10) : '—';
        const priceValue = typeof item.purchase_price_krw === 'number'
          ? isKo
            ? `₩${item.purchase_price_krw.toLocaleString()}`
            : `${item.purchase_price_krw.toLocaleString()} KRW`
          : '—';
        const storageValue = storageLabel(t, item.storage ?? null);

        return (
          <View
            key={item.id}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: border.default,
              backgroundColor: bg.surface,
              paddingHorizontal: 14,
              paddingTop: 12,
              paddingBottom: 10,
              gap: 8,
            }}
          >
            {/* Bottle number + actions row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text
                allowFontScaling={false}
                style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted }}
              >
                {t('cellar.detail.bottleNum', { num: idx + 1 })}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => onEdit(item)}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  accessibilityRole="button"
                  accessibilityLabel={t('cellar.detail.edit')}
                >
                  <Text
                    allowFontScaling={false}
                    style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: brand.gold }}
                  >
                    {t('cellar.detail.edit')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onDelete(item)}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  accessibilityRole="button"
                  accessibilityLabel={t('cellar.detail.delete')}
                >
                  <Text
                    allowFontScaling={false}
                    style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: brand.wineRed }}
                  >
                    {t('cellar.detail.delete')}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Meta row: storage + acquired + price */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: text.muted, marginBottom: 2 }}
                >
                  {t('cellar.meta.storage')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: text.primary }}
                  numberOfLines={1}
                >
                  {storageValue}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: text.muted, marginBottom: 2 }}
                >
                  {t('cellar.meta.acquiredAt')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: text.primary }}
                >
                  {acquiredDate}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: text.muted, marginBottom: 2 }}
                >
                  {t('cellar.meta.price')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: text.primary }}
                  numberOfLines={1}
                >
                  {priceValue}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* Decision 2: 접기 토글 — 5병 이상일 때만 */}
      {shouldCollapse ? (
        <View style={{ flex: 0 }}>
          <Pressable
            onPress={() => setExpanded((v) => !v)}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 4 }}>
              <Text
                allowFontScaling={false}
                style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: text.secondary }}
              >
                {expanded
                  ? t('cellar.detail.storageCollapse')
                  : t('cellar.detail.storageShowMore', { count: hiddenCount })}
              </Text>
              {expanded
                ? <ChevronUp size={13} strokeWidth={2} color={text.secondary} />
                : <ChevronDown size={13} strokeWidth={2} color={text.secondary} />}
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

// ─── CellarDetailScreen ───────────────────────────────────────────────────────

// ─── NoteCompactSection ───────────────────────────────────────────────────────
// Decision 5: 날짜 ★ rating 경험레벨 컴팩트 한 줄 행. 탭 → 노트 상세.
// 3개 초과 시 접기 — BottleStorageSection과 동일 패턴.

import type { Database } from '@shared/types/database.types';
type TastingNoteRow = Database['public']['Tables']['tasting_notes']['Row'];

const NOTE_INITIAL_VISIBLE = 3;

function NoteCompactSection({
  notes,
  t,
}: {
  notes: TastingNoteRow[];
  wineLwin: string;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const { text, bg, border } = useThemeTokens();
  const [expanded, setExpanded] = useState(false);

  const shouldCollapse = notes.length > NOTE_INITIAL_VISIBLE;
  const visibleNotes = shouldCollapse && !expanded ? notes.slice(0, NOTE_INITIAL_VISIBLE) : notes;
  const hiddenCount = notes.length - NOTE_INITIAL_VISIBLE;

  return (
    <View style={{ gap: 0 }}>
      <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 13.2, color: text.secondary, textTransform: 'uppercase', letterSpacing: 1 }}
        >
          {t('cellar.detail.section.notes')}
        </Text>
      </View>

      {notes.length > 0 ? (
        <View
          style={{
            marginHorizontal: 16,
            borderRadius: 12,
            backgroundColor: bg.surface,
            borderWidth: 1,
            borderColor: border.default,
            overflow: 'hidden',
          }}
        >
          {visibleNotes.map((note, idx) => {
            const dateStr = note.tasted_at?.slice(0, 10) ?? '';
            const mode: 'expert' | 'beginner' = note.mode === 'expert' ? 'expert' : 'beginner';
            const modeLabel = t(`wineDetail.myNote.mode.${mode}`);
            const ratingStr = note.rating !== null && note.rating !== undefined ? String(note.rating) : null;

            return (
              <View key={note.id}>
                {idx > 0 ? (
                  <View style={{ height: 0.5, backgroundColor: border.default, marginHorizontal: 14 }} />
                ) : null}
                <View style={{ flex: 0 }}>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => undefined);
                      router.push(`/notes/${note.id}` as never);
                    }}
                    accessibilityRole="link"
                    accessibilityLabel={`${dateStr} ${ratingStr ?? ''}`}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        gap: 12,
                      }}
                    >
                      {/* 날짜 */}
                      <Text
                        allowFontScaling={false}
                        style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: text.muted, minWidth: 80 }}
                      >
                        {dateStr}
                      </Text>

                      {/* ★ rating */}
                      {ratingStr ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Star size={11} fill={brand.gold} strokeWidth={0} color={brand.gold} />
                          <Text
                            allowFontScaling={false}
                            style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: brand.gold }}
                          >
                            {ratingStr}
                          </Text>
                        </View>
                      ) : null}

                      {/* 경험레벨 */}
                      <Text
                        allowFontScaling={false}
                        style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: text.muted }}
                      >
                        {modeLabel}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View
          style={{ marginHorizontal: 16, borderRadius: 12, backgroundColor: bg.surface, borderWidth: 1, borderColor: border.default, paddingHorizontal: 14, paddingVertical: 12 }}
        >
          <Text
            allowFontScaling={false}
            style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: text.primary }}
          >
            {t('cellar.detail.notesCountZero')}
          </Text>
        </View>
      )}

      {/* 더보기 / 접기 토글 — 3개 초과 시만 */}
      {shouldCollapse ? (
        <View style={{ flex: 0, marginHorizontal: 16 }}>
          <Pressable
            onPress={() => setExpanded((v) => !v)}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            accessibilityRole="button"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 }}>
              <Text
                allowFontScaling={false}
                style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: text.secondary }}
              >
                {expanded
                  ? t('cellar.detail.notesCollapse')
                  : t('cellar.detail.notesShowMore', { count: hiddenCount })}
              </Text>
              {expanded
                ? <ChevronUp size={13} strokeWidth={2} color={text.secondary} />
                : <ChevronDown size={13} strokeWidth={2} color={text.secondary} />}
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function CellarDetailScreen() {
  const { lwin: lwinParam, id: idParam } = useLocalSearchParams<{ lwin: string; id?: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const cellarItemId = typeof idParam === 'string' && idParam.length > 0 ? idParam : null;
  const { t } = useTranslation();

  // Primary item (for wine info, drink-window, etc.)
  const { item, loading, refresh } = useCellarItem(lwin, cellarItemId);
  // All cellared items for this LWIN (Decision 2/3)
  const { items: allCellaredItems, loading: cellaredLoading, refresh: refreshCellared } = useCellarItemsByLwin(lwin);
  const { notes } = useNotesForWine(lwin);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useState(false);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [notifyBanner, setNotifyBanner] = useState<{ title: string; body: string } | null>(null);
  const [bottleSheetOpen, setBottleSheetOpen] = useState(false);

  const flashToast = useCallback((tone: 'success' | 'error', message: string) => {
    setToast({ tone, message });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleNotifyChange = useCallback(
    (next: boolean) => {
      setNotify(next);
      setNotifyBanner({
        title: next ? t('cellar.notify.banner.onTitle') : t('cellar.notify.banner.offTitle'),
        body: next ? t('cellar.notify.banner.onBody') : t('cellar.notify.banner.offBody'),
      });
    },
    [t],
  );

  const handleDeleteItem = useCallback((targetItem: CellarItemWithWine) => {
    Alert.alert(
      t('cellar.detail.deleteConfirmTitle'),
      t('cellar.detail.deleteConfirmDesc'),
      [
        { text: t('cellar.detail.deleteCancel'), style: 'cancel' },
        {
          text: t('cellar.detail.deleteConfirm'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
              await deleteCellarItem(targetItem.id);
              // If we deleted the primary item and there are others, or all items, go back
              if (allCellaredItems.length <= 1) {
                router.back();
              } else {
                await Promise.all([refresh(), refreshCellared()]);
              }
            } catch (err) {
              console.warn('[cellar detail] delete failed:', err);
              flashToast('error', t('cellar.detail.deleteFailed'));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [allCellaredItems.length, refresh, refreshCellared, flashToast, t]);

  // Decision 3: "이 와인 마시기"
  // 1병: DrinkThisCta ConfirmDialog flow → navigate to note write
  // N병: DrinkThisCta skipConfirm → open BottleCountSheet → mark N items consumed
  const handleDrinkOne = useCallback(async () => {
    if (!item || !item.wine?.lwin) return;
    setBusy(true);
    try {
      await setCellarStatus(item.id, 'consumed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      router.push(
        `/notes/new/write?from=cellar&wine_lwin=${encodeURIComponent(item.wine.lwin)}&itemId=${encodeURIComponent(item.id)}`,
      );
    } catch (err) {
      console.warn('[cellar detail] drink-this failed:', err);
      flashToast('error', t('cellar.swipe.updateFailed'));
    } finally {
      setBusy(false);
    }
  }, [item, flashToast, t]);

  // Decision 3+4: N bottles consumed → cellar_item_id = null (occasion-level)
  const handleDrinkMultiple = useCallback(async (count: number) => {
    if (!item?.wine?.lwin || allCellaredItems.length === 0) return;
    setBusy(true);
    try {
      const toConsume = allCellaredItems.slice(0, count).map((i) => i.id);
      await setCellarStatusBulk(toConsume, 'consumed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      // Decision 4: N > 1 → cellar_item_id = null (omit itemId param)
      const lwinEncoded = encodeURIComponent(item.wine.lwin);
      router.push(`/notes/new/write?from=cellar&wine_lwin=${lwinEncoded}` as never);
    } catch (err) {
      console.warn('[cellar detail] bulk drink failed:', err);
      flashToast('error', t('cellar.swipe.updateFailed'));
    } finally {
      setBusy(false);
      setBottleSheetOpen(false);
    }
  }, [item, allCellaredItems, flashToast, t]);

  const isCellared = item?.status === 'cellared';
  const isMultiBottle = allCellaredItems.length >= 2;

  // Primary bottle for single-bottle MetaGrid
  const primaryItem = useMemo(() => {
    if (!cellarItemId) return allCellaredItems[0] ?? item;
    return allCellaredItems.find((i) => i.id === cellarItemId) ?? allCellaredItems[0] ?? item;
  }, [cellarItemId, allCellaredItems, item]);

  // PriceCompareCard에 allCellaredItems 전달 — 내부에서 1병/멀티 분기 처리 (Decision 6)

  if (loading || cellaredLoading) {
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <BackHeader title="" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={brand.gold} />
        </View>
      </View>
    );
  }

  if (!item || !item.wine?.lwin || !item.wine?.display_name) {
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <BackHeader title="" />
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={48} strokeWidth={1.5} color={brand.gold} />
          <View className="mt-4">
            <EmptyState
              title={t('cellar.detail.notFound.title')}
              description={t('cellar.detail.notFound.description')}
              action={
                <PrimaryButton
                  label={t('cellar.detail.notFound.back')}
                  size="md"
                  variant="secondary"
                  onPress={() => router.back()}
                />
              }
            />
          </View>
        </View>
      </View>
    );
  }

  const wine = item.wine;
  const wineLwin: string = wine.lwin as string;
  const wineDisplayName: string = wine.display_name as string;
  const headerTitle = getLocalizedWineName(currentLocale(), {
    name_ko: wine.name_ko,
    display_name: wineDisplayName,
  }).primary;

  const typeCanon = asTypeCanonical(wine.type_canonical);
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(typeCanon);
  const vintage = wine.vintage ?? parseLwinVintage(wineLwin);

  const dw = getDrinkWindow({
    vintage,
    type_canonical: wine.type_canonical ?? null,
    drink_window_from_year: wine.drink_window_from_year,
    drink_window_peak_year: wine.drink_window_peak_year,
    drink_window_to_year: wine.drink_window_to_year,
  });
  const dwStatus = getDrinkWindowStatus({
    vintage,
    type_canonical: wine.type_canonical ?? null,
    drink_window_from_year: wine.drink_window_from_year,
    drink_window_peak_year: wine.drink_window_peak_year,
    drink_window_to_year: wine.drink_window_to_year,
  });

  const editingItem = editingItemId
    ? (allCellaredItems.find((i) => i.id === editingItemId) ?? item)
    : item;

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader
        title={headerTitle}
        right={
          !isMultiBottle ? (
            <Pressable
              onPress={() => handleDeleteItem(item)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={t('cellar.detail.delete')}
              hitSlop={12}
              className="ml-2"
            >
              <Trash2 size={20} strokeWidth={1.75} color={brand.wineRed} />
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 112, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Hero */}
        <CellarHero
          wineName={headerTitle}
          displayName={wineDisplayName}
          bottleColor={bottleColor}
          producerName={wine.producer_name}
          vintage={vintage}
          region={wine.region}
          country={wine.country}
        />

        {/* 와인 상세 보기 — Hero 바로 아래 */}
        <View style={{ alignSelf: 'flex-start', marginHorizontal: 16, marginTop: -8 }}>
          <Pressable
            onPress={() => router.push(`/wine/${encodeURIComponent(wineLwin)}` as never)}
            accessibilityRole="link"
            accessibilityLabel={t('cellar.viewWineDetails')}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 14.4, color: brand.gold }}
            >
              {`${t('cellar.viewWineDetails')}  →`}
            </Text>
          </Pressable>
        </View>

        {/* Section 2: PriceCompareCard — 절정시기 위 (Decision 6) */}
        <PriceCompareCard allItems={allCellaredItems} singleItemFallback={item} wineLwin={wineLwin} />

        {/* Section 3: Drink Window Card */}
        {dw && dwStatus ? (
          <DrinkWindowCard status={dwStatus} dw={dw} />
        ) : (
          <View
            className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default"
            style={{ padding: 16 }}
          >
            <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted">
              {t('cellar.drinkWindow.empty')}
            </Text>
          </View>
        )}

        {/* Section 4: Notify Toggle — cellared 상태에서만 (Decision 2: per-LWIN, not per-bottle) */}
        {isCellared ? (
          <NotifyToggleCard notify={notify} onChange={handleNotifyChange} />
        ) : null}

        {/* Section 5: Storage — Decision 2 분기 */}
        {isMultiBottle ? (
          <BottleStorageSection
            items={allCellaredItems}
            onEdit={(i) => setEditingItemId(i.id)}
            onDelete={handleDeleteItem}
          />
        ) : (
          <>
            <MetaGrid
              acquiredAt={primaryItem?.acquired_at ?? item.acquired_at}
              consumedAt={item.consumed_at}
              storage={primaryItem?.storage ?? item.storage}
              purchasePriceKrw={primaryItem?.purchase_price_krw ?? item.purchase_price_krw}
              memo={null}
              status={item.status as CellarStatus}
            />
            {/* Edit / Status toggle (single-bottle only) */}
            <View className="mx-4" style={{ gap: 8 }}>
              <PrimaryButton
                label={t('cellar.detail.edit')}
                size="md"
                variant="secondary"
                onPress={() => setEditingItemId(item.id)}
              />
              <PrimaryButton
                label={isCellared ? t('cellar.detail.markConsumed') : t('cellar.detail.restoreToCellar')}
                size="md"
                variant="ghost"
                loading={busy}
                onPress={async () => {
                  if (!item) return;
                  const next: CellarStatus = item.status === 'cellared' ? 'consumed' : 'cellared';
                  setBusy(true);
                  try {
                    await setCellarStatus(item.id, next);
                    await refresh();
                  } catch (err) {
                    console.warn('[cellar detail] status update failed:', err);
                    flashToast('error', t('cellar.swipe.updateFailed'));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </View>
          </>
        )}

        {/* Section 6: 내 노트 — Decision 5: 날짜 ★ rating 경험레벨 컴팩트 행, 3개 접기 */}
        <NoteCompactSection notes={notes} wineLwin={wineLwin} t={t} />
      </ScrollView>

      {/* DrinkThisCta — cellared 상태에서만 (Decision 3) */}
      {isCellared ? (
        <DrinkThisCta
          onConfirm={isMultiBottle ? () => setBottleSheetOpen(true) : handleDrinkOne}
          skipConfirm={isMultiBottle}
          disabled={busy}
        />
      ) : null}

      {/* BottleCountSheet — N병 선택 (Decision 3) */}
      <BottleCountSheet
        open={bottleSheetOpen}
        maxCount={allCellaredItems.length}
        onConfirm={handleDrinkMultiple}
        onClose={() => setBottleSheetOpen(false)}
      />

      {/* 알림 토글 확인 배너 */}
      <WineNotifyBanner
        visible={!!notifyBanner}
        title={notifyBanner?.title ?? ''}
        body={notifyBanner?.body ?? ''}
        onHide={() => setNotifyBanner(null)}
      />

      {/* Toast */}
      {toast ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', bottom: 96, left: 16, right: 16, zIndex: 11 }}
        >
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}

      {/* AddToCellarSheet — 편집 */}
      <AddToCellarSheet
        visible={editingItemId !== null}
        mode="edit"
        wineLwin={wineLwin}
        cellarItemId={editingItemId ?? item.id}
        initial={{
          acquired_at: editingItem.acquired_at,
          quantity: editingItem.quantity,
          purchase_price_krw: editingItem.purchase_price_krw ?? null,
          storage: editingItem.storage ?? null,
        }}
        onClose={() => setEditingItemId(null)}
        onSuccess={async () => {
          setEditingItemId(null);
          flashToast('success', t('cellar.detail.updateSuccess'));
          await Promise.all([refresh(), refreshCellared()]);
        }}
      />
    </View>
  );
}
