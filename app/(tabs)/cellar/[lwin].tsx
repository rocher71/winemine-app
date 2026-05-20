import { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Trash2 } from 'lucide-react-native';
import { BackHeader } from '@/components/nav/back-header';
import { PrimaryButton } from '@/components/shared/primary-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Toast } from '@/components/shared/toast';
import { WineHero } from '@/components/wine/wine-hero';
import { DrinkingWindowBar } from '@/components/wine/drinking-window-bar';
import { AddToCellarSheet } from '@/components/wine/add-to-cellar-sheet';
import { CellarFields } from '@/components/cellar/cellar-fields';
import {
  useCellarItem,
  useNotesCountForWine,
  setCellarStatus,
  deleteCellarItem,
  type CellarStatus,
} from '@/hooks/use-cellar';
import { getLocalizedWineName } from '@/lib/lwin';
import { currentLocale } from '@/lib/i18n';
import { brand } from '@/lib/design-tokens';

export default function CellarDetailScreen() {
  const { lwin: lwinParam, id: idParam } = useLocalSearchParams<{ lwin: string; id?: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const cellarItemId = typeof idParam === 'string' && idParam.length > 0 ? idParam : null;
  const { t } = useTranslation();
  const { item, loading, refresh } = useCellarItem(lwin, cellarItemId);
  const { count: notesCount } = useNotesCountForWine(lwin);
  const [showEdit, setShowEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const flashToast = useCallback((tone: 'success' | 'error', message: string) => {
    setToast({ tone, message });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const onToggleStatus = useCallback(async () => {
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
  }, [item, refresh, flashToast, t]);

  const onDelete = useCallback(() => {
    if (!item) return;
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
              await deleteCellarItem(item.id);
              router.back();
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
  }, [item, flashToast, t]);

  if (loading) {
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
  const headerTitle = getLocalizedWineName(currentLocale(), {
    name_ko: wine.name_ko,
    display_name: wine.display_name,
  }).primary;
  const statusToggleLabel =
    item.status === 'cellared'
      ? t('cellar.detail.markConsumed')
      : t('cellar.detail.restoreToCellar');
  const notesLabel =
    notesCount === 0
      ? t('cellar.detail.notesCountZero')
      : t('cellar.detail.notesCountSome', { count: notesCount });

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={headerTitle} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <WineHero
          lwin={wine.lwin}
          display_name={wine.display_name}
          name_ko={wine.name_ko}
          bottle_color={wine.bottle_color}
          type_canonical={wine.type_canonical}
          vintage={wine.vintage}
        />

        <View className="mt-5">
          <CellarFields
            acquiredAt={item.acquired_at}
            consumedAt={item.consumed_at}
            storage={item.storage}
            purchasePriceKrw={item.purchase_price_krw}
            quantity={item.quantity}
            status={item.status as CellarStatus}
            onEdit={() => setShowEdit(true)}
          />
        </View>

        <View className="mt-5">
          <DrinkingWindowBar
            fromYear={wine.drink_window_from_year}
            peakYear={wine.drink_window_peak_year}
            toYear={wine.drink_window_to_year}
          />
        </View>

        <View className="mt-5 rounded-md bg-surface px-4 py-3 mx-4">
          <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
            {t('cellar.detail.section.notes')}
          </Text>
          <Text className="font-inter text-card-body text-text-primary dark:text-text-primary mt-2">
            {notesLabel}
          </Text>
        </View>

        <View className="mt-6 px-4 gap-3">
          <PrimaryButton
            label={t('wineDetail.actions.writeNote')}
            size="lg"
            onPress={() =>
              router.push(`/notes/new/write?wine_lwin=${encodeURIComponent(wine.lwin ?? '')}`)
            }
          />
          <PrimaryButton
            label={statusToggleLabel}
            size="md"
            variant="secondary"
            loading={busy}
            onPress={onToggleStatus}
          />
          <Pressable
            onPress={onDelete}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t('cellar.detail.delete')}
            className="h-11 flex-row items-center justify-center"
          >
            <Trash2 size={18} strokeWidth={2} color={brand.wineRed} />
            <Text className="ml-2 font-inter-semibold text-card-body text-wine-red">
              {t('cellar.detail.delete')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {toast ? (
        <View className="absolute bottom-6 left-4 right-4">
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}

      <AddToCellarSheet
        visible={showEdit}
        mode="edit"
        wineLwin={wine.lwin}
        cellarItemId={item.id}
        initial={{
          acquired_at: item.acquired_at,
          quantity: item.quantity,
          purchase_price_krw: item.purchase_price_krw ?? null,
          storage: item.storage ?? null,
        }}
        onClose={() => setShowEdit(false)}
        onSuccess={async () => {
          setShowEdit(false);
          flashToast('success', t('cellar.detail.updateSuccess'));
          await refresh();
        }}
      />
    </View>
  );
}
