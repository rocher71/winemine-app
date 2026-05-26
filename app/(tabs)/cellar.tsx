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
 *     - 검색 + 타입필터 + 정렬 (최근/많이마심/빈티지/지역/가격대) + 2-col grid
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GlassWater, Check } from 'lucide-react-native';
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
import { TastedGroupCard } from '@/components/cellar/tasted-group-card';
import { EmptyState } from '@/components/shared/empty-state';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import {
  useCellarList,
  useCellarSummary,
  useTastedGrouped,
  type TastedGroup,
  type CellarSortKey,
  type TastedSortKey,
} from '@/hooks/use-cellar';
import { applyTastedSearch, applyTastedTypeFilter, applyTastedSort } from '@/lib/cellar-filters';

const TASTED_SPACER_KEY = '__tasted_spacer__';
import { brand, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { applySearch, applyTypeFilter, applySort } from '@/lib/cellar-filters';

const TASTED_SORT_KEYS: readonly TastedSortKey[] = ['recent', 'count', 'vintage', 'region', 'price'] as const;

// ─── TastedCountSortRow ───────────────────────────────────────────────────────
function TastedCountSortRow({
  total,
  shown,
  isFiltered,
  sortLabel,
  onClear,
  onSort,
  sortButtonRef,
}: {
  total: number;
  shown: number;
  isFiltered: boolean;
  sortLabel: string;
  onClear: () => void;
  onSort: () => void;
  sortButtonRef?: React.RefObject<View | null>;
}) {
  const { text, scheme } = useThemeTokens();
  const goldText = scheme === 'light' ? brand.goldDeep : brand.gold;
  const countText = isFiltered ? `${total}개 중 ${shown}개` : `${total}개`;

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 13.2, color: text.muted }}>
        {countText}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {isFiltered && shown !== total ? (
          <Pressable onPress={onClear} hitSlop={6} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <Text allowFontScaling={false} style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, lineHeight: 13.2, color: goldText }}>
              필터 초기화
            </Text>
          </Pressable>
        ) : null}
        {/* Sort button — View ref used for dropdown positioning */}
        <View ref={sortButtonRef} collapsable={false}>
          <Pressable onPress={onSort} hitSlop={6} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <Text allowFontScaling={false} style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, lineHeight: 13.2, color: goldText }}>
              {`${sortLabel} ↕`}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── TastedSortDropdown ───────────────────────────────────────────────────────
function TastedSortDropdown({
  top,
  currentSort,
  onSelect,
  onDismiss,
}: {
  top: number;
  currentSort: TastedSortKey;
  onSelect: (key: TastedSortKey) => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const { bg, text, border, scheme } = useThemeTokens();
  const goldColor = scheme === 'light' ? brand.goldDeep : brand.gold;
  const cardBg = bg.surface;
  const borderColor = border.default;
  const selectedRowBg = withAlpha(brand.gold, 0.07);

  const SORT_LABELS: Record<TastedSortKey, string> = {
    recent: t('cellar.sort.recent'),
    count: t('cellar.sort.count'),
    vintage: t('cellar.sort.vintage'),
    region: t('cellar.sort.region'),
    price: t('cellar.sort.price'),
  };

  return (
    // Full-screen dismiss layer
    <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss}>
      {/* Card container — stopPropagation via pointerEvents="box-none" on inner View */}
      <View
        style={{ position: 'absolute', right: 16, top }}
        // Prevent dismiss Pressable from receiving taps that land on the card
        // by not marking this View as a hit target — children still receive events
        pointerEvents="box-none"
      >
        {/* Dropdown card */}
        <View
          style={{
            width: 232,
            borderRadius: 18,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor,
            shadowColor: 'rgba(31,18,12,1)',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.24,
            shadowRadius: 22,
            elevation: 14,
          }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12 }}>
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: goldColor, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 2 }}
            >
              Sort by
            </Text>
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 16, fontStyle: 'italic', color: text.primary }}
            >
              {t('cellar.sort.label')}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ height: 0.5, backgroundColor: borderColor, marginHorizontal: 0 }} />

          {/* Option rows */}
          {TASTED_SORT_KEYS.map((key) => {
            const isSelected = key === currentSort;
            return (
              <Pressable
                key={key}
                onPress={() => onSelect(key)}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    backgroundColor: isSelected ? selectedRowBg : 'transparent',
                  }}
                >
                  {/* Selection dot */}
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isSelected ? brand.wineRed : 'transparent',
                      borderWidth: isSelected ? 0 : 1,
                      borderColor,
                      marginRight: 12,
                    }}
                  />
                  {/* Label */}
                  <Text
                    allowFontScaling={false}
                    style={{
                      flex: 1,
                      fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      fontSize: 14,
                      color: isSelected ? text.primary : text.muted,
                    }}
                  >
                    {SORT_LABELS[key]}
                  </Text>
                  {/* Check icon */}
                  {isSelected ? <Check size={14} color={goldColor} strokeWidth={2.5} /> : null}
                </View>
              </Pressable>
            );
          })}

          {/* Bottom padding */}
          <View style={{ height: 8 }} />
        </View>

        {/* Caret — rendered after card (higher z-order), matching bg "erases" card top border */}
        <View
          style={{
            position: 'absolute',
            top: -7,
            right: 24,
            width: 14,
            height: 14,
            transform: [{ rotate: '45deg' }],
            backgroundColor: cardBg,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderColor,
          }}
        />
      </View>
    </Pressable>
  );
}

