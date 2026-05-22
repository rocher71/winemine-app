/**
 * Cellar list — /(tabs)/cellar.
 *
 * 사양: design-spec cellar-list.md.
 * Day 6 retroactive hardening 2차 (Day 5 1차 review FAIL 68건 해결).
 *
 * 구조:
 *   AppHeader (cellar.title="내 셀러")
 *   TitleBar: TabSegment (cellar/tasted) + AddCta (cellar 탭일 때만)
 *   [cellar 탭]
 *     - 빈 셀러: CellarEmptyState (GlassWater illustration + PrimaryButton → /capture)
 *     - 셀러 있음: SearchInput + TypeFilterChips(6) + SortChips(6) + ResultCount + (NoResults | 2-col grid)
 *   [tasted 탭]
 *     - v0.1.0 alpha: placeholder ("v0.2.0 출시 예정") — 사양 §12-1
 */
import { useCallback, useMemo, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GlassWater } from 'lucide-react-native';
import { AppHeader } from '@/components/nav/app-header';
import { BellButton } from '@/components/nav/bell-button';
import { LevelChip } from '@/components/shared/level-chip';
import { useNotifications } from '@/hooks/use-notifications';
import { useProfile } from '@/hooks/use-profile';
import { CellarTabs, type CellarTab } from '@/components/cellar/cellar-tabs';
import { CellarSearchInput } from '@/components/cellar/cellar-search-input';
import { TypeFilterChips, type TypeFilter } from '@/components/cellar/type-filter-chips';
import { SortChips } from '@/components/cellar/sort-chips';
import { ResultCount } from '@/components/cellar/result-count';
import { NoResults } from '@/components/cellar/no-results';
import { AddCta } from '@/components/cellar/add-cta';
import { CellarCard } from '@/components/cellar/cellar-card';
import { EmptyState } from '@/components/shared/empty-state';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import {
  useCellarList,
  useCellarSummary,
  type CellarItemWithWine,
  type CellarSortKey,
} from '@/hooks/use-cellar';
import { parseLwinVintage } from '@/lib/lwin';
import { brand } from '@/lib/design-tokens';
import { getDrinkWindow } from '@/lib/drink-window';

// ---- Filter / Sort helpers ----

function applySearch(items: CellarItemWithWine[], q: string): CellarItemWithWine[] {
  if (!q.trim()) return items;
  const needle = q.trim().toLowerCase();
  return items.filter((it) => {
    const w = it.wine;
    if (!w) return false;
    return (
      (w.display_name?.toLowerCase().includes(needle) ?? false) ||
      (w.name_ko?.toLowerCase().includes(needle) ?? false) ||
      (w.producer_name?.toLowerCase().includes(needle) ?? false) ||
      (w.region?.toLowerCase().includes(needle) ?? false) ||
      (w.country?.toLowerCase().includes(needle) ?? false)
    );
  });
}

function applyTypeFilter(items: CellarItemWithWine[], tf: TypeFilter): CellarItemWithWine[] {
  if (tf === 'all') return items;
  return items.filter((it) => it.wine?.type_canonical === tf);
}

function vintageOf(it: CellarItemWithWine): number {
  return it.wine?.vintage ?? (it.wine?.lwin ? parseLwinVintage(it.wine.lwin) ?? 0 : 0);
}

function drinkSoonScore(it: CellarItemWithWine, currentYear: number): number {
  // from year가 가까울수록 (또는 이미 from 지난) 우선. 미정인 경우 Infinity (뒤로).
  const dw = getDrinkWindow({
    vintage: it.wine?.vintage ?? null,
    type_canonical: it.wine?.type_canonical ?? null,
  });
  if (!dw) return Number.POSITIVE_INFINITY;
  // from 이전 → 남은 햇수; from 이후 → 0 (즉시 시음 가능) — 음수는 0으로
  return Math.max(0, dw.from - currentYear);
}

function applySort(
  items: CellarItemWithWine[],
  sort: CellarSortKey,
  isCellared: boolean,
): CellarItemWithWine[] {
  const copy = items.slice();
  const currentYear = new Date().getFullYear();
  switch (sort) {
    case 'vintage':
      copy.sort((a, b) => vintageOf(b) - vintageOf(a));
      break;
    case 'price':
      copy.sort((a, b) => (b.purchase_price_krw ?? 0) - (a.purchase_price_krw ?? 0));
      break;
    case 'region':
      copy.sort((a, b) => (a.wine?.region ?? '').localeCompare(b.wine?.region ?? ''));
      break;
    case 'storage':
      copy.sort((a, b) => (a.storage ?? '').localeCompare(b.storage ?? ''));
      break;
    case 'drinkSoon':
      copy.sort((a, b) => drinkSoonScore(a, currentYear) - drinkSoonScore(b, currentYear));
      break;
    case 'recent':
    default: {
      copy.sort((a, b) => {
        const aKey = isCellared ? a.acquired_at : a.consumed_at ?? a.acquired_at;
        const bKey = isCellared ? b.acquired_at : b.consumed_at ?? b.acquired_at;
        return new Date(bKey).getTime() - new Date(aKey).getTime();
      });
      break;
    }
  }
  return copy;
}

