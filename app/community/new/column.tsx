/**
 * /community/new/column — 긴 글 작성 (Cover + Title + Body + Wine attach + Bottom toolbar).
 *
 * 사양: _workspace/design-specs/community-new.md — 화면 B.
 *
 * §0-2 light-only mode.
 *
 * §10 결정:
 *   C: LightBackHeader inline (v0.2.0 모듈 추출 follow-up)
 *   D: Back 미저장 confirm = Alert.alert (입력 있을 때만 — title/body/coverImage 중 하나)
 *   E: Publish disabled = opacity 0.5 + Pressable disabled
 *   F: Publish onPress = deferredToast + router.back() v0.1.0
 *   G: useImagePicker hook 사용 (src/hooks/use-image-picker.ts)
 *   H: Title counter `24 / 80` 하단 (Title TextInput 아래)
 *   I: Toolbar paddingBottom = 20 + insets.bottom (safe area)
 *   J: Toolbar 5 버튼 — photo→picker (cover image), wine/place/quote/heading → deferredToast (v0.2.0)
 *   K: Toolbar Collapse → Keyboard.dismiss()
 *
 * §4-11 Pressable 안전 패턴:
 *   - Back/Publish: 2-layer
 *   - Cover slot: 3-layer (icon + hint text)
 *   - Wine attach card: 3-layer (Wine + 2 Text + Remove X)
 *   - Wine Remove X: 2-layer (nested)
 *   - Toolbar 5 buttons: 3-layer + §4-11 3.5 (outer flex:1 wrap)
 *   - Toolbar collapse: 2-layer
 *
 * §6 RN deviation:
 *   - 6-2: hairlineWidth (header + toolbar border)
 *   - 6-3: cream → light.text.primary, gold → light.border.active
 *   - 6-9: Publish 999 → 14 (height 28 / 2)
 *   - 6-10: TextInput selectionColor (gold cursor 동등)
 *   - 6-11: italic placeholder 풍 → muted color only
 *   - 6-12: KeyboardAvoidingView wrap (Body TextInput focus 시 toolbar 회피)
 *   - 6-22: position absolute bottom: 0 toolbar — RN 동일
 */
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Image as ImageIcon,
  List,
  MapPin,
  Wine as WineIcon,
  X,
} from 'lucide-react-native';

import { brand, light, withAlpha } from '@/lib/design-tokens';
import { useImagePicker } from '@/hooks/use-image-picker';

const TITLE_MAX = 80;
const COVER_HEIGHT = 140;

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────

