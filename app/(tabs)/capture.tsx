/**
 * Capture screen — wine label capture (Day 6 retroactive design hardening).
 *
 * design-spec capture.md §2 Layout Tree (3-stage + RN hybrid 추가 stage).
 *   choose → live-camera (RN scan 옵션 후) → simulating → recognized
 *   (+ permissionFallback / manualPlaceholderModal RN 전용)
 *
 * design-review FAIL 6/6 해결:
 *   (a) 요소 누락: CaptureHeader + ChooseView 4-card + SimulatingView + RecognizedView 전체 추가
 *   (b) spacing: 18/104/16 등 verbatim
 *   (c) gradient: PhotoFrame 180deg captureBottlePhotoGradient
 *   (d) radius: SecondaryButton 10 / Card 16 / AIBadge 12 / PhotoFrame 8
 *   (e) typography: 11 신규 토큰 적용
 *   (f) color: 토큰화 (overlay.pillBg / overlay.bgScrim / capture.* / light 분기)
 */
import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Linking,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  Camera as CameraIcon,
  Image as ImageIcon,
  Library,
  BookOpen,
  X,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { scanLabel } from '@/lib/label-scan';
import { getCurrentUserId } from '@/lib/auth';
import { shortId } from '@/lib/id';
import {
  brand,
  dark,
  light,
  overlay,
  type TypeCanonical,
} from '@/lib/design-tokens';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import { CaptureHeader } from '@/components/capture/capture-header';
import { ChooseOptionCard } from '@/components/capture/choose-option-card';
import { SimulatingView } from '@/components/capture/simulating-view';
import { ProcessingOverlay } from '@/components/capture/processing-overlay';
import {
  RecognizedView,
  type RecognizedWineData,
} from '@/components/capture/recognized-view';

type Stage =
  | 'choose'
  | 'live-camera'
  | 'simulating'
  | 'recognized';

type SimulatingSource = 'scan' | 'gallery';
type Busy = 'capturing' | 'uploading' | 'scanning' | null;

const TYPE_CANONICAL: ReadonlySet<TypeCanonical> = new Set([
  'red',
  'white',
  'rose',
  'sparkling',
  'fortified',
  'dessert',
]);

