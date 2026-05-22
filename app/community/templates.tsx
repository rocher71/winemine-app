/**
 * /community/templates — 커뮤니티 양식 (SortToggle + 3 TemplateCard with Bookmark toggle).
 *
 * 사양: _workspace/design-specs/community-side.md §1-C (1차 진실 소스).
 *
 * §0-2 light-only mode.
 *
 * §10 결정 (사양 명시):
 *   A: COMMUNITY_TEMPLATES + getCommunityTemplatesSorted → src/lib/mock/tasting-templates.ts.
 *   B: useTastingTemplates hook (AsyncStorage 키 `winemine.savedTemplates`).
 *   C: Toast 재사용 (profile/index.tsx 패턴 — absolute bottom 16/32 inset).
 *   F: LightBackHeader inline.
 *   J: BottomNav 미노출.
 *   N: paddingBottom = 40 + insets.bottom.
 *
 * §4-11 Pressable 안전 패턴:
 *   - Back / SortChip × 2 / Bookmark × 3: 모두 2-layer
 *
 * §6 RN deviation:
 *   - 6-2: gold → light.border.active
 *   - 6-7: 헤더 하단 hairlineWidth border
 *   - 6-11: -webkit-box clamp → numberOfLines={2} ellipsizeMode="tail"
 *   - 6-15: LocaleText 컴포넌트 재사용 (shared/locale-text.tsx)
 *
 * §4-7 Bookmark 토글:
 *   - saved=false → saveTemplate + Toast 'savedToast' + selection haptic
 *   - saved=true → unsaveTemplate + Toast 'removedToast' + selection haptic
 *   - AsyncStorage 영속 — 화면 재마운트 시 saved 상태 복원
 */
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Bookmark } from 'lucide-react-native';

import { brand, light, withAlpha } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { LocaleText } from '@/components/shared/locale-text';
import { Toast } from '@/components/shared/toast';
import { CommunityBackHeader } from '@/components/community/community-back-header';
import { useTastingTemplates } from '@/hooks/use-tasting-templates';
import {
  getCommunityTemplatesSorted,
  type TastingTemplate,
} from '@/lib/mock/tasting-templates';

type SortKey = 'popular' | 'latest';

interface ToastState {
  message: string;
  key: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────

export default function CommunityTemplatesScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [sort, setSort] = useState<SortKey>('popular');
  const { isSaved, saveTemplate, unsaveTemplate } = useTastingTemplates();
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string) => {
    const key = Date.now();
    setToast({ message, key });
    setTimeout(() => {
      setToast((prev) => (prev && prev.key === key ? null : prev));
    }, 2500);
  }, []);

  const handleToggleSave = useCallback(
    (tpl: TastingTemplate) => {
      Haptics.selectionAsync().catch(() => undefined);
      if (isSaved(tpl.id)) {
        unsaveTemplate(tpl.id);
        showToast(t('community.templates.removedToast'));
      } else {
        saveTemplate(tpl.id);
        showToast(t('community.templates.savedToast'));
      }
    },
    [isSaved, saveTemplate, unsaveTemplate, showToast, t],
  );

  const handleSetSort = useCallback((next: SortKey) => {
    Haptics.selectionAsync().catch(() => undefined);
    setSort(next);
  }, []);

  const items = getCommunityTemplatesSorted(sort);

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <CommunityBackHeader title={t('community.templates.headerTitle')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Intro />
        <SortToggle sort={sort} onChange={handleSetSort} />
        <TemplatesList
          items={items}
          isSaved={isSaved}
          onToggle={handleToggleSave}
        />
      </ScrollView>

      {/* Toast — bookmark 토글 알림 */}
      {toast ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 32 + insets.bottom,
          }}
        >
          <Toast message={toast.message} tone="info" />
        </View>
      ) : null}
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Intro paragraph
// ────────────────────────────────────────────────────────────────────────────

