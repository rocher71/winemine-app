import { useCallback, useMemo, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/nav/app-header';
import { CellarTabs } from '@/components/cellar/cellar-tabs';
import { SearchSortBar } from '@/components/cellar/search-sort-bar';
import { CellarCard } from '@/components/cellar/cellar-card';
import { EmptyState } from '@/components/shared/empty-state';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import {
  useCellarList,
  setCellarStatus,
  type CellarItemWithWine,
  type CellarSortKey,
  type CellarStatus,
} from '@/hooks/use-cellar';
import { parseLwinVintage } from '@/lib/lwin';
import { brand } from '@/lib/design-tokens';

function compareByVintage(a: CellarItemWithWine, b: CellarItemWithWine): number {
  const va = a.wine?.vintage ?? (a.wine?.lwin ? parseLwinVintage(a.wine.lwin) : null) ?? 0;
  const vb = b.wine?.vintage ?? (b.wine?.lwin ? parseLwinVintage(b.wine.lwin) : null) ?? 0;
  return vb - va;
}

function compareByPrice(a: CellarItemWithWine, b: CellarItemWithWine): number {
  return (b.purchase_price_krw ?? 0) - (a.purchase_price_krw ?? 0);
}

function compareByRecent(a: CellarItemWithWine, b: CellarItemWithWine, status: CellarStatus): number {
  const aKey = status === 'cellared' ? a.acquired_at : a.consumed_at ?? a.acquired_at;
  const bKey = status === 'cellared' ? b.acquired_at : b.consumed_at ?? b.acquired_at;
  return new Date(bKey).getTime() - new Date(aKey).getTime();
}

function applySearch(items: CellarItemWithWine[], q: string): CellarItemWithWine[] {
  if (!q.trim()) return items;
  const needle = q.trim().toLowerCase();
  return items.filter((it) => {
    const w = it.wine;
    if (!w) return false;
    return (
      (w.display_name?.toLowerCase().includes(needle) ?? false) ||
      (w.name_ko?.toLowerCase().includes(needle) ?? false) ||
      (w.producer_name?.toLowerCase().includes(needle) ?? false)
    );
  });
}

function applySort(items: CellarItemWithWine[], sort: CellarSortKey, status: CellarStatus): CellarItemWithWine[] {
  const copy = items.slice();
  switch (sort) {
    case 'vintage':
      copy.sort(compareByVintage);
      break;
    case 'price':
      copy.sort(compareByPrice);
      break;
    case 'recent':
    default:
      copy.sort((a, b) => compareByRecent(a, b, status));
      break;
  }
  return copy;
}

export default function CellarListScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CellarStatus>('cellared');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CellarSortKey>('recent');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { items, loading, refresh } = useCellarList(tab);

  const displayItems = useMemo(
    () => applySort(applySearch(items, query), sort, tab),
    [items, query, sort, tab],
  );

  const onSwipeAction = useCallback(
    async (id: string, next: CellarStatus) => {
      try {
        await setCellarStatus(id, next);
        await refresh();
      } catch (err) {
        console.warn('[cellar] status update failed:', err);
        setToastMsg(t('cellar.swipe.updateFailed'));
        setTimeout(() => setToastMsg(null), 2500);
      }
    },
    [refresh, t],
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator color={brand.gold} />
        </View>
      );
    }
    if (items.length === 0) {
      if (tab === 'cellared') {
        return (
          <EmptyState
            title={t('cellar.empty.cellared.title')}
            description={t('cellar.empty.cellared.description')}
            action={
              <PrimaryButton
                label={t('cellar.empty.cellared.cta')}
                size="md"
                onPress={() => router.push('/(tabs)/capture')}
              />
            }
          />
        );
      }
      return (
        <EmptyState
          title={t('cellar.empty.consumed.title')}
          description={t('cellar.empty.consumed.description')}
        />
      );
    }
    return (
      <View className="px-6 py-12">
        <EmptyState title={t('cellar.empty.noResults')} />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <AppHeader title={t('cellar.title')} />
      <CellarTabs value={tab} onChange={setTab} />
      <SearchSortBar query={query} onQueryChange={setQuery} sort={sort} onSortChange={setSort} />
      <FlatList
        data={displayItems}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <CellarCard item={item} onSwipeAction={(next) => onSwipeAction(item.id, next)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, flexGrow: 1 }}
        refreshing={loading}
        onRefresh={refresh}
      />

      {toastMsg ? (
        <View className="absolute bottom-6 left-4 right-4">
          <Toast message={toastMsg} tone="error" />
        </View>
      ) : null}
    </View>
  );
}
