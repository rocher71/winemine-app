/**
 * ListTabContent — 셀러 탭 > 리스트 탭 전체 콘텐츠.
 * 내 리스트 목록 + FAB + VisibilitySheet.
 */
import {useCallback, useRef, useState} from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import {Plus, List as ListIcon} from 'lucide-react-native';
import {useRouter} from 'expo-router';
import {useTranslation} from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {LinearGradient} from 'expo-linear-gradient';
import {brand, light} from '@/lib/design-tokens';
import {useThemeTokens} from '@/lib/use-theme-tokens';
import {EmptyState} from '@/components/shared/empty-state';
import {ListCard} from '@/components/cellar/list-card';
import {SortDropdown} from '@/components/cellar/sort-dropdown';
import {VisibilitySheet} from '@/components/cellar/visibility-sheet';
import {
  useMyLists,
  useToggleVisibility,
  type ListSortKey,
  type WineListStats,
} from '@/hooks/use-wine-lists';

const LIST_SORT_KEYS: readonly ListSortKey[] = ['recent', 'created', 'name', 'count'] as const;

const SORT_I18N: Record<ListSortKey, string> = {
  recent:  'lists.sortRecent',
  created: 'lists.sortCreated',
  name:    'lists.sortName',
  count:   'lists.sortCount',
};

export function ListTabContent() {
  const {t} = useTranslation();
  const router = useRouter();
  const {text, scheme} = useThemeTokens();
  const goldText = scheme === 'light' ? brand.goldDeep : brand.gold;

  const [sort, setSort] = useState<ListSortKey>('recent');
  const {lists, isLoading, refetch} = useMyLists(sort);

  // Sort dropdown state
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortDropdownTop, setSortDropdownTop] = useState(0);
  const sortButtonRef = useRef<View>(null);

  const openSortDropdown = useCallback(() => {
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

  // Visibility sheet state
  const [visibilityTarget, setVisibilityTarget] = useState<WineListStats | null>(null);
  const [showVisibility, setShowVisibility] = useState(false);
  const {toggle, isLoading: toggling} = useToggleVisibility();

  const handleCardLongPress = useCallback((item: WineListStats) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    setVisibilityTarget(item);
    setShowVisibility(true);
  }, []);

  const handleVisibilityConfirm = useCallback(async () => {
    if (!visibilityTarget) return;
    await toggle(visibilityTarget.id, visibilityTarget.visibility);
    setShowVisibility(false);
    setVisibilityTarget(null);
    await refetch();
  }, [visibilityTarget, toggle, refetch]);

  const sortOptions = LIST_SORT_KEYS.map((k) => ({ key: k, label: t(SORT_I18N[k]) }));

  return (
    <View style={{flex: 1}}>
      {/* Count + sort trigger row */}
      {!isLoading && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            allowFontScaling={false}
            style={{fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 13.2, color: text.muted}}
          >
            {`${lists.length}개`}
          </Text>
          <View ref={sortButtonRef} collapsable={false}>
            <Pressable
              onPress={openSortDropdown}
              hitSlop={6}
              style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}
            >
              <Text
                allowFontScaling={false}
                style={{fontFamily: 'Freesentation_4Regular', fontSize: 11, lineHeight: 13.2, color: goldText}}
              >
                {`${t(SORT_I18N[sort])} ↕`}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* List or empty state */}
      {!isLoading && lists.length === 0 ? (
        <EmptyState
          title={t('lists.empty.title')}
          description={t('lists.empty.sub')}
          illustration={<ListIcon size={48} strokeWidth={1.25} color={light.text.disabled} />}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 100, gap: 10}}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setSortDropdownVisible(false)}
        >
          {lists.map((item) => (
            <View key={item.id}>
              <ListCard
                item={item}
                onPress={() => router.push(`/cellar/lists/${item.id}`)}
              />
            </View>
          ))}
        </ScrollView>
      )}

      {/* FAB — 새 리스트 */}
      <View
        style={{
          position: 'absolute',
          right: 18,
          bottom: 30,
        }}
      >
        <Pressable
          onPress={() => router.push('/cellar/lists/create')}
          style={({pressed}) => ({opacity: pressed ? 0.88 : 1})}
          accessibilityRole="button"
          accessibilityLabel={t('lists.fab')}
        >
          <View
            style={{
              borderRadius: 26,
              overflow: 'hidden',
              shadowColor: brand.wineRed,
              shadowOffset: {width: 0, height: 8},
              shadowOpacity: 0.45,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={[brand.wineRed, brand.wineRedDeep]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={{
                height: 52,
                paddingHorizontal: 20,
                paddingLeft: 16,
                borderRadius: 26,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Plus size={18} strokeWidth={2.6} color={brand.cream} />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 14,
                  color: brand.cream,
                  letterSpacing: -0.1,
                }}
              >
                {t('lists.fab')}
              </Text>
            </LinearGradient>
          </View>
        </Pressable>
      </View>

      {/* Sort dropdown overlay */}
      {sortDropdownVisible ? (
        <SortDropdown
          options={sortOptions}
          currentKey={sort}
          top={sortDropdownTop}
          title={t('cellar.sort.label')}
          onSelect={(key) => {
            setSort(key as ListSortKey);
            setSortDropdownVisible(false);
          }}
          onDismiss={() => setSortDropdownVisible(false)}
        />
      ) : null}

      {/* Visibility confirmation sheet */}
      <VisibilitySheet
        open={showVisibility}
        mode={visibilityTarget?.visibility === 'private' ? 'toPublic' : 'toPrivate'}
        saveCount={visibilityTarget?.save_count ?? 0}
        isLoading={toggling}
        onClose={() => {setShowVisibility(false); setVisibilityTarget(null);}}
        onConfirm={handleVisibilityConfirm}
      />
    </View>
  );
}