export default function CellarListScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<CellarTab>('cellar');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<CellarSortKey>('recent');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { unreadCount } = useNotifications();
  const { profile } = useProfile();
  const displayInitial = (profile?.anonymous_display ?? '?')[0]?.toUpperCase() ?? '?';
  const levelId = Math.max(1, Math.min(5, profile?.level ?? 1)) as 1|2|3|4|5;

  const { items: rawItems, loading, refresh } = useCellarList('cellared');
  const { items: consumedItems, loading: consumedLoading, refresh: consumedRefresh } = useCellarList('consumed');
  const { cellaredCount, consumedCount } = useCellarSummary();

  const isFiltered = query.trim().length > 0 || typeFilter !== 'all';

  const displayItems = useMemo(() => {
    const filtered = applyTypeFilter(applySearch(rawItems, query), typeFilter);
    return applySort(filtered, sort, true);
  }, [rawItems, query, typeFilter, sort]);

  const onClearFilters = useCallback(() => {
    setQuery('');
    setTypeFilter('all');
  }, []);

  const onAdd = useCallback(() => {
    // v0.1.0 mock toast (사양 §12-2). BottomSheet add-cellar form은 v0.2.0.
    setToastMsg(t('cellar.addToast'));
    setTimeout(() => setToastMsg(null), 2500);
  }, [t]);

  const HeaderRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <BellButton unreadCount={unreadCount} />
      <LevelChip levelId={levelId} initial={displayInitial} />
    </View>
  );

  // ---- Render: tasted 탭 ----
  if (tab === 'tasted') {
    const consumedSorted = [...consumedItems].sort((a, b) => {
      const aKey = a.consumed_at ?? a.acquired_at;
      const bKey = b.consumed_at ?? b.acquired_at;
      return (bKey ?? '').localeCompare(aKey ?? '');
    });
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <AppHeader title={t('cellar.title')} right={HeaderRight} />
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <CellarTabs value={tab} onChange={setTab} cellarCount={cellaredCount} tastedCount={consumedCount} />
        </View>
        {consumedLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={brand.gold} />
          </View>
        ) : consumedSorted.length === 0 ? (
          <EmptyState title={t('cellar.tasted.empty')} description={t('cellar.tasted.emptyHint')} />
        ) : (
          <FlatList
            data={consumedSorted}
            keyExtractor={(it) => it.id}
            numColumns={2}
            contentContainerStyle={{ padding: 12, gap: 12 }}
            columnWrapperStyle={{ gap: 12 }}
            renderItem={({ item }) => <CellarCard item={item as import('@/hooks/use-cellar').CellarItemWithWine} />}
            refreshControl={<RefreshControl refreshing={consumedLoading} onRefresh={consumedRefresh} tintColor={brand.gold} />}
          />
        )}
      </View>
    );
  }

  // ---- Render: cellar 탭 ----
  const hasAnyItems = rawItems.length > 0;

  // ListHeader: TitleBar + (있을 때) SearchInput + TypeFilterChips + SortChips + ResultCount
  const ListHeader = (
    <View>
      {/* TitleBar: TabSegment + AddCta */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <CellarTabs
          value={tab}
          onChange={setTab}
          cellarCount={cellaredCount}
          tastedCount={consumedCount}
        />
        <View style={{ flex: 1 }} />
        <AddCta onPress={onAdd} />
      </View>

      {hasAnyItems ? (
        <>
          <CellarSearchInput query={query} onQueryChange={setQuery} />
          <TypeFilterChips value={typeFilter} onChange={setTypeFilter} />
          <SortChips value={sort} onChange={setSort} />
          <ResultCount
            total={rawItems.length}
            shown={displayItems.length}
            isFiltered={isFiltered}
            onClear={onClearFilters}
          />
        </>
      ) : null}
    </View>
  );

  // ListEmptyComponent: loading | empty cellar | NoResults (filter applied + 0)
  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="items-center justify-center" style={{ paddingVertical: 64 }}>
          <ActivityIndicator color={brand.gold} />
        </View>
      );
    }
    if (!hasAnyItems) {
      // 셀러 자체가 비어있음
      return (
        <View style={{ paddingVertical: 32 }}>
          <EmptyState
            illustration={<GlassWater size={56} strokeWidth={1.25} color={brand.gold} />}
            title={t('cellar.empty.title')}
            description={t('cellar.empty.sub')}
            action={
              <PrimaryButton
                label={t('cellar.empty.cta')}
                size="md"
                onPress={() => router.push('/(tabs)/capture')}
              />
            }
          />
        </View>
      );
    }
    // 필터 적용 후 0건
    return <NoResults onClear={onClearFilters} />;
  };

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <AppHeader title={t('cellar.title')} right={HeaderRight} />

      <FlatList
        data={displayItems}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        renderItem={({ item }) => <CellarCard item={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingBottom: 24 + insets.bottom,
          flexGrow: 1,
          gap: 12,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={brand.gold}
            accessibilityLabel={t('common.refresh')}
          />
        }
      />

      {toastMsg ? (
        <View
          className="absolute left-4 right-4"
          style={{ bottom: 24 + insets.bottom }}
          pointerEvents="none"
        >
          <Toast message={toastMsg} tone="info" />
        </View>
      ) : null}
    </View>
  );
}
