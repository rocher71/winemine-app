import { useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import {
  Wine,
  Utensils,
  Store,
  Gift,
  GlassWater,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { brand, dark, light } from '@/lib/design-tokens';

type Source = 'cellar' | 'restaurant' | 'shop' | 'gift' | 'tasting_event' | 'other';

interface Option {
  source: Source;
  icon: LucideIcon;
  labelKey: string;
}

const OPTIONS: Option[] = [
  { source: 'cellar', icon: Wine, labelKey: 'notes.source.cellar' },
  { source: 'restaurant', icon: Utensils, labelKey: 'notes.source.restaurant' },
  { source: 'shop', icon: Store, labelKey: 'notes.source.shop' },
  { source: 'gift', icon: Gift, labelKey: 'notes.source.gift' },
  { source: 'tasting_event', icon: GlassWater, labelKey: 'notes.source.tasting_event' },
  { source: 'other', icon: MoreHorizontal, labelKey: 'notes.source.other' },
];

export default function NoteSourcePickerScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ wine_lwin?: string; photo_url?: string }>();
  const sheetRef = useRef<BottomSheet>(null);
  const scheme = useColorScheme();
  const handleColor = scheme === 'light' ? light.text.muted : dark.text.muted;
  const sheetBg = scheme === 'light' ? light.bg.deep : dark.bg.deep;

  const snapPoints = useMemo(() => ['50%'], []);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const handlePick = useCallback(
    (source: Source) => {
      Haptics.selectionAsync().catch(() => undefined);
      const query = new URLSearchParams({ source });
      const wineLwin = typeof params.wine_lwin === 'string' ? params.wine_lwin : null;
      const photoUrl = typeof params.photo_url === 'string' ? params.photo_url : null;
      if (wineLwin) query.set('wine_lwin', wineLwin);
      if (photoUrl) query.set('photo_url', photoUrl);
      router.replace(`/notes/new/write?${query.toString()}`);
    },
    [params.wine_lwin, params.photo_url],
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
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

  return (
    <View className="flex-1">
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: sheetBg }}
        handleIndicatorStyle={{ backgroundColor: handleColor }}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <Text className="font-playfair text-modal-title text-text-primary dark:text-text-primary">
            {t('notes.source.title')}
          </Text>
          <Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary mt-1">
            {t('notes.source.subtitle')}
          </Text>
          <View className="mt-4 gap-2">
            {OPTIONS.map((opt) => (
              <SourceRow
                key={opt.source}
                icon={opt.icon}
                label={t(opt.labelKey)}
                onPress={() => handlePick(opt.source)}
              />
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

interface RowProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

function SourceRow({ icon: Icon, label, onPress }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center rounded-md bg-surface px-4"
      style={({ pressed }) => ({
        height: 80,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(201,168,76,0.12)' }}
      >
        <Icon size={22} strokeWidth={1.8} color={brand.gold} />
      </View>
      <Text className="ml-4 font-inter-semibold text-card-title text-text-primary dark:text-text-primary">
        {label}
      </Text>
    </Pressable>
  );
}
