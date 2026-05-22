/**
 * /community/new/album — 사진 앨범 작성 (Photo grid + Caption + Tagged wines + Location).
 *
 * 사양: _workspace/design-specs/community-new.md — 화면 C.
 *
 * §0-2 light-only mode.
 *
 * §10 결정:
 *   C: LightBackHeader inline (v0.2.0 모듈 추출 follow-up)
 *   D: Back 미저장 confirm = Alert.alert (photos.length > 0 또는 caption 있을 때만)
 *   E: Publish disabled = opacity 0.5 + Pressable disabled (photos.length === 0)
 *   F: Publish onPress = deferredToast + router.back() v0.1.0
 *   G: useImagePicker.pickMultiple (max = 9 - photos.length)
 *   L: PhotoSlot tap → remove confirm Alert (v0.1.0 — onLongPress reorder 는 v0.2.0)
 *   M: Tagged wines max 5
 *   N: Wine chip → /wine/[lwin] / Add chip → deferredToast (BottomSheet v0.2.0)
 *   O: Location row = deferredToast (BottomSheet v0.2.0)
 *   P: Photo empty fallback = expo-image placeholder + Image icon (실제 사용자 사진)
 *   Q: expo-image-picker auto prompt (capture 동일)
 *
 * §4-11 Pressable 안전 패턴:
 *   - Back/Publish: 2-layer
 *   - PhotoSlot × N: 3-layer (Image + Index badge 자식 + position absolute 복잡)
 *   - Add slot: 3-layer (Plus icon)
 *   - Wine chip: 3-layer (Bottle + Name + Remove X 자식)
 *   - Wine chip Remove: 2-layer (nested)
 *   - Add chip: 3-layer (Plus + Text)
 *   - Location row: 3-layer (MapPin + Text + Chevron)
 *
 * §6 RN deviation:
 *   - 6-2: hairlineWidth (header border)
 *   - 6-3: cream → light.text.primary, gold → light.border.active
 *   - 6-9: Publish 14, Index badge 9 (size/2)
 *   - 6-13: ChevronLeft (keyscreen verbatim, 산문 X 는 오기)
 *   - 6-14: grid → flexbox row + wrap (Dimensions 기반 cell width)
 *   - 6-15: inset 10 → top/right/bottom/left 분해
 *   - 6-17: Photo Index badge cream 유지 (textInk bg 위 가독성 OK)
 *   - 6-18: overflowX auto → horizontal ScrollView
 *   - 6-19: ChevronLeft rotate(180) → ChevronRight 직접
 */
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, MapPin, Plus, X } from 'lucide-react-native';

import { brand, light, withAlpha } from '@/lib/design-tokens';
import { useImagePicker } from '@/hooks/use-image-picker';

const CAPTION_MAX = 500;
const PHOTO_MAX = 9;
const TAGGED_WINE_MAX = 5;
const GRID_GAP = 6;
const GRID_PADDING_H = 16;

interface PhotoItem {
  uri: string;
}

interface TaggedWine {
  /** lwin 또는 mock id */
  id: string;
  /** display name (한국어 우선) */
  name: string;
  /** hex 색상 (mock wines bottle_color 또는 fallback brand.wineRed) */
  bottleColor: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────

export default function CommunityNewAlbumScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const { pickMultiple } = useImagePicker();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [caption, setCaption] = useState('');
  const [taggedWines, setTaggedWines] = useState<TaggedWine[]>([]);
  const [location, setLocation] = useState<string | null>(null);

  const canPublish = photos.length > 0;
  const hasDraft =
    photos.length > 0 ||
    caption.trim().length > 0 ||
    taggedWines.length > 0 ||
    location != null;

  // §6-14: cell width = (screenWidth - paddingH*2 - gap*2) / 3
  const photoSlotSize = (screenWidth - GRID_PADDING_H * 2 - GRID_GAP * 2) / 3;