function asTypeCanonical(value: string | null | undefined): TypeCanonical | null {
  if (value && TYPE_CANONICAL.has(value as TypeCanonical)) return value as TypeCanonical;
  return null;
}

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const res = await fetch(uri);
  if (!res.ok) throw new Error(`fetch ${uri} → ${res.status}`);
  return res.arrayBuffer();
}

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [stage, setStage] = useState<Stage>('choose');
  const [simulatingSource, setSimulatingSource] = useState<SimulatingSource>('scan');
  const [busy, setBusy] = useState<Busy>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showManualPlaceholder, setShowManualPlaceholder] = useState(false);
  const [recognized, setRecognized] = useState<RecognizedWineData | null>(null);

  const closeAccessibilityHint =
    stage === 'choose' ? t('capture.a11y.exit') : t('capture.a11y.backToChoose');

  const closeOrBack = useCallback(() => {
    if (stage === 'choose') {
      Haptics.selectionAsync().catch(() => undefined);
      router.back();
      return;
    }
    Haptics.selectionAsync().catch(() => undefined);
    setStage('choose');
    setBusy(null);
    setRecognized(null);
    setErrorMsg(null);
  }, [stage]);

  const showError = (key: string) => setErrorMsg(t(key));
  const clearError = () => setErrorMsg(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setBusy(null);
        setErrorMsg(null);
        setRecognized(null);
        setShowManualPlaceholder(false);
        setStage('choose');
      };
    }, []),
  );

  const runScanPipeline = useCallback(
    async (uri: string, source: SimulatingSource) => {
      clearError();
      setSimulatingSource(source);
      setStage('simulating');
      try {
        setBusy('uploading');
        const uid = await getCurrentUserId();
        if (!uid) throw new Error('no session');
        const path = `${uid}/${shortId()}.jpg`;
        const buffer = await uriToArrayBuffer(uri);
        const { error: upErr } = await supabase.storage
          .from('label-photos')
          .upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
        if (upErr) {
          console.warn('[capture] upload failed:', upErr);
          showError('capture.errors.uploadFailed');
          setStage('choose');
          return;
        }
        const { data: publicUrlData } = supabase.storage.from('label-photos').getPublicUrl(path);
        const publicUrl = publicUrlData.publicUrl;

        setBusy('scanning');
        let scan;
        try {
          scan = await scanLabel({ photo_url: publicUrl });
        } catch (err) {
          console.warn('[capture] label-scan failed:', err);
          showError('capture.errors.scanFailed');
          setStage('choose');
          return;
        }

        const { data: wine, error: wineErr } = await supabase
          .from('wines_localized')
          .select(
            'lwin, display_name, name_ko, producer_name, bottle_color, type_canonical, vintage, region, country, classification, drink_window_from_year, drink_window_to_year',
          )
          .eq('lwin', scan.lwin)
          .maybeSingle();
        if (wineErr) {
          console.warn('[capture] wine lookup failed:', wineErr);
          showError('capture.errors.wineNotFound');
          setStage('choose');
          return;
        }
        if (!wine?.lwin || !wine?.display_name) {
          showError('capture.errors.wineNotFound');
          setStage('choose');
          return;
        }
        const vintage = wine.vintage ?? parseLwinVintage(wine.lwin);
        const bottleColor =
          wine.bottle_color ?? getDefaultBottleColor(asTypeCanonical(wine.type_canonical));

        setRecognized({
          lwin: wine.lwin,
          display_name: wine.display_name,
          name_ko: wine.name_ko ?? null,
          producer_name: wine.producer_name ?? null,
          bottle_color: bottleColor,
          vintage,
          region: wine.region ?? null,
          country: wine.country ?? null,
          // wines_localized 미노출 — v0.2.0 deferred (사양 §12-2)
          appellation: null,
          grapes: null,
          drinkWindowFrom: wine.drink_window_from_year ?? null,
          drinkWindowTo: wine.drink_window_to_year ?? null,
          photoUrl: publicUrl,
        });
        setStage('recognized');
      } finally {
        setBusy(null);
      }
    },
    [],
  );

  const takePhoto = useCallback(async () => {
    if (busy || !cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    try {
      setBusy('capturing');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) {
        showError('capture.errors.noPhoto');
        setBusy(null);
        return;
      }
      await runScanPipeline(photo.uri, 'scan');
    } catch (err) {
      console.warn('[capture] takePicture failed:', err);
      showError('capture.errors.noPhoto');
      setBusy(null);
    }
  }, [busy, runScanPipeline]);

  const onScanOptionTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    setStage('live-camera');
  }, []);

  const onGalleryOptionTap = useCallback(async () => {
    if (busy) return;
    Haptics.selectionAsync().catch(() => undefined);
    try {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!lib.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) {
        showError('capture.errors.noPhoto');
        return;
      }
      await runScanPipeline(asset.uri, 'gallery');
    } catch (err) {
      console.warn('[capture] gallery pick failed:', err);
      showError('capture.errors.noPhoto');
    }
  }, [busy, runScanPipeline]);

  const onCellarOptionTap = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push('/(tabs)/cellar');
  }, []);

  const onNoteOptionTap = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push('/notes/new');
  }, []);

  const onConfirmNote = useCallback(() => {
    if (!recognized) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    const lwin = recognized.lwin;
    setRecognized(null);
    setStage('choose');
    router.push(
      `/notes/new/write?from=newEntry&wine_lwin=${encodeURIComponent(lwin)}`,
    );
  }, [recognized]);

  const onConfirmCellar = useCallback(async () => {
    if (!recognized) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    try {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('no session');
      const todayIso = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from('cellar_items').insert({
        user_id: uid,
        wine_lwin: recognized.lwin,
        acquired_at: todayIso,
        status: 'cellared',
        quantity: 1,
      });
      if (error) {
        console.warn('[capture] cellar insert failed:', error);
        showError('capture.errors.uploadFailed');
        return;
      }
      setRecognized(null);
      setStage('choose');
      router.push('/(tabs)/cellar');
    } catch (err) {
      console.warn('[capture] cellar add failed:', err);
      showError('capture.errors.uploadFailed');
    }
  }, [recognized]);

  const onEdit = useCallback(() => {
    if (!recognized) return;
    const lwin = recognized.lwin;
    setRecognized(null);
    setStage('choose');
    router.push(
      `/notes/new/write?from=newEntry&wine_lwin=${encodeURIComponent(lwin)}&edit=1`,
    );
  }, [recognized]);

  const onRetry = useCallback(() => {
    setRecognized(null);
    setStage('choose');
  }, []);

  const switchToManual = useCallback(() => {
    clearError();
    setShowManualPlaceholder(true);
  }, []);

  // ---- Permission gate (RN 전용 — keyscreen 미존재) ----
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-deepest dark:bg-bg-deepest">
        <ActivityIndicator color={isLight ? light.border.active : brand.gold} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        className="flex-1 bg-bg-deepest dark:bg-bg-deepest px-6"
      >
        <View className="flex-row justify-end">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            accessibilityHint={t('capture.a11y.exit')}
            hitSlop={12}
          >
            <X size={24} strokeWidth={2} color={isLight ? light.border.active : brand.gold} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="font-playfair text-empty-title text-text-primary dark:text-text-primary text-center">
            {t('capture.permission.title')}
          </Text>
          <Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary mt-3 text-center">
            {t('capture.permission.description')}
          </Text>
          <View className="mt-8 w-full max-w-xs gap-3">
            <PrimaryButton
              label={t('capture.permission.grant')}
              size="lg"
              onPress={() => {
                void requestPermission();
              }}
            />
            <PrimaryButton
              label={t('capture.permission.openSettings')}
              size="md"
              variant="secondary"
              onPress={() => {
                void Linking.openSettings();
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isScanFailureError = errorMsg === t('capture.errors.scanFailed');

  // ---- Stage: live-camera (RN 전용 — choose에서 scan OptionCard 탭 후) ----
  if (stage === 'live-camera') {
    const pillBg = isLight ? overlay.pillBg.light : overlay.pillBg.dark;
    const isProcessing = busy === 'uploading' || busy === 'scanning';
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
          accessibilityLabel={t('capture.title')}
        />

        {/* Header X (top overlay) — choose 복귀 */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-4"
          style={{ top: insets.top + 8 }}
        >
          <View />
          <Pressable
            onPress={closeOrBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            accessibilityHint={t('capture.a11y.backToChoose')}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: pillBg }}
          >
            <X size={22} strokeWidth={2} color={isLight ? light.text.primary : brand.cream} />
          </Pressable>
        </View>

        {errorMsg ? (
          <View className="absolute left-4 right-4" style={{ bottom: insets.bottom + 152 }}>
            <Toast message={errorMsg} tone="error" />
            {isScanFailureError ? (
              <View className="mt-2">
                <PrimaryButton
                  label={t('capture.errors.switchToManual')}
                  size="sm"
                  variant="secondary"
                  onPress={switchToManual}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Shutter + 옵션 row (RN 전용) */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-center gap-4 px-6"
          style={{ bottom: insets.bottom + 24 }}
        >
          <OptionPillButton
            icon={ImageIcon}
            label={t('capture.options.gallery')}
            onPress={onGalleryOptionTap}
            disabled={busy !== null}
            pillBg={pillBg}
          />
          <CaptureShutterButton
            onPress={takePhoto}
            disabled={busy !== null}
            label={t('capture.options.camera')}
          />
          <OptionPillButton
            icon={CameraIcon}
            label={t('capture.options.cancel')}
            onPress={closeOrBack}
            disabled={false}
            pillBg={pillBg}
            iconOverride={X}
          />
        </View>

        {isProcessing ? (
          <ProcessingOverlay source="scan" message={t('capture.simulating.scan')} />
        ) : null}

        {showManualPlaceholder ? (
          <ManualPlaceholderOverlay
            onClose={() => setShowManualPlaceholder(false)}
            scrimBg={isLight ? overlay.bgScrim.light : overlay.bgScrim.dark}
          />
        ) : null}
      </View>
    );
  }

  // ---- Stage: simulating (gallery 경로 — fullscreen SimulatingView) ----
  if (stage === 'simulating') {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
      >
        <CaptureHeader
          title={t('capture.title')}
          onClose={closeOrBack}
          closeAccessibilityLabel={t('common.close')}
          closeAccessibilityHint={closeAccessibilityHint}
        />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 24,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <SimulatingView
            source={simulatingSource}
            message={
              simulatingSource === 'scan'
                ? t('capture.simulating.scan')
                : t('capture.simulating.gallery')
            }
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Stage: recognized ----
  if (stage === 'recognized' && recognized) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
      >
        <CaptureHeader
          title={t('capture.title')}
          onClose={closeOrBack}
          closeAccessibilityLabel={t('common.close')}
          closeAccessibilityHint={closeAccessibilityHint}
        />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 24,
            paddingBottom: insets.bottom + 24,
            gap: 14,
          }}
        >
          <RecognizedView
            wine={recognized}
            onConfirmNote={onConfirmNote}
            onConfirmCellar={onConfirmCellar}
            onRetry={onRetry}
            onEdit={onEdit}
          />
        </ScrollView>
        {errorMsg ? (
          <View className="absolute left-4 right-4" style={{ bottom: insets.bottom + 24 }}>
            <Toast message={errorMsg} tone="error" />
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  // ---- Stage: choose (default) ----
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
    >
      <CaptureHeader
        title={t('capture.title')}
        onClose={closeOrBack}
        closeAccessibilityLabel={t('common.close')}
        closeAccessibilityHint={closeAccessibilityHint}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={{ gap: 12 }}>
          <ChooseOptionCard
            Icon={CameraIcon}
            iconColor="wineRed"
            title={t('capture.scan.title')}
            sub={t('capture.scan.sub')}
            onPress={onScanOptionTap}
            hapticStyle="medium"
            accessibilityHint={t('capture.options.camera')}
          />
          <ChooseOptionCard
            Icon={ImageIcon}
            iconColor="gold"
            title={t('capture.gallery.title')}
            sub={t('capture.gallery.sub')}
            onPress={onGalleryOptionTap}
            disabled={busy !== null}
            accessibilityHint={t('capture.options.gallery')}
          />
          <ChooseOptionCard
            Icon={Library}
            iconColor="primary"
            title={t('capture.cellar.title')}
            sub={t('capture.cellar.sub')}
            onPress={onCellarOptionTap}
          />
          <ChooseOptionCard
            Icon={BookOpen}
            iconColor="secondary"
            title={t('capture.note.title')}
            sub={t('capture.note.sub')}
            onPress={onNoteOptionTap}
          />
        </View>
      </ScrollView>

      {errorMsg ? (
        <View className="absolute left-4 right-4" style={{ bottom: insets.bottom + 24 }}>
          <Toast message={errorMsg} tone="error" />
          {isScanFailureError ? (
            <View className="mt-2">
              <PrimaryButton
                label={t('capture.errors.switchToManual')}
                size="sm"
                variant="secondary"
                onPress={switchToManual}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {showManualPlaceholder ? (
        <ManualPlaceholderOverlay
          onClose={() => setShowManualPlaceholder(false)}
          scrimBg={isLight ? overlay.bgScrim.light : overlay.bgScrim.dark}
        />
      ) : null}
    </SafeAreaView>
  );
}

// ---- Live-camera 옵션 pill 버튼 (RN 전용) ----
interface OptionPillButtonProps {
  icon: typeof CameraIcon;
  label: string;
  onPress: () => void;
  disabled: boolean;
  pillBg: string;
  iconOverride?: typeof CameraIcon;
}

function OptionPillButton({
  icon: Icon,
  label,
  onPress,
  disabled,
  pillBg,
  iconOverride,
}: OptionPillButtonProps) {
  const scheme = useColorScheme();
  const iconColor = scheme === 'light' ? light.text.primary : brand.cream;
  const Renderer = iconOverride ?? Icon;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-12 w-12 items-center justify-center rounded-full ${disabled ? 'opacity-40' : ''}`}
      style={{ backgroundColor: pillBg }}
      hitSlop={12}
    >
      <Renderer size={22} strokeWidth={1.8} color={iconColor} />
    </Pressable>
  );
}

// ---- Live-camera shutter (RN 전용) ----
function CaptureShutterButton({
  onPress,
  disabled,
  label,
}: {
  onPress: () => void;
  disabled: boolean;
  label: string;
}) {
  const scheme = useColorScheme();
  const ringColor = scheme === 'light' ? light.text.primary : brand.cream;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={label}
      className={`h-16 w-16 items-center justify-center rounded-full bg-wine-red ${
        disabled ? 'opacity-40' : ''
      }`}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ borderWidth: 2, borderColor: ringColor }}
      >
        <CameraIcon size={22} strokeWidth={2} color={ringColor} />
      </View>
    </Pressable>
  );
}

// ---- Manual placeholder modal — RN 전용 (사양 §3-11 보존) ----
function ManualPlaceholderOverlay({
  onClose,
  scrimBg,
}: {
  onClose: () => void;
  scrimBg: string;
}) {
  const { t } = useTranslation();
  return (
    <View
      className="absolute inset-0 items-center justify-center px-6"
      style={{ backgroundColor: scrimBg }}
      accessibilityViewIsModal
    >
      <View className="w-full max-w-md rounded-xl bg-bg-deep dark:bg-bg-deep px-5 py-6">
        <Text className="font-playfair text-empty-title text-text-primary dark:text-text-primary text-center">
          {t('capture.manualPlaceholder.title')}
        </Text>
        <Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary mt-3 text-center">
          {t('capture.manualPlaceholder.description')}
        </Text>
        <View className="mt-6">
          <PrimaryButton
            label={t('common.close')}
            size="md"
            variant="secondary"
            onPress={onClose}
          />
        </View>
      </View>
    </View>
  );
}