function Intro() {
  const { t } = useTranslation();
  return (
    <View style={{ marginTop: 8, marginHorizontal: 20, marginBottom: 14 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 12,
          lineHeight: 18.6,
          color: light.text.muted,
        }}
      >
        {t('community.templates.intro')}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SortToggle
// ────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS: readonly SortKey[] = ['popular', 'latest'] as const;

interface SortToggleProps {
  sort: SortKey;
  onChange: (next: SortKey) => void;
}

function SortToggle({ sort, onChange }: SortToggleProps) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        gap: 6,
      }}
    >
      {SORT_OPTIONS.map((s) => (
        <SortChip
          key={s}
          sortKey={s}
          active={s === sort}
          onPress={() => onChange(s)}
        />
      ))}
    </View>
  );
}

interface SortChipProps {
  sortKey: SortKey;
  active: boolean;
  onPress: () => void;
}

function SortChip({ sortKey, active, onPress }: SortChipProps) {
  const { t } = useTranslation();
  const label =
    sortKey === 'popular'
      ? t('community.templates.sortPopular')
      : t('community.templates.sortLatest');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={6}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          paddingVertical: 6,
          paddingHorizontal: 14,
          borderRadius: 999,
          backgroundColor: active ? brand.wineRed : 'transparent',
          borderWidth: 1,
          borderColor: active ? brand.wineRed : light.border.default,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontWeight: '600',
            fontSize: 11,
            color: active ? brand.cream : light.text.muted,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TemplatesList
// ────────────────────────────────────────────────────────────────────────────

interface TemplatesListProps {
  items: TastingTemplate[];
  isSaved: (id: string) => boolean;
  onToggle: (tpl: TastingTemplate) => void;
}

function TemplatesList({ items, isSaved, onToggle }: TemplatesListProps) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {items.map((tpl) => (
        <TemplateCard
          key={tpl.id}
          tpl={tpl}
          saved={isSaved(tpl.id)}
          onToggle={() => onToggle(tpl)}
        />
      ))}
    </View>
  );
}

interface TemplateCardProps {
  tpl: TastingTemplate;
  saved: boolean;
  onToggle: () => void;
}

function TemplateCard({ tpl, saved, onToggle }: TemplateCardProps) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const authorName = locale === 'ko' ? tpl.authorName.ko : tpl.authorName.en;
  const metaLine = t('community.templates.metaLine', {
    author: authorName,
    fields: tpl.fields.length,
    saves: tpl.savesCount,
  });

  return (
    <View
      style={{
        padding: 14,
        borderRadius: 14,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <LocaleText
            value={tpl.title}
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 15,
              lineHeight: 19.5,
              color: light.text.primary,
            }}
          />
          <Text
            allowFontScaling={false}
            style={{
              marginTop: 4,
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              color: light.text.muted,
            }}
          >
            {metaLine}
          </Text>
        </View>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={
            saved ? t('community.templates.saved') : t('community.templates.save')
          }
          accessibilityState={{ selected: saved }}
          hitSlop={6}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flexShrink: 0 })}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 999,
              backgroundColor: saved ? withAlpha(brand.gold, 0.18) : 'transparent',
              borderWidth: 1,
              borderColor: saved ? light.border.active : light.border.default,
            }}
          >
            <Bookmark
              size={12}
              strokeWidth={1.75}
              color={saved ? light.border.active : light.text.secondary}
              fill={saved ? light.border.active : 'none'}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 11,
                color: saved ? light.border.active : light.text.secondary,
              }}
            >
              {saved
                ? t('community.templates.saved')
                : t('community.templates.save')}
            </Text>
          </View>
        </Pressable>
      </View>
      {tpl.description ? (
        <LocaleText
          value={tpl.description}
          allowFontScaling={false}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 12,
            lineHeight: 18.6,
            color: light.text.secondary,
          }}
        />
      ) : null}
    </View>
  );
}
