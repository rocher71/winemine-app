import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'winemine',
  slug: 'winemine-app',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'winemine',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.winemine.app',
    supportsTablet: false,
    infoPlist: {
      NSCameraUsageDescription: '와인 라벨을 촬영해 인식하기 위해 카메라가 필요합니다. (Camera access is required to scan wine labels.)',
      NSPhotoLibraryUsageDescription: '갤러리에서 와인 라벨 사진을 선택하기 위해 필요합니다. (Photo library access is required to pick wine label images.)',
      NSPhotoLibraryAddUsageDescription: '와인 라벨 사진을 저장하기 위해 필요합니다. (Photo library write access is required to save label images.)',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.winemine.app',
    adaptiveIcon: {
      backgroundColor: '#251837',
    },
    permissions: ['CAMERA', 'READ_MEDIA_IMAGES'],
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-camera',
    'expo-image-picker',
    'expo-web-browser',
    [
      'expo-camera',
      {
        cameraPermission: '와인 라벨을 촬영합니다. (Take wine label photos.)',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: '갤러리에서 와인 라벨을 선택합니다. (Pick wine label images.)',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    anonymizationSaltDev: process.env.EXPO_PUBLIC_ANONYMIZATION_SALT_DEV ?? '',
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  },
});