// ─── CellarListScreen ─────────────────────────────────────────────────────────
export default function CellarListScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<CellarTab>('cellar');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<CellarSortKey>('recent');
  const [tastedQuery, setTastedQuery] = useState('');
  const [tastedTypeFilter, setTastedTypeFilter] = useState<TypeFilter>('all');
  const [tastedSort, setTastedSort] = useState<TastedSortKey>('recent');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortDropdownTop, setSortDropdownTop] = useState(0);
  const sortButtonRef = useRef<View>(null);

  // ── Scroll-aware header (community 탭 동일 패턴) ───────────────────────────
  const headerHRef = useRef(insets.top + 80);
  const [headerH, setHeaderH] = useState(insets.top + 80);
  const handleHeaderLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    const h = e.nativeEvent.layout.height;
    if (h !== headerHRef.current) {
      headerHRef.current = h;
      setHeaderH(h);
    }
  }, []);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    // Close sort dropdown whenever list scrolls
    if (sortDropdownVisible) setSortDropdownVisible(false);

    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    const THRESHOLD = 8;
    if (currentY <= 0) {
      if (!headerVisible.current) {
        headerVisible.current = true;
        Animated.timing(headerTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }
    } else if (diff > THRESHOLD && headerVisible.current) {
      headerVisible.current = false;
      Animated.timing(headerTranslateY, { toValue: -headerHRef.current, duration: 250, useNativeDriver: true }).start();
    } else if (diff < -THRESHOLD && !headerVisible.current) {
      headerVisible.current = true;
      Animated.timing(headerTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    lastScrollY.current = currentY;
  };

  // 탭 전환 시 헤더 복원 + 드롭다운 닫기
  useEffect(() => {
    headerVisible.current = true;
    headerTranslateY.setValue(0);
    lastScrollY.current = 0;
    setSortDropdownVisible(false);
  }, [tab]);
  // ──────────────────────────────────────────────────────────────────────────

  const { unreadCount } = useNotifications();
  const { profile } = useProfile();
  const displayInitial = (profile?.anonymous_display ?? '?')[0]?.toUpperCase() ?? '?';
  const levelId = Math.max(1, Math.min(5, profile?.level ?? 1)) as 1|2|3|4|5;

  const { items: rawItems, loading, refresh } = useCellarList('cellared');
  const { groups: rawTastedGroups, loading: tastedLoading, refresh: tastedRefresh } = useTastedGrouped();
  const { cellaredCount, consumedCount } = useCellarSummary();

  const isFiltered = query.trim().length > 0 || typeFilter !== 'all';
  const isTastedFiltered = tastedQuery.trim().length > 0 || tastedTypeFilter !== 'all';

  const displayItems = useMemo(() => {
    const filtered = applyTypeFilter(applySearch(rawItems, query), typeFilter);
    return applySort(filtered, sort, true);
  }, [rawItems, query, typeFilter, sort]);

  const displayTastedGroups = useMemo(() => {
    const filtered = applyTastedTypeFilter(applyTastedSearch(rawTastedGroups, tastedQuery), tastedTypeFilter);
    return applyTastedSort(filtered, tastedSort);
  }, [rawTastedGroups, tastedQuery, tastedTypeFilter, tastedSort]);

  const onClearFilters = useCallback(() => {
    setQuery('');
    setTypeFilter('all');
  }, []);

  const onClearTastedFilters = useCallback(() => {
    setTastedQuery('');
    setTastedTypeFilter('all');
  }, []);

  const openTastedSortDropdown = useCallback(() => {
    if (sortDropdownVisible) {
      setSortDropdownVisible(false);
      return;
    }
    if (sortButtonRef.current) {
      sortButtonRef.current.measure((_x, _y, _w, h, _px, py) => {
        setSortDropdownTop(py + h + 6);
        setSortDropdownVisible(true);
      });
    }
  }, [sortDropdownVisible]);

  const onAdd = useCallback(() => {
    setToastMsg(t('cellar.addToast'));
    setTimeout(() => setToastMsg(null), 2500);
  }, [t]);

  const HeaderRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <BellButton unreadCount={unreadCount} />
      <LevelChip levelId={levelId} initial={displayInitial} />
    </View>
  );

  const headerProps = { eyebrow: t('nav.cellar'), title: t('cellar.title') } as const;

  // ---- Render: tasted 탭 ----
  if (tab === 'tasted') {
    const hasAnyTasted = rawTastedGroups.length > 0;
    const gridData = displayTastedGroups.length % 2 !== 0
      ? [...displayTastedGroups, { lwin: TASTED_SPACER_KEY } as TastedGroup]
      : displayTastedGroups;

    const TastedHeader = (
      <View style={{ paddingTop: 8 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <CellarTabs value={tab} onChange={setTab} cellarCount={cellaredCount} tastedCount={consumedCount} />
        </View>
        {hasAnyTasted ? (
          <>
            <CellarSearchInput query={tastedQuery} onQueryChange={setTastedQuery} />
            <TypeFilterChips value={tastedTypeFilter} onChange={setTastedTypeFilter} />
            <TastedCountSortRow
              total={rawTastedGroups.length}
              shown={displayTastedGroups.length}
              isFiltered={isTastedFiltered}
              sortLabel={t(`cellar.sort.${tastedSort}`)}
              onClear={onClearTastedFilters}
              onSort={openTastedSortDropdown}
              sortButtonRef={sortButtonRef}
            />
          </>
        ) : null}
      </View>
    );

    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <Animated.View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, transform: [{ translateY: headerTranslateY }] }}
          onLayout={handleHeaderLayout}
        >
          <AppHeader {...headerProps} right={HeaderRight} />
        </Animated.View>
        <FlatList
          data={tastedLoading ? [] : gridData}
          keyExtractor={(g) => g.lwin}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          renderItem={({ item }) =>
            item.lwin === TASTED_SPACER_KEY ? <View style={{ flex: 1 }} /> : <TastedGroupCard group={item} />}
          ListHeaderComponent={TastedHeader}
          ListEmptyComponent={() =>
            tastedLoading ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64 }}>
                <ActivityIndicator color={brand.gold} />
              </View>
            ) : isTastedFiltered ? (
              <NoResults onClear={onClearTastedFilters} />
            ) : (
              <EmptyState title={t('cellar.tasted.empty')} description={t('cellar.tasted.emptyHint')} />
            )
          }
          contentContainerStyle={{
            paddingTop: headerH,
            paddingBottom: 24 + insets.bottom,
            flexGrow: 1,
            gap: 12,
          }}
          refreshControl={<RefreshControl refreshing={tastedLoading} onRefresh={tastedRefresh} tintColor={brand.gold} />}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Anchored sort dropdown overlay */}
        {sortDropdownVisible ? (
          <TastedSortDropdown
            top={sortDropdownTop}
            currentSort={tastedSort}
            onSelect={(key) => {
              setTastedSort(key);
              setSortDropdownVisible(false);
            }}
            onDismiss={() => setSortDropdownVisible(false)}
          />
        ) : null}
      </View>
    );
  }

  // ---- Render: cellar 탭 ----
  const hasAnyItems = rawItems.length > 0;

  const ListHeader = (
    <View>
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

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="items-center justify-center" style={{ paddingVertical: 64 }}>
          <ActivityIndicator color={brand.gold} />
        </View>
      );
    }
    if (!hasAnyItems) {
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
    return <NoResults onClear={onClearFilters} />;
  };

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, transform: [{ translateY: headerTranslateY }] }}
        onLayout={handleHeaderLayout}
      >
        <AppHeader {...headerProps} right={HeaderRight} />
      </Animated.View>

      <FlatList
        data={displayItems}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        renderItem={({ item }) => <CellarCard item={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingTop: headerH,
          paddingBottom: 24 + insets.bottom,
          flexGrow: 1,
          gap: 12,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
