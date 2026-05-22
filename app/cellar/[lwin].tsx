/**
 * Cellar detail — `/cellar/[lwin]` retroactive hardening.
 *
 * 사양: design-spec cellar-detail.md (verbatim). design-reviewer 6/6 FAIL 해결.
 *
 * 구조 (verbatim, 사양 §2):
 *   BackHeader (wine name title + 우측 Delete icon button — escalation §13-9 채택)
 *   ScrollView (paddingBottom 112 + gap 16)
 *     ├── Section 1: CellarHero (240px frame + WineLabelArt + h1 + producer · vintage + region · country)
 *     ├── Section 2: DrinkWindowCard (Badge + RangeText + 5-stop Timeline + TipRow)
 *     ├── Section 3: NotifyToggleCard (44×26 Switch)
 *     ├── Section 4: MetaGrid 2×2 (storage / acquiredAt / price / memo|consumedAt)
 *     ├── Section 5: 내 노트 카운트 (v0.1.0 SCOPE-OUT community reviews 대체) + ViewWineDetailsLink + Edit/Status 보조 액션
 *     └── (absolute) Section 6: DrinkThisCta (fade + wine-red CTA)
 *   AddToCellarSheet (편집 시)
 *   Toast (성공/실패) / WineNotifyBanner (알림 토글 확인)
 */
import { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Trash2 } from 'lucide-react-native';
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
import { AddToCellarSheet } from '@/components/wine/add-to-cellar-sheet';
import {
  useCellarItem,
  useNotesCountForWine,
  setCellarStatus,
  deleteCellarItem,
  type CellarStatus,
} from '@/hooks/use-cellar';
import { getDefaultBottleColor, getLocalizedWineName, parseLwinVintage } from '@/lib/lwin';
import { getDrinkWindow, getDrinkWindowStatus } from '@/lib/drink-window';
import { currentLocale } from '@/lib/i18n';
import { brand, type TypeCanonical } from '@/lib/design-tokens';

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

export default function CellarDetailScreen() {
  const { lwin: lwinParam, id: idParam } = useLocalSearchParams<{ lwin: string; id?: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const cellarItemId = typeof idParam === 'string' && idParam.length > 0 ? idParam : null;
  const { t } = useTranslation();
  const { item, loading, refresh } = useCellarItem(lwin, cellarItemId);
  const { count: notesCount } = useNotesCountForWine(lwin);
  const [showEdit, setShowEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useState(false);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [notifyBanner, setNotifyBanner] = useState<{ title: string; body: string } | null>(null);

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

  const onDrinkThisConfirm = useCallback(async () => {
    if (!item || !item.wine?.lwin) return;
    setBusy(true);
    try {
      // SCOPE-IN: opened/finished 상태 즉시 토글 (사양 §13-1 — 비즈니스 로직 정합성 별도 cycle 검토)
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
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
                () => undefined,
              );
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
  // 가드 통과 후 lwin / display_name 둘 다 truthy임 — TS narrowing 보조 (string 단언)
  const wineLwin: string = wine.lwin as string;
  const wineDisplayName: string = wine.display_name as string;
  const headerTitle = getLocalizedWineName(currentLocale(), {
    name_ko: wine.name_ko,
    display_name: wineDisplayName,
  }).primary;

  // bottle color fallback
  const typeCanon = asTypeCanonical(wine.type_canonical);
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(typeCanon);

  // vintage fallback: LWIN parse
  const vintage = wine.vintage ?? parseLwinVintage(wineLwin);

  // drink window
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

  const notesLabel =
    notesCount === 0
      ? t('cellar.detail.notesCountZero')
      : t('cellar.detail.notesCountSome', { count: notesCount });

  const statusToggleLabel =
    item.status === 'cellared'
      ? t('cellar.detail.markConsumed')
      : t('cellar.detail.restoreToCellar');

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader
        title={headerTitle}
        right={
          <Pressable
            onPress={onDelete}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t('cellar.detail.delete')}
            hitSlop={12}
            className="ml-2"
          >
            <Trash2 size={20} strokeWidth={1.75} color={brand.wineRed} />
          </Pressable>
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

        {/* Section 2: Drink Window Card */}
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

        {/* Section 3: Notify Toggle */}
        <NotifyToggleCard notify={notify} onChange={handleNotifyChange} />

        {/* Section 4: Meta Grid 2×2 */}
        <MetaGrid
          acquiredAt={item.acquired_at}
          consumedAt={item.consumed_at}
          storage={item.storage}
          purchasePriceKrw={item.purchase_price_krw}
          memo={null}
          status={item.status as CellarStatus}
        />

        {/* Section 5: 내 노트 카운트 (v0.1.0 SCOPE-OUT community reviews 대체) + 보조 액션 */}
        <View className="mx-4">
          <Text
            className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase"
            style={{ marginBottom: 8 }}
          >
            {t('cellar.detail.section.notes')}
          </Text>
          <View
            className="bg-surface dark:bg-surface border border-border-default"
            style={{ borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 }}
          >
            <Text className="font-inter text-card-body text-text-primary dark:text-text-primary">
              {notesLabel}
            </Text>
          </View>

          {/* ViewWineDetailsLink — Inter 12 600 gold, self-start mt 12 */}
          <Pressable
            onPress={() => router.push(`/wine/${encodeURIComponent(wineLwin)}`)}
            accessibilityRole="link"
            accessibilityLabel={t('cellar.viewWineDetails')}
            hitSlop={8}
            style={{ alignSelf: 'flex-start', marginTop: 12 }}
          >
            <Text
              className="font-inter-semibold"
              style={{ fontSize: 12, lineHeight: 14.4, color: brand.gold }}
            >
              {`${t('cellar.viewWineDetails')}  →`}
            </Text>
          </Pressable>
        </View>

        {/* Edit + Status toggle 보조 액션 — 사양 §13-9 채택 (DrinkThis CTA 위 작은 영역) */}
        <View className="mx-4" style={{ gap: 8 }}>
          <PrimaryButton
            label={t('cellar.detail.edit')}
            size="md"
            variant="secondary"
            onPress={() => setShowEdit(true)}
          />
          <PrimaryButton
            label={statusToggleLabel}
            size="md"
            variant="ghost"
            loading={busy}
            onPress={onToggleStatus}
          />
        </View>
      </ScrollView>

      {/* Section 6: DrinkThis CTA — absolute bottom fixed (cellared 상태에서만) */}
      {item.status === 'cellared' ? (
        <DrinkThisCta onConfirm={onDrinkThisConfirm} disabled={busy} />
      ) : null}

      {/* 알림 토글 확인 배너 — 상단 슬라이드인 */}
      <WineNotifyBanner
        visible={!!notifyBanner}
        title={notifyBanner?.title ?? ''}
        body={notifyBanner?.body ?? ''}
        onHide={() => setNotifyBanner(null)}
      />

      {/* 편집 성공/실패 toast — 하단 */}
      {toast ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', bottom: 96, left: 16, right: 16, zIndex: 11 }}
        >
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}

      <AddToCellarSheet
        visible={showEdit}
        mode="edit"
        wineLwin={wineLwin}
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
