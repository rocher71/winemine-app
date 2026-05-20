/**
 * CellarBottomSheet — Stage 3 cellar wine picker.
 *
 * 사양: design-spec notes-new.md §2 (Stage 3 line 120~141) + §3.
 * 키스크린 원본: src/app/notes/new/page.tsx line 116~206 (BottomSheet inline).
 *
 * 구조:
 *   BottomSheet (snapPoints ['70%'], backdrop opacity 0.6, enablePanDownToClose)
 *   ├── DragHandle (gold — handleIndicatorStyle)
 *   └── BottomSheetView (padding 0_4 bottom 16, gap 8)
 *       ├── Title (Playfair 18 cream — bottomSheetTitle, margin 4_8_12 "셀러 와인")
 *       └── CellarList (BottomSheetScrollView maxHeight 50vh, contentGap 6)
 *           └── CellarRow × cellar.length
 *               Pressable (flex-row items-center gap-2.5, padding 10, w-full,
 *                          bg-surface, border 1px border-default, radius 10)
 *               ├── BottleThumb (WMBottle 32×44)
 *               ├── TextStack (flex-1, minWidth:0)
 *               │   ├── Name (Playfair 13 cream, single-line ellipsis — cellarRowName)
 *               │   └── Meta (Inter 11 muted, "{vintage} · {region}" — cellarRowMeta)
 *               └── (no trailing icon)
 */
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { WMBottle } from '@/components/shared/wm-bottle';
import { brand, dark, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import type { CellarItemWithWine } from '@/hooks/use-cellar';
import type { TypeCanonical } from '@/lib/design-tokens';

const TYPE_CANONICAL: ReadonlySet<TypeCanonical> = new Set([
  'red',
  'white',
  'rose',
  'sparkling',
  'fortified',
  'dessert',
]);

function asTypeCanonical(v: string | null | undefined): TypeCanonical | null {
  if (v && TYPE_CANONICAL.has(v as TypeCanonical)) return v as TypeCanonical;
  return null;
}

interface CellarBottomSheetProps {
  open: boolean;
  items: CellarItemWithWine[];
  onClose: () => void;
  onPickItem: (item: CellarItemWithWine) => void;
}

export function CellarBottomSheet({
  open,
  items,
  onClose,
  onPickItem,
}: CellarBottomSheetProps) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const sheetRef = useRef<BottomSheet>(null);
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;

  const snapPoints = useMemo(() => ['70%'], []);
  const listMaxHeight = useMemo(() => Dimensions.get('window').height * 0.5, []);

  // open prop → sheet open/close 동기화
  useEffect(() => {
    if (open) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.6}
      />
    ),
    [],
  );

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1 && open) onClose();
    },
    [open, onClose],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={open ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: surfaceBg }}
      handleIndicatorStyle={{
        backgroundColor: brand.gold,
        width: 36,
        height: 4,
        borderRadius: 2,
      }}
      accessible
      accessibilityRole="none"
      accessibilityLabel={t('notes.source.cellarListTitle')}
    >
      <BottomSheetView
        style={{ paddingHorizontal: 4, paddingBottom: 16, gap: 8 }}
      >
        <Text
          className="font-playfair text-text-primary dark:text-text-primary"
          style={{
            fontSize: 18,
            lineHeight: 21.6,
            marginHorizontal: 8,
            marginTop: 4,
            marginBottom: 12,
          }}
        >
          {t('notes.source.cellarListTitle')}
        </Text>
        <BottomSheetScrollView
          style={{ maxHeight: listMaxHeight }}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 4 }}
        >
          {items.map((item) => (
            <CellarRow key={item.id} item={item} onPress={() => onPickItem(item)} />
          ))}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

interface CellarRowProps {
  item: CellarItemWithWine;
  onPress: () => void;
}

function CellarRow({ item, onPress }: CellarRowProps) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const wine = item.wine;
  if (!wine?.lwin || !wine?.display_name) return null;

  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const borderColor = scheme === 'light' ? light.border.default : dark.border.default;
  const typeCanon = asTypeCanonical(wine.type_canonical);
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(typeCanon);
  const vintage = wine.vintage ?? parseLwinVintage(wine.lwin);
  const wineName = wine.name_ko ?? wine.display_name;

  // Meta line: "{vintage} · {region}" (vintage null이면 region만)
  const region = wine.region ?? wine.country ?? '';
  const meta = vintage && region ? `${vintage} · ${region}` : vintage ? String(vintage) : region;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${wineName} ${vintage ?? ''}`.trim()}
      accessibilityHint={t('notesNew.sourcePicker.cellarRowHint')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        width: '100%',
        backgroundColor: surfaceBg,
        borderWidth: 1,
        borderColor,
        borderRadius: 10,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* BottleThumb — WMBottle 32×44 (cellar-list와 동일 패턴) */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ flexShrink: 0 }}
      >
        <WMBottle width={32} height={44} bottleColor={bottleColor} type={typeCanon} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          className="font-playfair text-text-primary dark:text-text-primary"
          style={{ fontSize: 13, lineHeight: 15.6 }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {wineName}
        </Text>
        {meta ? (
          <Text
            className="font-inter text-text-muted dark:text-text-muted"
            style={{ fontSize: 11, lineHeight: 13.2 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {meta}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