  // §10 D — Back 미저장 confirm
  const handleBack = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    if (!hasDraft) {
      router.back();
      return;
    }
    Alert.alert(
      t('community.column.confirmDiscardTitle'),
      t('community.column.confirmDiscardBody'),
      [
        { text: t('community.column.confirmDiscardCancel'), style: 'cancel' },
        {
          text: t('community.column.confirmDiscardOk'),
          style: 'destructive',
          onPress: () => router.back(),
        },
      ],
    );
  }, [hasDraft, t]);

  // §10 F — Publish deferredToast
  const handlePublish = useCallback(() => {
    if (!canPublish) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    Alert.alert(t('app.name'), t('community.album.publishDeferred'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  }, [canPublish, t]);

  // §10 G — Add photos (multi pick)
  const handleAddPhotos = useCallback(async () => {
    Haptics.selectionAsync().catch(() => undefined);
    const remaining = PHOTO_MAX - photos.length;
    if (remaining <= 0) return;
    const uris = await pickMultiple(remaining);
    if (uris.length === 0) return;
    setPhotos((prev) => [...prev, ...uris.map((uri) => ({ uri }))]);
  }, [photos.length, pickMultiple]);

  // §10 L — PhotoSlot tap = remove confirm
  const handlePhotoPress = useCallback(
    (index: number) => {
      Haptics.selectionAsync().catch(() => undefined);
      Alert.alert(t('community.album.removePhotoTitle'), undefined, [
        { text: t('community.album.removePhotoCancel'), style: 'cancel' },
        {
          text: t('community.album.removePhotoOk'),
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
            setPhotos((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]);
    },
    [t],
  );

  // §10 N — Add chip onPress = deferredToast (BottomSheet v0.2.0)
  const handleAddWineChip = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.album.addWineDeferred'));
  }, [t]);

  // §10 N — Wine chip outer onPress = /wine/[lwin]
  const handleWineChipPress = useCallback((wine: TaggedWine) => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/wine/${wine.id}` as never);
  }, []);

  const handleRemoveWineChip = useCallback((wineId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
    setTaggedWines((prev) => prev.filter((w) => w.id !== wineId));
  }, []);

  // §10 O — Location deferredToast
  const handleLocationPress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.album.locationDeferred'));
  }, [t]);

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader
        title={t('community.album.title')}
        canPublish={canPublish}
        publishLabel={t('community.album.publish')}
        onBack={handleBack}
        onPublish={handlePublish}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo grid */}
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: GRID_PADDING_H,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: GRID_GAP,
          }}
        >
          {photos.map((photo, i) => (
            <PhotoSlot
              key={`${photo.uri}-${i}`}
              uri={photo.uri}
              index={i}
              total={photos.length}
              size={photoSlotSize}
              onPress={() => handlePhotoPress(i)}
            />
          ))}
          {photos.length < PHOTO_MAX && (
            <AddSlot size={photoSlotSize} onPress={handleAddPhotos} />
          )}
        </View>

        {/* Caption */}
        <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 10,
              color: light.border.active,
              letterSpacing: 1.8,
            }}
          >
            {t('community.album.caption').toUpperCase()}
          </Text>
          <View
            style={{
              marginTop: 8,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: light.border.default,
            }}
          >
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder={t('community.album.captionPlaceholder')}
              placeholderTextColor={light.text.muted}
              multiline
              textAlignVertical="top"
              maxLength={CAPTION_MAX}
              selectionColor={light.border.active}
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 15,
                lineHeight: 24,
                color: light.text.primary,
                minHeight: 80,
                padding: 0,
              }}
            />
          </View>
        </View>

        {/* Tagged wines */}
        <View style={{ paddingTop: 18, paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 10,
                color: light.border.active,
                letterSpacing: 1.8,
              }}
            >
              {t('community.album.taggedWines').toUpperCase()}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 10,
                color: light.text.muted,
              }}
            >
              {String(taggedWines.length)}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, flexDirection: 'row' }}
          >
            {taggedWines.map((wine) => (
              <WineChip
                key={wine.id}
                wine={wine}
                onPress={() => handleWineChipPress(wine)}
                onRemove={() => handleRemoveWineChip(wine.id)}
              />
            ))}
            {taggedWines.length < TAGGED_WINE_MAX && (
              <AddWineChip onPress={handleAddWineChip} />
            )}
          </ScrollView>
        </View>

        {/* Location row */}
        <Pressable
          onPress={handleLocationPress}
          accessibilityRole="button"
          accessibilityLabel={location ?? t('community.album.addLocation')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            marginTop: 18,
            marginHorizontal: 16,
          })}
        >
          <View
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: light.border.default,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <MapPin size={16} strokeWidth={1.75} color={light.border.active} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: location ? light.text.primary : light.text.muted,
              }}
            >
              {location ?? t('community.album.addLocation')}
            </Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={14} strokeWidth={1.75} color={light.text.muted} />
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LightBackHeader (inline — §10 C)
// ────────────────────────────────────────────────────────────────────────────

interface LightBackHeaderProps {
  title: string;
  canPublish: boolean;
  publishLabel: string;
  onBack: () => void;
  onPublish: () => void;
}

function LightBackHeader({
  title,
  canPublish,
  publishLabel,
  onBack,
  onPublish,
}: LightBackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: light.border.default,
      }}
    >
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={t('community.compose.backLabel')}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          {/* §6-13: keyscreen verbatim ChevronLeft */}
          <ChevronLeft size={18} strokeWidth={1.75} color={light.text.secondary} />
        </View>
      </Pressable>
      <Text
        allowFontScaling={false}
        accessibilityRole="header"
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: 15,
          color: light.text.primary,
        }}
      >
        {title}
      </Text>
      <Pressable
        onPress={onPublish}
        disabled={!canPublish}
        accessibilityRole="button"
        accessibilityLabel={publishLabel}
        accessibilityState={{ disabled: !canPublish }}
        hitSlop={4}
        style={({ pressed }) => ({
          opacity: !canPublish ? 0.5 : pressed ? 0.85 : 1,
        })}
      >
        <View
          style={{
            paddingVertical: 7,
            paddingHorizontal: 14,
            borderRadius: 14,
            backgroundColor: brand.wineRed,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontWeight: '600',
              fontSize: 12,
              color: brand.cream,
            }}
          >
            {publishLabel}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// PhotoSlot — §1-C-PhotoSlot (3-layer, Image + Index badge)
// ────────────────────────────────────────────────────────────────────────────

interface PhotoSlotProps {
  uri: string;
  index: number;
  total: number;
  size: number;
  onPress: () => void;
}

function PhotoSlot({ uri, index, total, size, onPress }: PhotoSlotProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="imagebutton"
      accessibilityLabel={t('community.album.photoLabel', { index: index + 1, total })}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          width: size,
          aspectRatio: 1,
          borderRadius: 8,
          position: 'relative',
          borderWidth: 1,
          borderColor: light.border.default,
          backgroundColor: light.bg.surface,
          overflow: 'hidden',
        }}
      >
        {/* §6-15: inset 10 분해 */}
        <Image
          source={{ uri }}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            borderRadius: 4,
          }}
          contentFit="cover"
          transition={150}
        />
        {/* Index badge (§6-9 18×18 borderRadius 9) */}
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: withAlpha(brand.textInk, 0.85),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'PlayfairDisplay_700Bold',
              fontWeight: '700',
              fontSize: 10,
              // §6-17 cream 유지 (textInk bg 위 가독성 OK)
              color: brand.cream,
            }}
          >
            {String(index + 1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// AddSlot — §1-C (dashed border + Plus icon)
// ────────────────────────────────────────────────────────────────────────────

interface AddSlotProps {
  size: number;
  onPress: () => void;
}

function AddSlot({ size, onPress }: AddSlotProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('community.album.addPhoto')}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          width: size,
          aspectRatio: 1,
          borderRadius: 8,
          backgroundColor: light.bg.surface,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: light.border.default,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus size={20} strokeWidth={1.75} color={light.text.muted} />
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// WineChip — §1-C Tagged wines (3-layer + Remove X nested 2-layer)
// ────────────────────────────────────────────────────────────────────────────

interface WineChipProps {
  wine: TaggedWine;
  onPress: () => void;
  onRemove: () => void;
}

function WineChip({ wine, onPress, onRemove }: WineChipProps) {
  const { t } = useTranslation();
  // keyscreen verbatim 단축 — 첫 단어
  const shortName = wine.name.split(' ')[0] ?? wine.name;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={wine.name}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flexShrink: 0 })}
    >
      <View
        style={{
          paddingVertical: 8,
          paddingLeft: 8,
          paddingRight: 12,
          borderRadius: 10,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: light.border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <View
          style={{
            width: 18,
            height: 60,
            borderRadius: 3,
            backgroundColor: wine.bottleColor,
            flexShrink: 0,
          }}
        />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: light.text.primary,
          }}
        >
          {shortName}
        </Text>
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={t('community.album.removeWine')}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <View
            style={{
              width: 16,
              height: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={10} strokeWidth={1.75} color={light.text.muted} />
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// AddWineChip — §1-C Add chip (3-layer, dashed border)
// ────────────────────────────────────────────────────────────────────────────

interface AddWineChipProps {
  onPress: () => void;
}

function AddWineChip({ onPress }: AddWineChipProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('community.album.addWineButton')}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, flexShrink: 0 })}
    >
      <View
        style={{
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 10,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: light.border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          flexShrink: 0,
        }}
      >
        <Plus size={12} strokeWidth={1.75} color={light.text.muted} />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: light.text.muted,
          }}
        >
          {t('community.album.addWine')}
        </Text>
      </View>
    </Pressable>
  );
}