export default function CommunityNewColumnScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { pickFromLibrary } = useImagePicker();

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkedWineId, setLinkedWineId] = useState<string | null>(null);

  const titleTrim = title.trim();
  const bodyTrim = body.trim();
  const canPublish = titleTrim.length > 0 && bodyTrim.length > 0;
  const hasDraft = canPublish || coverImage != null || linkedWineId != null;

  // §10 D — 미저장 confirm
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

  // §10 F — Publish deferredToast + router.back()
  const handlePublish = useCallback(() => {
    if (!canPublish) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    Alert.alert(t('app.name'), t('community.column.publishDeferred'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  }, [canPublish, t]);

  // §10 G — Cover image picker (Cover slot + Toolbar photo button 공통)
  const handlePickCover = useCallback(async () => {
    Haptics.selectionAsync().catch(() => undefined);
    const uri = await pickFromLibrary();
    if (uri) setCoverImage(uri);
  }, [pickFromLibrary]);

  // Toolbar 핸들러 (§10 J)
  const handleToolbarWine = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.column.wineDeferred'));
  }, [t]);
  const handleToolbarPlace = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.column.placeDeferred'));
  }, [t]);
  const handleToolbarQuote = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.column.quoteDeferred'));
  }, [t]);
  const handleToolbarHeading = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.column.headingDeferred'));
  }, [t]);
  const handleCollapse = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Keyboard.dismiss();
  }, []);

  const handleWinePress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    if (linkedWineId) router.push(`/wine/${linkedWineId}` as never);
  }, [linkedWineId]);

  const handleRemoveWine = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
    setLinkedWineId(null);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: light.bg.deepest }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LightBackHeader
        title={t('community.column.title')}
        canPublish={canPublish}
        publishLabel={t('community.column.publish')}
        onBack={handleBack}
        onPublish={handlePublish}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover image slot */}
        <Pressable
          onPress={handlePickCover}
          accessibilityRole="button"
          accessibilityLabel={t('community.column.coverHint')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            marginTop: 14,
            marginHorizontal: 16,
          })}
        >
          <View
            style={{
              height: COVER_HEIGHT,
              borderRadius: 14,
              backgroundColor: light.bg.surface,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: light.border.default,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 6,
              overflow: 'hidden',
            }}
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                style={{ ...StyleSheet.absoluteFillObject }}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <>
                <ImageIcon size={20} strokeWidth={1.5} color={light.text.muted} />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 11,
                    color: light.text.muted,
                  }}
                >
                  {t('community.column.coverHint')}
                </Text>
              </>
            )}
          </View>
        </Pressable>

        {/* Title TextInput */}
        <View style={{ paddingTop: 20, paddingHorizontal: 22 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('community.column.titlePlaceholder')}
            placeholderTextColor={light.text.muted}
            maxLength={TITLE_MAX}
            selectionColor={light.border.active}
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 24,
              lineHeight: 30,
              color: light.text.primary,
              padding: 0,
            }}
          />
          {/* §10 H — Counter (title.length > 0 일 때만) */}
          {title.length > 0 && (
            <Text
              allowFontScaling={false}
              style={{
                marginTop: 4,
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                color: light.text.muted,
              }}
            >
              {t('community.column.titleCounter', { n: title.length })}
            </Text>
          )}
        </View>

        {/* Body TextInput */}
        <View style={{ paddingTop: 20, paddingHorizontal: 22 }}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={t('community.column.bodyPlaceholder')}
            placeholderTextColor={light.text.muted}
            multiline
            textAlignVertical="top"
            selectionColor={light.border.active}
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 16,
              lineHeight: 27.2,
              color: light.text.primary,
              minHeight: 200,
              padding: 0,
            }}
          />
        </View>

        {/* Wine attach card (linkedWineId 있을 때만) */}
        {linkedWineId != null && (
          <Pressable
            onPress={handleWinePress}
            accessibilityRole="button"
            accessibilityLabel={`${t('community.column.wineAttached', { count: 1 })}. ${t('community.column.tapToWine')}`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              marginTop: 20,
              marginHorizontal: 16,
            })}
          >
            <View
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: light.bg.surface,
                borderWidth: 1,
                borderColor: withAlpha(brand.gold, 0.33),
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <WineIcon size={20} strokeWidth={1.75} color={light.border.active} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    fontWeight: '600',
                    fontSize: 12,
                    color: light.text.primary,
                  }}
                >
                  {t('community.column.wineAttached', { count: 1 })}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{
                    marginTop: 2,
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 10,
                    color: light.text.muted,
                  }}
                >
                  {t('community.column.tapToWine')}
                </Text>
              </View>
              <Pressable
                onPress={handleRemoveWine}
                accessibilityRole="button"
                accessibilityLabel={t('community.column.removeWine')}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={14} strokeWidth={1.75} color={light.text.muted} />
                </View>
              </Pressable>
            </View>
          </Pressable>
        )}
      </ScrollView>

      {/* Bottom toolbar (§1-B absolute footer) */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 10,
          paddingHorizontal: 12,
          paddingBottom: 20 + insets.bottom,
          backgroundColor: light.bg.deepest,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: light.border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          zIndex: 20,
        }}
      >
        <ToolbarButton
          Icon={ImageIcon}
          labelKey="community.column.toolbar.photo"
          onPress={handlePickCover}
        />
        <ToolbarButton
          Icon={WineIcon}
          labelKey="community.column.toolbar.wine"
          onPress={handleToolbarWine}
        />
        <ToolbarButton
          Icon={MapPin}
          labelKey="community.column.toolbar.place"
          onPress={handleToolbarPlace}
        />
        <ToolbarButton
          Icon={List}
          labelKey="community.column.toolbar.quote"
          onPress={handleToolbarQuote}
        />
        <ToolbarButton
          Icon={BookOpen}
          labelKey="community.column.toolbar.heading"
          onPress={handleToolbarHeading}
        />
        {/* Divider */}
        <View
          style={{
            width: 1,
            height: 28,
            backgroundColor: light.border.default,
            marginHorizontal: 4,
          }}
        />
        {/* Collapse button */}
        <Pressable
          onPress={handleCollapse}
          accessibilityRole="button"
          accessibilityLabel={t('community.column.collapseToolbar')}
          hitSlop={4}
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
            <ChevronDown size={16} strokeWidth={1.75} color={light.text.muted} />
          </View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LightBackHeader (inline — §10 C) — Back + Title + Publish
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
          <ChevronLeft size={18} strokeWidth={1.75} color={light.text.secondary} />
        </View>
      </Pressable>
      <Text
        allowFontScaling={false}
        accessibilityRole="header"
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'Freesentation_4Regular',
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
              fontFamily: 'Freesentation_6SemiBold',
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
// ToolbarButton — §4-11 3-layer + 3.5 (outer flex:1 wrap)
// ────────────────────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  Icon: typeof ImageIcon;
  labelKey: string;
  onPress: () => void;
}

function ToolbarButton({ Icon, labelKey, onPress }: ToolbarButtonProps) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t(labelKey)}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 0,
            borderRadius: 8,
            alignItems: 'center',
            gap: 3,
            flexDirection: 'column',
            backgroundColor: 'transparent',
          }}
        >
          <Icon size={16} strokeWidth={1.75} color={light.text.secondary} />
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10,
              color: light.text.secondary,
            }}
          >
            {t(labelKey)}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
