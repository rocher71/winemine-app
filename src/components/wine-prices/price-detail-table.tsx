/**
 * PriceDetailTable — 매장별 그룹 + 정렬 토글 + PurchaseRow.
 *
 * 사양: wine-prices.md §3-4 + §3-4a.
 *
 * 결정 (작업 요청):
 *   - B: PurchaseRow ChevronRight 제거 (profile link 부재 — noise 줄이기).
 *     Pressable hit area 유지, accessibilityRole="text", onPress=no-op.
 *   - I: 빈 상태 verbatim 단일 Text.
 *
 * Light-only 화면 (wine-prices.md §0-2). 모든 색은 light.* / brand.* 토큰 직접 inline.
 *
 * §4-11 3-layer Pressable 패턴 (sort 토글 + PurchaseRow).
 *
 * 익명화 (§6 #6): keyscreen verbatim — userId 'me-heavy'/'me-first' → "내 등록" / "My entry",
 * 그 외 → LevelPillNum + level name. 닉네임 노출 X.
 */
import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { LocaleText } from '@/components/shared/locale-text';
import { LevelPillNum } from '@/components/wine-prices/level-pill-num';
import { brand, light } from '@/lib/design-tokens';
import { getStore, type Store } from '@/lib/mock/stores';
import type { Purchase } from '@/lib/mock/purchases';

type SortKey = 'priceAsc' | 'recent';
type LevelId = 1 | 2 | 3 | 4 | 5;

interface PriceDetailTableProps {
  purchases: Purchase[];
}

interface Group {
  store: Store;
  items: Purchase[];
}

/**
 * userId → LevelId 매핑 (mock 단계).
 * 'me-heavy' → 3 (감식가), 'me-first' → 1 (입문자).
 * 'anon-NNN' → NNN % 5 + 1 으로 분산 (시각 검증 풍부함).
 */
function getLevelIdForUser(userId: string): LevelId {
  if (userId === 'me-heavy') return 3;
  if (userId === 'me-first') return 1;
  const m = userId.match(/^anon-(\d+)$/);
  if (m && m[1]) {
    const n = parseInt(m[1], 10);
    return ((n % 5) + 1) as LevelId;
  }
  return 2;
}

function isSelfUser(userId: string): boolean {
  return userId === 'me-heavy' || userId === 'me-first';
}

