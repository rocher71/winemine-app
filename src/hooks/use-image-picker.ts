/**
 * useImagePicker — expo-image-picker wrapper.
 *
 * 사양: _workspace/design-specs/community-new.md §10 G (신규 hook) + §10 Q (auto prompt).
 *
 * 사용처:
 *   - app/community/new/column.tsx — Cover image 단일 선택
 *   - app/community/new/album.tsx — Photo grid 다중 선택 (max 9 - current.length)
 *
 * 권한 흐름 (§10 Q):
 *   - launchImageLibraryAsync 호출 시 expo-image-picker 가 자동 prompt
 *   - 거부 시 null / [] 반환 (silently 실패). 호출 측에서 Alert 또는 Toast 표시 결정.
 *   - capture 화면 동일 패턴 (app/(tabs)/capture.tsx:241~263 참조).
 */
import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerHook {
  /**
   * 단일 사진 선택 (Cover image 용).
   * @returns 선택된 asset URI 또는 권한 거부/취소 시 null.
   */
  pickFromLibrary: () => Promise<string | null>;
  /**
   * 다중 사진 선택 (Album photo grid 용).
   * @param max — 최대 선택 개수 (현재 photos.length 차감 후 남은 자리).
   *              expo-image-picker selectionLimit. 0 이하 전달 시 빈 배열 반환.
   * @returns 선택된 asset URI 배열. 권한 거부/취소 시 빈 배열.
   */
  pickMultiple: (max: number) => Promise<string[]>;
}

export function useImagePicker(): ImagePickerHook {
  const pickFromLibrary = useCallback(async (): Promise<string | null> => {
    try {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!lib.granted) return null;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });
      if (result.canceled) return null;
      const asset = result.assets[0];
      return asset?.uri ?? null;
    } catch (err) {
      // 사양 §2-4 error variant — 호출 측에서 Toast/Alert 표시 결정 (silent fail).
      console.warn('[useImagePicker] pickFromLibrary failed:', err);
      return null;
    }
  }, []);

  const pickMultiple = useCallback(async (max: number): Promise<string[]> => {
    if (max <= 0) return [];
    try {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!lib.granted) return [];
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: max,
        quality: 0.8,
      });
      if (result.canceled) return [];
      return result.assets.map((a) => a.uri).filter((uri): uri is string => Boolean(uri));
    } catch (err) {
      console.warn('[useImagePicker] pickMultiple failed:', err);
      return [];
    }
  }, []);

  return { pickFromLibrary, pickMultiple };
}
