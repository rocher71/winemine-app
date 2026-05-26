/**
 * ListTabContent — 셀러 탭 > 리스트 탭 전체 콘텐츠.
 * 내 리스트 목록 + FAB + VisibilitySheet.
 */
import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { Plus, List as ListIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { brand, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { EmptyState } from '@/components/shared/empty-state';
import { ListCard } from '@/components/cellar/list-card';
import { ListSortBar } from '@/components/cellar/list-sort-bar';
import { VisibilitySheet } from '@/components/cellar/visibility-sheet';
import {
  useMyLists,
  useToggleVisibility,
  type ListSortKey,
  type WineListStats,
} from '@/hooks/use-wine-lists';

const LIST_SORT_KEYS: readonly ListSortKey[] = ['recent', 'created', 'name', 'count'] as const;

export function ListTabContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { bg, text, scheme } = useThemeTokens();

  const [sort, setSort] = useState<ListSortKey>('recent');
  const { lists, isLoading, refetch } = useMyLists(sort);

  // Visibility sheet state
  const [visibilityTarget, setVisibilityTarget] = useState<WineListStats | null>(null);
  const [showVisibility, setShowVisibility] = useState(false);
  const { toggle, isLoading: toggling } = useToggleVisibility();

  const handleSortPress = useCallback(() => {
    const sortLabelMap: Record<ListSortKey, string> = {
      recent:  t('lists.sortRecent'),
      created: t('lists.sortCreated'),
      name:    t('lists.sortName'),
      count:   t('lists.sortCount'),
    };
    const options = LIST_SORT_KEYS.map((k) => sortLabelMap[k]);
    if (Platform.OS === 'ios') {
      const { ActionSheetIOS } = require('react-native');
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...options, t('common.cancel')], cancelButtonIndex: options.length },
        (idx: number) => {
          const key = LIST_SORT_KEYS[idx];
          if (key) setSort(key);
        },
      );
    } else {
      Alert.alert(
        '',
        '',
        [
          ...LIST_SORT_KEYS.map((k) => ({
            text: sortLabelMap[k],
            onPress: () => setSort(k),
          })),
          { text: t('common.cancel'), style: 'cancel' as const },
        ],
      );
    }
  }, [t]);

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

  return (
    <View style={{ flex: 1 }}>
      {/* Sort bar */}
      {lists.length > 0 && (
        <ListSortBar count={lists.length} sort={sort} onSortPress={handleSortPress} />
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
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
          showsVerticalScrollIndicator={false}
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
          bottom: 102,
        }}
      >
        <Pressable
          onPress={() => router.push('/cellar/lists/create')}
          style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          accessibilityRole="button"
          accessibilityLabel={t('lists.fab')}
        >
          <View
            style={{
              borderRadius: 26,
              overflow: 'hidden',
              shadowColor: brand.wineRed,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={[brand.wineRed, brand.wineRedDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
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

      {/* Visibility confirmation sheet */}
      <VisibilitySheet
        open={showVisibility}
        mode={visibilityTarget?.visibility === 'private' ? 'toPublic' : 'toPrivate'}
        saveCount={visibilityTarget?.save_count ?? 0}
        isLoading={toggling}
        onClose={() => { setShowVisibility(false); setVisibilityTarget(null); }}
        onConfirm={handleVisibilityConfirm}
      />
    </View>
  );
}