export function PriceDetailTable({ purchases }: PriceDetailTableProps) {
  const { t } = useTranslation();
  const [sort, setSort] = useState<SortKey>('priceAsc');

  const handleSortPress = (s: SortKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    setSort(s);
  };

  const groups = useMemo<Group[]>(() => {
    const byStore = new Map<string, Purchase[]>();
    for (const p of purchases) {
      const arr = byStore.get(p.storeId) ?? [];
      arr.push(p);
      byStore.set(p.storeId, arr);
    }
    const list: Group[] = [];
    for (const [storeId, items] of byStore) {
      const store = getStore(storeId);
      if (!store) continue;
      list.push({ store, items });
    }

    if (sort === 'priceAsc') {
      list.sort((a, b) => {
        const aMin = Math.min(...a.items.map((p) => p.priceKrw));
        const bMin = Math.min(...b.items.map((p) => p.priceKrw));
        return aMin - bMin;
      });
    } else {
      list.sort((a, b) => {
        const aMax = Math.max(
          ...a.items.map((p) => new Date(p.purchasedAt).getTime()),
        );
        const bMax = Math.max(
          ...b.items.map((p) => new Date(p.purchasedAt).getTime()),
        );
        return bMax - aMax;
      });
    }
    // group 내부 row 정렬도 같은 방향.
    for (const g of list) {
      if (sort === 'priceAsc') {
        g.items.sort((a, b) => a.priceKrw - b.priceKrw);
      } else {
        g.items.sort(
          (a, b) =>
            new Date(b.purchasedAt).getTime() -
            new Date(a.purchasedAt).getTime(),
        );
      }
    }
    return list;
  }, [purchases, sort]);

  // §10 I: 빈 상태 verbatim 단일 Text.
  if (purchases.length === 0) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          padding: 24,
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 13,
            color: light.text.muted,
            textAlign: 'center',
            lineHeight: 19.5,
          }}
        >
          {t('winePrices.table.empty')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: 16 }}>
      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_6SemiBold',
            fontWeight: '600',
            fontSize: 14,
            color: light.text.primary,
          }}
        >
          {t('winePrices.table.title')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <SortBtn
            label={t('winePrices.table.sort.priceAsc')}
            active={sort === 'priceAsc'}
            onPress={() => handleSortPress('priceAsc')}
          />
          <SortBtn
            label={t('winePrices.table.sort.recent')}
            active={sort === 'recent'}
            onPress={() => handleSortPress('recent')}
          />
        </View>
      </View>

      {/* Groups */}
      <View style={{ gap: 12 }}>
        {groups.map((g) => (
          <View
            key={g.store.id}
            style={{
              padding: 12,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: light.border.default,
              borderRadius: 12,
            }}
          >
            {/* Store header */}
            <View style={{ marginBottom: 8 }}>
              <LocaleText
                value={g.store.name}
                style={{
                  fontFamily: 'Freesentation_6SemiBold',
                  fontWeight: '600',
                  fontSize: 14,
                  color: light.text.primary,
                  lineHeight: 18,
                }}
              />
              {g.store.branch ? (
                <LocaleText
                  value={g.store.branch}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 12,
                    color: light.text.muted,
                    lineHeight: 16,
                    marginTop: 2,
                  }}
                />
              ) : null}
            </View>

            {/* Rows */}
            <View style={{ gap: 6 }}>
              {g.items.map((p) => (
                <PurchaseRow key={p.id} purchase={p} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

interface SortBtnProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function SortBtn({ label, active, onPress }: SortBtnProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: light.border.default,
          borderRadius: 8,
          // §10 H verbatim: active = light.border.active (gold).
          backgroundColor: active ? light.border.active : light.bg.deep,
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_6SemiBold',
            fontWeight: '600',
            fontSize: 11,
            lineHeight: 13,
            color: active ? brand.cream : light.text.muted,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

interface PurchaseRowProps {
  purchase: Purchase;
}

function PurchaseRow({ purchase }: PurchaseRowProps) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language as 'ko' | 'en') || 'ko';
  const levelId = getLevelIdForUser(purchase.userId);
  const isSelf = isSelfUser(purchase.userId);
  const levelName = t(`level.L${levelId}`);

  const a11yLabel = t('winePrices.table.row.a11yLabel', {
    price: `₩${purchase.priceKrw.toLocaleString(
      locale === 'ko' ? 'ko-KR' : 'en-US',
    )}`,
    date: purchase.purchasedAt,
    level: levelId,
    levelName: isSelf ? t('winePrices.table.myEntry') : levelName,
  });

  return (
    <Pressable
      onPress={undefined}
      accessibilityRole="text"
      accessibilityLabel={a11yLabel}
      style={{ opacity: 1 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 8,
          paddingHorizontal: 4,
          borderTopWidth: 1,
          borderTopColor: light.border.default,
          borderStyle: 'dashed',
        }}
      >
        <View style={{ flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_7Bold',
              fontWeight: '700',
              fontSize: 15,
              color: light.text.primary,
              lineHeight: 18,
            }}
          >
            ₩{purchase.priceKrw.toLocaleString()}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                color: light.text.muted,
              }}
            >
              {purchase.purchasedAt}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: light.text.muted,
              }}
            >
              ·
            </Text>
            <LevelPillNum level={levelId} size="sm" />
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                color: light.text.muted,
              }}
            >
              {isSelf ? t('winePrices.table.myEntry') : levelName}
            </Text>
          </View>
        </View>
        {/* §10 B: ChevronRight 제거 (profile link 부재 — noise 줄이기). */}
      </View>
    </Pressable>
  );
}
