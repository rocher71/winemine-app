import { useCallback, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Camera as CameraIcon, Image as ImageIcon, Type as TypeIcon, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { scanLabel } from '@/lib/label-scan';
import { getCurrentUserId } from '@/lib/auth';
import { shortId } from '@/lib/id';
import { brand } from '@/lib/design-tokens';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import { LabelScanResultModal } from '@/components/capture/label-scan-result-modal';

type RecognizedWine = {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  producer_name: string | null;
  bottle_color: string | null;
  type_canonical: string | null;
  vintage: number | null;
};

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const res = await fetch(uri);
  if (!res.ok) throw new Error(`fetch ${uri} → ${res.status}`);
  return res.arrayBuffer();
}

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [busy, setBusy] = useState<'capturing' | 'uploading' | 'scanning' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showManualPlaceholder, setShowManualPlaceholder] = useState(false);
  const [recognized, setRecognized] = useState<RecognizedWine | null>(null);

  const close = () => router.replace('/(tabs)');

  const showError = (key: string) => {
    setErrorMsg(t(key));
  };
  const clearError = () => setErrorMsg(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setBusy(null);
        setErrorMsg(null);
        setRecognized(null);
        setShowManualPlaceholder(false);
      };
    }, []),
  );

  const runScanPipeline = useCallback(async (uri: string) => {
    clearError();
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
        return;
      }

      const { data: wine, error: wineErr } = await supabase
        .from('wines_localized')
        .select(
          'lwin, display_name, name_ko, producer_name, bottle_color, type_canonical, vintage',
        )
        .eq('lwin', scan.lwin)
        .maybeSingle();
      if (wineErr) {
        console.warn('[capture] wine lookup failed:', wineErr);
        showError('capture.errors.wineNotFound');
        return;
      }
      if (!wine?.lwin || !wine?.display_name) {
        showError('capture.errors.wineNotFound');
        return;
      }
      setRecognized({
        lwin: wine.lwin,
        display_name: wine.display_name,
        name_ko: wine.name_ko ?? null,
        producer_name: wine.producer_name ?? null,
        bottle_color: wine.bottle_color ?? null,
        type_canonical: wine.type_canonical ?? null,
        vintage: wine.vintage ?? null,
      });
    } finally {
      setBusy(null);
    }
  }, []);

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
      await runScanPipeline(photo.uri);
    } catch (err) {
      console.warn('[capture] takePicture failed:', err);
      showError('capture.errors.noPhoto');
      setBusy(null);
    }
  }, [busy, runScanPipeline]);

  const pickFromGallery = useCallback(async () => {
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
      await runScanPipeline(asset.uri);
    } catch (err) {
      console.warn('[capture] gallery pick failed:', err);
      showError('capture.errors.noPhoto');
    }
  }, [busy, runScanPipeline]);

  const writeNote = () => {
    if (!recognized) return;
    const lwin = recognized.lwin;
    setRecognized(null);
    router.push(`/notes/new/write?wine_lwin=${encodeURIComponent(lwin)}`);
  };

  const switchToManual = () => {
    clearError();
    setShowManualPlaceholder(true);
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-deepest dark:bg-bg-deepest">
        <ActivityIndicator color={brand.gold} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        className="flex-1 bg-bg-deepest dark:bg-bg-deepest px-6"
        style={{ paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row justify-end">
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={12}
          >
            <X size={24} strokeWidth={2} color={brand.gold} />
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
      </View>
    );
  }

  const isScanFailureError = errorMsg === t('capture.errors.scanFailed');

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        accessibilityLabel={t('capture.title')}
      />

      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-4"
        style={{ top: insets.top + 8 }}
      >
        <View />
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <X size={22} strokeWidth={2} color={brand.cream} />
        </Pressable>
      </View>

      {errorMsg ? (
        <View
          className="absolute left-4 right-4"
          style={{ bottom: insets.bottom + 152 }}
        >
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

      <View
        className="absolute left-0 right-0 flex-row items-center justify-center gap-4 px-6"
        style={{ bottom: insets.bottom + 24 }}
      >
        <OptionButton
          icon={ImageIcon}
          label={t('capture.options.gallery')}
          onPress={pickFromGallery}
          disabled={busy !== null}
        />
        <CaptureButton
          onPress={takePhoto}
          disabled={busy !== null}
          label={t('capture.options.camera')}
        />
        <OptionButton
          icon={TypeIcon}
          label={t('capture.options.manual')}
          onPress={switchToManual}
          disabled={busy !== null}
        />
        <OptionButton
          icon={X}
          label={t('capture.options.cancel')}
          onPress={close}
          disabled={false}
        />
      </View>

      {busy === 'uploading' || busy === 'scanning' ? (
        <View className="absolute inset-0 items-center justify-center">
          <BlurView
            intensity={80}
            tint="dark"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <ActivityIndicator color={brand.gold} size="large" />
          <Text className="font-inter text-card-body text-cream mt-4">
            {t('capture.analyzing')}
          </Text>
        </View>
      ) : null}

      {showManualPlaceholder ? (
        <View
          className="absolute inset-0 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
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
                onPress={() => setShowManualPlaceholder(false)}
              />
            </View>
          </View>
        </View>
      ) : null}

      <LabelScanResultModal
        visible={recognized !== null}
        wine={recognized}
        onWriteNote={writeNote}
        onRetry={() => setRecognized(null)}
        onClose={() => setRecognized(null)}
      />
    </View>
  );
}

interface OptionButtonProps {
  icon: typeof CameraIcon;
  label: string;
  onPress: () => void;
  disabled: boolean;
}

function OptionButton({ icon: Icon, label, onPress, disabled }: OptionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-12 w-12 items-center justify-center rounded-full ${disabled ? 'opacity-40' : ''}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      hitSlop={12}
    >
      <Icon size={22} strokeWidth={1.8} color={brand.cream} />
    </Pressable>
  );
}

function CaptureButton({
  onPress,
  disabled,
  label,
}: {
  onPress: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-16 w-16 items-center justify-center rounded-full bg-wine-red ${
        disabled ? 'opacity-40' : ''
      }`}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ borderWidth: 2, borderColor: brand.cream }}
      >
        <CameraIcon size={22} strokeWidth={2} color={brand.cream} />
      </View>
    </Pressable>
  );
}
